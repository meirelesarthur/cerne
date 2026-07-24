import { useState, useEffect } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { FilterSelect } from '../../components/ui/FilterSelect'
import { Heading } from '../../components/ui/Heading'
import { LineChart } from '../../components/ui/LineChart'
import { StackedBarChart } from '../../components/ui/StackedBarChart'
import { DonutChart } from '../../components/ui/DonutChart'
import { useMediaQuery } from '../../hooks/useMediaQuery'

// ─── Area Chart — Acessos Diários ─────────────────────────────────────────────

function generateDailyAccess(): number[] {
  return Array.from({ length: 30 }, (_, i) => {
    const base = 120 + i * 2.5
    return Math.round(base + Math.sin(i * 0.7) * 28 + Math.random() * 15)
  })
}

const DAILY_VALUES = generateDailyAccess()
const DAILY_LABELS = Array.from({ length: 30 }, (_, i) => `D${i + 1}`)

// ─── Donut — Módulos ──────────────────────────────────────────────────────────

const MODULOS = [
  { label: 'Financeiro',      pct: 28, acessos: 51, color: t.color.brand[700] },
  { label: 'Dashboards',      pct: 22, acessos: 40, color: t.color.brand[500] },
  { label: 'Cadastros',       pct: 18, acessos: 33, color: t.color.brand[300] },
  { label: 'Fiscal',          pct: 14, acessos: 26, color: t.color.feedback.info.solid },
  { label: 'Administrativo',  pct: 11, acessos: 20, color: t.color.neutral[400] },
  { label: 'Outros',          pct:  7, acessos: 13, color: t.color.neutral[300] },
]

function DonutModulos({ stacked }: { stacked: boolean }) {
  const { colors, isGbMode } = useTheme()
  const [hovSeg, setHovSeg] = useState<number | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: stacked ? 'column' : 'row', alignItems: stacked ? 'stretch' : 'center', gap: t.space[4] }}>
      <div style={{ width: 180, flexShrink: 0 }}>
        <DonutChart
          data={MODULOS.map((m) => ({ label: m.label, value: m.pct, color: m.color }))}
          height={180}
          centerValue="183"
          centerLabel="sessões"
          showLegend={false}
          valueFormat={(v) => `${v}%`}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2], flex: 1 }}>
        {MODULOS.map((seg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.space[2],
              padding: `${t.space[1]}px ${t.space[2]}px`,
              borderRadius: t.radius.base,
              background: hovSeg === i ? (isGbMode ? 'rgba(255,255,255,0.06)' : t.color.neutral[50]) : 'transparent',
              transition: 'background 0.15s ease',
              cursor: 'default',
            }}
            onMouseEnter={() => setHovSeg(i)}
            onMouseLeave={() => setHovSeg(null)}
          >
            <div style={{ width: 9, height: 9, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.muted as string, fontFamily: t.font.family.sans, flex: 1 }}>{seg.label}</span>
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>{seg.pct}%</span>
            <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.medium, color: colors.fg.default as string, fontFamily: t.font.family.sans }}>{seg.acessos}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Stacked Hourly Bar ───────────────────────────────────────────────────────

function generateHourly(): { web: number; mobile: number; api: number }[] {
  return Array.from({ length: 24 }, (_, h) => {
    const isWork = h >= 7 && h <= 18
    const isPeak = h === 9 || h === 10 || h === 14 || h === 15
    const base = isWork ? (isPeak ? 28 : 14) : 3
    return {
      web:    Math.round(base * 0.55 + Math.random() * 4),
      mobile: Math.round(base * 0.28 + Math.random() * 3),
      api:    Math.round(base * 0.17 + Math.random() * 2),
    }
  })
}

const HOURLY_DATA = generateHourly()
const HOURLY_LABELS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}h`)
const HOURLY_SERIES = [
  { name: 'Web',    data: HOURLY_DATA.map(d => d.web),    color: t.chart.series[0] },
  { name: 'Mobile', data: HOURLY_DATA.map(d => d.mobile), color: t.chart.series[1] },
  { name: 'API',    data: HOURLY_DATA.map(d => d.api),    color: t.chart.series[2] },
]

// ─── DashUsuarios ─────────────────────────────────────────────────────────────

const USR_KPIS = [
  { label: 'Usuários Ativos',      value: '47',      trend: '5,2%',  up: true  },
  { label: 'Sessões Hoje',         value: '183',     trend: '12,4%', up: true  },
  { label: 'Tempo Médio Sessão',   value: '8,4 min', trend: '0,8%',  up: false },
  { label: 'Módulos Acessados',    value: '9 / 11',  trend: null,    up: true  },
]

export default function DashUsuarios() {
  const { colors, isGbMode } = useTheme()
  const [loading, setLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [periodo, setPeriodo] = useState('30')
  // Tablet/estreito: empilha colunas e dispensa divisores verticais
  const stacked = useMediaQuery(`(max-width: ${t.breakpoint.md - 1}px)`)

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(id)
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

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.space[4]}px ${t.space[5]}px` }}>
        <Heading level={2} size="sm" weight="semibold">Análise de Usuários</Heading>
        <FilterSelect
          ariaLabel="Filtrar por período"
          options={[
            { value: '7',  label: 'Últimos 7 dias' },
            { value: '15', label: 'Últimos 15 dias' },
            { value: '30', label: 'Últimos 30 dias' },
          ]}
          value={periodo}
          onChange={setPeriodo}
        />
      </div>
      <HDivider color={bc} />

      {/* KPI row */}
      <div style={{ display: 'flex', flexWrap: stacked ? 'wrap' : undefined }}>
        {USR_KPIS.flatMap((kpi, i) => [
          i > 0 && !stacked ? <VDivider key={`d${i}`} color={bc} /> : null,
          <div key={kpi.label} style={{ flex: stacked ? '1 1 45%' : 1, padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px` }}>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[1] }}>{kpi.label}</div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default as string, lineHeight: 1.1, marginBottom: t.space[2] }}>{kpi.value}</div>
            {kpi.trend && (
              <span style={{ fontSize: t.font.size.xs, color: kpi.up ? t.color.feedback.success.text : t.color.feedback.error.text }}>{kpi.up ? '▲' : '▼'} {kpi.trend}</span>
            )}
          </div>,
        ])}
      </div>
      <HDivider color={bc} />

      {/* Row 2 — Area chart + Donut */}
      <div style={{ display: 'flex', flexDirection: stacked ? 'column' : 'row' }}>
        <div style={{ flex: 2, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[4] }}>Acessos Diários</div>
          <LineChart
            series={[{ name: 'Sessões', data: DAILY_VALUES.slice(-Number(periodo)), color: t.color.brand[600] }]}
            labels={DAILY_LABELS.slice(-Number(periodo))}
            height={220}
            area
            showLegend={false}
            yFormat={(v) => String(Math.round(v))}
          />
        </div>
        {!stacked && <VDivider color={bc} />}
        <div style={{ flex: 1, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[4] }}>Módulos Mais Acessados</div>
          <DonutModulos stacked={stacked} />
        </div>
      </div>
      <HDivider color={bc} />

      {/* Row 3 — Hourly stacked */}
      <div style={{ padding: t.space[5] }}>
        <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[4] }}>Picos de Acesso por Hora</div>
        <StackedBarChart
          series={HOURLY_SERIES}
          labels={HOURLY_LABELS}
          height={160}
          showLegend
          yFormat={(v) => String(Math.round(v))}
        />
      </div>
    </div>
  )
}
