// TODO (backend):
// - Unificar nomenclatura de permissão: `nutrition_dashboard_view` (singular) vs módulo `nutritions` (plural) — canonizar antes de implementar RBAC
// - Contrato único de UM/conversão: `factor_type` M (divide) vs D (multiplica) — definir enum e documentar no schema
// - Alinhar agregação: listagem usa `quantity`; relatório usa `quantity_kg` / `average_cost` / `total_cost` / `average_consumption` — unificar campo por endpoint
// - Reduzir múltiplos endpoints AJAX (saldo, consumo, cobertura, armazéns) a um contrato coeso: `/nutrition/stock/summary?period=&product=&warehouse=`
// - Processar arquivos diferidos (Lei 8): importações de NF/XML de entrada de estoque em fila assíncrona; expor status via polling ou WebSocket

import { useEffect, useState } from 'react'
import {
  Package,
  ChevronDown,
  BarChart2,
  TrendingDown,
  Activity,
} from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { SparklineArea } from '../../components/ui/SparklineArea'
import { Button } from '../../components/ui/Button'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { BarChart } from '../../components/ui/BarChart'
import { LineChart } from '../../components/ui/LineChart'

// ─── Mock data ────────────────────────────────────────────────────────────────

// KPI sparklines (últimas 7 semanas)
const kpiSparklines: Record<string, number[]> = {
  'Saldo Total': [142000, 138500, 151200, 147800, 155000, 149300, 157600],
  'Consumo Médio Diário': [3820, 3940, 3870, 4010, 3950, 4080, 4120],
}

// Gráfico 1 — Saldo de estoque por armazém (kg)
const mockSaldoArmazem = [
  { label: 'Armazém A', value: 48200, color: t.chart.series[0] },
  { label: 'Armazém B', value: 36700, color: t.chart.series[1] },
  { label: 'Armazém C', value: 29100, color: t.chart.series[2] },
  { label: 'Armazém D', value: 24600, color: t.chart.series[3] },
  { label: 'Silo Ext.', value: 19000, color: t.chart.series[4] },
]

// Gráfico 2 — Evolução de consumo de ração (kg/semana, 2 séries)
const mockConsumoLabels = ['Jan W1', 'Jan W2', 'Jan W3', 'Feb W1', 'Feb W2', 'Feb W3', 'Mar W1', 'Mar W2']
const mockConsumoSeries = [
  {
    name: 'Ração Terminação',
    data: [26800, 27400, 28100, 27600, 29200, 28700, 30100, 29600],
    color: t.chart.series[0],
  },
  {
    name: 'Ração Crescimento',
    data: [18200, 18700, 19100, 18400, 19800, 19200, 20400, 19900],
    color: t.chart.series[2],
  },
]

// Gráfico 3 — Cobertura de estoque por produto (dias restantes), ordenado desc
// Itens com cobertura ≤ 14 dias recebem cor crítica
const CRITICO_THRESHOLD = 14
const mockCoberturaProdutos = [
  { label: 'Milho Moído',       value: 62, color: t.chart.series[0] },
  { label: 'Farelo de Soja',    value: 48, color: t.chart.series[1] },
  { label: 'Núcleo Mineral',    value: 35, color: t.chart.series[2] },
  { label: 'Uréia Pecuária',    value: 27, color: t.chart.series[3] },
  { label: 'Sal Mineral',       value: 21, color: t.chart.series[4] },
  { label: 'Premix Vitamínico', value: 12, color: t.color.feedback.error.solid },
  { label: 'Calcário',          value: 9,  color: t.color.feedback.error.solid },
  { label: 'Bicarbonato',       value: 7,  color: t.color.feedback.error.solid },
].sort((a, b) => b.value - a.value)

// ─── KPI derivados ────────────────────────────────────────────────────────────

const saldoTotalKg = mockSaldoArmazem.reduce((acc, d) => acc + d.value, 0)
const coberturaMediaDias = Math.round(
  mockCoberturaProdutos.reduce((acc, d) => acc + d.value, 0) / mockCoberturaProdutos.length,
)
const itensEmEstoque = mockCoberturaProdutos.length
// Consumo médio diário = média entre os últimos pontos das duas séries dividida por 7 (por semana → dia)
const consumoMedioDiario = Math.round(
  mockConsumoSeries.reduce((acc, s) => acc + s.data[s.data.length - 1], 0) / 7,
)
const itensCriticos = mockCoberturaProdutos.filter(d => d.value <= CRITICO_THRESHOLD).length

// ─── Trend badge (idêntico ao DashLotacaoCurrais) ────────────────────────────

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
        fontSize: 9,
      }}>
        {up ? '▲' : '▼'}
      </span>
      {value}
    </span>
  )
}

// ─── DashEstoqueNutricao ──────────────────────────────────────────────────────

export default function DashEstoqueNutricao() {
  const { colors, isGbMode } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

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

  const kpis = [
    {
      label: 'Saldo Total',
      value: `${(saldoTotalKg / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} t`,
      trend: '5,2% vs mês ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: 'Saldo Total',
      sparkColor: t.chart.series[0],
    },
    {
      label: 'Cobertura Média',
      value: `${coberturaMediaDias} dias`,
      trend: itensCriticos > 0
        ? `${itensCriticos} item${itensCriticos > 1 ? 's' : ''} crítico${itensCriticos > 1 ? 's' : ''}`
        : 'Todos acima do limite',
      up: itensCriticos === 0,
      valueColor: itensCriticos > 0
        ? (t.color.feedback.warning.text as string)
        : (colors.fg.default as string),
      sparkKey: null,
      sparkColor: t.chart.series[1],
    },
    {
      label: 'Itens em Estoque',
      value: String(itensEmEstoque),
      trend: 'produtos ativos',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: null,
      sparkColor: t.chart.series[2],
    },
    {
      label: 'Consumo Médio Diário',
      value: `${consumoMedioDiario.toLocaleString('pt-BR')} kg/dia`,
      trend: '1,8% vs sem. ant.',
      up: false,
      valueColor: colors.fg.default as string,
      sparkKey: 'Consumo Médio Diário',
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
          <Package size={13} color={colors.fg.subtle as string} />
          <span style={{
            fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold,
            color: colors.fg.default as string,
          }}>
            Estoque Nutrição
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          <Button variant="secondary" size="sm" iconRight={<ChevronDown size={11} />}>
            Últimos 60 dias
          </Button>
          <Button variant="secondary" size="sm" iconRight={<ChevronDown size={11} />}>
            Todos os Produtos
          </Button>
          <Button variant="secondary" size="sm" iconRight={<ChevronDown size={11} />}>
            Todos os Armazéns
          </Button>
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

      {/* ── Gráficos linha 1: Saldo por Armazém + Evolução de Consumo ────────── */}
      <div style={{ display: 'flex' }}>

        {/* Gráfico 1 — Saldo de estoque por armazém */}
        <div style={{ flex: 1, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <BarChart2 size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
              Saldo por Armazém (kg)
            </span>
          </div>
          <BarChart
            data={mockSaldoArmazem}
            height={240}
            yFormat={(v) => `${(v / 1000).toFixed(0)}t`}
          />
        </div>

        <VDivider color={bc} />

        {/* Gráfico 2 — Evolução de consumo de ração no tempo */}
        <div style={{ flex: 1, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <Activity size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
              Evolução de Consumo (kg/semana)
            </span>
          </div>
          <LineChart
            series={mockConsumoSeries}
            labels={mockConsumoLabels}
            height={240}
            area
            showLegend
            yFormat={(v) => `${(v / 1000).toFixed(0)}t`}
          />
        </div>

      </div>

      <HDivider color={bc} />

      {/* ── Gráfico 3 — Cobertura de estoque por produto (dias restantes) ────── */}
      <div style={{ padding: `${t.space[5]}px` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
          <TrendingDown size={12} color={colors.fg.subtle as string} />
          <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
            Cobertura por Produto (dias restantes) — itens em vermelho abaixo de {CRITICO_THRESHOLD} dias
          </span>
        </div>
        <BarChart
          data={mockCoberturaProdutos}
          height={260}
          horizontal
          yFormat={(v) => `${Math.round(v)}d`}
        />
      </div>

    </div>
  )
}
