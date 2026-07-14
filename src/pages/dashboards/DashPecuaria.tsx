import { useEffect, useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { FilterSelect } from '../../components/ui/FilterSelect'
import { Heading } from '../../components/ui/Heading'
import { LineChart } from '../../components/ui/LineChart'
import { GroupedBarChart } from '../../components/ui/GroupedBarChart'
import { DonutChart } from '../../components/ui/DonutChart'

// ─── Mock data ────────────────────────────────────────────────────────────────

const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const novilhos  = [1580, 1600, 1620, 1640, 1630, 1650, 1670, 1680, 1660, 1690, 1700, 1628]
const matrizes  = [1160, 1170, 1175, 1180, 1190, 1185, 1195, 1200, 1195, 1205, 1210, 1198]
const bezerros  = [730,  740,  745,  755,  760,  750,  765,  770,  755,  770,  780,  754]

const rebanhoComp = [
  { label: 'Novilhos',  pct: 38, color: t.color.brand[600] },
  { label: 'Matrizes',  pct: 28, color: t.chart.series[6] },
  { label: 'Touros',    pct: 8,  color: t.chart.series[3] },
  { label: 'Bezerros',  pct: 18, color: t.color.brand[400] },
  { label: 'Descarte',  pct: 8,  color: t.color.neutral[400] },
] as const

const vermifugData = [42, 38, 55, 48, 60, 45, 52, 58, 44, 50, 62, 48]
const pesagensData = [30, 28, 40, 35, 45, 32, 38, 42, 30, 36, 48, 35]

// ─── Séries para LineChart ────────────────────────────────────────────────────

const REBANHO_SERIES = [
  { name: 'Novilhos', data: novilhos, color: t.color.brand[600] },
  { name: 'Matrizes', data: matrizes, color: t.chart.series[6] },
  { name: 'Bezerros', data: bezerros, color: t.color.brand[400] },
]

// ─── Séries para GroupedBarChart ──────────────────────────────────────────────

const MANEJOS_SERIES = [
  { name: 'Vermifugações', data: vermifugData, color: t.color.brand[600] },
  { name: 'Pesagens',      data: pesagensData, color: t.chart.series[6] },
]

// ─── DashPecuaria ─────────────────────────────────────────────────────────────

const PEC_KPIS = [
  { label: 'Total Cabeças',  value: '4.280',       trend: '3,2%', up: true  },
  { label: 'Peso Médio',     value: '384 kg',       trend: '1,8%', up: true  },
  { label: 'Arrobas/mês',   value: '2.156 @',      trend: '7,4%', up: true  },
  { label: 'GMD',            value: '0,82 kg/dia',  trend: '0,4%', up: false },
]

export default function DashPecuaria() {
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
    display: 'flex', flexDirection: 'column',
    background: colors.bg.surface,
    borderRadius: t.radius['2xl'],
    border: `1px solid ${bc}`,
    boxShadow: isGbMode ? t.shadow.cardDark : t.shadow.card,
    overflow: 'hidden',
    fontFamily: t.font.family.sans,
  }

  if (isLoading) {
    return <div style={cardStyle}><Skeleton height={600} /></div>
  }

  // Dados filtrados: período fatia os últimos N meses das séries mensais
  const nMeses = Number(periodo)
  const labels = monthLabels.slice(-nMeses)
  const rebanhoSeries = REBANHO_SERIES.map((s) => ({ ...s, data: s.data.slice(-nMeses) }))
  const manejosSeries = MANEJOS_SERIES.map((s) => ({ ...s, data: s.data.slice(-nMeses) }))

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.space[4]}px ${t.space[5]}px` }}>
        <Heading level={2} size="md" weight="semibold">Pecuária de Corte</Heading>
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

      {/* KPI row */}
      <div style={{ display: 'flex' }}>
        {PEC_KPIS.flatMap((kpi, i) => [
          i > 0 ? <VDivider key={`d${i}`} color={bc} /> : null,
          <div key={kpi.label} style={{ flex: 1, padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px` }}>
            <div style={{ fontSize: t.font.size.sm, color: colors.fg.subtle as string, marginBottom: t.space[1] }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default as string, lineHeight: 1.1, marginBottom: t.space[2] }}>
              {kpi.value}
            </div>
            <span style={{ fontSize: t.font.size.sm, color: kpi.up ? t.color.feedback.success.text : t.color.feedback.error.text }}>
              {kpi.up ? '▲' : '▼'} {kpi.trend}
            </span>
          </div>,
        ])}
      </div>
      <HDivider color={bc} />

      {/* Row 2 — Area chart + Donut */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{ flex: 2, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.medium, color: colors.fg.muted as string, marginBottom: t.space[4] }}>
            Evolução do Rebanho
          </div>
          <LineChart
            series={rebanhoSeries}
            labels={labels}
            height={240}
            area
            showLegend
            yFormat={(v) => Math.round(v).toLocaleString('pt-BR')}
          />
        </div>
        <VDivider color={bc} />
        <div style={{ flex: 1, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.medium, color: colors.fg.muted as string, marginBottom: t.space[4] }}>
            Composição do Rebanho
          </div>
          <DonutChart
            data={rebanhoComp.map((d) => ({ label: d.label, value: d.pct, color: d.color }))}
            height={220}
            centerValue="4.280"
            centerLabel="cabeças"
            showLegend
            valueFormat={(v) => `${v}%`}
          />
        </div>
      </div>
      <HDivider color={bc} />

      {/* Row 3 — Manejos */}
      <div style={{ padding: t.space[5] }}>
        <div style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.medium, color: colors.fg.muted as string, marginBottom: t.space[4] }}>
          Manejos por Mês
        </div>
        <GroupedBarChart
          series={manejosSeries}
          labels={labels}
          height={220}
          showLegend
        />
      </div>
    </div>
  )
}
