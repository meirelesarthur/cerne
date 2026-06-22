import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { Button } from '../../components/ui/Button'

// ─── Horizontal Grouped Bar Chart ─────────────────────────────────────────────

const CATEGORIAS = [
  { label: 'Tratores',     total: 85, op: 72 },
  { label: 'Implementos',  total: 67, op: 54 },
  { label: 'Veículos',     total: 48, op: 43 },
  { label: 'Equipamentos', total: 52, op: 46 },
  { label: 'Benfeitorias', total: 34, op: 28 },
  { label: 'Outros',       total: 56, op: 55 },
]

interface HBarTooltip {
  x: number
  y: number
  label: string
  total: number
  op: number
}

function HorizontalGroupedBar() {
  const { colors, isGbMode } = useTheme()
  const [hovRow, setHovRow] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<HBarTooltip | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const W = 480
  const ROW_H = 36
  const GAP = 10
  const PL = 90
  const PR = 40
  const PT = 8
  const H = CATEGORIAS.length * (ROW_H + GAP) + PT + 8

  const maxVal = Math.max(...CATEGORIAS.map(c => c.total))
  const chartW = W - PL - PR

  function toBarW(v: number) { return (v / maxVal) * chartW }

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {CATEGORIAS.map((cat, i) => {
          const y = PT + i * (ROW_H + GAP)
          const isHov = hovRow === i
          const isDim = hovRow !== null && !isHov

          return (
            <g
              key={i}
              onMouseEnter={e => {
                setHovRow(i)
                const rect = svgRef.current!.getBoundingClientRect()
                setTooltip({
                  x: (PL + toBarW(cat.total) + PR / 2) / W * rect.width + rect.left,
                  y: (y + ROW_H / 2) / H * rect.height + rect.top,
                  label: cat.label,
                  total: cat.total,
                  op: cat.op,
                })
              }}
              onMouseLeave={() => { setHovRow(null); setTooltip(null) }}
              style={{ cursor: 'pointer', transition: 'opacity 0.18s ease', opacity: isDim ? 0.35 : 1 }}
            >
              {/* Category label */}
              <text x={PL - 8} y={y + ROW_H / 2 - 4} textAnchor="end" fontSize={t.font.size.xs} fill={colors.fg.muted as string} fontFamily={t.font.family.sans} dominantBaseline="middle">
                {cat.label}
              </text>

              {/* Total bar */}
              <rect
                x={PL}
                y={y}
                width={toBarW(cat.total)}
                height={14}
                rx={3}
                fill={t.color.brand[600]}
                style={{ transition: 'width 0.3s ease' }}
              />

              {/* Op bar */}
              <rect
                x={PL}
                y={y + 18}
                width={toBarW(cat.op)}
                height={14}
                rx={3}
                fill={t.color.brand[200]}
                style={{ transition: 'width 0.3s ease' }}
              />

              {/* Value labels */}
              <text x={PL + toBarW(cat.total) + 5} y={y + 7} fontSize={t.font.size.xs} fill={colors.fg.subtle as string} fontFamily={t.font.family.sans} dominantBaseline="middle">
                {cat.total}
              </text>
              <text x={PL + toBarW(cat.op) + 5} y={y + 25} fontSize={t.font.size.xs} fill={colors.fg.subtle as string} fontFamily={t.font.family.sans} dominantBaseline="middle">
                {cat.op}
              </text>
            </g>
          )
        })}
      </svg>

      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y - 30,
          background: isGbMode ? '#0b1e14' : '#fff',
          border: `1px solid ${colors.border.default}`,
          borderRadius: t.radius.DEFAULT,
          padding: `${t.space[1] + 2}px ${t.space[2]}px`,
          fontSize: t.font.size.xs,
          color: colors.fg.default as string,
          fontFamily: t.font.family.sans,
          boxShadow: t.shadow.lg,
          zIndex: t.zIndex.toast,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontWeight: t.font.weight.semibold, marginBottom: 2 }}>{tooltip.label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginTop: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: t.color.brand[600] }} />
            <span style={{ color: colors.fg.muted as string }}>Total:</span>
            <span style={{ fontWeight: t.font.weight.medium }}>{tooltip.total}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginTop: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: t.color.brand[200] }} />
            <span style={{ color: colors.fg.muted as string }}>Em operação:</span>
            <span style={{ fontWeight: t.font.weight.medium }}>{tooltip.op}</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: t.space[3], marginTop: t.space[3] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: t.color.brand[600] }} />
          <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>Total</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: t.color.brand[200] }} />
          <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>Em Operação</span>
        </div>
      </div>
    </div>
  )
}

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

// ─── Monthly Maintenance Bar Chart ────────────────────────────────────────────

const MANUT_DATA = [
  { prev: 8, cor: 3 }, { prev: 6, cor: 5 }, { prev: 9, cor: 2 }, { prev: 7, cor: 4 },
  { prev: 10, cor: 3 }, { prev: 8, cor: 6 }, { prev: 11, cor: 2 }, { prev: 9, cor: 4 },
  { prev: 12, cor: 3 }, { prev: 10, cor: 5 }, { prev: 13, cor: 2 }, { prev: 11, cor: 4 },
]

interface ManutTooltip {
  x: number
  y: number
  index: number
}

function ManutChart() {
  const { colors, isGbMode } = useTheme()
  const [hovCol, setHovCol] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<ManutTooltip | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const W = 860
  const H = 200
  const PL = 40
  const PR = 12
  const PT = 10
  const PB = 28
  const chartW = W - PL - PR
  const chartH = H - PT - PB

  const maxVal = Math.max(...MANUT_DATA.map(d => d.prev + d.cor))
  const colW = (chartW / MANUT_DATA.length) * 0.65
  const colSpacing = chartW / MANUT_DATA.length
  const barW = colW / 2 - 1

  return (
    <div style={{ position: 'relative' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: t.space[3], marginBottom: t.space[2] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: t.color.brand[600] }} />
          <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>Preventivas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: t.color.feedback.error.text }} />
          <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>Corretivas</span>
        </div>
      </div>

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const v = Math.round(maxVal * r)
          const y = PT + chartH - r * chartH
          return (
            <g key={i}>
              <line x1={PL} y1={y} x2={W - PR} y2={y} stroke={colors.border.default as string} strokeWidth={1} strokeDasharray="4 4" />
              {v > 0 && (
                <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={t.font.size.xs} fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>{v}</text>
              )}
            </g>
          )
        })}

        {MANUT_DATA.map((d, i) => {
          const xBase = PL + i * colSpacing + (colSpacing - colW) / 2
          const isHov = hovCol === i
          const isDim = hovCol !== null && !isHov

          const prevH = (d.prev / maxVal) * chartH
          const corH = (d.cor / maxVal) * chartH

          return (
            <g
              key={i}
              onMouseEnter={e => {
                setHovCol(i)
                const rect = svgRef.current!.getBoundingClientRect()
                setTooltip({ x: (xBase + colW / 2) / W * rect.width + rect.left, y: rect.top, index: i })
              }}
              onMouseLeave={() => { setHovCol(null); setTooltip(null) }}
              style={{ cursor: 'pointer', transition: 'opacity 0.18s ease', opacity: isDim ? 0.3 : 1 }}
            >
              <rect
                x={xBase}
                y={PT + chartH - prevH}
                width={barW}
                height={prevH}
                rx={3}
                fill={t.color.brand[600]}
              />
              <rect
                x={xBase + barW + 2}
                y={PT + chartH - corH}
                width={barW}
                height={corH}
                rx={3}
                fill={t.color.feedback.error.text}
              />
              <rect x={xBase} y={PT} width={colW} height={chartH} fill="transparent" />
              <text x={xBase + colW / 2} y={H - 8} textAnchor="middle" fontSize={t.font.size.xs} fill={colors.fg.subtle as string} fontFamily={t.font.family.sans}>
                {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][i]}
              </text>
            </g>
          )
        })}
      </svg>

      {tooltip && hovCol !== null && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y + 10,
          background: isGbMode ? '#0b1e14' : '#fff',
          border: `1px solid ${colors.border.default}`,
          borderRadius: t.radius.DEFAULT,
          padding: `${t.space[1] + 2}px ${t.space[2]}px`,
          fontSize: t.font.size.xs,
          color: colors.fg.default as string,
          fontFamily: t.font.family.sans,
          boxShadow: t.shadow.lg,
          zIndex: t.zIndex.toast,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontWeight: t.font.weight.semibold, marginBottom: 2 }}>
            {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][hovCol]}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginTop: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: t.color.brand[600] }} />
            <span style={{ color: colors.fg.muted as string }}>Preventivas:</span>
            <span style={{ fontWeight: t.font.weight.medium }}>{MANUT_DATA[hovCol].prev}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginTop: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: t.color.feedback.error.text }} />
            <span style={{ color: colors.fg.muted as string }}>Corretivas:</span>
            <span style={{ fontWeight: t.font.weight.medium }}>{MANUT_DATA[hovCol].cor}</span>
          </div>
        </div>
      )}
    </div>
  )
}

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
    boxShadow: isGbMode ? '0 1px 2px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.35)' : '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.07)',
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
        <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default as string }}>Ativos</span>
        <Button variant="secondary" size="sm" iconRight={<ChevronDown size={11} />}>
          Últimos 30 dias
        </Button>
      </div>
      <HDivider color={bc} />

      {/* KPI row */}
      <div style={{ display: 'flex' }}>
        {ATIVOS_KPIS.flatMap((kpi, i) => [
          i > 0 ? <VDivider key={`d${i}`} color={bc} /> : null,
          <div key={kpi.label} style={{ flex: 1, padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px` }}>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[1] }}>{kpi.label}</div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default as string, lineHeight: 1.1, marginBottom: t.space[2] }}>{kpi.value}</div>
            <span style={{ fontSize: t.font.size.xs, color: kpi.up ? t.color.feedback.success.text : t.color.feedback.error.text }}>{kpi.up ? '▲' : '▼'} {kpi.trend}</span>
          </div>,
        ])}
      </div>
      <HDivider color={bc} />

      {/* Row 2 — Grouped H-bar + Status */}
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 3, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[4] }}>Ativos por Categoria</div>
          <HorizontalGroupedBar />
        </div>
        <VDivider color={bc} />
        <div style={{ flex: 2, padding: t.space[5] }}>
          <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[4] }}>Status dos Ativos</div>
          <StatusCards />
        </div>
      </div>
      <HDivider color={bc} />

      {/* Row 3 — Manutenções */}
      <div style={{ padding: t.space[5] }}>
        <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, marginBottom: t.space[4] }}>Manutenções por Mês</div>
        <ManutChart />
      </div>
    </div>
  )
}
