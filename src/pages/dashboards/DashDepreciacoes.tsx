import { useState, useEffect } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { StackedBarChart } from '../../components/ui/StackedBarChart'
import { DonutChart } from '../../components/ui/DonutChart'
import { LineChart } from '../../components/ui/LineChart'
import { ChartLegend } from '../../components/ui/ChartLegend'
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

// ─── Stacked Bar Data ─────────────────────────────────────────────────────────

const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const STACKED_DATA: { maq: number; vei: number; benf: number; outros: number }[] = [
  { maq: 18000, vei: 12000, benf: 8000, outros: 3200 },
  { maq: 17500, vei: 11800, benf: 7800, outros: 3000 },
  { maq: 19000, vei: 12500, benf: 8200, outros: 3300 },
  { maq: 18500, vei: 11500, benf: 8100, outros: 3100 },
  { maq: 20000, vei: 13000, benf: 8500, outros: 3400 },
  { maq: 19500, vei: 12800, benf: 8300, outros: 3250 },
  { maq: 21000, vei: 13500, benf: 8700, outros: 3600 },
  { maq: 20500, vei: 13200, benf: 8400, outros: 3450 },
  { maq: 22000, vei: 14000, benf: 9000, outros: 3700 },
  { maq: 21500, vei: 13800, benf: 8800, outros: 3550 },
  { maq: 23000, vei: 14500, benf: 9200, outros: 3800 },
  { maq: 22500, vei: 14200, benf: 9100, outros: 3650 },
]

const STACKED_SERIES = [
  { name: 'Máquinas/Equip.', data: STACKED_DATA.map(d => d.maq), color: t.chart.series[0] },
  { name: 'Veículos',        data: STACKED_DATA.map(d => d.vei), color: t.chart.series[1] },
  { name: 'Benfeitorias',    data: STACKED_DATA.map(d => d.benf), color: t.chart.series[2] },
  { name: 'Outros',          data: STACKED_DATA.map(d => d.outros), color: t.color.neutral[300] },
]

// ─── Donut Data ───────────────────────────────────────────────────────────────

const DONUT_SLICES = [
  { label: 'Máquinas',     value: 8_400_000 * 0.45, color: t.chart.series[0] },
  { label: 'Veículos',     value: 8_400_000 * 0.28, color: t.chart.series[1] },
  { label: 'Benfeitorias', value: 8_400_000 * 0.18, color: t.chart.series[2] },
  { label: 'Outros',       value: 8_400_000 * 0.09, color: t.color.neutral[300] },
]

// ─── Projection Data ──────────────────────────────────────────────────────────

const PROJ_MONTHS_COUNT = 24
const CURRENT_MONTH = 11

function generateProjection() {
  return Array.from({ length: PROJ_MONTHS_COUNT }, (_, i) => {
    const base = 6_300_000 - i * 220_000
    const jitter = i < CURRENT_MONTH ? (Math.sin(i * 1.3) * 50_000) : 0
    return Math.max(base + jitter, 1_000_000)
  })
}

const PROJ_VALUES = generateProjection()
const PROJ_LABELS = Array.from({ length: PROJ_MONTHS_COUNT }, (_, i) => `M${i + 1}`)

// Duas séries com 24 pontos cada, sobrepostas no mês de corte (M12).
// "Realizado" mantém o último valor real para os meses futuros (linha plana),
// "Projeção" mantém o valor do ponto de corte para os meses passados — ambas
// se encontram em CURRENT_MONTH, produzindo a continuidade visual esperada.
const PROJ_SERIES_FULL = [
  {
    name: 'Realizado',
    data: PROJ_VALUES.map((v, i) => (i <= CURRENT_MONTH ? v : PROJ_VALUES[CURRENT_MONTH])),
    color: t.color.brand[600],
  },
  {
    name: 'Projeção',
    data: PROJ_VALUES.map((v, i) => (i >= CURRENT_MONTH ? v : PROJ_VALUES[CURRENT_MONTH])),
    color: t.color.brand[400],
  },
]

// ─── KPIs ─────────────────────────────────────────────────────────────────────

const DEP_KPIS = [
  { label: 'Valor total em bens',    value: 'R$ 8,4M',   trend: '2,1%', up: true  },
  { label: 'Depreciação mensal',     value: 'R$ 42.380', trend: null,   up: true  },
  { label: 'Depreciação acumulada',  value: 'R$ 2,1M',   trend: '6,3%', up: true  },
  { label: 'Valor residual',         value: 'R$ 6,3M',   trend: '0,8%', up: false },
]

// ─── DashDepreciacoes ─────────────────────────────────────────────────────────

export default function DashDepreciacoes() {
  const { colors } = useTheme()
  const [loading, setLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [periodo, setPeriodo] = useUrlFilter('periodo', '12')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const showSkeleton = useDelayedLoading(loading)

  if (loading) {
    // Anti-flash: espera curta não pisca a casca; anti-flicker: uma vez
    // visível, ela fica o mínimo de `t.delay.loadingMin`.
    return showSkeleton ? <DashboardSkeleton kpis={4} blocks={[t.size.chart.md, t.size.chart.md]} /> : null
  }

  // Dados filtrados: período fatia os últimos N meses da série empilhada
  const nMeses = Number(periodo)
  const stackedLabels = MONTHS_SHORT.slice(-nMeses)
  const stackedSeries = STACKED_SERIES.map((s) => ({ ...s, data: s.data.slice(-nMeses) }))

  return (
    <DashboardGrid>
      <DashboardHeader
        title="Depreciações"
        subtitle="Depreciação acumulada, composição e projeção do patrimônio"
        actions={
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
        }
      />

      {/* Fileira 1 — KPIs */}
      <DashboardRow>
        {DEP_KPIS.map((kpi) => (
          <DashboardKpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            up={kpi.up}
          />
        ))}
      </DashboardRow>

      {/* Fileira 2 — Depreciação por categoria */}
      <DashboardCard title="Depreciação por categoria">
        <StackedBarChart
          series={stackedSeries}
          labels={stackedLabels}
          height={t.size.chart.md}
          yFormat={(v) => `${(v / 1000).toFixed(0)}K`}
          showLegend
        />
      </DashboardCard>

      {/* Fileira 3 — Composição + Projeção */}
      <DashboardRow>
        <DashboardCard title="Composição por tipo de bem">
          <DonutChart
            data={DONUT_SLICES}
            height={t.size.chart.md}
            centerValue="R$ 8,4M"
            centerLabel="total"
            showLegend
            valueFormat={(v) => `R$ ${(v / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`}
          />
        </DashboardCard>
        <DashboardCard
          title="Projeção — próximos 24 meses"
          action={
            <ChartLegend
              marker="line"
              items={[
                { label: 'Realizado', color: t.color.brand[600] },
                { label: 'Projeção',  color: t.color.brand[400], dashed: true },
              ]}
            />
          }
        >
          <LineChart
            series={PROJ_SERIES_FULL}
            labels={PROJ_LABELS}
            height={t.size.chart.md}
            yFormat={(v) => `${(v / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`}
            area
            showLegend={false}
          />
        </DashboardCard>
      </DashboardRow>
    </DashboardGrid>
  )
}
