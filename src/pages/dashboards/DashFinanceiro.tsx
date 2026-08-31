import { useEffect, useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { HeatmapChart } from '../../components/ui/HeatmapChart'
import { FilterSelect } from '../../components/ui/FilterSelect'
import { LineChart } from '../../components/ui/LineChart'
import { DonutChart } from '../../components/ui/DonutChart'
import { GaugeChart } from '../../components/ui/GaugeChart'
import { ChartLegend } from '../../components/ui/ChartLegend'
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

const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const revenueData = [640000, 720000, 680000, 810000, 750000, 870000, 820000, 890000, 760000, 830000, 900000, 892450]
const expenseData = [420000, 510000, 480000, 560000, 530000, 610000, 580000, 650000, 590000, 620000, 700000, 634120]

const vencimentos = [
  { nome: 'Fornecedor AgriMax',  valor: 'R$ 28.400', data: '03/06/2026', status: 'Pendente' },
  { nome: 'Locação Maquinário',  valor: 'R$ 12.750', data: '05/06/2026', status: 'Pendente' },
  { nome: 'Cooperativa Sementes', valor: 'R$ 8.900', data: '01/06/2026', status: 'Atrasado' },
  { nome: 'Energia Elétrica',    valor: 'R$ 3.200',  data: '07/06/2026', status: 'Pendente' },
  { nome: 'Consultoria Técnica', valor: 'R$ 5.600',  data: '28/05/2026', status: 'Atrasado' },
]

const donutData = [
  { label: 'Suprimentos', pct: 35, color: t.color.brand[600] },
  { label: 'RH',          pct: 25, color: t.color.feedback.info.solid },
  { label: 'Frota',       pct: 18, color: t.color.feedback.notice },
  { label: 'Impostos',    pct: 14, color: t.color.feedback.error.solid },
  { label: 'Outros',      pct: 8,  color: t.color.neutral[400] },
]

const heatmapRows = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const heatmapCols = ['6h', '9h', '12h', '15h', '18h', '21h', '0h', '3h']
const heatmapData = [
  [12, 48, 95, 82, 74, 38, 8,  2],
  [15, 52, 89, 91, 68, 42, 6,  1],
  [10, 45, 102, 88, 71, 35, 9, 3],
  [18, 55, 97, 84, 79, 41, 11, 4],
  [22, 61, 108, 95, 83, 57, 14, 5],
  [8,  22, 45, 38, 31, 62, 18, 7],
  [4,  10, 18, 14, 12, 28, 9,  3],
]


// ─── Arc Gauge ────────────────────────────────────────────────────────────────

function ArcGauge({ colors }: { colors: ReturnType<typeof useTheme>['colors'] }) {
  const [segHov, setSegHov] = useState<number | null>(null)

  const segments = [
    { label: 'Realizado', pct: 0.68, color: t.color.brand[600] },
    { label: 'Previsto',  pct: 0.20, color: t.color.brand[200] },
    { label: 'Atrasado',  pct: 0.12, color: t.color.feedback.error.solid },
  ]

  return (
    <div>
      <GaugeChart value={68} centerValue="68%" centerLabel="R$ 6,12M / R$ 9,0M" color={t.color.brand[600]} />
      <div style={{ display: 'flex', gap: t.space[3], justifyContent: 'center', marginTop: t.space[2] }}>
        {[{ label: 'Realizado', color: t.color.brand[600] }, { label: 'Disponível', color: t.color.neutral[300] }].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
            <div style={{ width: 8, height: 8, borderRadius: t.radius.full, background: item.color }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', height: 10, borderRadius: t.radius.full, overflow: 'hidden', marginTop: t.space[3] }}>
        {segments.map((seg, i) => (
          <div key={i} onMouseEnter={() => setSegHov(i)} onMouseLeave={() => setSegHov(null)}
            title={`${seg.label}: ${(seg.pct * 100).toFixed(0)}%`}
            style={{ flex: seg.pct, background: seg.color, opacity: segHov !== null && segHov !== i ? 0.3 : 1, transition: `opacity ${t.transition.smooth}`, cursor: 'pointer' }} />
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

// ─── Vencimentos List ─────────────────────────────────────────────────────────

function VencimentosList({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
      {vencimentos.map((item, i) => {
        const isAtrasado = item.status === 'Atrasado'
        return (
          <div key={i}
            onMouseEnter={() => setHovIdx(i)} onMouseLeave={() => setHovIdx(null)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: `${t.space[2]}px ${t.space[2]}px`,
              borderRadius: t.radius.base,
              background: hovIdx === i ? (isGbMode ? t.color.state.row.hoverGb : t.color.state.row.hover) : 'transparent',
              transition: `background ${t.transition.base}`, cursor: 'default',
            }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.fg.default as string, fontFamily: t.font.family.sans }}>
                {item.nome}
              </div>
              <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
                Vence {item.data}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
              <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default as string, fontFamily: t.font.family.sans }}>
                {item.valor}
              </span>
              <span style={{
                fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
                color: isAtrasado ? t.color.feedback.error.text : t.color.feedback.warning.text,
                background: isAtrasado ? t.color.feedback.error.bg : t.color.feedback.warning.bg,
                borderRadius: t.radius.full, padding: `2px ${t.space[2]}px`, fontFamily: t.font.family.sans,
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
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [periodo, setPeriodo] = useUrlFilter('periodo', '12')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <DashboardSkeleton kpis={4} blocks={[t.size.chart.md, t.size.chart.md]} />
  }

  const kpis = [
    { label: 'Receitas do mês',  value: 'R$ 892.450', trend: '12,4% vs mês ant.', up: true  },
    { label: 'Despesas do mês',  value: 'R$ 634.120', trend: '3,1% vs mês ant.',  up: false },
    { label: 'Saldo disponível', value: 'R$ 258.330', trend: '28,7% vs mês ant.', up: true  },
    { label: 'Inadimplência',    value: 'R$ 45.200',  trend: '5,2% vs mês ant.',  up: false },
  ]

  // Dados filtrados: período fatia os últimos N meses das séries mensais
  const nMeses = Number(periodo)
  const chartLabels = monthLabels.slice(-nMeses)
  const lineSeries = [
    { name: 'Receitas', data: revenueData.slice(-nMeses), color: t.color.brand[600] },
    { name: 'Despesas', data: expenseData.slice(-nMeses), color: t.color.feedback.error.solid },
  ]

  const yFormat = (v: number) =>
    v >= 1000000 ? `R$ ${(v / 1000000).toFixed(1)}M` : `R$ ${(v / 1000).toFixed(0)}K`

  const donutSlices = donutData.map(d => ({ label: d.label, value: d.pct, color: d.color }))

  return (
    <DashboardGrid>
      <DashboardHeader
        title="Financeiro"
        subtitle="Receitas, despesas, orçamento e vencimentos"
        actions={
          <FilterSelect
            ariaLabel="Filtrar por período"
            options={[
              { value: '3',  label: 'Últimos 3 meses' },
              { value: '6',  label: 'Últimos 6 meses' },
              { value: '12', label: 'Últimos 12 meses' },
            ]}
            value={periodo}
            onChange={setPeriodo}
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
          />
        ))}
      </DashboardRow>

      {/* Fileira 2 — Receitas vs despesas + Categorias */}
      <DashboardRow>
        <DashboardCard
          title={`Receitas vs despesas (${nMeses} meses)`}
          flex={2}
          action={
            <ChartLegend
              marker="line"
              items={[
                { label: 'Receitas', color: t.color.brand[600] },
                { label: 'Despesas', color: t.color.feedback.error.solid },
              ]}
            />
          }
        >
          <LineChart
            series={lineSeries}
            labels={chartLabels}
            height={t.size.chart.md}
            yFormat={yFormat}
            area
            showLegend={false}
          />
        </DashboardCard>

        <DashboardCard title="Despesas por categoria" flex={1}>
          <DonutChart
            data={donutSlices}
            height={t.size.chart.md}
            centerValue="R$ 634K"
            centerLabel="no mês"
            showLegend
            valueFormat={(v) => `${v}%`}
          />
        </DashboardCard>
      </DashboardRow>

      {/* Fileira 3 — Orçamento + Atividade por hora */}
      <DashboardRow>
        <DashboardCard title="Orçamento anual" flex={1}>
          <ArcGauge colors={colors} />
        </DashboardCard>
        <DashboardCard title="Atividade de receita por hora" flex={2}>
          <HeatmapChart
            data={heatmapData}
            rowLabels={heatmapRows}
            colLabels={heatmapCols}
            colors={colors}
            isGbMode={isGbMode}
          />
        </DashboardCard>
      </DashboardRow>

      {/* Fileira 4 — Vencimentos */}
      <DashboardCard title="Vencimentos próximos (30 dias)">
        <VencimentosList colors={colors} isGbMode={isGbMode} />
      </DashboardCard>
    </DashboardGrid>
  )
}
