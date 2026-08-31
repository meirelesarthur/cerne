import { t } from '../../design/tokens'
import { useChartScale } from '../../hooks/useChartScale'

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

  // viewBox casado à largura real medida: 1 unidade = 1px, então `height` é a
  // altura renderizada de fato. Com viewBox fixo e `preserveAspectRatio="none"`,
  // 40px declarados renderizavam 22px num card de KPI.
  const FALLBACK_W = 400
  const { ref, width } = useChartScale(FALLBACK_W)
  const W = width || FALLBACK_W
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
    <div ref={ref} style={{ width: '100%' }}>
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block' }}
      aria-hidden="true"
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
    </div>
  )
}
