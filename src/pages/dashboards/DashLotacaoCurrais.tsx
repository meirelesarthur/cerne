// TODO (backend):
// - Definir pageSlug e RBAC: permissão sugerida `feedlot_dashboard_view`
// - Validar fórmula de Taxa de Ocupação: animais_alojados / capacidade_total × 100
// - Canonizar enum de status de curral (Disponível | Ocupado | Em manejo | Manutenção) na API
// - Implementar drill-down por setor e por curral individual
// - Adicionar indicador de "última atualização" dos dados via timestamp da API
// - Filtros de Pátio e Setor devem chamar endpoint filtrado (hoje filtram os mocks localmente)

import { useEffect, useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { SparklineArea } from '../../components/ui/SparklineArea'
import { FilterSelect } from '../../components/ui/FilterSelect'
import { DonutChart } from '../../components/ui/DonutChart'
import { StackedBarChart } from '../../components/ui/StackedBarChart'
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

const mockStatusData = [
  { label: 'Disponível',  value: 18, color: t.color.feedback.success.solid },
  { label: 'Ocupado',     value: 52, color: t.color.brand[600] },
  { label: 'Em manejo',   value: 9,  color: t.color.feedback.warning.solid },
  { label: 'Manutenção',  value: 5,  color: t.color.feedback.error.solid },
]

const mockSetores = ['Setor A', 'Setor B', 'Setor C', 'Setor D', 'Setor E']

const mockStackedSeries = [
  {
    name: 'Alojados',
    data: [340, 480, 290, 520, 410],
    color: t.color.brand[600],
  },
  {
    name: 'Disponível',
    data: [160, 20, 210, 80, 190],
    color: t.color.feedback.success.solid,
  },
]

const kpiSparklines: Record<string, number[]> = {
  'Taxa de ocupação': [71, 74, 76, 79, 81, 83, 85],
  'Total de animais': [1820, 1870, 1910, 1960, 1990, 2020, 2040],
}

// ─── DashLotacaoCurrais ───────────────────────────────────────────────────────

export default function DashLotacaoCurrais() {
  const { colors } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  // Pátio único nos mocks — o filtro mantém o recorte explícito
  const [patio, setPatio] = useUrlFilter('patio', 'principal')
  const [setor, setSetor] = useUrlFilter('setor', 'todos')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const showSkeleton = useDelayedLoading(isLoading)

  if (isLoading) {
    // Anti-flash: espera curta não pisca a casca; anti-flicker: uma vez
    // visível, ela fica o mínimo de `t.delay.loadingMin`.
    return showSkeleton ? <DashboardSkeleton kpis={4} blocks={[t.size.chart.lg]} /> : null
  }

  // KPI derivados dos mocks
  const totalAnimais = mockStackedSeries[0].data.reduce((a, b) => a + b, 0)
  const capacidadeTotal = mockStackedSeries.reduce(
    (acc, s) => acc + s.data.reduce((a, b) => a + b, 0),
    0,
  )
  const curraisDisponiveis = mockStatusData.find(d => d.label === 'Disponível')?.value ?? 0
  const taxaOcupacao = Math.round((totalAnimais / capacidadeTotal) * 100)

  const kpis = [
    {
      label: 'Taxa de ocupação',
      value: `${taxaOcupacao}%`,
      trend: '2,1 p.p. vs mês ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: 'Taxa de ocupação',
      sparkColor: t.color.brand[600],
    },
    {
      label: 'Total de animais',
      value: totalAnimais.toLocaleString('pt-BR'),
      trend: '1,9% vs mês ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: 'Total de animais',
      sparkColor: t.color.brand[600],
    },
    {
      label: 'Currais disponíveis',
      value: String(curraisDisponiveis),
      trend: curraisDisponiveis > 0 ? 'Disponíveis agora' : 'Nenhum disponível',
      up: curraisDisponiveis > 0,
      valueColor: curraisDisponiveis > 0
        ? (t.color.feedback.success.text as string)
        : (t.color.feedback.error.text as string),
      sparkKey: null,
      sparkColor: t.color.feedback.success.solid,
    },
    {
      label: 'Capacidade total',
      value: capacidadeTotal.toLocaleString('pt-BR'),
      trend: 'cab. totais',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: null,
      sparkColor: t.color.brand[600],
    },
  ]

  return (
    <DashboardGrid>
      <DashboardHeader
        title="Lotação de Currais"
        subtitle="Ocupação, status e capacidade do pátio de confinamento"
        actions={
          <>
            <FilterSelect
              ariaLabel="Filtrar por pátio"
              options={[{ value: 'principal', label: 'Pátio Principal' }]}
              value={patio}
              onChange={setPatio}
            />
            <FilterSelect
              ariaLabel="Filtrar por setor"
              options={[
                { value: 'todos', label: 'Todos os Setores' },
                ...mockSetores.map((s) => ({ value: s, label: s })),
              ]}
              value={setor}
              onChange={setSetor}
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

      {/* Fileira 2 — Status + Ocupação por setor */}
      <DashboardRow>
        <DashboardCard title="Distribuição por status">
          <DonutChart
            data={mockStatusData}
            height={t.size.chart.lg}
            centerLabel="currais"
            centerValue={String(mockStatusData.reduce((a, d) => a + d.value, 0))}
            showLegend
            valueFormat={(v) => `${v} currais`}
          />
        </DashboardCard>
        <DashboardCard title="Ocupação por setor (cab.)">
          <StackedBarChart
            series={mockStackedSeries.map((s) => ({
              ...s,
              data: s.data.filter((_, i) => setor === 'todos' || mockSetores[i] === setor),
            }))}
            labels={mockSetores.filter((s) => setor === 'todos' || s === setor)}
            height={t.size.chart.lg}
            horizontal
            showLegend
            yFormat={(v) => `${v}`}
          />
        </DashboardCard>
      </DashboardRow>
    </DashboardGrid>
  )
}
