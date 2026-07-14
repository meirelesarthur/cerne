import { useState, useEffect } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { FilterSelect } from '../../components/ui/FilterSelect'
import { StackedBarChart } from '../../components/ui/StackedBarChart'
import { DonutChart } from '../../components/ui/DonutChart'
import { LineChart } from '../../components/ui/LineChart'

// ─── Stacked Bar Data ─────────────────────────────────────────────────────────

const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const STACKED_DATA: { maq: number; vei: number; benf: number; outros: number }[] = [
  { maq: 18000, vei: 12000, benf: 8000, outros: 3200 },
  { maq: 17500, vei: 11800, benf: 7800, outros: 3000 },
  { maq: 19000, vei: 12500, benf: 8200, outros: 3300 },
  { maq: 18500, vei: 11500, benf: 8100, outros: 3100 },
  { maq: 20000, vei: 13000, benf: 8500, outros: 3400 },
  { maq: 19500, vei: 12800, benf: 8300, outros: 3250 },
  { maq: 21000, vei: 13500, benf: 8700, outros: 3600 },
  { maq: 20500, vei: 13200, benf: 8400, outros: 3450 },
  { maq: 22000, vei: 14000, benf: 9000, outros: 3700 },
  { maq: 21500, vei: 13800, benf: 8800, outros: 3550 },
  { maq: 23000, vei: 14500, benf: 9200, outros: 3800 },
  { maq: 22500, vei: 14200, benf: 9100, outros: 3650 },
]

const STACKED_SERIES = [
  { name: 'Máquinas/Equip.', data: STACKED_DATA.map(d => d.maq), color: t.color.brand[600] },
  { name: 'Veículos',        data: STACKED_DATA.map(d => d.vei), color: t.color.brand[400] },
  { name: 'Benfeitorias',   data: STACKED_DATA.map(d => d.benf), color: t.color.brand[200] },
  { name: 'Outros',          data: STACKED_DATA.map(d => d.outros), color: t.color.neutral[300] },
]

// ─── Donut Data ───────────────────────────────────────────────────────────────

const DONUT_SLICES = [
  { label: 'Máquinas',     value: 8_400_000 * 0.45, color: t.color.brand[600] },
  { label: 'Veículos',     value: 8_400_000 * 0.28, color: t.color.brand[400] },
  { label: 'Benfeitorias', value: 8_400_000 * 0.18, color: t.color.brand[200] },
  { label: 'Outros',       value: 8_400_000 * 0.09, color: t.color.neutral[300] },
]

// ─── Projection Data ──────────────────────────────────────────────────────────

const PROJ_MONTHS_COUNT = 24
const CURRENT_MONTH = 11

function generateProjection() {
  return Array.from({ length: PROJ_MONTHS_COUNT }, (_, i) => {
    const base = 6_300_000 - i * 220_000
    const jitter = i < CURRENT_MONTH ? (Math.sin(i * 1.3) * 50_000) : 0
    return Math.max(base + jitter, 1_000_000)
  })
}

const PROJ_VALUES = generateProjection()
const PROJ_LABELS = Array.from({ length: PROJ_MONTHS_COUNT }, (_, i) => `M${i + 1}`)

// Duas séries com 24 pontos cada, sobrepostas no mês de corte (M12).
// "Realizado" mantém o último valor real para os meses futuros (linha plana),
// "Projeção" mantém o valor do ponto de corte para os meses passados — ambas
// se encontram em CURRENT_MONTH, produzindo a continuidade visual esperada.
const PROJ_SERIES_FULL = [
  {
    name: 'Realizado',
    data: PROJ_VALUES.map((v, i) => (i <= CURRENT_MONTH ? v : PROJ_VALUES[CURRENT_MONTH])),
    color: t.color.brand[600],
  },
  {
    name: 'Projeção',
    data: PROJ_VALUES.map((v, i) => (i >= CURRENT_MONTH ? v : PROJ_VALUES[CURRENT_MONTH])),
    color: t.color.brand[400],
  },
]

// ─── KPIs ─────────────────────────────────────────────────────────────────────

const DEP_KPIS = [
  { label: 'Valor Total Bens',   value: 'R$ 8,4M',   trend: '2,1%', up: true  },
  { label: 'Depreciação Mensal', value: 'R$ 42.380',  trend: null,   up: true  },
  { label: 'Dep. Acumulada',     value: 'R$ 2,1M',   trend: '6,3%', up: true  },
  { label: 'Valor Residual',     value: 'R$ 6,3M',   trend: '0,8%', up: false },
]

// ─── DashDepreciacoes ─────────────────────────────────────────────────────────

export default function DashDepreciacoes() {
  const { colors, isGbMode } = useTheme()
  const [loading, setLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [periodo, setPeriodo] = useState('12')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
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

  if (loading) {
    return <div style={cardStyle}><Skeleton height={600} /></div>
  }

  // Dados filtrados: período fatia os últimos N meses da série empilhada
  const nMeses = Number(periodo)
  const stackedLabels = MONTHS_SHORT.slice(-nMeses)
  const stackedSeries = STACKED_SERIES.map((s) => ({ ...s, data: s.data.slice(-nMeses) }))

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.space[4]}px ${t.space[5]}px` }}>
        <span style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.semibold, color: colors.fg.default as string }}>
          Depreciações
        </span>
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
        {DEP_KPIS.flatMap((kpi, i) => [
          i > 0 ? <VDivider key={`d${i}`} color={bc} /> : null,
          <div key={kpi.label} style={{ flex: 1, padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px` }}>
            <div style={{ fontSize: t.font.size.sm, color: colors.fg.subtle as string, marginBottom: t.space[1] }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default as string, lineHeight: 1.1, marginBottom: t.space[2] }}>
              {kpi.value}
            </div>
            {kpi.trend && (
              <span style={{ fontSize: t.font.size.sm, color: kpi.up ? t.color.feedback.success.text : t.color.feedback.error.text }}>
                {kpi.up ? '▲' : '▼'} {kpi.trend}
              </span>
            )}
          </div>,
        ])}
      </div>
      <HDivider color={bc} />

      {/* Stacked bar — full width */}
      <div style={{ padding: t.space[5] }}>
        <div style={{ marginBottom: t.space[4] }}>
          <div style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.medium, color: colors.fg.muted as string }}>
            Depreciação por Categoria — {nMeses} Meses
          </div>
        </div>
        <StackedBarChart
          series={stackedSeries}
          labels={stackedLabels}
          height={210}
          yFormat={(v) => `${(v / 1000).toFixed(0)}K`}
          showLegend
        />
      </div>
      <HDivider color={bc} />

      {/* Donut + Projection */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{ flex: 1, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.medium, color: colors.fg.muted as string, marginBottom: t.space[4] }}>
            Composição por Tipo de Bem
          </div>
          <DonutChart
            data={DONUT_SLICES}
            height={220}
            centerValue="R$8,4M"
            centerLabel="total"
            showLegend
            valueFormat={(v) => `R$ ${(v / 1_000_000).toFixed(1)}M`}
          />
        </div>
        <VDivider color={bc} />
        <div style={{ flex: 1, padding: t.space[5] }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[4] }}>
            <div style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.medium, color: colors.fg.muted as string }}>
              Projeção Próximos 24 Meses
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[4] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
                <div style={{ width: 16, height: 2, background: t.color.brand[600], borderRadius: 1 }} />
                <span style={{ fontSize: t.font.size.sm, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>Realizado</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
                <svg width={16} height={2}><line x1="0" y1="1" x2="16" y2="1" stroke={t.color.brand[400]} strokeWidth="2" strokeDasharray="4 2" /></svg>
                <span style={{ fontSize: t.font.size.sm, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>Projeção</span>
              </div>
            </div>
          </div>
          <LineChart
            series={PROJ_SERIES_FULL}
            labels={PROJ_LABELS}
            height={210}
            yFormat={(v) => `${(v / 1_000_000).toFixed(1)}M`}
            area
            showLegend={false}
          />
        </div>
      </div>
    </div>
  )
}
