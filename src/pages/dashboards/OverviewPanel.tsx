import { useRef, useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Layers, ArrowRight, ChevronDown,
  TrendingUp, DollarSign, TrendingDown,
  BarChart2, PieChart, BarChart3, ArrowUpRight,
  Wheat, Package, Activity,
} from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Skeleton } from '../../components/ui/Skeleton'
import type { ThemeColors } from '../../context/ThemeContext'

// ─── Mock data ────────────────────────────────────────────────────────────────

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

// ─── Bar chart data ────────────────────────────────────────────────────────────

interface BarMonthData { month: string; receitas: number; despesas: number }

const REALIZADO_DATA: BarMonthData[] = [
  { month: 'Ago/24', receitas: 320000,  despesas: 280000 },
  { month: 'Set/24', receitas: 3800000, despesas: 3600000 },
  { month: 'Out/24', receitas: 180000,  despesas: 120000 },
  { month: 'Nov/24', receitas: 240000,  despesas: 160000 },
  { month: 'Dez/24', receitas: 160000,  despesas: 80000 },
  { month: 'Jan/25', receitas: 320000,  despesas: 200000 },
  { month: 'Fev/25', receitas: 260000,  despesas: 220000 },
  { month: 'Mar/25', receitas: 180000,  despesas: 100000 },
]

const PREVISTO_DATA: BarMonthData[] = [
  { month: 'Ago/24', receitas: 2200000, despesas: 180000 },
  { month: 'Set/24', receitas: 160000,  despesas: 120000 },
  { month: 'Out/24', receitas: 140000,  despesas: 100000 },
  { month: 'Nov/24', receitas: 120000,  despesas: 80000 },
  { month: 'Dez/24', receitas: 100000,  despesas: 60000 },
  { month: 'Jan/25', receitas: 80000,   despesas: 40000 },
  { month: 'Fev/25', receitas: 60000,   despesas: 30000 },
  { month: 'Mar/25', receitas: 40000,   despesas: 20000 },
]

// ─── Resultado Operacional data ────────────────────────────────────────────────

interface ResultadoGroup { label: string; realizado: number; previsto: number; atrasado: number }

const RESULTADO_DATA: ResultadoGroup[] = [
  { label: 'Receitas',  realizado: 18993220.76, previsto: 27860,    atrasado: 22600 },
  { label: 'Despesas',  realizado:  4395001.10, previsto: 82339.92, atrasado: 20658.27 },
  { label: 'Saldo',     realizado: 14598219.66, previsto: -54479.92, atrasado: 1941.73 },
]

// ─── Style helpers ────────────────────────────────────────────────────────────

function card(colors: ThemeColors, isGbMode: boolean, extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: colors.surfaceBg,
    borderRadius: t.radius['2xl'],
    border: `1px solid ${colors.border}`,
    boxShadow: isGbMode
      ? '0 1px 2px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.35)'
      : '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.07)',
    ...extra,
  }
}

// ─── ChartCard ────────────────────────────────────────────────────────────────

interface ChartCardProps {
  icon: React.ElementType; title: string; action?: React.ReactNode
  children: React.ReactNode; colors: ThemeColors; isGbMode: boolean; noPadding?: boolean
}

function ChartCard({ icon: Icon, title, action, children, colors, isGbMode, noPadding }: ChartCardProps) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: colors.surfaceBg,
        borderRadius: t.radius['2xl'],
        border: `1px solid ${colors.border}`,
        boxShadow: hov
          ? (isGbMode ? '0 4px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)')
          : (isGbMode ? '0 1px 2px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.35)' : '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.07)'),
        transition: 'box-shadow 0.22s ease',
        padding: noPadding ? 0 : t.space[4],
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: noPadding ? 0 : t.space[4],
        padding: noPadding ? `${t.space[3]}px ${t.space[4]}px` : 0,
        borderBottom: noPadding ? `1px solid ${colors.border}` : undefined,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: t.space[2],
          background: isGbMode ? 'rgba(255,255,255,0.06)' : t.color.neutral[100],
          borderRadius: t.radius.DEFAULT,
          padding: `${t.space[1]}px ${t.space[2] + 2}px`,
        }}>
          <Icon size={12} color={colors.textMuted as string} />
          <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.medium, color: colors.textSecondary, fontFamily: t.font.family.sans, letterSpacing: '0.01em' }}>
            {title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          {action}
          <ExpandBtn colors={colors} isGbMode={isGbMode} hovered={hov} />
        </div>
      </div>
      {children}
    </div>
  )
}

function ExpandBtn({ colors, isGbMode, hovered }: { colors: ThemeColors; isGbMode: boolean; hovered: boolean }) {
  const [btnHov, setBtnHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setBtnHov(true)}
      onMouseLeave={() => setBtnHov(false)}
      style={{
        width: 28, height: 28, borderRadius: t.radius.DEFAULT,
        border: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        background: btnHov ? (isGbMode ? 'rgba(255,255,255,0.08)' : t.color.neutral[100]) : 'transparent',
        transition: 'background 0.15s ease',
        opacity: hovered ? 1 : 0.5,
      }}
    >
      <ArrowUpRight size={13} color={colors.textMuted as string} />
    </div>
  )
}

// ─── KPI Stat Chip ────────────────────────────────────────────────────────────

interface KpiStatChipProps {
  icon: React.ElementType; label: string; value: string
  trend?: string; trendUp?: boolean; accentColor: string
  colors: ThemeColors; isGbMode: boolean
}

function KpiStatChip({ icon: Icon, label, value, trend, trendUp, accentColor, colors, isGbMode }: KpiStatChipProps) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: t.space[1],
        border: `1px solid ${hov ? accentColor + '55' : colors.border}`,
        borderRadius: t.radius.lg,
        padding: `${t.space[3]}px ${t.space[4]}px`,
        background: hov ? (isGbMode ? `${accentColor}0d` : `${accentColor}08`) : colors.surfaceBg,
        transition: 'border-color 0.18s ease, background 0.18s ease',
        minWidth: 180, cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
        <Icon size={13} color={accentColor} />
        <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>{label}</span>
      </div>
      <span style={{ fontSize: t.font.size.xl, fontWeight: t.font.weight.bold, color: accentColor, fontFamily: t.font.family.sans, lineHeight: 1.1 }}>
        {value}
      </span>
      {trend && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold,
          color: trendUp ? t.color.success.text : t.color.error.text,
          background: trendUp ? t.color.success.bg : t.color.error.bg,
          borderRadius: t.radius.full, padding: `2px ${t.space[2]}px`, width: 'fit-content',
        }}>
          {trendUp ? '▲' : '▼'} {trend}
        </span>
      )}
    </div>
  )
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

function FilterInput({ value, colors }: { value: string; colors: ThemeColors }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: t.space[1],
      border: `1px solid ${colors.border}`, borderRadius: t.radius.DEFAULT,
      padding: `5px ${t.space[2]}px`, background: colors.surfaceBg, cursor: 'default',
    }}>
      <span style={{ fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans }}>{value}</span>
    </div>
  )
}

function FilterSelect({ value, colors }: { value: string; colors: ThemeColors }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: t.space[1],
      border: `1px solid ${colors.border}`, borderRadius: t.radius.DEFAULT,
      padding: `5px ${t.space[2]}px`, background: colors.surfaceBg, cursor: 'pointer', minWidth: 100,
    }}>
      <span style={{ fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans, flex: 1 }}>{value}</span>
      <ChevronDown size={11} color={colors.textMuted} />
    </div>
  )
}

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
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles &copy; Esri' }).addTo(map)
    L.control.attribution({ position: 'bottomleft', prefix: '' }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    TALHAOES.forEach(talhao => {
      const poly = L.polygon(talhao.coords, { color: talhao.color, fillColor: talhao.fillColor, fillOpacity: talhao.fillOpacity, weight: 2.5 })
      const statusBg = talhao.color + '22'
      poly.bindTooltip(`<div class="talh-tip"><div class="talh-tip-title">${talhao.name}</div><div class="talh-tip-row"><span>🌾 ${talhao.crop}</span><span>📐 ${talhao.area}</span></div><div class="talh-tip-row"><span>Prev. colheita:</span><b style="color:${talhao.color}">${talhao.yieldForecast}</b></div><div class="talh-tip-row"><span>Umidade: ${talhao.moisture}</span><span>NDVI: ${talhao.ndvi}</span></div><div class="talh-tip-badge" style="color:${talhao.color};background:${statusBg}">${talhao.status}</div></div>`, { sticky: true, opacity: 1, className: 'talh-tooltip-wrap', offset: [12,0] })
      poly.on('mouseover', () => poly.setStyle({ weight: 3.5, fillOpacity: Math.min(talhao.fillOpacity + 0.18, 0.65) }))
      poly.on('mouseout', () => poly.setStyle({ weight: 2.5, fillOpacity: talhao.fillOpacity }))
      poly.addTo(map)
    })
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  return <div ref={containerRef} style={{ height: '100%', width: '100%', borderRadius: t.radius['2xl'] }} />
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

interface DonutSegment { label: string; pct: number; color: string }

function DonutChart({ title, segments, colors }: { title: string; segments: DonutSegment[]; colors: ThemeColors }) {
  const R = 55; const cx = 80; const cy = 75; const sw = 22
  const circ = 2 * Math.PI * R; const quarterTurn = circ / 4
  let cumulativePct = 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.textPrimary, fontFamily: t.font.family.sans, marginBottom: t.space[2], textAlign: 'center', lineHeight: t.font.lineHeight.snug }}>{title}</span>
      <svg width={160} height={150} viewBox="0 0 160 150">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={colors.border} strokeWidth={sw} />
        {segments.map((seg, i) => {
          const segLen = (seg.pct / 100) * circ
          const offset = -(cumulativePct / 100) * circ + quarterTurn
          cumulativePct += seg.pct
          return <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={seg.color} strokeWidth={sw} strokeDasharray={`${segLen} ${circ - segLen}`} strokeDashoffset={offset} />
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1], width: '100%', paddingTop: t.space[1] }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
            <div style={{ width: 8, height: 8, borderRadius: t.radius.sm, background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans, flex: 1 }}>{seg.label}</span>
            <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.textPrimary, fontFamily: t.font.family.sans }}>{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Resultado Operacional Chart ──────────────────────────────────────────────
// Grouped horizontal bar chart: compares Realizado / Previsto / Atrasado
// for each of Receitas, Despesas, Saldo.

function ResultadoChart({ data, colors, isGbMode }: { data: ResultadoGroup[]; colors: ThemeColors; isGbMode: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const W = 860; const H = 220
  const PL = 80; const PT = 20; const PR = 20; const PB = 36
  const cW = W - PL - PR; const cH = H - PT - PB

  // Find absolute max for scaling (ignore negatives for now, use abs)
  const allVals = data.flatMap(d => [Math.abs(d.realizado), Math.abs(d.previsto), Math.abs(d.atrasado)])
  const maxVal = Math.max(...allVals) * 1.1

  const seriesColors = {
    realizado: t.chart.revenue,
    previsto:  isGbMode ? '#a78bfa' : '#7c3aed',
    atrasado:  t.chart.expense,
  }

  const groupCount = data.length
  const groupH = cH / groupCount
  const barH = 14
  const barGap = 5
  const groupPad = (groupH - 3 * barH - 2 * barGap) / 2

  const toX = (v: number) => PL + Math.max(0, (Math.abs(v) / maxVal) * cW)

  const fmt = (v: number) => {
    const abs = Math.abs(v)
    if (abs >= 1000000) return `${v < 0 ? '-' : ''}R$ ${(abs / 1000000).toFixed(2).replace('.', ',')}M`
    if (abs >= 1000) return `${v < 0 ? '-' : ''}R$ ${(abs / 1000).toFixed(0)}K`
    return `R$ ${v.toFixed(2).replace('.', ',')}`
  }

  const xLabels = [0, 0.25, 0.5, 0.75, 1].map(f => ({ val: f * maxVal, x: PL + f * cW }))

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[4], marginBottom: t.space[3] }}>
        {([
          { key: 'realizado', label: 'Realizado', color: seriesColors.realizado },
          { key: 'previsto',  label: 'Previsto',  color: seriesColors.previsto },
          { key: 'atrasado',  label: 'Atrasado',  color: seriesColors.atrasado },
        ] as const).map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
            <div style={{ width: 10, height: 10, borderRadius: t.radius.sm, background: s.color }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans }}>{s.label}</span>
          </div>
        ))}
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ maxHeight: H, display: 'block' }}>
        {/* X-axis grid */}
        {xLabels.map((xl, i) => (
          <g key={i}>
            <line x1={xl.x} y1={PT} x2={xl.x} y2={PT + cH}
              stroke={colors.border}
              strokeWidth={i === 0 ? 1.5 : 0.5}
              strokeDasharray={i === 0 ? undefined : '4 3'} />
            <text x={xl.x} y={PT + cH + 16} textAnchor="middle" fontSize={9}
              fill={colors.textMuted as string} fontFamily="Outfit, sans-serif">
              {xl.val === 0 ? '0' : `${(xl.val / 1000000).toFixed(0)}M`}
            </text>
          </g>
        ))}

        {/* Groups */}
        {data.map((group, gi) => {
          const gy = PT + gi * groupH
          const series = [
            { key: 'realizado', val: group.realizado, color: seriesColors.realizado },
            { key: 'previsto',  val: group.previsto,  color: seriesColors.previsto },
            { key: 'atrasado',  val: group.atrasado,  color: seriesColors.atrasado },
          ]

          return (
            <g key={gi}>
              {/* Row label */}
              <text x={PL - 8} y={gy + groupPad + groupH / 2 - 4} textAnchor="end"
                fontSize={10} fontWeight={600} fill={colors.textPrimary as string}
                fontFamily="Outfit, sans-serif">
                {group.label}
              </text>

              {/* Horizontal divider */}
              {gi > 0 && (
                <line x1={PL} y1={gy} x2={W - PR} y2={gy}
                  stroke={colors.border} strokeWidth={0.5} strokeDasharray="4 3" />
              )}

              {/* Bars */}
              {series.map((s, si) => {
                const barY = gy + groupPad + si * (barH + barGap)
                const barX = toX(s.val)
                const w = Math.max(2, barX - PL)
                const hoverKey = `${gi}-${si}`
                const isH = hovered === hoverKey
                return (
                  <g key={si}
                    onMouseEnter={() => setHovered(hoverKey)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'default' }}>
                    {/* Bar */}
                    <rect x={PL} y={barY} width={w} height={barH} rx={3}
                      fill={s.color}
                      opacity={hovered !== null && !isH ? 0.3 : 1}
                      style={{ transition: 'opacity 0.15s ease' }} />
                    {/* Value label */}
                    <text x={PL + w + 6} y={barY + barH - 3} fontSize={9}
                      fill={isH ? (colors.textPrimary as string) : (colors.textMuted as string)}
                      fontFamily="Outfit, sans-serif" fontWeight={isH ? 700 : 400}
                      style={{ transition: 'fill 0.12s ease' }}>
                      {fmt(s.val)}
                    </text>
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Análise de Resultados — stat row layout ──────────────────────────────────
// Replaces the 7×3 colored tile grid with clean borderLeft-accent stat rows.

interface StatRowItem { label: string; realizado: string; aReceber: string; total: string }
interface StatGroup {
  title: string; icon: React.ElementType; accentColor: string
  items: StatRowItem[]
}

function AnaliseStat({ label, value, colors }: { label: string; value: string; colors: ThemeColors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </span>
      <span style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.bold, color: colors.textPrimary, fontFamily: t.font.family.sans, lineHeight: 1.2 }}>
        {value}
      </span>
    </div>
  )
}

function AnaliseStatGroup({ group, colors, isGbMode }: { group: StatGroup; colors: ThemeColors; isGbMode: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderLeft: `3px solid ${hov ? group.accentColor : group.accentColor + '55'}`,
        borderRadius: `0 ${t.radius.DEFAULT}px ${t.radius.DEFAULT}px 0`,
        background: hov
          ? (isGbMode ? `${group.accentColor}0d` : `${group.accentColor}07`)
          : (isGbMode ? 'rgba(255,255,255,0.02)' : t.color.neutral[50]),
        padding: `${t.space[3]}px ${t.space[4]}px`,
        transition: 'border-color 0.18s ease, background 0.18s ease',
      }}
    >
      {/* Group header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginBottom: t.space[3] }}>
        <group.icon size={12} color={group.accentColor} />
        <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: group.accentColor, fontFamily: t.font.family.sans, letterSpacing: '0.03em', textTransform: 'uppercase' as const }}>
          {group.title}
        </span>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: t.space[3], marginBottom: t.space[1] }}>
        {['Realizado', 'A receber / Estocado', 'Total'].map(h => (
          <span key={h} style={{ fontSize: 10, color: colors.textMuted, fontFamily: t.font.family.sans, fontWeight: t.font.weight.medium }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {group.items.map((item, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: t.space[3], paddingTop: i > 0 ? t.space[2] : 0, borderTop: i > 0 ? `1px solid ${colors.border}` : undefined, marginTop: i > 0 ? t.space[2] : 0 }}>
          <AnaliseStat label={item.label} value={item.realizado} colors={colors} />
          <AnaliseStat label="—" value={item.aReceber} colors={colors} />
          <AnaliseStat label="—" value={item.total} colors={colors} />
        </div>
      ))}
    </div>
  )
}

// ─── Grouped Bar Chart (monthly) ──────────────────────────────────────────────

interface BarChartProps { data: BarMonthData[]; maxY: number; title: string; dtInicio: string; dtFim: string; colors: ThemeColors; isGbMode: boolean }

function GroupedBarChart({ data, maxY, title, dtInicio, dtFim, colors, isGbMode }: BarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const W = 900; const H = 200; const PL = 60; const PT = 16; const PR = 16; const PB = 40
  const cW = W - PL - PR; const cH = H - PT - PB
  const barW = 18; const barGap = 4; const groupW = barW * 2 + barGap
  const groupSpacing = cW / data.length; const groupOffset = groupSpacing / 2
  const toY = (v: number) => PT + cH - (v / maxY) * cH
  const yLabels = [
    { val: maxY,        label: `${Math.round(maxY / 1000000)}M` },
    { val: maxY * 0.75, label: `${Math.round(maxY * 0.75 / 1000000)}M` },
    { val: maxY * 0.5,  label: `${Math.round(maxY * 0.5 / 1000000)}M` },
    { val: maxY * 0.25, label: `${Math.round(maxY * 0.25 / 1000000)}M` },
    { val: 0,           label: '0' },
  ]
  const fmt = (v: number) => v >= 1000000 ? `R$ ${(v/1000000).toFixed(2).replace('.', ',')}M` : v >= 1000 ? `R$ ${(v/1000).toFixed(0)}K` : `R$ ${v}`
  const filters = (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
      <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>Início</span>
      <FilterInput value={dtInicio} colors={colors} />
      <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>Fim</span>
      <FilterInput value={dtFim} colors={colors} />
    </div>
  )
  return (
    <ChartCard icon={BarChart2} title={title} action={filters} colors={colors} isGbMode={isGbMode}>
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[4], marginBottom: t.space[3] }}>
        {[{ label: 'Receitas', color: t.chart.revenue }, { label: 'Despesas', color: t.chart.expense }].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
            <div style={{ width: 10, height: 10, borderRadius: t.radius.sm, background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans }}>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ maxHeight: H, display: 'block' }}>
          {yLabels.map((yl, i) => {
            const y = toY(yl.val)
            return (
              <g key={i}>
                <line x1={PL} y1={y} x2={W - PR} y2={y} stroke={colors.border} strokeWidth={yl.val === 0 ? 1.5 : 0.5} strokeDasharray={yl.val === 0 ? undefined : '4 3'} />
                <text x={PL - 6} y={y + 3} textAnchor="end" fontSize={9} fill={colors.textMuted as string} fontFamily="Outfit, sans-serif">{yl.label}</text>
              </g>
            )
          })}
          {data.map((d, i) => {
            const gx = PL + i * groupSpacing + groupOffset
            const rx = gx - groupW / 2; const isH = hovered === i; const dim = hovered !== null && !isH
            const rH = Math.max(0, (d.receitas / maxY) * cH); const dH = Math.max(0, (d.despesas / maxY) * cH)
            const rY = PT + cH - rH; const dY = PT + cH - dH
            const tipX = Math.min(Math.max(rx - 50, PL), W - PR - 150)
            const tipY = Math.max(PT + 2, Math.min(rY, dY) - 72)
            return (
              <g key={i}>
                <rect x={rx} y={rY} width={barW} height={rH} rx={4} fill={t.chart.revenue} opacity={dim ? 0.3 : 1} style={{ transition: 'opacity 0.18s ease' }} />
                <rect x={rx + barW + barGap} y={dY} width={barW} height={dH} rx={4} fill={t.chart.expense} opacity={dim ? 0.3 : 1} style={{ transition: 'opacity 0.18s ease' }} />
                <text x={gx} y={PT + cH + 16} textAnchor="middle" fontSize={9} fill={isH ? (colors.textPrimary as string) : (colors.textMuted as string)} fontFamily="Outfit, sans-serif" fontWeight={isH ? 600 : 400} style={{ transition: 'fill 0.15s ease' }}>{d.month}</text>
                <rect x={rx - 4} y={PT} width={groupW + 8} height={cH} fill="transparent" onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'crosshair' }} />
                {isH && (
                  <g>
                    <rect x={tipX} y={tipY} width={150} height={64} rx={8} fill={colors.surfaceBg} stroke={colors.border} strokeWidth={1} />
                    <text x={tipX + 75} y={tipY + 16} textAnchor="middle" fontSize={10} fill={colors.textPrimary as string} fontFamily="Outfit, sans-serif" fontWeight={700}>{d.month}</text>
                    <rect x={tipX + 10} y={tipY + 26} width={8} height={8} rx={2} fill={t.chart.revenue} />
                    <text x={tipX + 24} y={tipY + 34} textAnchor="start" fontSize={9} fill={colors.textSecondary as string} fontFamily="Outfit, sans-serif">Rec: {fmt(d.receitas)}</text>
                    <rect x={tipX + 10} y={tipY + 44} width={8} height={8} rx={2} fill={t.chart.expense} />
                    <text x={tipX + 24} y={tipY + 52} textAnchor="start" fontSize={9} fill={colors.textSecondary as string} fontFamily="Outfit, sans-serif">Desp: {fmt(d.despesas)}</text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </ChartCard>
  )
}

// ─── Overview Panel ───────────────────────────────────────────────────────────

export default function OverviewPanel() {
  const { colors, isGbMode } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

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

  const analiseGroups: StatGroup[] = [
    {
      title: 'Receitas',
      icon: DollarSign,
      accentColor: t.chart.revenue,
      items: [
        { label: 'Receitas (R$)', realizado: 'R$ 2.708.458,09', aReceber: 'R$ 0,00', total: 'R$ 2.708.458,09' },
      ],
    },
    {
      title: 'Produção',
      icon: Wheat,
      accentColor: t.color.brand[600],
      items: [
        { label: 'Produção Vendida', realizado: '17.079 ton', aReceber: '2.569 ton', total: '19.648 ton' },
        { label: 'Produção Falcada', realizado: '17.079 ton', aReceber: '2.569 ton', total: '19.648 ton' },
      ],
    },
    {
      title: 'Custo',
      icon: TrendingDown,
      accentColor: t.chart.expense,
      items: [
        { label: 'Custo (R$)',           realizado: 'R$ 0,00', aReceber: 'R$ 0,00', total: 'R$ 0,00' },
        { label: 'Custo Médio (R$/ton)', realizado: 'R$ 0,00', aReceber: 'R$ 0,00', total: 'R$ 0,00' },
      ],
    },
    {
      title: 'Margem',
      icon: TrendingUp,
      accentColor: t.color.brand[700],
      items: [
        { label: 'Margem Bruta (R$)',     realizado: 'R$ 2.708.458,09', aReceber: 'R$ 137,85', total: 'R$ 137,85' },
        { label: 'Margem Bruta (R$/ha)',  realizado: 'R$ 2.985,98',     aReceber: '—',          total: '—' },
      ],
    },
    {
      title: 'Produtividade & Preço',
      icon: Package,
      accentColor: isGbMode ? t.color.neutral[400] : t.color.neutral[600],
      items: [
        { label: 'Produtividade (ton/ha)', realizado: '21,73', aReceber: '21,73', total: '—' },
        { label: 'Preço Médio (R$/ton)',   realizado: 'R$ 137,85', aReceber: 'R$ 137,85', total: '—' },
      ],
    },
  ]

  return (
    <div style={{
      padding: `${t.space[5]}px ${t.space[6]}px`,
      display: 'flex', flexDirection: 'column', gap: t.space[4],
      minHeight: '100%', boxSizing: 'border-box', fontFamily: t.font.family.sans,
    }}>

      {/* ── Section 1 — Talhões Map ─────────────────────────────────────────── */}
      <div style={{ ...card(colors, isGbMode), overflow: 'hidden', minHeight: 300, position: 'relative' }}>
        <div style={{
          position: 'absolute', top: t.space[3], left: t.space[3], zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: t.space[1],
          background: 'rgba(255,255,255,0.94)', borderRadius: t.radius.DEFAULT,
          padding: `5px ${t.space[2]}px`, boxShadow: t.shadow.md, cursor: 'pointer', backdropFilter: 'blur(4px)',
        }}>
          <Layers size={11} color={t.color.neutral[600]} />
          <span style={{ fontSize: t.font.size.xs, fontFamily: t.font.family.sans, color: t.color.neutral[700], fontWeight: t.font.weight.medium }}>Talhões</span>
          <ChevronDown size={11} color={t.color.neutral[400]} />
        </div>
        <div style={{
          position: 'absolute', top: t.space[3], right: t.space[3], zIndex: 1000,
          background: t.color.brand[600], borderRadius: t.radius.full,
          padding: `4px ${t.space[2]}px`, display: 'flex', alignItems: 'center', gap: t.space[1], boxShadow: t.shadow.brand,
        }}>
          <span style={{ fontSize: t.font.size.xs, color: '#fff', fontFamily: t.font.family.sans, fontWeight: t.font.weight.semibold }}>{TALHAOES.length} talhões</span>
          <ArrowRight size={10} color="#fff" />
        </div>
        <TalhoesMap />
      </div>

      {/* ── Section 2 — Previsão de Receitas x Despesas ─────────────────────── */}
      <ChartCard
        icon={TrendingUp}
        title="Previsão de Receitas x Despesas"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
            <FilterSelect value="Mensal" colors={colors} />
            <FilterInput value="01/01/2025" colors={colors} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>a</span>
            <FilterInput value="31/12/2025" colors={colors} />
          </div>
        }
        colors={colors} isGbMode={isGbMode}
      >
        {isLoading ? (
          <div style={{ display: 'flex', gap: t.space[3] }}>
            <Skeleton width={210} height={72} /><Skeleton width={210} height={72} /><Skeleton width={160} height={72} />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: t.space[3], flexWrap: 'wrap' }}>
            <KpiStatChip icon={TrendingUp}   label="Valores a Receber (R$)" value="R$ 27.860,00"   trend="+8,4%"  trendUp accentColor={t.color.brand[600]}         colors={colors} isGbMode={isGbMode} />
            <KpiStatChip icon={TrendingDown} label="Valores a Pagar (R$)"   value="R$ 82.339,92"   trend="+2,1%"  trendUp={false} accentColor={t.color.error.text} colors={colors} isGbMode={isGbMode} />
            <KpiStatChip icon={DollarSign}   label="Saldo (R$)"             value="-R$ 54.479,92"  trend="-6,3%"  trendUp={false} accentColor={colors.textPrimary as string} colors={colors} isGbMode={isGbMode} />
          </div>
        )}
      </ChartCard>

      {/* ── Section 3 — Custo de Produção ───────────────────────────────────── */}
      <ChartCard
        icon={PieChart}
        title="Custo de Produção por período — Realizado"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>Tipo</span>
            <FilterSelect value="Animais" colors={colors} />
            <FilterInput value="02/09/2024" colors={colors} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>a</span>
            <FilterInput value="15/04/2025" colors={colors} />
          </div>
        }
        colors={colors} isGbMode={isGbMode}
      >
        <div style={{ display: 'flex', gap: t.space[4], marginBottom: t.space[4], flexWrap: 'wrap' }}>
          <KpiStatChip icon={TrendingUp} label="Margem Bruta (R$)"   value="R$ 1.218.669,28" trend="+12,5%" trendUp accentColor={t.color.brand[600]}  colors={colors} isGbMode={isGbMode} />
          <KpiStatChip icon={DollarSign} label="Margem Líquida (R$)" value="R$ 790.978,50"   trend="+9,2%"  trendUp accentColor={t.color.brand[700]}  colors={colors} isGbMode={isGbMode} />
        </div>
        {isLoading ? (
          <div style={{ display: 'flex', gap: t.space[6], justifyContent: 'center' }}>
            <Skeleton width={200} height={240} /><Skeleton width={200} height={240} />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: t.space[6], justifyContent: 'center', flexWrap: 'wrap' }}>
            <DonutChart title="Custo Operacional Efetivo — COE" segments={coeSegments} colors={colors} />
            <DonutChart title="Custo Operacional Total — COT"   segments={cotSegments}  colors={colors} />
          </div>
        )}
      </ChartCard>

      {/* ── Section 4 — Resultado Operacional ───────────────────────────────── */}
      <ChartCard
        icon={BarChart2}
        title="Resultado Operacional (R$)"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
            <FilterInput value="02/09/2024" colors={colors} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>a</span>
            <FilterInput value="15/04/2025" colors={colors} />
          </div>
        }
        colors={colors} isGbMode={isGbMode}
      >
        {/* Summary KPI chips */}
        {isLoading ? (
          <div style={{ display: 'flex', gap: t.space[3], marginBottom: t.space[4] }}>
            <Skeleton width={200} height={72} /><Skeleton width={200} height={72} /><Skeleton width={200} height={72} />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: t.space[3], marginBottom: t.space[5], flexWrap: 'wrap' }}>
            <KpiStatChip icon={TrendingUp}   label="Receitas Total (R$)"  value="R$ 19.043.680,76" trend="+14,2%" trendUp        accentColor={t.chart.revenue}   colors={colors} isGbMode={isGbMode} />
            <KpiStatChip icon={TrendingDown} label="Despesas Total (R$)"  value="R$ 4.498.000,29"  trend="+3,1%"  trendUp={false} accentColor={t.chart.expense}   colors={colors} isGbMode={isGbMode} />
            <KpiStatChip icon={DollarSign}   label="Saldo Total (R$)"     value="R$ 14.545.680,47" trend="+18,7%" trendUp        accentColor={t.color.brand[600]} colors={colors} isGbMode={isGbMode} />
          </div>
        )}

        {/* Horizontal grouped bar chart — Realizado / Previsto / Atrasado */}
        {isLoading ? (
          <Skeleton height={220} />
        ) : (
          <>
            <div style={{ marginBottom: t.space[2] }}>
              <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
                Comparativo por status — Realizado · Previsto · Atrasado
              </span>
            </div>
            <ResultadoChart data={RESULTADO_DATA} colors={colors} isGbMode={isGbMode} />
          </>
        )}
      </ChartCard>

      {/* ── Section 5 — Análise de Resultados Apurados ──────────────────────── */}
      <ChartCard
        icon={BarChart3}
        title="Análise de Resultados Apurados"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], flexWrap: 'wrap' }}>
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>Zona</span>
            <FilterSelect value="Todas" colors={colors} />
            <FilterInput value="01/01/2025" colors={colors} />
            <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>a</span>
            <FilterInput value="31/01/2026" colors={colors} />
            <FilterSelect value="Todas as Culturas" colors={colors} />
          </div>
        }
        colors={colors} isGbMode={isGbMode}
      >
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={80} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
            {analiseGroups.map((group, i) => (
              <AnaliseStatGroup key={i} group={group} colors={colors} isGbMode={isGbMode} />
            ))}
          </div>
        )}
      </ChartCard>

      {/* ── Section 6 — Realizado — Receitas x Despesas ─────────────────────── */}
      <GroupedBarChart
        data={REALIZADO_DATA} maxY={4000000}
        title="Realizado – Receitas x Despesas"
        dtInicio="01/08/2024" dtFim="31/03/2025"
        colors={colors} isGbMode={isGbMode}
      />

      {/* ── Section 7 — Previsto — Receitas x Despesas ──────────────────────── */}
      <GroupedBarChart
        data={PREVISTO_DATA} maxY={2500000}
        title="Previsto – Receitas x Despesas"
        dtInicio="20/09/2026" dtFim="20/07/2027"
        colors={colors} isGbMode={isGbMode}
      />

    </div>
  )
}
