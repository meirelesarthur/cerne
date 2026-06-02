import { useEffect, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  History,
  TrendingUp,
  List,
  Building2,
} from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { KpiStatCard } from '../../components/ui/KpiStatCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { Skeleton } from '../../components/ui/Skeleton'

// ─── Mock data ────────────────────────────────────────────────────────────────

const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const entradasData = [820000, 940000, 890000, 1050000, 980000, 1120000, 1070000, 1200000, 1060000, 1130000, 1190000, 1247830]
const saidasData   = [680000, 790000, 740000, 860000, 820000, 940000, 890000, 1010000, 880000, 920000, 1050000, 984220]
const saldoData    = entradasData.map((e, i) => e - saidasData[i])

const movimentacoes = [
  { data: '31/05/2026', descricao: 'Venda Soja — Lote 14', tipo: 'Receita', conta: 'BB CC', valor: '+R$ 184.200' },
  { data: '30/05/2026', descricao: 'Fertilizantes AgriMax', tipo: 'Despesa', conta: 'Itaú CC', valor: '-R$ 42.800' },
  { data: '29/05/2026', descricao: 'Transferência Fazenda', tipo: 'Transferência', conta: 'Caixinha', valor: 'R$ 15.000' },
  { data: '28/05/2026', descricao: 'Aluguel Maquinário', tipo: 'Despesa', conta: 'BB CC', valor: '-R$ 28.400' },
  { data: '27/05/2026', descricao: 'Venda Milho — Lote 8', tipo: 'Receita', conta: 'Itaú CC', valor: '+R$ 96.500' },
  { data: '26/05/2026', descricao: 'Folha de Pagamento', tipo: 'Despesa', conta: 'BB CC', valor: '-R$ 74.300' },
  { data: '25/05/2026', descricao: 'Subvenção PRONAF', tipo: 'Receita', conta: 'Caixa Fazenda', valor: '+R$ 32.000' },
  { data: '24/05/2026', descricao: 'Combustível Frota', tipo: 'Despesa', conta: 'Caixa Fazenda', valor: '-R$ 11.200' },
]

const contas = [
  { nome: 'Banco do Brasil CC', saldo: 412800, maxSaldo: 700000 },
  { nome: 'Itaú CC', saldo: 287500, maxSaldo: 700000 },
  { nome: 'Caixa Fazenda', saldo: 198700, maxSaldo: 700000 },
  { nome: 'Caixinha', saldo: 84610, maxSaldo: 700000 },
]

const tipoBadge: Record<string, { color: string; bg: string }> = {
  Receita:      { color: t.color.success.text, bg: t.color.success.bg },
  Despesa:      { color: t.color.error.text, bg: t.color.error.bg },
  Transferência: { color: t.color.info.text, bg: t.color.info.bg },
}

// ─── Area Chart (Fluxo de Caixa) ─────────────────────────────────────────────

function FluxoAreaChart({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  const W = 760
  const H = 220
  const padL = 54
  const padR = 16
  const padT = 16
  const padB = 32
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const allVals = [...entradasData, ...saidasData, ...saldoData]
  const minV = Math.min(...allVals) * 0.85
  const maxV = Math.max(...allVals) * 1.08

  const xOf = (i: number) => padL + (i / (entradasData.length - 1)) * chartW
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

  const closedBez = (data: number[]) => {
    return bezier(data) + ` L ${xOf(data.length - 1)},${padT + chartH} L ${xOf(0)},${padT + chartH} Z`
  }

  const tickCount = 4
  const ticks = Array.from({ length: tickCount }, (_, i) => minV + ((maxV - minV) * i) / (tickCount - 1))
  const tooltipFill = isGbMode ? '#0b1e14' : '#ffffff'

  const series = [
    { data: entradasData, color: t.color.brand[600], label: 'Entradas', gradId: 'gradEnt' },
    { data: saidasData, color: t.color.error.solid, label: 'Saídas', gradId: 'gradSai' },
    { data: saldoData, color: t.color.neutral[500], label: 'Saldo', gradId: 'gradSal', dashed: true },
  ]

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        {series.map(s => (
          <linearGradient key={s.gradId} id={s.gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.20" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0.01" />
          </linearGradient>
        ))}
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

      {series.map(s => (
        <path key={s.gradId + 'fill'} d={closedBez(s.data)} fill={`url(#${s.gradId})`} />
      ))}

      {series.map(s => (
        <path
          key={s.gradId + 'line'}
          d={bezier(s.data)}
          fill="none"
          stroke={s.color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={s.dashed ? '5,4' : undefined}
        />
      ))}

      {series.map(s =>
        s.data.map((v, i) => (
          <circle
            key={`${s.gradId}-pt-${i}`}
            cx={xOf(i)}
            cy={yOf(v)}
            r={hovIdx === i ? 5 : 3}
            fill={hovIdx === i ? s.color : '#fff'}
            stroke={s.color}
            strokeWidth={1.5}
            style={{ cursor: 'pointer', transition: 'r 0.12s ease' }}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
          />
        ))
      )}

      {hovIdx !== null && (
        <g>
          <rect
            x={Math.min(xOf(hovIdx) + 6, W - padR - 130)}
            y={padT}
            width={122}
            height={58}
            rx={t.radius.DEFAULT}
            fill={tooltipFill}
            stroke={colors.border as string}
            strokeWidth={0.8}
          />
          <text x={Math.min(xOf(hovIdx) + 6, W - padR - 130) + 8} y={padT + 14} fontSize={9} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
            {monthLabels[hovIdx]}
          </text>
          {series.map((s, si) => (
            <text
              key={si}
              x={Math.min(xOf(hovIdx) + 6, W - padR - 130) + 8}
              y={padT + 14 + (si + 1) * 14}
              fontSize={9}
              fill={s.color}
              fontFamily={t.font.family.sans}
              fontWeight={t.font.weight.semibold}
            >
              {s.label}: R$ {(s.data[hovIdx] / 1000).toFixed(0)}K
            </text>
          ))}
        </g>
      )}
    </svg>
  )
}

// ─── Tabela de Movimentações ──────────────────────────────────────────────────

function MovimentacoesTabela({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)

  const headerStyle: React.CSSProperties = {
    fontSize: t.font.size.xs,
    fontWeight: t.font.weight.semibold,
    color: colors.textMuted as string,
    fontFamily: t.font.family.sans,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: `${t.space[1]}px ${t.space[2]}px`,
    textAlign: 'left',
  }

  const cellStyle: React.CSSProperties = {
    fontSize: t.font.size.sm,
    color: colors.textPrimary as string,
    fontFamily: t.font.family.sans,
    padding: `${t.space[2]}px ${t.space[2]}px`,
    whiteSpace: 'nowrap' as const,
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
            {['Data', 'Descrição', 'Tipo', 'Conta', 'Valor'].map(col => (
              <th key={col} style={headerStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {movimentacoes.map((row, i) => {
            const badge = tipoBadge[row.tipo] ?? tipoBadge['Receita']
            const isPos = row.valor.startsWith('+')
            const isNeg = row.valor.startsWith('-')
            return (
              <tr
                key={i}
                onMouseEnter={() => setHovIdx(i)}
                onMouseLeave={() => setHovIdx(null)}
                style={{
                  background: hovIdx === i
                    ? (isGbMode ? 'rgba(255,255,255,0.04)' : t.color.neutral[50])
                    : 'transparent',
                  transition: 'background 0.15s ease',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <td style={{ ...cellStyle, color: colors.textMuted as string }}>{row.data}</td>
                <td style={cellStyle}>{row.descricao}</td>
                <td style={cellStyle}>
                  <span style={{
                    fontSize: t.font.size.xs,
                    fontWeight: t.font.weight.medium,
                    color: badge.color,
                    background: badge.bg,
                    borderRadius: t.radius.full,
                    padding: `2px ${t.space[2]}px`,
                    fontFamily: t.font.family.sans,
                  }}>
                    {row.tipo}
                  </span>
                </td>
                <td style={{ ...cellStyle, color: colors.textSecondary as string }}>{row.conta}</td>
                <td style={{
                  ...cellStyle,
                  fontWeight: t.font.weight.semibold,
                  color: isPos ? t.color.success.text : isNeg ? t.color.error.text : (colors.textPrimary as string),
                  textAlign: 'right',
                }}>
                  {row.valor}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Saldo por Conta ──────────────────────────────────────────────────────────

function SaldoPorConta({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  const maxSaldo = Math.max(...contas.map(c => c.saldo))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4] }}>
      {contas.map((conta, i) => {
        const pct = conta.saldo / maxSaldo
        return (
          <div
            key={i}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
            style={{
              padding: `${t.space[2]}px ${t.space[2]}px`,
              borderRadius: t.radius.DEFAULT,
              background: hovIdx === i
                ? (isGbMode ? 'rgba(255,255,255,0.04)' : t.color.neutral[50])
                : 'transparent',
              transition: 'background 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: t.space[1] }}>
              <span style={{ fontSize: t.font.size.sm, color: colors.textPrimary as string, fontFamily: t.font.family.sans, fontWeight: t.font.weight.medium }}>
                {conta.nome}
              </span>
              <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.bold, color: t.color.brand[600], fontFamily: t.font.family.sans }}>
                R$ {conta.saldo.toLocaleString('pt-BR')}
              </span>
            </div>
            <div style={{ height: 8, background: isGbMode ? 'rgba(255,255,255,0.08)' : t.color.neutral[100], borderRadius: t.radius.full, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pct * 100}%`,
                  background: i === 0 ? t.color.brand[600] : i === 1 ? t.color.brand[500] : i === 2 ? t.color.brand[400] : t.color.brand[300],
                  borderRadius: t.radius.full,
                  transition: 'opacity 0.18s ease',
                  opacity: hovIdx !== null && hovIdx !== i ? 0.35 : 1,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── DashLivroCaixa ───────────────────────────────────────────────────────────

export default function DashLivroCaixa() {
  const { colors, isGbMode } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[6], padding: t.space[6] }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[4] }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={120} />)}
        </div>
        <Skeleton height={280} />
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: t.space[4] }}>
          <Skeleton height={300} />
          <Skeleton height={300} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[6], padding: t.space[6], fontFamily: t.font.family.sans }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[4] }}>
        <KpiStatCard
          icon={ArrowDownLeft}
          label="Total Entradas"
          value="R$ 1.247.830"
          trend="18,3% vs mês ant."
          trendUp
          accentColor={t.color.brand[600]}
        />
        <KpiStatCard
          icon={ArrowUpRight}
          label="Total Saídas"
          value="R$ 984.220"
          trend="7,4% vs mês ant."
          trendUp={false}
          accentColor={t.color.error.text}
        />
        <KpiStatCard
          icon={Wallet}
          label="Saldo Período"
          value="R$ 263.610"
          trend="22,1% vs mês ant."
          trendUp
          accentColor={t.color.brand[700]}
        />
        <KpiStatCard
          icon={History}
          label="Saldo Anterior"
          value="R$ 412.800"
          accentColor={t.color.neutral[500]}
        />
      </div>

      <ChartCard icon={TrendingUp} title="Fluxo de Caixa — Realizado">
        <div style={{ display: 'flex', gap: t.space[5], marginBottom: t.space[3] }}>
          {[
            { label: 'Entradas', color: t.color.brand[600], dashed: false },
            { label: 'Saídas', color: t.color.error.solid, dashed: false },
            { label: 'Saldo', color: t.color.neutral[500], dashed: true },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
              <svg width={16} height={4} style={{ display: 'block' }}>
                <line
                  x1={0} y1={2} x2={16} y2={2}
                  stroke={item.color}
                  strokeWidth={2}
                  strokeDasharray={item.dashed ? '4,3' : undefined}
                  strokeLinecap="round"
                />
              </svg>
              <span style={{ fontSize: t.font.size.xs, color: colors.textMuted as string }}>{item.label}</span>
            </div>
          ))}
        </div>
        <FluxoAreaChart colors={colors} isGbMode={isGbMode} />
      </ChartCard>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: t.space[4] }}>
        <ChartCard icon={List} title="Últimas Movimentações">
          <MovimentacoesTabela colors={colors} isGbMode={isGbMode} />
        </ChartCard>

        <ChartCard icon={Building2} title="Saldo por Conta">
          <SaldoPorConta colors={colors} isGbMode={isGbMode} />
        </ChartCard>
      </div>
    </div>
  )
}
