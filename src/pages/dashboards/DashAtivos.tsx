import { useState, useEffect } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { FilterSelect } from '../../components/ui/FilterSelect'
import { Heading } from '../../components/ui/Heading'
import { Trend } from '../../components/ui/Trend'
import { GroupedBarChart } from '../../components/ui/GroupedBarChart'
import { useMediaQuery } from '../../hooks/useMediaQuery'

// ─── Ativos por Categoria ──────────────────────────────────────────────────────

const CATEGORIAS = [
  { label: 'Tratores',     total: 85, op: 72 },
  { label: 'Implementos',  total: 67, op: 54 },
  { label: 'Veículos',     total: 48, op: 43 },
  { label: 'Equipamentos', total: 52, op: 46 },
  { label: 'Benfeitorias', total: 34, op: 28 },
  { label: 'Outros',       total: 56, op: 55 },
]

const CATEGORIAS_LABELS = CATEGORIAS.map(c => c.label)

const CATEGORIAS_SERIES = [
  {
    name: 'Total',
    data: CATEGORIAS.map(c => c.total),
    color: t.color.brand[600],
  },
  {
    name: 'Em Operação',
    data: CATEGORIAS.map(c => c.op),
    color: t.color.brand[200],
  },
]

// ─── Status Cards ─────────────────────────────────────────────────────────────

interface StatusItem {
  label: string
  count: number
  pct: number
  color: string
}

const STATUS_ITEMS: StatusItem[] = [
  { label: 'Operacional',          count: 298, pct: 87.1, color: t.color.brand[600] },
  { label: 'Manutenção Preventiva', count: 13,  pct: 3.8,  color: t.color.feedback.notice },
  { label: 'Corretiva / Parado',   count: 18,  pct: 5.3,  color: t.color.feedback.error.text },
  { label: 'Aposentado / Baixa',   count: 13,  pct: 3.8,  color: t.color.neutral[400] },
]

function StatusCards() {
  const { colors, isGbMode } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(id)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
      {STATUS_ITEMS.map((item, i) => (
        <div
          key={i}
          style={{
            padding: `${t.space[2]}px ${t.space[3]}px`,
            borderRadius: t.radius.lg,
            border: `1px solid ${colors.border.default}`,
            background: isGbMode ? 'rgba(255,255,255,0.03)' : t.color.neutral[50],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[1] + 2 }}>
            <span style={{ fontSize: t.font.size.sm, color: colors.fg.muted as string, fontFamily: t.font.family.sans }}>{item.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>{item.pct}%</span>
              <span style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.semibold, color: colors.fg.default as string, fontFamily: t.font.family.sans }}>{item.count}</span>
            </div>
          </div>
          <div style={{
            height: 6,
            borderRadius: t.radius.full,
            background: isGbMode ? 'rgba(255,255,255,0.08)' : t.color.neutral[200],
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: mounted ? `${item.pct}%` : '0%',
              background: item.color,
              borderRadius: t.radius.full,
              transition: `width 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 80}ms`,
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Manutenções por Mês ──────────────────────────────────────────────────────

const MANUT_DATA = [
  { prev: 8, cor: 3 }, { prev: 6, cor: 5 }, { prev: 9, cor: 2 }, { prev: 7, cor: 4 },
  { prev: 10, cor: 3 }, { prev: 8, cor: 6 }, { prev: 11, cor: 2 }, { prev: 9, cor: 4 },
  { prev: 12, cor: 3 }, { prev: 10, cor: 5 }, { prev: 13, cor: 2 }, { prev: 11, cor: 4 },
]

const MANUT_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const MANUT_SERIES = [
  {
    name: 'Preventivas',
    data: MANUT_DATA.map(d => d.prev),
    color: t.color.brand[600],
  },
  {
    name: 'Corretivas',
    data: MANUT_DATA.map(d => d.cor),
    color: t.color.feedback.error.text,
  },
]

// ─── DashAtivos ───────────────────────────────────────────────────────────────

const ATIVOS_KPIS = [
  { label: 'Total de Ativos',   value: '342',     trend: '5,4%',  up: true  },
  { label: 'Em Operação',       value: '298',     trend: '3,2%',  up: true  },
  { label: 'Em Manutenção',     value: '31',      trend: '12,4%', up: false },
  { label: 'Valor Patrimonial', value: 'R$ 8,4M', trend: '2,1%',  up: true  },
]

export default function DashAtivos() {
  const { colors, isGbMode } = useTheme()
  const [loading, setLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [periodo, setPeriodo] = useState('12')
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

  // Dados filtrados: período fatia os últimos N meses da série de manutenções
  const nMeses = Number(periodo)
  const manutLabels = MANUT_LABELS.slice(-nMeses)
  const manutSeries = MANUT_SERIES.map((s) => ({ ...s, data: s.data.slice(-nMeses) }))

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.space[4]}px ${t.space[5]}px` }}>
        <Heading level={2} size="sm" weight="semibold">Ativos</Heading>
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
      <div style={{ display: 'flex', flexWrap: stacked ? 'wrap' : undefined }}>
        {ATIVOS_KPIS.flatMap((kpi, i) => [
          i > 0 && !stacked ? <VDivider key={`d${i}`} color={bc} /> : null,
          <div key={kpi.label} style={{ flex: stacked ? '1 1 45%' : 1, padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px` }}>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[1] }}>{kpi.label}</div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default as string, lineHeight: 1.1, marginBottom: t.space[2] }}>{kpi.value}</div>
            <Trend value={kpi.trend} up={kpi.up} />
          </div>,
        ])}
      </div>
      <HDivider color={bc} />

      {/* Row 2 — Grouped H-bar + Status */}
      <div style={{ display: 'flex', flexDirection: stacked ? 'column' : 'row' }}>
        <div style={{ flex: 3, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[4] }}>Ativos por Categoria</div>
          <GroupedBarChart
            series={CATEGORIAS_SERIES}
            labels={CATEGORIAS_LABELS}
            height={260}
            showLegend
          />
        </div>
        {!stacked && <VDivider color={bc} />}
        <div style={{ flex: 2, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[4] }}>Status dos Ativos</div>
          <StatusCards />
        </div>
      </div>
      <HDivider color={bc} />

      {/* Row 3 — Manutenções */}
      <div style={{ padding: t.space[5] }}>
        <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[4] }}>Manutenções por Mês</div>
        <GroupedBarChart
          series={manutSeries}
          labels={manutLabels}
          height={200}
          showLegend
        />
      </div>
    </div>
  )
}
