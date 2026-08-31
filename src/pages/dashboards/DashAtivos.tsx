import { useState, useEffect } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { usePrefersReducedMotion } from '../../components/ui/usePrefersReducedMotion'
import { GroupedBarChart } from '../../components/ui/GroupedBarChart'
import { DashboardFilters } from '../../components/ui/DashboardFilters'
import { DashboardAnalysis } from '../../components/ui/DashboardAnalysis'
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

// ─── Ativos por Categoria ──────────────────────────────────────────────────────

const CATEGORIAS = [
  { label: 'Tratores',     total: 85, op: 72 },
  { label: 'Implementos',  total: 67, op: 54 },
  { label: 'Veículos',     total: 48, op: 43 },
  { label: 'Equipamentos', total: 52, op: 46 },
  { label: 'Benfeitorias', total: 34, op: 28 },
  { label: 'Outros',       total: 56, op: 55 },
]

const CATEGORIAS_LABELS = CATEGORIAS.map(c => c.label)

const CATEGORIAS_SERIES = [
  {
    name: 'Total',
    data: CATEGORIAS.map(c => c.total),
    color: t.color.brand[600],
  },
  {
    name: 'Em operação',
    data: CATEGORIAS.map(c => c.op),
    color: t.color.brand[200],
  },
]

// ─── Status Cards ─────────────────────────────────────────────────────────────

interface StatusItem {
  label: string
  count: number
  pct: number
  color: string
}

const STATUS_ITEMS: StatusItem[] = [
  { label: 'Operacional',          count: 298, pct: 87.1, color: t.color.brand[600] },
  { label: 'Manutenção preventiva', count: 13,  pct: 3.8,  color: t.color.feedback.notice },
  { label: 'Corretiva / Parado',   count: 18,  pct: 5.3,  color: t.color.feedback.error.text },
  { label: 'Aposentado / Baixa',   count: 13,  pct: 3.8,  color: t.color.neutral[400] },
]

function StatusCards() {
  const { colors, isGbMode } = useTheme()
  const reducedMotion = usePrefersReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(id)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
      {STATUS_ITEMS.map((item, i) => (
        <div
          key={i}
          style={{
            padding: `${t.space[2]}px ${t.space[3]}px`,
            borderRadius: t.radius.lg,
            border: `1px solid ${colors.border.default}`,
            background: isGbMode ? t.color.state.row.hoverGb : t.color.state.row.hover,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[1] + 2 }}>
            <span style={{ fontSize: t.font.size.sm, color: colors.fg.muted as string, fontFamily: t.font.family.sans }}>{item.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>{item.pct}%</span>
              <span style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.semibold, color: colors.fg.default as string, fontFamily: t.font.family.sans }}>{item.count}</span>
            </div>
          </div>
          <div style={{
            height: 6,
            borderRadius: t.radius.full,
            background: isGbMode ? t.color.state.track.gb : t.color.state.track.base,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: mounted || reducedMotion ? `${item.pct}%` : '0%',
              background: item.color,
              borderRadius: t.radius.full,
              // Sem movimento quando o usuário pediu menos movimento no SO: a
              // barra aparece já no valor final, sem crescer.
              transition: reducedMotion
                ? undefined
                : `width ${t.animation.duration.slower} ${t.animation.easing.standard} ${i * 80}ms`,
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Manutenções por Mês ──────────────────────────────────────────────────────

const MANUT_DATA = [
  { prev: 8, cor: 3 }, { prev: 6, cor: 5 }, { prev: 9, cor: 2 }, { prev: 7, cor: 4 },
  { prev: 10, cor: 3 }, { prev: 8, cor: 6 }, { prev: 11, cor: 2 }, { prev: 9, cor: 4 },
  { prev: 12, cor: 3 }, { prev: 10, cor: 5 }, { prev: 13, cor: 2 }, { prev: 11, cor: 4 },
]

const MANUT_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const MANUT_SERIES = [
  {
    name: 'Preventivas',
    data: MANUT_DATA.map(d => d.prev),
    color: t.color.brand[600],
  },
  {
    name: 'Corretivas',
    data: MANUT_DATA.map(d => d.cor),
    color: t.color.feedback.error.text,
  },
]

// ─── DashAtivos ───────────────────────────────────────────────────────────────

const ATIVOS_KPIS = [
  { label: 'Total de ativos',   value: '342',     trend: '5,4%',  up: true  },
  { label: 'Em operação',       value: '298',     trend: '3,2%',  up: true  },
  { label: 'Em manutenção',     value: '31',      trend: '12,4%', up: false },
  { label: 'Valor patrimonial', value: 'R$ 8,4M', trend: '2,1%',  up: true  },
]

export default function DashAtivos() {
  const [loading, setLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [periodo, setPeriodo] = useUrlFilter('periodo', '12')

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(id)
  }, [])

  const showSkeleton = useDelayedLoading(loading)

  if (loading) {
    // Anti-flash: espera curta não pisca a casca; anti-flicker: uma vez
    // visível, ela fica o mínimo de `t.delay.loadingMin`.
    return showSkeleton ? <DashboardSkeleton kpis={4} blocks={[t.size.chart.lg, t.size.chart.md]} /> : null
  }

  // Dados filtrados: período fatia os últimos N meses da série de manutenções
  const nMeses = Number(periodo)
  const manutLabels = MANUT_LABELS.slice(-nMeses)
  const manutSeries = MANUT_SERIES.map((s) => ({ ...s, data: s.data.slice(-nMeses) }))

  // Leitura da tela — os mesmos dados dos blocos, na ordem em que aparecem
  const analise: DashboardReadingInput = {
    title: 'Ativos',
    scope: `frota da fazenda · últimos ${nMeses} meses`,
    kpis: ATIVOS_KPIS,
    blocks: [
      {
        block: 'Ativos por categoria',
        kind: 'composition',
        labels: CATEGORIAS_LABELS,
        series: [{ name: 'Total', data: CATEGORIAS.map((c) => c.total) }],
        unit: 'ativos',
      },
      {
        block: 'Status dos ativos',
        kind: 'composition',
        labels: STATUS_ITEMS.map((item) => item.label),
        series: [{ name: 'Ativos', data: STATUS_ITEMS.map((item) => item.count) }],
        unit: 'ativos',
        // Composição de estado: concentrar no estado bom é o objetivo, não risco.
        concentrationRisk: false,
      },
      {
        block: 'Manutenções por mês',
        kind: 'timeline',
        labels: manutLabels,
        series: manutSeries.map((serie) => ({ name: serie.name, data: serie.data })),
        unit: 'manutenções',
      },
    ],
    notes: [
      `Em operação hoje: ${CATEGORIAS.reduce((acc, c) => acc + c.op, 0)} de ${CATEGORIAS.reduce((acc, c) => acc + c.total, 0)} ativos.`,
    ],
  }

  return (
    <DashboardGrid>
      <DashboardHeader
        title="Ativos"
        subtitle="Patrimônio, operação e manutenções da frota"
        actions={
          <>
            <DashboardAnalysis input={analise} fonte="base de ativos" />
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
        {ATIVOS_KPIS.map((kpi) => (
          <DashboardKpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            up={kpi.up}
          />
        ))}
      </DashboardRow>

      {/* Fileira 2 — Categorias + Status */}
      <DashboardRow>
        <DashboardCard title="Ativos por categoria" flex={3}>
          <GroupedBarChart
            series={CATEGORIAS_SERIES}
            labels={CATEGORIAS_LABELS}
            height={t.size.chart.lg}
            showLegend
          />
        </DashboardCard>
        <DashboardCard title="Status dos ativos" flex={2}>
          <StatusCards />
        </DashboardCard>
      </DashboardRow>

      {/* Fileira 3 — Manutenções */}
      <DashboardCard title="Manutenções por mês">
        <GroupedBarChart
          series={manutSeries}
          labels={manutLabels}
          height={t.size.chart.md}
          showLegend
        />
      </DashboardCard>
    </DashboardGrid>
  )
}
