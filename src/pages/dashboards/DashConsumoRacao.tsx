// TODO (backend):
// - RBAC no FoodBeat (hoje sem middleware de permissão); sugerir permissão `food_beat_dashboard_view`
// - Substituir categorias hardcoded IN (36,53,44,56) por config/enum de tenant
// - Corrigir `update` que só altera data/usuário e não reprocessa estoque/custo médio
// - Revisar transação/rollback (atomicidade) nas operações de batida
// - Centralizar conversão de UM (factor_type) e recálculo de custo médio (CalcAverageCostAction)
// - Definir "consumo médio" canônico (Kg/animal/dia) e tratar animals_count = 0 sem fallback silencioso
// - Filtros de Período, Formulação e Lote devem chamar endpoint filtrado (hoje filtram os mocks localmente)
// - Adicionar indicador de "última atualização" dos dados via timestamp da API

import { useEffect, useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { SparklineArea } from '../../components/ui/SparklineArea'
import { FilterSelect } from '../../components/ui/FilterSelect'
import { DonutChart } from '../../components/ui/DonutChart'
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

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockWeekLabels = ['S1 Abr', 'S2 Abr', 'S3 Abr', 'S4 Abr', 'S1 Mai', 'S2 Mai', 'S3 Mai', 'S4 Mai']

const mockConsumoSeries = [
  {
    name: 'Lote A — Nelore',
    data: [8.2, 8.5, 8.1, 8.7, 9.0, 8.8, 9.2, 9.4],
    color: t.chart.series[0],
  },
  {
    name: 'Lote B — Angus',
    data: [9.8, 10.1, 9.7, 10.3, 10.6, 10.2, 10.8, 11.0],
    color: t.chart.series[1],
  },
  {
    name: 'Lote C — Cruzado',
    data: [7.5, 7.8, 7.4, 7.9, 8.1, 7.9, 8.3, 8.6],
    color: t.chart.series[2],
  },
]

const mockCustoBatidaData = [
  { label: 'Terminação Intensiva', value: 142.80, color: t.chart.series[0] },
  { label: 'Recria Volumoso',      value: 87.50,  color: t.chart.series[1] },
  { label: 'Adaptação',            value: 63.20,  color: t.chart.series[2] },
  { label: 'Pré-Abate',            value: 158.40, color: t.chart.series[3] },
]

const mockComposicaoData = [
  { label: 'Milho moído',       value: 48, color: t.chart.series[0] },
  { label: 'Farelo de soja',    value: 22, color: t.chart.series[1] },
  { label: 'Núcleo mineral',    value: 14, color: t.chart.series[2] },
  { label: 'Ureia',             value: 8,  color: t.chart.series[3] },
  { label: 'Sal mineral',       value: 8,  color: t.chart.series[4] },
]

const kpiSparklines: Record<string, number[]> = {
  racaoProduzida: [18400, 19200, 18800, 20100, 20600, 21000, 21800, 22400],
  racaoDistribuida: [17900, 18700, 18300, 19600, 20100, 20400, 21200, 21800],
}

// ─── DashConsumoRacao ─────────────────────────────────────────────────────────

export default function DashConsumoRacao() {
  const { colors } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [periodo, setPeriodo] = useState('60')
  const [formulacao, setFormulacao] = useState('todas')
  const [lote, setLote] = useState('todos')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <DashboardSkeleton kpis={4} blocks={[t.size.chart.md, t.size.chart.lg]} />
  }

  // ── Dados filtrados (período fatia as semanas; lote/formulação filtram séries)
  const weekCount = periodo === '30' ? 4 : 8
  const weekLabels = mockWeekLabels.slice(-weekCount)
  const consumoSeries = mockConsumoSeries
    .filter((s) => lote === 'todos' || s.name === lote)
    .map((s) => ({ ...s, data: s.data.slice(-weekCount) }))
  const custoBatidaData = mockCustoBatidaData
    .filter((f) => formulacao === 'todas' || f.label === formulacao)

  // ── KPIs derivados dos mocks ──────────────────────────────────────────────
  // Ração Produzida: última semana em kg (série de 8 semanas, unidade 100 kg → kg)
  const racaoProduzidaKg = kpiSparklines.racaoProduzida[kpiSparklines.racaoProduzida.length - 1]
  // Ração Distribuída: última semana
  const racaoDistribuidaKg = kpiSparklines.racaoDistribuida[kpiSparklines.racaoDistribuida.length - 1]
  // Consumo médio: média dos últimos valores de cada lote filtrado (Kg/animal/dia)
  const consumoMedioLotes = consumoSeries.map(s => s.data[s.data.length - 1])
  const consumoMedio = consumoMedioLotes.reduce((a, b) => a + b, 0) / Math.max(consumoMedioLotes.length, 1)
  // Custo médio da batida: média das formulações filtradas
  const custoMedioBatida = custoBatidaData.reduce((a, d) => a + d.value, 0) / Math.max(custoBatidaData.length, 1)

  const kpis = [
    {
      label: 'Ração produzida',
      value: `${racaoProduzidaKg.toLocaleString('pt-BR')} kg`,
      trend: '3,4% vs sem. ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: 'racaoProduzida',
      sparkColor: t.chart.series[0],
    },
    {
      label: 'Ração distribuída',
      value: `${racaoDistribuidaKg.toLocaleString('pt-BR')} kg`,
      trend: '2,8% vs sem. ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: 'racaoDistribuida',
      sparkColor: t.chart.series[1],
    },
    {
      label: 'Consumo médio',
      value: `${consumoMedio.toFixed(1)} kg/an./dia`,
      trend: '0,5 kg vs sem. ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: null,
      sparkColor: t.chart.series[2],
    },
    {
      label: 'Custo médio da batida',
      value: `R$ ${custoMedioBatida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      trend: '1,2% vs mês ant.',
      up: false,
      valueColor: colors.fg.default as string,
      sparkKey: null,
      sparkColor: t.chart.series[3],
    },
  ]

  return (
    <DashboardGrid>
      <DashboardHeader
        title="Consumo de Ração"
        subtitle="Produção, distribuição, custo da batida e composição"
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
              ariaLabel="Filtrar por formulação"
              options={[
                { value: 'todas', label: 'Todas as formulações' },
                ...mockCustoBatidaData.map((f) => ({ value: f.label, label: f.label })),
              ]}
              value={formulacao}
              onChange={setFormulacao}
            />
            <FilterSelect
              ariaLabel="Filtrar por lote"
              options={[
                { value: 'todos', label: 'Todos os lotes' },
                ...mockConsumoSeries.map((s) => ({ value: s.name, label: s.name })),
              ]}
              value={lote}
              onChange={setLote}
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

      {/* Fileira 2 — Consumo por lote */}
      <DashboardCard title="Consumo por lote (kg/animal/dia)">
        <LineChart
          series={consumoSeries}
          labels={weekLabels}
          height={t.size.chart.md}
          area
          showLegend
          yFormat={(v) => `${v.toFixed(1)} kg`}
        />
      </DashboardCard>

      {/* Fileira 3 — Custo da batida + Composição */}
      <DashboardRow>
        <DashboardCard title="Custo médio da batida (R$)">
          <BarChart
            data={custoBatidaData}
            height={t.size.chart.lg}
            yFormat={(v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          />
        </DashboardCard>
        <DashboardCard title="Matérias-primas da ração (%)">
          <DonutChart
            data={mockComposicaoData}
            height={t.size.chart.lg}
            centerLabel="ingredientes"
            centerValue={String(mockComposicaoData.length)}
            showLegend
            valueFormat={(v) => `${v}%`}
          />
        </DashboardCard>
      </DashboardRow>
    </DashboardGrid>
  )
}
