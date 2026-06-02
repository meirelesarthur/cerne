import { useEffect, useState } from 'react'
import {
  ClipboardList,
  FileText,
  ShoppingCart,
  PackageCheck,
  GitMerge,
  BarChart2,
  Users,
} from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { KpiStatCard } from '../../components/ui/KpiStatCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { Skeleton } from '../../components/ui/Skeleton'

// ─── Mock data ────────────────────────────────────────────────────────────────

const funnelStages = [
  { label: 'Solicitações', value: 284, conversion: null },
  { label: 'Cotações', value: 67, conversion: 23.6 },
  { label: 'Pedidos', value: 43, conversion: 64.2 },
  { label: 'Recebimentos', value: 38, conversion: 88.4 },
] as const

const funnelMeta = [
  { label: 'Valor Médio', values: ['R$ 1.240', 'R$ 4.820', 'R$ 12.600', 'R$ 11.900'] },
  { label: 'Lead Time', values: ['1 dia', '3 dias', '7 dias', '12 dias'] },
  { label: 'Prazo Médio', values: ['Imediato', '48h', '15 dias', '30 dias'] },
] as const

const categoriaData = [
  { label: 'Defensivos', value: 420000 },
  { label: 'Fertilizantes', value: 380000 },
  { label: 'Sementes', value: 260000 },
  { label: 'Combustível', value: 180000 },
  { label: 'Peças', value: 140000 },
  { label: 'Outros', value: 90000 },
] as const

const fornecedores = [
  { nome: 'AgroSul Insumos', categoria: 'Defensivos', valor: 'R$ 284.500', badge: 'Excelente' as const, pct: 92 },
  { nome: 'Sementes Primavera', categoria: 'Sementes', valor: 'R$ 198.200', badge: 'Excelente' as const, pct: 80 },
  { nome: 'FertMax Nutrição', categoria: 'Fertilizantes', valor: 'R$ 156.800', badge: 'Bom' as const, pct: 64 },
  { nome: 'CombustAgro', categoria: 'Combustível', valor: 'R$ 94.300', badge: 'Bom' as const, pct: 38 },
  { nome: 'Peças & Campo', categoria: 'Peças', valor: 'R$ 61.100', badge: 'Regular' as const, pct: 25 },
] as const

type Badge = 'Excelente' | 'Bom' | 'Regular'

const badgeStyle: Record<Badge, { color: string; bg: string }> = {
  Excelente: { color: t.color.success.text, bg: t.color.success.bg },
  Bom:       { color: t.color.info.text,    bg: t.color.info.bg },
  Regular:   { color: t.color.warning.text, bg: t.color.warning.bg },
}

// ─── Funil SVG ────────────────────────────────────────────────────────────────

function FunilChart({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  const W = 800
  const H = 200
  const stages = funnelStages.length
  const gap = 6
  const totalW = W - gap * (stages - 1)
  const stageW = totalW / stages
  const topH = H * 0.85
  const widths = [1.0, 0.78, 0.58, 0.40]
  const tooltipFill = isGbMode ? '#0b1e14' : '#ffffff'

  const trapezoid = (i: number) => {
    const x = i * (stageW + gap)
    const wTop = stageW * widths[i]
    const wBot = i < stages - 1 ? stageW * widths[i + 1] : stageW * widths[i] * 0.85
    const xTop = x + (stageW - wTop) / 2
    const xBot = x + (stageW - wBot) / 2
    return `M ${xTop},0 L ${xTop + wTop},0 L ${xBot + wBot},${topH} L ${xBot},${topH} Z`
  }

  const opacities = [1.0, 0.75, 0.55, 0.40]

  return (
    <div>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
      >
        {funnelStages.map((stage, i) => {
          const x = i * (stageW + gap)
          const cx = x + stageW / 2
          const cy = topH / 2
          const isHov = hovIdx === i
          const dimmed = hovIdx !== null && !isHov

          return (
            <g
              key={i}
              onMouseEnter={() => setHovIdx(i)}
              onMouseLeave={() => setHovIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              <path
                d={trapezoid(i)}
                fill={t.color.brand[600]}
                opacity={dimmed ? 0.2 : opacities[i]}
                style={{ transition: 'opacity 0.18s ease' }}
              />
              <text
                x={cx}
                y={cy - 10}
                textAnchor="middle"
                fontSize={22}
                fontWeight={t.font.weight.bold}
                fill="#ffffff"
                fontFamily={t.font.family.sans}
                opacity={dimmed ? 0.3 : 1}
                style={{ transition: 'opacity 0.18s ease' }}
              >
                {stage.value}
              </text>
              <text
                x={cx}
                y={cy + 10}
                textAnchor="middle"
                fontSize={10}
                fill="#ffffff"
                fontFamily={t.font.family.sans}
                opacity={dimmed ? 0.3 : 0.85}
                style={{ transition: 'opacity 0.18s ease' }}
              >
                {stage.label}
              </text>
              {stage.conversion !== null && (
                <text
                  x={cx}
                  y={cy + 26}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#ffffff"
                  fontFamily={t.font.family.sans}
                  opacity={dimmed ? 0.2 : 0.7}
                  style={{ transition: 'opacity 0.18s ease' }}
                >
                  {stage.conversion}% conv.
                </text>
              )}

              {isHov && (
                <g>
                  <rect
                    x={Math.min(cx - 50, W - 110)}
                    y={topH + 4}
                    width={108}
                    height={34}
                    rx={t.radius.DEFAULT}
                    fill={tooltipFill}
                    stroke={colors.border as string}
                    strokeWidth={0.8}
                  />
                  <text
                    x={Math.min(cx - 50, W - 110) + 8}
                    y={topH + 18}
                    fontSize={9}
                    fill={colors.textSecondary as string}
                    fontFamily={t.font.family.sans}
                    fontWeight={t.font.weight.semibold}
                  >
                    {stage.label}: {stage.value}
                  </text>
                  {stage.conversion !== null && (
                    <text
                      x={Math.min(cx - 50, W - 110) + 8}
                      y={topH + 30}
                      fontSize={9}
                      fill={t.color.brand[600]}
                      fontFamily={t.font.family.sans}
                    >
                      Taxa: {stage.conversion}%
                    </text>
                  )}
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {/* Meta rows */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${stages}, 1fr)`,
          gap: t.space[2],
          marginTop: t.space[4],
          borderTop: `1px solid ${colors.border}`,
          paddingTop: t.space[3],
        }}
      >
        {funnelStages.map((stage, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
            {funnelMeta.map((meta, j) => (
              <div key={j}>
                <div style={{ fontSize: t.font.size.xs, color: colors.textMuted as string, fontFamily: t.font.family.sans }}>
                  {meta.label}
                </div>
                <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.textPrimary as string, fontFamily: t.font.family.sans }}>
                  {meta.values[i]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Horizontal Bar Chart ────────────────────────────────────────────────────

function HBarChart({ colors, isGbMode }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  const maxVal = Math.max(...categoriaData.map(d => d.value))
  const tooltipFill = isGbMode ? '#0b1e14' : '#ffffff'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
      {categoriaData.map((cat, i) => {
        const pct = (cat.value / maxVal) * 100
        const isHov = hovIdx === i
        const dimmed = hovIdx !== null && !isHov
        return (
          <div
            key={i}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
            style={{ cursor: 'default' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.space[1] }}>
              <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary as string, fontFamily: t.font.family.sans, opacity: dimmed ? 0.3 : 1, transition: 'opacity 0.18s ease' }}>
                {cat.label}
              </span>
              <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.textPrimary as string, fontFamily: t.font.family.sans, opacity: dimmed ? 0.3 : 1, transition: 'opacity 0.18s ease' }}>
                R$ {(cat.value / 1000).toFixed(0)}K
              </span>
            </div>
            <div style={{ height: 8, background: isGbMode ? 'rgba(255,255,255,0.06)' : t.color.neutral[100], borderRadius: t.radius.full, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: isHov ? t.color.brand[500] : t.color.brand[600],
                  borderRadius: t.radius.full,
                  opacity: dimmed ? 0.2 : 1,
                  transition: 'opacity 0.18s ease, background 0.15s ease',
                }}
              />
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
          <div
            key={i}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
            style={{
              padding: `${t.space[2]}px ${t.space[2]}px`,
              borderRadius: t.radius.DEFAULT,
              background: hovIdx === i ? (isGbMode ? 'rgba(255,255,255,0.05)' : t.color.neutral[50]) : 'transparent',
              transition: 'background 0.15s ease',
              cursor: 'default',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[1] }}>
              <div>
                <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.textPrimary as string, fontFamily: t.font.family.sans }}>
                  {f.nome}
                </div>
                <div style={{ fontSize: t.font.size.xs, color: colors.textMuted as string, fontFamily: t.font.family.sans }}>
                  {f.categoria}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
                <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.textPrimary as string, fontFamily: t.font.family.sans }}>
                  {f.valor}
                </span>
                <span style={{
                  fontSize: t.font.size.xs,
                  fontWeight: t.font.weight.medium,
                  color: bs.color,
                  background: bs.bg,
                  borderRadius: t.radius.full,
                  padding: `2px ${t.space[2]}px`,
                  fontFamily: t.font.family.sans,
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

// ─── DashSuprimentos ─────────────────────────────────────────────────────────

export default function DashSuprimentos() {
  const { colors, isGbMode } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[6], padding: t.space[6] }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[4] }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={120} />)}
        </div>
        <Skeleton height={320} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
          <Skeleton height={260} />
          <Skeleton height={260} />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      margin: `${t.space[5]}px ${t.space[6]}px`,
      background: colors.surfaceBg,
      borderRadius: t.radius['2xl'],
      border: `1px solid ${colors.border}`,
      boxShadow: isGbMode
        ? '0 1px 2px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.35)'
        : '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.07)',
    }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[6], padding: t.space[6], fontFamily: t.font.family.sans }}>
      {/* Row 1 — KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[4] }}>
        <KpiStatCard
          icon={ClipboardList}
          label="Solicitações"
          value="284"
          trend="▲ 8,3% vs mês ant."
          trendUp
          accentColor={t.color.brand[600]}
        />
        <KpiStatCard
          icon={FileText}
          label="Cotações Abertas"
          value="67"
          trend="▲ 4,1% vs mês ant."
          trendUp
          accentColor={t.color.info.text}
        />
        <KpiStatCard
          icon={ShoppingCart}
          label="Pedidos de Compra"
          value="43"
          trend="▲ 2,7% vs mês ant."
          trendUp
          accentColor={t.color.notification}
        />
        <KpiStatCard
          icon={PackageCheck}
          label="Recebimentos"
          value="38"
          trend="▼ 1,2% vs mês ant."
          trendUp={false}
          accentColor={t.color.success.text}
        />
      </div>

      {/* Row 2 — Funil */}
      <ChartCard icon={GitMerge} title="Funil de Suprimentos">
        <FunilChart colors={colors} isGbMode={isGbMode} />
      </ChartCard>

      {/* Row 3 — Gastos por Categoria + Top Fornecedores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
        <ChartCard icon={BarChart2} title="Gastos por Categoria">
          <HBarChart colors={colors} isGbMode={isGbMode} />
        </ChartCard>

        <ChartCard icon={Users} title="Top Fornecedores">
          <FornecedoresList colors={colors} isGbMode={isGbMode} />
        </ChartCard>
      </div>
    </div>
    </div>
  )
}
