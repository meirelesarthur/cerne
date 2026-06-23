import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

// ─── GaugeChart ────────────────────────────────────────────────────────────────
// Medidor semicircular (180°): arco de trilho + arco de preenchimento proporcional
// a value/max, com valor e rótulo no centro. SVG manual, consome useTheme().

interface GaugeChartProps {
  /** Valor atual. */
  value: number
  /** Valor máximo (default 100 → value já é percentual). */
  max?: number
  /** Altura do SVG em px (default 160). */
  height?: number
  /** Cor do arco de preenchimento (default t.chart.series[0]). */
  color?: string
  /** Texto grande no centro. Default: percentual arredondado. */
  centerValue?: string
  /** Texto pequeno abaixo do valor. */
  centerLabel?: string
}

export function GaugeChart({
  value,
  max = 100,
  height = 160,
  color = t.chart.series[0],
  centerValue,
  centerLabel,
}: GaugeChartProps) {
  const { colors, isGbMode } = useTheme()

  const pct = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0

  const W = 260
  const H = height
  const cx = W / 2
  const cy = H - 20
  const r = 100
  const sw = 18

  const describeArc = (startAngle: number, endAngle: number) => {
    const toRad = (a: number) => ((a - 90) * Math.PI) / 180
    const sx = cx + r * Math.cos(toRad(startAngle))
    const sy = cy + r * Math.sin(toRad(startAngle))
    const ex = cx + r * Math.cos(toRad(endAngle))
    const ey = cy + r * Math.sin(toRad(endAngle))
    return `M ${sx},${sy} A ${r},${r} 0 ${endAngle - startAngle > 180 ? 1 : 0},1 ${ex},${ey}`
  }

  const startAng = -90
  const bigText = centerValue ?? `${Math.round(pct * 100)}%`

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', fontFamily: t.font.family.sans }}
    >
      {/* Trilho */}
      <path
        d={describeArc(startAng, startAng + 180)}
        fill="none"
        stroke={isGbMode ? t.chart.gridGb : t.color.neutral[100]}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      {/* Preenchimento */}
      <path
        d={describeArc(startAng, startAng + pct * 180)}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        style={{ transition: `stroke-dashoffset ${t.transition.smooth}` }}
      />
      {/* Valor central */}
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        fontSize={t.font.size['2xl']}
        fontWeight={t.font.weight.bold}
        fill={isGbMode ? t.color.gb.accent : (colors.fg.default as string)}
        fontFamily={t.font.family.sans}
      >
        {bigText}
      </text>
      {centerLabel && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          fontSize={t.font.size.xs}
          fill={colors.fg.subtle as string}
          fontFamily={t.font.family.sans}
        >
          {centerLabel}
        </text>
      )}
    </svg>
  )
}
