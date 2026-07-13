import { useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

export interface DonutSlice {
  label: string
  value: number
  color?: string
}

interface DonutChartProps {
  data: DonutSlice[]
  height?: number
  centerLabel?: string
  centerValue?: string
  showLegend?: boolean
  valueFormat?: (v: number) => string
}

interface HoverState {
  idx: number
  tooltipX: number
  tooltipY: number
}

export function DonutChart({
  data,
  height = 220,
  centerLabel,
  centerValue,
  showLegend = true,
  valueFormat = (v) => String(v),
}: DonutChartProps) {
  const { colors, isGbMode } = useTheme()
  const [hov, setHov] = useState<HoverState | null>(null)

  const W = 800
  const H = height

  const total = data.reduce((sum, d) => sum + d.value, 0)

  // Guard: vazio
  if (data.length === 0 || total === 0) {
    return (
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: 'block', fontFamily: t.font.family.sans }}
      >
        <text
          x={W / 2}
          y={H / 2}
          textAnchor="middle"
          fontSize={t.font.size.sm}
          fill={colors.fg.subtle as string}
        >
          Sem dados
        </text>
      </svg>
    )
  }

  const LEGEND_H = showLegend ? Math.ceil(data.length / 2) * 22 : 0
  const donutAreaH = H - LEGEND_H

  // Donut geometry
  const cx = W / 2
  const cy = donutAreaH / 2
  const R = Math.min(cx, cy) * 0.82
  const innerR = R * 0.58

  const getColor = (d: DonutSlice, i: number) => d.color ?? t.chart.series[i % 8]

  // Arc path helper
  const polarToXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  })

  const sliceArc = (startAngle: number, endAngle: number, outer: number, inner: number, expanded: boolean) => {
    const offset = expanded ? 6 : 0
    const midAngle = (startAngle + endAngle) / 2
    const dx = offset * Math.cos(midAngle)
    const dy = offset * Math.sin(midAngle)

    const s1 = polarToXY(startAngle, outer)
    const e1 = polarToXY(endAngle, outer)
    const s2 = polarToXY(endAngle, inner)
    const e2 = polarToXY(startAngle, inner)
    const large = endAngle - startAngle > Math.PI ? 1 : 0

    return {
      d: [
        `M ${s1.x + dx},${s1.y + dy}`,
        `A ${outer},${outer} 0 ${large},1 ${e1.x + dx},${e1.y + dy}`,
        `L ${s2.x + dx},${s2.y + dy}`,
        `A ${inner},${inner} 0 ${large},0 ${e2.x + dx},${e2.y + dy}`,
        'Z',
      ].join(' '),
      midX: cx + (outer + inner) / 2 * Math.cos(midAngle) + dx,
      midY: cy + (outer + inner) / 2 * Math.sin(midAngle) + dy,
    }
  }

  // Build slices
  const TWO_PI = 2 * Math.PI
  const START_ANGLE = -Math.PI / 2 // 12 o'clock

  interface SliceData {
    startAngle: number
    endAngle: number
    col: string
    d: DonutSlice
    i: number
  }

  const slices: SliceData[] = []
  let cursor = START_ANGLE
  data.forEach((d, i) => {
    const angle = (d.value / total) * TWO_PI
    slices.push({ startAngle: cursor, endAngle: cursor + angle, col: getColor(d, i), d, i })
    cursor += angle
  })

  const ttW = 130
  const ttH = 48

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', fontFamily: t.font.family.sans }}
      onMouseLeave={() => setHov(null)}
    >
      {/* Slices */}
      {slices.map(({ startAngle, endAngle, col, d, i }) => {
        const isH = hov?.idx === i
        const dimmed = hov !== null && !isH
        const { d: pathD, midX, midY } = sliceArc(startAngle, endAngle, R, innerR, isH)
        return (
          <path
            key={i}
            d={pathD}
            fill={col}
            opacity={dimmed ? 0.3 : isH ? 1 : 0.85}
            style={{ cursor: 'pointer', transition: `opacity ${t.transition.base}` }}
            onMouseEnter={() =>
              setHov({ idx: i, tooltipX: midX, tooltipY: midY })
            }
          />
        )
      })}

      {/* Center label */}
      {(centerValue || centerLabel) && (
        <g>
          {centerValue && (
            <text
              x={cx}
              y={cy + (centerLabel ? -2 : 6)}
              textAnchor="middle"
              fontSize={t.font.size['2xl']}
              fontWeight={t.font.weight.bold}
              fill={colors.fg.default as string}
              fontFamily={t.font.family.sans}
            >
              {centerValue}
            </text>
          )}
          {centerLabel && (
            <text
              x={cx}
              y={cy + (centerValue ? 20 : 6)}
              textAnchor="middle"
              fontSize={t.font.size.xs}
              fill={colors.fg.subtle as string}
              fontFamily={t.font.family.sans}
            >
              {centerLabel}
            </text>
          )}
        </g>
      )}

      {/* Tooltip */}
      {hov && (() => {
        const { idx, tooltipX, tooltipY } = hov
        const sl = slices[idx]
        const pct = Math.round((sl.d.value / total) * 100)
        const ttX = Math.min(Math.max(tooltipX - ttW / 2, 4), W - ttW - 4)
        const ttY = Math.max(tooltipY - ttH - 8, 4)
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
            <circle cx={ttX + 10} cy={ttY + 13} r={4} fill={sl.col} />
            <text
              x={ttX + 18}
              y={ttY + 16}
              fontSize={t.font.size.xs}
              fontWeight={t.font.weight.semibold}
              fill={colors.fg.muted as string}
              fontFamily={t.font.family.sans}
            >
              {sl.d.label}
            </text>
            <text
              x={ttX + 10}
              y={ttY + 30}
              fontSize={t.font.size.xs}
              fill={colors.fg.subtle as string}
              fontFamily={t.font.family.sans}
            >
              {valueFormat(sl.d.value)} ({pct}%)
            </text>
          </g>
        )
      })()}

      {/* Legend */}
      {showLegend && (() => {
        const legendTop = donutAreaH + 8
        const colW = W / 2
        return (
          <g>
            {data.map((d, i) => {
              const col = getColor(d, i)
              const row = Math.floor(i / 2)
              const col_ = i % 2
              const lx = col_ * colW + 8
              const ly = legendTop + row * 22
              return (
                <g key={i}>
                  <circle cx={lx + 6} cy={ly + 8} r={5} fill={col} />
                  <text
                    x={lx + 16}
                    y={ly + 12}
                    fontSize={t.font.size.xs}
                    fill={colors.fg.muted as string}
                    fontFamily={t.font.family.sans}
                  >
                    {d.label}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })()}
    </svg>
  )
}
