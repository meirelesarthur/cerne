import { useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { niceAxisMax, formatAxisValue, axisLabelPad, truncateAxisLabel } from '../../utils/chartAxis'
import { useChartScale } from '../../hooks/useChartScale'

interface BarDatum {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: BarDatum[]
  height?: number
  horizontal?: boolean
  yFormat?: (v: number) => string
  color?: string
}

interface HoverState {
  idx: number
  svgX: number
  svgY: number
}

export function BarChart({
  data,
  height = 220,
  horizontal = false,
  yFormat = formatAxisValue,
  color = t.chart.series[0],
}: BarChartProps) {
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

  // Guard: vazio ou todos zero
  if (data.length === 0 || data.every((d) => d.value === 0)) {
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

  // Topo do eixo em degrau redondo — rótulos limpos em vez de frações longas
  const maxVal = niceAxisMax(Math.max(...data.map((d) => d.value)))

  // Layout constants
  const PAD_RIGHT = 16
  const PAD_TOP = 16
  const PAD_BOTTOM = horizontal ? 28 : 36

  const TICKS = 4
  const tickVals = Array.from({ length: TICKS }, (_, i) => (maxVal / (TICKS - 1)) * i)

  // Padding do eixo dimensionado pelo rótulo mais longo — no modo horizontal os
  // rótulos da esquerda são as categorias, que pedem mais espaço.
  const PAD_LEFT = horizontal
    ? axisLabelPad(data.map((d) => d.label), t.font.size.xs, 100)
    : axisLabelPad(tickVals.map(yFormat), t.font.size.xs)

  const chartW = W - PAD_LEFT - PAD_RIGHT
  const chartH = H - PAD_TOP - PAD_BOTTOM

  // Tooltip
  const ttW = 110
  const ttH = 36

  if (horizontal) {
    // Horizontal bars
    const barGap = 6
    const totalBars = data.length
    const barH = Math.max(6, (chartH - barGap * (totalBars - 1)) / totalBars)

    const xScale = (v: number) => PAD_LEFT + (v / maxVal) * chartW
    const yOfBar = (i: number) => PAD_TOP + i * (barH + barGap)

    return (
      <div ref={ref} style={{ width: '100%' }}>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: 'block', fontFamily: t.font.family.sans }}
        onMouseLeave={() => setHov(null)}
      >
        {/* Grid lines (vertical) */}
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

        {/* X-axis tick labels */}
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

        {/* Bars */}
        {data.map((d, i) => {
          const barColor = d.color ?? color
          const by = yOfBar(i)
          const bw = xScale(d.value) - PAD_LEFT
          const isH = hov?.idx === i
          const dimmed = hov !== null && !isH
          return (
            <g
              key={i}
              onMouseEnter={() => setHov({ idx: i, svgX: PAD_LEFT + bw, svgY: by })}
              style={{ cursor: 'pointer' }}
            >
              {/* Y-axis label */}
              <text
                x={PAD_LEFT - 6}
                y={by + barH / 2 + 4}
                textAnchor="end"
                fill={colors.fg.subtle as string}
                fontFamily={t.font.family.sans}
                style={{ fontSize: t.font.size.xs * k }}
              >
                {truncateAxisLabel(d.label, PAD_LEFT - 10, t.font.size.xs)}
              </text>
              <rect
                x={PAD_LEFT}
                y={by}
                width={Math.max(bw, 0)}
                height={barH}
                rx={t.radius.sm}
                fill={barColor}
                opacity={dimmed ? 0.3 : isH ? 1 : 0.85}
                style={{ transition: `opacity ${t.transition.base}` }}
              />
            </g>
          )
        })}

        {/* Tooltip */}
        {hov && (() => {
          const d = data[hov.idx]
          const barColor = d.color ?? color
          const by = yOfBar(hov.idx)
          const bw = xScale(d.value) - PAD_LEFT
          const ttX = Math.min(PAD_LEFT + bw + 6, W - ttW - 4)
          const ttY = Math.max(by - ttH / 2 + (Math.max(6, (chartH - 6 * (data.length - 1)) / data.length)) / 2, PAD_TOP)
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
              <circle cx={ttX + 10} cy={ttY + 12} r={4} fill={barColor} />
              <text
                x={ttX + 18}
                y={ttY + 15}
                fill={colors.fg.muted as string}
                fontFamily={t.font.family.sans}
                style={{ fontSize: t.font.size.xs * k, fontWeight: t.font.weight.semibold }}
              >
                {d.label}
              </text>
              <text
                x={ttX + 10}
                y={ttY + 28}
                fill={colors.fg.subtle as string}
                fontFamily={t.font.family.sans}
                style={{ fontSize: t.font.size.xs * k }}
              >
                {yFormat(d.value)}
              </text>
            </g>
          )
        })()}
      </svg>
      </div>
    )
  }

  // Vertical bars
  const barGap = 10
  const totalBars = data.length
  const barW = Math.max(8, (chartW - barGap * (totalBars - 1)) / totalBars)

  const xOfBar = (i: number) => PAD_LEFT + i * (barW + barGap)
  const yScale = (v: number) => PAD_TOP + chartH - (v / maxVal) * chartH
  const barHeight = (v: number) => (v / maxVal) * chartH

  return (
    <div ref={ref} style={{ width: '100%' }}>
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', fontFamily: t.font.family.sans }}
      onMouseLeave={() => setHov(null)}
    >
      {/* Grid lines (horizontal) */}
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

      {/* Bars */}
      {data.map((d, i) => {
        const barColor = d.color ?? color
        const bx = xOfBar(i)
        const by = yScale(d.value)
        const bh = barHeight(d.value)
        const cx = bx + barW / 2
        const isH = hov?.idx === i
        const dimmed = hov !== null && !isH
        return (
          <g
            key={i}
            onMouseEnter={() => setHov({ idx: i, svgX: cx, svgY: by })}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={bx}
              y={by}
              width={barW}
              height={Math.max(bh, 1)}
              rx={t.radius.sm}
              fill={barColor}
              opacity={dimmed ? 0.3 : isH ? 1 : 0.85}
              style={{ transition: `opacity ${t.transition.base}` }}
            />
            {/* X-axis label */}
            <text
              x={cx}
              y={PAD_TOP + chartH + 18}
              textAnchor="middle"
              fill={colors.fg.subtle as string}
              fontFamily={t.font.family.sans}
              style={{ fontSize: t.font.size.xs * k }}
            >
              {truncateAxisLabel(d.label, barW + barGap - 6, t.font.size.xs)}
            </text>
          </g>
        )
      })}

      {/* Tooltip */}
      {hov && (() => {
        const d = data[hov.idx]
        const barColor = d.color ?? color
        const cx = xOfBar(hov.idx) + barW / 2
        const by = yScale(d.value)
        const ttX = Math.min(Math.max(cx - ttW / 2, PAD_LEFT), W - PAD_RIGHT - ttW)
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
            <circle cx={ttX + 10} cy={ttY + 12} r={4} fill={barColor} />
            <text
              x={ttX + 18}
              y={ttY + 15}
              fill={colors.fg.muted as string}
              fontFamily={t.font.family.sans}
              style={{ fontSize: t.font.size.xs * k, fontWeight: t.font.weight.semibold }}
            >
              {d.label}
            </text>
            <text
              x={ttX + 10}
              y={ttY + 28}
              fill={colors.fg.subtle as string}
              fontFamily={t.font.family.sans}
              style={{ fontSize: t.font.size.xs * k }}
            >
              {yFormat(d.value)}
            </text>
          </g>
        )
      })()}
    </svg>
    </div>
  )
}
