// TODO (backend):
// - GMD robusto: tratar divisão por zero quando dias entre pesagens = 0 (devolver null e exibir "—")
// - Parametrizar divisor de arroba via configuração de tenant (hoje 30 kg fixo)
// - RBAC: permissões sugeridas `feedlot_weighing_performance_view` / `feedlot_weighing_performance_export`
// - Unificar relatórios "Pesagem do Confinamento" e "Gerenciamento de Lote" em endpoint único paginado
// - i18n: extrair strings literais de UI para catálogo de mensagens
// - Filtros de Período, Curral e Lote devem chamar endpoint filtrado (hoje filtram os mocks localmente)
// - Adicionar indicador de "última atualização" dos dados via timestamp da API

import { useEffect, useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { SparklineArea } from '../../components/ui/SparklineArea'
import { EmptyState } from '../../components/ui/EmptyState'
import { LineChart } from '../../components/ui/LineChart'
import { GroupedBarChart } from '../../components/ui/GroupedBarChart'
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

// Datas de pesagem (labels do LineChart)
const mockPesagemLabels = ['01/03', '15/03', '01/04', '15/04', '01/05', '15/05', '01/06']

// Evolução de peso médio por lote (kg) ao longo das pesagens
const mockLotesSeries = [
  {
    name: 'Lote A-01',
    data: [320, 338, 356, 372, 389, 405, 421],
    color: t.chart.series[0],
  },
  {
    name: 'Lote B-03',
    data: [295, 310, 327, 344, 359, 375, 390],
    color: t.chart.series[1],
  },
  {
    name: 'Lote C-02',
    data: [340, 355, 368, 382, 396, 409, 423],
    color: t.chart.series[2],
  },
]

// Labels dos lotes para o comparativo de GMD
const mockLoteLabels = ['Lote A-01', 'Lote B-03', 'Lote C-02', 'Lote D-05', 'Lote E-04']

// GMD atual vs meta por lote (kg/dia)
const mockGmdSeries = [
  {
    name: 'GMD atual',
    data: [1.45, 1.31, 1.38, 1.52, 1.26],
    color: t.chart.series[0],
  },
  {
    name: 'GMD meta',
    data: [1.40, 1.40, 1.40, 1.40, 1.40],
    color: t.chart.series[3],
  },
]

// Histórico de sparklines (7 pontos de GMD médio diário)
const kpiSparklines: Record<string, number[]> = {
  'Média GMD': [1.30, 1.33, 1.36, 1.38, 1.40, 1.42, 1.38],
  'Ganho total': [3200, 3580, 3940, 4260, 4600, 4920, 5180],
}

// Lista compacta de lotes com últimas pesagens
const mockLotesDetalhe = [
  { id: 'A-01', curral: 'Curral 4',  animais: 85, pesoMedio: 421, ganhoTotal: 8585, gmd: 1.45 },
  { id: 'B-03', curral: 'Curral 7',  animais: 72, pesoMedio: 390, ganhoTotal: 6840, gmd: 1.31 },
  { id: 'C-02', curral: 'Curral 2',  animais: 91, pesoMedio: 423, ganhoTotal: 7553, gmd: 1.38 },
  { id: 'D-05', curral: 'Curral 11', animais: 68, pesoMedio: 398, ganhoTotal: 6460, gmd: 1.52 },
  { id: 'E-04', curral: 'Curral 9',  animais: 79, pesoMedio: 376, ganhoTotal: 6004, gmd: 1.26 },
]


// ─── DashDesempenhoLotes ──────────────────────────────────────────────────────

export default function DashDesempenhoLotes() {
  const { colors } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [periodo, setPeriodo] = useUrlFilter('periodo', '7')
  const [curral, setCurral] = useUrlFilter('curral', 'todos')
  const [lote, setLote] = useUrlFilter('lote', 'todos')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const bc = colors.border.default as string

  const showSkeleton = useDelayedLoading(isLoading)

  if (isLoading) {
    // Anti-flash: espera curta não pisca a casca; anti-flicker: uma vez
    // visível, ela fica o mínimo de `t.delay.loadingMin`.
    return showSkeleton ? <DashboardSkeleton kpis={4} blocks={[t.size.chart.lg, t.size.chart.md]} /> : null
  }

  // ── KPIs derivados dos mocks ────────────────────────────────────────────────
  // Dados filtrados por curral/lote — base dos KPIs, gráficos e tabela
  const lotesFiltrados = mockLotesDetalhe.filter((l) =>
    (curral === 'todos' || l.curral === curral) &&
    (lote === 'todos' || `Lote ${l.id}` === lote)
  )
  const idsFiltrados = new Set(lotesFiltrados.map((l) => `Lote ${l.id}`))
  const nPesagens = Number(periodo)
  const pesagemLabels = mockPesagemLabels.slice(-nPesagens)
  const lotesSeries = mockLotesSeries
    .filter((s) => idsFiltrados.has(s.name))
    .map((s) => ({ ...s, data: s.data.slice(-nPesagens) }))
  const gmdIdx = mockLoteLabels
    .map((l, i) => (idsFiltrados.has(l) ? i : -1))
    .filter((i) => i >= 0)
  const gmdLabels = gmdIdx.map((i) => mockLoteLabels[i])
  const gmdSeries = mockGmdSeries.map((s) => ({ ...s, data: gmdIdx.map((i) => s.data[i]) }))

  const totalAnimais = lotesFiltrados.reduce((a, l) => a + l.animais, 0)
  const ganhoTotal = lotesFiltrados.reduce((a, l) => a + l.ganhoTotal, 0)

  // GMD médio ponderado por número de animais (guarda contra divisão por zero com filtro vazio)
  const gmdMedio = lotesFiltrados.reduce((a, l) => a + l.gmd * l.animais, 0) / Math.max(totalAnimais, 1)

  // Peso médio final: média simples dos pesos médios por lote
  const pesoMedioFinal = Math.round(
    lotesFiltrados.reduce((a, l) => a + l.pesoMedio, 0) / Math.max(lotesFiltrados.length, 1),
  )

  const lotesAtivos = lotesFiltrados.length

  const kpis = [
    {
      label: 'Média GMD',
      value: `${gmdMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg/dia`,
      trend: '0,08 kg/dia vs mês ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: 'Média GMD',
      sparkColor: t.chart.series[0],
    },
    {
      label: 'Ganho total',
      value: `${ganhoTotal.toLocaleString('pt-BR')} kg`,
      trend: '5,8% vs mês ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: 'Ganho total',
      sparkColor: t.chart.series[1],
    },
    {
      label: 'Peso médio final',
      value: `${pesoMedioFinal.toLocaleString('pt-BR')} kg`,
      trend: '3,2% vs pesagem ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: null,
      sparkColor: t.chart.series[2],
    },
    {
      label: 'Lotes ativos',
      value: String(lotesAtivos),
      trend: 'lotes em confinamento',
      up: true,
      valueColor: t.color.brand[600] as string,
      sparkKey: null,
      sparkColor: t.chart.series[0],
    },
  ]

  return (
    <DashboardGrid>
      <DashboardHeader
        title="Desempenho de Lotes"
        subtitle="GMD, evolução de peso e detalhamento dos lotes em confinamento"
        actions={
          <DashboardFilters
            fields={[
              {
                label: 'Período',
                value: periodo,
                onChange: setPeriodo,
                defaultValue: '7',
                options: [
                  { value: '4', label: 'Últimas 4 pesagens' },
                  { value: '7', label: 'Últimas 7 pesagens' },
                ],
              },
              {
                label: 'Curral',
                value: curral,
                onChange: setCurral,
                defaultValue: 'todos',
                options: [
                  { value: 'todos', label: 'Todos os currais' },
                  ...mockLotesDetalhe.map((l) => ({ value: l.curral, label: l.curral })),
                ],
              },
              {
                label: 'Lote',
                value: lote,
                onChange: setLote,
                defaultValue: 'todos',
                options: [
                  { value: 'todos', label: 'Todos os lotes' },
                  ...mockLoteLabels.map((l) => ({ value: l, label: l })),
                ],
              },
            ]}
          />
        }
      />

      {/* Filtro sem resultado não vira tela morta: um caminho de volta no lugar
          de KPIs zerados, gráficos "Sem dados" e tabela só com cabeçalho. */}
      {lotesFiltrados.length === 0 ? (
        <DashboardCard>
          <EmptyState
            variant="search"
            message="Nenhum lote nesse recorte"
            description="A combinação de curral e lote selecionada não tem pesagem no período."
            action={{
              label: 'Limpar filtros',
              onClick: () => { setCurral('todos'); setLote('todos') },
            }}
          />
        </DashboardCard>
      ) : (
        <>
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

      {/* Fileira 2 — Evolução de peso + GMD */}
      <DashboardRow>
        <DashboardCard title="Peso médio por lote (kg)">
          <LineChart
            series={lotesSeries}
            labels={pesagemLabels}
            height={t.size.chart.lg}
            area={false}
            showLegend
            yFormat={(v) => `${v} kg`}
          />
        </DashboardCard>
        <DashboardCard title="GMD: atual vs meta (kg/dia)">
          <GroupedBarChart
            series={gmdSeries}
            labels={gmdLabels}
            height={t.size.chart.lg}
            showLegend
            yFormat={(v) => `${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg/dia`}
          />
        </DashboardCard>
      </DashboardRow>

      {/* Fileira 3 — Detalhamento por lote */}
      <DashboardCard title="Detalhamento por lote">
        {/* Tabela de detalhamento — grid CSS com semântica de tabela via ARIA */}
        <div role="table" aria-label="Detalhamento por lote">
          {/* Cabeçalho da lista */}
          <div role="row" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
            gap: `${t.space[2]}px ${t.space[4]}px`,
            paddingBottom: t.space[2],
            borderBottom: `1px solid ${bc}`,
            fontSize: t.font.size.xs,
            fontWeight: t.font.weight.semibold,
            color: colors.fg.subtle as string,
            fontFamily: t.font.family.sans,
          }}>
            <span role="columnheader">Lote</span>
            <span role="columnheader">Curral</span>
            <span role="columnheader" style={{ textAlign: 'right' }}>Animais</span>
            <span role="columnheader" style={{ textAlign: 'right' }}>Peso Médio</span>
            <span role="columnheader" style={{ textAlign: 'right' }}>GMD</span>
          </div>

          {/* Linhas */}
          {lotesFiltrados.map((lote, i) => {
            const isAboveMeta = lote.gmd >= 1.40
            const isLast = i === lotesFiltrados.length - 1
            return (
              <div
                key={lote.id}
                role="row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                  gap: `${t.space[2]}px ${t.space[4]}px`,
                  alignItems: 'center',
                  padding: `${t.space[3]}px 0`,
                  borderBottom: isLast ? 'none' : `1px solid ${bc}`,
                  fontFamily: t.font.family.sans,
                }}
              >
                <span role="cell" style={{
                  fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold,
                  color: colors.fg.default as string,
                }}>
                  {lote.id}
                </span>
                <span role="cell" style={{ fontSize: t.font.size.sm, color: colors.fg.subtle as string }}>
                  {lote.curral}
                </span>
                <span role="cell" style={{
                  fontSize: t.font.size.sm, color: colors.fg.default as string,
                  textAlign: 'right',
                }}>
                  {lote.animais.toLocaleString('pt-BR')}
                </span>
                <span role="cell" style={{
                  fontSize: t.font.size.sm, color: colors.fg.default as string,
                  textAlign: 'right',
                }}>
                  {lote.pesoMedio.toLocaleString('pt-BR')} kg
                </span>
                <span role="cell" style={{
                  fontSize: t.font.size.sm, fontWeight: t.font.weight.medium,
                  color: isAboveMeta
                    ? (t.color.feedback.success.text as string)
                    : (t.color.feedback.error.text as string),
                  textAlign: 'right',
                }}>
                  {lote.gmd.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg/dia
                </span>
              </div>
            )
          })}
        </div>
      </DashboardCard>
        </>
      )}
    </DashboardGrid>
  )
}
