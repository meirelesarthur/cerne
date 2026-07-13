import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { t } from '../../design/tokens'
import {
  CloudRain, Droplets, CalendarDays, AlertTriangle,
  Filter, X, Sun, Cloud, CloudSun, TrendingUp,
  BarChart2, Activity,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { FormField } from '../../components/ui/FormField'
import { FormSelect } from '../../components/ui/FormSelect'
import { FilterDrawer } from '../../components/ui/FilterDrawer'
import { PageHeader } from '../../components/ui/PageHeader'
import { Skeleton } from '../../components/ui/Skeleton'
import { ChartCard } from '../../components/ui/ChartCard'
import { KpiStatCard } from '../../components/ui/KpiStatCard'
import { GroupedBarChart } from '../../components/ui/GroupedBarChart'
import { LineChart } from '../../components/ui/LineChart'

// ─── Mock data ────────────────────────────────────────────────────────────────

const ALL_AREAS = [
  'Módulo 5', 'Módulo 4', 'Módulo 3', 'Módulo 2', 'Módulo 1',
  'Módulo 6', 'Módulo 7', 'Conf L1-7', 'Capineira 1', 'Capineira 2',
  'Capineira 3', 'Conf L1-5', 'Conf L4', 'Conf L3', 'Conf L1-3',
  'Conf L1-2', 'Conf L1-1', 'Chorume', 'Separador Sólido', 'Esterco',
]

const BAR_DATA = [
  { month: 'Jun', comChuva: 3,  semChuva: 27 },
  { month: 'Jul', comChuva: 29, semChuva: 2  },
  { month: 'Ago', comChuva: 30, semChuva: 1  },
  { month: 'Set', comChuva: 1,  semChuva: 29 },
  { month: 'Out', comChuva: 5,  semChuva: 26 },
  { month: 'Nov', comChuva: 11, semChuva: 19 },
  { month: 'Dez', comChuva: 13, semChuva: 18 },
  { month: 'Jan', comChuva: 12, semChuva: 19 },
  { month: 'Fev', comChuva: 11, semChuva: 17 },
  { month: 'Mar', comChuva: 10, semChuva: 21 },
  { month: 'Abr', comChuva: 24, semChuva: 6  },
  { month: 'Mai', comChuva: 24, semChuva: 7  },
]

const VOLUME_DATA = [0, 5, 8, 25, 75, 130, 175, 200, 225, 185, 130, 18]
const VOLUME_LABELS = ['Jun/25','Jul','Ago','Set','Out','Nov','Dez','Jan/26','Fev','Mar','Abr','Mai']

const FORECAST = [
  { day: 'Segunda', min: 18, max: 29, rain: 0.2, condition: 'rain'   as const },
  { day: 'Terça',   min: 19, max: 29, rain: 0.2, condition: 'rain'   as const },
  { day: 'Quarta',  min: 19, max: 29, rain: 0.8, condition: 'rain'   as const },
  { day: 'Quinta',  min: 20, max: 30, rain: 0,   condition: 'clear'  as const },
  { day: 'Sexta',   min: 21, max: 30, rain: 0,   condition: 'clear'  as const },
  { day: 'Sábado',  min: 19, max: 30, rain: 0,   condition: 'cloudy' as const },
  { day: 'Domingo', min: 19, max: 29, rain: 0,   condition: 'clear'  as const },
]

// ─── Weather icon ─────────────────────────────────────────────────────────────

function WeatherIcon({ condition, size = 16, color }: { condition: string; size?: number; color: string }) {
  if (condition === 'rain') return <CloudRain size={size} color={color} />
  if (condition === 'cloudy') return <Cloud size={size} color={color} />
  if (condition === 'partly') return <CloudSun size={size} color={color} />
  return <Sun size={size} color={color} />
}

// ─── Bar Chart wrapper ────────────────────────────────────────────────────────

function PluvioBarChart() {
  const { isGbMode } = useTheme()

  const barSeries = [
    {
      name: 'Dias com chuva',
      data: BAR_DATA.map(d => d.comChuva),
      color: isGbMode ? t.color.brand[500] : t.color.brand[600],
    },
    {
      name: 'Dias sem chuva',
      data: BAR_DATA.map(d => d.semChuva),
      color: t.color.neutral[300],
    },
  ]
  const barLabels = BAR_DATA.map(d => d.month)

  const legend = (
    <div style={{ display: 'flex', gap: t.space[4] }}>
      {barSeries.map(s => (
        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
          <span style={{ fontSize: t.font.size.xs, color: isGbMode ? t.color.neutral[400] : t.color.neutral[400], fontFamily: t.font.family.sans }}>{s.name}</span>
        </div>
      ))}
    </div>
  )

  return (
    <ChartCard icon={BarChart2} title="Pluviometria (dias)" action={legend}>
      <GroupedBarChart
        series={barSeries}
        labels={barLabels}
        height={190}
        yFormat={v => `${v}d`}
        showLegend={false}
      />
    </ChartCard>
  )
}

// ─── Area Chart wrapper ───────────────────────────────────────────────────────

function VolumeAreaChart() {
  const { isGbMode } = useTheme()

  const lineSeries = [
    {
      name: 'Volume (mm)',
      data: VOLUME_DATA,
      color: isGbMode ? t.color.brand[500] : t.color.brand[600],
    },
  ]

  const lineColor = isGbMode ? t.color.brand[500] : t.color.brand[600]

  const areaLegend = (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
      <TrendingUp size={14} color={lineColor} />
      <div style={{ width: 24, height: 2.5, background: lineColor, borderRadius: 2 }} />
      <span style={{ fontSize: t.font.size.xs, color: isGbMode ? t.color.neutral[400] : t.color.neutral[400], fontFamily: t.font.family.sans }}>Realizado</span>
    </div>
  )

  return (
    <ChartCard icon={Activity} title="Volume Pluviométrico (mm)" action={areaLegend}>
      <LineChart
        series={lineSeries}
        labels={VOLUME_LABELS}
        height={170}
        yFormat={v => `${v}mm`}
        area
        showLegend={false}
      />
    </ChartCard>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Pluviometria() {
  const { colors, isGbMode } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAreas, setSelectedAreas] = useState<string[]>(ALL_AREAS)
  const [dateStart, setDateStart] = useState('01/06/2025')
  const [dateEnd, setDateEnd] = useState('25/05/2026')
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const removeArea = (area: string) => setSelectedAreas(p => p.filter(a => a !== area))

  const handleClearFilters = () => {
    setDateStart('01/06/2025')
    setDateEnd('25/05/2026')
    setSelectedAreas(ALL_AREAS)
  }

  const activeCount =
    (dateStart !== '01/06/2025' ? 1 : 0) +
    (dateEnd !== '25/05/2026' ? 1 : 0) +
    (selectedAreas.length < ALL_AREAS.length ? 1 : 0)

  return (
    <div style={{
      margin: `${t.space[5]}px ${t.space[6]}px`,
      background: colors.bg.surface,
      borderRadius: t.radius['2xl'],
      border: `1px solid ${colors.border.default}`,
      boxShadow: isGbMode ? t.shadow.cardDark : t.shadow.card,
    }}>
    <div
      style={{
        padding: t.space[4],
        display: 'flex',
        flexDirection: 'column',
        gap: t.space[4],
        minHeight: '100%',
        boxSizing: 'border-box',
        fontFamily: t.font.family.sans,
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <PageHeader
        title="Pluviômetro"
        breadcrumb={
          <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
            Dashboards /{' '}
            <span style={{ color: colors.accent.default }}>Pluviometria</span>
          </span>
        }
        actions={
          <>
            {isGbMode && (
              <span style={{
                fontSize: t.font.size.xs,
                color: colors.accent.default,
                fontFamily: t.font.family.sans,
                background: colors.accent.subtle,
                border: `1px solid ${t.color.brand[500]}40`,
                borderRadius: t.radius.full,
                padding: `${t.space[1]}px ${t.space[3]}px`,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
              }}>
                ● Open-Meteo Live
              </span>
            )}
            <Button icon={<Filter size={14} />} size="md" onClick={() => setFilterOpen(true)}>
              Filtros{activeCount > 0 ? ` (${activeCount})` : ''}
            </Button>
          </>
        }
      />

      {/* ── Filter Drawer ────────────────────────────────────────────── */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onClear={handleClearFilters}
        title="Filtros"
        activeCount={activeCount}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4] }}>
          <FormField
            label="Data início"
            type="text"
            value={dateStart}
            onChange={e => setDateStart(e.target.value)}
            placeholder="DD/MM/AAAA"
          />
          <FormField
            label="Data final"
            type="text"
            value={dateEnd}
            onChange={e => setDateEnd(e.target.value)}
            placeholder="DD/MM/AAAA"
          />
          <FormSelect
            label="Fazenda"
            options={[{ value: 'fazenda-araprata', label: 'Fazenda Araprata — Wilmar Alves Lima' }]}
          />
          <div>
            <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: t.color.neutral[700], fontFamily: t.font.family.sans, display: 'block', marginBottom: t.space[2] }}>
              Áreas ({selectedAreas.length}/{ALL_AREAS.length})
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: t.space[1] + 2 }}>
              {selectedAreas.map(area => (
                <div
                  key={area}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: t.space[1],
                    background: t.color.brand[50],
                    border: `1px solid ${t.color.brand[200]}`,
                    borderRadius: t.radius.full,
                    padding: `3px ${t.space[2]}px`,
                    fontSize: t.font.size.xs,
                    color: t.color.brand[700],
                    fontFamily: t.font.family.sans,
                    fontWeight: t.font.weight.medium,
                  }}
                >
                  {area}
                  <IconButton
                    icon={<X size={10} />}
                    aria-label={`Remover ${area}`}
                    onClick={() => removeArea(area)}
                    size="xs"
                  />
                </div>
              ))}
            </div>
            {selectedAreas.length < ALL_AREAS.length && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAreas(ALL_AREAS)}
                style={{ marginTop: t.space[2], padding: 0, color: t.color.brand[600], textDecoration: 'underline' }}
              >
                Selecionar todas
              </Button>
            )}
          </div>
        </div>
      </FilterDrawer>

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[3] }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={120} />)}
        </div>
      ) : null}
      {!isLoading && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[3], alignItems: 'stretch' }}>
        <KpiStatCard
          icon={CloudRain}
          label="Acumulado (7 dias)"
          value="19.2mm"
          sub="Open-Meteo · Prata (MG)"
          trend="+3.4mm vs mês ant."
          trendUp
          accentColor={t.color.brand[600]}
        />
        <KpiStatCard
          icon={Droplets}
          label="Umidade do Solo"
          value="17%"
          sub="Open-Meteo · Prata (MG)"
          trend="-5% vs mês ant."
          trendUp={false}
          accentColor={t.color.brand[600]}
        />
        <KpiStatCard
          icon={CalendarDays}
          label="Próxima Chuva (>15mm)"
          value="Sem prev."
          sub="Open-Meteo · Prata (MG)"
          accentColor={t.color.feedback.warning.solid}
        />
        <KpiStatCard
          icon={AlertTriangle}
          label="Alertas Ativos"
          value="Déficit Hídrico"
          accentColor={t.color.feedback.error.solid}
        />
      </div>}

      {/* ── Bar chart + Right panel ──────────────────────────────────── */}
      {isLoading ? (
        <Skeleton height={300} />
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 296px', gap: t.space[3], alignItems: 'stretch' }}>
        {/* Bar chart */}
        <PluvioBarChart />

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3], height: '100%' }}>
          {/* Alert */}
          <div
            style={{
              background: isGbMode ? t.color.gb.surface : t.color.feedback.warning.bg,
              backdropFilter: isGbMode ? 'blur(20px)' : undefined,
              WebkitBackdropFilter: isGbMode ? 'blur(20px)' : undefined,
              borderRadius: t.radius['2xl'],
              border: `1px solid ${colors.border.default}`,
              boxShadow: isGbMode ? t.shadow.cardDark : t.shadow.card,
              padding: t.space[4],
              boxSizing: 'border-box',
            }}
          >
            <div style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: t.color.feedback.notice, fontFamily: t.font.family.sans, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: t.space[2] }}>
              Janela de Aplicação
            </div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: isGbMode ? t.color.amber[400] : t.color.amber[800], fontFamily: t.font.family.sans, marginBottom: t.space[2], textShadow: isGbMode ? `0 0 20px ${t.color.amber[400]}66` : undefined }}>
              Atenção
            </div>
            <div style={{ fontSize: t.font.size.sm, color: isGbMode ? `${t.color.amber[400]}a6` : t.color.amber[900], fontFamily: t.font.family.sans, lineHeight: 1.65, marginBottom: t.space[2] }}>
              Vento em 2.4km/h e probabilidade de chuva de 4% para as próximas 8 horas.
            </div>
            <div style={{ fontSize: t.font.size.xs, color: t.color.feedback.notice, fontFamily: t.font.family.sans, opacity: 0.65 }}>
              Fonte: Open-Meteo · Prata (MG)
            </div>
          </div>

          {/* Forecast */}
          <div style={{
            background: isGbMode ? t.color.gb.surface : colors.bg.surface,
            backdropFilter: isGbMode ? 'blur(20px)' : undefined,
            WebkitBackdropFilter: isGbMode ? 'blur(20px)' : undefined,
            borderRadius: t.radius['2xl'],
            border: `1px solid ${colors.border.default}`,
            boxShadow: isGbMode ? t.shadow.cardDark : t.shadow.card,
            padding: `${t.space[4]}px ${t.space[3]}px`,
            flex: 1,
            boxSizing: 'border-box' as const,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[1], paddingInline: t.space[1] }}>
              <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default, fontFamily: t.font.family.sans }}>
                Previsão da Semana
              </span>
              <span style={{
                fontSize: t.font.size.xs,
                color: colors.accent.default,
                fontFamily: t.font.family.sans,
                background: colors.accent.subtle,
                borderRadius: t.radius.full,
                padding: `2px ${t.space[2]}px`,
              }}>
                Open-Meteo
              </span>
            </div>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans, marginBottom: t.space[3], paddingInline: t.space[1] }}>
              Prata (MG)
            </div>

            {/* 7-day strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {FORECAST.map((f, i) => {
                const hasRain   = f.rain > 0
                const rainColor = isGbMode ? t.color.blue[400] : t.color.blue[500]
                const sunColor  = isGbMode ? t.color.gb.accent : t.color.amber[600]
                const iconColor = hasRain ? rainColor : sunColor
                const isToday   = i === 0
                const DAY_ABBR  = ['Hoje', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

                return (
                  <div
                    key={f.day}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      padding: `${t.space[2]}px 0`,
                      borderRadius: t.radius.lg,
                      background: isToday
                        ? (isGbMode ? `${t.color.brand[500]}1a` : `${t.color.brand[600]}12`)
                        : 'transparent',
                    }}
                  >
                    {/* Day label */}
                    <span style={{
                      fontSize: t.font.size['2xs'],
                      fontFamily: t.font.family.sans,
                      fontWeight: isToday ? t.font.weight.semibold : t.font.weight.normal,
                      color: isToday ? colors.accent.default : colors.fg.subtle,
                      letterSpacing: '0.03em',
                      lineHeight: 1,
                    }}>
                      {DAY_ABBR[i]}
                    </span>

                    {/* Weather icon */}
                    <WeatherIcon condition={f.condition} size={17} color={iconColor} />

                    {/* Max temp */}
                    <span style={{
                      fontSize: t.font.size.sm,
                      fontFamily: t.font.family.sans,
                      fontWeight: t.font.weight.semibold,
                      color: isToday
                        ? (isGbMode ? t.color.brand[400] : t.color.brand[600])
                        : colors.fg.default,
                      lineHeight: 1,
                    }}>
                      {f.max}°
                    </span>

                    {/* Min temp */}
                    <span style={{
                      fontSize: t.font.size['2xs'],
                      fontFamily: t.font.family.sans,
                      color: colors.fg.subtle,
                      lineHeight: 1,
                    }}>
                      {f.min}°
                    </span>

                    {/* Rain indicator */}
                    <div style={{
                      height: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {hasRain ? (
                        <span style={{
                          fontSize: t.font.size['3xs'],
                          fontFamily: t.font.family.sans,
                          fontWeight: t.font.weight.semibold,
                          color: rainColor,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}>
                          <Droplets size={8} />
                          {f.rain}
                        </span>
                      ) : (
                        <span style={{ fontSize: t.font.size['3xs'], color: colors.border.subtle, fontFamily: t.font.family.sans }}>—</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ── Volume area chart ────────────────────────────────────────── */}
      {isLoading ? (
        <Skeleton height={220} />
      ) : (
        <VolumeAreaChart />
      )}
    </div>
    </div>
  )
}
