import { useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { ChartSvgLegend, chartLegendHeight } from './ChartSvgLegend'
import { niceAxisMax, formatAxisValue, axisLabelPad, axisLabelStep, truncateAxisLabel } from '../../utils/chartAxis'
import { useChartScale } from '../../hooks/useChartScale'

export interface StackSeries {
  name: string
  data: number[]
  color?: string
}

interface StackedBarChartProps {
  series: StackSeries[]
  labels: string[]
  height?: number
  horizontal?: boolean
  yFormat?: (v: number) => string
  showLegend?: boolean
}

interface HoverState {
  groupIdx: number
  seriesIdx: number
}

export function StackedBarChart({
  series,
  labels,
  height = 220,
  horizontal = false,
  yFormat = formatAxisValue,
  showLegend = true,
}: StackedBarChartProps) {
  const { colors, isGbMode } = useTheme()
  const [hov, setHov] = useState<HoverState | null>(null)

  const H = height
  // viewBox casado à largura real medida: 1 unidade = 1px. Assim `height` é a
  // altura renderizada de fato (antes o SVG escalava pelo viewBox e o mesmo
  // valor rendia alturas diferentes conforme a largura do card) e cada fonte
  // sai no px do token — por isso `k` vale 1.
  const FALLBACK_W = 800
  const { ref, width } = useChartScale(FALLBACK_W)
  const W = width || FALLBACK_W
  const k = 1

  const allData = series.flatMap((s) => s.data)

  if (series.length === 0 || labels.length === 0 || allData.every((v) => v === 0)) {
    return (
      <div ref={ref} style={{ width: '100%' }}>
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block', fontFamily: t.font.family.sans }}
        >
          <text
            x={W / 2}
            y={H / 2}
            textAnchor="middle"
            fill={colors.fg.subtle as string}
            style={{ fontSize: t.font.size.sm * k }}
          >
            Sem dados
          </text>
        </svg>
      </div>
    )
  }

  // Stack totals per group
  const totals = labels.map((_, gi) =>
    series.reduce((sum, s) => sum + (s.data[gi] ?? 0), 0)
  )
  // Topo do eixo em degrau redondo — rótulos limpos em vez de frações longas
  const maxTotal = niceAxisMax(Math.max(...totals))

  const LEGEND_H = showLegend ? chartLegendHeight(k) : 0
  const PAD_TOP = 16
  const PAD_BOTTOM = horizontal ? 28 : 36
  const PAD_RIGHT = 16

  const TICKS = 4
  const tickVals = Array.from({ length: TICKS }, (_, i) => (maxTotal / (TICKS - 1)) * i)

  // Padding do eixo dimensionado pelo rótulo mais longo — no modo horizontal os
  // rótulos da esquerda são as categorias, que pedem mais espaço.
  const PAD_LEFT = horizontal
    ? axisLabelPad(labels, t.font.size.xs, 100)
    : axisLabelPad(tickVals.map(yFormat), t.font.size.xs)

  const chartH = H - PAD_TOP - PAD_BOTTOM - LEGEND_H
  const chartW = W - PAD_LEFT - PAD_RIGHT
  // Rótulos do eixo X afinados para não colidirem quando há muitos grupos (24h).
  const xStep = axisLabelStep(labels, chartW, t.font.size.xs)

  const getColor = (s: StackSeries, i: number) => s.color ?? t.chart.series[i % 8]

  const ttW = 140
  const ttH = 36

  // ── HORIZONTAL ──────────────────────────────────────────────────────────────
  if (horizontal) {
    const barGap = 8
    const barH = Math.max(6, (chartH - barGap * (labels.length - 1)) / labels.length)
    const xScale = (v: number) => PAD_LEFT + (v / maxTotal) * chartW
    const yOfBar = (gi: number) => PAD_TOP + gi * (barH + barGap)

    return (
      <div ref={ref} style={{ width: '100%' }}>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: 'block', fontFamily: t.font.family.sans }}
        onMouseLeave={() => setHov(null)}
      >
        {/* Vertical grid */}
        {tickVals.map((tv, i) => {
          const gx = xScale(tv)
          return (
            <line
              key={i}
              x1={gx}
              y1={PAD_TOP}
              x2={gx}
              y2={PAD_TOP + chartH}
              stroke={isGbMode ? t.chart.gridGb : t.chart.grid}
              strokeWidth={1}
            />
          )
        })}

        {/* X-axis labels */}
        {tickVals.map((tv, i) => (
          <text
            key={i}
            x={xScale(tv)}
            y={PAD_TOP + chartH + 16}
            textAnchor="middle"
            fill={colors.fg.subtle as string}
            fontFamily={t.font.family.sans}
            style={{ fontSize: t.font.size.xs * k }}
          >
            {yFormat(tv)}
          </text>
        ))}

        {/* Stacked bars */}
        {labels.map((label, gi) => {
          const by = yOfBar(gi)
          let xCursor = PAD_LEFT
          return (
            <g key={gi}>
              <text
                x={PAD_LEFT - 6}
                y={by + barH / 2 + 4}
                textAnchor="end"
                fill={colors.fg.subtle as string}
                fontFamily={t.font.family.sans}
                style={{ fontSize: t.font.size.xs * k }}
              >
                {truncateAxisLabel(label, PAD_LEFT - 10, t.font.size.xs)}
              </text>
              {series.map((s, si) => {
                const val = s.data[gi] ?? 0
                const bw = (val / maxTotal) * chartW
                const col = getColor(s, si)
                const bx = xCursor
                xCursor += bw
                const isH = hov?.groupIdx === gi && hov?.seriesIdx === si
                const dimmed = hov !== null && !isH
                const isLast = si === series.length - 1
                const isFirst = si === 0
                return (
                  <rect
                    key={si}
                    x={bx}
                    y={by}
                    width={Math.max(bw, 0)}
                    height={barH}
                    rx={isFirst || isLast ? t.radius.sm : 0}
                    fill={col}
                    opacity={dimmed ? 0.25 : isH ? 1 : 0.85}
                    style={{ cursor: 'pointer', transition: `opacity ${t.transition.base}` }}
                    onMouseEnter={() => setHov({ groupIdx: gi, seriesIdx: si })}
                  />
                )
              })}
            </g>
          )
        })}

        {/* Tooltip */}
        {hov && (() => {
          const { groupIdx: gi, seriesIdx: si } = hov
          const s = series[si]
          const col = getColor(s, si)
          const val = s.data[gi] ?? 0
          const by = yOfBar(gi)
          // Compute cumulative x up to this segment
          let xAcc = PAD_LEFT
          for (let k = 0; k < si; k++) {
            xAcc += ((series[k].data[gi] ?? 0) / maxTotal) * chartW
          }
          const segW = (val / maxTotal) * chartW
          const ttX = Math.min(xAcc + segW / 2 - ttW / 2, W - PAD_RIGHT - ttW)
          const ttY = Math.max(by - ttH - 8, PAD_TOP)
          return (
            <g>
              <rect
                x={ttX}
                y={ttY}
                width={ttW}
                height={ttH}
                rx={t.radius.sm}
                fill={isGbMode ? t.chart.surfaceGb : t.chart.surface}
                stroke={colors.border.default as string}
                strokeWidth={0.8}
                style={{ filter: `drop-shadow(${t.shadow.chartMark})` }}
              />
              <circle cx={ttX + 10} cy={ttY + 12} r={4} fill={col} />
              <text
                x={ttX + 18}
                y={ttY + 15}
                fill={colors.fg.muted as string}
                fontFamily={t.font.family.sans}
                style={{ fontSize: t.font.size.xs * k, fontWeight: t.font.weight.semibold }}
              >
                {s.name} — {labels[gi]}
              </text>
              <text
                x={ttX + 10}
                y={ttY + 28}
                fill={colors.fg.subtle as string}
                fontFamily={t.font.family.sans}
                style={{ fontSize: t.font.size.xs * k }}
              >
                {yFormat(val)}
              </text>
            </g>
          )
        })()}

        {/* Legend */}
        {showLegend && (
          <ChartSvgLegend
            items={series.map((s, i) => ({ name: s.name, color: getColor(s, i) }))}
            k={k}
            x={PAD_LEFT}
            y={H - LEGEND_H + 4}
            maxWidth={chartW}
          />
        )}
      </svg>
      </div>
    )
  }

  // ── VERTICAL ─────────────────────────────────────────────────────────────────
  const barGap = 10
  const barW = Math.max(8, (chartW - barGap * (labels.length - 1)) / labels.length)
  const xOfBar = (gi: number) => PAD_LEFT + gi * (barW + barGap)
  const xOfGroup = (gi: number) => xOfBar(gi) + barW / 2
  const yScale = (v: number) => PAD_TOP + chartH - (v / maxTotal) * chartH
  const segH = (v: number) => (v / maxTotal) * chartH

  return (
    <div ref={ref} style={{ width: '100%' }}>
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', fontFamily: t.font.family.sans }}
      onMouseLeave={() => setHov(null)}
    >
      {/* Horizontal grid */}
      {tickVals.map((tv, i) => {
        const gy = yScale(tv)
        return (
          <line
            key={i}
            x1={PAD_LEFT}
            y1={gy}
            x2={W - PAD_RIGHT}
            y2={gy}
            stroke={isGbMode ? t.chart.gridGb : t.chart.grid}
            strokeWidth={1}
          />
        )
      })}

      {/* Y-axis labels */}
      {tickVals.map((tv, i) => (
        <text
          key={i}
          x={PAD_LEFT - 6}
          y={yScale(tv) + 4}
          textAnchor="end"
          fill={colors.fg.subtle as string}
          fontFamily={t.font.family.sans}
          style={{ fontSize: t.font.size.xs * k }}
        >
          {yFormat(tv)}
        </text>
      ))}

      {/* Stacked bars */}
      {labels.map((label, gi) => {
        const bx = xOfBar(gi)
        let yCursor = PAD_TOP + chartH
        return (
          <g key={gi}>
            {series.map((s, si) => {
              const val = s.data[gi] ?? 0
              const sh = segH(val)
              const col = getColor(s, si)
              const by = yCursor - sh
              yCursor -= sh
              const isH = hov?.groupIdx === gi && hov?.seriesIdx === si
              const dimmed = hov !== null && !isH
              const isTop = si === series.length - 1
              const isBottom = si === 0
              return (
                <rect
                  key={si}
                  x={bx}
                  y={by}
                  width={barW}
                  height={Math.max(sh, 1)}
                  rx={isTop ? t.radius.sm : isBottom ? t.radius.sm : 0}
                  fill={col}
                  opacity={dimmed ? 0.25 : isH ? 1 : 0.85}
                  style={{ cursor: 'pointer', transition: `opacity ${t.transition.base}` }}
                  onMouseEnter={() => setHov({ groupIdx: gi, seriesIdx: si })}
                />
              )
            })}

            {/* X label */}
            {gi % xStep === 0 && (
              <text
                x={xOfGroup(gi)}
                y={PAD_TOP + chartH + 18}
                textAnchor="middle"
                fill={colors.fg.subtle as string}
                fontFamily={t.font.family.sans}
                style={{ fontSize: t.font.size.xs * k }}
              >
                {label}
              </text>
            )}
          </g>
        )
      })}

      {/* Tooltip */}
      {hov && (() => {
        const { groupIdx: gi, seriesIdx: si } = hov
        const s = series[si]
        const col = getColor(s, si)
        const val = s.data[gi] ?? 0
        // Cumulative y
        let yCum = 0
        for (let k = 0; k < si; k++) yCum += series[k].data[gi] ?? 0
        const segMid = yScale(yCum + val / 2)
        const cx = xOfGroup(gi)
        const ttX = Math.min(Math.max(cx - ttW / 2, PAD_LEFT), W - PAD_RIGHT - ttW)
        const ttY = Math.max(segMid - ttH - 6, PAD_TOP)
        return (
          <g>
            <rect
              x={ttX}
              y={ttY}
              width={ttW}
              height={ttH}
              rx={t.radius.sm}
              fill={isGbMode ? t.chart.surfaceGb : t.chart.surface}
              stroke={colors.border.default as string}
              strokeWidth={0.8}
              style={{ filter: `drop-shadow(${t.shadow.chartMark})` }}
            />
            <circle cx={ttX + 10} cy={ttY + 12} r={4} fill={col} />
            <text
              x={ttX + 18}
              y={ttY + 15}
              fill={colors.fg.muted as string}
              fontFamily={t.font.family.sans}
              style={{ fontSize: t.font.size.xs * k, fontWeight: t.font.weight.semibold }}
            >
              {s.name} — {labels[gi]}
            </text>
            <text
              x={ttX + 10}
              y={ttY + 28}
              fill={colors.fg.subtle as string}
              fontFamily={t.font.family.sans}
              style={{ fontSize: t.font.size.xs * k }}
            >
              {yFormat(val)}
            </text>
          </g>
        )
      })()}

      {/* Legend */}
      {showLegend && (
        <ChartSvgLegend
          items={series.map((s, i) => ({ name: s.name, color: getColor(s, i) }))}
          k={k}
          x={PAD_LEFT}
          y={H - LEGEND_H + 4}
          maxWidth={chartW}
        />
      )}
    </svg>
    </div>
  )
}
