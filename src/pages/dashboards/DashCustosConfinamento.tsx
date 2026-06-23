// TODO (backend):
// - Criar painel unificado consolidando custeio por curral/lote (não existe hoje)
// - BLOQUEANTE DUV-401: resolver divergência de fórmula de nutrição `average_cost` vs `amount`
//   antes de conectar dados reais — resultado de custo por arroba diverge ~12% entre os dois cálculos
// - Extrair e validar fórmulas de custeio diferidas (Lei 8) via Spike técnico dedicado
// - Padronizar `pageSlug` em kebab-case (`custos-confinamento`) e registrar RBAC explícito
//   com permissão sugerida `feedlot_costs_dashboard_view`
// - Permitir recorte por curral/pátio/lote diretamente no filtro (hoje apenas visuais/mock)
// - Exportação consistente PDF/Excel — corrigir bug de inclusão Excel (DUV-402)
// - Adicionar indicador de "última atualização" dos dados via timestamp da API

import { useEffect, useState } from 'react'
import {
  DollarSign,
  ChevronDown,
  BarChart2,
  TrendingUp,
  PieChart,
} from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { SparklineArea } from '../../components/ui/SparklineArea'
import { Button } from '../../components/ui/Button'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { DonutChart } from '../../components/ui/DonutChart'
import { StackedBarChart } from '../../components/ui/StackedBarChart'
import { LineChart } from '../../components/ui/LineChart'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']

// Custo por arroba (R$/@) ao longo do período
const mockCustoArroba = [148, 152, 155, 151, 158, 162]

// Custo animal/dia (R$/cab/dia)
const mockCustoAnimalDia = [18.4, 18.9, 19.2, 18.7, 19.6, 20.1]

// COE acumulado por mês (R$ mil)
const mockCoeTotal = [312, 328, 341, 335, 358, 374]

// Margem bruta por mês (%)
const mockMargemBruta = [14.2, 13.8, 13.1, 14.5, 12.9, 12.3]

// Composição de custo por mês em R$ mil (Ração, Sanitário, Mão de obra, Depreciação, Outros)
const mockStackedSeries = [
  {
    name: 'Ração',
    data: [185, 196, 204, 199, 213, 224],
    color: t.chart.series[0],
  },
  {
    name: 'Sanitário',
    data: [38, 40, 42, 39, 44, 46],
    color: t.chart.series[1],
  },
  {
    name: 'Mão de obra',
    data: [52, 52, 54, 53, 55, 56],
    color: t.chart.series[2],
  },
  {
    name: 'Depreciação',
    data: [22, 22, 22, 23, 23, 23],
    color: t.chart.series[3],
  },
  {
    name: 'Outros',
    data: [15, 18, 19, 21, 23, 25],
    color: t.chart.series[4],
  },
]

// Série de linha dupla: custo/@  e custo animal/dia (escala: /@; animal/dia ×8 para coexistir)
const mockLineSeries = [
  {
    name: 'Custo por Arroba (R$/@)',
    data: mockCustoArroba,
    color: t.chart.series[0],
  },
  {
    name: 'Custo Animal/Dia (R$/cab ×8)',
    data: mockCustoAnimalDia.map((v) => Math.round(v * 8 * 10) / 10),
    color: t.chart.series[2],
  },
]

// Composição total do período para Donut
const mockDonutData = [
  { label: 'Ração',       value: 1221, color: t.chart.series[0] },
  { label: 'Sanitário',   value: 249,  color: t.chart.series[1] },
  { label: 'Mão de obra', value: 322,  color: t.chart.series[2] },
  { label: 'Depreciação', value: 135,  color: t.chart.series[3] },
  { label: 'Outros',      value: 121,  color: t.chart.series[4] },
]

// Sparklines para KPIs
const kpiSparklines: Record<string, number[]> = {
  custoArroba: mockCustoArroba,
  custoAnimalDia: mockCustoAnimalDia.map((v) => Math.round(v * 10) / 10),
}

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
        fontSize: 9,
      }}>
        {up ? '▲' : '▼'}
      </span>
      {value}
    </span>
  )
}

// ─── DashCustosConfinamento ────────────────────────────────────────────────────

export default function DashCustosConfinamento() {
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

  // KPI derivados dos mocks — último mês disponível (Jun)
  const ultimoIdx = mockCustoArroba.length - 1
  const custoArrobaAtual = mockCustoArroba[ultimoIdx]
  const custoAnimalDiaAtual = mockCustoAnimalDia[ultimoIdx]
  const coeAtual = mockCoeTotal[ultimoIdx]
  const margemAtual = mockMargemBruta[ultimoIdx]

  const kpis = [
    {
      label: 'Custo por Arroba',
      value: `R$ ${custoArrobaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/@`,
      trend: '+2,5% vs mês ant.',
      up: false, // custo subindo = desfavorável
      valueColor: colors.fg.default as string,
      sparkKey: 'custoArroba' as const,
      sparkColor: t.chart.series[0],
    },
    {
      label: 'Custo Animal/Dia',
      value: `R$ ${custoAnimalDiaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      trend: '+2,6% vs mês ant.',
      up: false,
      valueColor: colors.fg.default as string,
      sparkKey: 'custoAnimalDia' as const,
      sparkColor: t.chart.series[2],
    },
    {
      label: 'COE (Custo Operacional)',
      value: `R$ ${(coeAtual * 1000).toLocaleString('pt-BR')}`,
      trend: '+4,5% vs mês ant.',
      up: false,
      valueColor: colors.fg.default as string,
      sparkKey: null,
      sparkColor: t.chart.series[1],
    },
    {
      label: 'Margem Bruta',
      value: `${margemAtual.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
      trend: '−0,6 p.p. vs mês ant.',
      up: false,
      valueColor: margemAtual >= 12
        ? (t.color.feedback.success.text as string)
        : (t.color.feedback.error.text as string),
      sparkKey: null,
      sparkColor: t.chart.series[3],
    },
  ]

  return (
    <div style={cardStyle}>

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${t.space[4]}px ${t.space[5]}px`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          <DollarSign size={13} color={colors.fg.subtle as string} />
          <span style={{
            fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold,
            color: colors.fg.default as string,
          }}>
            Custos do Confinamento
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          <Button variant="secondary" size="sm" iconRight={<ChevronDown size={11} />}>
            Jan–Jun 2025
          </Button>
          <Button variant="secondary" size="sm" iconRight={<ChevronDown size={11} />}>
            Todos os Currais
          </Button>
          <Button variant="secondary" size="sm" iconRight={<ChevronDown size={11} />}>
            Safra 25/26
          </Button>
        </div>
      </div>

      <HDivider color={bc} />

      {/* ── KPI row ─────────────────────────────────────────────────────────────── */}
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

      {/* ── Gráficos: StackedBar (composição por mês) + LineChart (custo/@  e animal/dia) ── */}
      <div style={{ display: 'flex' }}>

        {/* Gráfico 1 — Composição de Custo por Mês */}
        <div style={{ flex: 3, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <BarChart2 size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
              Composição de Custo por Mês (R$ mil)
            </span>
          </div>
          <StackedBarChart
            series={mockStackedSeries}
            labels={MESES}
            height={260}
            showLegend
            yFormat={(v) => `R$ ${v}`}
          />
        </div>

        <VDivider color={bc} />

        {/* Gráfico 2 — Custo/@ e Custo Animal/Dia ao longo do período */}
        <div style={{ flex: 2, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <TrendingUp size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
              Evolução de Custo por Arroba e Animal/Dia
            </span>
          </div>
          <LineChart
            series={mockLineSeries}
            labels={MESES}
            height={260}
            area={false}
            showLegend
            yFormat={(v) => `R$ ${v}`}
          />
        </div>

      </div>

      <HDivider color={bc} />

      {/* ── Gráfico 3 — Donut composição total do período ─────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: `${t.space[5]}px` }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <PieChart size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
              Composição Total do Período (R$ mil)
            </span>
          </div>
          <DonutChart
            data={mockDonutData}
            height={240}
            centerLabel="COE total"
            centerValue={`R$ ${mockDonutData.reduce((a, d) => a + d.value, 0).toLocaleString('pt-BR')}`}
            showLegend
            valueFormat={(v) => `R$ ${v.toLocaleString('pt-BR')} mil`}
          />
        </div>
      </div>

    </div>
  )
}
