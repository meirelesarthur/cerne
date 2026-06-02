import { t } from '../../design/tokens'

interface SparklineAreaProps {
  data: number[]
  color?: string
  height?: number
  filled?: boolean
}

export function SparklineArea({
  data,
  color = t.color.brand[600],
  height = 60,
  filled = true,
}: SparklineAreaProps) {
  if (!data || data.length < 2) return null

  const W = 400
  const H = height
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = H * 0.08

  const xOf = (i: number) => (i / (data.length - 1)) * W
  const yOf = (v: number) => H - pad - ((v - min) / range) * (H - pad * 2)

  const pts: [number, number][] = data.map((v, i) => [xOf(i), yOf(v)])

  const linePath = pts
    .map(([x, y], i) => {
      if (i === 0) return `M ${x},${y}`
      const [px, py] = pts[i - 1]
      const cx = (px + x) / 2
      return `C ${cx},${py} ${cx},${y} ${x},${y}`
    })
    .join(' ')

  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`
  const gradId = `spk_${color.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {filled && <path d={areaPath} fill={`url(#${gradId})`} />}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
