import { useEffect, useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { LineChart } from '../../components/ui/LineChart'
import { ChartLegend } from '../../components/ui/ChartLegend'
import { DashboardFilters } from '../../components/ui/DashboardFilters'
import { DashboardAnalysis } from '../../components/ui/DashboardAnalysis'
import { FocusableChartCard } from '../../components/ui/FocusableChartCard'
import type { DashboardReadingInput } from '../../insights/dashboardReading'
import {
  DashboardGrid,
  DashboardHeader,
  DashboardRow,
  DashboardCard,
  DashboardKpiCard,
  DashboardSkeleton,
} from '../../components/ui/DashboardGrid'
import { useDelayedLoading } from '../../hooks/useDelayedLoading'
import { useUrlFilter } from '../../hooks/useUrlFilter'

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
    ? `R$ ${(v / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`
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
                ? (isGbMode ? t.color.state.row.hoverGb : t.color.state.row.hover)
                : 'transparent',
              transition: `background ${t.transition.base}`,
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
            <div style={{ height: 8, background: isGbMode ? t.color.state.track.gb : t.color.state.track.base, borderRadius: t.radius.full, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pct * 100}%`,
                  background: i === 0 ? t.color.brand[600] : i === 1 ? t.color.brand[500] : i === 2 ? t.color.brand[400] : t.color.brand[300],
                  borderRadius: t.radius.full,
                  transition: `opacity ${t.transition.smooth}`,
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
  { label: 'Total de entradas', value: 'R$ 1.247.830', trend: '18,3%', up: true  },
  { label: 'Total de saídas',   value: 'R$ 984.220',   trend: '7,4%',  up: false },
  { label: 'Saldo do período',  value: 'R$ 263.610',   trend: '22,1%', up: true  },
  { label: 'Saldo anterior',    value: 'R$ 412.800',   trend: null,    up: true  },
]

export default function DashLivroCaixa() {
  const { colors, isGbMode } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [periodo, setPeriodo] = useUrlFilter('periodo', '12')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const showSkeleton = useDelayedLoading(isLoading)

  if (isLoading) {
    // Anti-flash: espera curta não pisca a casca; anti-flicker: uma vez
    // visível, ela fica o mínimo de `t.delay.loadingMin`.
    return showSkeleton ? <DashboardSkeleton kpis={4} blocks={[t.size.chart.md, t.size.chart.lg]} /> : null
  }

  // Dados filtrados: período fatia os últimos N meses das séries mensais
  const nMeses = Number(periodo)
  const labels = monthLabels.slice(-nMeses)
  const fluxoSeriesFiltrado = fluxoSeries.map((s) => ({ ...s, data: s.data.slice(-nMeses) }))

  const analise: DashboardReadingInput = {
    title: 'Livro Caixa',
    scope: `contas da fazenda · últimos ${nMeses} meses`,
    kpis: LC_KPIS,
    blocks: [
      {
        block: 'Fluxo de caixa realizado',
        kind: 'timeline',
        labels,
        series: fluxoSeriesFiltrado.map((s) => ({ name: s.name, data: s.data })),
        currency: true,
      },
      {
        block: 'Saldo por conta',
        kind: 'composition',
        labels: contas.map((c) => c.nome),
        series: [{ name: 'Saldo', data: contas.map((c) => c.saldo) }],
        currency: true,
      },
    ],
  }

  return (
    <DashboardGrid>
      <DashboardHeader
        title="Livro Caixa"
        subtitle="Entradas, saídas e saldo das contas da fazenda"
        actions={
          <>
            <DashboardAnalysis input={analise} fonte="base do painel" />
            <DashboardFilters
              fields={[
                {
                  label: 'Período',
                  value: periodo,
                  onChange: setPeriodo,
                  defaultValue: '12',
                  options: [
                    { value: '3',  label: 'Últimos 3 meses' },
                    { value: '6',  label: 'Últimos 6 meses' },
                    { value: '12', label: 'Últimos 12 meses' },
                  ],
                },
              ]}
            />
          </>
        }
      />

      {/* Fileira 1 — KPIs */}
      <DashboardRow>
        {LC_KPIS.map((kpi) => (
          <DashboardKpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            up={kpi.up}
          />
        ))}
      </DashboardRow>

      {/* Fileira 2 — Fluxo de caixa */}
      <FocusableChartCard
        title="Fluxo de caixa realizado"
        series={fluxoSeriesFiltrado}
        action={(series) => (
          <ChartLegend
            marker="line"
            items={series.map((serie) => ({
              label: serie.name,
              color: serie.color,
              dashed: serie.name === 'Saldo',
            }))}
          />
        )}
      >
        {(series) => (
          <LineChart
            series={series}
            labels={labels}
            height={t.size.chart.md}
            yFormat={fluxoYFormat}
            area
            showLegend={false}
          />
        )}
      </FocusableChartCard>

      {/* Fileira 3 — Movimentações + Saldo por Conta */}
      <DashboardRow>
        <DashboardCard title="Últimas movimentações" flex={3}>
          <MovimentacoesTabela colors={colors} isGbMode={isGbMode} />
        </DashboardCard>
        <DashboardCard title="Saldo por conta" flex={2}>
          <SaldoPorConta colors={colors} isGbMode={isGbMode} />
        </DashboardCard>
      </DashboardRow>
    </DashboardGrid>
  )
}
