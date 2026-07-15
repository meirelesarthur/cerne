import { useEffect, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  BarChart2,
  Clock,
} from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { HeatmapChart } from '../../components/ui/HeatmapChart'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { FilterSelect } from '../../components/ui/FilterSelect'
import { Heading } from '../../components/ui/Heading'
import { Trend } from '../../components/ui/Trend'
import { LineChart } from '../../components/ui/LineChart'
import { DonutChart } from '../../components/ui/DonutChart'
import { GaugeChart } from '../../components/ui/GaugeChart'

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
            style={{ flex: seg.pct, background: seg.color, opacity: segHov !== null && segHov !== i ? 0.3 : 1, transition: 'opacity 0.18s ease', cursor: 'pointer' }} />
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
              background: hovIdx === i ? (isGbMode ? 'rgba(255,255,255,0.05)' : t.color.neutral[50]) : 'transparent',
              transition: 'background 0.15s ease', cursor: 'default',
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
  const [periodo, setPeriodo] = useState('12')

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
        <Skeleton height={600} />
      </div>
    )
  }

  const kpis = [
    { label: 'Receitas do Mês',  value: 'R$ 892.450', trend: '12,4% vs mês ant.', up: true  },
    { label: 'Despesas do Mês',  value: 'R$ 634.120', trend: '3,1% vs mês ant.',  up: false },
    { label: 'Saldo Disponível', value: 'R$ 258.330', trend: '28,7% vs mês ant.', up: true  },
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
    <div style={cardStyle}>

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${t.space[4]}px ${t.space[5]}px`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          <BarChart2 size={13} color={colors.fg.subtle as string} />
          <Heading level={2} size="sm" weight="semibold">Financeiro</Heading>
        </div>
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
      </div>

      <HDivider color={bc} />

      {/* ── KPI row ────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex' }}>
        {kpis.flatMap((kpi, i) => [
          i > 0 ? <VDivider key={`d${i}`} color={bc} /> : null,
          <div key={kpi.label} style={{ flex: 1, padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px` }}>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[1] }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default as string, lineHeight: 1.1, marginBottom: t.space[2] }}>
              {kpi.value}
            </div>
            <Trend value={kpi.trend} up={kpi.up} />
          </div>,
        ])}
      </div>

      <HDivider color={bc} />

      {/* ── Chart row: Area (2/3) + Donut (1/3) ──────────────────────────────── */}
      <div style={{ display: 'flex' }}>

        {/* Area chart */}
        <div style={{ flex: 2, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: t.space[3] }}>
            <div>
              <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default as string, lineHeight: 1 }}>
                R$ 892K
              </div>
              <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginTop: t.space[1] }}>
                Receitas vs Despesas — 12 meses
              </div>
            </div>
            <div style={{ display: 'flex', gap: t.space[4] }}>
              {[{ color: t.color.brand[600], label: 'Receitas' }, { color: t.color.feedback.error.solid, label: 'Despesas' }].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 2, borderRadius: 1, background: s.color, display: 'inline-block' }} />
                  <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <LineChart
            series={lineSeries}
            labels={chartLabels}
            height={200}
            yFormat={yFormat}
            area
            showLegend={false}
          />
        </div>

        <VDivider color={bc} />

        {/* Donut + Gauge stacked */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: `${t.space[5]}px` }}>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[3] }}>
              Despesas por Categoria
            </div>
            <DonutChart
              data={donutSlices}
              height={160}
              centerLabel="Total"
              centerValue="100%"
              showLegend
              valueFormat={(v) => `${v}%`}
            />
          </div>
          <HDivider color={bc} />
          <div style={{ padding: `${t.space[5]}px` }}>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[2] }}>
              Orçamento Anual
            </div>
            <ArcGauge colors={colors} />
          </div>
        </div>
      </div>

      <HDivider color={bc} />

      {/* ── Bottom row: Heatmap (1/2) + Vencimentos (1/2) ────────────────────── */}
      <div style={{ display: 'flex' }}>

        {/* Heatmap */}
        <div style={{ flex: 1, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <BarChart2 size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string }}>
              Atividade de Receita por Hora
            </span>
          </div>
          <HeatmapChart
            data={heatmapData}
            rowLabels={heatmapRows}
            colLabels={heatmapCols}
            colors={colors}
            isGbMode={isGbMode}
          />
        </div>

        <VDivider color={bc} />

        {/* Vencimentos */}
        <div style={{ flex: 1, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <Clock size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string }}>
              Vencimentos Próximos — 30 dias
            </span>
          </div>
          <VencimentosList colors={colors} isGbMode={isGbMode} />
        </div>

      </div>
    </div>
  )
}
