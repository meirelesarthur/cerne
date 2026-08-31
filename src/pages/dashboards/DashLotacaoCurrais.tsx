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
import { DonutChart } from '../../components/ui/DonutChart'
import { StackedBarChart } from '../../components/ui/StackedBarChart'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Icon } from '../../components/ui/Icon'
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

// Pátios do confinamento — cada um escala os mocks de status/ocupação por um
// fator proporcional (não há dado real por pátio nos mocks ainda)
// pátios refletem feedlot_yards
const mockPatios = [
  { value: 'principal', label: 'Pátio Principal', fator: 1 },
  { value: 'sul',       label: 'Pátio Sul',       fator: 0.62 },
  { value: 'novo',      label: 'Pátio Novo',       fator: 0.35 },
]

// Histórico recente de mudança de status por curral (3–5 últimas)
// reflete feedlot_corral_status_histories (before_status/after_status)
const mockHistoricoStatus = [
  { curral: 'Curral 4',  de: 'Em manejo',   para: 'Ocupado',     data: '30/08/2026' },
  { curral: 'Curral 11', de: 'Ocupado',     para: 'Disponível',  data: '29/08/2026' },
  { curral: 'Curral 9',  de: 'Manutenção',  para: 'Disponível',  data: '28/08/2026' },
  { curral: 'Curral 2',  de: 'Disponível',  para: 'Ocupado',     data: '27/08/2026' },
  { curral: 'Curral 7',  de: 'Ocupado',     para: 'Em manejo',   data: '26/08/2026' },
]

const statusBadgeVariant: Record<string, BadgeVariant> = {
  'Disponível': 'success',
  'Ocupado': 'info',
  'Em manejo': 'warning',
  'Manutenção': 'danger',
}

// ─── DashLotacaoCurrais ───────────────────────────────────────────────────────

export default function DashLotacaoCurrais() {
  const { colors } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
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

  // Dados escalados pelo pátio selecionado — variação proporcional simples sobre os mocks
  const patioAtual = mockPatios.find((p) => p.value === patio) ?? mockPatios[0]
  const stackedSeriesPatio = mockStackedSeries.map((s) => ({
    ...s,
    data: s.data.map((v) => Math.round(v * patioAtual.fator)),
  }))
  const statusDataPatio = mockStatusData.map((d) => ({
    ...d,
    value: Math.max(1, Math.round(d.value * patioAtual.fator)),
  }))

  // KPI derivados dos mocks
  const totalAnimais = stackedSeriesPatio[0].data.reduce((a, b) => a + b, 0)
  const capacidadeTotal = stackedSeriesPatio.reduce(
    (acc, s) => acc + s.data.reduce((a, b) => a + b, 0),
    0,
  )
  const curraisDisponiveis = statusDataPatio.find(d => d.label === 'Disponível')?.value ?? 0
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

  const analise: DashboardReadingInput = {
    title: 'Lotação de Currais',
    scope: setor === 'todos' ? 'todos os setores do pátio' : `setor ${setor}`,
    kpis,
    blocks: [
      {
        block: 'Distribuição por status',
        kind: 'composition',
        labels: statusDataPatio.map((d) => d.label),
        series: [{ name: 'Currais', data: statusDataPatio.map((d) => d.value) }],
        unit: 'currais',
        concentrationRisk: false,
      },
      {
        block: 'Ocupação por setor (cab.)',
        kind: 'timeline',
        labels: mockSetores,
        series: stackedSeriesPatio.map((s) => ({ name: s.name, data: s.data })),
        unit: 'cabeças',
      },
    ],
    notes: [`Taxa de ocupação do pátio no recorte: ${taxaOcupacao}%.`],
  }

  return (
    <DashboardGrid>
      <DashboardHeader
        title="Lotação de Currais"
        subtitle="Ocupação, status e capacidade do pátio de confinamento"
        actions={
          <>
            <DashboardAnalysis input={analise} fonte="base do painel" />
            <DashboardFilters
              fields={[
                {
                  label: 'Pátio',
                  value: patio,
                  onChange: setPatio,
                  defaultValue: 'principal',
                  options: mockPatios.map((p) => ({ value: p.value, label: p.label })),
                },
                {
                  label: 'Setor',
                  value: setor,
                  onChange: setSetor,
                  defaultValue: 'todos',
                  options: [
                    { value: 'todos', label: 'Todos os Setores' },
                    ...mockSetores.map((s) => ({ value: s, label: s })),
                  ],
                },
              ]}
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
            data={statusDataPatio}
            height={t.size.chart.lg}
            centerLabel="currais"
            centerValue={String(statusDataPatio.reduce((a, d) => a + d.value, 0))}
            showLegend
            valueFormat={(v) => `${v} currais`}
          />
        </DashboardCard>
        <FocusableChartCard
          title="Ocupação por setor (cab.)"
          series={stackedSeriesPatio.map((s) => ({
            ...s,
            data: s.data.filter((_, i) => setor === 'todos' || mockSetores[i] === setor),
          }))}
        >
          {(series) => (
            <StackedBarChart
              series={series}
              labels={mockSetores.filter((s) => setor === 'todos' || s === setor)}
              height={t.size.chart.lg}
              horizontal
              showLegend
              yFormat={(v) => `${v}`}
            />
          )}
        </FocusableChartCard>
      </DashboardRow>

      {/* Fileira 3 — Histórico recente de status (drill-down por curral) */}
      <DashboardCard title="Histórico recente de status">
        <div role="table" aria-label="Histórico recente de status">
          <div role="row" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr',
            gap: `${t.space[2]}px ${t.space[4]}px`,
            paddingBottom: t.space[2],
            borderBottom: `1px solid ${colors.border.default as string}`,
            fontSize: t.font.size.xs,
            fontWeight: t.font.weight.semibold,
            color: colors.fg.subtle as string,
            fontFamily: t.font.family.sans,
          }}>
            <span role="columnheader">Curral</span>
            <span role="columnheader">Mudança de status</span>
            <span role="columnheader" style={{ textAlign: 'right' }}>Data</span>
          </div>
          {mockHistoricoStatus.map((h, i) => {
            const isLast = i === mockHistoricoStatus.length - 1
            return (
              <div
                key={`${h.curral}-${h.data}`}
                role="row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr 1fr',
                  gap: `${t.space[2]}px ${t.space[4]}px`,
                  alignItems: 'center',
                  padding: `${t.space[3]}px 0`,
                  borderBottom: isLast ? 'none' : `1px solid ${colors.border.default as string}`,
                  fontFamily: t.font.family.sans,
                }}
              >
                <span role="cell" style={{
                  fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold,
                  color: colors.fg.default as string,
                }}>
                  {h.curral}
                </span>
                <span role="cell" style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
                  <Badge label={h.de} variant={statusBadgeVariant[h.de]} />
                  <Icon name="arrow-right" size="xs" color={colors.fg.subtle as string} />
                  <Badge label={h.para} variant={statusBadgeVariant[h.para]} />
                </span>
                <span role="cell" style={{
                  fontSize: t.font.size.sm, color: colors.fg.subtle as string,
                  textAlign: 'right',
                }}>
                  {h.data}
                </span>
              </div>
            )
          })}
        </div>
      </DashboardCard>
    </DashboardGrid>
  )
}
