// TODO (backend):
// - Criar painel unificado consolidando custeio por curral/lote (não existe hoje)
// - BLOQUEANTE DUV-401: resolver divergência de fórmula de nutrição `average_cost` vs `amount`
//   antes de conectar dados reais — resultado de custo por arroba diverge ~12% entre os dois cálculos
// - Extrair e validar fórmulas de custeio diferidas (Lei 8) via Spike técnico dedicado
// - Padronizar `pageSlug` em kebab-case (`custos-confinamento`) e registrar RBAC explícito
//   com permissão sugerida `feedlot_costs_dashboard_view`
// - Permitir recorte por curral/pátio/lote diretamente no filtro (hoje filtram os mocks localmente)
// - Exportação consistente PDF/Excel — corrigir bug de inclusão Excel (DUV-402)
// - Adicionar indicador de "última atualização" dos dados via timestamp da API

import { useEffect, useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { SparklineArea } from '../../components/ui/SparklineArea'
import { DonutChart } from '../../components/ui/DonutChart'
import { StackedBarChart } from '../../components/ui/StackedBarChart'
import { LineChart } from '../../components/ui/LineChart'
import { DashboardFilters } from '../../components/ui/DashboardFilters'
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

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']

// Custo por arroba (R$/@) ao longo do período
const mockCustoArroba = [148, 152, 155, 151, 158, 162]

// Custo animal/dia (R$/cab/dia)
const mockCustoAnimalDia = [18.4, 18.9, 19.2, 18.7, 19.6, 20.1]

// COE acumulado por mês (R$ mil)
const mockCoeTotal = [312, 328, 341, 335, 358, 374]

// Margem bruta por mês (%)
const mockMargemBruta = [14.2, 13.8, 13.1, 14.5, 12.9, 12.3]

// Composição de custo por mês em R$ mil (Ração, Sanitário, Mão de obra, Depreciação, Outros)
const mockStackedSeries = [
  {
    name: 'Ração',
    data: [185, 196, 204, 199, 213, 224],
    color: t.chart.series[0],
  },
  {
    name: 'Sanitário',
    data: [38, 40, 42, 39, 44, 46],
    color: t.chart.series[1],
  },
  {
    name: 'Mão de obra',
    data: [52, 52, 54, 53, 55, 56],
    color: t.chart.series[2],
  },
  {
    name: 'Depreciação',
    data: [22, 22, 22, 23, 23, 23],
    color: t.chart.series[3],
  },
  {
    name: 'Outros',
    data: [15, 18, 19, 21, 23, 25],
    color: t.chart.series[4],
  },
]

// Série de linha dupla: custo/@  e custo animal/dia (escala: /@; animal/dia ×8 para coexistir)
const mockLineSeries = [
  {
    name: 'Por arroba (R$/@)',
    data: mockCustoArroba,
    color: t.chart.series[0],
  },
  {
    name: 'Animal/dia (R$ ×8)',
    data: mockCustoAnimalDia.map((v) => Math.round(v * 8 * 10) / 10),
    color: t.chart.series[2],
  },
]

// Composição total do período para Donut
const mockDonutData = [
  { label: 'Ração',       value: 1221, color: t.chart.series[0] },
  { label: 'Sanitário',   value: 249,  color: t.chart.series[1] },
  { label: 'Mão de obra', value: 322,  color: t.chart.series[2] },
  { label: 'Depreciação', value: 135,  color: t.chart.series[3] },
  { label: 'Outros',      value: 121,  color: t.chart.series[4] },
]

// Sparklines para KPIs
const kpiSparklines: Record<string, number[]> = {
  custoArroba: mockCustoArroba,
  custoAnimalDia: mockCustoAnimalDia.map((v) => Math.round(v * 10) / 10),
}


// ─── DashCustosConfinamento ────────────────────────────────────────────────────

export default function DashCustosConfinamento() {
  const { colors } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [periodo, setPeriodo] = useUrlFilter('periodo', '6')
  const [categoria, setCategoria] = useUrlFilter('categoria', 'todas')
  // Safra única nos mocks — o filtro existe para manter o recorte explícito
  const [safra, setSafra] = useUrlFilter('safra', '25/26')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const showSkeleton = useDelayedLoading(isLoading)

  if (isLoading) {
    // Anti-flash: espera curta não pisca a casca; anti-flicker: uma vez
    // visível, ela fica o mínimo de `t.delay.loadingMin`.
    return showSkeleton ? <DashboardSkeleton kpis={4} blocks={[t.size.chart.lg, t.size.chart.lg]} /> : null
  }

  // KPI derivados dos mocks — último mês disponível (Jun)
  const ultimoIdx = mockCustoArroba.length - 1
  const custoArrobaAtual = mockCustoArroba[ultimoIdx]
  const custoAnimalDiaAtual = mockCustoAnimalDia[ultimoIdx]
  const coeAtual = mockCoeTotal[ultimoIdx]
  const margemAtual = mockMargemBruta[ultimoIdx]

  const kpis = [
    {
      label: 'Custo por arroba',
      value: `R$ ${custoArrobaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/@`,
      trend: '2,5% vs mês ant.', // sem "+": a seta (▼) já indica que o aumento de custo é desfavorável
      up: false, // custo subindo = desfavorável
      valueColor: colors.fg.default as string,
      sparkKey: 'custoArroba' as const,
      sparkColor: t.chart.series[0],
    },
    {
      label: 'Custo animal/dia',
      value: `R$ ${custoAnimalDiaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      trend: '2,6% vs mês ant.',
      up: false,
      valueColor: colors.fg.default as string,
      sparkKey: 'custoAnimalDia' as const,
      sparkColor: t.chart.series[2],
    },
    {
      label: 'COE (custo operacional)',
      value: `R$ ${(coeAtual * 1000).toLocaleString('pt-BR')}`,
      trend: '4,5% vs mês ant.',
      up: false,
      valueColor: colors.fg.default as string,
      sparkKey: null,
      sparkColor: t.chart.series[1],
    },
    {
      label: 'Margem bruta',
      value: `${margemAtual.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
      trend: '−0,6 p.p. vs mês ant.',
      up: false,
      valueColor: margemAtual >= 12
        ? (t.color.feedback.success.text as string)
        : (t.color.feedback.error.text as string),
      sparkKey: null,
      sparkColor: t.chart.series[3],
    },
  ]

  return (
    <DashboardGrid>
      <DashboardHeader
        title="Custos do Confinamento"
        subtitle="Custo por arroba, COE, margem e composição de custo"
        actions={
          <DashboardFilters
            fields={[
              {
                label: 'Período',
                value: periodo,
                onChange: setPeriodo,
                defaultValue: '6',
                options: [
                  { value: '3', label: 'Abr–Jun 2025' },
                  { value: '6', label: 'Jan–Jun 2025' },
                ],
              },
              {
                label: 'Categoria de custo',
                value: categoria,
                onChange: setCategoria,
                defaultValue: 'todas',
                options: [
                  { value: 'todas', label: 'Todas as categorias' },
                  ...mockStackedSeries.map((s) => ({ value: s.name, label: s.name })),
                ],
              },
              {
                label: 'Safra',
                value: safra,
                onChange: setSafra,
                defaultValue: '25/26',
                options: [{ value: '25/26', label: 'Safra 25/26' }],
              },
            ]}
          />
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

      {/* Fileira 2 — Composição por mês + Evolução de custo */}
      <DashboardRow>
        <DashboardCard title="Composição de custo por mês (R$ mil)" flex={3}>
          <StackedBarChart
            series={mockStackedSeries
              .filter((s) => categoria === 'todas' || s.name === categoria)
              .map((s) => ({ ...s, data: s.data.slice(-Number(periodo)) }))}
            labels={MESES.slice(-Number(periodo))}
            height={t.size.chart.lg}
            showLegend
            yFormat={(v) => `R$ ${v}`}
          />
        </DashboardCard>
        <DashboardCard title="Custo por arroba e animal/dia" flex={2}>
          <LineChart
            series={mockLineSeries.map((s) => ({ ...s, data: s.data.slice(-Number(periodo)) }))}
            labels={MESES.slice(-Number(periodo))}
            height={t.size.chart.lg}
            area={false}
            showLegend
            yFormat={(v) => `R$ ${v}`}
          />
        </DashboardCard>
      </DashboardRow>

      {/* Fileira 3 — Composição total do período */}
      <DashboardCard title="Composição total do período (R$ mil)">
        <DonutChart
          data={mockDonutData}
          height={t.size.chart.lg}
          centerLabel="COE total"
          centerValue={`R$ ${mockDonutData.reduce((a, d) => a + d.value, 0).toLocaleString('pt-BR')}`}
          showLegend
          valueFormat={(v) => `R$ ${v.toLocaleString('pt-BR')} mil`}
        />
      </DashboardCard>
    </DashboardGrid>
  )
}
