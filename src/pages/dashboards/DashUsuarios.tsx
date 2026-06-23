import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { Button } from '../../components/ui/Button'

// ─── Area Chart — Acessos Diários ─────────────────────────────────────────────

function generateDailyAccess(): number[] {
  return Array.from({ length: 30 }, (_, i) => {
    const base = 120 + i * 2.5
    return Math.round(base + Math.sin(i * 0.7) * 28 + Math.random() * 15)
  })
}

const DAILY_VALUES = generateDailyAccess()

interface AcessTooltip {
  x: number
  y: number
  index: number
}

function AreaChart() {
  const { colors, isGbMode } = useTheme()
  const [hovPt, setHovPt] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<AcessTooltip | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const W = 520
  const H = 220
  const PL = 44
  const PR = 14
  const PT = 12
  const PB = 28
  const chartW = W - PL - PR
  const chartH = H - PT - PB

  const maxV = Math.max(...DAILY_VALUES)
  const minV = Math.min(...DAILY_VALUES)

  function toX(i: number) { return PL + (i / (DAILY_VALUES.length - 1)) * chartW }
  function toY(v: number) { return PT + chartH - ((v - minV) / (maxV - minV + 1)) * chartH }

  // Bezier smooth path
  function smoothPath(pts: [number, number][]): string {
    if (pts.length < 2) return ''
    let d = `M ${pts[0][0]} ${pts[0][1]}`
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]
      const curr = pts[i]
      const cpX = (prev[0] + curr[0]) / 2
      d += ` C ${cpX} ${prev[1]}, ${cpX} ${curr[1]}, ${curr[0]} ${curr[1]}`
    }
    return d
  }

  const pts: [number, number][] = DAILY_VALUES.map((v, i) => [toX(i), toY(v)])
  const linePath = smoothPath(pts)
  const areaPath = `${linePath} L ${toX(DAILY_VALUES.length - 1)} ${PT + chartH} L ${toX(0)} ${PT + chartH} Z`

  const gridVals = [0, 0.25, 0.5, 0.75, 1].map(r => Math.round((minV + r * (maxV - minV)) / 10) * 10)

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="dayGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.color.brand[600]} stopOpacity={0.22} />
            <stop offset="100%" stopColor={t.color.brand[600]} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid */}
        {gridVals.map((gv, i) => {
          const y = toY(gv)
          return (
            <g key={i}>
              <line x1={PL} y1={y} x2={W - PR} y2={y} stroke={colors.border.default as string} strokeWidth={1} strokeDasharray="4 4" />
              <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={t.font.size.xs} fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>{gv}</text>
            </g>
          )
        })}

        {/* Area */}
        <path d={areaPath} fill="url(#dayGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke={t.color.brand[600]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots (show all but subtle; hovered = bigger) */}
        {DAILY_VALUES.map((v, i) => (
          <circle
            key={i}
            cx={toX(i)}
            cy={toY(v)}
            r={hovPt === i ? 5 : 2.5}
            fill={t.color.brand[600]}
            stroke={isGbMode ? '#0b1e14' : '#fff'}
            strokeWidth={hovPt === i ? 2 : 1}
            style={{ cursor: 'pointer', transition: 'r 0.12s ease, stroke-width 0.12s ease' }}
            onMouseEnter={e => {
              setHovPt(i)
              const rect = svgRef.current!.getBoundingClientRect()
              setTooltip({ x: toX(i) / W * rect.width + rect.left, y: toY(v) / H * rect.height + rect.top, index: i })
            }}
            onMouseLeave={() => { setHovPt(null); setTooltip(null) }}
          />
        ))}

        {/* X labels every 5 days */}
        {DAILY_VALUES.map((_, i) => (i % 5 === 0 || i === DAILY_VALUES.length - 1) && (
          <text key={i} x={toX(i)} y={H - 8} textAnchor="middle" fontSize={t.font.size.xs} fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
            D{i + 1}
          </text>
        ))}
      </svg>

      {tooltip && hovPt !== null && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 14,
          top: tooltip.y - 44,
          background: isGbMode ? '#0b1e14' : '#fff',
          border: `1px solid ${colors.border.default}`,
          borderRadius: t.radius.base,
          padding: `${t.space[1] + 2}px ${t.space[2]}px`,
          fontSize: t.font.size.xs,
          color: colors.fg.default as string,
          fontFamily: t.font.family.sans,
          boxShadow: t.shadow.lg,
          zIndex: t.zIndex.toast,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontWeight: t.font.weight.semibold }}>Dia {hovPt + 1}</div>
          <div style={{ color: colors.fg.muted as string }}>{DAILY_VALUES[hovPt]} sessões</div>
        </div>
      )}
    </div>
  )
}

// ─── Donut — Módulos ──────────────────────────────────────────────────────────

const MODULOS = [
  { label: 'Financeiro',      pct: 28, acessos: 51, color: t.color.brand[700] },
  { label: 'Dashboards',      pct: 22, acessos: 40, color: t.color.brand[500] },
  { label: 'Cadastros',       pct: 18, acessos: 33, color: t.color.brand[300] },
  { label: 'Fiscal',          pct: 14, acessos: 26, color: t.color.feedback.info.solid },
  { label: 'Administrativo',  pct: 11, acessos: 20, color: t.color.neutral[400] },
  { label: 'Outros',          pct:  7, acessos: 13, color: t.color.neutral[300] },
]

function describeArcD(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const rad = (d: number) => (d * Math.PI) / 180
  const x1 = cx + r * Math.cos(rad(startDeg))
  const y1 = cy + r * Math.sin(rad(startDeg))
  const x2 = cx + r * Math.cos(rad(endDeg))
  const y2 = cy + r * Math.sin(rad(endDeg))
  const large = endDeg - startDeg > 180 ? 1 : 0
  return { x1, y1, x2, y2, large }
}

interface ModuloTooltip {
  x: number
  y: number
  index: number
}

function DonutModulos() {
  const { colors, isGbMode } = useTheme()
  const [hovSeg, setHovSeg] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<ModuloTooltip | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const cx = 90
  const cy = 90
  const R = 65
  const inner = 38
  let cursor = -90

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.space[4] }}>
      <svg ref={svgRef} width={180} height={180} style={{ flexShrink: 0 }}>
        {MODULOS.map((seg, i) => {
          const sweep = (seg.pct / 100) * 360
          const startA = cursor
          const endA = cursor + sweep
          cursor = endA

          const midA = (startA + endA) / 2
          const rad = (d: number) => (d * Math.PI) / 180
          const { x1, y1, x2, y2, large } = describeArcD(cx, cy, R, startA, endA)
          const { x1: ix1, y1: iy1, x2: ix2, y2: iy2 } = describeArcD(cx, cy, inner, endA, startA)

          const isHov = hovSeg === i
          const scR = isHov ? R + 5 : R
          const { x1: ox1, y1: oy1, x2: ox2, y2: oy2 } = describeArcD(cx, cy, scR, startA, endA)
          const sweepLarge = sweep > 180 ? 1 : 0
          const sweepLargeInner = sweep > 180 ? 1 : 0

          const pathD = `M ${ox1} ${oy1} A ${scR} ${scR} 0 ${sweepLarge} 1 ${ox2} ${oy2} L ${cx + inner * Math.cos(rad(endA))} ${cy + inner * Math.sin(rad(endA))} A ${inner} ${inner} 0 ${sweepLargeInner} 0 ${cx + inner * Math.cos(rad(startA))} ${cy + inner * Math.sin(rad(startA))} Z`

          return (
            <path
              key={i}
              d={pathD}
              fill={seg.color}
              style={{
                cursor: 'pointer',
                transition: 'opacity 0.18s ease, d 0.18s ease',
                opacity: hovSeg !== null && !isHov ? 0.4 : 1,
              }}
              onMouseEnter={e => {
                setHovSeg(i)
                if (svgRef.current) {
                  const rect = svgRef.current.getBoundingClientRect()
                  const mx = cx + (scR + 10) * Math.cos(rad(midA))
                  const my = cy + (scR + 10) * Math.sin(rad(midA))
                  setTooltip({ x: mx / 180 * rect.width + rect.left, y: my / 180 * rect.height + rect.top, index: i })
                }
              }}
              onMouseLeave={() => { setHovSeg(null); setTooltip(null) }}
            />
          )
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={t.font.size.xl} fontWeight={t.font.weight.bold} fill={isGbMode ? '#4ade80' : colors.fg.default as string} fontFamily={t.font.family.sans}>
          183
        </text>
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize={t.font.size.xs} fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
          sessões
        </text>
      </svg>

      {tooltip && hovSeg !== null && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 10,
          top: tooltip.y - 36,
          background: isGbMode ? '#0b1e14' : '#fff',
          border: `1px solid ${colors.border.default}`,
          borderRadius: t.radius.base,
          padding: `${t.space[1] + 2}px ${t.space[2]}px`,
          fontSize: t.font.size.xs,
          color: colors.fg.default as string,
          fontFamily: t.font.family.sans,
          boxShadow: t.shadow.lg,
          zIndex: t.zIndex.toast,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontWeight: t.font.weight.semibold }}>{MODULOS[hovSeg].label}</div>
          <div style={{ color: colors.fg.muted as string }}>{MODULOS[hovSeg].pct}% · {MODULOS[hovSeg].acessos} acessos</div>
        </div>
      )}

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

interface HourTooltip {
  x: number
  y: number
  hour: number
}

function HourlyStackedChart() {
  const { colors, isGbMode } = useTheme()
  const [hovCol, setHovCol] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<HourTooltip | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const W = 860
  const H = 160
  const PL = 36
  const PR = 10
  const PT = 8
  const PB = 24
  const chartW = W - PL - PR
  const chartH = H - PT - PB

  const maxVal = Math.max(...HOURLY_DATA.map(d => d.web + d.mobile + d.api))
  const colW = (chartW / 24) * 0.65
  const colSpacing = chartW / 24

  const seriesColors = [t.color.brand[600], t.color.brand[300], t.color.neutral[300]]

  return (
    <div style={{ position: 'relative' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: t.space[3], marginBottom: t.space[2] }}>
        {(['Web', 'Mobile', 'API'] as const).map((lbl, li) => (
          <div key={li} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
            <div style={{ width: 9, height: 9, borderRadius: 2, background: seriesColors[li] }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>{lbl}</span>
          </div>
        ))}
      </div>

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        {/* Grid */}
        {[0, 0.5, 1].map((r, i) => {
          const v = Math.round(maxVal * r)
          const y = PT + chartH - r * chartH
          return (
            <g key={i}>
              <line x1={PL} y1={y} x2={W - PR} y2={y} stroke={colors.border.default as string} strokeWidth={1} strokeDasharray="3 3" />
              {v > 0 && <text x={PL - 5} y={y + 4} textAnchor="end" fontSize={t.font.size.xs} fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>{v}</text>}
            </g>
          )
        })}

        {HOURLY_DATA.map((d, i) => {
          const x = PL + i * colSpacing + (colSpacing - colW) / 2
          const segs = [d.web, d.mobile, d.api]
          const isHov = hovCol === i
          const isDim = hovCol !== null && !isHov

          let cumY = 0
          return (
            <g
              key={i}
              onMouseEnter={e => {
                setHovCol(i)
                const rect = svgRef.current!.getBoundingClientRect()
                setTooltip({ x: (x + colW / 2) / W * rect.width + rect.left, y: rect.top, hour: i })
              }}
              onMouseLeave={() => { setHovCol(null); setTooltip(null) }}
              style={{ cursor: 'pointer', transition: 'opacity 0.18s ease', opacity: isDim ? 0.3 : 1 }}
            >
              {segs.map((seg, si) => {
                const segH = (seg / maxVal) * chartH
                const barY = PT + chartH - cumY - segH
                cumY += segH
                return (
                  <rect
                    key={si}
                    x={x}
                    y={barY}
                    width={colW}
                    height={segH}
                    fill={seriesColors[si]}
                    rx={si === segs.length - 1 ? 2 : 0}
                  />
                )
              })}
              <rect x={x} y={PT} width={colW} height={chartH} fill="transparent" />
              {(i % 3 === 0) && (
                <text x={x + colW / 2} y={H - 6} textAnchor="middle" fontSize={t.font.size.xs} fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
                  {String(i).padStart(2, '0')}h
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {tooltip && hovCol !== null && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y + 8,
          background: isGbMode ? '#0b1e14' : '#fff',
          border: `1px solid ${colors.border.default}`,
          borderRadius: t.radius.base,
          padding: `${t.space[1] + 2}px ${t.space[2]}px`,
          fontSize: t.font.size.xs,
          color: colors.fg.default as string,
          fontFamily: t.font.family.sans,
          boxShadow: t.shadow.lg,
          zIndex: t.zIndex.toast,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontWeight: t.font.weight.semibold, marginBottom: 2 }}>{String(tooltip.hour).padStart(2, '0')}:00</div>
          {(['Web', 'Mobile', 'API'] as const).map((lbl, li) => {
            const vals = [HOURLY_DATA[tooltip.hour].web, HOURLY_DATA[tooltip.hour].mobile, HOURLY_DATA[tooltip.hour].api]
            return (
              <div key={li} style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginTop: 2 }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: seriesColors[li], flexShrink: 0 }} />
                <span style={{ color: colors.fg.muted as string }}>{lbl}:</span>
                <span style={{ fontWeight: t.font.weight.medium }}>{vals[li]}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

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
        <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default as string }}>Análise de Usuários</span>
        <Button variant="secondary" size="sm" iconRight={<ChevronDown size={11} />}>
          Últimos 30 dias
        </Button>
      </div>
      <HDivider color={bc} />

      {/* KPI row */}
      <div style={{ display: 'flex' }}>
        {USR_KPIS.flatMap((kpi, i) => [
          i > 0 ? <VDivider key={`d${i}`} color={bc} /> : null,
          <div key={kpi.label} style={{ flex: 1, padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px` }}>
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
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 2, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[4] }}>Acessos Diários</div>
          <AreaChart />
        </div>
        <VDivider color={bc} />
        <div style={{ flex: 1, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[4] }}>Módulos Mais Acessados</div>
          <DonutModulos />
        </div>
      </div>
      <HDivider color={bc} />

      {/* Row 3 — Hourly stacked */}
      <div style={{ padding: t.space[5] }}>
        <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[4] }}>Picos de Acesso por Hora</div>
        <HourlyStackedChart />
      </div>
    </div>
  )
}
