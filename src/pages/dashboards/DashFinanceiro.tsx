import { useEffect, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  BarChart2,
  Target,
  Clock,
  PieChart,
} from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { KpiStatCard } from '../../components/ui/KpiStatCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { Skeleton } from '../../components/ui/Skeleton'

// ─── Mock data ────────────────────────────────────────────────────────────────

const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const revenueData = [640000, 720000, 680000, 810000, 750000, 870000, 820000, 890000, 760000, 830000, 900000, 892450]
const expenseData = [420000, 510000, 480000, 560000, 530000, 610000, 580000, 650000, 590000, 620000, 700000, 634120]

const vencimentos = [
  { nome: 'Fornecedor AgriMax', valor: 'R$ 28.400', data: '03/06/2026', status: 'Pendente' },
  { nome: 'Locação Maquinário', valor: 'R$ 12.750', data: '05/06/2026', status: 'Pendente' },
  { nome: 'Cooperativa Sementes', valor: 'R$ 8.900', data: '01/06/2026', status: 'Atrasado' },
  { nome: 'Energia Elétrica', valor: 'R$ 3.200', data: '07/06/2026', status: 'Pendente' },
  { nome: 'Consultoria Técnica', valor: 'R$ 5.600', data: '28/05/2026', status: 'Atrasado' },
]

const donutData = [
  { label: 'Suprimentos', pct: 35, color: t.color.brand[600] },
  { label: 'RH', pct: 25, color: t.color.info.solid },
  { label: 'Frota', pct: 18, color: t.color.notification },
  { label: 'Impostos', pct: 14, color: t.color.error.solid },
  { label: 'Outros', pct: 8, color: t.color.neutral[400] },
]

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

  const bezier = (data: number[]) => {
    return data.map((v, i) => {
      const x = xOf(i)
      const y = yOf(v)
      if (i === 0) return `M ${x},${y}`
      const px = xOf(i - 1)
      const py = yOf(data[i - 1])
      const cpx = (px + x) / 2
      return `C ${cpx},${py} ${cpx},${y} ${x},${y}`
    }).join(' ')
  }

  const closedPath = (data: number[], stroke: string) => {
    const path = bezier(data)
    const last = `L ${xOf(data.length - 1)},${padT + chartH} L ${xOf(0)},${padT + chartH} Z`
    return path + ' ' + last
  }

  const tickCount = 4
  const ticks = Array.from({ length: tickCount }, (_, i) => minV + ((maxV - minV) * i) / (tickCount - 1))

  const tooltipFill = isGbMode ? '#0b1e14' : '#ffffff'
  const stroke = colors.border as string

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.color.brand[600]} stopOpacity="0.25" />
          <stop offset="100%" stopColor={t.color.brand[600]} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.color.error.solid} stopOpacity="0.18" />
          <stop offset="100%" stopColor={t.color.error.solid} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {ticks.map((tick, i) => {
        const y = yOf(tick)
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={colors.border as string} strokeWidth={0.5} strokeDasharray="3,3" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
              {tick >= 1000000 ? `${(tick / 1000000).toFixed(1)}M` : `${(tick / 1000).toFixed(0)}K`}
            </text>
          </g>
        )
      })}

      {monthLabels.map((label, i) => (
        <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fontSize={9} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
          {label}
        </text>
      ))}

      <path d={closedPath(revenueData, t.color.brand[600])} fill="url(#gradRev)" />
      <path d={closedPath(expenseData, t.color.error.solid)} fill="url(#gradExp)" />

      <path d={bezier(revenueData)} fill="none" stroke={t.color.brand[600]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={bezier(expenseData)} fill="none" stroke={t.color.error.solid} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {revenueData.map((v, i) => (
        <circle
          key={`r${i}`}
          cx={xOf(i)}
          cy={yOf(v)}
          r={hovIdx === i ? 5 : 3}
          fill={hovIdx === i ? t.color.brand[600] : '#fff'}
          stroke={t.color.brand[600]}
          strokeWidth={1.5}
          style={{ cursor: 'pointer', transition: 'r 0.12s ease' }}
          onMouseEnter={() => setHovIdx(i)}
          onMouseLeave={() => setHovIdx(null)}
        />
      ))}

      {expenseData.map((v, i) => (
        <circle
          key={`e${i}`}
          cx={xOf(i)}
          cy={yOf(v)}
          r={hovIdx === i ? 5 : 3}
          fill={hovIdx === i ? t.color.error.solid : '#fff'}
          stroke={t.color.error.solid}
          strokeWidth={1.5}
          style={{ cursor: 'pointer', transition: 'r 0.12s ease' }}
          onMouseEnter={() => setHovIdx(i)}
          onMouseLeave={() => setHovIdx(null)}
        />
      ))}

      {hovIdx !== null && (
        <g>
          <rect
            x={Math.min(xOf(hovIdx) - 4, W - padR - 110)}
            y={padT}
            width={108}
            height={46}
            rx={t.radius.DEFAULT}
            fill={tooltipFill}
            stroke={stroke}
            strokeWidth={0.8}
          />
          <text x={Math.min(xOf(hovIdx) - 4, W - padR - 110) + 8} y={padT + 14} fontSize={9} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
            {monthLabels[hovIdx]}
          </text>
          <text x={Math.min(xOf(hovIdx) - 4, W - padR - 110) + 8} y={padT + 27} fontSize={9} fill={t.color.brand[600]} fontFamily={t.font.family.sans} fontWeight={t.font.weight.semibold}>
            Rec: R$ {(revenueData[hovIdx] / 1000).toFixed(0)}K
          </text>
          <text x={Math.min(xOf(hovIdx) - 4, W - padR - 110) + 8} y={padT + 39} fontSize={9} fill={t.color.error.solid} fontFamily={t.font.family.sans} fontWeight={t.font.weight.semibold}>
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
  const pct = 0.68
  const W = 260
  const H = 160
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
    const large = endAngle - startAngle > 180 ? 1 : 0
    return `M ${sx},${sy} A ${r},${r} 0 ${large},1 ${ex},${ey}`
  }

  const totalAng = 180
  const startAng = -90
  const usedAng = startAng + pct * totalAng
  const bgPath = describeArc(startAng, startAng + totalAng)
  const fillPath = describeArc(startAng, usedAng)

  const segments = [
    { label: 'Realizado', pct: 0.68, color: t.color.brand[600] },
    { label: 'Previsto', pct: 0.20, color: t.color.brand[200] },
    { label: 'Atrasado', pct: 0.12, color: t.color.error.solid },
  ]

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <path d={bgPath} fill="none" stroke={isGbMode ? 'rgba(255,255,255,0.08)' : t.color.neutral[100]} strokeWidth={sw} strokeLinecap="round" />
        <path d={fillPath} fill="none" stroke={t.color.brand[600]} strokeWidth={sw} strokeLinecap="round" />
        <text x={cx} y={cy - 14} textAnchor="middle" fontSize={22} fontWeight={t.font.weight.bold} fill={isGbMode ? '#4ade80' : colors.textPrimary as string} fontFamily={t.font.family.sans}>
          68%
        </text>
        <text x={cx} y={cy} textAnchor="middle" fontSize={10} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
          R$ 6,12M / R$ 9,0M
        </text>
      </svg>

      <div style={{ display: 'flex', gap: t.space[3], justifyContent: 'center', marginTop: t.space[2] }}>
        {[{ label: 'Realizado', color: t.color.brand[600] }, { label: 'Disponível', color: t.color.neutral[300] }].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
            <div style={{ width: 8, height: 8, borderRadius: t.radius.full, background: item.color }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted as string, fontFamily: t.font.family.sans }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', height: 10, borderRadius: t.radius.full, overflow: 'hidden', marginTop: t.space[3], position: 'relative' }}>
        {segments.map((seg, i) => (
          <div
            key={i}
            onMouseEnter={() => setSegHov(i)}
            onMouseLeave={() => setSegHov(null)}
            title={`${seg.label}: ${(seg.pct * 100).toFixed(0)}%`}
            style={{
              flex: seg.pct,
              background: seg.color,
              opacity: segHov !== null && segHov !== i ? 0.3 : 1,
              transition: 'opacity 0.18s ease',
              cursor: 'pointer',
            }}
          />
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

// ─── Donut Chart ─────────────────────────────────────────────────────────────

function DonutChart({ colors }: { colors: ReturnType<typeof useTheme>['colors'] }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  const W = 180
  const H = 180
  const cx = W / 2
  const cy = H / 2
  const r = 70
  const inner = 44

  let cumPct = 0
  const slices = donutData.map(d => {
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
    <div style={{ display: 'flex', alignItems: 'center', gap: t.space[4] }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ flexShrink: 0 }}>
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
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={13} fontWeight={t.font.weight.bold} fill={colors.textPrimary as string} fontFamily={t.font.family.sans}>
          {hovIdx !== null ? `${donutData[hovIdx].pct}%` : '100%'}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
          {hovIdx !== null ? donutData[hovIdx].label : 'Total'}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
        {donutData.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textSecondary as string, fontFamily: t.font.family.sans }}>
              {d.label}
            </span>
            <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.textPrimary as string, fontFamily: t.font.family.sans, marginLeft: 'auto' }}>
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
          <div
            key={i}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${t.space[2]}px ${t.space[2]}px`,
              borderRadius: t.radius.DEFAULT,
              background: hovIdx === i
                ? (isGbMode ? 'rgba(255,255,255,0.05)' : t.color.neutral[50])
                : 'transparent',
              transition: 'background 0.15s ease',
              cursor: 'default',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.textPrimary as string, fontFamily: t.font.family.sans }}>
                {item.nome}
              </div>
              <div style={{ fontSize: t.font.size.xs, color: colors.textMuted as string, fontFamily: t.font.family.sans }}>
                Vence {item.data}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
              <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.textPrimary as string, fontFamily: t.font.family.sans }}>
                {item.valor}
              </span>
              <span style={{
                fontSize: t.font.size.xs,
                fontWeight: t.font.weight.medium,
                color: isAtrasado ? t.color.error.text : t.color.warning.text,
                background: isAtrasado ? t.color.error.bg : t.color.warning.bg,
                borderRadius: t.radius.full,
                padding: `2px ${t.space[2]}px`,
                fontFamily: t.font.family.sans,
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
    const t = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[6], padding: t.space[6] }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[4] }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={120} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: t.space[4] }}>
          <Skeleton height={260} />
          <Skeleton height={260} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
          <Skeleton height={260} />
          <Skeleton height={260} />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      margin: `${t.space[5]}px ${t.space[6]}px`,
      background: colors.surfaceBg,
      borderRadius: t.radius['2xl'],
      border: `1px solid ${colors.border}`,
      boxShadow: isGbMode
        ? '0 1px 2px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.35)'
        : '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.07)',
    }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[6], padding: t.space[6], fontFamily: t.font.family.sans }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[4] }}>
        <KpiStatCard
          icon={TrendingUp}
          label="Receitas do Mês"
          value="R$ 892.450"
          trend="12,4% vs mês ant."
          trendUp
          accentColor={t.color.brand[600]}
        />
        <KpiStatCard
          icon={TrendingDown}
          label="Despesas do Mês"
          value="R$ 634.120"
          trend="3,1% vs mês ant."
          trendUp={false}
          accentColor={t.color.error.text}
        />
        <KpiStatCard
          icon={DollarSign}
          label="Saldo Disponível"
          value="R$ 258.330"
          trend="28,7% vs mês ant."
          trendUp
          accentColor={t.color.brand[700]}
        />
        <KpiStatCard
          icon={AlertCircle}
          label="Inadimplência"
          value="R$ 45.200"
          trend="5,2% vs mês ant."
          trendUp={false}
          accentColor={t.color.notification}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: t.space[4] }}>
        <ChartCard icon={BarChart2} title="Receitas x Despesas — Mensal">
          <div style={{ display: 'flex', gap: t.space[4], marginBottom: t.space[3] }}>
            {[{ label: 'Receitas', color: t.color.brand[600] }, { label: 'Despesas', color: t.color.error.solid }].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
                <div style={{ width: 10, height: 3, borderRadius: 2, background: item.color }} />
                <span style={{ fontSize: t.font.size.xs, color: colors.textMuted as string }}>{item.label}</span>
              </div>
            ))}
          </div>
          <AreaChartRD colors={colors} isGbMode={isGbMode} />
        </ChartCard>

        <ChartCard icon={Target} title="Orçamento Anual">
          <ArcGauge colors={colors} isGbMode={isGbMode} />
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
        <ChartCard icon={Clock} title="Vencimentos Próximos (30 dias)">
          <VencimentosList colors={colors} isGbMode={isGbMode} />
        </ChartCard>

        <ChartCard icon={PieChart} title="Despesas por Categoria">
          <DonutChart colors={colors} />
        </ChartCard>
      </div>
    </div>
    </div>
  )
}
