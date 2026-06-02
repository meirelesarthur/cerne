import { useState, useEffect, useRef } from 'react'
import { Building2, TrendingDown, Archive, DollarSign, BarChart3, PieChart } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { ChartCard } from '../../components/ui/ChartCard'
import { KpiStatCard } from '../../components/ui/KpiStatCard'
import { Skeleton } from '../../components/ui/Skeleton'

// ─── Stacked Bar Chart ────────────────────────────────────────────────────────

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

interface StackedTooltip {
  x: number
  y: number
  index: number
}

function StackedBarChart() {
  const { colors, isGbMode } = useTheme()
  const [hovered, setHovered] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<StackedTooltip | null>(null)

  const W = 860
  const H = 200
  const PL = 48
  const PR = 12
  const PT = 10
  const PB = 32
  const chartW = W - PL - PR
  const chartH = H - PT - PB

  const catColors = [t.color.brand[600], t.color.brand[400], t.color.brand[200], t.color.neutral[300]]

  const maxVal = Math.max(...STACKED_DATA.map(d => d.maq + d.vei + d.benf + d.outros))
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(r => Math.round(maxVal * r / 1000) * 1000)

  const barW = (chartW / STACKED_DATA.length) * 0.55
  const barSpacing = chartW / STACKED_DATA.length

  function formatK(v: number) {
    return `${(v / 1000).toFixed(0)}K`
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        {/* Grid lines */}
        {gridLines.map((gl, i) => {
          const y = PT + chartH - (gl / maxVal) * chartH
          return (
            <g key={i}>
              <line
                x1={PL} y1={y} x2={W - PR} y2={y}
                stroke={colors.border as string}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={t.font.size.xs} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
                {formatK(gl)}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {STACKED_DATA.map((d, i) => {
          const total = d.maq + d.vei + d.benf + d.outros
          const x = PL + i * barSpacing + (barSpacing - barW) / 2
          const segments = [d.maq, d.vei, d.benf, d.outros]
          let cumY = 0

          const isHov = hovered === i
          const isDim = hovered !== null && !isHov

          return (
            <g
              key={i}
              onMouseEnter={e => {
                setHovered(i)
                const rect = (e.currentTarget as SVGGElement).ownerSVGElement!.getBoundingClientRect()
                const svgX = (x + barW / 2) / W * rect.width + rect.left
                setTooltip({ x: svgX, y: rect.top, index: i })
              }}
              onMouseLeave={() => { setHovered(null); setTooltip(null) }}
              style={{ cursor: 'pointer', transition: 'opacity 0.18s ease', opacity: isDim ? 0.3 : 1 }}
            >
              {segments.map((seg, si) => {
                const segH = (seg / maxVal) * chartH
                const barY = PT + chartH - cumY - segH
                cumY += segH
                return (
                  <rect
                    key={si}
                    x={x}
                    y={barY}
                    width={barW}
                    height={segH}
                    fill={catColors[si]}
                    rx={si === segments.length - 1 ? 3 : 0}
                  />
                )
              })}
              {/* invisible hover target */}
              <rect
                x={x}
                y={PT}
                width={barW}
                height={chartH}
                fill="transparent"
              />
              {/* X label */}
              <text
                x={x + barW / 2}
                y={H - 8}
                textAnchor="middle"
                fontSize={t.font.size.xs}
                fill={colors.textMuted as string}
                fontFamily={t.font.family.sans}
              >
                {MONTHS_SHORT[i]}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {tooltip !== null && hovered !== null && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y - 10,
          background: isGbMode ? '#0b1e14' : '#fff',
          border: `1px solid ${colors.border}`,
          borderRadius: t.radius.DEFAULT,
          padding: `${t.space[2]}px ${t.space[3]}px`,
          fontSize: t.font.size.xs,
          color: colors.textPrimary as string,
          fontFamily: t.font.family.sans,
          boxShadow: t.shadow.lg,
          zIndex: t.zIndex.toast,
          pointerEvents: 'none',
          minWidth: 160,
        }}>
          <div style={{ fontWeight: t.font.weight.semibold, marginBottom: t.space[1], color: colors.textPrimary as string }}>{MONTHS_SHORT[hovered]}</div>
          {(['Máquinas/Equip.', 'Veículos', 'Benfeitorias', 'Outros'] as const).map((label, si) => {
            const vals = [STACKED_DATA[hovered].maq, STACKED_DATA[hovered].vei, STACKED_DATA[hovered].benf, STACKED_DATA[hovered].outros]
            return (
              <div key={si} style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginTop: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: catColors[si], flexShrink: 0 }} />
                <span style={{ color: colors.textSecondary as string }}>{label}:</span>
                <span style={{ fontWeight: t.font.weight.medium }}>R$ {(vals[si] / 1000).toFixed(1)}K</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function StackedLegend() {
  const { colors } = useTheme()
  const items = [
    { label: 'Máquinas/Equip.', color: t.color.brand[600] },
    { label: 'Veículos', color: t.color.brand[400] },
    { label: 'Benfeitorias', color: t.color.brand[200] },
    { label: 'Outros', color: t.color.neutral[300] },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.space[3] }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
          <span style={{ fontSize: t.font.size.xs, color: colors.textMuted as string, fontFamily: t.font.family.sans }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

const DONUT_DATA = [
  { label: 'Máquinas', pct: 45, color: t.color.brand[600] },
  { label: 'Veículos', pct: 28, color: t.color.brand[400] },
  { label: 'Benfeitorias', pct: 18, color: t.color.brand[200] },
  { label: 'Outros', pct: 9, color: t.color.neutral[300] },
]

const DONUT_VALUES = [8_400_000 * 0.45, 8_400_000 * 0.28, 8_400_000 * 0.18, 8_400_000 * 0.09]

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const x1 = cx + r * Math.cos(toRad(startAngle))
  const y1 = cy + r * Math.sin(toRad(startAngle))
  const x2 = cx + r * Math.cos(toRad(endAngle))
  const y2 = cy + r * Math.sin(toRad(endAngle))
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
}

function DonutChart() {
  const { colors, isGbMode } = useTheme()
  const [hovSeg, setHovSeg] = useState<number | null>(null)

  const cx = 90
  const cy = 90
  const R = 65
  const inner = 40
  let cursor = -90

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.space[6] }}>
      <svg width={180} height={180}>
        {DONUT_DATA.map((seg, i) => {
          const sweep = (seg.pct / 100) * 360
          const startA = cursor
          const endA = cursor + sweep
          cursor = endA

          const midA = (startA + endA) / 2
          const toRad = (deg: number) => (deg * Math.PI) / 180
          const outerPath = describeArc(cx, cy, R, startA, endA)
          const innerPath = describeArc(cx, cy, inner, endA, startA)

          const isHov = hovSeg === i
          const scaleR = isHov ? R + 5 : R

          return (
            <g
              key={i}
              onMouseEnter={() => setHovSeg(i)}
              onMouseLeave={() => setHovSeg(null)}
              style={{ cursor: 'pointer', transition: 'opacity 0.18s ease', opacity: hovSeg !== null && !isHov ? 0.45 : 1 }}
            >
              <path
                d={`${describeArc(cx, cy, scaleR, startA, endA)} L ${cx + inner * Math.cos(toRad(endA))} ${cy + inner * Math.sin(toRad(endA))} A ${inner} ${inner} 0 ${sweep > 180 ? 1 : 0} 0 ${cx + inner * Math.cos(toRad(startA))} ${cy + inner * Math.sin(toRad(startA))} Z`}
                fill={seg.color}
                style={{ transition: 'all 0.18s ease' }}
              />
            </g>
          )
        })}
        {/* Center */}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={t.font.size.xl} fontWeight={t.font.weight.bold} fill={isGbMode ? '#4ade80' : colors.textPrimary as string} fontFamily={t.font.family.sans}>
          R$8,4M
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={t.font.size.xs} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
          total
        </text>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2], flex: 1 }}>
        {DONUT_DATA.map((seg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.space[2],
              padding: `${t.space[1]}px ${t.space[2]}px`,
              borderRadius: t.radius.DEFAULT,
              background: hovSeg === i ? (isGbMode ? 'rgba(255,255,255,0.06)' : t.color.neutral[50]) : 'transparent',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={() => setHovSeg(i)}
            onMouseLeave={() => setHovSeg(null)}
          >
            <div style={{ width: 10, height: 10, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary as string, fontFamily: t.font.family.sans, flex: 1 }}>{seg.label}</span>
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted as string, fontFamily: t.font.family.sans }}>{seg.pct}%</span>
            <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.medium, color: colors.textPrimary as string, fontFamily: t.font.family.sans }}>
              R$ {(DONUT_VALUES[i] / 1_000_000).toFixed(1)}M
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Area / Projection Chart ──────────────────────────────────────────────────

const PROJ_MONTHS = Array.from({ length: 24 }, (_, i) => i)
const CURRENT_MONTH = 11

function generateProjection() {
  return PROJ_MONTHS.map(i => {
    const base = 6_300_000 - i * 220_000
    const jitter = i < CURRENT_MONTH ? (Math.sin(i * 1.3) * 50_000) : 0
    return Math.max(base + jitter, 1_000_000)
  })
}

const PROJ_VALUES = generateProjection()

interface ProjTooltip {
  x: number
  y: number
  index: number
}

function ProjectionChart() {
  const { colors, isGbMode } = useTheme()
  const [hovPt, setHovPt] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<ProjTooltip | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const W = 420
  const H = 200
  const PL = 56
  const PR = 16
  const PT = 12
  const PB = 28
  const chartW = W - PL - PR
  const chartH = H - PT - PB

  const maxV = Math.max(...PROJ_VALUES)
  const minV = Math.min(...PROJ_VALUES)

  function toX(i: number) { return PL + (i / (PROJ_VALUES.length - 1)) * chartW }
  function toY(v: number) { return PT + chartH - ((v - minV) / (maxV - minV)) * chartH }

  const linePath = PROJ_VALUES.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ')
  const areaPath = `${linePath} L ${toX(PROJ_VALUES.length - 1)} ${PT + chartH} L ${toX(0)} ${PT + chartH} Z`

  const solidPath = PROJ_VALUES.slice(0, CURRENT_MONTH + 1).map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ')
  const dashPath = PROJ_VALUES.slice(CURRENT_MONTH).map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i + CURRENT_MONTH)} ${toY(v)}`).join(' ')

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.color.brand[600]} stopOpacity={0.18} />
            <stop offset="100%" stopColor={t.color.brand[600]} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const v = minV + r * (maxV - minV)
          const y = toY(v)
          return (
            <g key={i}>
              <line x1={PL} y1={y} x2={W - PR} y2={y} stroke={colors.border as string} strokeWidth={1} strokeDasharray="4 4" />
              <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={t.font.size.xs} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
                {(v / 1_000_000).toFixed(1)}M
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#projGrad)" />

        {/* Solid line (past) */}
        <path d={solidPath} fill="none" stroke={t.color.brand[600]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Dashed line (future) */}
        <path d={dashPath} fill="none" stroke={t.color.brand[400]} strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" strokeLinejoin="round" />

        {/* Current month marker */}
        <line x1={toX(CURRENT_MONTH)} y1={PT} x2={toX(CURRENT_MONTH)} y2={PT + chartH} stroke={t.color.brand[600]} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />

        {/* Dots */}
        {PROJ_VALUES.map((v, i) => (
          <circle
            key={i}
            cx={toX(i)}
            cy={toY(v)}
            r={hovPt === i ? 5 : 3}
            fill={i <= CURRENT_MONTH ? t.color.brand[600] : t.color.brand[300]}
            stroke={isGbMode ? '#0b1e14' : '#fff'}
            strokeWidth={2}
            style={{ cursor: 'pointer', transition: 'r 0.12s ease' }}
            onMouseEnter={e => {
              setHovPt(i)
              const rect = svgRef.current!.getBoundingClientRect()
              setTooltip({ x: toX(i) / W * rect.width + rect.left, y: toY(v) / H * rect.height + rect.top, index: i })
            }}
            onMouseLeave={() => { setHovPt(null); setTooltip(null) }}
          />
        ))}

        {/* X labels (every 4) */}
        {PROJ_VALUES.map((_, i) => i % 4 === 0 && (
          <text key={i} x={toX(i)} y={H - 8} textAnchor="middle" fontSize={t.font.size.xs} fill={colors.textMuted as string} fontFamily={t.font.family.sans}>
            M{i + 1}
          </text>
        ))}
      </svg>

      {tooltip && hovPt !== null && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y - 40,
          background: isGbMode ? '#0b1e14' : '#fff',
          border: `1px solid ${colors.border}`,
          borderRadius: t.radius.DEFAULT,
          padding: `${t.space[1]}px ${t.space[2]}px`,
          fontSize: t.font.size.xs,
          color: colors.textPrimary as string,
          fontFamily: t.font.family.sans,
          boxShadow: t.shadow.lg,
          zIndex: t.zIndex.toast,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontWeight: t.font.weight.semibold }}>Mês {hovPt + 1}{hovPt > CURRENT_MONTH ? ' (projeção)' : ''}</div>
          <div style={{ color: colors.textSecondary as string }}>R$ {(PROJ_VALUES[hovPt] / 1_000_000).toFixed(2)}M</div>
        </div>
      )}
    </div>
  )
}

// ─── DashDepreciacoes ─────────────────────────────────────────────────────────

export default function DashDepreciacoes() {
  const { colors } = useTheme()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4], padding: t.space[4] }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[4] }}>
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} height={110} />)}
        </div>
        <Skeleton height={260} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
          <Skeleton height={260} />
          <Skeleton height={260} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4], padding: t.space[4] }}>
      {/* Row 1 — KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[4] }}>
        <KpiStatCard
          icon={Building2}
          label="Valor Total Bens"
          value="R$ 8,4M"
          trend="2,1%"
          trendUp
          accentColor={t.color.brand[600]}
        />
        <KpiStatCard
          icon={TrendingDown}
          label="Depreciação Mensal"
          value="R$ 42.380"
          accentColor={t.color.error.text}
        />
        <KpiStatCard
          icon={Archive}
          label="Dep. Acumulada"
          value="R$ 2,1M"
          trend="6,3%"
          trendUp
          accentColor={t.color.neutral[500]}
        />
        <KpiStatCard
          icon={DollarSign}
          label="Valor Residual"
          value="R$ 6,3M"
          trend="0,8%"
          trendUp={false}
          accentColor={t.color.brand[700]}
        />
      </div>

      {/* Row 2 — Stacked bar */}
      <ChartCard
        icon={BarChart3}
        title="Depreciação por Categoria — Últimos 12 Meses"
        action={<StackedLegend />}
      >
        <StackedBarChart />
      </ChartCard>

      {/* Row 3 — Donut + Projection */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
        <ChartCard icon={PieChart} title="Composição por Tipo de Bem">
          <DonutChart />
        </ChartCard>
        <ChartCard icon={TrendingDown} title="Projeção Próximos 24 Meses">
          <div style={{ marginBottom: t.space[2] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[3] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
                <div style={{ width: 16, height: 2, background: t.color.brand[600] }} />
                <span style={{ fontSize: t.font.size.xs, color: colors.textMuted as string, fontFamily: t.font.family.sans }}>Realizado</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
                <div style={{ width: 16, height: 2, background: t.color.brand[400], borderTop: `2px dashed ${t.color.brand[400]}` }} />
                <span style={{ fontSize: t.font.size.xs, color: colors.textMuted as string, fontFamily: t.font.family.sans }}>Projeção</span>
              </div>
            </div>
          </div>
          <ProjectionChart />
        </ChartCard>
      </div>
    </div>
  )
}
