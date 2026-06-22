import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { Button } from '../../components/ui/Button'

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

const CAT_COLORS = [t.color.brand[600], t.color.brand[400], t.color.brand[200], t.color.neutral[300]]
const CAT_LABELS = ['Máquinas/Equip.', 'Veículos', 'Benfeitorias', 'Outros'] as const

function StackedBarChart() {
  const { colors, isGbMode } = useTheme()
  const [hovered, setHovered] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; index: number } | null>(null)
  const [animated, setAnimated] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), 60)
    return () => clearTimeout(id)
  }, [])

  const W = 860
  const H = 210
  const PL = 52
  const PR = 12
  const PT = 10
  const PB = 36
  const chartW = W - PL - PR
  const chartH = H - PT - PB

  const maxVal = Math.max(...STACKED_DATA.map(d => d.maq + d.vei + d.benf + d.outros))
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(r => Math.round(maxVal * r / 1000) * 1000)

  const barW = (chartW / STACKED_DATA.length) * 0.56
  const barSpacing = chartW / STACKED_DATA.length

  function formatK(v: number) {
    return `${(v / 1000).toFixed(0)}K`
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        {/* Grid lines */}
        {gridLines.map((gl, i) => {
          const y = PT + chartH - (gl / maxVal) * chartH
          return (
            <g key={i}>
              <line x1={PL} y1={y} x2={W - PR} y2={y}
                stroke={colors.border.default as string} strokeWidth={0.5} strokeDasharray="4 4" />
              <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={t.font.size.base}
                fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
                {formatK(gl)}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {STACKED_DATA.map((d, i) => {
          const x = PL + i * barSpacing + (barSpacing - barW) / 2
          const segments = [d.maq, d.vei, d.benf, d.outros]
          const isHov = hovered === i
          const isDim = hovered !== null && !isHov
          let cumH = 0

          return (
            <g key={i}
              onMouseEnter={() => {
                setHovered(i)
                if (svgRef.current) {
                  const r = svgRef.current.getBoundingClientRect()
                  setTooltip({
                    x: (x + barW / 2) / W * r.width + r.left,
                    y: r.top,
                    index: i,
                  })
                }
              }}
              onMouseLeave={() => { setHovered(null); setTooltip(null) }}
              style={{ cursor: 'pointer', opacity: isDim ? 0.28 : 1, transition: 'opacity 0.18s ease' }}
            >
              {segments.map((seg, si) => {
                const segH = (seg / maxVal) * chartH
                const barY = PT + chartH - cumH - segH
                const isTop = si === segments.length - 1
                cumH += segH
                return (
                  <rect
                    key={si}
                    x={x} y={barY}
                    width={barW} height={segH}
                    fill={CAT_COLORS[si]}
                    rx={isTop ? 3 : 0}
                    style={{
                      transformBox: 'fill-box' as React.CSSProperties['transformBox'],
                      transformOrigin: '50% 100%',
                      transform: animated ? 'scaleY(1)' : 'scaleY(0)',
                      transition: `transform 540ms cubic-bezier(0,0,0.2,1) ${i * 22}ms`,
                    }}
                  />
                )
              })}
              {/* Month label */}
              <text x={x + barW / 2} y={H - 10} textAnchor="middle"
                fontSize={t.font.size.base}
                fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
                {MONTHS_SHORT[i]}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Floating tooltip */}
      {tooltip !== null && hovered !== null && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y + 10,
          background: isGbMode ? '#0b1e14' : '#fff',
          border: `1px solid ${colors.border.default}`,
          borderRadius: t.radius.lg,
          padding: `${t.space[2]}px ${t.space[3]}px`,
          fontSize: t.font.size.sm,
          color: colors.fg.default as string,
          fontFamily: t.font.family.sans,
          boxShadow: t.shadow.lg,
          zIndex: t.zIndex.toast,
          pointerEvents: 'none',
          minWidth: 170,
        }}>
          <div style={{ fontWeight: t.font.weight.semibold, marginBottom: t.space[1] }}>
            {MONTHS_SHORT[hovered]}
          </div>
          {CAT_LABELS.map((label, si) => {
            const vals = [STACKED_DATA[hovered].maq, STACKED_DATA[hovered].vei, STACKED_DATA[hovered].benf, STACKED_DATA[hovered].outros]
            return (
              <div key={si} style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginTop: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: CAT_COLORS[si], flexShrink: 0 }} />
                <span style={{ color: colors.fg.muted as string }}>{label}:</span>
                <span style={{ fontWeight: t.font.weight.medium }}>R$ {(vals[si] / 1000).toFixed(1)}K</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Stacked Legend ───────────────────────────────────────────────────────────

function StackedLegend() {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.space[4] }}>
      {CAT_LABELS.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: CAT_COLORS[i] }} />
          <span style={{ fontSize: t.font.size.sm, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

const DONUT_DATA = [
  { label: 'Máquinas',    pct: 45, color: t.color.brand[600] },
  { label: 'Veículos',    pct: 28, color: t.color.brand[400] },
  { label: 'Benfeitorias', pct: 18, color: t.color.brand[200] },
  { label: 'Outros',      pct: 9,  color: t.color.neutral[300] },
]

const DONUT_VALUES = [8_400_000 * 0.45, 8_400_000 * 0.28, 8_400_000 * 0.18, 8_400_000 * 0.09]

function describeArcPath(cx: number, cy: number, R: number, inner: number, startDeg: number, endDeg: number, hov: boolean) {
  const r = hov ? R + 6 : R
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const GAP = 0.8 // degrees gap
  const s = startDeg + GAP
  const e = endDeg   - GAP
  const x1 = cx + r * Math.cos(toRad(s)), y1 = cy + r * Math.sin(toRad(s))
  const x2 = cx + r * Math.cos(toRad(e)), y2 = cy + r * Math.sin(toRad(e))
  const ix1 = cx + inner * Math.cos(toRad(e)), iy1 = cy + inner * Math.sin(toRad(e))
  const ix2 = cx + inner * Math.cos(toRad(s)), iy2 = cy + inner * Math.sin(toRad(s))
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${inner} ${inner} 0 ${large} 0 ${ix2} ${iy2} Z`
}

function DonutChart() {
  const { colors, isGbMode } = useTheme()
  const [hovSeg, setHovSeg] = useState<number | null>(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), 80)
    return () => clearTimeout(id)
  }, [])

  const cx = 100, cy = 100
  const R = 76, inner = 46
  let cursor = -90

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.space[6] }}>
      <svg width={200} height={200}>
        {DONUT_DATA.map((seg, i) => {
          const sweep = (seg.pct / 100) * 360
          const startA = cursor, endA = cursor + sweep
          cursor = endA
          const isHov = hovSeg === i

          return (
            <g key={i}
              onMouseEnter={() => setHovSeg(i)}
              onMouseLeave={() => setHovSeg(null)}
              style={{
                cursor: 'pointer',
                opacity: hovSeg !== null && !isHov ? 0.35 : (animated ? 1 : 0),
                transition: `opacity ${350 + i * 60}ms ease`,
              }}
            >
              <path
                d={describeArcPath(cx, cy, R, inner, startA, endA, isHov)}
                fill={seg.color}
                style={{ transition: 'd 0.18s ease' }}
              />
            </g>
          )
        })}

        {/* Center */}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={t.font.size.xl}
          fontWeight={t.font.weight.bold}
          fill={isGbMode ? t.color.brand[400] : colors.fg.default as string}
          fontFamily={t.font.family.sans}>
          R$8,4M
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={t.font.size.sm}
          fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
          total
        </text>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2], flex: 1 }}>
        {DONUT_DATA.map((seg, i) => (
          <div key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: t.space[2],
              padding: `${t.space[1]}px ${t.space[2]}px`,
              borderRadius: t.radius.base,
              background: hovSeg === i ? (isGbMode ? 'rgba(255,255,255,0.06)' : t.color.neutral[50]) : 'transparent',
              opacity: hovSeg !== null && hovSeg !== i ? 0.4 : 1,
              transition: 'background 0.15s ease, opacity 0.18s ease',
            }}
            onMouseEnter={() => setHovSeg(i)}
            onMouseLeave={() => setHovSeg(null)}
          >
            <div style={{ width: 10, height: 10, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: t.font.size.sm, color: colors.fg.muted as string, fontFamily: t.font.family.sans, flex: 1 }}>
              {seg.label}
            </span>
            <span style={{ fontSize: t.font.size.sm, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
              {seg.pct}%
            </span>
            <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default as string, fontFamily: t.font.family.sans, minWidth: 64, textAlign: 'right' }}>
              R$ {(DONUT_VALUES[i] / 1_000_000).toFixed(1)}M
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Projection Chart ─────────────────────────────────────────────────────────

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

function ProjectionChart() {
  const { colors, isGbMode } = useTheme()
  const [hovPt, setHovPt] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; index: number } | null>(null)
  const [animated, setAnimated] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), 60)
    return () => clearTimeout(id)
  }, [])

  const W = 420
  const H = 210
  const PL = 56, PR = 16, PT = 12, PB = 30
  const chartW = W - PL - PR
  const chartH = H - PT - PB

  const maxV = Math.max(...PROJ_VALUES)
  const minV = Math.min(...PROJ_VALUES)

  function toX(i: number) { return PL + (i / (PROJ_VALUES.length - 1)) * chartW }
  function toY(v: number) { return PT + chartH - ((v - minV) / (maxV - minV)) * chartH }

  const linePath = PROJ_VALUES.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ')
  const areaPath = `${linePath} L ${toX(PROJ_VALUES.length - 1)} ${PT + chartH} L ${toX(0)} ${PT + chartH} Z`

  const solidPath = PROJ_VALUES.slice(0, CURRENT_MONTH + 1).map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ')
  const dashPath  = PROJ_VALUES.slice(CURRENT_MONTH).map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i + CURRENT_MONTH)} ${toY(v)}`).join(' ')

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="depProjGrad" x1="0" y1="0" x2="0" y2="1">
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
              <line x1={PL} y1={y} x2={W - PR} y2={y}
                stroke={colors.border.default as string} strokeWidth={0.5} strokeDasharray="4 4" />
              <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={t.font.size.base}
                fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
                {(v / 1_000_000).toFixed(1)}M
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#depProjGrad)"
          style={{ opacity: animated ? 1 : 0, transition: 'opacity 600ms ease' }} />

        {/* Solid line */}
        <path d={solidPath} fill="none" stroke={t.color.brand[600]} strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round"
          style={{ opacity: animated ? 1 : 0, transition: 'opacity 700ms ease' }} />

        {/* Dashed projection line */}
        <path d={dashPath} fill="none" stroke={t.color.brand[400]} strokeWidth={2}
          strokeDasharray="6 4" strokeLinecap="round" strokeLinejoin="round"
          style={{ opacity: animated ? 1 : 0, transition: 'opacity 800ms ease 100ms' }} />

        {/* Current month marker */}
        <line x1={toX(CURRENT_MONTH)} y1={PT} x2={toX(CURRENT_MONTH)} y2={PT + chartH}
          stroke={t.color.brand[600]} strokeWidth={1} strokeDasharray="3 3" opacity={0.45} />

        {/* Dots */}
        {PROJ_VALUES.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)}
            r={hovPt === i ? 5 : 3.5}
            fill={i <= CURRENT_MONTH ? t.color.brand[600] : t.color.brand[300]}
            stroke={isGbMode ? '#0b1e14' : '#fff'} strokeWidth={2}
            style={{ cursor: 'pointer', transition: 'r 0.12s ease' }}
            onMouseEnter={() => {
              setHovPt(i)
              if (svgRef.current) {
                const r = svgRef.current.getBoundingClientRect()
                setTooltip({ x: toX(i) / W * r.width + r.left, y: toY(v) / H * r.height + r.top, index: i })
              }
            }}
            onMouseLeave={() => { setHovPt(null); setTooltip(null) }}
          />
        ))}

        {/* X labels (every 4) */}
        {PROJ_VALUES.map((_, i) => i % 4 === 0 && (
          <text key={i} x={toX(i)} y={H - 8} textAnchor="middle"
            fontSize={t.font.size.base}
            fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
            M{i + 1}
          </text>
        ))}
      </svg>

      {/* Floating tooltip */}
      {tooltip && hovPt !== null && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y - 44,
          background: isGbMode ? '#0b1e14' : '#fff',
          border: `1px solid ${colors.border.default}`,
          borderRadius: t.radius.lg,
          padding: `${t.space[2]}px ${t.space[3]}px`,
          fontFamily: t.font.family.sans,
          boxShadow: t.shadow.lg,
          zIndex: t.zIndex.toast,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default as string }}>
            Mês {hovPt + 1}{hovPt > CURRENT_MONTH ? ' (projeção)' : ''}
          </div>
          <div style={{ fontSize: t.font.size.sm, color: colors.fg.muted as string, marginTop: 2 }}>
            R$ {(PROJ_VALUES[hovPt] / 1_000_000).toFixed(2)}M
          </div>
        </div>
      )}
    </div>
  )
}

// ─── DashDepreciacoes ─────────────────────────────────────────────────────────

const DEP_KPIS = [
  { label: 'Valor Total Bens',   value: 'R$ 8,4M',   trend: '2,1%', up: true  },
  { label: 'Depreciação Mensal', value: 'R$ 42.380',  trend: null,   up: true  },
  { label: 'Dep. Acumulada',     value: 'R$ 2,1M',   trend: '6,3%', up: true  },
  { label: 'Valor Residual',     value: 'R$ 6,3M',   trend: '0,8%', up: false },
]

export default function DashDepreciacoes() {
  const { colors, isGbMode } = useTheme()
  const [loading, setLoading] = useState(true)

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
    boxShadow: isGbMode
      ? '0 1px 2px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.35)'
      : '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.07)',
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
        <span style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.semibold, color: colors.fg.default as string }}>
          Depreciações
        </span>
        <Button variant="secondary" size="sm" iconRight={<ChevronDown size={12} />}>
          Últimos 30 dias
        </Button>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[4] }}>
          <div style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.medium, color: colors.fg.muted as string }}>
            Depreciação por Categoria — 12 Meses
          </div>
          <StackedLegend />
        </div>
        <StackedBarChart />
      </div>
      <HDivider color={bc} />

      {/* Donut + Projection */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{ flex: 1, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.medium, color: colors.fg.muted as string, marginBottom: t.space[4] }}>
            Composição por Tipo de Bem
          </div>
          <DonutChart />
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
          <ProjectionChart />
        </div>
      </div>
    </div>
  )
}
