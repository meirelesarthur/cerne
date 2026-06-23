import { useEffect, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  BarChart2,
  ChevronDown,
  Clock,
} from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { HeatmapChart } from '../../components/ui/HeatmapChart'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { Button } from '../../components/ui/Button'

// ─── Mock data ────────────────────────────────────────────────────────────────

const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const revenueData = [640000, 720000, 680000, 810000, 750000, 870000, 820000, 890000, 760000, 830000, 900000, 892450]
const expenseData = [420000, 510000, 480000, 560000, 530000, 610000, 580000, 650000, 590000, 620000, 700000, 634120]

const vencimentos = [
  { nome: 'Fornecedor AgriMax',  valor: 'R$ 28.400', data: '03/06/2026', status: 'Pendente' },
  { nome: 'Locação Maquinário',  valor: 'R$ 12.750', data: '05/06/2026', status: 'Pendente' },
  { nome: 'Cooperativa Sementes', valor: 'R$ 8.900', data: '01/06/2026', status: 'Atrasado' },
  { nome: 'Energia Elétrica',    valor: 'R$ 3.200',  data: '07/06/2026', status: 'Pendente' },
  { nome: 'Consultoria Técnica', valor: 'R$ 5.600',  data: '28/05/2026', status: 'Atrasado' },
]

const donutData = [
  { label: 'Suprimentos', pct: 35, color: t.color.brand[600] },
  { label: 'RH',          pct: 25, color: t.color.feedback.info.solid },
  { label: 'Frota',       pct: 18, color: t.color.feedback.notice },
  { label: 'Impostos',    pct: 14, color: t.color.feedback.error.solid },
  { label: 'Outros',      pct: 8,  color: t.color.neutral[400] },
]

const heatmapRows = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const heatmapCols = ['6h', '9h', '12h', '15h', '18h', '21h', '0h', '3h']
const heatmapData = [
  [12, 48, 95, 82, 74, 38, 8,  2],
  [15, 52, 89, 91, 68, 42, 6,  1],
  [10, 45, 102, 88, 71, 35, 9, 3],
  [18, 55, 97, 84, 79, 41, 11, 4],
  [22, 61, 108, 95, 83, 57, 14, 5],
  [8,  22, 45, 38, 31, 62, 18, 7],
  [4,  10, 18, 14, 12, 28, 9,  3],
]

// ─── Trend badge ──────────────────────────────────────────────────────────────

function Trend({ value, up }: { value: string; up: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
      fontFamily: t.font.family.sans,
      color: up ? t.color.feedback.success.text : t.color.feedback.error.text,
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 14, height: 14, borderRadius: t.radius.full,
        background: up ? t.color.feedback.success.bg : t.color.feedback.error.bg,
        fontSize: 9,
      }}>
        {up ? '▲' : '▼'}
      </span>
      {value}
    </span>
  )
}

// ─── Area Chart (Receitas x Despesas) ────────────────────────────────────────

function AreaChartRD({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  const W = 600
  const H = 200
  const padL = 48
  const padR = 16
  const padT = 12
  const padB = 32
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const allVals = [...revenueData, ...expenseData]
  const minV = Math.min(...allVals) * 0.9
  const maxV = Math.max(...allVals) * 1.05

  const xOf = (i: number) => padL + (i / (revenueData.length - 1)) * chartW
  const yOf = (v: number) => padT + chartH - ((v - minV) / (maxV - minV)) * chartH

  const bezier = (data: number[]) =>
    data.map((v, i) => {
      const x = xOf(i); const y = yOf(v)
      if (i === 0) return `M ${x},${y}`
      const px = xOf(i - 1); const py = yOf(data[i - 1])
      const cpx = (px + x) / 2
      return `C ${cpx},${py} ${cpx},${y} ${x},${y}`
    }).join(' ')

  const closedPath = (data: number[]) => {
    const path = bezier(data)
    return `${path} L ${xOf(data.length - 1)},${padT + chartH} L ${xOf(0)},${padT + chartH} Z`
  }

  const tickCount = 4
  const ticks = Array.from({ length: tickCount }, (_, i) => minV + ((maxV - minV) * i) / (tickCount - 1))
  const tooltipFill = isGbMode ? '#0b1e14' : '#ffffff'

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="finGradRev" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.color.brand[600]} stopOpacity={isGbMode ? 0.28 : 0.18} />
          <stop offset="100%" stopColor={t.color.brand[600]} stopOpacity={0.02} />
        </linearGradient>
        <linearGradient id="finGradExp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.color.feedback.error.solid} stopOpacity={isGbMode ? 0.20 : 0.12} />
          <stop offset="100%" stopColor={t.color.feedback.error.solid} stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {ticks.map((tick, i) => {
        const y = yOf(tick)
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y}
              stroke={colors.border.default as string} strokeWidth={0.5} strokeDasharray="3,3" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9}
              fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
              {tick >= 1000000 ? `${(tick / 1000000).toFixed(1)}M` : `${(tick / 1000).toFixed(0)}K`}
            </text>
          </g>
        )
      })}

      {monthLabels.map((label, i) => (
        <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fontSize={9}
          fill={hovIdx === i ? (colors.fg.default as string) : (colors.fg.subtle as string)}
          fontFamily={t.font.family.sans} fontWeight={hovIdx === i ? 600 : 400}>
          {label}
        </text>
      ))}

      <path d={closedPath(revenueData)} fill="url(#finGradRev)" />
      <path d={closedPath(expenseData)} fill="url(#finGradExp)" />
      <path d={bezier(revenueData)} fill="none" stroke={t.color.brand[600]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={bezier(expenseData)} fill="none" stroke={t.color.feedback.error.solid} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {revenueData.map((v, i) => (
        <circle key={`r${i}`} cx={xOf(i)} cy={yOf(v)} r={hovIdx === i ? 5 : 3}
          fill={hovIdx === i ? t.color.brand[600] : '#fff'}
          stroke={t.color.brand[600]} strokeWidth={1.5}
          style={{ cursor: 'pointer', transition: 'r 0.12s ease' }}
          onMouseEnter={() => setHovIdx(i)} onMouseLeave={() => setHovIdx(null)} />
      ))}
      {expenseData.map((v, i) => (
        <circle key={`e${i}`} cx={xOf(i)} cy={yOf(v)} r={hovIdx === i ? 5 : 3}
          fill={hovIdx === i ? t.color.feedback.error.solid : '#fff'}
          stroke={t.color.feedback.error.solid} strokeWidth={1.5}
          style={{ cursor: 'pointer', transition: 'r 0.12s ease' }}
          onMouseEnter={() => setHovIdx(i)} onMouseLeave={() => setHovIdx(null)} />
      ))}

      {hovIdx !== null && (
        <g>
          <rect x={Math.min(xOf(hovIdx) - 4, W - padR - 110)} y={padT} width={108} height={46}
            rx={t.radius.base} fill={tooltipFill} stroke={colors.border.default as string} strokeWidth={0.8} />
          <text x={Math.min(xOf(hovIdx) - 4, W - padR - 110) + 8} y={padT + 14}
            fontSize={9} fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
            {monthLabels[hovIdx]}
          </text>
          <text x={Math.min(xOf(hovIdx) - 4, W - padR - 110) + 8} y={padT + 27}
            fontSize={9} fill={t.color.brand[600]} fontFamily={t.font.family.sans} fontWeight={600}>
            Rec: R$ {(revenueData[hovIdx] / 1000).toFixed(0)}K
          </text>
          <text x={Math.min(xOf(hovIdx) - 4, W - padR - 110) + 8} y={padT + 39}
            fontSize={9} fill={t.color.feedback.error.solid} fontFamily={t.font.family.sans} fontWeight={600}>
            Desp: R$ {(expenseData[hovIdx] / 1000).toFixed(0)}K
          </text>
        </g>
      )}
    </svg>
  )
}

// ─── Arc Gauge ────────────────────────────────────────────────────────────────

function ArcGauge({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [segHov, setSegHov] = useState<number | null>(null)
  const fillPct = 0.68
  const W = 260; const H = 160; const cx = W / 2; const cy = H - 20; const r = 100; const sw = 18

  const describeArc = (startAngle: number, endAngle: number) => {
    const toRad = (a: number) => ((a - 90) * Math.PI) / 180
    const sx = cx + r * Math.cos(toRad(startAngle)); const sy = cy + r * Math.sin(toRad(startAngle))
    const ex = cx + r * Math.cos(toRad(endAngle)); const ey = cy + r * Math.sin(toRad(endAngle))
    return `M ${sx},${sy} A ${r},${r} 0 ${endAngle - startAngle > 180 ? 1 : 0},1 ${ex},${ey}`
  }

  const startAng = -90
  const segments = [
    { label: 'Realizado', pct: 0.68, color: t.color.brand[600] },
    { label: 'Previsto',  pct: 0.20, color: t.color.brand[200] },
    { label: 'Atrasado',  pct: 0.12, color: t.color.feedback.error.solid },
  ]

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <path d={describeArc(startAng, startAng + 180)} fill="none"
          stroke={isGbMode ? 'rgba(255,255,255,0.08)' : t.color.neutral[100]} strokeWidth={sw} strokeLinecap="round" />
        <path d={describeArc(startAng, startAng + fillPct * 180)} fill="none"
          stroke={t.color.brand[600]} strokeWidth={sw} strokeLinecap="round" />
        <text x={cx} y={cy - 14} textAnchor="middle" fontSize={22} fontWeight={700}
          fill={isGbMode ? t.color.gb.accent : colors.fg.default as string} fontFamily={t.font.family.sans}>
          68%
        </text>
        <text x={cx} y={cy} textAnchor="middle" fontSize={10}
          fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
          R$ 6,12M / R$ 9,0M
        </text>
      </svg>
      <div style={{ display: 'flex', gap: t.space[3], justifyContent: 'center', marginTop: t.space[2] }}>
        {[{ label: 'Realizado', color: t.color.brand[600] }, { label: 'Disponível', color: t.color.neutral[300] }].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
            <div style={{ width: 8, height: 8, borderRadius: t.radius.full, background: item.color }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', height: 10, borderRadius: t.radius.full, overflow: 'hidden', marginTop: t.space[3] }}>
        {segments.map((seg, i) => (
          <div key={i} onMouseEnter={() => setSegHov(i)} onMouseLeave={() => setSegHov(null)}
            title={`${seg.label}: ${(seg.pct * 100).toFixed(0)}%`}
            style={{ flex: seg.pct, background: seg.color, opacity: segHov !== null && segHov !== i ? 0.3 : 1, transition: 'opacity 0.18s ease', cursor: 'pointer' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: t.space[2] }}>
        {segments.map((seg, i) => (
          <span key={i} style={{ fontSize: t.font.size.xs, color: seg.color, fontFamily: t.font.family.sans, fontWeight: t.font.weight.medium }}>
            {seg.label} {(seg.pct * 100).toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ colors }: { colors: ReturnType<typeof useTheme>['colors'] }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  const W = 160; const H = 160; const cx = W / 2; const cy = H / 2; const r = 62; const inner = 38

  let cum = 0
  const slices = donutData.map(d => {
    const start = cum; cum += d.pct / 100
    return { ...d, start, end: cum }
  })

  const descSlice = (start: number, end: number) => {
    const toRad = (p: number) => p * 2 * Math.PI - Math.PI / 2
    const sx = cx + r * Math.cos(toRad(start)); const sy = cy + r * Math.sin(toRad(start))
    const ex = cx + r * Math.cos(toRad(end)); const ey = cy + r * Math.sin(toRad(end))
    const ix = cx + inner * Math.cos(toRad(end)); const iy = cy + inner * Math.sin(toRad(end))
    const jx = cx + inner * Math.cos(toRad(start)); const jy = cy + inner * Math.sin(toRad(start))
    const large = end - start > 0.5 ? 1 : 0
    return `M ${sx},${sy} A ${r},${r} 0 ${large},1 ${ex},${ey} L ${ix},${iy} A ${inner},${inner} 0 ${large},0 ${jx},${jy} Z`
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.space[4] }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={descSlice(s.start, s.end)} fill={s.color}
            opacity={hovIdx !== null && hovIdx !== i ? 0.3 : 1}
            style={{ cursor: 'pointer', transition: 'opacity 0.18s ease' }}
            onMouseEnter={() => setHovIdx(i)} onMouseLeave={() => setHovIdx(null)} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={12} fontWeight={700}
          fill={colors.fg.default as string} fontFamily={t.font.family.sans}>
          {hovIdx !== null ? `${donutData[hovIdx].pct}%` : '100%'}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9}
          fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
          {hovIdx !== null ? donutData[hovIdx].label : 'Total'}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
        {donutData.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.muted as string, fontFamily: t.font.family.sans }}>
              {d.label}
            </span>
            <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.fg.default as string, fontFamily: t.font.family.sans, marginLeft: 'auto' }}>
              {d.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Vencimentos List ─────────────────────────────────────────────────────────

function VencimentosList({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
      {vencimentos.map((item, i) => {
        const isAtrasado = item.status === 'Atrasado'
        return (
          <div key={i}
            onMouseEnter={() => setHovIdx(i)} onMouseLeave={() => setHovIdx(null)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: `${t.space[2]}px ${t.space[2]}px`,
              borderRadius: t.radius.base,
              background: hovIdx === i ? (isGbMode ? 'rgba(255,255,255,0.05)' : t.color.neutral[50]) : 'transparent',
              transition: 'background 0.15s ease', cursor: 'default',
            }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.fg.default as string, fontFamily: t.font.family.sans }}>
                {item.nome}
              </div>
              <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
                Vence {item.data}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
              <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default as string, fontFamily: t.font.family.sans }}>
                {item.valor}
              </span>
              <span style={{
                fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
                color: isAtrasado ? t.color.feedback.error.text : t.color.feedback.warning.text,
                background: isAtrasado ? t.color.feedback.error.bg : t.color.feedback.warning.bg,
                borderRadius: t.radius.full, padding: `2px ${t.space[2]}px`, fontFamily: t.font.family.sans,
              }}>
                {item.status}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── DashFinanceiro ───────────────────────────────────────────────────────────

export default function DashFinanceiro() {
  const { colors, isGbMode } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const bc = colors.border.default as string

  const cardStyle: React.CSSProperties = {
    margin: `${t.space[5]}px ${t.space[6]}px`,
    display: 'flex',
    flexDirection: 'column',
    background: colors.bg.surface,
    borderRadius: t.radius['2xl'],
    border: `1px solid ${bc}`,
    boxShadow: isGbMode ? t.shadow.cardDark : t.shadow.card,
    overflow: 'hidden',
    fontFamily: t.font.family.sans,
  }

  if (isLoading) {
    return (
      <div style={cardStyle}>
        <Skeleton height={600} />
      </div>
    )
  }

  const kpis = [
    { label: 'Receitas do Mês',  value: 'R$ 892.450', trend: '12,4% vs mês ant.', up: true  },
    { label: 'Despesas do Mês',  value: 'R$ 634.120', trend: '3,1% vs mês ant.',  up: false },
    { label: 'Saldo Disponível', value: 'R$ 258.330', trend: '28,7% vs mês ant.', up: true  },
    { label: 'Inadimplência',    value: 'R$ 45.200',  trend: '5,2% vs mês ant.',  up: false },
  ]

  return (
    <div style={cardStyle}>

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${t.space[4]}px ${t.space[5]}px`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          <BarChart2 size={13} color={colors.fg.subtle as string} />
          <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default as string }}>
            Financeiro
          </span>
        </div>
        <Button variant="secondary" size="sm" iconRight={<ChevronDown size={11} />}>
          Últimos 12 meses
        </Button>
      </div>

      <HDivider color={bc} />

      {/* ── KPI row ────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex' }}>
        {kpis.flatMap((kpi, i) => [
          i > 0 ? <VDivider key={`d${i}`} color={bc} /> : null,
          <div key={kpi.label} style={{ flex: 1, padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px` }}>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[1] }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default as string, lineHeight: 1.1, marginBottom: t.space[2] }}>
              {kpi.value}
            </div>
            <Trend value={kpi.trend} up={kpi.up} />
          </div>,
        ])}
      </div>

      <HDivider color={bc} />

      {/* ── Chart row: Area (2/3) + Donut (1/3) ──────────────────────────────── */}
      <div style={{ display: 'flex' }}>

        {/* Area chart */}
        <div style={{ flex: 2, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: t.space[3] }}>
            <div>
              <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default as string, lineHeight: 1 }}>
                R$ 892K
              </div>
              <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginTop: t.space[1] }}>
                Receitas vs Despesas — 12 meses
              </div>
            </div>
            <div style={{ display: 'flex', gap: t.space[4] }}>
              {[{ color: t.color.brand[600], label: 'Receitas' }, { color: t.color.feedback.error.solid, label: 'Despesas' }].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 2, borderRadius: 1, background: s.color, display: 'inline-block' }} />
                  <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <AreaChartRD colors={colors} isGbMode={isGbMode} />
        </div>

        <VDivider color={bc} />

        {/* Donut + Gauge stacked */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: `${t.space[5]}px` }}>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[3] }}>
              Despesas por Categoria
            </div>
            <DonutChart colors={colors} />
          </div>
          <HDivider color={bc} />
          <div style={{ padding: `${t.space[5]}px` }}>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[2] }}>
              Orçamento Anual
            </div>
            <ArcGauge colors={colors} isGbMode={isGbMode} />
          </div>
        </div>
      </div>

      <HDivider color={bc} />

      {/* ── Bottom row: Heatmap (1/2) + Vencimentos (1/2) ────────────────────── */}
      <div style={{ display: 'flex' }}>

        {/* Heatmap */}
        <div style={{ flex: 1, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <BarChart2 size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string }}>
              Atividade de Receita por Hora
            </span>
          </div>
          <HeatmapChart
            data={heatmapData}
            rowLabels={heatmapRows}
            colLabels={heatmapCols}
            colors={colors}
            isGbMode={isGbMode}
          />
        </div>

        <VDivider color={bc} />

        {/* Vencimentos */}
        <div style={{ flex: 1, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <Clock size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string }}>
              Vencimentos Próximos — 30 dias
            </span>
          </div>
          <VencimentosList colors={colors} isGbMode={isGbMode} />
        </div>

      </div>
    </div>
  )
}
