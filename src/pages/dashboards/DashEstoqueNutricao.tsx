// TODO (backend):
// - Unificar nomenclatura de permissão: `nutrition_dashboard_view` (singular) vs módulo `nutritions` (plural) — canonizar antes de implementar RBAC
// - Contrato único de UM/conversão: `factor_type` M (divide) vs D (multiplica) — definir enum e documentar no schema
// - Alinhar agregação: listagem usa `quantity`; relatório usa `quantity_kg` / `average_cost` / `total_cost` / `average_consumption` — unificar campo por endpoint
// - Reduzir múltiplos endpoints AJAX (saldo, consumo, cobertura, armazéns) a um contrato coeso: `/nutrition/stock/summary?period=&product=&warehouse=`
// - Processar arquivos diferidos (Lei 8): importações de NF/XML de entrada de estoque em fila assíncrona; expor status via polling ou WebSocket

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { SparklineArea } from '../../components/ui/SparklineArea'
import { FilterSelect } from '../../components/ui/FilterSelect'
import { BarChart } from '../../components/ui/BarChart'
import { LineChart } from '../../components/ui/LineChart'
import {
  DashboardGrid,
  DashboardHeader,
  DashboardRow,
  DashboardCard,
  DashboardKpiCard,
  DashboardSkeleton,
} from '../../components/ui/DashboardGrid'
import { useUrlFilter } from '../../hooks/useUrlFilter'

// ─── Mock data ────────────────────────────────────────────────────────────────

// KPI sparklines (últimas 7 semanas)
const kpiSparklines: Record<string, number[]> = {
  'Saldo total': [142000, 138500, 151200, 147800, 155000, 149300, 157600],
  'Consumo médio diário': [3820, 3940, 3870, 4010, 3950, 4080, 4120],
}

// Gráfico 1 — Saldo de estoque por armazém (kg)
const mockSaldoArmazem = [
  { label: 'Armazém A', value: 48200, color: t.chart.series[0] },
  { label: 'Armazém B', value: 36700, color: t.chart.series[1] },
  { label: 'Armazém C', value: 29100, color: t.chart.series[2] },
  { label: 'Armazém D', value: 24600, color: t.chart.series[3] },
  { label: 'Silo Ext.', value: 19000, color: t.chart.series[4] },
]

// Gráfico 2 — Evolução de consumo de ração (kg/semana, 2 séries)
const mockConsumoLabels = ['Jan W1', 'Jan W2', 'Jan W3', 'Feb W1', 'Feb W2', 'Feb W3', 'Mar W1', 'Mar W2']
const mockConsumoSeries = [
  {
    name: 'Ração Terminação',
    data: [26800, 27400, 28100, 27600, 29200, 28700, 30100, 29600],
    color: t.chart.series[0],
  },
  {
    name: 'Ração Crescimento',
    data: [18200, 18700, 19100, 18400, 19800, 19200, 20400, 19900],
    color: t.chart.series[2],
  },
]

// Gráfico 3 — Cobertura de estoque por produto (dias restantes), ordenado desc
// Itens com cobertura ≤ 14 dias recebem cor crítica
const CRITICO_THRESHOLD = 14
const mockCoberturaProdutos = [
  { label: 'Milho Moído',       value: 62, color: t.chart.series[0] },
  { label: 'Farelo de Soja',    value: 48, color: t.chart.series[1] },
  { label: 'Núcleo Mineral',    value: 35, color: t.chart.series[2] },
  { label: 'Uréia Pecuária',    value: 27, color: t.chart.series[3] },
  { label: 'Sal Mineral',       value: 21, color: t.chart.series[4] },
  { label: 'Premix Vitamínico', value: 12, color: t.color.feedback.error.solid },
  { label: 'Calcário',          value: 9,  color: t.color.feedback.error.solid },
  { label: 'Bicarbonato',       value: 7,  color: t.color.feedback.error.solid },
].sort((a, b) => b.value - a.value)

// ─── KPI derivados ────────────────────────────────────────────────────────────

const saldoTotalKg = mockSaldoArmazem.reduce((acc, d) => acc + d.value, 0)
const coberturaMediaDias = Math.round(
  mockCoberturaProdutos.reduce((acc, d) => acc + d.value, 0) / mockCoberturaProdutos.length,
)
const itensEmEstoque = mockCoberturaProdutos.length
// Consumo médio diário = média entre os últimos pontos das duas séries dividida por 7 (por semana → dia)
const consumoMedioDiario = Math.round(
  mockConsumoSeries.reduce((acc, s) => acc + s.data[s.data.length - 1], 0) / 7,
)
const itensCriticos = mockCoberturaProdutos.filter(d => d.value <= CRITICO_THRESHOLD).length


// ─── DashEstoqueNutricao ──────────────────────────────────────────────────────

export default function DashEstoqueNutricao() {
  const { colors } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [periodo, setPeriodo] = useUrlFilter('periodo', '60')
  const [produto, setProduto] = useUrlFilter('produto', 'todos')
  const [armazem, setArmazem] = useUrlFilter('armazem', 'todos')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <DashboardSkeleton kpis={4} blocks={[t.size.chart.md, t.size.chart.lg]} />
  }

  const kpis = [
    {
      label: 'Saldo total',
      value: `${(saldoTotalKg / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} t`,
      trend: '5,2% vs mês ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: 'Saldo total',
      sparkColor: t.chart.series[0],
    },
    {
      label: 'Cobertura média',
      value: `${coberturaMediaDias} dias`,
      trend: itensCriticos > 0
        ? `${itensCriticos} item${itensCriticos > 1 ? 's' : ''} crítico${itensCriticos > 1 ? 's' : ''}`
        : 'Todos acima do limite',
      up: itensCriticos === 0,
      valueColor: itensCriticos > 0
        ? (t.color.feedback.warning.text as string)
        : (colors.fg.default as string),
      sparkKey: null,
      sparkColor: t.chart.series[1],
    },
    {
      label: 'Itens em estoque',
      value: String(itensEmEstoque),
      trend: 'produtos ativos',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: null,
      sparkColor: t.chart.series[2],
    },
    {
      label: 'Consumo médio diário',
      value: `${consumoMedioDiario.toLocaleString('pt-BR')} kg/dia`,
      trend: '1,8% vs sem. ant.',
      up: false,
      valueColor: colors.fg.default as string,
      sparkKey: 'Consumo médio diário',
      sparkColor: t.chart.series[0],
    },
  ]

  return (
    <DashboardGrid>
      <DashboardHeader
        title="Estoque Nutrição"
        subtitle="Saldo, consumo e cobertura dos insumos de nutrição"
        actions={
          <>
            <FilterSelect
              ariaLabel="Filtrar por período"
              options={[
                { value: '30', label: 'Últimos 30 dias' },
                { value: '60', label: 'Últimos 60 dias' },
              ]}
              value={periodo}
              onChange={setPeriodo}
            />
            <FilterSelect
              ariaLabel="Filtrar por produto"
              options={[
                { value: 'todos', label: 'Todos os Produtos' },
                ...mockCoberturaProdutos.map((p) => ({ value: p.label, label: p.label })),
              ]}
              value={produto}
              onChange={setProduto}
            />
            <FilterSelect
              ariaLabel="Filtrar por armazém"
              options={[
                { value: 'todos', label: 'Todos os Armazéns' },
                ...mockSaldoArmazem.map((a) => ({ value: a.label, label: a.label })),
              ]}
              value={armazem}
              onChange={setArmazem}
            />
          </>
        }
      />

      {/* Fileira 1 — KPIs */}
      <DashboardRow>
        {kpis.map((kpi) => (
          <DashboardKpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            up={kpi.up}
            valueColor={kpi.valueColor}
          >
            {kpi.sparkKey && (
              <SparklineArea
                data={kpiSparklines[kpi.sparkKey]}
                color={kpi.sparkColor}
                height={t.size.sparkline}
              />
            )}
          </DashboardKpiCard>
        ))}
      </DashboardRow>

      {/* Fileira 2 — Saldo por armazém + Evolução de consumo */}
      <DashboardRow>
        <DashboardCard title="Saldo por armazém (kg)">
          <BarChart
            data={mockSaldoArmazem.filter((a) => armazem === 'todos' || a.label === armazem)}
            height={t.size.chart.md}
            yFormat={(v) => `${(v / 1000).toFixed(0)}t`}
          />
        </DashboardCard>
        <DashboardCard title="Consumo semanal (kg)">
          <LineChart
            series={mockConsumoSeries.map((s) => ({ ...s, data: s.data.slice(periodo === '30' ? -4 : -8) }))}
            labels={mockConsumoLabels.slice(periodo === '30' ? -4 : -8)}
            height={t.size.chart.md}
            area
            showLegend
            yFormat={(v) => `${(v / 1000).toFixed(0)}t`}
          />
        </DashboardCard>
      </DashboardRow>

      {/* Fileira 3 — Cobertura por produto */}
      <DashboardCard
        title="Cobertura por produto (dias)"
        action={
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: t.space[1],
            fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
            color: t.color.feedback.error.text, background: t.color.feedback.error.bg,
            borderRadius: t.radius.full, padding: `2px ${t.space[2]}px`,
            fontFamily: t.font.family.sans, whiteSpace: 'nowrap',
          }}>
            <AlertTriangle size={t.font.size.xs} aria-hidden="true" />
            crítico abaixo de {CRITICO_THRESHOLD} dias
          </span>
        }
      >
        <BarChart
          data={mockCoberturaProdutos.filter((p) => produto === 'todos' || p.label === produto)}
          height={t.size.chart.lg}
          horizontal
          yFormat={(v) => `${Math.round(v)}d`}
        />
      </DashboardCard>
    </DashboardGrid>
  )
}
