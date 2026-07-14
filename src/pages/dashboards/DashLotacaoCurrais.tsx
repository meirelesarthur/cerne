// TODO (backend):
// - Definir pageSlug e RBAC: permissão sugerida `feedlot_dashboard_view`
// - Validar fórmula de Taxa de Ocupação: animais_alojados / capacidade_total × 100
// - Canonizar enum de status de curral (Disponível | Ocupado | Em manejo | Manutenção) na API
// - Implementar drill-down por setor e por curral individual
// - Adicionar indicador de "última atualização" dos dados via timestamp da API
// - Filtros de Pátio e Setor devem chamar endpoint filtrado (hoje filtram os mocks localmente)

import { useEffect, useState } from 'react'
import {
  LayoutGrid,
  PieChart,
  BarChart2,
} from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { SparklineArea } from '../../components/ui/SparklineArea'
import { FilterSelect } from '../../components/ui/FilterSelect'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { DonutChart } from '../../components/ui/DonutChart'
import { StackedBarChart } from '../../components/ui/StackedBarChart'

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
    name: 'Animais alojados',
    data: [340, 480, 290, 520, 410],
    color: t.color.brand[600],
  },
  {
    name: 'Capacidade restante',
    data: [160, 20, 210, 80, 190],
    color: t.color.feedback.success.solid,
  },
]

const kpiSparklines: Record<string, number[]> = {
  'Taxa de Ocupação': [71, 74, 76, 79, 81, 83, 85],
  'Total de Animais': [1820, 1870, 1910, 1960, 1990, 2020, 2040],
}

// ─── Trend badge (idêntico ao DashSuprimentos) ────────────────────────────────

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

// ─── DashLotacaoCurrais ───────────────────────────────────────────────────────

export default function DashLotacaoCurrais() {
  const { colors, isGbMode } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  // Pátio único nos mocks — o filtro mantém o recorte explícito
  const [patio, setPatio] = useState('principal')
  const [setor, setSetor] = useState('todos')

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
      label: 'Taxa de Ocupação',
      value: `${taxaOcupacao}%`,
      trend: '2,1 p.p. vs mês ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: 'Taxa de Ocupação',
      sparkColor: t.color.brand[600],
    },
    {
      label: 'Total de Animais',
      value: totalAnimais.toLocaleString('pt-BR'),
      trend: '1,9% vs mês ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: 'Total de Animais',
      sparkColor: t.color.brand[600],
    },
    {
      label: 'Currais Disponíveis',
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
      label: 'Capacidade Total',
      value: capacidadeTotal.toLocaleString('pt-BR'),
      trend: 'cab. totais',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: null,
      sparkColor: t.color.brand[600],
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
          <LayoutGrid size={13} color={colors.fg.subtle as string} />
          <span style={{
            fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold,
            color: colors.fg.default as string,
          }}>
            Lotação de Currais
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
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

      {/* ── Gráficos: Donut (status) + StackedBar (por setor) ────────────────── */}
      <div style={{ display: 'flex' }}>

        {/* Gráfico 1 — Status dos Currais */}
        <div style={{ flex: 1, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <PieChart size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
              Distribuição por Status
            </span>
          </div>
          <DonutChart
            data={mockStatusData}
            height={260}
            centerLabel="currais"
            centerValue={String(mockStatusData.reduce((a, d) => a + d.value, 0))}
            showLegend
            valueFormat={(v) => `${v} currais`}
          />
        </div>

        <VDivider color={bc} />

        {/* Gráfico 2 — Animais alojados vs Capacidade restante por Setor */}
        <div style={{ flex: 1, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <BarChart2 size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
              Ocupação por Setor (cab.)
            </span>
          </div>
          <StackedBarChart
            series={mockStackedSeries.map((s) => ({
              ...s,
              data: s.data.filter((_, i) => setor === 'todos' || mockSetores[i] === setor),
            }))}
            labels={mockSetores.filter((s) => setor === 'todos' || s === setor)}
            height={260}
            horizontal
            showLegend
            yFormat={(v) => `${v}`}
          />
        </div>

      </div>
    </div>
  )
}
