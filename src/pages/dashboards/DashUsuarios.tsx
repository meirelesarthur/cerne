import { useState, useEffect } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { FilterSelect } from '../../components/ui/FilterSelect'
import { LineChart } from '../../components/ui/LineChart'
import { StackedBarChart } from '../../components/ui/StackedBarChart'
import { DonutChart } from '../../components/ui/DonutChart'
import {
  DashboardGrid,
  DashboardHeader,
  DashboardRow,
  DashboardCard,
  DashboardKpiCard,
  DashboardSkeleton,
} from '../../components/ui/DashboardGrid'

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

function DonutModulos() {
  const { colors, isGbMode } = useTheme()
  const [hovSeg, setHovSeg] = useState<number | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4] }}>
      <div>
        <DonutChart
          data={MODULOS.map((m) => ({ label: m.label, value: m.pct, color: m.color }))}
          height={t.size.chart.sm}
          centerValue="183"
          centerLabel="sessões"
          showLegend={false}
          valueFormat={(v) => `${v}%`}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
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
            <span style={{
              fontSize: t.font.size.xs, color: colors.fg.muted as string, fontFamily: t.font.family.sans,
              flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{seg.label}</span>
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
  { label: 'Usuários ativos',      value: '47',      trend: '5,2%',  up: true  },
  { label: 'Sessões hoje',         value: '183',     trend: '12,4%', up: true  },
  { label: 'Tempo médio de sessão',   value: '8,4 min', trend: '0,8%',  up: false },
  { label: 'Módulos acessados',    value: '9 / 11',  trend: null,    up: true  },
]

export default function DashUsuarios() {
  const [loading, setLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [periodo, setPeriodo] = useState('30')

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(id)
  }, [])

  if (loading) {
    return <DashboardSkeleton kpis={4} blocks={[t.size.chart.md, t.size.chart.sm]} />
  }

  return (
    <DashboardGrid>
      <DashboardHeader
        title="Análise de Usuários"
        subtitle="Acessos, módulos e horários de pico da equipe"
        actions={
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
        }
      />

      {/* Fileira 1 — KPIs */}
      <DashboardRow>
        {USR_KPIS.map((kpi) => (
          <DashboardKpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            up={kpi.up}
          />
        ))}
      </DashboardRow>

      {/* Fileira 2 — Acessos diários + Módulos */}
      <DashboardRow>
        <DashboardCard title="Acessos diários" flex={2}>
          <LineChart
            series={[{ name: 'Sessões', data: DAILY_VALUES.slice(-Number(periodo)), color: t.color.brand[600] }]}
            labels={DAILY_LABELS.slice(-Number(periodo))}
            height={t.size.chart.lg}
            area
            showLegend={false}
            yFormat={(v) => String(Math.round(v))}
          />
        </DashboardCard>
        <DashboardCard title="Módulos mais acessados" flex={1}>
          <DonutModulos />
        </DashboardCard>
      </DashboardRow>

      {/* Fileira 3 — Picos por hora */}
      <DashboardCard title="Picos de acesso por hora">
        <StackedBarChart
          series={HOURLY_SERIES}
          labels={HOURLY_LABELS}
          height={t.size.chart.sm}
          showLegend
          yFormat={(v) => String(Math.round(v))}
        />
      </DashboardCard>
    </DashboardGrid>
  )
}
