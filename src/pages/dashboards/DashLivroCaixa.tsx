import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { Button } from '../../components/ui/Button'
import { DataTable, type Column } from '../../components/ui/DataTable'

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
  Receita:      { color: t.color.feedback.success.text, bg: t.color.feedback.success.bg },
  Despesa:      { color: t.color.feedback.error.text, bg: t.color.feedback.error.bg },
  Transferência: { color: t.color.feedback.info.text, bg: t.color.feedback.info.bg },
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
    { data: saidasData, color: t.color.feedback.error.solid, label: 'Saídas', gradId: 'gradSai' },
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
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={colors.border.default as string} strokeWidth={0.5} strokeDasharray="3,3" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
              {tick >= 1000000 ? `${(tick / 1000000).toFixed(1)}M` : `${(tick / 1000).toFixed(0)}K`}
            </text>
          </g>
        )
      })}

      {monthLabels.map((label, i) => (
        <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fontSize={9} fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
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
            stroke={colors.border.default as string}
            strokeWidth={0.8}
          />
          <text x={Math.min(xOf(hovIdx) + 6, W - padR - 130) + 8} y={padT + 14} fontSize={9} fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
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

type Movimentacao = typeof movimentacoes[number]

const movimentacoesColumns: Column<Movimentacao>[] = [
  {
    key: 'data',
    label: 'Data',
    render: (row) => <span style={{ color: 'inherit', whiteSpace: 'nowrap' }}>{row.data}</span>,
  },
  {
    key: 'descricao',
    label: 'Descrição',
    render: (row) => row.descricao,
  },
  {
    key: 'tipo',
    label: 'Tipo',
    render: (row) => {
      const badge = tipoBadge[row.tipo] ?? tipoBadge['Receita']
      return (
        <span style={{
          fontSize: t.font.size.xs,
          fontWeight: t.font.weight.medium,
          color: badge.color,
          background: badge.bg,
          borderRadius: t.radius.full,
          padding: `2px ${t.space[2]}px`,
          fontFamily: t.font.family.sans,
          whiteSpace: 'nowrap',
        }}>
          {row.tipo}
        </span>
      )
    },
  },
  {
    key: 'conta',
    label: 'Conta',
    render: (row) => row.conta,
  },
  {
    key: 'valor',
    label: 'Valor',
    align: 'right',
    render: (row) => {
      const isPos = row.valor.startsWith('+')
      const isNeg = row.valor.startsWith('-')
      return (
        <span style={{
          fontWeight: t.font.weight.semibold,
          color: isPos ? t.color.feedback.success.text : isNeg ? t.color.feedback.error.text : undefined,
          whiteSpace: 'nowrap',
        }}>
          {row.valor}
        </span>
      )
    },
  },
]

function MovimentacoesTabela(_: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  return (
    <DataTable<Movimentacao>
      columns={movimentacoesColumns}
      data={movimentacoes}
      keyField="data"
    />
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
              <span style={{ fontSize: t.font.size.sm, color: colors.fg.default as string, fontFamily: t.font.family.sans, fontWeight: t.font.weight.medium }}>
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

const LC_KPIS = [
  { label: 'Total Entradas', value: 'R$ 1.247.830', trend: '18,3%', up: true  },
  { label: 'Total Saídas',   value: 'R$ 984.220',   trend: '7,4%',  up: false },
  { label: 'Saldo Período',  value: 'R$ 263.610',   trend: '22,1%', up: true  },
  { label: 'Saldo Anterior', value: 'R$ 412.800',   trend: null,    up: true  },
]

export default function DashLivroCaixa() {
  const { colors, isGbMode } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const bc = colors.border.default as string

  const cardStyle: React.CSSProperties = {
    margin: `${t.space[5]}px ${t.space[6]}px`,
    display: 'flex', flexDirection: 'column',
    background: colors.bg.surface,
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
        <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default as string }}>Livro Caixa</span>
        <Button variant="secondary" size="sm" iconRight={<ChevronDown size={11} />}>
          Últimos 30 dias
        </Button>
      </div>
      <HDivider color={bc} />

      {/* KPI row */}
      <div style={{ display: 'flex' }}>
        {LC_KPIS.flatMap((kpi, i) => [
          i > 0 ? <VDivider key={`d${i}`} color={bc} /> : null,
          <div key={kpi.label} style={{ flex: 1, padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px` }}>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[1] }}>{kpi.label}</div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default as string, lineHeight: 1.1, marginBottom: t.space[2] }}>{kpi.value}</div>
            {kpi.trend && (
              <span style={{ fontSize: t.font.size.xs, color: kpi.up ? t.color.feedback.success.text : t.color.feedback.error.text }}>{kpi.up ? '▲' : '▼'} {kpi.trend}</span>
            )}
          </div>,
        ])}
      </div>
      <HDivider color={bc} />

      {/* Row 2 — Fluxo area chart full width */}
      <div style={{ padding: t.space[5] }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[4] }}>
          <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string }}>Fluxo de Caixa — Realizado</div>
          <div style={{ display: 'flex', gap: t.space[5] }}>
            {[
              { label: 'Entradas', color: t.color.brand[600], dashed: false },
              { label: 'Saídas',   color: t.color.feedback.error.solid, dashed: false },
              { label: 'Saldo',    color: t.color.neutral[500], dashed: true },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
                <svg width={16} height={4} style={{ display: 'block' }}>
                  <line x1={0} y1={2} x2={16} y2={2} stroke={item.color} strokeWidth={2} strokeDasharray={item.dashed ? '4,3' : undefined} strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <FluxoAreaChart colors={colors} isGbMode={isGbMode} />
      </div>
      <HDivider color={bc} />

      {/* Row 3 — Movimentações + Saldo por Conta */}
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 3, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[4] }}>Últimas Movimentações</div>
          <MovimentacoesTabela colors={colors} isGbMode={isGbMode} />
        </div>
        <VDivider color={bc} />
        <div style={{ flex: 2, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[4] }}>Saldo por Conta</div>
          <SaldoPorConta colors={colors} isGbMode={isGbMode} />
        </div>
      </div>
    </div>
  )
}
