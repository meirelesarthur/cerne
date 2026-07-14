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
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { Button } from '../../components/ui/Button'
import { FilterSelect } from '../../components/ui/FilterSelect'
import { SankeyFunnel } from '../../components/ui/SankeyFunnel'

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

// Cor de margem (3ª série do gráfico de área) — distinta de receita/despesa.
const MARGEM_COLOR = t.color.accent.purple.text

// ─── Cruzamentos derivados ──────────────────────────────────────────────────
// Em vez de "produção total" solta, cruzamos os talhões em distribuição de área
// por cultura (ha × cultura). Cores estáveis por cultura.

const CROP_COLOR: Record<string, string> = {
  'Soja':           t.color.brand[600],
  'Milho':          t.color.feedback.warning.solid,
  'Cana-de-açúcar': t.color.accent.purple.text,
  'Pastagem':       t.color.neutral[400],
}

const AREA_BY_CROP = (() => {
  const acc = new Map<string, number>()
  for (const tl of TALHAOES) {
    const ha = parseInt(tl.area, 10) || 0
    acc.set(tl.crop, (acc.get(tl.crop) ?? 0) + ha)
  }
  return [...acc.entries()].sort((a, b) => b[1] - a[1])
})()
const TOTAL_HA = AREA_BY_CROP.reduce((s, [, ha]) => s + ha, 0)

// Resultado operacional (DRE) — receita decrescendo através das camadas de custo
// até o resultado. Cruza o total de receita com a composição de custo (COE/COT).
const DRE_STAGES = [
  { label: 'Receita bruta',  value: 18900, sublabel: 'R$ 18,9M' },
  { label: 'Após COE',       value: 11000, sublabel: '− custeio' },
  { label: 'Após COT',       value: 7400,  sublabel: '− c. total' },
  { label: 'Resultado',      value: 3500,  sublabel: 'R$ 3,5M'  },
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
      color: up ? t.color.feedback.success.text : t.color.feedback.error.text,
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 14, height: 14, borderRadius: t.radius.full,
        background: up ? t.color.feedback.success.bg : t.color.feedback.error.bg,
        fontSize: t.font.size['3xs'], lineHeight: 1,
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
      <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans, marginBottom: t.space[1] }}>
        {label}
      </div>
      <div style={{ fontSize: t.font.size['3xl'], fontWeight: t.font.weight.bold, color: colors.fg.default, fontFamily: t.font.family.sans, lineHeight: 1.1, marginBottom: t.space[2] }}>
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

function AreaChart({ colors, isGbMode, data = AREA_DATA }: { colors: ThemeColors; isGbMode: boolean; data?: typeof AREA_DATA }) {
  const [hov, setHov] = useState<number | null>(null)
  const W = 700; const H = 200; const PL = 40; const PT = 16; const PR = 8; const PB = 32
  const cW = W - PL - PR; const cH = H - PT - PB
  const maxV = Math.max(...data.map(d => d.receitas)) * 1.12
  const pts = (key: 'receitas' | 'despesas'): [number, number][] =>
    data.map((d, i) => [PL + (i / (data.length - 1)) * cW, PT + cH - (d[key] / maxV) * cH])

  const recPts = pts('receitas')
  const dspPts = pts('despesas')
  // Margem = receitas − despesas (cruzamento dos dois totais numa 3ª série)
  const mgPts: [number, number][] = data.map((d, i) => [
    PL + (i / (data.length - 1)) * cW,
    PT + cH - ((d.receitas - d.despesas) / maxV) * cH,
  ])

  const recPath = smoothPath(recPts)
  const dspPath = smoothPath(dspPts)
  const mgPath  = smoothPath(mgPts)

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
            <stop offset="0%" stopColor={t.color.feedback.error.solid} stopOpacity={isGbMode ? 0.25 : 0.10} />
            <stop offset="100%" stopColor={t.color.feedback.error.solid} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Y grid */}
        {yVals.map((yl, i) => (
          <g key={i}>
            <line x1={PL} y1={yl.y} x2={W - PR} y2={yl.y}
              stroke={colors.border.default} strokeWidth={0.5} strokeDasharray={i === 0 ? undefined : '4 3'} />
            <text x={PL - 6} y={yl.y + 4} textAnchor="end" fontSize={9}
              fill={colors.fg.subtle as string} fontFamily="Outfit,sans-serif">{yl.label}</text>
          </g>
        ))}

        {/* Area fills */}
        <path d={areaClose(recPath, PT + cH)} fill={`url(#${recGradId})`} />
        <path d={areaClose(dspPath, PT + cH)} fill={`url(#${dspGradId})`} />

        {/* Lines */}
        <path d={recPath} fill="none" stroke={t.color.brand[600]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <path d={dspPath} fill="none" stroke={t.color.feedback.error.solid} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5 3" />
        <path d={mgPath} fill="none" stroke={MARGEM_COLOR} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />

        {/* X labels */}
        {data.map((d, i) => {
          const x = PL + (i / (data.length - 1)) * cW
          const isH = hov === i
          return (
            <g key={i}>
              <text x={x} y={PT + cH + 18} textAnchor="middle" fontSize={9}
                fill={isH ? (colors.fg.default as string) : (colors.fg.subtle as string)}
                fontFamily="Outfit,sans-serif" fontWeight={isH ? 600 : 400}>
                {d.month}
              </text>
              {/* Hover zone */}
              <rect x={x - 20} y={PT} width={40} height={cH} fill="transparent"
                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: 'crosshair' }} />
              {/* Hover dot + line */}
              {isH && (
                <g>
                  <line x1={x} y1={PT} x2={x} y2={PT + cH} stroke={colors.border.default} strokeWidth={1} strokeDasharray="3 2" />
                  <circle cx={recPts[i][0]} cy={recPts[i][1]} r={4} fill={t.color.brand[600]} stroke={colors.bg.surface} strokeWidth={2} />
                  <circle cx={dspPts[i][0]} cy={dspPts[i][1]} r={3.5} fill={t.color.feedback.error.solid} stroke={colors.bg.surface} strokeWidth={2} />
                  <circle cx={mgPts[i][0]} cy={mgPts[i][1]} r={3.5} fill={MARGEM_COLOR} stroke={colors.bg.surface} strokeWidth={2} />
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
            <BarChart2 size={18} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
            <span style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.bold, color: colors.fg.default }}>{value}</span>
          </div>
        </foreignObject>
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', gap: t.space[3], marginTop: -t.space[3] }}>
        {[
          { dot: activeColor,   label: 'Margem' },
          { dot: inactiveColor === t.color.neutral[200] ? t.color.neutral[400] : inactiveColor, label: sub },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: t.radius.full, background: item.dot, flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>{item.label}</span>
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
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Div({ colors }: { colors: ThemeColors }) {
  return <div style={{ height: 1, background: colors.border.default }} />
}

// ─── Overview Panel ───────────────────────────────────────────────────────────

export default function OverviewPanel() {
  const { colors, isGbMode } = useTheme()
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [periodo, setPeriodo] = useState('10')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  // Período fatia os últimos N meses da série de receitas/despesas
  const areaData = AREA_DATA.slice(-Number(periodo))

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

  return (
    <div style={cardStyle}>

      {/* ── Map strip ────────────────────────────────────────────────────────── */}
      <div style={{ height: 260, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: t.space[3], left: t.space[4], zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: t.space[1],
          background: 'rgba(255,255,255,0.92)', borderRadius: t.radius.base,
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
          <span style={{ fontSize: t.font.size.xs, color: t.color.neutral[0], fontWeight: t.font.weight.semibold }}>{TALHAOES.length} talhões</span>
          <ArrowRight size={10} color={t.color.neutral[0]} />
        </div>
        <TalhoesMap />
      </div>

      <HDivider color={bc} />

      {/* ── Content grid ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ── Main column ────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Greeting + filter bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px`,
          }}>
            <span style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default }}>
              {greeting}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
              <FilterSelect
                ariaLabel="Filtrar por período"
                options={[
                  { value: '3',  label: 'Últimos 3 meses' },
                  { value: '6',  label: 'Últimos 6 meses' },
                  { value: '10', label: 'Últimos 10 meses' },
                ]}
                value={periodo}
                onChange={setPeriodo}
              />
              <Button variant="secondary" size="sm" icon={<Settings2 size={12} />} disabled title="Personalização em breve">
                Personalizar
              </Button>
            </div>
          </div>

          <HDivider color={bc} />

          {/* KPI top row */}
          <div style={{ display: 'flex' }}>
            {[
              { label: 'Margem bruta',         value: '12,5%',    trend: '2,7% vs 30 dias', up: true  },
              { label: 'Receitas realizadas',   value: 'R$ 18,9M', trend: '4,1% vs 30 dias', up: true  },
              { label: 'Saldo operacional',     value: 'R$ 14,5M', trend: '1,3% vs 30 dias', up: false },
            ].flatMap((kpi, i) => [
              i > 0 ? <VDivider key={`d${i}`} color={bc} /> : null,
              <div key={kpi.label} style={{ flex: 1 }}>
                <KpiTop label={kpi.label} value={kpi.value} trend={kpi.trend} up={kpi.up} colors={colors} />
              </div>,
            ])}
          </div>

          <HDivider color={bc} />

          {/* Area chart — Receitas mensais */}
          <div style={{ padding: `${t.space[5]}px ${t.space[5]}px ${t.space[3]}px` }}>
            {/* MRR header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: t.space[4] }}>
              <div>
                <div style={{ fontSize: t.font.size['3xl'], fontWeight: t.font.weight.bold, color: colors.fg.default, lineHeight: 1 }}>
                  R$ 18,9M
                </div>
                <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, marginTop: t.space[1] }}>
                  Receitas mensais realizadas
                </div>
              </div>
              <Trend value="27,4% nos últimos 30 dias" up />
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: t.space[4], marginBottom: t.space[3] }}>
              {[
                { color: t.color.brand[600], label: 'Receitas' },
                { color: t.color.feedback.error.solid, label: 'Despesas' },
                { color: MARGEM_COLOR, label: 'Margem' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: t.radius.full, background: s.color, display: 'inline-block' }} />
                  <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>{s.label}</span>
                </div>
              ))}
            </div>
            <AreaChart colors={colors} isGbMode={isGbMode} data={areaData} />
          </div>

          <HDivider color={bc} />

          {/* Bottom row: Insight + Budget */}
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

            {/* AI Insight */}
            <div style={{ flex: 1, padding: t.space[5] }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[4] }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
                  <BarChart2 size={13} color={colors.fg.subtle as string} />
                  <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Insights</span>
                </div>
                <Button variant="secondary" size="sm" icon={<MessageCircle size={11} />}>
                  Perguntar
                </Button>
              </div>
              <p style={{ fontSize: t.font.size.lg, color: colors.fg.subtle, lineHeight: 1.6, margin: 0, fontWeight: t.font.weight.normal }}>
                A margem bruta melhorou{' '}
                <strong style={{ color: colors.fg.default, fontWeight: t.font.weight.bold }}>3,5% neste mês</strong>{' '}
                em relação ao burn dos últimos 30 dias.
              </p>
            </div>

            <VDivider color={bc} />

            {/* Resultado operacional (DRE) — receita → custos → resultado */}
            <div style={{ flex: 1, padding: t.space[5] }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[2] }}>
                <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Resultado operacional (DRE)</span>
                <Button variant="ghost" size="sm" icon={<Wheat size={11} />}>
                  Detalhes
                </Button>
              </div>
              <SankeyFunnel stages={DRE_STAGES} colors={colors} isGbMode={isGbMode} chartHeight={150} />
            </div>

          </div>

          <HDivider color={bc} />

          {/* Área plantada por cultura — cruza os talhões (ha × cultura) */}
          <div style={{ padding: `${t.space[4]}px ${t.space[5]}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[3] }}>
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Área plantada por cultura</span>
              <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.fg.default }}>
                {TOTAL_HA.toLocaleString('pt-BR')} ha · {TALHAOES.length} talhões
              </span>
            </div>
            <SegmentedBar
              colors={colors}
              segments={AREA_BY_CROP.map(([crop, ha]) => ({
                color: CROP_COLOR[crop] ?? t.color.neutral[400],
                pct: ha,
                label: `${crop} — ${Math.round((ha / TOTAL_HA) * 100)}%`,
              }))}
            />
          </div>

        </div>

        <VDivider color={bc} />

        {/* ── Right aside ────────────────────────────────────────────────────── */}
        <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Radial gauge */}
          <div style={{ padding: `${t.space[5]}px ${t.space[4]}px`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <RadialGauge
              value="R$ 14,5M"
              label="Margem operacional"
              sub="Custos"
              pct={0.77}
              colors={colors}
              isGbMode={isGbMode}
            />
            <Button variant="secondary" size="sm" block iconRight={<ArrowRight size={11} />} style={{ marginTop: t.space[3] }}>
              Ver detalhe
            </Button>
          </div>

          <HDivider color={bc} />

          {/* Realizado progress */}
          <div style={{ padding: `${t.space[4]}px ${t.space[4]}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[3] }}>
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Receitas realizadas</span>
              <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.fg.default }}>78%</span>
            </div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default, lineHeight: 1, marginBottom: t.space[3] }}>
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
                  <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <HDivider color={bc} />

          {/* Cost summary card */}
          <div style={{ padding: `${t.space[4]}px ${t.space[4]}px`, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[3] }}>
              <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.fg.default }}>
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
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: t.space[2], marginBottom: t.space[2], borderBottom: `1px solid ${colors.border.default}` }}>
                <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>{row.label}:</span>
                <span style={{
                  fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
                  color: row.green ? t.color.feedback.success.text : colors.fg.default,
                }}>
                  {row.value}
                </span>
              </div>
            ))}
            <Button variant="secondary" size="sm" block iconRight={<ArrowRight size={11} />} style={{ marginTop: t.space[1] }}>
              Ver detalhes
            </Button>
          </div>

          {/* Needs attention */}
          <div style={{ padding: `${t.space[3]}px ${t.space[4]}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginBottom: t.space[2] }}>
              <TrendingDown size={11} color={t.color.feedback.error.text} />
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Requer atenção</span>
            </div>
            {[
              { label: 'Saldo atrasado', value: 'R$ 1.940,73', color: t.color.feedback.error.text },
              { label: 'Desp. previstas', value: 'R$ 82.339,92', color: t.color.feedback.warning.text },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.space[1] }}>
                <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>{item.label}</span>
                <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
