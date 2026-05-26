import { useRef, useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Layers, ArrowRight, ChevronDown,
  TrendingUp, DollarSign, TrendingDown,
} from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import type { ThemeColors } from '../../context/ThemeContext'

// ─── Mock data ────────────────────────────────────────────────────────────────

interface Talhao {
  id: string
  name: string
  area: string
  crop: string
  yieldForecast: string
  status: string
  moisture: string
  ndvi: string
  coords: L.LatLngTuple[]
  color: string
  fillColor: string
  fillOpacity: number
}

const TALHAOES: Talhao[] = [
  {
    id: 'T1', name: 'Talhão Santa Maria', area: '320 ha',
    crop: 'Soja', yieldForecast: '64 sc/ha', status: 'Em crescimento',
    moisture: '68%', ndvi: '0.74',
    coords: [[-18.760, -52.650], [-18.760, -52.628], [-18.780, -52.628], [-18.780, -52.650]],
    color: '#059669', fillColor: '#059669', fillOpacity: 0.28,
  },
  {
    id: 'T2', name: 'Talhão Cerrado Norte', area: '480 ha',
    crop: 'Milho', yieldForecast: '140 sc/ha', status: 'Germinação',
    moisture: '72%', ndvi: '0.61',
    coords: [[-18.760, -52.626], [-18.760, -52.600], [-18.780, -52.600], [-18.780, -52.626]],
    color: '#d97706', fillColor: '#d97706', fillOpacity: 0.28,
  },
  {
    id: 'T3', name: 'Talhão Rio Verde', area: '250 ha',
    crop: 'Soja', yieldForecast: '60 sc/ha', status: 'Floração',
    moisture: '74%', ndvi: '0.81',
    coords: [[-18.782, -52.650], [-18.782, -52.634], [-18.797, -52.634], [-18.797, -52.650]],
    color: '#047857', fillColor: '#047857', fillOpacity: 0.35,
  },
  {
    id: 'T4', name: 'Talhão Sul', area: '190 ha',
    crop: 'Cana-de-açúcar', yieldForecast: '85 t/ha', status: 'Maturação',
    moisture: '65%', ndvi: '0.69',
    coords: [[-18.782, -52.632], [-18.782, -52.614], [-18.797, -52.614], [-18.797, -52.632]],
    color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.25,
  },
  {
    id: 'T5', name: 'Talhão Leste', area: '360 ha',
    crop: 'Milho', yieldForecast: '132 sc/ha', status: 'Em crescimento',
    moisture: '70%', ndvi: '0.65',
    coords: [[-18.782, -52.612], [-18.782, -52.596], [-18.797, -52.596], [-18.797, -52.612]],
    color: '#d97706', fillColor: '#d97706', fillOpacity: 0.28,
  },
  {
    id: 'T6', name: 'Talhão Reserva', area: '140 ha',
    crop: 'Pastagem', yieldForecast: '—', status: 'Pousio',
    moisture: '55%', ndvi: '0.42',
    coords: [[-18.799, -52.650], [-18.799, -52.632], [-18.814, -52.632], [-18.814, -52.650]],
    color: '#9ca3af', fillColor: '#9ca3af', fillOpacity: 0.20,
  },
  {
    id: 'T7', name: 'Talhão Água Limpa', area: '410 ha',
    crop: 'Soja', yieldForecast: '58 sc/ha', status: 'Enchimento de grãos',
    moisture: '76%', ndvi: '0.78',
    coords: [[-18.799, -52.630], [-18.799, -52.610], [-18.814, -52.610], [-18.814, -52.630]],
    color: '#059669', fillColor: '#059669', fillOpacity: 0.30,
  },
]

// ─── Bar chart data ────────────────────────────────────────────────────────────

interface BarMonthData {
  month: string
  receitas: number
  despesas: number
}

const REALIZADO_DATA: BarMonthData[] = [
  { month: 'Ago/24',  receitas: 320000,  despesas: 280000 },
  { month: 'Set/24',  receitas: 3800000, despesas: 3600000 },
  { month: 'Out/24',  receitas: 180000,  despesas: 120000 },
  { month: 'Nov/24',  receitas: 240000,  despesas: 160000 },
  { month: 'Dez/24',  receitas: 160000,  despesas: 80000 },
  { month: 'Jan/25',  receitas: 320000,  despesas: 200000 },
  { month: 'Fev/25',  receitas: 260000,  despesas: 220000 },
  { month: 'Mar/25',  receitas: 180000,  despesas: 100000 },
]

const PREVISTO_DATA: BarMonthData[] = [
  { month: 'Ago/24',  receitas: 2200000, despesas: 180000 },
  { month: 'Set/24',  receitas: 160000,  despesas: 120000 },
  { month: 'Out/24',  receitas: 140000,  despesas: 100000 },
  { month: 'Nov/24',  receitas: 120000,  despesas: 80000 },
  { month: 'Dez/24',  receitas: 100000,  despesas: 60000 },
  { month: 'Jan/25',  receitas: 80000,   despesas: 40000 },
  { month: 'Fev/25',  receitas: 60000,   despesas: 30000 },
  { month: 'Mar/25',  receitas: 40000,   despesas: 20000 },
]

// ─── Style helper ─────────────────────────────────────────────────────────────

function card(colors: ThemeColors, isGbMode: boolean, extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: colors.surfaceBg,
    borderRadius: t.radius['2xl'],
    boxShadow: isGbMode
      ? '0 1px 2px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.35)'
      : '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.07)',
    ...extra,
  }
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionTitle({ children, colors }: { children: React.ReactNode; colors: ThemeColors }) {
  return (
    <span
      style={{
        fontSize: t.font.size.base,
        fontWeight: t.font.weight.semibold,
        color: colors.textPrimary,
        fontFamily: t.font.family.sans,
        lineHeight: t.font.lineHeight.tight,
      }}
    >
      {children}
    </span>
  )
}

interface FilterInputProps {
  value: string
  colors: ThemeColors
}

function FilterInput({ value, colors }: FilterInputProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: t.space[1],
        border: `1px solid ${colors.border}`,
        borderRadius: t.radius.DEFAULT,
        padding: `5px ${t.space[2]}px`,
        background: colors.surfaceBg,
        cursor: 'default',
      }}
    >
      <span
        style={{
          fontSize: t.font.size.xs,
          color: colors.textSecondary,
          fontFamily: t.font.family.sans,
        }}
      >
        {value}
      </span>
    </div>
  )
}

interface FilterSelectProps {
  value: string
  colors: ThemeColors
}

function FilterSelect({ value, colors }: FilterSelectProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: t.space[1],
        border: `1px solid ${colors.border}`,
        borderRadius: t.radius.DEFAULT,
        padding: `5px ${t.space[2]}px`,
        background: colors.surfaceBg,
        cursor: 'pointer',
        minWidth: 100,
      }}
    >
      <span
        style={{
          fontSize: t.font.size.xs,
          color: colors.textSecondary,
          fontFamily: t.font.family.sans,
          flex: 1,
        }}
      >
        {value}
      </span>
      <ChevronDown size={11} color={colors.textMuted} />
    </div>
  )
}

// ─── Talhões Map (Leaflet) ────────────────────────────────────────────────────

function TalhoesMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Fix broken icon URLs in Vite builds
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([-18.787, -52.625], 13)

    // Satellite-style tile (free, no key required)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri',
    }).addTo(map)

    // Minimal attribution
    L.control.attribution({ position: 'bottomleft', prefix: '' }).addTo(map)

    // Zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Draw talhões
    TALHAOES.forEach(talhao => {
      const poly = L.polygon(talhao.coords, {
        color: talhao.color,
        fillColor: talhao.fillColor,
        fillOpacity: talhao.fillOpacity,
        weight: 2.5,
        dashArray: undefined,
      })

      // Tooltip HTML
      const statusBg = talhao.color + '22'
      const tipHtml = `
        <div class="talh-tip">
          <div class="talh-tip-title">${talhao.name}</div>
          <div class="talh-tip-row">
            <span>🌾 ${talhao.crop}</span>
            <span>📐 ${talhao.area}</span>
          </div>
          <div class="talh-tip-row">
            <span>Prev. colheita:</span>
            <b style="color:${talhao.color}">${talhao.yieldForecast}</b>
          </div>
          <div class="talh-tip-row">
            <span>Umidade: ${talhao.moisture}</span>
            <span>NDVI: ${talhao.ndvi}</span>
          </div>
          <div class="talh-tip-badge" style="color:${talhao.color};background:${statusBg}">
            ${talhao.status}
          </div>
        </div>
      `

      poly.bindTooltip(tipHtml, {
        sticky: true,
        opacity: 1,
        className: 'talh-tooltip-wrap',
        offset: [12, 0],
      })

      poly.on('mouseover', () => {
        poly.setStyle({ weight: 3.5, fillOpacity: Math.min(talhao.fillOpacity + 0.18, 0.65) })
      })
      poly.on('mouseout', () => {
        poly.setStyle({ weight: 2.5, fillOpacity: talhao.fillOpacity })
      })

      poly.addTo(map)
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  return <div ref={containerRef} style={{ height: '100%', width: '100%', borderRadius: t.radius['2xl'] }} />
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

interface DonutSegment {
  label: string
  pct: number
  color: string
}

interface DonutChartProps {
  title: string
  segments: DonutSegment[]
  colors: ThemeColors
}

function DonutChart({ title, segments, colors }: DonutChartProps) {
  const R = 55
  const cx = 80
  const cy = 75
  const sw = 22
  const circ = 2 * Math.PI * R
  const quarterTurn = circ / 4

  let cumulativePct = 0

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: t.font.size.xs,
          fontWeight: t.font.weight.semibold,
          color: colors.textPrimary,
          fontFamily: t.font.family.sans,
          marginBottom: t.space[2],
          textAlign: 'center',
          lineHeight: t.font.lineHeight.snug,
        }}
      >
        {title}
      </span>

      <svg width={160} height={150} viewBox="0 0 160 150">
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={colors.border}
          strokeWidth={sw}
        />

        {/* Segments */}
        {segments.map((seg, i) => {
          const segLen = (seg.pct / 100) * circ
          const offset = -(cumulativePct / 100) * circ + quarterTurn
          cumulativePct += seg.pct
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth={sw}
              strokeDasharray={`${segLen} ${circ - segLen}`}
              strokeDashoffset={offset}
            />
          )
        })}
      </svg>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: t.space[1],
          width: '100%',
          paddingTop: t.space[1],
        }}
      >
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.space[1],
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: t.radius.sm,
                background: seg.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: t.font.size.xs,
                color: colors.textSecondary,
                fontFamily: t.font.family.sans,
                flex: 1,
              }}
            >
              {seg.label}
            </span>
            <span
              style={{
                fontSize: t.font.size.xs,
                fontWeight: t.font.weight.semibold,
                color: colors.textPrimary,
                fontFamily: t.font.family.sans,
              }}
            >
              {seg.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Bar Chart (Grouped) ──────────────────────────────────────────────────────

interface BarChartProps {
  data: BarMonthData[]
  maxY: number
  title: string
  dtInicio: string
  dtFim: string
  colors: ThemeColors
  isGbMode: boolean
}

function GroupedBarChart({ data, maxY, title, dtInicio, dtFim, colors, isGbMode }: BarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  const W = 900
  const H = 200
  const PL = 60
  const PT = 16
  const PR = 16
  const PB = 40
  const cW = W - PL - PR
  const cH = H - PT - PB

  const barW = 18
  const barGap = 4
  const groupW = barW * 2 + barGap
  const numGroups = data.length
  const groupSpacing = cW / numGroups
  const groupOffset = groupSpacing / 2

  const toY = (v: number) => PT + cH - (v / maxY) * cH

  const yLabels = [
    { val: maxY,         label: `${Math.round(maxY / 1000000)}M` },
    { val: maxY * 0.75,  label: `${Math.round(maxY * 0.75 / 1000000)}M` },
    { val: maxY * 0.5,   label: `${Math.round(maxY * 0.5 / 1000000)}M` },
    { val: maxY * 0.25,  label: `${Math.round(maxY * 0.25 / 1000000)}M` },
    { val: 0,            label: '0' },
  ]

  const formatValue = (v: number) => {
    if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(2).replace('.', ',')}M`
    if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}K`
    return `R$ ${v}`
  }

  return (
    <div style={{ ...card(colors, isGbMode), padding: t.space[4] }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: t.space[3],
          flexWrap: 'wrap',
          gap: t.space[2],
        }}
      >
        <SectionTitle colors={colors}>{title}</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
            Dt Início
          </span>
          <FilterInput value={dtInicio} colors={colors} />
          <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
            Dt Fim
          </span>
          <FilterInput value={dtFim} colors={colors} />
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: t.space[4],
          marginBottom: t.space[2],
        }}
      >
        {[
          { label: 'Receitas', color: '#3b82f6' },
          { label: 'Despesas', color: '#ef4444' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: t.radius.sm,
                background: item.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: t.font.size.xs,
                color: colors.textSecondary,
                fontFamily: t.font.family.sans,
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ overflowX: 'auto' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          {/* Y axis grid lines and labels */}
          {yLabels.map((yl, i) => {
            const y = toY(yl.val)
            return (
              <g key={i}>
                <line
                  x1={PL}
                  y1={y}
                  x2={W - PR}
                  y2={y}
                  stroke={colors.border}
                  strokeWidth={yl.val === 0 ? 1.5 : 0.5}
                  strokeDasharray={yl.val === 0 ? undefined : '4 3'}
                />
                <text
                  x={PL - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={9}
                  fill={colors.textMuted as string}
                  fontFamily="Outfit, sans-serif"
                >
                  {yl.label}
                </text>
              </g>
            )
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const gx = PL + i * groupSpacing + groupOffset
            const rx = gx - groupW / 2
            const isH = hovered === i

            const rH = Math.max(0, ((d.receitas / maxY) * cH))
            const dH = Math.max(0, ((d.despesas / maxY) * cH))
            const rY = PT + cH - rH
            const dY = PT + cH - dH

            const tipX = Math.min(Math.max(rx - 50, PL), W - PR - 140)
            const tipY = Math.max(PT + 2, Math.min(rY, dY) - 64)

            return (
              <g key={i}>
                {/* Receitas bar */}
                <rect
                  x={rx}
                  y={rY}
                  width={barW}
                  height={rH}
                  fill={isH ? '#2563eb' : '#3b82f6'}
                  rx={3}
                />

                {/* Despesas bar */}
                <rect
                  x={rx + barW + barGap}
                  y={dY}
                  width={barW}
                  height={dH}
                  fill={isH ? '#dc2626' : '#ef4444'}
                  rx={3}
                />

                {/* Month label */}
                <text
                  x={gx}
                  y={PT + cH + 16}
                  textAnchor="middle"
                  fontSize={9}
                  fill={isH ? (colors.textPrimary as string) : (colors.textMuted as string)}
                  fontFamily="Outfit, sans-serif"
                  fontWeight={isH ? 600 : 400}
                >
                  {d.month}
                </text>

                {/* Invisible hover zone */}
                <rect
                  x={rx - 4}
                  y={PT}
                  width={groupW + 8}
                  height={cH}
                  fill="transparent"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'crosshair' }}
                />

                {/* Tooltip */}
                {isH && (
                  <g>
                    <rect x={tipX} y={tipY} width={140} height={56} rx={6} fill="#1c1917" opacity={0.95} />
                    <text x={tipX + 70} y={tipY + 14} textAnchor="middle" fontSize={10} fill="#fff" fontFamily="Outfit, sans-serif" fontWeight={700}>
                      {d.month}
                    </text>
                    <text x={tipX + 8} y={tipY + 30} textAnchor="start" fontSize={9} fill="#93c5fd" fontFamily="Outfit, sans-serif">
                      Rec: {formatValue(d.receitas)}
                    </text>
                    <text x={tipX + 8} y={tipY + 46} textAnchor="start" fontSize={9} fill="#fca5a5" fontFamily="Outfit, sans-serif">
                      Desp: {formatValue(d.despesas)}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

// ─── Overview Panel (Main Page) ───────────────────────────────────────────────

export default function OverviewPanel() {
  const { colors, isGbMode } = useTheme()

  // ── Tile helpers ────────────────────────────────────────────────────────────

  const tile = (bg: string, label: string, value: string): React.CSSProperties & { _label?: string; _value?: string; _bg?: string } => ({
    background: bg,
    borderRadius: t.radius.DEFAULT,
    padding: t.space[3],
    display: 'flex',
    flexDirection: 'column' as const,
    gap: t.space[1],
  })
  void tile // suppress unused warning — using inline styles below

  const renderTile = (bg: string, label: string, value: string, key: string) => (
    <div
      key={key}
      style={{
        background: bg,
        borderRadius: t.radius.DEFAULT,
        padding: t.space[3],
        display: 'flex',
        flexDirection: 'column',
        gap: t.space[1],
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: '#fff',
          fontFamily: t.font.family.sans,
          lineHeight: 1.3,
          opacity: 0.85,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 15,
          fontWeight: t.font.weight.bold,
          color: '#fff',
          fontFamily: t.font.family.sans,
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
    </div>
  )

  // ── COE and COT donut segments ────────────────────────────────────────────

  const coeSegments: DonutSegment[] = [
    { label: 'Alimentação', pct: 45, color: '#92400e' },
    { label: 'Sanidade',    pct: 20, color: '#b45309' },
    { label: 'Mão de obra', pct: 18, color: '#a16207' },
    { label: 'Outros',      pct: 17, color: '#d97706' },
  ]

  const cotSegments: DonutSegment[] = [
    { label: 'Alimentação', pct: 38, color: '#c2410c' },
    { label: 'Sanidade',    pct: 22, color: '#ea580c' },
    { label: 'Depreciação', pct: 20, color: '#f97316' },
    { label: 'Outros',      pct: 20, color: '#fb923c' },
  ]

  return (
    <div
      style={{
        padding: `${t.space[5]}px ${t.space[6]}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: t.space[4],
        minHeight: '100%',
        boxSizing: 'border-box',
        fontFamily: t.font.family.sans,
      }}
    >

      {/* ══════════════════════════════════════════════════════════════════
          Section 1 — Talhões Map (KEEP EXACTLY AS IS)
      ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          ...card(colors, isGbMode),
          overflow: 'hidden',
          minHeight: 300,
          position: 'relative',
        }}
      >
        {/* Map layer badge */}
        <div
          style={{
            position: 'absolute',
            top: t.space[3],
            left: t.space[3],
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: t.space[1],
            background: 'rgba(255,255,255,0.94)',
            borderRadius: t.radius.DEFAULT,
            padding: `5px ${t.space[2]}px`,
            boxShadow: t.shadow.md,
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Layers size={11} color={t.color.neutral[600]} />
          <span
            style={{
              fontSize: t.font.size.xs,
              fontFamily: t.font.family.sans,
              color: t.color.neutral[700],
              fontWeight: t.font.weight.medium,
            }}
          >
            Talhões
          </span>
          <ChevronDown size={11} color={t.color.neutral[400]} />
        </div>

        {/* Talhão count badge */}
        <div
          style={{
            position: 'absolute',
            top: t.space[3],
            right: t.space[3],
            zIndex: 1000,
            background: t.color.brand[600],
            borderRadius: t.radius.full,
            padding: `4px ${t.space[2]}px`,
            display: 'flex',
            alignItems: 'center',
            gap: t.space[1],
            boxShadow: t.shadow.brand,
          }}
        >
          <span
            style={{
              fontSize: t.font.size.xs,
              color: '#fff',
              fontFamily: t.font.family.sans,
              fontWeight: t.font.weight.semibold,
            }}
          >
            {TALHAOES.length} talhões
          </span>
          <ArrowRight size={10} color="#fff" />
        </div>

        <TalhoesMap />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          Section 2 — Previsão de Receitas x Despesas
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ ...card(colors, isGbMode), padding: t.space[4] }}>
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: t.space[4],
            flexWrap: 'wrap',
            gap: t.space[2],
          }}
        >
          <SectionTitle colors={colors}>Previsão de Receitas x Despesas</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
            <FilterSelect value="Mensal" colors={colors} />
            <FilterInput value="01/01/2025" colors={colors} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
              a
            </span>
            <FilterInput value="31/12/2025" colors={colors} />
          </div>
        </div>

        {/* 3 KPI chips */}
        <div
          style={{
            display: 'flex',
            gap: t.space[3],
            flexWrap: 'wrap',
          }}
        >
          {/* Valores a Receber */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.space[2],
              border: `1px solid ${colors.border}`,
              borderRadius: t.radius.DEFAULT,
              padding: `${t.space[2]}px ${t.space[3]}px`,
              background: colors.surfaceBg,
            }}
          >
            <TrendingUp size={15} color="#059669" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontSize: t.font.size.xs,
                  color: colors.textMuted,
                  fontFamily: t.font.family.sans,
                }}
              >
                Valores a Receber (R$)
              </span>
              <span
                style={{
                  fontSize: t.font.size.lg,
                  fontWeight: t.font.weight.bold,
                  color: '#059669',
                  fontFamily: t.font.family.sans,
                  lineHeight: 1,
                }}
              >
                R$ 22.600,00
              </span>
            </div>
          </div>

          {/* Valores a Pagar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.space[2],
              border: `1px solid ${colors.border}`,
              borderRadius: t.radius.DEFAULT,
              padding: `${t.space[2]}px ${t.space[3]}px`,
              background: colors.surfaceBg,
            }}
          >
            <TrendingDown size={15} color="#dc2626" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontSize: t.font.size.xs,
                  color: colors.textMuted,
                  fontFamily: t.font.family.sans,
                }}
              >
                Valores a Pagar (R$)
              </span>
              <span
                style={{
                  fontSize: t.font.size.lg,
                  fontWeight: t.font.weight.bold,
                  color: '#dc2626',
                  fontFamily: t.font.family.sans,
                  lineHeight: 1,
                }}
              >
                R$ 21.159,27
              </span>
            </div>
          </div>

          {/* Saldo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.space[2],
              border: `1px solid ${colors.border}`,
              borderRadius: t.radius.DEFAULT,
              padding: `${t.space[2]}px ${t.space[3]}px`,
              background: colors.surfaceBg,
            }}
          >
            <DollarSign size={15} color={colors.textPrimary as string} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontSize: t.font.size.xs,
                  color: colors.textMuted,
                  fontFamily: t.font.family.sans,
                }}
              >
                Saldo (R$)
              </span>
              <span
                style={{
                  fontSize: t.font.size.lg,
                  fontWeight: t.font.weight.bold,
                  color: colors.textPrimary,
                  fontFamily: t.font.family.sans,
                  lineHeight: 1,
                }}
              >
                R$ 1.440,73
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          Section 3 — Custo de Produção por período - Realizado
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ ...card(colors, isGbMode), padding: t.space[4] }}>
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: t.space[3],
            flexWrap: 'wrap',
            gap: t.space[2],
          }}
        >
          <SectionTitle colors={colors}>Custo de Produção por período - Realizado</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
              Tipo
            </span>
            <FilterSelect value="Animais" colors={colors} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
              Dt Início
            </span>
            <FilterInput value="02/09/2024" colors={colors} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
              Dt Fim
            </span>
            <FilterInput value="15/04/2025" colors={colors} />
          </div>
        </div>

        {/* KPI inline values */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.space[5],
            marginBottom: t.space[4],
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
            <span
              style={{
                fontSize: t.font.size.sm,
                color: colors.textSecondary,
                fontFamily: t.font.family.sans,
              }}
            >
              Margem Bruta (R$):
            </span>
            <span
              style={{
                fontSize: t.font.size.md,
                fontWeight: t.font.weight.bold,
                color: '#059669',
                fontFamily: t.font.family.sans,
              }}
            >
              R$ 1.237.824,45
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
            <span
              style={{
                fontSize: t.font.size.sm,
                color: colors.textSecondary,
                fontFamily: t.font.family.sans,
              }}
            >
              Margem Líquida (R$):
            </span>
            <span
              style={{
                fontSize: t.font.size.md,
                fontWeight: t.font.weight.bold,
                color: '#059669',
                fontFamily: t.font.family.sans,
              }}
            >
              R$ 794.143,08
            </span>
          </div>
        </div>

        {/* 2 Donut charts side by side */}
        <div
          style={{
            display: 'flex',
            gap: t.space[6],
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <DonutChart
            title="Custo Operacional Efetivo - COE"
            segments={coeSegments}
            colors={colors}
          />
          <DonutChart
            title="Custo Operacional Total - COT"
            segments={cotSegments}
            colors={colors}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          Section 4 — Resultado Operacional (R$)
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ ...card(colors, isGbMode), padding: t.space[4] }}>
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: t.space[4],
            flexWrap: 'wrap',
            gap: t.space[2],
          }}
        >
          <SectionTitle colors={colors}>Resultado Operacional (R$)</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
              Dt Início
            </span>
            <FilterInput value="02/09/2024" colors={colors} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
              Dt Fim
            </span>
            <FilterInput value="15/04/2025" colors={colors} />
          </div>
        </div>

        {/* 4x3 grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: t.space[2],
          }}
        >
          {/* Row 1 — Receitas (dark green) */}
          {renderTile('#1b4332', 'Receitas Realizadas (R$)', 'R$ 4.375.845,93', 'rec-real')}
          {renderTile('#1b4332', 'Receitas Previstas (R$)', 'R$ 10.000,00', 'rec-prev')}
          {renderTile('#1b4332', 'Receitas Atrasadas (R$)', 'R$ 12.600,00', 'rec-atras')}
          {renderTile('#1b4332', 'Receitas Total (R$)', 'R$ 5.254.526,43', 'rec-total')}

          {/* Row 2 — Despesas (dark red) */}
          {renderTile('#7f1d1d', 'Despesas Realizadas (R$)', 'R$ 4.375.845,93', 'desp-real')}
          {renderTile('#7f1d1d', 'Despesas Previstas (R$)', 'R$ 8.531,27', 'desp-prev')}
          {renderTile('#7f1d1d', 'Despesas Atrasadas (R$)', 'R$ 12.628,00', 'desp-atras')}
          {renderTile('#7f1d1d', 'Despesas Total (R$)', 'R$ 4.397.005,20', 'desp-total')}

          {/* Row 3 — Saldo (mixed) */}
          {renderTile('#1b4332', 'Saldo Realizado (R$)', 'R$ 856.080,50', 'saldo-real')}
          {renderTile('#1b4332', 'Saldo Previsto (R$)', 'R$ 1.468,73', 'saldo-prev')}
          {renderTile('#7f1d1d', 'Saldo Atrasado (R$)', 'R$ -28,00', 'saldo-atras')}
          {renderTile('#1b4332', 'Saldo Total (R$)', 'R$ 857.521,23', 'saldo-total')}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          Section 5 — Análise de Resultados Apurados
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ ...card(colors, isGbMode), padding: t.space[4] }}>
        {/* Header */}
        <div style={{ marginBottom: t.space[3] }}>
          <SectionTitle colors={colors}>Análise de Resultados Apurados</SectionTitle>
        </div>

        {/* Filter row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.space[2],
            marginBottom: t.space[4],
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
            Zona
          </span>
          <FilterSelect value="Todas" colors={colors} />
          <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
            Dt Início
          </span>
          <FilterInput value="01/01/2025" colors={colors} />
          <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
            Dt Fim
          </span>
          <FilterInput value="31/01/2026" colors={colors} />
          <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
            Produtos
          </span>
          <FilterSelect value="Todas as Culturas" colors={colors} />
        </div>

        {/* Tile grid — 3 columns, gap 4px */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 4,
          }}
        >
          {/* Blue — financial receitas */}
          {[
            { label: 'Receitas Realizadas (R$)', value: 'R$ 2.708.458,09' },
            { label: 'Receita a Receber (R$)',   value: 'R$ 0,00' },
            { label: 'Receitas Total (R$)',       value: 'R$ 2.708.458,09' },
          ].map(item => (
            <div
              key={item.label}
              style={{
                background: '#1e3a5f',
                borderRadius: t.radius.DEFAULT,
                padding: t.space[3],
                display: 'flex',
                flexDirection: 'column',
                gap: t.space[1],
              }}
            >
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.80)', fontFamily: t.font.family.sans, lineHeight: 1.3 }}>
                {item.label}
              </span>
              <span style={{ fontSize: 14, fontWeight: t.font.weight.bold, color: '#fff', fontFamily: t.font.family.sans, lineHeight: 1.2 }}>
                {item.value}
              </span>
            </div>
          ))}

          {/* Green — produção vendida */}
          {[
            { label: 'Produção Vendida (ton)',  value: '17.079' },
            { label: 'Produção Estocada (ton)', value: '2.569' },
            { label: 'Produção Total (ton)',    value: '19.648' },
          ].map(item => (
            <div
              key={item.label + '-g1'}
              style={{
                background: '#1b4332',
                borderRadius: t.radius.DEFAULT,
                padding: t.space[3],
                display: 'flex',
                flexDirection: 'column',
                gap: t.space[1],
              }}
            >
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.80)', fontFamily: t.font.family.sans, lineHeight: 1.3 }}>
                {item.label}
              </span>
              <span style={{ fontSize: 14, fontWeight: t.font.weight.bold, color: '#fff', fontFamily: t.font.family.sans, lineHeight: 1.2 }}>
                {item.value}
              </span>
            </div>
          ))}

          {/* Green (slightly different shade) — produção falcada */}
          {[
            { label: 'Produção Vendida (ton)',  value: '17.079' },
            { label: 'Produção Falcada (ton)',  value: '2.569' },
            { label: 'Produção Total (ton)',    value: '19.648' },
          ].map(item => (
            <div
              key={item.label + '-g2'}
              style={{
                background: '#14532d',
                borderRadius: t.radius.DEFAULT,
                padding: t.space[3],
                display: 'flex',
                flexDirection: 'column',
                gap: t.space[1],
              }}
            >
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.80)', fontFamily: t.font.family.sans, lineHeight: 1.3 }}>
                {item.label}
              </span>
              <span style={{ fontSize: 14, fontWeight: t.font.weight.bold, color: '#fff', fontFamily: t.font.family.sans, lineHeight: 1.2 }}>
                {item.value}
              </span>
            </div>
          ))}

          {/* Red — custo */}
          {[
            { label: 'Custo (R$)',             value: 'R$ 0,00' },
            { label: 'Custo Médio (R$/ton)',   value: 'R$ 0,00' },
            { label: 'Custo Médio (R$/ton)',   value: 'R$ 0,00' },
          ].map((item, idx) => (
            <div
              key={item.label + '-r' + idx}
              style={{
                background: '#7f1d1d',
                borderRadius: t.radius.DEFAULT,
                padding: t.space[3],
                display: 'flex',
                flexDirection: 'column',
                gap: t.space[1],
              }}
            >
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.80)', fontFamily: t.font.family.sans, lineHeight: 1.3 }}>
                {item.label}
              </span>
              <span style={{ fontSize: 14, fontWeight: t.font.weight.bold, color: '#fff', fontFamily: t.font.family.sans, lineHeight: 1.2 }}>
                {item.value}
              </span>
            </div>
          ))}

          {/* Blue — margem bruta */}
          {[
            { label: 'Margem Bruta (R$)',      value: 'R$ 2.708.458,09' },
            { label: 'Margem Bruta (R$/ton)',  value: 'R$ 137,85' },
            { label: 'Margem Bruta (R$/ton)',  value: 'R$ 137,85' },
          ].map((item, idx) => (
            <div
              key={item.label + '-b' + idx}
              style={{
                background: '#1e3a5f',
                borderRadius: t.radius.DEFAULT,
                padding: t.space[3],
                display: 'flex',
                flexDirection: 'column',
                gap: t.space[1],
              }}
            >
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.80)', fontFamily: t.font.family.sans, lineHeight: 1.3 }}>
                {item.label}
              </span>
              <span style={{ fontSize: 14, fontWeight: t.font.weight.bold, color: '#fff', fontFamily: t.font.family.sans, lineHeight: 1.2 }}>
                {item.value}
              </span>
            </div>
          ))}

          {/* Dark neutral — produtividade */}
          {[
            { label: 'Produtividade (ton/ha)', value: '21,73' },
            { label: 'Produtividade (ton/ha)', value: '21,73' },
            { label: 'Margem Bruta (R$/ha)',   value: 'R$ 2.985,98' },
          ].map((item, idx) => (
            <div
              key={item.label + '-n' + idx}
              style={{
                background: '#1c1917',
                borderRadius: t.radius.DEFAULT,
                padding: t.space[3],
                display: 'flex',
                flexDirection: 'column',
                gap: t.space[1],
              }}
            >
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.80)', fontFamily: t.font.family.sans, lineHeight: 1.3 }}>
                {item.label}
              </span>
              <span style={{ fontSize: 14, fontWeight: t.font.weight.bold, color: '#fff', fontFamily: t.font.family.sans, lineHeight: 1.2 }}>
                {item.value}
              </span>
            </div>
          ))}

          {/* Dark neutral — preço médio (2 tiles spanning) */}
          {[
            { label: 'Preço Médio (R$/ton)', value: 'R$ 137,85' },
            { label: 'Preço Médio (R$/ton)', value: 'R$ 137,85' },
          ].map((item, idx) => (
            <div
              key={item.label + '-pm' + idx}
              style={{
                background: '#1c1917',
                borderRadius: t.radius.DEFAULT,
                padding: t.space[3],
                display: 'flex',
                flexDirection: 'column',
                gap: t.space[1],
              }}
            >
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.80)', fontFamily: t.font.family.sans, lineHeight: 1.3 }}>
                {item.label}
              </span>
              <span style={{ fontSize: 14, fontWeight: t.font.weight.bold, color: '#fff', fontFamily: t.font.family.sans, lineHeight: 1.2 }}>
                {item.value}
              </span>
            </div>
          ))}
          {/* Empty placeholder to fill 3rd column */}
          <div style={{ background: 'transparent' }} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          Section 6 — Realizado – Receitas x Despesas (bar chart)
      ══════════════════════════════════════════════════════════════════ */}
      <GroupedBarChart
        data={REALIZADO_DATA}
        maxY={4000000}
        title="Realizado – Receitas x Despesas"
        dtInicio="01/08/2024"
        dtFim="31/03/2025"
        colors={colors}
        isGbMode={isGbMode}
      />

      {/* ══════════════════════════════════════════════════════════════════
          Section 7 — Previsto – Receitas x Despesas (bar chart)
      ══════════════════════════════════════════════════════════════════ */}
      <GroupedBarChart
        data={PREVISTO_DATA}
        maxY={2500000}
        title="Previsto – Receitas x Despesas"
        dtInicio="20/09/2026"
        dtFim="20/07/2027"
        colors={colors}
        isGbMode={isGbMode}
      />

    </div>
  )
}
