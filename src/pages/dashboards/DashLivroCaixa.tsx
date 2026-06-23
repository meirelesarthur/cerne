import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { Button } from '../../components/ui/Button'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { LineChart } from '../../components/ui/LineChart'

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

// ─── Séries do Fluxo de Caixa ────────────────────────────────────────────────

const fluxoSeries = [
  { name: 'Entradas', data: entradasData, color: t.color.brand[600] },
  { name: 'Saídas',   data: saidasData,   color: t.color.feedback.error.solid },
  { name: 'Saldo',    data: saldoData,    color: t.color.neutral[500] },
]

const fluxoYFormat = (v: number) =>
  v >= 1_000_000
    ? `R$ ${(v / 1_000_000).toFixed(1)}M`
    : `R$ ${(v / 1_000).toFixed(0)}K`

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
              borderRadius: t.radius.base,
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
    boxShadow: isGbMode ? t.shadow.cardDark : t.shadow.card,
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
        <LineChart
          series={fluxoSeries}
          labels={monthLabels}
          height={220}
          yFormat={fluxoYFormat}
          area
          showLegend={false}
        />
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
