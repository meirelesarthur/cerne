import { useEffect, useState } from 'react'
import {
  ClipboardList,
  FileText,
  ShoppingCart,
  PackageCheck,
  BarChart2,
  ChevronDown,
  Users,
} from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { SankeyFunnel } from '../../components/ui/SankeyFunnel'
import { SparklineArea } from '../../components/ui/SparklineArea'
import { Button } from '../../components/ui/Button'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'

// ─── Mock data ────────────────────────────────────────────────────────────────

const funnelStages = [
  { label: 'Solicitações', value: 284, sublabel: '100%' },
  { label: 'Cotações',     value: 67,  sublabel: '23,6% conv.' },
  { label: 'Pedidos',      value: 43,  sublabel: '64,2% conv.' },
  { label: 'Recebimentos', value: 38,  sublabel: '88,4% conv.' },
]

const kpiSparklines: Record<string, number[]> = {
  'Solicitações':      [210, 240, 228, 255, 262, 270, 284],
  'Cotações Abertas':  [52, 58, 55, 61, 63, 65, 67],
  'Pedidos de Compra': [31, 35, 38, 40, 41, 43, 43],
  'Recebimentos':      [40, 38, 39, 37, 38, 36, 38],
}

const funnelMeta = [
  { label: 'Valor Médio',  values: ['R$ 1.240', 'R$ 4.820', 'R$ 12.600', 'R$ 11.900'] },
  { label: 'Lead Time',    values: ['1 dia', '3 dias', '7 dias', '12 dias'] },
  { label: 'Prazo Médio',  values: ['Imediato', '48h', '15 dias', '30 dias'] },
] as const

const categoriaData = [
  { label: 'Defensivos',   value: 420000 },
  { label: 'Fertilizantes', value: 380000 },
  { label: 'Sementes',     value: 260000 },
  { label: 'Combustível',  value: 180000 },
  { label: 'Peças',        value: 140000 },
  { label: 'Outros',       value: 90000 },
] as const

const fornecedores = [
  { nome: 'AgroSul Insumos',    categoria: 'Defensivos',    valor: 'R$ 284.500', badge: 'Excelente' as const, pct: 92 },
  { nome: 'Sementes Primavera', categoria: 'Sementes',      valor: 'R$ 198.200', badge: 'Excelente' as const, pct: 80 },
  { nome: 'FertMax Nutrição',   categoria: 'Fertilizantes', valor: 'R$ 156.800', badge: 'Bom'       as const, pct: 64 },
  { nome: 'CombustAgro',        categoria: 'Combustível',   valor: 'R$ 94.300',  badge: 'Bom'       as const, pct: 38 },
  { nome: 'Peças & Campo',      categoria: 'Peças',         valor: 'R$ 61.100',  badge: 'Regular'   as const, pct: 25 },
] as const

type Badge = 'Excelente' | 'Bom' | 'Regular'
const badgeStyle: Record<Badge, { color: string; bg: string }> = {
  Excelente: { color: t.color.feedback.success.text, bg: t.color.feedback.success.bg },
  Bom:       { color: t.color.feedback.info.text,    bg: t.color.feedback.info.bg },
  Regular:   { color: t.color.feedback.warning.text, bg: t.color.feedback.warning.bg },
}

// ─── Trend badge ──────────────────────────────────────────────────────────────

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

// ─── Horizontal Bar Chart ─────────────────────────────────────────────────────

function HBarChart({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  const maxVal = Math.max(...categoriaData.map(d => d.value))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
      {categoriaData.map((cat, i) => {
        const pct = (cat.value / maxVal) * 100
        const isHov = hovIdx === i
        const dimmed = hovIdx !== null && !isHov
        return (
          <div key={i} onMouseEnter={() => setHovIdx(i)} onMouseLeave={() => setHovIdx(null)} style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.space[1] }}>
              <span style={{ fontSize: t.font.size.sm, color: colors.fg.muted as string, fontFamily: t.font.family.sans, opacity: dimmed ? 0.3 : 1, transition: 'opacity 0.18s ease' }}>
                {cat.label}
              </span>
              <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default as string, fontFamily: t.font.family.sans, opacity: dimmed ? 0.3 : 1, transition: 'opacity 0.18s ease' }}>
                R$ {(cat.value / 1000).toFixed(0)}K
              </span>
            </div>
            <div style={{ height: 8, background: isGbMode ? 'rgba(255,255,255,0.06)' : t.color.neutral[100], borderRadius: t.radius.full, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: isHov ? t.color.brand[500] : t.color.brand[600],
                borderRadius: t.radius.full,
                opacity: dimmed ? 0.2 : 1,
                transition: 'opacity 0.18s ease, background 0.15s ease',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Fornecedores List ────────────────────────────────────────────────────────

function FornecedoresList({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
      {fornecedores.map((f, i) => {
        const bs = badgeStyle[f.badge]
        return (
          <div key={i}
            onMouseEnter={() => setHovIdx(i)} onMouseLeave={() => setHovIdx(null)}
            style={{
              padding: `${t.space[2]}px ${t.space[2]}px`,
              borderRadius: t.radius.DEFAULT,
              background: hovIdx === i ? (isGbMode ? 'rgba(255,255,255,0.05)' : t.color.neutral[50]) : 'transparent',
              transition: 'background 0.15s ease', cursor: 'default',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[1] }}>
              <div>
                <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.fg.default as string, fontFamily: t.font.family.sans }}>
                  {f.nome}
                </div>
                <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
                  {f.categoria}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
                <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default as string, fontFamily: t.font.family.sans }}>
                  {f.valor}
                </span>
                <span style={{
                  fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
                  color: bs.color, background: bs.bg,
                  borderRadius: t.radius.full, padding: `2px ${t.space[2]}px`, fontFamily: t.font.family.sans,
                }}>
                  {f.badge}
                </span>
              </div>
            </div>
            <div style={{ height: 4, background: isGbMode ? 'rgba(255,255,255,0.06)' : t.color.neutral[100], borderRadius: t.radius.full, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${f.pct}%`, background: t.color.brand[600], borderRadius: t.radius.full }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── DashSuprimentos ──────────────────────────────────────────────────────────

export default function DashSuprimentos() {
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
    boxShadow: isGbMode
      ? '0 1px 2px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.35)'
      : '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.07)',
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
    { label: 'Solicitações',     value: '284', trend: '8,3% vs mês ant.', up: true  },
    { label: 'Cotações Abertas', value: '67',  trend: '4,1% vs mês ant.', up: true  },
    { label: 'Pedidos de Compra', value: '43', trend: '2,7% vs mês ant.', up: true  },
    { label: 'Recebimentos',     value: '38',  trend: '1,2% vs mês ant.', up: false },
  ]

  return (
    <div style={cardStyle}>

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${t.space[4]}px ${t.space[5]}px`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          <BarChart2 size={13} color={colors.fg.subtle as string} />
          <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default as string }}>
            Suprimentos
          </span>
        </div>
        <Button variant="secondary" size="sm" iconRight={<ChevronDown size={11} />}>
          Últimos 30 dias
        </Button>
      </div>

      <HDivider color={bc} />

      {/* ── KPI row com sparklines ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex' }}>
        {kpis.flatMap((kpi, i) => [
          i > 0 ? <VDivider key={`d${i}`} color={bc} /> : null,
          <div key={kpi.label} style={{ flex: 1, padding: `${t.space[5]}px ${t.space[5]}px ${t.space[3]}px` }}>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[1] }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default as string, lineHeight: 1.1, marginBottom: t.space[2] }}>
              {kpi.value}
            </div>
            <Trend value={kpi.trend} up={kpi.up} />
            <div style={{ marginTop: t.space[3], height: 40 }}>
              <SparklineArea data={kpiSparklines[kpi.label]} color={kpi.up ? t.color.brand[600] : t.color.feedback.error.solid} height={40} />
            </div>
          </div>,
        ])}
      </div>

      <HDivider color={bc} />

      {/* ── Sankey Funnel ──────────────────────────────────────────────────────── */}
      <div style={{ padding: `${t.space[5]}px` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: t.space[4] }}>
          <div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default as string, lineHeight: 1 }}>
              284
            </div>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginTop: t.space[1] }}>
              Solicitações → Recebimentos — Funil de suprimentos
            </div>
          </div>
          <div style={{
            fontSize: t.font.size.xs, color: t.color.feedback.success.text,
            background: t.color.feedback.success.bg, borderRadius: t.radius.full,
            padding: `3px ${t.space[2]}px`, fontWeight: t.font.weight.medium,
          }}>
            13,4% taxa final
          </div>
        </div>

        <SankeyFunnel stages={funnelStages} colors={colors} isGbMode={isGbMode} chartHeight={160} />

        {/* Meta table */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${funnelStages.length}, 1fr)`,
          gap: t.space[2],
          marginTop: t.space[4],
          paddingTop: t.space[3],
        }}>
          {funnelStages.map((stage, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
              {funnelMeta.map((meta, j) => (
                <div key={j}>
                  <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
                    {meta.label}
                  </div>
                  <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default as string, fontFamily: t.font.family.sans }}>
                    {meta.values[i]}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <HDivider color={bc} />

      {/* ── Bottom row: HBar (1/2) + Fornecedores (1/2) ──────────────────────── */}
      <div style={{ display: 'flex' }}>

        <div style={{ flex: 1, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <BarChart2 size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string }}>
              Gastos por Categoria
            </span>
          </div>
          <HBarChart colors={colors} isGbMode={isGbMode} />
        </div>

        <VDivider color={bc} />

        <div style={{ flex: 1, padding: `${t.space[5]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[4] }}>
            <Users size={12} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string }}>
              Top Fornecedores
            </span>
          </div>
          <FornecedoresList colors={colors} isGbMode={isGbMode} />
        </div>

      </div>
    </div>
  )
}
