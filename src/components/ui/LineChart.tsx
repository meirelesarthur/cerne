import { useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { useChartScale } from '../../hooks/useChartScale'

export interface LineSeries {
  name: string
  data: number[]
  color?: string
}

interface LineChartProps {
  series: LineSeries[]
  labels: string[]
  height?: number
  yFormat?: (v: number) => string
  showGrid?: boolean
  showLegend?: boolean
  area?: boolean
}

interface TooltipState {
  x: number
  y: number
  labelIdx: number
}

export function LineChart({
  series,
  labels,
  height = 220,
  yFormat = (v) => String(v),
  showGrid = true,
  showLegend,
  area = false,
}: LineChartProps) {
  const { colors, isGbMode } = useTheme()
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const showLegendFinal = showLegend ?? series.length > 1
  const W = 800
  const { ref, k } = useChartScale(W)

  // Guard: vazio ou todos zero
  const allData = series.flatMap((s) => s.data)
  if (series.length === 0 || allData.every((v) => v === 0) || labels.length === 0) {
    return (
      <div ref={ref} style={{ width: '100%' }}>
        <svg
          width="100%"
          viewBox={`0 0 800 ${height}`}
          style={{ display: 'block', fontFamily: t.font.family.sans }}
        >
          <text
            x={400}
            y={height / 2}
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

  const LEGEND_H = showLegendFinal ? 28 : 0
  const PAD_TOP = 16
  const PAD_BOTTOM = 32
  const PAD_LEFT = 56
  const PAD_RIGHT = 16
  const chartH = height - PAD_TOP - PAD_BOTTOM - LEGEND_H
  const chartW = W - PAD_LEFT - PAD_RIGHT

  const allValues = allData
  const dataMin = Math.min(...allValues)
  const dataMax = Math.max(...allValues)
  const range = dataMax - dataMin || 1

  const xOf = (i: number) => PAD_LEFT + (i / Math.max(labels.length - 1, 1)) * chartW
  const yOf = (v: number) => PAD_TOP + chartH - ((v - dataMin) / range) * chartH

  // Y ticks (4 levels)
  const TICKS = 4
  const yTicks = Array.from({ length: TICKS }, (_, i) => dataMin + (range / (TICKS - 1)) * i)

  // Tooltip width estimation
  const ttW = 120
  const ttLineH = 18
  const ttPad = 8

  const getSeriesColor = (s: LineSeries, i: number) => s.color ?? t.chart.series[i % 8]

  const buildLine = (data: number[]) =>
    data
      .map((v, i) => {
        const x = xOf(i)
        const y = yOf(v)
        if (i === 0) return `M ${x},${y}`
        const px = xOf(i - 1)
        const py = yOf(data[i - 1])
        const cx = (px + x) / 2
        return `C ${cx},${py} ${cx},${y} ${x},${y}`
      })
      .join(' ')

  const buildArea = (data: number[], linePath: string) => {
    const lastX = xOf(data.length - 1)
    const baseY = PAD_TOP + chartH
    return `${linePath} L ${lastX},${baseY} L ${xOf(0)},${baseY} Z`
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgEl = e.currentTarget
    const rect = svgEl.getBoundingClientRect()
    // Map client coords to viewBox coords
    const scaleX = W / rect.width
    const mx = (e.clientX - rect.left) * scaleX
    // Find nearest label
    let bestIdx = 0
    let bestDist = Infinity
    labels.forEach((_, i) => {
      const d = Math.abs(mx - xOf(i))
      if (d < bestDist) {
        bestDist = d
        bestIdx = i
      }
    })
    setTooltip({ x: xOf(bestIdx), y: PAD_TOP, labelIdx: bestIdx })
  }

  const ttH = ttPad * 2 + ttLineH * (series.length + 1) + 4

  return (
    <div ref={ref} style={{ width: '100%' }}>
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${height}`}
      style={{ display: 'block', fontFamily: t.font.family.sans }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTooltip(null)}
    >
      <defs>
        {area &&
          series.map((s, i) => {
            const col = getSeriesColor(s, i)
            const gradId = `lc_area_${col.replace(/[^a-zA-Z0-9]/g, '')}_${i}`
            return (
              <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={col} stopOpacity={0.22} />
                <stop offset="100%" stopColor={col} stopOpacity={0.01} />
              </linearGradient>
            )
          })}
      </defs>

      {/* Grid lines */}
      {showGrid &&
        yTicks.map((tick, i) => {
          const ty = yOf(tick)
          return (
            <line
              key={i}
              x1={PAD_LEFT}
              y1={ty}
              x2={W - PAD_RIGHT}
              y2={ty}
              stroke={isGbMode ? t.chart.gridGb : t.chart.grid}
              strokeWidth={1}
            />
          )
        })}

      {/* Y-axis labels */}
      {yTicks.map((tick, i) => (
        <text
          key={i}
          x={PAD_LEFT - 6}
          y={yOf(tick) + 4}
          textAnchor="end"
          fontSize={t.font.size.xs * k}
          fill={colors.fg.subtle as string}
          fontFamily={t.font.family.sans}
        >
          {yFormat(tick)}
        </text>
      ))}

      {/* X-axis labels */}
      {labels.map((label, i) => (
        <text
          key={i}
          x={xOf(i)}
          y={PAD_TOP + chartH + 20}
          textAnchor="middle"
          fontSize={t.font.size.xs * k}
          fill={colors.fg.subtle as string}
          fontFamily={t.font.family.sans}
        >
          {label}
        </text>
      ))}

      {/* Series: area + line */}
      {series.map((s, si) => {
        const col = getSeriesColor(s, si)
        const linePath = buildLine(s.data)
        const gradId = `lc_area_${col.replace(/[^a-zA-Z0-9]/g, '')}_${si}`
        return (
          <g key={si}>
            {area && (
              <path
                d={buildArea(s.data, linePath)}
                fill={`url(#${gradId})`}
              />
            )}
            <path
              d={linePath}
              fill="none"
              stroke={col}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Data dots */}
            {s.data.map((v, i) => (
              <circle
                key={i}
                cx={xOf(i)}
                cy={yOf(v)}
                r={tooltip?.labelIdx === i ? 5 : 3}
                fill={col}
                opacity={tooltip ? (tooltip.labelIdx === i ? 1 : 0.35) : 0.8}
                style={{ transition: `r ${t.transition.base}, opacity ${t.transition.base}` }}
              />
            ))}
          </g>
        )
      })}

      {/* Tooltip vertical guide line */}
      {tooltip && (
        <line
          x1={tooltip.x}
          y1={PAD_TOP}
          x2={tooltip.x}
          y2={PAD_TOP + chartH}
          stroke={isGbMode ? t.chart.gridGb : t.chart.grid}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
      )}

      {/* Tooltip box */}
      {tooltip && (() => {
        const idx = tooltip.labelIdx
        const ttXPos = Math.min(Math.max(tooltip.x - ttW / 2, PAD_LEFT), W - PAD_RIGHT - ttW)
        const ttYPos = PAD_TOP + 4
        return (
          <g>
            <rect
              x={ttXPos}
              y={ttYPos}
              width={ttW}
              height={ttH}
              rx={t.radius.sm}
              fill={isGbMode ? t.chart.surfaceGb : t.chart.surface}
              stroke={colors.border.default as string}
              strokeWidth={0.8}
              style={{ filter: `drop-shadow(${t.shadow.chartMark})` }}
            />
            <text
              x={ttXPos + ttPad}
              y={ttYPos + ttPad + ttLineH - 4}
              fontSize={t.font.size.xs * k}
              fontWeight={t.font.weight.semibold}
              fill={colors.fg.muted as string}
              fontFamily={t.font.family.sans}
            >
              {labels[idx]}
            </text>
            {series.map((s, si) => {
              const col = getSeriesColor(s, si)
              const val = s.data[idx] ?? 0
              return (
                <g key={si}>
                  <circle
                    cx={ttXPos + ttPad + 5}
                    cy={ttYPos + ttPad + ttLineH + si * ttLineH + 8}
                    r={4}
                    fill={col}
                  />
                  <text
                    x={ttXPos + ttPad + 14}
                    y={ttYPos + ttPad + ttLineH + si * ttLineH + 12}
                    fontSize={t.font.size.xs * k}
                    fill={colors.fg.muted as string}
                    fontFamily={t.font.family.sans}
                  >
                    {s.name}: {yFormat(val)}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })()}

      {/* Legend */}
      {showLegendFinal && (
        <g transform={`translate(${PAD_LEFT}, ${height - LEGEND_H + 4})`}>
          {series.map((s, i) => {
            const col = getSeriesColor(s, i)
            const offsetX = i * 110
            return (
              <g key={i} transform={`translate(${offsetX}, 0)`}>
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
