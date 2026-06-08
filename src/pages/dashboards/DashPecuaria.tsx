import { useEffect, useState, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'

// ─── Mock data ────────────────────────────────────────────────────────────────

const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] as const

const novilhos  = [1580, 1600, 1620, 1640, 1630, 1650, 1670, 1680, 1660, 1690, 1700, 1628]
const matrizes  = [1160, 1170, 1175, 1180, 1190, 1185, 1195, 1200, 1195, 1205, 1210, 1198]
const bezerros  = [730,  740,  745,  755,  760,  750,  765,  770,  755,  770,  780,  754]

const rebanhoComp = [
  { label: 'Novilhos',  pct: 38, color: t.color.brand[600] },
  { label: 'Matrizes',  pct: 28, color: '#d97706' },
  { label: 'Touros',    pct: 8,  color: '#7c3aed' },
  { label: 'Bezerros',  pct: 18, color: t.color.brand[400] },
  { label: 'Descarte',  pct: 8,  color: t.color.neutral[400] },
] as const

const vermifugData = [42, 38, 55, 48, 60, 45, 52, 58, 44, 50, 62, 48]
const pesagensData = [30, 28, 40, 35, 45, 32, 38, 42, 30, 36, 48, 35]

// ─── Area Chart Rebanho ───────────────────────────────────────────────────────

const PEC_SERIES = [
  { data: novilhos, color: t.color.brand[600], label: 'Novilhos',  gradId: 'gradNovPec' },
  { data: matrizes, color: '#d97706',           label: 'Matrizes',  gradId: 'gradMatPec' },
  { data: bezerros, color: t.color.brand[400],  label: 'Bezerros',  gradId: 'gradBezPec' },
] as const

function AreaChartRebanho({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null)
  const [animated, setAnimated] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), 60)
    return () => clearTimeout(id)
  }, [])

  const W = 560
  const H = 240
  const padL = 52
  const padR = 16
  const padT = 16
  const padB = 36
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const allVals = [...novilhos, ...matrizes, ...bezerros]
  const minV = Math.min(...allVals) * 0.92
  const maxV = Math.max(...allVals) * 1.05

  const xOf = (i: number) => padL + (i / (novilhos.length - 1)) * chartW
  const yOf = (v: number) => padT + chartH - ((v - minV) / (maxV - minV)) * chartH

  const bezier = (data: readonly number[]) =>
    data.map((v, i) => {
      const x = xOf(i), y = yOf(v)
      if (i === 0) return `M ${x},${y}`
      const px = xOf(i - 1), py = yOf(data[i - 1])
      const cpx = (px + x) / 2
      return `C ${cpx},${py} ${cpx},${y} ${x},${y}`
    }).join(' ')

  const closedBezier = (data: readonly number[]) =>
    bezier(data) + ` L ${xOf(data.length - 1)},${padT + chartH} L ${xOf(0)},${padT + chartH} Z`

  const tickCount = 5
  const ticks = Array.from({ length: tickCount }, (_, i) =>
    Math.round(minV + ((maxV - minV) * i) / (tickCount - 1))
  )

  return (
    <div style={{ position: 'relative' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: t.space[5], marginBottom: t.space[4] }}>
        {PEC_SERIES.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
            <div style={{ width: 12, height: 3, borderRadius: 2, background: s.color }} />
            <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary as string, fontFamily: t.font.family.sans }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          {PEC_SERIES.map(s => (
            <linearGradient key={s.gradId} id={s.gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.01" />
            </linearGradient>
          ))}
        </defs>

        {/* Grid */}
        {ticks.map((tick, i) => {
          const y = yOf(tick)
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y}
                stroke={colors.border as string} strokeWidth={0.5} strokeDasharray="4,4" />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={t.font.size.base}
                fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
                {tick.toLocaleString('pt-BR')}
              </text>
            </g>
          )
        })}

        {/* Month labels */}
        {monthLabels.map((label, i) => (
          <text key={i} x={xOf(i)} y={H - 8} textAnchor="middle" fontSize={t.font.size.base}
            fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
            {label}
          </text>
        ))}

        {/* Area fills */}
        {PEC_SERIES.map((s, si) => (
          <path key={`fill-${s.gradId}`} d={closedBezier(s.data)} fill={`url(#${s.gradId})`}
            style={{ opacity: animated ? 1 : 0, transition: `opacity ${500 + si * 100}ms ease` }} />
        ))}

        {/* Lines */}
        {PEC_SERIES.map((s, si) => (
          <path key={`line-${s.gradId}`} d={bezier(s.data)} fill="none"
            stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            style={{ opacity: animated ? 1 : 0, transition: `opacity ${600 + si * 80}ms ease ${si * 60}ms` }} />
        ))}

        {/* Hover zones */}
        {novilhos.map((_, i) => (
          <rect key={i} x={xOf(i) - 14} y={padT} width={28} height={chartH}
            fill="transparent" style={{ cursor: 'pointer' }}
            onMouseEnter={() => {
              setHovIdx(i)
              if (svgRef.current) {
                const r = svgRef.current.getBoundingClientRect()
                setTooltip({ x: xOf(i) / W * r.width + r.left, y: padT / H * r.height + r.top })
              }
            }}
            onMouseLeave={() => { setHovIdx(null); setTooltip(null) }}
          />
        ))}

        {/* Vertical crosshair */}
        {hovIdx !== null && (
          <line x1={xOf(hovIdx)} y1={padT} x2={xOf(hovIdx)} y2={padT + chartH}
            stroke={colors.border as string} strokeWidth={1} strokeDasharray="3,3"
            style={{ pointerEvents: 'none' }} />
        )}

        {/* Dots */}
        {PEC_SERIES.map(s =>
          s.data.map((v, i) => (
            <circle key={`${s.gradId}-${i}`} cx={xOf(i)} cy={yOf(v)}
              r={hovIdx === i ? 4.5 : 3}
              fill={hovIdx === i ? s.color : (isGbMode ? '#0f1f17' : '#ffffff')}
              stroke={s.color} strokeWidth={2}
              style={{
                transition: 'r 0.15s ease',
                pointerEvents: 'none',
                opacity: animated ? 1 : 0,
              }} />
          ))
        )}
      </svg>

      {/* Floating HTML tooltip */}
      {tooltip !== null && hovIdx !== null && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 14,
          top: tooltip.y + 4,
          background: isGbMode ? '#0b1e14' : '#ffffff',
          border: `1px solid ${colors.border}`,
          borderRadius: t.radius.lg,
          padding: `${t.space[2]}px ${t.space[3]}px`,
          fontFamily: t.font.family.sans,
          boxShadow: t.shadow.lg,
          zIndex: t.zIndex.toast,
          pointerEvents: 'none',
          minWidth: 140,
        }}>
          <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.textPrimary as string, marginBottom: t.space[1] }}>
            {monthLabels[hovIdx]}
          </div>
          {PEC_SERIES.map((s, si) => (
            <div key={si} style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginTop: 2 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: t.font.size.xs, color: colors.textSecondary as string }}>{s.label}:</span>
              <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.textPrimary as string }}>
                {s.data[hovIdx].toLocaleString('pt-BR')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Donut Rebanho ────────────────────────────────────────────────────────────

function DonutRebanho({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), 80)
    return () => clearTimeout(id)
  }, [])

  const W = 192
  const H = 192
  const cx = W / 2
  const cy = H / 2
  const r = 80
  const inner = 50
  const GAP = 0.018 // radians gap between slices

  let cum = 0
  const slices = rebanhoComp.map(d => {
    const start = cum
    cum += d.pct / 100
    return { ...d, start, end: cum }
  })

  const descSlice = (start: number, end: number, hov: boolean) => {
    const radius = hov ? r + 6 : r
    const toRad = (p: number) => p * 2 * Math.PI - Math.PI / 2
    const s = toRad(start) + GAP
    const e = toRad(end) - GAP
    const sx = cx + radius * Math.cos(s), sy = cy + radius * Math.sin(s)
    const ex = cx + radius * Math.cos(e), ey = cy + radius * Math.sin(e)
    const ix = cx + inner * Math.cos(e),  iy = cy + inner * Math.sin(e)
    const jx = cx + inner * Math.cos(s),  jy = cy + inner * Math.sin(s)
    const large = end - start > 0.5 ? 1 : 0
    return `M ${sx},${sy} A ${radius},${radius} 0 ${large},1 ${ex},${ey} L ${ix},${iy} A ${inner},${inner} 0 ${large},0 ${jx},${jy} Z`
  }

  const totalLabel = hovIdx !== null ? `${rebanhoComp[hovIdx].pct}%` : '4.280'
  const subLabel   = hovIdx !== null ? rebanhoComp[hovIdx].label : 'cabeças'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.space[4] }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {slices.map((s, i) => (
          <path
            key={i}
            d={descSlice(s.start, s.end, hovIdx === i)}
            fill={s.color}
            style={{
              cursor: 'pointer',
              opacity: hovIdx !== null && hovIdx !== i ? 0.32 : (animated ? 1 : 0),
              transition: `opacity ${300 + i * 50}ms ease, d 0.18s ease`,
            }}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
          />
        ))}
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize={17}
          fontWeight={t.font.weight.bold}
          fill={colors.textPrimary as string}
          fontFamily={t.font.family.sans}>
          {totalLabel}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={t.font.size.sm}
          fill={colors.textMuted as string}
          fontFamily={t.font.family.sans}>
          {subLabel}
        </text>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2], width: '100%' }}>
        {rebanhoComp.map((d, i) => (
          <div
            key={i}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: t.space[2],
              padding: `${t.space[1]}px ${t.space[2]}px`,
              borderRadius: t.radius.md,
              cursor: 'default',
              background: hovIdx === i ? (isGbMode ? 'rgba(255,255,255,0.06)' : t.color.neutral[50]) : 'transparent',
              opacity: hovIdx !== null && hovIdx !== i ? 0.4 : 1,
              transition: 'opacity 0.18s ease, background 0.15s ease',
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary as string, fontFamily: t.font.family.sans, flex: 1 }}>
              {d.label}
            </span>
            <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.textPrimary as string, fontFamily: t.font.family.sans }}>
              {d.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Grouped Bar Chart Manejos ────────────────────────────────────────────────

const BAR_SERIES = [
  { data: vermifugData, color: t.color.brand[600], label: 'Vermifugações' },
  { data: pesagensData, color: '#d97706',           label: 'Pesagens' },
] as const

function ManejosBars({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [hovMonth, setHovMonth] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; idx: number } | null>(null)
  const [animated, setAnimated] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), 80)
    return () => clearTimeout(id)
  }, [])

  const W = 560
  const H = 220
  const padL = 36
  const padR = 16
  const padT = 12
  const padB = 36
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const allVals = [...vermifugData, ...pesagensData]
  const maxV = Math.max(...allVals) * 1.15

  const months = monthLabels.length
  const groupW = chartW / months
  const barW  = groupW * 0.36
  const gap   = groupW * 0.06

  const yOf  = (v: number) => padT + chartH - (v / maxV) * chartH
  const barH = (v: number) => (v / maxV) * chartH

  const tickCount = 4
  const ticks = Array.from({ length: tickCount }, (_, i) => Math.round((maxV * i) / (tickCount - 1)))

  return (
    <div style={{ position: 'relative' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: t.space[5], marginBottom: t.space[4] }}>
        {BAR_SERIES.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
            <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary as string, fontFamily: t.font.family.sans }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        {ticks.map((tick, i) => {
          const y = padT + chartH - (tick / maxV) * chartH
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y}
                stroke={colors.border as string} strokeWidth={0.5} strokeDasharray="4,4" />
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={t.font.size.base}
                fill={colors.textMuted as string} fontFamily={t.font.family.sans}>{tick}</text>
            </g>
          )
        })}

        {/* Bars */}
        {monthLabels.map((label, i) => {
          const gx = padL + i * groupW + groupW / 2
          const isHov = hovMonth === i
          const dimmed = hovMonth !== null && !isHov

          const vV = vermifugData[i]
          const vP = pesagensData[i]
          const hV = barH(vV)
          const hP = barH(vP)

          return (
            <g key={i} style={{ cursor: 'pointer' }}
              onMouseEnter={() => {
                setHovMonth(i)
                if (svgRef.current) {
                  const r = svgRef.current.getBoundingClientRect()
                  setTooltip({
                    x: gx / W * r.width + r.left,
                    y: yOf(Math.max(vV, vP)) / H * r.height + r.top,
                    idx: i,
                  })
                }
              }}
              onMouseLeave={() => { setHovMonth(null); setTooltip(null) }}
            >
              <rect x={padL + i * groupW} y={padT} width={groupW} height={chartH} fill="transparent" />

              {/* Vermifugação */}
              <rect
                x={gx - barW - gap / 2} y={yOf(vV)}
                width={barW} height={hV} rx={3}
                fill={t.color.brand[600]}
                opacity={dimmed ? 0.28 : 1}
                style={{
                  transformBox: 'fill-box' as React.CSSProperties['transformBox'],
                  transformOrigin: '50% 100%',
                  transform: animated ? 'scaleY(1)' : 'scaleY(0)',
                  transition: `transform 520ms cubic-bezier(0,0,0.2,1) ${i * 28}ms, opacity 0.18s ease`,
                }}
              />

              {/* Pesagem */}
              <rect
                x={gx + gap / 2} y={yOf(vP)}
                width={barW} height={hP} rx={3}
                fill="#d97706"
                opacity={dimmed ? 0.28 : 1}
                style={{
                  transformBox: 'fill-box' as React.CSSProperties['transformBox'],
                  transformOrigin: '50% 100%',
                  transform: animated ? 'scaleY(1)' : 'scaleY(0)',
                  transition: `transform 520ms cubic-bezier(0,0,0.2,1) ${i * 28 + 40}ms, opacity 0.18s ease`,
                }}
              />

              <text x={gx} y={H - 10} textAnchor="middle" fontSize={t.font.size.base}
                fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
                {label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Floating HTML tooltip */}
      {tooltip !== null && hovMonth !== null && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y - 8,
          background: isGbMode ? '#0b1e14' : '#ffffff',
          border: `1px solid ${colors.border}`,
          borderRadius: t.radius.lg,
          padding: `${t.space[2]}px ${t.space[3]}px`,
          fontFamily: t.font.family.sans,
          boxShadow: t.shadow.lg,
          zIndex: t.zIndex.toast,
          pointerEvents: 'none',
          minWidth: 130,
        }}>
          <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.textPrimary as string, marginBottom: t.space[1] }}>
            {monthLabels[hovMonth]}
          </div>
          {BAR_SERIES.map((s, si) => (
            <div key={si} style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginTop: 2 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: t.font.size.xs, color: colors.textSecondary as string }}>{s.label}:</span>
              <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.textPrimary as string }}>
                {s.data[hovMonth]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── DashPecuaria ─────────────────────────────────────────────────────────────

const PEC_KPIS = [
  { label: 'Total Cabeças',  value: '4.280',       trend: '3,2%', up: true  },
  { label: 'Peso Médio',     value: '384 kg',       trend: '1,8%', up: true  },
  { label: 'Arrobas/mês',   value: '2.156 @',      trend: '7,4%', up: true  },
  { label: 'GMD',            value: '0,82 kg/dia',  trend: '0,4%', up: false },
]

export default function DashPecuaria() {
  const { colors, isGbMode } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const bc = colors.border as string

  const cardStyle: React.CSSProperties = {
    margin: `${t.space[5]}px ${t.space[6]}px`,
    display: 'flex', flexDirection: 'column',
    background: colors.surfaceBg,
    borderRadius: t.radius['2xl'],
    border: `1px solid ${bc}`,
    boxShadow: isGbMode
      ? '0 1px 2px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.35)'
      : '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.07)',
    overflow: 'hidden',
    fontFamily: t.font.family.sans,
  }

  if (isLoading) {
    return <div style={cardStyle}><Skeleton height={600} /></div>
  }

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.space[4]}px ${t.space[5]}px` }}>
        <span style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.semibold, color: colors.textPrimary as string }}>
          Pecuária de Corte
        </span>
        <button style={{
          display: 'flex', alignItems: 'center', gap: t.space[1],
          border: `1px solid ${bc}`, borderRadius: t.radius.default,
          padding: `5px ${t.space[3]}px`, background: 'transparent',
          cursor: 'pointer', fontSize: t.font.size.sm,
          color: colors.textSecondary as string, fontFamily: t.font.family.sans,
        }}>
          Últimos 30 dias <ChevronDown size={12} />
        </button>
      </div>
      <HDivider color={bc} />

      {/* KPI row */}
      <div style={{ display: 'flex' }}>
        {PEC_KPIS.flatMap((kpi, i) => [
          i > 0 ? <VDivider key={`d${i}`} color={bc} /> : null,
          <div key={kpi.label} style={{ flex: 1, padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px` }}>
            <div style={{ fontSize: t.font.size.sm, color: colors.textMuted as string, marginBottom: t.space[1] }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.textPrimary as string, lineHeight: 1.1, marginBottom: t.space[2] }}>
              {kpi.value}
            </div>
            <span style={{ fontSize: t.font.size.sm, color: kpi.up ? t.color.success.text : t.color.error.text }}>
              {kpi.up ? '▲' : '▼'} {kpi.trend}
            </span>
          </div>,
        ])}
      </div>
      <HDivider color={bc} />

      {/* Row 2 — Area chart + Donut */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{ flex: 2, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.medium, color: colors.textSecondary as string, marginBottom: t.space[4] }}>
            Evolução do Rebanho
          </div>
          <AreaChartRebanho colors={colors} isGbMode={isGbMode} />
        </div>
        <VDivider color={bc} />
        <div style={{ flex: 1, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.medium, color: colors.textSecondary as string, marginBottom: t.space[4] }}>
            Composição do Rebanho
          </div>
          <DonutRebanho colors={colors} isGbMode={isGbMode} />
        </div>
      </div>
      <HDivider color={bc} />

      {/* Row 3 — Manejos */}
      <div style={{ padding: t.space[5] }}>
        <div style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.medium, color: colors.textSecondary as string, marginBottom: t.space[4] }}>
          Manejos por Mês
        </div>
        <ManejosBars colors={colors} isGbMode={isGbMode} />
      </div>
    </div>
  )
}
