import { useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { useChartScale } from '../../hooks/useChartScale'

export interface GroupedSeries {
  name: string
  data: number[]
  color?: string
}

interface GroupedBarChartProps {
  series: GroupedSeries[]
  labels: string[]
  height?: number
  yFormat?: (v: number) => string
  showLegend?: boolean
}

interface HoverState {
  groupIdx: number
  seriesIdx: number
}

export function GroupedBarChart({
  series,
  labels,
  height = 220,
  yFormat = (v) => String(v),
  showLegend = true,
}: GroupedBarChartProps) {
  const { colors, isGbMode } = useTheme()
  const [hov, setHov] = useState<HoverState | null>(null)

  const W = 800
  const H = height
  const { ref, k } = useChartScale(W)

  const allData = series.flatMap((s) => s.data)

  // Guard: vazio
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
            fontSize={t.font.size.sm * k}
            fill={colors.fg.subtle as string}
          >
            Sem dados
          </text>
        </svg>
      </div>
    )
  }

  const maxVal = Math.max(...allData)

  const LEGEND_H = showLegend ? 28 : 0
  const PAD_TOP = 16
  const PAD_BOTTOM = 36
  const PAD_LEFT = 52
  const PAD_RIGHT = 16

  const chartH = H - PAD_TOP - PAD_BOTTOM - LEGEND_H
  const chartW = W - PAD_LEFT - PAD_RIGHT

  const TICKS = 4
  const tickVals = Array.from({ length: TICKS }, (_, i) => (maxVal / (TICKS - 1)) * i)

  const numGroups = labels.length
  const numSeries = series.length
  const groupW = chartW / numGroups
  const innerPad = groupW * 0.15
  const barAreaW = groupW - innerPad * 2
  const barGap = 3
  const barW = Math.max(4, (barAreaW - barGap * (numSeries - 1)) / numSeries)

  const xOfBar = (groupIdx: number, seriesIdx: number) =>
    PAD_LEFT + groupIdx * groupW + innerPad + seriesIdx * (barW + barGap)

  const xOfGroup = (groupIdx: number) => PAD_LEFT + groupIdx * groupW + groupW / 2

  const yScale = (v: number) => PAD_TOP + chartH - (v / maxVal) * chartH
  const barHeight = (v: number) => (v / maxVal) * chartH

  const getColor = (s: GroupedSeries, i: number) => s.color ?? t.chart.series[i % 8]

  // Tooltip
  const ttW = 130
  const ttH = 36

  return (
    <div ref={ref} style={{ width: '100%' }}>
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', fontFamily: t.font.family.sans }}
      onMouseLeave={() => setHov(null)}
    >
      {/* Grid lines */}
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
          fontSize={t.font.size.xs * k}
          fill={colors.fg.subtle as string}
          fontFamily={t.font.family.sans}
        >
          {yFormat(tv)}
        </text>
      ))}

      {/* Bars */}
      {labels.map((label, gi) => (
        <g key={gi}>
          {/* Group label */}
          <text
            x={xOfGroup(gi)}
            y={PAD_TOP + chartH + 18}
            textAnchor="middle"
            fontSize={t.font.size.xs * k}
            fill={colors.fg.subtle as string}
            fontFamily={t.font.family.sans}
          >
            {label}
          </text>

          {series.map((s, si) => {
            const col = getColor(s, si)
            const val = s.data[gi] ?? 0
            const bx = xOfBar(gi, si)
            const by = yScale(val)
            const bh = barHeight(val)
            const isH = hov?.groupIdx === gi && hov?.seriesIdx === si
            const dimmed = hov !== null && !isH
            return (
              <rect
                key={si}
                x={bx}
                y={by}
                width={barW}
                height={Math.max(bh, 1)}
                rx={t.radius.sm}
                fill={col}
                opacity={dimmed ? 0.25 : isH ? 1 : 0.85}
                style={{ cursor: 'pointer', transition: `opacity ${t.transition.base}` }}
                onMouseEnter={() => setHov({ groupIdx: gi, seriesIdx: si })}
              />
            )
          })}
        </g>
      ))}

      {/* Tooltip */}
      {hov && (() => {
        const { groupIdx: gi, seriesIdx: si } = hov
        const s = series[si]
        const col = getColor(s, si)
        const val = s.data[gi] ?? 0
        const bx = xOfBar(gi, si)
        const by = yScale(val)
        const ttX = Math.min(Math.max(bx + barW / 2 - ttW / 2, PAD_LEFT), W - PAD_RIGHT - ttW)
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
              fontSize={t.font.size.xs * k}
              fontWeight={t.font.weight.semibold}
              fill={colors.fg.muted as string}
              fontFamily={t.font.family.sans}
            >
              {s.name} — {labels[gi]}
            </text>
            <text
              x={ttX + 10}
              y={ttY + 28}
              fontSize={t.font.size.xs * k}
              fill={colors.fg.subtle as string}
              fontFamily={t.font.family.sans}
            >
              {yFormat(val)}
            </text>
          </g>
        )
      })()}

      {/* Legend */}
      {showLegend && (
        <g transform={`translate(${PAD_LEFT}, ${H - LEGEND_H + 4})`}>
          {series.map((s, i) => {
            const col = getColor(s, i)
            return (
              <g key={i} transform={`translate(${i * 120}, 0)`}>
                <circle cx={6} cy={8} r={5} fill={col} />
                <text
                  x={14}
                  y={12}
                  fontSize={t.font.size.xs * k}
                  fill={colors.fg.muted as string}
                  fontFamily={t.font.family.sans}
                >
                  {s.name}
                </text>
              </g>
            )
          })}
        </g>
      )}
    </svg>
    </div>
  )
}
