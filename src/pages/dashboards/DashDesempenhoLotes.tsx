// TODO (backend):
// - GMD robusto: tratar divisão por zero quando dias entre pesagens = 0 (devolver null e exibir "—")
// - Parametrizar divisor de arroba via configuração de tenant (hoje 30 kg fixo)
// - RBAC: permissões sugeridas `feedlot_weighing_performance_view` / `feedlot_weighing_performance_export`
// - Unificar relatórios "Pesagem do Confinamento" e "Gerenciamento de Lote" em endpoint único paginado
// - i18n: extrair strings literais de UI para catálogo de mensagens
// - Filtros de Período, Curral e Lote devem chamar endpoint filtrado (hoje filtram os mocks localmente)
// - Adicionar indicador de "última atualização" dos dados via timestamp da API

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  BarChart2,
  Activity,
  List,
} from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { SparklineArea } from '../../components/ui/SparklineArea'
import { FilterSelect } from '../../components/ui/FilterSelect'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { LineChart } from '../../components/ui/LineChart'
import { GroupedBarChart } from '../../components/ui/GroupedBarChart'

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
  'Ganho Total': [3200, 3580, 3940, 4260, 4600, 4920, 5180],
}

// Lista compacta de lotes com últimas pesagens
const mockLotesDetalhe = [
  { id: 'A-01', curral: 'Curral 4',  animais: 85, pesoMedio: 421, ganhoTotal: 8585, gmd: 1.45 },
  { id: 'B-03', curral: 'Curral 7',  animais: 72, pesoMedio: 390, ganhoTotal: 6840, gmd: 1.31 },
  { id: 'C-02', curral: 'Curral 2',  animais: 91, pesoMedio: 423, ganhoTotal: 7553, gmd: 1.38 },
  { id: 'D-05', curral: 'Curral 11', animais: 68, pesoMedio: 398, ganhoTotal: 6460, gmd: 1.52 },
  { id: 'E-04', curral: 'Curral 9',  animais: 79, pesoMedio: 376, ganhoTotal: 6004, gmd: 1.26 },
]

// ─── Trend badge (idêntico ao DashLotacaoCurrais) ─────────────────────────────

function Trend({ value, up }: { value: string; up: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
      fontFamily: t.font.family.sans,
      color: up ? t.color.feedback.success.text : t.color.feedback.error.text,
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 14, height: 14, borderRadius: t.radius.full,
        background: up ? t.color.feedback.success.bg : t.color.feedback.error.bg,
        fontSize: t.font.size['3xs'],
      }}>
        {up ? '▲' : '▼'}
      </span>
      {value}
    </span>
  )
}

// ─── DashDesempenhoLotes ──────────────────────────────────────────────────────

export default function DashDesempenhoLotes() {
  const { colors, isGbMode } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [periodo, setPeriodo] = useState('7')
  const [curral, setCurral] = useState('todos')
  const [lote, setLote] = useState('todos')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const bc = colors.border.default as string

  const cardStyle: React.CSSProperties = {
    margin: `${t.space[5]}px ${t.space[6]}px`,
    display: 'flex',
    flexDirection: 'column',
    background: colors.bg.surface,
    borderRadius: t.radius['2xl'],
    border: `1px solid ${bc}`,
    boxShadow: isGbMode ? t.shadow.cardDark : t.shadow.card,
    overflow: 'hidden',
    fontFamily: t.font.family.sans,
  }

  if (isLoading) {
    return (
      <div style={cardStyle}>
        <Skeleton height={640} />
      </div>
    )
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
      value: `${gmdMedio.toFixed(2)} kg/dia`,
      trend: '0,08 kg/dia vs mês ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: 'Média GMD',
      sparkColor: t.chart.series[0],
    },
    {
      label: 'Ganho Total',
      value: `${ganhoTotal.toLocaleString('pt-BR')} kg`,
      trend: '5,8% vs mês ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: 'Ganho Total',
      sparkColor: t.chart.series[1],
    },
    {
      label: 'Peso Médio Final',
      value: `${pesoMedioFinal.toLocaleString('pt-BR')} kg`,
      trend: '3,2% vs pesagem ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: null,
      sparkColor: t.chart.series[2],
    },
    {
      label: 'Lotes Ativos',
      value: String(lotesAtivos),
      trend: 'lotes em confinamento',
      up: true,
      valueColor: t.color.brand[600] as string,
      sparkKey: null,
      sparkColor: t.chart.series[0],
    },
  ]

  return (
    <div style={cardStyle}>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${t.space[4]}px ${t.space[5]}px`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          <TrendingUp size={13} color={colors.fg.subtle as string} />
          <span style={{
            fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold,
            color: colors.fg.default as string,
          }}>
            Desempenho de Lotes
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          <FilterSelect
            ariaLabel="Filtrar por período"
            options={[
              { value: '4', label: 'Últimas 4 pesagens' },
              { value: '7', label: 'Últimas 7 pesagens' },
            ]}
            value={periodo}
            onChange={setPeriodo}
          />
          <FilterSelect
            ariaLabel="Filtrar por curral"
            options={[
              { value: 'todos', label: 'Todos os currais' },
              ...mockLotesDetalhe.map((l) => ({ value: l.curral, label: l.curral })),
            ]}
            value={curral}
            onChange={setCurral}
          />
          <FilterSelect
            ariaLabel="Filtrar por lote"
            options={[
              { value: 'todos', label: 'Todos os lotes' },
              ...mockLoteLabels.map((l) => ({ value: l, label: l })),
            ]}
            value={lote}
            onChange={setLote}
          />
        </div>
      </div>

      <HDivider color={bc} />

      {/* ── KPI row ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex' }}>
        {kpis.flatMap((kpi, i) => [
          i > 0 ? <VDivider key={`d${i}`} color={bc} /> : null,
          <div key={kpi.label} style={{ flex: 1, padding: `${t.space[5]}px ${t.space[5]}px ${t.space[3]}px` }}>
            <div style={{
              fontSize: t.font.size.xs, color: colors.fg.subtle as string,
              marginBottom: t.space[1], fontFamily: t.font.family.sans,
            }}>
              {kpi.label}
            </div>
            <div style={{
              fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold,
              color: kpi.valueColor, lineHeight: 1.1, marginBottom: t.space[2],
              fontFamily: t.font.family.sans,
            }}>
              {kpi.value}
            </div>
            <Trend value={kpi.trend} up={kpi.up} />
            {kpi.sparkKey && (
              <div style={{ marginTop: t.space[3], height: 40 }}>
                <SparklineArea
                  data={kpiSparklines[kpi.sparkKey]}
                  color={kpi.sparkColor}
                  height={40}
                />
              </div>
            )}
          </div>,
        ])}
      </div>

      <HDivider color={bc} />

      {/* ── Gráficos: LineChart (evolução peso) + GroupedBarChart (GMD) ──────── */}
      <div style={{ display: 'flex' }}>

        {/* Gráfico 1 — Evolução de Peso Médio por Lote */}
        <div style={{ flex: 1, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <Activity size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
              Evolução de Peso Médio por Lote (kg)
            </span>
          </div>
          <LineChart
            series={lotesSeries}
            labels={pesagemLabels}
            height={260}
            area={false}
            showLegend
            yFormat={(v) => `${v} kg`}
          />
        </div>

        <VDivider color={bc} />

        {/* Gráfico 2 — Comparativo de GMD por Lote */}
        <div style={{ flex: 1, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <BarChart2 size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
              Comparativo de GMD: atual vs meta (kg/dia)
            </span>
          </div>
          <GroupedBarChart
            series={gmdSeries}
            labels={gmdLabels}
            height={260}
            showLegend
            yFormat={(v) => `${v.toFixed(2)} kg/dia`}
          />
        </div>

      </div>

      <HDivider color={bc} />

      {/* ── Lista compacta de lotes ───────────────────────────────────────────── */}
      <div style={{ padding: `${t.space[5]}px` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
          <List size={12} color={colors.fg.subtle as string} />
          <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
            Detalhamento por Lote
          </span>
        </div>

        {/* Cabeçalho da lista */}
        <div style={{
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
          <span>Lote</span>
          <span>Curral</span>
          <span style={{ textAlign: 'right' }}>Animais</span>
          <span style={{ textAlign: 'right' }}>Peso Médio</span>
          <span style={{ textAlign: 'right' }}>GMD</span>
        </div>

        {/* Linhas */}
        {lotesFiltrados.map((lote, i) => {
          const isAboveMeta = lote.gmd >= 1.40
          const isLast = i === lotesFiltrados.length - 1
          return (
            <div
              key={lote.id}
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
              <span style={{
                fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold,
                color: colors.fg.default as string,
              }}>
                {lote.id}
              </span>
              <span style={{ fontSize: t.font.size.sm, color: colors.fg.subtle as string }}>
                {lote.curral}
              </span>
              <span style={{
                fontSize: t.font.size.sm, color: colors.fg.default as string,
                textAlign: 'right',
              }}>
                {lote.animais.toLocaleString('pt-BR')}
              </span>
              <span style={{
                fontSize: t.font.size.sm, color: colors.fg.default as string,
                textAlign: 'right',
              }}>
                {lote.pesoMedio.toLocaleString('pt-BR')} kg
              </span>
              <span style={{
                fontSize: t.font.size.sm, fontWeight: t.font.weight.medium,
                color: isAboveMeta
                  ? (t.color.feedback.success.text as string)
                  : (t.color.feedback.error.text as string),
                textAlign: 'right',
              }}>
                {lote.gmd.toFixed(2)} kg/dia
              </span>
            </div>
          )
        })}
      </div>

    </div>
  )
}
