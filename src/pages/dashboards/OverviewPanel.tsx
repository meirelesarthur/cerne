import { useRef, useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Calendar, ChevronDown, ArrowRight, TrendingUp,
  Info, Layers, AlertTriangle,
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

const YIELD_MONTHS   = ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out']
const YIELD_FORECAST = [3.2, 3.8, 4.2, 4.8, 5.0, 4.8, 4.6]
const YIELD_ACTUAL   = [3.0, 3.4, 3.8, 4.0, 4.4, 4.2, 4.5]

const COST_DATA = [
  { label: 'Fertilizantes',             value: 250, color: t.color.brand[700] },
  { label: 'Crop protection (CHM)',      value: 180, color: t.color.brand[500] },
  { label: 'Fuel',                       value: 160, color: t.color.brand[400] },
  { label: 'Machinery & maintenance',    value: 100, color: t.color.brand[300] },
  { label: 'Other',                      value:  80, color: t.color.brand[200] },
]

const STORAGE_DATA = [
  { label: 'Central silo',     pct: 78, bg: '#92400e', text: '#fff' },
  { label: 'East silo',        pct: 54, bg: '#b45309', text: '#fff' },
  { label: 'South warehouse',  pct: 92, bg: '#a16207', text: '#fff' },
  { label: 'North silo',       pct: 36, bg: '#d97706', text: '#fff' },
]

const MACHINERY = [
  { label: 'Active',    pct: 72, color: t.color.brand[600] },
  { label: 'Idle',      pct: 18, color: t.color.warning.solid },
  { label: 'In repair', pct: 10, color: t.color.error.solid },
]

// ─── Style helper ─────────────────────────────────────────────────────────────

function card(colors: ThemeColors, extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: colors.surfaceBg,
    border: `1px solid ${colors.border}`,
    borderRadius: t.radius['2xl'],
    ...extra,
  }
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiProps {
  label: string
  value: string
  sub?: string
  subColor?: string
  alert?: boolean
  colors: ThemeColors
}

function KpiCard({ label, value, sub, subColor, alert, colors }: KpiProps) {
  return (
    <div
      style={{
        ...card(colors),
        padding: `${t.space[4]}px ${t.space[5]}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: t.space[2],
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: t.font.size.xs,
            color: colors.textMuted,
            fontFamily: t.font.family.sans,
            fontWeight: t.font.weight.medium,
            letterSpacing: '0.02em',
            lineHeight: 1.4,
          }}
        >
          {label}
        </span>
        {alert && (
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: t.radius.DEFAULT,
              background: t.color.warning.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={13} color={t.color.warning.text} />
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: value.length > 6 ? t.font.size['2xl'] : t.font.size['3xl'],
          fontWeight: t.font.weight.bold,
          color: colors.textPrimary,
          fontFamily: t.font.family.sans,
          lineHeight: 1.1,
          letterSpacing: '-0.5px',
        }}
      >
        {value}
      </div>

      {sub && (
        <div
          style={{
            fontSize: t.font.size.xs,
            color: subColor ?? colors.textMuted,
            fontFamily: t.font.family.sans,
            fontWeight: t.font.weight.medium,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  )
}

// ─── Yield Line Chart (SVG) ───────────────────────────────────────────────────

function YieldLineChart({ colors }: { colors: ThemeColors }) {
  const [hovered, setHovered] = useState<number | null>(null)

  const W = 620, H = 190, PL = 40, PT = 16, PR = 16, PB = 34
  const cW = W - PL - PR, cH = H - PT - PB
  const MIN_Y = 2.5, MAX_Y = 5.5

  const toX = (i: number) => PL + (i / (YIELD_MONTHS.length - 1)) * cW
  const toY = (v: number) => PT + cH - ((v - MIN_Y) / (MAX_Y - MIN_Y)) * cH

  function makePath(data: number[]) {
    return data.reduce((acc, v, i) => {
      const x = toX(i), y = toY(v)
      if (i === 0) return `M ${x} ${y}`
      const px = toX(i - 1), py = toY(data[i - 1])
      const dx = (x - px) / 3
      return `${acc} C ${px + dx} ${py}, ${x - dx} ${y}, ${x} ${y}`
    }, '')
  }

  const fPath = makePath(YIELD_FORECAST)
  const aPath = makePath(YIELD_ACTUAL)
  const areaPath = `${fPath} L ${toX(YIELD_MONTHS.length - 1)} ${PT + cH} L ${toX(0)} ${PT + cH} Z`

  const green  = t.color.brand[600]
  const gray   = t.color.neutral[400]
  const gridC  = t.color.neutral[200]
  const axisC  = t.color.neutral[400]

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="ovForecastFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={green} stopOpacity="0.14" />
          <stop offset="100%" stopColor={green} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[3.0, 3.5, 4.0, 4.5, 5.0, 5.5].map(v => {
        const y = toY(v)
        return (
          <g key={v}>
            <line x1={PL} y1={y} x2={W - PR} y2={y}
              stroke={gridC} strokeWidth={v === MIN_Y ? 1.5 : 0.5}
              strokeDasharray={v === MIN_Y ? undefined : '4 3'} />
            <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={9}
              fill={axisC} fontFamily="Outfit, sans-serif">{v}</text>
          </g>
        )
      })}

      {/* Y axis label */}
      <text x={10} y={PT + cH / 2} textAnchor="middle" fontSize={9} fill={axisC}
        fontFamily="Outfit, sans-serif" transform={`rotate(-90, 10, ${PT + cH / 2})`}>
        ton/ha
      </text>

      {/* Forecast area fill */}
      <path d={areaPath} fill="url(#ovForecastFill)" />

      {/* Actual 2024 dashed line */}
      <path d={aPath} fill="none" stroke={gray} strokeWidth={2}
        strokeDasharray="5 4" strokeLinejoin="round" />

      {/* Forecast 2025 solid line */}
      <path d={fPath} fill="none" stroke={green} strokeWidth={2.5}
        strokeLinejoin="round" />

      {/* Hover zones + dots */}
      {YIELD_MONTHS.map((m, i) => {
        const isH = hovered === i
        const fx = toX(i), fy = toY(YIELD_FORECAST[i])
        const ay = toY(YIELD_ACTUAL[i])
        const tipX = Math.min(Math.max(fx - 62, PL), W - PR - 124)
        const tipY = fy - 72

        return (
          <g key={i}>
            {/* Invisible hover area */}
            <rect
              x={fx - 18} y={PT} width={36} height={cH}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'crosshair' }}
            />

            {/* Vertical guide line on hover */}
            {isH && (
              <line x1={fx} y1={PT} x2={fx} y2={PT + cH}
                stroke={gridC} strokeWidth={1} strokeDasharray="3 3" />
            )}

            {/* Dots */}
            <circle cx={fx} cy={fy} r={isH ? 5.5 : 3.5}
              fill={green} stroke="#fff" strokeWidth={1.5} />
            <circle cx={fx} cy={ay} r={isH ? 4.5 : 2.5}
              fill={gray} stroke="#fff" strokeWidth={1.5} />

            {/* Month label */}
            <text x={fx} y={PT + cH + 20} textAnchor="middle" fontSize={10}
              fill={isH ? green : axisC} fontFamily="Outfit, sans-serif"
              fontWeight={isH ? 600 : 400}>
              {m}
            </text>

            {/* Tooltip */}
            {isH && (
              <g>
                <rect x={tipX} y={tipY} width={124} height={62} rx={8}
                  fill="#1c1917" opacity={0.96} />
                <text x={tipX + 62} y={tipY + 16} textAnchor="middle" fontSize={11}
                  fill="#fff" fontFamily="Outfit, sans-serif" fontWeight={700}>
                  {m} 2025
                </text>
                <text x={tipX + 8} y={tipY + 34} textAnchor="start" fontSize={10}
                  fill="#4ade80" fontFamily="Outfit, sans-serif">
                  ● Prev. {YIELD_FORECAST[i]} t/ha
                </text>
                <text x={tipX + 8} y={tipY + 50} textAnchor="start" fontSize={10}
                  fill={gray} fontFamily="Outfit, sans-serif">
                  ● 2024 {YIELD_ACTUAL[i]} t/ha
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* Baseline */}
      <line x1={PL} y1={PT + cH} x2={W - PR} y2={PT + cH}
        stroke={gridC} strokeWidth={1} />
    </svg>
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

      poly.on('mouseover', function () {
        this.setStyle({ weight: 3.5, fillOpacity: Math.min(talhao.fillOpacity + 0.18, 0.65) })
      })
      poly.on('mouseout', function () {
        this.setStyle({ weight: 2.5, fillOpacity: talhao.fillOpacity })
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

// ─── Cost Distribution ────────────────────────────────────────────────────────

function CostDistribution({ colors }: { colors: ThemeColors }) {
  const total = COST_DATA.reduce((s, d) => s + d.value, 0)
  return (
    <div style={{ ...card(colors), padding: t.space[4] }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[1] }}>
        <span style={{
          fontSize: t.font.size.sm,
          fontWeight: t.font.weight.semibold,
          color: colors.textPrimary,
          fontFamily: t.font.family.sans,
        }}>
          Cost Distribution per Hectare
        </span>
        <Info size={13} color={colors.textMuted} />
      </div>

      <div style={{
        fontSize: t.font.size['2xl'],
        fontWeight: t.font.weight.bold,
        color: colors.textPrimary,
        fontFamily: t.font.family.sans,
        marginBottom: t.space[2],
        letterSpacing: '-0.5px',
      }}>
        Total: <span style={{ color: t.color.brand[600] }}>${total}/ha</span>
      </div>

      {/* Stacked bar */}
      <div style={{
        display: 'flex',
        height: 10,
        borderRadius: t.radius.full,
        overflow: 'hidden',
        marginBottom: t.space[3],
        gap: 1,
      }}>
        {COST_DATA.map(d => (
          <div
            key={d.label}
            title={`${d.label}: $${d.value}/ha`}
            style={{
              width: `${(d.value / total) * 100}%`,
              background: d.color,
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
        {COST_DATA.map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
              <div style={{
                width: 8, height: 8,
                borderRadius: 9999,
                background: d.color,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans }}>
                {d.label}
              </span>
            </div>
            <span style={{
              fontSize: t.font.size.xs,
              fontWeight: t.font.weight.semibold,
              color: colors.textPrimary,
              fontFamily: t.font.family.sans,
            }}>
              ${d.value}/ha
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Storage Utilization ──────────────────────────────────────────────────────

function StorageUtil({ colors }: { colors: ThemeColors }) {
  return (
    <div style={{ ...card(colors), padding: t.space[4] }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[3] }}>
        <span style={{
          fontSize: t.font.size.sm,
          fontWeight: t.font.weight.semibold,
          color: colors.textPrimary,
          fontFamily: t.font.family.sans,
        }}>
          Storage Utilization
        </span>
        <Info size={13} color={colors.textMuted} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[2] }}>
        {STORAGE_DATA.map(s => (
          <div
            key={s.label}
            style={{
              background: s.bg,
              borderRadius: t.radius.lg,
              padding: `${t.space[3]}px ${t.space[3]}px`,
              display: 'flex',
              flexDirection: 'column',
              gap: t.space[1],
            }}
          >
            <span style={{
              fontSize: t.font.size['2xl'],
              fontWeight: t.font.weight.bold,
              color: s.text,
              fontFamily: t.font.family.sans,
              lineHeight: 1,
            }}>
              {s.pct}%
            </span>
            <span style={{
              fontSize: t.font.size.xs,
              color: 'rgba(255,255,255,0.75)',
              fontFamily: t.font.family.sans,
              lineHeight: 1.3,
            }}>
              {s.label}
            </span>
            {/* Mini bar */}
            <div style={{
              marginTop: t.space[1],
              height: 3,
              borderRadius: t.radius.full,
              background: 'rgba(255,255,255,0.2)',
              overflow: 'hidden',
            }}>
              <div style={{ width: `${s.pct}%`, height: '100%', background: 'rgba(255,255,255,0.7)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Harvest Progress (Donut) ─────────────────────────────────────────────────

function HarvestProgress({ colors }: { colors: ThemeColors }) {
  const pct = 65
  const R = 44, cx = 56, cy = 56, sw = 11
  const circ = 2 * Math.PI * R
  const dash = (pct / 100) * circ

  const crops = [
    { label: 'Wheat', color: t.color.neutral[300] },
    { label: 'Soja',  color: t.color.brand[500] },
    { label: 'Milho', color: t.color.brand[300] },
  ]

  return (
    <div style={{ ...card(colors), padding: t.space[4], display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[3] }}>
        <span style={{
          fontSize: t.font.size.sm,
          fontWeight: t.font.weight.semibold,
          color: colors.textPrimary,
          fontFamily: t.font.family.sans,
        }}>
          Harvest Progress
        </span>
        <Info size={13} color={colors.textMuted} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[4], flex: 1 }}>
        {/* Donut */}
        <div style={{ flexShrink: 0 }}>
          <svg width={112} height={112}>
            {/* Track */}
            <circle
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={t.color.neutral[100]}
              strokeWidth={sw}
            />
            {/* Progress */}
            <circle
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={t.color.brand[600]}
              strokeWidth={sw}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
            {/* Center text */}
            <text x={cx} y={cy - 5} textAnchor="middle"
              fontSize={20} fontWeight={700}
              fill={colors.textPrimary} fontFamily="Outfit, sans-serif">
              {pct}%
            </text>
            <text x={cx} y={cy + 13} textAnchor="middle"
              fontSize={9} fill={colors.textMuted} fontFamily="Outfit, sans-serif">
              colhido
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
          {crops.map(c => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
              <div style={{ width: 9, height: 9, borderRadius: 9999, background: c.color, flexShrink: 0 }} />
              <span style={{ fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans }}>
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Machinery Status ─────────────────────────────────────────────────────────

function MachineryStatus({ colors }: { colors: ThemeColors }) {
  return (
    <div style={{ ...card(colors), padding: t.space[4], display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[3] }}>
        <span style={{
          fontSize: t.font.size.sm,
          fontWeight: t.font.weight.semibold,
          color: colors.textPrimary,
          fontFamily: t.font.family.sans,
        }}>
          Machinery Status
        </span>
        <Info size={13} color={colors.textMuted} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', flex: 1, alignItems: 'center' }}>
        {MACHINERY.map(item => (
          <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.space[1] }}>
            <span style={{
              fontSize: t.font.size['2xl'],
              fontWeight: t.font.weight.bold,
              color: item.color,
              fontFamily: t.font.family.sans,
              lineHeight: 1,
            }}>
              {item.pct}%
            </span>
            <span style={{
              fontSize: t.font.size.xs,
              color: colors.textMuted,
              fontFamily: t.font.family.sans,
              textAlign: 'center',
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Combined bar */}
      <div style={{
        display: 'flex',
        height: 5,
        borderRadius: t.radius.full,
        overflow: 'hidden',
        marginTop: t.space[3],
        gap: 1,
      }}>
        {MACHINERY.map(item => (
          <div key={item.label} style={{ width: `${item.pct}%`, background: item.color, borderRadius: 9999 }} />
        ))}
      </div>
    </div>
  )
}

// ─── Overview Panel (Main Page) ───────────────────────────────────────────────

export default function OverviewPanel() {
  const { colors } = useTheme()

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
      {/* ── Header ──────────────────────────────────────────────── */}
      <div>
        <div style={{
          fontSize: t.font.size.xs,
          color: t.color.brand[600],
          fontFamily: t.font.family.sans,
          marginBottom: t.space[1],
          fontWeight: t.font.weight.semibold,
          letterSpacing: '0.02em',
        }}>
          Data Based on All Fields · Harvest 2025
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: t.space[4] }}>
          <h1 style={{
            margin: 0,
            fontSize: t.font.size['4xl'],
            fontWeight: t.font.weight.bold,
            color: colors.textPrimary,
            fontFamily: t.font.family.sans,
            letterSpacing: '-0.8px',
            lineHeight: 1.1,
          }}>
            Overview Panel
          </h1>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], flexShrink: 0 }}>
            {/* Date range */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.space[2],
              background: colors.surfaceBg,
              border: `1px solid ${colors.border}`,
              borderRadius: t.radius.DEFAULT,
              padding: `7px ${t.space[3]}px`,
              cursor: 'pointer',
            }}>
              <Calendar size={13} color={colors.textMuted} />
              <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans }}>
                01.04.2025
              </span>
              <span style={{ fontSize: t.font.size.xs, color: colors.textMuted }}>—</span>
              <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans }}>
                01.10.2025
              </span>
            </div>

            {/* All Fields */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.space[1],
              background: colors.surfaceBg,
              border: `1px solid ${colors.border}`,
              borderRadius: t.radius.DEFAULT,
              padding: `7px ${t.space[3]}px`,
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans }}>
                All Fields
              </span>
              <ChevronDown size={12} color={colors.textMuted} />
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[3] }}>
        <KpiCard
          label="Total Managed Area"
          value="128,500 ha"
          sub="+3% vs last season"
          subColor={t.color.brand[600]}
          colors={colors}
        />
        <KpiCard
          label="Expected Yield Forecast"
          value="4.2M tons"
          sub="+12% vs last year"
          subColor={t.color.brand[600]}
          colors={colors}
        />
        <KpiCard
          label="Projected Revenue"
          value="$1.4B"
          sub="FOI: +18% across all crops"
          subColor={t.color.brand[600]}
          colors={colors}
        />
        <KpiCard
          label="Operational Risks Alerts"
          value="5"
          sub="low moisture at 1,240 ha"
          subColor={t.color.warning.text}
          alert
          colors={colors}
        />
      </div>

      {/* ── Main content: left (chart + bottom) | right (map + cost) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: t.space[3] }}>

        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>

          {/* Yield Line Chart */}
          <div style={{ ...card(colors), padding: t.space[4] }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: t.space[3],
              flexWrap: 'wrap',
              gap: t.space[2],
            }}>
              <span style={{
                fontSize: t.font.size.base,
                fontWeight: t.font.weight.semibold,
                color: colors.textPrimary,
                fontFamily: t.font.family.sans,
              }}>
                Monthly Yield Forecast vs Last Year
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: t.space[3] }}>
                {/* Legend */}
                {[
                  { label: 'Forecast 2025', color: t.color.brand[600], dashed: false },
                  { label: 'Actual 2024',   color: t.color.neutral[400], dashed: true },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
                    <svg width={22} height={4}>
                      <line x1={0} y1={2} x2={22} y2={2}
                        stroke={l.color} strokeWidth={2.5}
                        strokeDasharray={l.dashed ? '5 3' : undefined} />
                    </svg>
                    <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
                      {l.label}
                    </span>
                  </div>
                ))}

                {/* Harvest dropdown */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.space[1],
                  border: `1px solid ${colors.border}`,
                  borderRadius: t.radius.DEFAULT,
                  padding: `4px ${t.space[2]}px`,
                  cursor: 'pointer',
                }}>
                  <TrendingUp size={11} color={colors.textMuted} />
                  <span style={{ fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans }}>
                    All Harvest
                  </span>
                  <ChevronDown size={11} color={colors.textMuted} />
                </div>
              </div>
            </div>
            <YieldLineChart colors={colors} />
          </div>

          {/* Bottom row: Storage | Harvest | Machinery */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr 1fr', gap: t.space[3] }}>
            <StorageUtil colors={colors} />
            <HarvestProgress colors={colors} />
            <MachineryStatus colors={colors} />
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>

          {/* Talhões Map */}
          <div style={{
            ...card(colors),
            overflow: 'hidden',
            flex: '1 1 auto',
            minHeight: 340,
            position: 'relative',
          }}>
            {/* Map layer badge */}
            <div style={{
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
            }}>
              <Layers size={11} color={t.color.neutral[600]} />
              <span style={{ fontSize: t.font.size.xs, fontFamily: t.font.family.sans, color: t.color.neutral[700], fontWeight: t.font.weight.medium }}>
                Talhões
              </span>
              <ChevronDown size={11} color={t.color.neutral[400]} />
            </div>

            {/* Talhão count badge */}
            <div style={{
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
            }}>
              <span style={{ fontSize: t.font.size.xs, color: '#fff', fontFamily: t.font.family.sans, fontWeight: t.font.weight.semibold }}>
                {TALHAOES.length} talhões
              </span>
              <ArrowRight size={10} color="#fff" />
            </div>

            <TalhoesMap />
          </div>

          {/* Cost Distribution */}
          <CostDistribution colors={colors} />
        </div>
      </div>
    </div>
  )
}
