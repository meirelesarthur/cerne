import { useEffect, useState } from 'react'
import { t } from '../../design/tokens'
import { LineChart } from '../../components/ui/LineChart'
import { GroupedBarChart } from '../../components/ui/GroupedBarChart'
import { DonutChart } from '../../components/ui/DonutChart'
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

const novilhos  = [1580, 1600, 1620, 1640, 1630, 1650, 1670, 1680, 1660, 1690, 1700, 1628]
const matrizes  = [1160, 1170, 1175, 1180, 1190, 1185, 1195, 1200, 1195, 1205, 1210, 1198]
const bezerros  = [730,  740,  745,  755,  760,  750,  765,  770,  755,  770,  780,  754]

const rebanhoComp = [
  { label: 'Novilhos',  pct: 38, color: t.chart.series[0] },
  { label: 'Matrizes',  pct: 28, color: t.chart.series[1] },
  { label: 'Touros',    pct: 8,  color: t.chart.series[3] },
  { label: 'Bezerros',  pct: 18, color: t.chart.series[2] },
  // Descarte é a sobra da composição — neutro de propósito, não compete com
  // as categorias produtivas.
  { label: 'Descarte',  pct: 8,  color: t.color.neutral[400] },
] as const

const vermifugData = [42, 38, 55, 48, 60, 45, 52, 58, 44, 50, 62, 48]
const pesagensData = [30, 28, 40, 35, 45, 32, 38, 42, 30, 36, 48, 35]

// Composição por raça do rebanho — percentuais somam 100
// shape reflete breeds + animals.category_id
const mockComposicaoRaca = [
  { label: 'Nelore',   pct: 46, color: t.chart.series[0] },
  { label: 'Angus',    pct: 21, color: t.chart.series[1] },
  { label: 'Brangus',  pct: 15, color: t.chart.series[2] },
  { label: 'Senepol',  pct: 10, color: t.chart.series[3] },
  { label: 'Cruzado',  pct: 8,  color: t.chart.series[4] },
] as const

// KPIs de nascimentos/mortes do período — shape reflete birth_animals / death_animals
const PEC_KPIS_VITAIS = [
  { label: 'Nascimentos no período', value: '186', trend: '8,4% vs período ant.', up: true  },
  { label: 'Mortes no período',      value: '9',   trend: '1,1% vs período ant.', up: false },
]

// ─── Séries para LineChart ────────────────────────────────────────────────────

const REBANHO_SERIES = [
  { name: 'Novilhos', data: novilhos, color: t.chart.series[0] },
  { name: 'Matrizes', data: matrizes, color: t.chart.series[1] },
  { name: 'Bezerros', data: bezerros, color: t.chart.series[2] },
]

// ─── Séries para GroupedBarChart ──────────────────────────────────────────────

const MANEJOS_SERIES = [
  { name: 'Vermifugações', data: vermifugData, color: t.chart.series[0] },
  { name: 'Pesagens',      data: pesagensData, color: t.chart.series[1] },
]

// ─── DashPecuaria ─────────────────────────────────────────────────────────────

const PEC_KPIS = [
  { label: 'Total de cabeças',  value: '4.280',       trend: '3,2%', up: true  },
  { label: 'Peso médio',     value: '384 kg',       trend: '1,8%', up: true  },
  { label: 'Arrobas/mês',   value: '2.156 @',      trend: '7,4%', up: true  },
  { label: 'GMD',            value: '0,82 kg/dia',  trend: '0,4%', up: false },
]

export default function DashPecuaria() {
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
    return showSkeleton ? <DashboardSkeleton kpis={4} blocks={[t.size.chart.md, t.size.chart.md]} /> : null
  }

  // Dados filtrados: período fatia os últimos N meses das séries mensais
  const nMeses = Number(periodo)
  const labels = monthLabels.slice(-nMeses)
  const rebanhoSeries = REBANHO_SERIES.map((s) => ({ ...s, data: s.data.slice(-nMeses) }))
  const manejosSeries = MANEJOS_SERIES.map((s) => ({ ...s, data: s.data.slice(-nMeses) }))

  const analise: DashboardReadingInput = {
    title: 'Pecuária de Corte',
    scope: `rebanho · últimos ${nMeses} meses`,
    kpis: PEC_KPIS,
    blocks: [
      {
        block: 'Evolução do rebanho',
        kind: 'timeline',
        labels,
        series: rebanhoSeries.map((s) => ({ name: s.name, data: s.data })),
        unit: 'cabeças',
      },
      {
        block: 'Composição do rebanho',
        kind: 'composition',
        labels: rebanhoComp.map((c) => c.label),
        series: [{ name: 'Participação', data: rebanhoComp.map((c) => c.pct) }],
        unit: '%',
        concentrationRisk: false,
      },
      {
        block: 'Composição por raça',
        kind: 'composition',
        labels: mockComposicaoRaca.map((c) => c.label),
        series: [{ name: 'Participação', data: mockComposicaoRaca.map((c) => c.pct) }],
        unit: '%',
        concentrationRisk: false,
      },
      {
        block: 'Manejos por mês',
        kind: 'timeline',
        labels,
        series: manejosSeries.map((s) => ({ name: s.name, data: s.data })),
        unit: 'manejos',
      },
    ],
  }

  return (
    <DashboardGrid>
      <DashboardHeader
        title="Pecuária de Corte"
        subtitle="Rebanho, composição e manejos do período"
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
        {PEC_KPIS.map((kpi) => (
          <DashboardKpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            up={kpi.up}
          />
        ))}
      </DashboardRow>

      {/* Fileira 1b — Nascimentos/Mortes do período */}
      <DashboardRow>
        {PEC_KPIS_VITAIS.map((kpi) => (
          <DashboardKpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            up={kpi.up}
          />
        ))}
      </DashboardRow>

      {/* Fileira 2 — Evolução + Composição */}
      <DashboardRow>
        <FocusableChartCard title="Evolução do rebanho" flex={2} series={rebanhoSeries}>
          {(series) => (
            <LineChart
              series={series}
              labels={labels}
              height={t.size.chart.md}
              area
              showLegend
              yFormat={(v) => Math.round(v).toLocaleString('pt-BR')}
            />
          )}
        </FocusableChartCard>
        <DashboardCard title="Composição do rebanho" flex={1}>
          <DonutChart
            data={rebanhoComp.map((d) => ({ label: d.label, value: d.pct, color: d.color }))}
            height={t.size.chart.md}
            centerValue="4.280"
            centerLabel="cabeças"
            showLegend
            valueFormat={(v) => `${v}%`}
          />
        </DashboardCard>
        <DashboardCard title="Composição por raça" flex={1}>
          <DonutChart
            data={mockComposicaoRaca.map((d) => ({ label: d.label, value: d.pct, color: d.color }))}
            height={t.size.chart.md}
            centerValue="5"
            centerLabel="raças"
            showLegend
            valueFormat={(v) => `${v}%`}
          />
        </DashboardCard>
      </DashboardRow>

      {/* Fileira 3 — Manejos */}
      <FocusableChartCard title="Manejos por mês" series={manejosSeries}>
        {(series) => (
          <GroupedBarChart
            series={series}
            labels={labels}
            height={t.size.chart.md}
            showLegend
          />
        )}
      </FocusableChartCard>
    </DashboardGrid>
  )
}
