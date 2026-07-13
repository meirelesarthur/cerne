// TODO (backend):
// - RBAC no FoodBeat (hoje sem middleware de permissão); sugerir permissão `food_beat_dashboard_view`
// - Substituir categorias hardcoded IN (36,53,44,56) por config/enum de tenant
// - Corrigir `update` que só altera data/usuário e não reprocessa estoque/custo médio
// - Revisar transação/rollback (atomicidade) nas operações de batida
// - Centralizar conversão de UM (factor_type) e recálculo de custo médio (CalcAverageCostAction)
// - Definir "consumo médio" canônico (Kg/animal/dia) e tratar animals_count = 0 sem fallback silencioso
// - Filtros de Período, Formulação e Lote devem chamar endpoint filtrado (hoje apenas visuais/mock)
// - Adicionar indicador de "última atualização" dos dados via timestamp da API

import { useEffect, useState } from 'react'
import {
  Wheat,
  ChevronDown,
  TrendingUp,
  PieChart,
  BarChart2,
} from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { SparklineArea } from '../../components/ui/SparklineArea'
import { Button } from '../../components/ui/Button'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { DonutChart } from '../../components/ui/DonutChart'
import { BarChart } from '../../components/ui/BarChart'
import { LineChart } from '../../components/ui/LineChart'

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

// ─── DashConsumoRacao ─────────────────────────────────────────────────────────

export default function DashConsumoRacao() {
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

  // ── KPIs derivados dos mocks ──────────────────────────────────────────────
  // Ração Produzida: última semana em kg (série de 8 semanas, unidade 100 kg → kg)
  const racaoProduzidaKg = kpiSparklines.racaoProduzida[kpiSparklines.racaoProduzida.length - 1]
  // Ração Distribuída: última semana
  const racaoDistribuidaKg = kpiSparklines.racaoDistribuida[kpiSparklines.racaoDistribuida.length - 1]
  // Consumo médio: média dos últimos valores de cada lote (Kg/animal/dia)
  const consumoMedioLotes = mockConsumoSeries.map(s => s.data[s.data.length - 1])
  const consumoMedio = consumoMedioLotes.reduce((a, b) => a + b, 0) / consumoMedioLotes.length
  // Custo médio da batida: média das formulações
  const custoMedioBatida = mockCustoBatidaData.reduce((a, d) => a + d.value, 0) / mockCustoBatidaData.length

  const kpis = [
    {
      label: 'Ração Produzida',
      value: `${racaoProduzidaKg.toLocaleString('pt-BR')} kg`,
      trend: '3,4% vs sem. ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: 'racaoProduzida',
      sparkColor: t.chart.series[0],
    },
    {
      label: 'Ração Distribuída',
      value: `${racaoDistribuidaKg.toLocaleString('pt-BR')} kg`,
      trend: '2,8% vs sem. ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: 'racaoDistribuida',
      sparkColor: t.chart.series[1],
    },
    {
      label: 'Consumo Médio',
      value: `${consumoMedio.toFixed(1)} kg/an./dia`,
      trend: '0,5 kg vs sem. ant.',
      up: true,
      valueColor: colors.fg.default as string,
      sparkKey: null,
      sparkColor: t.chart.series[2],
    },
    {
      label: 'Custo Médio da Batida',
      value: `R$ ${custoMedioBatida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      trend: '1,2% vs mês ant.',
      up: false,
      valueColor: colors.fg.default as string,
      sparkKey: null,
      sparkColor: t.chart.series[3],
    },
  ]

  return (
    <div style={cardStyle}>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${t.space[4]}px ${t.space[5]}px`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          <Wheat size={13} color={colors.fg.subtle as string} />
          <span style={{
            fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold,
            color: colors.fg.default as string,
          }}>
            Consumo de Ração
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          <Button variant="secondary" size="sm" iconRight={<ChevronDown size={11} />}>
            Últimos 60 dias
          </Button>
          <Button variant="secondary" size="sm" iconRight={<ChevronDown size={11} />}>
            Todas as formulações
          </Button>
          <Button variant="secondary" size="sm" iconRight={<ChevronDown size={11} />}>
            Todos os lotes
          </Button>
        </div>
      </div>

      <HDivider color={bc} />

      {/* ── KPI row ──────────────────────────────────────────────────────────── */}
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

      {/* ── Gráfico 1 — Consumo no tempo por lote ────────────────────────────── */}
      <div style={{ padding: `${t.space[5]}px` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
          <TrendingUp size={12} color={colors.fg.subtle as string} />
          <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
            Consumo de Ração por Lote — Kg/animal/dia (semanal)
          </span>
        </div>
        <LineChart
          series={mockConsumoSeries}
          labels={mockWeekLabels}
          height={220}
          area
          showLegend
          yFormat={(v) => `${v.toFixed(1)} kg`}
        />
      </div>

      <HDivider color={bc} />

      {/* ── Gráficos 2 + 3 lado a lado ───────────────────────────────────────── */}
      <div style={{ display: 'flex' }}>

        {/* Gráfico 2 — Custo médio da batida por formulação */}
        <div style={{ flex: 1, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <BarChart2 size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
              Custo Médio da Batida por Formulação (R$/batida)
            </span>
          </div>
          <BarChart
            data={mockCustoBatidaData}
            height={260}
            yFormat={(v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          />
        </div>

        <VDivider color={bc} />

        {/* Gráfico 3 — Composição de matérias-primas */}
        <div style={{ flex: 1, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <PieChart size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
              Composição de Matérias-Primas da Ração (%)
            </span>
          </div>
          <DonutChart
            data={mockComposicaoData}
            height={260}
            centerLabel="ingredientes"
            centerValue={String(mockComposicaoData.length)}
            showLegend
            valueFormat={(v) => `${v}%`}
          />
        </div>

      </div>
    </div>
  )
}
