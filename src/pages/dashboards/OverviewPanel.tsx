import { useRef, useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Layers, ArrowRight, ChevronDown, TrendingUp, TrendingDown,
  DollarSign, Wheat, BarChart2, MessageCircle, Settings2,
  MoreHorizontal,
} from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import type { ThemeColors } from '../../context/ThemeContext'

// ─── Talhões ──────────────────────────────────────────────────────────────────

interface Talhao {
  id: string; name: string; area: string; crop: string
  yieldForecast: string; status: string; moisture: string; ndvi: string
  coords: L.LatLngTuple[]; color: string; fillColor: string; fillOpacity: number
}

const TALHAOES: Talhao[] = [
  { id: 'T1', name: 'Talhão Santa Maria', area: '320 ha', crop: 'Soja', yieldForecast: '64 sc/ha', status: 'Em crescimento', moisture: '68%', ndvi: '0.74', coords: [[-18.760,-52.650],[-18.760,-52.628],[-18.780,-52.628],[-18.780,-52.650]], color: '#059669', fillColor: '#059669', fillOpacity: 0.28 },
  { id: 'T2', name: 'Talhão Cerrado Norte', area: '480 ha', crop: 'Milho', yieldForecast: '140 sc/ha', status: 'Germinação', moisture: '72%', ndvi: '0.61', coords: [[-18.760,-52.626],[-18.760,-52.600],[-18.780,-52.600],[-18.780,-52.626]], color: '#d97706', fillColor: '#d97706', fillOpacity: 0.28 },
  { id: 'T3', name: 'Talhão Rio Verde', area: '250 ha', crop: 'Soja', yieldForecast: '60 sc/ha', status: 'Floração', moisture: '74%', ndvi: '0.81', coords: [[-18.782,-52.650],[-18.782,-52.634],[-18.797,-52.634],[-18.797,-52.650]], color: '#047857', fillColor: '#047857', fillOpacity: 0.35 },
  { id: 'T4', name: 'Talhão Sul', area: '190 ha', crop: 'Cana-de-açúcar', yieldForecast: '85 t/ha', status: 'Maturação', moisture: '65%', ndvi: '0.69', coords: [[-18.782,-52.632],[-18.782,-52.614],[-18.797,-52.614],[-18.797,-52.632]], color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.25 },
  { id: 'T5', name: 'Talhão Leste', area: '360 ha', crop: 'Milho', yieldForecast: '132 sc/ha', status: 'Em crescimento', moisture: '70%', ndvi: '0.65', coords: [[-18.782,-52.612],[-18.782,-52.596],[-18.797,-52.596],[-18.797,-52.612]], color: '#d97706', fillColor: '#d97706', fillOpacity: 0.28 },
  { id: 'T6', name: 'Talhão Reserva', area: '140 ha', crop: 'Pastagem', yieldForecast: '—', status: 'Pousio', moisture: '55%', ndvi: '0.42', coords: [[-18.799,-52.650],[-18.799,-52.632],[-18.814,-52.632],[-18.814,-52.650]], color: '#9ca3af', fillColor: '#9ca3af', fillOpacity: 0.20 },
  { id: 'T7', name: 'Talhão Água Limpa', area: '410 ha', crop: 'Soja', yieldForecast: '58 sc/ha', status: 'Enchimento de grãos', moisture: '76%', ndvi: '0.78', coords: [[-18.799,-52.630],[-18.799,-52.610],[-18.814,-52.610],[-18.814,-52.630]], color: '#059669', fillColor: '#059669', fillOpacity: 0.30 },
]

// ─── Chart data ───────────────────────────────────────────────────────────────

const AREA_DATA = [
  { month: 'Ago', receitas: 320,  despesas: 280 },
  { month: 'Set', receitas: 3800, despesas: 3600 },
  { month: 'Out', receitas: 600,  despesas: 380 },
  { month: 'Nov', receitas: 820,  despesas: 540 },
  { month: 'Dez', receitas: 740,  despesas: 340 },
  { month: 'Jan', receitas: 960,  despesas: 560 },
  { month: 'Fev', receitas: 1100, despesas: 720 },
  { month: 'Mar', receitas: 940,  despesas: 500 },
  { month: 'Abr', receitas: 1320, despesas: 840 },
  { month: 'Mai', receitas: 1180, despesas: 660 },
]

// ─── Talhões Map ──────────────────────────────────────────────────────────────

function TalhoesMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView([-18.787,-52.625], 13)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    TALHAOES.forEach(talhao => {
      const poly = L.polygon(talhao.coords, { color: talhao.color, fillColor: talhao.fillColor, fillOpacity: talhao.fillOpacity, weight: 2.5 })
      poly.bindTooltip(`<div style="font-family:Outfit,sans-serif;font-size:12px;padding:4px 8px"><b>${talhao.name}</b><br/>${talhao.crop} · ${talhao.area}</div>`, { sticky: true, opacity: 1, offset: [10,0] })
      poly.on('mouseover', () => poly.setStyle({ weight: 3.5, fillOpacity: Math.min(talhao.fillOpacity + 0.18, 0.65) }))
      poly.on('mouseout', () => poly.setStyle({ weight: 2.5, fillOpacity: talhao.fillOpacity }))
      poly.addTo(map)
    })
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])
  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
}

// ─── Trend badge ──────────────────────────────────────────────────────────────

function Trend({ value, up }: { value: string; up: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
      fontFamily: t.font.family.sans,
      color: up ? t.color.success.text : t.color.error.text,
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 14, height: 14, borderRadius: t.radius.full,
        background: up ? t.color.success.bg : t.color.error.bg,
        fontSize: 9, lineHeight: 1,
      }}>
        {up ? '▲' : '▼'}
      </span>
      {value}
    </span>
  )
}

// ─── KPI stat (top row, efferd style) ────────────────────────────────────────

function KpiTop({ label, value, trend, up, colors }: { label: string; value: string; trend: string; up: boolean; colors: ThemeColors }) {
  return (
    <div style={{ flex: 1, padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px` }}>
      <div style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans, marginBottom: t.space[1] }}>
        {label}
      </div>
      <div style={{ fontSize: t.font.size['3xl'], fontWeight: t.font.weight.bold, color: colors.textPrimary, fontFamily: t.font.family.sans, lineHeight: 1.1, marginBottom: t.space[2] }}>
        {value}
      </div>
      <Trend value={trend} up={up} />
    </div>
  )
}

// ─── Area chart (smooth SVG) ──────────────────────────────────────────────────

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1]; const c = pts[i]
    const cx = (p[0] + c[0]) / 2
    d += ` C ${cx} ${p[1]}, ${cx} ${c[1]}, ${c[0]} ${c[1]}`
  }
  return d
}

function AreaChart({ colors, isGbMode }: { colors: ThemeColors; isGbMode: boolean }) {
  const [hov, setHov] = useState<number | null>(null)
  const W = 700; const H = 200; const PL = 40; const PT = 16; const PR = 8; const PB = 32
  const cW = W - PL - PR; const cH = H - PT - PB
  const maxV = Math.max(...AREA_DATA.map(d => d.receitas)) * 1.12
  const pts = (key: 'receitas' | 'despesas'): [number, number][] =>
    AREA_DATA.map((d, i) => [PL + (i / (AREA_DATA.length - 1)) * cW, PT + cH - (d[key] / maxV) * cH])

  const recPts = pts('receitas')
  const dspPts = pts('despesas')

  const recPath = smoothPath(recPts)
  const dspPath = smoothPath(dspPts)

  const areaClose = (path: string, baseY: number) =>
    `${path} L ${PL + cW} ${baseY} L ${PL} ${baseY} Z`

  const yVals = [0, maxV * 0.25, maxV * 0.5, maxV * 0.75, maxV].map(v => ({
    v, y: PT + cH - (v / maxV) * cH,
    label: v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${Math.round(v)}`,
  }))

  const recGradId = isGbMode ? 'recGbGrad' : 'recGrad'
  const dspGradId = isGbMode ? 'dspGbGrad' : 'dspGrad'

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block', maxHeight: H }}>
        <defs>
          <linearGradient id={recGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.color.brand[600]} stopOpacity={isGbMode ? 0.35 : 0.18} />
            <stop offset="100%" stopColor={t.color.brand[600]} stopOpacity={0} />
          </linearGradient>
          <linearGradient id={dspGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.color.error.solid} stopOpacity={isGbMode ? 0.25 : 0.10} />
            <stop offset="100%" stopColor={t.color.error.solid} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Y grid */}
        {yVals.map((yl, i) => (
          <g key={i}>
            <line x1={PL} y1={yl.y} x2={W - PR} y2={yl.y}
              stroke={colors.border} strokeWidth={0.5} strokeDasharray={i === 0 ? undefined : '4 3'} />
            <text x={PL - 6} y={yl.y + 4} textAnchor="end" fontSize={9}
              fill={colors.textMuted as string} fontFamily="Outfit,sans-serif">{yl.label}</text>
          </g>
        ))}

        {/* Area fills */}
        <path d={areaClose(recPath, PT + cH)} fill={`url(#${recGradId})`} />
        <path d={areaClose(dspPath, PT + cH)} fill={`url(#${dspGradId})`} />

        {/* Lines */}
        <path d={recPath} fill="none" stroke={t.color.brand[600]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <path d={dspPath} fill="none" stroke={t.color.error.solid} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5 3" />

        {/* X labels */}
        {AREA_DATA.map((d, i) => {
          const x = PL + (i / (AREA_DATA.length - 1)) * cW
          const isH = hov === i
          return (
            <g key={i}>
              <text x={x} y={PT + cH + 18} textAnchor="middle" fontSize={9}
                fill={isH ? (colors.textPrimary as string) : (colors.textMuted as string)}
                fontFamily="Outfit,sans-serif" fontWeight={isH ? 600 : 400}>
                {d.month}
              </text>
              {/* Hover zone */}
              <rect x={x - 20} y={PT} width={40} height={cH} fill="transparent"
                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: 'crosshair' }} />
              {/* Hover dot + line */}
              {isH && (
                <g>
                  <line x1={x} y1={PT} x2={x} y2={PT + cH} stroke={colors.border} strokeWidth={1} strokeDasharray="3 2" />
                  <circle cx={recPts[i][0]} cy={recPts[i][1]} r={4} fill={t.color.brand[600]} stroke={colors.surfaceBg} strokeWidth={2} />
                  <circle cx={dspPts[i][0]} cy={dspPts[i][1]} r={3.5} fill={t.color.error.solid} stroke={colors.surfaceBg} strokeWidth={2} />
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Radial gauge (dashed circle, efferd style) ───────────────────────────────

function RadialGauge({ value, label, sub, pct, colors, isGbMode }: {
  value: string; label: string; sub: string; pct: number; colors: ThemeColors; isGbMode: boolean
}) {
  const cx = 110; const cy = 110; const R = 88
  const DASHES = 60; const dashLen = 8; const dashGap = 3.5
  const filled = Math.round(pct * DASHES)

  const dashes = Array.from({ length: DASHES }, (_, i) => {
    const angleDeg = -90 + (360 / DASHES) * i
    const rad = (angleDeg * Math.PI) / 180
    const x1 = cx + (R - dashLen / 2) * Math.cos(rad)
    const y1 = cy + (R - dashLen / 2) * Math.sin(rad)
    const x2 = cx + (R + dashLen / 2) * Math.cos(rad)
    const y2 = cy + (R + dashLen / 2) * Math.sin(rad)
    return { x1, y1, x2, y2, active: i < filled }
  })

  const activeColor = isGbMode ? t.color.brand[400] : t.color.neutral[800]
  const inactiveColor = isGbMode ? 'rgba(255,255,255,0.10)' : t.color.neutral[200]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={220} height={220} viewBox="0 0 220 220" style={{ display: 'block' }}>
        {dashes.map((d, i) => (
          <line key={i} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2}
            stroke={d.active ? activeColor : inactiveColor}
            strokeWidth={3.5} strokeLinecap="round" />
        ))}
        {/* Center icon + text */}
        <foreignObject x={cx - 56} y={cy - 42} width={112} height={84}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: t.font.family.sans }}>
            <BarChart2 size={18} color={colors.textMuted as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
            <span style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.bold, color: colors.textPrimary }}>{value}</span>
          </div>
        </foreignObject>
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', gap: t.space[3], marginTop: -t.space[3] }}>
        {[
          { dot: activeColor,   label: 'Receitas' },
          { dot: inactiveColor === t.color.neutral[200] ? t.color.neutral[400] : inactiveColor, label: sub },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: t.radius.full, background: item.dot, flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Segmented bar (efferd active customers style) ────────────────────────────

function SegmentedBar({ segments, colors }: {
  segments: { color: string; pct: number; label: string }[]
  colors: ThemeColors
}) {
  return (
    <div>
      <div style={{ display: 'flex', height: 10, borderRadius: 2, overflow: 'hidden', gap: 2, marginBottom: t.space[2] }}>
        {segments.map((s, i) => (
          <div key={i} style={{ flex: s.pct, background: s.color, borderRadius: 2 }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: t.space[3] }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: t.radius.full, background: s.color, flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Div({ colors }: { colors: ThemeColors }) {
  return <div style={{ height: 1, background: colors.border }} />
}

// ─── Overview Panel ───────────────────────────────────────────────────────────

export default function OverviewPanel() {
  const { colors, isGbMode } = useTheme()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const sectionBorder = `1px solid ${colors.border}`

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100%', fontFamily: t.font.family.sans,
      background: colors.pageBg,
    }}>

      {/* ── Map strip ────────────────────────────────────────────────────────── */}
      <div style={{ height: 200, position: 'relative', borderBottom: sectionBorder, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: t.space[3], left: t.space[4], zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: t.space[1],
          background: 'rgba(255,255,255,0.92)', borderRadius: t.radius.DEFAULT,
          padding: `5px ${t.space[2]}px`, backdropFilter: 'blur(4px)',
          boxShadow: t.shadow.sm, cursor: 'pointer',
        }}>
          <Layers size={11} color={t.color.neutral[500]} />
          <span style={{ fontSize: t.font.size.xs, color: t.color.neutral[700], fontWeight: t.font.weight.medium }}>Talhões</span>
          <ChevronDown size={11} color={t.color.neutral[400]} />
        </div>
        <div style={{
          position: 'absolute', top: t.space[3], right: t.space[4], zIndex: 1000,
          background: t.color.brand[600], borderRadius: t.radius.full,
          padding: `4px ${t.space[2]}px`, display: 'flex', alignItems: 'center', gap: t.space[1],
        }}>
          <span style={{ fontSize: t.font.size.xs, color: '#fff', fontWeight: t.font.weight.semibold }}>{TALHAOES.length} talhões</span>
          <ArrowRight size={10} color="#fff" />
        </div>
        <TalhoesMap />
      </div>

      {/* ── Content grid ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ── Main column ────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, borderRight: sectionBorder, display: 'flex', flexDirection: 'column' }}>

          {/* Greeting + filter bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px`,
            borderBottom: sectionBorder,
          }}>
            <span style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.textPrimary }}>
              {greeting}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
              {/* Period picker */}
              <button style={{
                display: 'flex', alignItems: 'center', gap: t.space[1],
                border: sectionBorder, borderRadius: t.radius.DEFAULT,
                padding: `6px ${t.space[3]}px`, background: 'transparent',
                cursor: 'pointer', fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans,
              }}>
                Últimos 30 dias <ChevronDown size={11} />
              </button>
              <button style={{
                display: 'flex', alignItems: 'center', gap: t.space[1],
                border: sectionBorder, borderRadius: t.radius.DEFAULT,
                padding: `6px ${t.space[3]}px`, background: 'transparent',
                cursor: 'pointer', fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans,
              }}>
                <span style={{ fontSize: 11 }}>📅</span> 03/05 – 01/06/2026
              </button>
              <button style={{
                display: 'flex', alignItems: 'center', gap: t.space[1],
                border: sectionBorder, borderRadius: t.radius.DEFAULT,
                padding: `6px ${t.space[3]}px`, background: 'transparent',
                cursor: 'pointer', fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans,
              }}>
                <Settings2 size={12} /> Personalizar
              </button>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: `6px ${t.space[2]}px`, color: colors.textMuted }}>
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* KPI top row */}
          <div style={{ display: 'flex', borderBottom: sectionBorder }}>
            {[
              { label: 'Margem bruta',         value: '12,5%',          trend: '2,7% vs 30 dias',   up: true  },
              { label: 'Receitas realizadas',   value: 'R$ 18,9M',       trend: '4,1% vs 30 dias',   up: true  },
              { label: 'Saldo operacional',     value: 'R$ 14,5M',       trend: '1,3% vs 30 dias',   up: false },
            ].map((kpi, i, arr) => (
              <div key={kpi.label} style={{ flex: 1, borderRight: i < arr.length - 1 ? sectionBorder : undefined }}>
                <KpiTop label={kpi.label} value={kpi.value} trend={kpi.trend} up={kpi.up} colors={colors} />
              </div>
            ))}
          </div>

          {/* Area chart — Receitas mensais */}
          <div style={{ padding: `${t.space[5]}px ${t.space[5]}px ${t.space[3]}px`, borderBottom: sectionBorder }}>
            {/* MRR header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: t.space[4] }}>
              <div>
                <div style={{ fontSize: t.font.size['3xl'], fontWeight: t.font.weight.bold, color: colors.textPrimary, lineHeight: 1 }}>
                  R$ 18,9M
                </div>
                <div style={{ fontSize: t.font.size.xs, color: colors.textMuted, marginTop: t.space[1] }}>
                  Receitas mensais realizadas
                </div>
              </div>
              <Trend value="27,4% nos últimos 30 dias" up />
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: t.space[4], marginBottom: t.space[3] }}>
              {[
                { color: t.color.brand[600], label: 'Receitas' },
                { color: t.color.error.solid, label: 'Despesas' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: t.radius.full, background: s.color, display: 'inline-block' }} />
                  <span style={{ fontSize: t.font.size.xs, color: colors.textMuted }}>{s.label}</span>
                </div>
              ))}
            </div>
            <AreaChart colors={colors} isGbMode={isGbMode} />
          </div>

          {/* Bottom row: Insight + Budget */}
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

            {/* AI Insight */}
            <div style={{ flex: 1, borderRight: sectionBorder, padding: t.space[5] }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[4] }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
                  <BarChart2 size={13} color={colors.textMuted as string} />
                  <span style={{ fontSize: t.font.size.xs, color: colors.textMuted }}>Insights</span>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: t.space[1], border: sectionBorder, borderRadius: t.radius.DEFAULT, padding: `5px ${t.space[2]}px`, background: 'transparent', cursor: 'pointer', fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans }}>
                  <MessageCircle size={11} /> Perguntar
                </button>
              </div>
              <p style={{ fontSize: t.font.size.lg, color: colors.textMuted, lineHeight: 1.6, margin: 0, fontWeight: t.font.weight.normal }}>
                A margem bruta melhorou{' '}
                <strong style={{ color: colors.textPrimary, fontWeight: t.font.weight.bold }}>3,5% neste mês</strong>{' '}
                em relação ao burn dos últimos 30 dias.
              </p>
            </div>

            {/* Budget / COE usage */}
            <div style={{ flex: 1, padding: t.space[5] }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[1] }}>
                <span style={{ fontSize: t.font.size.xs, color: colors.textMuted }}>Custo de produção</span>
                <button style={{ display: 'flex', alignItems: 'center', gap: t.space[1], border: 'none', background: 'transparent', cursor: 'pointer', fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans }}>
                  <Wheat size={11} /> Detalhes
                </button>
              </div>
              <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.textPrimary, marginBottom: t.space[3] }}>
                R$ 3,6M
              </div>
              <SegmentedBar
                colors={colors}
                segments={[
                  { color: isGbMode ? t.color.brand[700] : t.color.neutral[700], pct: 50, label: 'COE — 50%' },
                  { color: isGbMode ? t.color.brand[500] : t.color.neutral[500], pct: 25, label: 'COT — 25%' },
                  { color: isGbMode ? t.color.brand[300] : t.color.neutral[300], pct: 25, label: 'Outros — 25%' },
                ]}
              />
            </div>

          </div>

          <Div colors={colors} />

          {/* Bottom metric */}
          <div style={{ padding: `${t.space[4]}px ${t.space[5]}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.textPrimary, lineHeight: 1 }}>
                19.648
              </div>
              <div style={{ fontSize: t.font.size.xs, color: colors.textMuted, marginTop: 3 }}>
                Produção total (ton)
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Trend value="9,8% nos últimos 30 dias" up />
              <div style={{ fontSize: t.font.size.xs, color: colors.textMuted, marginTop: 3 }}>
                Pico <strong style={{ color: colors.textPrimary }}>21,73 ton/ha</strong> em Mai
              </div>
            </div>
          </div>

        </div>

        {/* ── Right aside ────────────────────────────────────────────────────── */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Radial gauge */}
          <div style={{ padding: `${t.space[5]}px ${t.space[4]}px`, borderBottom: sectionBorder, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <RadialGauge
              value="R$ 19,0M"
              label="Receitas Total"
              sub="Despesas"
              pct={0.78}
              colors={colors}
              isGbMode={isGbMode}
            />
            <button style={{
              width: '100%', marginTop: t.space[3],
              border: sectionBorder, borderRadius: t.radius.DEFAULT,
              padding: `8px 0`, background: 'transparent',
              cursor: 'pointer', fontSize: t.font.size.xs,
              color: colors.textSecondary, fontFamily: t.font.family.sans,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.space[1],
            }}>
              Ver detalhe <ArrowRight size={11} />
            </button>
          </div>

          {/* Realizado progress */}
          <div style={{ padding: `${t.space[4]}px ${t.space[4]}px`, borderBottom: sectionBorder }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[3] }}>
              <span style={{ fontSize: t.font.size.xs, color: colors.textMuted }}>Receitas realizadas</span>
              <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.textPrimary }}>78%</span>
            </div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.textPrimary, lineHeight: 1, marginBottom: t.space[3] }}>
              18.993
            </div>
            {/* Segmented ticks */}
            <div style={{ display: 'flex', gap: 2, marginBottom: t.space[2] }}>
              {Array.from({ length: 40 }, (_, i) => (
                <div key={i} style={{
                  flex: 1, height: 10, borderRadius: 1,
                  background: i < 31
                    ? (isGbMode ? t.color.brand[500] : t.color.neutral[700])
                    : (isGbMode ? 'rgba(255,255,255,0.10)' : t.color.neutral[200]),
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: t.space[3] }}>
              {[
                { color: isGbMode ? t.color.brand[500] : t.color.neutral[700], label: 'Realizado' },
                { color: isGbMode ? 'rgba(255,255,255,0.15)' : t.color.neutral[200], label: 'Previsto' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: t.radius.full, background: s.color, display: 'inline-block' }} />
                  <span style={{ fontSize: t.font.size.xs, color: colors.textMuted }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost summary card */}
          <div style={{ padding: `${t.space[4]}px ${t.space[4]}px`, borderBottom: sectionBorder, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[3] }}>
              <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.textPrimary }}>
                <TrendingUp size={11} color={t.color.brand[600]} style={{ marginRight: 4 }} />
                Margem — última apuração
              </span>
            </div>
            {[
              { label: 'Período',        value: 'Set/24 – Mai/25' },
              { label: 'Margem bruta',   value: 'R$ 1.218.669' },
              { label: 'Margem líquida', value: 'R$ 790.978' },
              { label: 'Status',         value: 'Concluído', green: true },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: t.space[2], marginBottom: t.space[2], borderBottom: `1px solid ${colors.border}` }}>
                <span style={{ fontSize: t.font.size.xs, color: colors.textMuted }}>{row.label}:</span>
                <span style={{
                  fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
                  color: row.green ? t.color.success.text : colors.textPrimary,
                }}>
                  {row.value}
                </span>
              </div>
            ))}
            <button style={{
              width: '100%', marginTop: t.space[1],
              border: sectionBorder, borderRadius: t.radius.DEFAULT,
              padding: `8px 0`, background: 'transparent',
              cursor: 'pointer', fontSize: t.font.size.xs,
              color: colors.textSecondary, fontFamily: t.font.family.sans,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.space[1],
            }}>
              Ver detalhes <ArrowRight size={11} />
            </button>
          </div>

          {/* Needs attention */}
          <div style={{ padding: `${t.space[3]}px ${t.space[4]}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginBottom: t.space[2] }}>
              <TrendingDown size={11} color={t.color.error.text} />
              <span style={{ fontSize: t.font.size.xs, color: colors.textMuted }}>Requer atenção</span>
            </div>
            {[
              { label: 'Saldo atrasado', value: 'R$ 1.940,73', color: t.color.error.text },
              { label: 'Desp. previstas', value: 'R$ 82.339,92', color: t.color.warning.text },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.space[1] }}>
                <span style={{ fontSize: t.font.size.xs, color: colors.textMuted }}>{item.label}</span>
                <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
