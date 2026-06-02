import { useEffect, useState } from 'react'
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
  { label: 'Bezerros',  pct: 18, color: t.color.brand[300] },
  { label: 'Descarte',  pct: 8,  color: t.color.neutral[400] },
] as const

const vermifugData = [42, 38, 55, 48, 60, 45, 52, 58, 44, 50, 62, 48]
const pesagensData = [30, 28, 40, 35, 45, 32, 38, 42, 30, 36, 48, 35]

// ─── Area Chart Rebanho ───────────────────────────────────────────────────────

function AreaChartRebanho({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  const W = 560
  const H = 220
  const padL = 48
  const padR = 16
  const padT = 12
  const padB = 32
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const allVals = [...novilhos, ...matrizes, ...bezerros]
  const minV = Math.min(...allVals) * 0.92
  const maxV = Math.max(...allVals) * 1.05

  const xOf = (i: number) => padL + (i / (novilhos.length - 1)) * chartW
  const yOf = (v: number) => padT + chartH - ((v - minV) / (maxV - minV)) * chartH

  const bezier = (data: readonly number[]) =>
    data.map((v, i) => {
      const x = xOf(i)
      const y = yOf(v)
      if (i === 0) return `M ${x},${y}`
      const px = xOf(i - 1)
      const py = yOf(data[i - 1])
      const cpx = (px + x) / 2
      return `C ${cpx},${py} ${cpx},${y} ${x},${y}`
    }).join(' ')

  const closedBezier = (data: readonly number[]) => {
    const path = bezier(data)
    return path + ` L ${xOf(data.length - 1)},${padT + chartH} L ${xOf(0)},${padT + chartH} Z`
  }

  const tickCount = 4
  const ticks = Array.from({ length: tickCount }, (_, i) => minV + ((maxV - minV) * i) / (tickCount - 1))
  const tooltipFill = isGbMode ? '#0b1e14' : '#ffffff'

  const series = [
    { data: novilhos,  color: t.color.brand[600], label: 'Novilhos',  gradId: 'gradNov' },
    { data: matrizes,  color: '#d97706',           label: 'Matrizes',  gradId: 'gradMat' },
    { data: bezerros,  color: t.color.neutral[300], label: 'Bezerros', gradId: 'gradBez' },
  ] as const

  return (
    <div>
      <div style={{ display: 'flex', gap: t.space[4], marginBottom: t.space[3] }}>
        {series.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
            <div style={{ width: 10, height: 3, borderRadius: 2, background: s.color }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted as string, fontFamily: t.font.family.sans }}>{s.label}</span>
          </div>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          {series.map(s => (
            <linearGradient key={s.gradId} id={s.gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>

        {ticks.map((tick, i) => {
          const y = yOf(tick)
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={colors.border as string} strokeWidth={0.5} strokeDasharray="3,3" />
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
                {Math.round(tick)}
              </text>
            </g>
          )
        })}

        {monthLabels.map((label, i) => (
          <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fontSize={9} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
            {label}
          </text>
        ))}

        {series.map(s => (
          <path key={`fill-${s.gradId}`} d={closedBezier(s.data)} fill={`url(#${s.gradId})`} />
        ))}
        {series.map(s => (
          <path key={`line-${s.gradId}`} d={bezier(s.data)} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {novilhos.map((_, i) => (
          <rect
            key={i}
            x={xOf(i) - 12}
            y={padT}
            width={24}
            height={chartH}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
          />
        ))}

        {series.map(s =>
          s.data.map((v, i) => (
            <circle
              key={`${s.gradId}-${i}`}
              cx={xOf(i)}
              cy={yOf(v)}
              r={hovIdx === i ? 4 : 2.5}
              fill={hovIdx === i ? s.color : (isGbMode ? '#1a2e20' : '#ffffff')}
              stroke={s.color}
              strokeWidth={1.5}
              style={{ transition: 'r 0.12s ease', pointerEvents: 'none' }}
            />
          ))
        )}

        {hovIdx !== null && (
          <g>
            <rect
              x={Math.min(xOf(hovIdx) + 6, W - padR - 120)}
              y={padT}
              width={118}
              height={60}
              rx={t.radius.DEFAULT}
              fill={tooltipFill}
              stroke={colors.border as string}
              strokeWidth={0.8}
            />
            <text x={Math.min(xOf(hovIdx) + 6, W - padR - 120) + 8} y={padT + 14} fontSize={9} fill={colors.textMuted as string} fontFamily={t.font.family.sans} fontWeight={t.font.weight.semibold}>
              {monthLabels[hovIdx]}
            </text>
            {series.map((s, si) => (
              <text key={si} x={Math.min(xOf(hovIdx) + 6, W - padR - 120) + 8} y={padT + 26 + si * 12} fontSize={9} fill={s.color} fontFamily={t.font.family.sans}>
                {s.label}: {s.data[hovIdx]}
              </text>
            ))}
          </g>
        )}
      </svg>
    </div>
  )
}

// ─── Donut Rebanho ────────────────────────────────────────────────────────────

function DonutRebanho({ colors }: { colors: ReturnType<typeof useTheme>['colors'] }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  const W = 160
  const H = 160
  const cx = W / 2
  const cy = H / 2
  const r = 62
  const inner = 38

  let cumPct = 0
  const slices = rebanhoComp.map(d => {
    const start = cumPct
    cumPct += d.pct / 100
    return { ...d, start, end: cumPct }
  })

  const descSlice = (start: number, end: number) => {
    const toRad = (p: number) => p * 2 * Math.PI - Math.PI / 2
    const sx = cx + r * Math.cos(toRad(start))
    const sy = cy + r * Math.sin(toRad(start))
    const ex = cx + r * Math.cos(toRad(end))
    const ey = cy + r * Math.sin(toRad(end))
    const ix = cx + inner * Math.cos(toRad(end))
    const iy = cy + inner * Math.sin(toRad(end))
    const jx = cx + inner * Math.cos(toRad(start))
    const jy = cy + inner * Math.sin(toRad(start))
    const large = end - start > 0.5 ? 1 : 0
    return `M ${sx},${sy} A ${r},${r} 0 ${large},1 ${ex},${ey} L ${ix},${iy} A ${inner},${inner} 0 ${large},0 ${jx},${jy} Z`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.space[3] }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {slices.map((s, i) => (
          <path
            key={i}
            d={descSlice(s.start, s.end)}
            fill={s.color}
            opacity={hovIdx !== null && hovIdx !== i ? 0.3 : 1}
            style={{ cursor: 'pointer', transition: 'opacity 0.18s ease' }}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
          />
        ))}
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize={13} fontWeight={t.font.weight.bold} fill={colors.textPrimary as string} fontFamily={t.font.family.sans}>
          {hovIdx !== null ? `${rebanhoComp[hovIdx].pct}%` : '4.280'}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={9} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
          {hovIdx !== null ? rebanhoComp[hovIdx].label : 'cabeças'}
        </text>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2], width: '100%' }}>
        {rebanhoComp.map((d, i) => (
          <div
            key={i}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
            style={{ display: 'flex', alignItems: 'center', gap: t.space[2], cursor: 'default', opacity: hovIdx !== null && hovIdx !== i ? 0.4 : 1, transition: 'opacity 0.18s ease' }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textSecondary as string, fontFamily: t.font.family.sans, flex: 1 }}>{d.label}</span>
            <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.textPrimary as string, fontFamily: t.font.family.sans }}>
              {d.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Grouped Bar Chart Manejos ────────────────────────────────────────────────

function ManejosBars({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [hovMonth, setHovMonth] = useState<number | null>(null)
  const W = 900
  const H = 200
  const padL = 32
  const padR = 16
  const padT = 12
  const padB = 32
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const allVals = [...vermifugData, ...pesagensData]
  const maxV = Math.max(...allVals) * 1.1

  const months = monthLabels.length
  const groupW = chartW / months
  const barW = groupW * 0.32
  const gap = groupW * 0.06

  const yOf = (v: number) => padT + chartH - (v / maxV) * chartH
  const barH = (v: number) => (v / maxV) * chartH

  const tooltipFill = isGbMode ? '#0b1e14' : '#ffffff'

  const tickCount = 4
  const ticks = Array.from({ length: tickCount }, (_, i) => Math.round((maxV * i) / (tickCount - 1)))

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {ticks.map((tick, i) => {
        const y = padT + chartH - (tick / maxV) * chartH
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={colors.border as string} strokeWidth={0.5} strokeDasharray="3,3" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>{tick}</text>
          </g>
        )
      })}

      {monthLabels.map((label, i) => {
        const gx = padL + i * groupW + groupW / 2
        const isHov = hovMonth === i
        const dimmed = hovMonth !== null && !isHov
        const vVerm = vermifugData[i]
        const vPes = pesagensData[i]

        return (
          <g
            key={i}
            onMouseEnter={() => setHovMonth(i)}
            onMouseLeave={() => setHovMonth(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={padL + i * groupW}
              y={padT}
              width={groupW}
              height={chartH}
              fill="transparent"
            />

            {/* Vermifugação bar */}
            <rect
              x={gx - barW - gap / 2}
              y={yOf(vVerm)}
              width={barW}
              height={barH(vVerm)}
              rx={2}
              fill={t.color.brand[600]}
              opacity={dimmed ? 0.3 : 1}
              style={{ transition: 'opacity 0.18s ease' }}
            />

            {/* Pesagem bar */}
            <rect
              x={gx + gap / 2}
              y={yOf(vPes)}
              width={barW}
              height={barH(vPes)}
              rx={2}
              fill={t.color.neutral[300]}
              opacity={dimmed ? 0.3 : 1}
              style={{ transition: 'opacity 0.18s ease' }}
            />

            <text x={gx} y={H - 6} textAnchor="middle" fontSize={9} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
              {label}
            </text>

            {isHov && (
              <g>
                <rect
                  x={Math.min(gx - 46, W - padR - 100)}
                  y={padT}
                  width={100}
                  height={42}
                  rx={t.radius.DEFAULT}
                  fill={tooltipFill}
                  stroke={colors.border as string}
                  strokeWidth={0.8}
                />
                <text x={Math.min(gx - 46, W - padR - 100) + 8} y={padT + 14} fontSize={9} fill={colors.textMuted as string} fontFamily={t.font.family.sans} fontWeight={t.font.weight.semibold}>
                  {label}
                </text>
                <text x={Math.min(gx - 46, W - padR - 100) + 8} y={padT + 27} fontSize={9} fill={t.color.brand[600]} fontFamily={t.font.family.sans}>
                  Vermif.: {vVerm}
                </text>
                <text x={Math.min(gx - 46, W - padR - 100) + 8} y={padT + 39} fontSize={9} fill={t.color.neutral[400]} fontFamily={t.font.family.sans}>
                  Pesagem: {vPes}
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* Legend */}
      <g>
        <rect x={W - 110} y={padT} width={8} height={8} rx={2} fill={t.color.brand[600]} />
        <text x={W - 98} y={padT + 7} fontSize={9} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>Vermifugações</text>
        <rect x={W - 110} y={padT + 14} width={8} height={8} rx={2} fill={t.color.neutral[300]} />
        <text x={W - 98} y={padT + 21} fontSize={9} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>Pesagens</text>
      </g>
    </svg>
  )
}

// ─── DashPecuaria ─────────────────────────────────────────────────────────────

const PEC_KPIS = [
  { label: 'Total Cabeças',  value: '4.280',      trend: '3,2%', up: true  },
  { label: 'Peso Médio',     value: '384 kg',     trend: '1,8%', up: true  },
  { label: 'Arrobas/mês',   value: '2.156 @',    trend: '7,4%', up: true  },
  { label: 'GMD',            value: '0,82 kg/dia', trend: '0,4%', up: false },
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
    boxShadow: isGbMode ? '0 1px 2px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.35)' : '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.07)',
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
        <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.textPrimary as string }}>Pecuária de Corte</span>
        <button style={{ display: 'flex', alignItems: 'center', gap: t.space[1], border: `1px solid ${bc}`, borderRadius: t.radius.DEFAULT, padding: `5px ${t.space[3]}px`, background: 'transparent', cursor: 'pointer', fontSize: t.font.size.xs, color: colors.textSecondary as string, fontFamily: t.font.family.sans }}>
          Últimos 30 dias <ChevronDown size={11} />
        </button>
      </div>
      <HDivider color={bc} />

      {/* KPI row */}
      <div style={{ display: 'flex' }}>
        {PEC_KPIS.map((kpi, i) => (
          <>
            {i > 0 && <VDivider key={`d${i}`} color={bc} />}
            <div key={kpi.label} style={{ flex: 1, padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px` }}>
              <div style={{ fontSize: t.font.size.xs, color: colors.textMuted as string, marginBottom: t.space[1] }}>{kpi.label}</div>
              <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.textPrimary as string, lineHeight: 1.1, marginBottom: t.space[2] }}>{kpi.value}</div>
              <span style={{ fontSize: t.font.size.xs, color: kpi.up ? t.color.success.text : t.color.error.text }}>{kpi.up ? '▲' : '▼'} {kpi.trend}</span>
            </div>
          </>
        ))}
      </div>
      <HDivider color={bc} />

      {/* Row 2 — Area chart + Donut */}
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 2, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.xs, color: colors.textMuted as string, marginBottom: t.space[4] }}>Evolução do Rebanho</div>
          <AreaChartRebanho colors={colors} isGbMode={isGbMode} />
        </div>
        <VDivider color={bc} />
        <div style={{ flex: 1, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.xs, color: colors.textMuted as string, marginBottom: t.space[4] }}>Composição do Rebanho</div>
          <DonutRebanho colors={colors} />
        </div>
      </div>
      <HDivider color={bc} />

      {/* Row 3 — Manejos */}
      <div style={{ padding: t.space[5] }}>
        <div style={{ fontSize: t.font.size.xs, color: colors.textMuted as string, marginBottom: t.space[4] }}>Manejos por Mês</div>
        <ManejosBars colors={colors} isGbMode={isGbMode} />
      </div>
    </div>
  )
}
