import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { t } from '../../design/tokens'
import type { ThemeColors } from '../../context/ThemeContext'
import {
  CloudRain, Droplets, CalendarDays, AlertTriangle,
  Filter, X, Sun, Cloud, CloudSun, TrendingUp,
  BarChart2, Activity, ArrowUpRight,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import { FormSelect } from '../../components/ui/FormSelect'
import { FilterDrawer } from '../../components/ui/FilterDrawer'
import { PageHeader } from '../../components/ui/PageHeader'
import { Skeleton } from '../../components/ui/Skeleton'

// ─── Mock data ────────────────────────────────────────────────────────────────

const ALL_AREAS = [
  'Módulo 5', 'Módulo 4', 'Módulo 3', 'Módulo 2', 'Módulo 1',
  'Módulo 6', 'Módulo 7', 'Conf L1-7', 'Capineira 1', 'Capineira 2',
  'Capineira 3', 'Conf L1-5', 'Conf L4', 'Conf L3', 'Conf L1-3',
  'Conf L1-2', 'Conf L1-1', 'Chorume', 'Separador Sólido', 'Esterco',
]

const BAR_DATA = [
  { month: 'Jun', comChuva: 3,  semChuva: 27 },
  { month: 'Jul', comChuva: 29, semChuva: 2  },
  { month: 'Ago', comChuva: 30, semChuva: 1  },
  { month: 'Set', comChuva: 1,  semChuva: 29 },
  { month: 'Out', comChuva: 5,  semChuva: 26 },
  { month: 'Nov', comChuva: 11, semChuva: 19 },
  { month: 'Dez', comChuva: 13, semChuva: 18 },
  { month: 'Jan', comChuva: 12, semChuva: 19 },
  { month: 'Fev', comChuva: 11, semChuva: 17 },
  { month: 'Mar', comChuva: 10, semChuva: 21 },
  { month: 'Abr', comChuva: 24, semChuva: 6  },
  { month: 'Mai', comChuva: 24, semChuva: 7  },
]

const VOLUME_DATA = [0, 5, 8, 25, 75, 130, 175, 200, 225, 185, 130, 18]
const VOLUME_LABELS = ['Jun/25','Jul','Ago','Set','Out','Nov','Dez','Jan/26','Fev','Mar','Abr','Mai']

const FORECAST = [
  { day: 'Segunda', min: 18, max: 29, rain: 0.2, condition: 'rain'   as const },
  { day: 'Terça',   min: 19, max: 29, rain: 0.2, condition: 'rain'   as const },
  { day: 'Quarta',  min: 19, max: 29, rain: 0.8, condition: 'rain'   as const },
  { day: 'Quinta',  min: 20, max: 30, rain: 0,   condition: 'clear'  as const },
  { day: 'Sexta',   min: 21, max: 30, rain: 0,   condition: 'clear'  as const },
  { day: 'Sábado',  min: 19, max: 30, rain: 0,   condition: 'cloudy' as const },
  { day: 'Domingo', min: 19, max: 29, rain: 0,   condition: 'clear'  as const },
]

// ─── Style helpers ────────────────────────────────────────────────────────────

function glassCard(
  colors: ThemeColors,
  isGbMode: boolean,
  extra?: React.CSSProperties,
): React.CSSProperties {
  return {
    background: isGbMode ? 'rgba(14, 42, 29, 0.55)' : colors.surfaceBg,
    backdropFilter: isGbMode ? 'blur(20px)' : undefined,
    WebkitBackdropFilter: isGbMode ? 'blur(20px)' : undefined,
    borderRadius: t.radius['2xl'],
    border: `1px solid ${colors.border}`,
    boxShadow: isGbMode
      ? '0 1px 2px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.35)'
      : '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.07)',
    ...extra,
  } as React.CSSProperties
}

// ─── ChartCard (tab-chip header + hover elevation) ────────────────────────────

interface ChartCardProps {
  icon: React.ElementType
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  colors: ThemeColors
  isGbMode: boolean
}

function ChartCard({ icon: Icon, title, action, children, colors, isGbMode }: ChartCardProps) {
  const [hov, setHov] = useState(false)
  const [btnHov, setBtnHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: isGbMode ? 'rgba(14, 42, 29, 0.55)' : colors.surfaceBg,
        backdropFilter: isGbMode ? 'blur(20px)' : undefined,
        WebkitBackdropFilter: isGbMode ? 'blur(20px)' : undefined,
        borderRadius: t.radius['2xl'],
        border: `1px solid ${colors.border}`,
        boxShadow: hov
          ? (isGbMode
              ? '0 4px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4)'
              : '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)')
          : (isGbMode
              ? '0 1px 2px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.35)'
              : '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.07)'),
        transition: 'box-shadow 0.22s ease',
        padding: t.space[4],
        boxSizing: 'border-box',
      }}
    >
      {/* Tab-chip header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[4] }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: t.space[2],
          background: isGbMode ? 'rgba(255,255,255,0.06)' : t.color.neutral[100],
          borderRadius: t.radius.DEFAULT,
          padding: `${t.space[1]}px ${t.space[2] + 2}px`,
        }}>
          <Icon size={12} color={colors.textMuted as string} />
          <span style={{
            fontSize: t.font.size.xs,
            fontWeight: t.font.weight.medium,
            color: colors.textSecondary,
            fontFamily: t.font.family.sans,
          }}>
            {title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          {action}
          <div
            onMouseEnter={() => setBtnHov(true)}
            onMouseLeave={() => setBtnHov(false)}
            style={{
              width: 28, height: 28,
              borderRadius: t.radius.DEFAULT,
              border: `1px solid ${colors.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              background: btnHov ? (isGbMode ? 'rgba(255,255,255,0.08)' : t.color.neutral[100]) : 'transparent',
              transition: 'background 0.15s ease',
              opacity: hov ? 1 : 0.5,
            }}
          >
            <ArrowUpRight size={13} color={colors.textMuted as string} />
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Weather icon ─────────────────────────────────────────────────────────────

function WeatherIcon({ condition, size = 16, color }: { condition: string; size?: number; color: string }) {
  if (condition === 'rain') return <CloudRain size={size} color={color} />
  if (condition === 'cloudy') return <Cloud size={size} color={color} />
  if (condition === 'partly') return <CloudSun size={size} color={color} />
  return <Sun size={size} color={color} />
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

type KpiAccent = 'green' | 'amber' | 'red'

interface KpiCardProps {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  trend?: string
  trendUp?: boolean
  accent?: KpiAccent
  colors: ThemeColors
  isGbMode: boolean
}

function KpiCard({ icon: Icon, label, value, sub, trend, trendUp, accent = 'green', colors, isGbMode }: KpiCardProps) {
  const [hov, setHov] = useState(false)
  const accentColors: Record<KpiAccent, string> = {
    green: isGbMode ? '#10b981' : '#059669',
    amber: '#f59e0b',
    red:   '#ef4444',
  }
  const accentBgs: Record<KpiAccent, string> = {
    green: isGbMode ? 'rgba(16,185,129,0.1)'  : colors.brandBg,
    amber: isGbMode ? 'rgba(245,158,11,0.1)'  : '#fefce8',
    red:   isGbMode ? 'rgba(239,68,68,0.1)'   : '#fee2e2',
  }
  const ac = accentColors[accent]
  const bg = accentBgs[accent]
  const isLongValue = value.length > 8

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...glassCard(colors, isGbMode),
        boxShadow: hov
          ? (isGbMode ? '0 4px 24px rgba(0,0,0,0.55)' : '0 8px 32px rgba(0,0,0,0.10)')
          : (isGbMode ? '0 1px 2px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.35)' : '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.07)'),
        transition: 'box-shadow 0.22s ease',
        padding: t.space[4],
        display: 'flex',
        flexDirection: 'column',
        gap: t.space[3],
        position: 'relative',
        overflow: 'hidden',
        borderTop: `2px solid ${ac}`,
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {isGbMode && (
        <div
          style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${ac}1a 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: t.space[2] }}>
        <div
          style={{
            width: 40, height: 40,
            borderRadius: t.radius.lg,
            background: bg,
            border: `1px solid ${ac}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={18} color={ac} />
        </div>
        <span
          style={{
            fontSize: t.font.size.xs,
            color: colors.textMuted,
            fontFamily: t.font.family.sans,
            fontWeight: t.font.weight.medium,
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
            textAlign: 'right' as const,
            lineHeight: 1.4,
          }}
        >
          {label}
        </span>
      </div>

      <div>
        <div
          style={{
            fontSize: isLongValue ? t.font.size.lg : t.font.size['3xl'],
            fontWeight: t.font.weight.bold,
            color: accent === 'green' ? (isGbMode ? '#4ade80' : ac) : ac,
            fontFamily: t.font.family.sans,
            lineHeight: 1.1,
            textShadow: isGbMode ? `0 0 24px ${ac}55` : undefined,
          }}
        >
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans, marginTop: t.space[1] }}>
            {sub}
          </div>
        )}
        {trend && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold,
            color: trendUp ? '#059669' : '#dc2626',
            background: trendUp ? '#f0fdf4' : '#fee2e2',
            borderRadius: t.radius.full,
            padding: `2px ${t.space[2]}px`,
            marginTop: t.space[1],
          }}>
            {trendUp ? '▲' : '▼'} {trend}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function PluvioBarChart({ colors, isGbMode }: { colors: ThemeColors; isGbMode: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null)

  const W = 760, H = 190, PL = 46, PT = 14, PR = 14, PB = 38
  const cW = W - PL - PR, cH = H - PT - PB
  const MAX_Y = 35, scaleY = cH / MAX_Y
  const groupW = cW / BAR_DATA.length
  const barW = 14, barGap = 3

  const green   = isGbMode ? '#10b981' : t.color.brand[600]
  const green2  = isGbMode ? '#34d399' : t.color.brand[700]
  const gray    = isGbMode ? 'rgba(28,63,44,0.75)' : '#e5e7eb'
  const grid    = isGbMode ? 'rgba(28,63,44,0.5)'  : '#f0f0f0'
  const axis    = isGbMode ? 'rgba(125,168,147,0.6)' : '#9ca3af'
  const baseY   = PT + cH

  const legend = (
    <div style={{ display: 'flex', gap: t.space[4] }}>
      {[
        { label: 'Dias com chuva', bg: green, border: undefined },
        { label: 'Dias sem chuva', bg: gray,  border: isGbMode ? 'rgba(28,63,44,0.9)' : '#d1d5db' },
      ].map(({ label, bg, border }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: bg, border: border ? `1px solid ${border}` : undefined }} />
          <span style={{ fontSize: t.font.size.xs, color: axis, fontFamily: t.font.family.sans }}>{label}</span>
        </div>
      ))}
    </div>
  )

  return (
    <ChartCard icon={BarChart2} title="Pluviometria (dias)" action={legend} colors={colors} isGbMode={isGbMode}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ maxHeight: H, display: 'block' }}>
        <defs>
          <linearGradient id="gbBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={green2} />
            <stop offset="100%" stopColor={green}  />
          </linearGradient>
          {isGbMode && (
            <filter id="barGlow" x="-30%" y="-50%" width="160%" height="200%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          )}
        </defs>

        {[0, 5, 10, 15, 20, 25, 30, 35].map(v => {
          const y = PT + cH - v * scaleY
          return (
            <g key={v}>
              <line x1={PL} y1={y} x2={W - PR} y2={y}
                stroke={grid} strokeWidth={v === 0 ? 1.5 : 0.5}
                strokeDasharray={v === 0 ? undefined : '4 3'} />
              <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={9} fill={axis} fontFamily="Outfit, sans-serif">{v}</text>
            </g>
          )
        })}

        {BAR_DATA.map((d, i) => {
          const cx   = PL + i * groupW + groupW / 2
          const gH   = Math.max(d.comChuva * scaleY, d.comChuva > 0 ? 3 : 0)
          const sH   = Math.max(d.semChuva * scaleY, d.semChuva > 0 ? 3 : 0)
          const isH  = hovered === i
          const dim  = hovered !== null && !isH
          const tip  = baseY - Math.max(gH, sH) - 60

          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'default' }}>
              <rect x={cx - barW - barGap / 2} y={baseY - gH} width={barW} height={gH} rx={4}
                fill={isGbMode ? 'url(#gbBar)' : green} opacity={dim ? 0.3 : 1}
                filter={isGbMode && isH ? 'url(#barGlow)' : undefined}
                style={{ transition: 'opacity 0.18s ease' }} />
              <rect x={cx + barGap / 2} y={baseY - sH} width={barW} height={sH} rx={4}
                fill={gray} opacity={dim ? 0.3 : 1}
                style={{ transition: 'opacity 0.18s ease' }} />
              <text x={cx} y={baseY + 16} textAnchor="middle" fontSize={9}
                fill={isH ? colors.brand : axis} fontFamily="Outfit, sans-serif"
                fontWeight={isH ? 600 : 400}
                style={{ transition: 'fill 0.15s ease' }}>{d.month}</text>

              {/* Tooltip — light style */}
              {isH && (
                <g>
                  <rect x={cx - 52} y={tip} width={104} height={50} rx={8}
                    fill={isGbMode ? '#0b1e14' : '#ffffff'}
                    stroke={isGbMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}
                    strokeWidth={1} />
                  <text x={cx} y={tip + 16} textAnchor="middle" fontSize={10}
                    fill={isGbMode ? green : '#111827'} fontFamily="Outfit, sans-serif" fontWeight={700}>
                    {d.month} 2025/26
                  </text>
                  <text x={cx - 5} y={tip + 32} textAnchor="end" fontSize={9}
                    fill={isGbMode ? '#4ade80' : t.color.brand[600]} fontFamily="Outfit, sans-serif">
                    ● {d.comChuva}d chuva
                  </text>
                  <text x={cx + 5} y={tip + 32} textAnchor="start" fontSize={9}
                    fill={isGbMode ? '#6b7280' : '#9ca3af'} fontFamily="Outfit, sans-serif">
                    ● {d.semChuva}d seco
                  </text>
                </g>
              )}
            </g>
          )
        })}

        <line x1={PL} y1={baseY + 1} x2={W - PR} y2={baseY + 1} stroke={grid} strokeWidth={1} />
        <text x={PL + 2.5 * groupW} y={H - 4} textAnchor="middle" fontSize={8} fill={`${axis}88`} fontFamily="Outfit, sans-serif">◀ Jun–Dez 2025</text>
        <text x={PL + 9 * groupW}   y={H - 4} textAnchor="middle" fontSize={8} fill={`${axis}88`} fontFamily="Outfit, sans-serif">Jan–Mai 2026 ▶</text>
      </svg>
    </ChartCard>
  )
}

// ─── Area Chart ───────────────────────────────────────────────────────────────

function VolumeAreaChart({ colors, isGbMode }: { colors: ThemeColors; isGbMode: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null)

  const W = 760, H = 170, PL = 50, PT = 14, PR = 14, PB = 30
  const cW = W - PL - PR, cH = H - PT - PB
  const MAX_Y = 250

  const pts = VOLUME_DATA.map((v, i) => ({
    x: PL + (i / (VOLUME_DATA.length - 1)) * cW,
    y: PT + cH - (v / MAX_Y) * cH,
    v,
  }))

  const linePath = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = pts[i - 1]
    const dx = (p.x - prev.x) / 3
    return `${acc} C ${prev.x + dx} ${prev.y}, ${p.x - dx} ${p.y}, ${p.x} ${p.y}`
  }, '')

  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${PT + cH} L ${pts[0].x} ${PT + cH} Z`

  const line   = isGbMode ? '#10b981' : t.color.brand[600]
  const grid   = isGbMode ? 'rgba(28,63,44,0.5)'    : '#f0f0f0'
  const axis   = isGbMode ? 'rgba(125,168,147,0.6)'  : '#9ca3af'

  const areaLegend = (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
      <TrendingUp size={14} color={line} />
      <div style={{ width: 24, height: 2.5, background: line, borderRadius: 2 }} />
      <span style={{ fontSize: t.font.size.xs, color: axis, fontFamily: t.font.family.sans }}>Realizado</span>
    </div>
  )

  return (
    <ChartCard icon={Activity} title="Volume Pluviométrico (mm)" action={areaLegend} colors={colors} isGbMode={isGbMode}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ maxHeight: H, display: 'block' }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={line} stopOpacity={isGbMode ? '0.4' : '0.2'} />
            <stop offset="75%"  stopColor={line} stopOpacity="0.03" />
            <stop offset="100%" stopColor={line} stopOpacity="0" />
          </linearGradient>
          {isGbMode && (
            <filter id="lineGlow" x="-10%" y="-100%" width="120%" height="300%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          )}
          {isGbMode && (
            <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          )}
        </defs>

        {[0, 50, 100, 150, 200, 250].map(v => {
          const y = PT + cH - (v / MAX_Y) * cH
          return (
            <g key={v}>
              <line x1={PL} y1={y} x2={W - PR} y2={y}
                stroke={grid} strokeWidth={v === 0 ? 1.5 : 0.5}
                strokeDasharray={v === 0 ? undefined : '4 3'} />
              <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={9} fill={axis} fontFamily="Outfit, sans-serif">
                {v === 0 ? '0' : v}
              </text>
            </g>
          )
        })}

        <path d={areaPath} fill="url(#areaFill)" />
        <path d={linePath} fill="none" stroke={line} strokeWidth={2.5} strokeLinejoin="round"
          filter={isGbMode ? 'url(#lineGlow)' : undefined} />

        {pts.map((p, i) => {
          const isH = hovered === i
          const tipY = p.y - 50
          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'default' }}>
              <circle cx={p.x} cy={p.y} r={isH ? 5 : 3}
                fill={line} stroke={isGbMode ? '#051008' : '#fff'} strokeWidth={1.5}
                filter={isGbMode && isH ? 'url(#dotGlow)' : undefined} />
              <text x={p.x} y={PT + cH + 18} textAnchor="middle" fontSize={8}
                fill={isH ? colors.brand : axis} fontFamily="Outfit, sans-serif">{VOLUME_LABELS[i]}</text>

              {isH && (
                <g>
                  <rect x={p.x - 42} y={tipY} width={84} height={40} rx={8}
                    fill={isGbMode ? '#0b1e14' : '#ffffff'}
                    stroke={isGbMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}
                    strokeWidth={1} />
                  <text x={p.x} y={tipY + 15} textAnchor="middle" fontSize={9} fill={line} fontFamily="Outfit, sans-serif" fontWeight={600}>{VOLUME_LABELS[i]}</text>
                  <text x={p.x} y={tipY + 31} textAnchor="middle" fontSize={12}
                    fill={isGbMode ? '#ffffff' : '#111827'} fontFamily="Outfit, sans-serif" fontWeight={700}>{p.v}mm</text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </ChartCard>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Pluviometria() {
  const { colors, isGbMode } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAreas, setSelectedAreas] = useState<string[]>(ALL_AREAS)
  const [dateStart, setDateStart] = useState('01/06/2025')
  const [dateEnd, setDateEnd] = useState('25/05/2026')
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const removeArea = (area: string) => setSelectedAreas(p => p.filter(a => a !== area))

  const handleClearFilters = () => {
    setDateStart('01/06/2025')
    setDateEnd('25/05/2026')
    setSelectedAreas(ALL_AREAS)
  }

  const activeCount =
    (dateStart !== '01/06/2025' ? 1 : 0) +
    (dateEnd !== '25/05/2026' ? 1 : 0) +
    (selectedAreas.length < ALL_AREAS.length ? 1 : 0)

  return (
    <div
      style={{
        padding: t.space[4],
        display: 'flex',
        flexDirection: 'column',
        gap: t.space[4],
        minHeight: '100%',
        boxSizing: 'border-box',
        fontFamily: t.font.family.sans,
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <PageHeader
        title="Pluviômetro"
        breadcrumb={
          <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
            Dashboards /{' '}
            <span style={{ color: colors.brand }}>Pluviometria</span>
          </span>
        }
        actions={
          <>
            {isGbMode && (
              <span style={{
                fontSize: t.font.size.xs,
                color: colors.brand,
                fontFamily: t.font.family.sans,
                background: colors.brandBg,
                border: `1px solid rgba(16,185,129,0.25)`,
                borderRadius: t.radius.full,
                padding: `${t.space[1]}px ${t.space[3]}px`,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
              }}>
                ● Open-Meteo Live
              </span>
            )}
            <Button icon={<Filter size={14} />} size="md" onClick={() => setFilterOpen(true)}>
              Filtros{activeCount > 0 ? ` (${activeCount})` : ''}
            </Button>
          </>
        }
      />

      {/* ── Filter Drawer ────────────────────────────────────────────── */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onClear={handleClearFilters}
        title="Filtros"
        activeCount={activeCount}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4] }}>
          <FormField
            label="Data início"
            type="text"
            value={dateStart}
            onChange={e => setDateStart(e.target.value)}
            placeholder="DD/MM/AAAA"
          />
          <FormField
            label="Data final"
            type="text"
            value={dateEnd}
            onChange={e => setDateEnd(e.target.value)}
            placeholder="DD/MM/AAAA"
          />
          <FormSelect
            label="Fazenda"
            options={[{ value: 'fazenda-araprata', label: 'Fazenda Araprata — Wilmar Alves Lima' }]}
          />
          <div>
            <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: t.color.neutral[700], fontFamily: t.font.family.sans, display: 'block', marginBottom: t.space[2] }}>
              Áreas ({selectedAreas.length}/{ALL_AREAS.length})
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: t.space[1] + 2 }}>
              {selectedAreas.map(area => (
                <div
                  key={area}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: t.space[1],
                    background: t.color.brand[50],
                    border: `1px solid ${t.color.brand[200]}`,
                    borderRadius: t.radius.full,
                    padding: `3px ${t.space[2]}px`,
                    fontSize: t.font.size.xs,
                    color: t.color.brand[700],
                    fontFamily: t.font.family.sans,
                    fontWeight: t.font.weight.medium,
                  }}
                >
                  {area}
                  <button
                    onClick={() => removeArea(area)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 14, height: 14,
                      border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                      color: 'inherit', opacity: 0.65, borderRadius: '50%',
                    }}
                    aria-label={`Remover ${area}`}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
            {selectedAreas.length < ALL_AREAS.length && (
              <button
                onClick={() => setSelectedAreas(ALL_AREAS)}
                style={{
                  marginTop: t.space[2],
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: t.font.size.xs,
                  color: t.color.brand[600],
                  fontFamily: t.font.family.sans,
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Selecionar todas
              </button>
            )}
          </div>
        </div>
      </FilterDrawer>

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[3] }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={120} />)}
        </div>
      ) : null}
      {!isLoading && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[3], alignItems: 'stretch' }}>
        <KpiCard
          icon={CloudRain}
          label="Acumulado (7 dias)"
          value="19.2mm"
          sub="Open-Meteo · Prata (MG)"
          trend="+3.4mm vs mês ant."
          trendUp
          accent="green"
          colors={colors}
          isGbMode={isGbMode}
        />
        <KpiCard
          icon={Droplets}
          label="Umidade do Solo"
          value="17%"
          sub="Open-Meteo · Prata (MG)"
          trend="-5% vs mês ant."
          trendUp={false}
          accent="green"
          colors={colors}
          isGbMode={isGbMode}
        />
        <KpiCard
          icon={CalendarDays}
          label="Próxima Chuva (>15mm)"
          value="Sem prev."
          sub="Open-Meteo · Prata (MG)"
          accent="amber"
          colors={colors}
          isGbMode={isGbMode}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Alertas Ativos"
          value="Déficit Hídrico"
          accent="red"
          colors={colors}
          isGbMode={isGbMode}
        />
      </div>}

      {/* ── Bar chart + Right panel ──────────────────────────────────── */}
      {isLoading ? (
        <Skeleton height={300} />
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 296px', gap: t.space[3], alignItems: 'stretch' }}>
        {/* Bar chart — ChartCard self-contained */}
        <PluvioBarChart colors={colors} isGbMode={isGbMode} />

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3], height: '100%' }}>
          {/* Alert */}
          <div
            style={{
              ...glassCard(colors, isGbMode),
              background: isGbMode ? 'rgba(180,120,0,0.07)' : '#fffbeb',
              padding: t.space[4],
              boxSizing: 'border-box',
            }}
          >
            <div style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: t.color.notification, fontFamily: t.font.family.sans, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: t.space[2] }}>
              Janela de Aplicação
            </div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: isGbMode ? '#fbbf24' : '#92400e', fontFamily: t.font.family.sans, marginBottom: t.space[2], textShadow: isGbMode ? '0 0 20px rgba(251,191,36,0.4)' : undefined }}>
              Atenção
            </div>
            <div style={{ fontSize: t.font.size.sm, color: isGbMode ? 'rgba(251,191,36,0.65)' : '#78350f', fontFamily: t.font.family.sans, lineHeight: 1.65, marginBottom: t.space[2] }}>
              Vento em 2.4km/h e probabilidade de chuva de 4% para as próximas 8 horas.
            </div>
            <div style={{ fontSize: t.font.size.xs, color: t.color.notification, fontFamily: t.font.family.sans, opacity: 0.65 }}>
              Fonte: Open-Meteo · Prata (MG)
            </div>
          </div>

          {/* Forecast */}
          <div style={{ ...glassCard(colors, isGbMode), padding: `${t.space[4]}px ${t.space[3]}px`, flex: 1, boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[1], paddingInline: t.space[1] }}>
              <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.textPrimary, fontFamily: t.font.family.sans }}>
                Previsão da Semana
              </span>
              <span style={{
                fontSize: t.font.size.xs,
                color: colors.brand,
                fontFamily: t.font.family.sans,
                background: colors.brandBg,
                borderRadius: t.radius.full,
                padding: `2px ${t.space[2]}px`,
              }}>
                Open-Meteo
              </span>
            </div>
            <div style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans, marginBottom: t.space[3], paddingInline: t.space[1] }}>
              Prata (MG)
            </div>

            {/* 7-day strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {FORECAST.map((f, i) => {
                const hasRain   = f.rain > 0
                const rainColor = isGbMode ? '#60a5fa' : '#3b82f6'
                const sunColor  = isGbMode ? '#6ee7b7' : '#d97706'
                const iconColor = hasRain ? rainColor : sunColor
                const isToday   = i === 0
                const DAY_ABBR  = ['Hoje', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

                return (
                  <div
                    key={f.day}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      padding: `${t.space[2]}px 0`,
                      borderRadius: t.radius.lg,
                      background: isToday
                        ? isGbMode ? 'rgba(16,185,129,0.10)' : 'rgba(5,150,105,0.07)'
                        : 'transparent',
                    }}
                  >
                    {/* Day label */}
                    <span style={{
                      fontSize: 10,
                      fontFamily: t.font.family.sans,
                      fontWeight: isToday ? t.font.weight.semibold : t.font.weight.normal,
                      color: isToday ? colors.brand : colors.textMuted,
                      letterSpacing: '0.03em',
                      lineHeight: 1,
                    }}>
                      {DAY_ABBR[i]}
                    </span>

                    {/* Weather icon */}
                    <WeatherIcon condition={f.condition} size={17} color={iconColor} />

                    {/* Max temp */}
                    <span style={{
                      fontSize: t.font.size.sm,
                      fontFamily: t.font.family.sans,
                      fontWeight: t.font.weight.semibold,
                      color: isToday
                        ? (isGbMode ? t.color.brand[400] : t.color.brand[600])
                        : colors.textPrimary,
                      lineHeight: 1,
                    }}>
                      {f.max}°
                    </span>

                    {/* Min temp */}
                    <span style={{
                      fontSize: 10,
                      fontFamily: t.font.family.sans,
                      color: colors.textMuted,
                      lineHeight: 1,
                    }}>
                      {f.min}°
                    </span>

                    {/* Rain indicator */}
                    <div style={{
                      height: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {hasRain ? (
                        <span style={{
                          fontSize: 9,
                          fontFamily: t.font.family.sans,
                          fontWeight: t.font.weight.semibold,
                          color: rainColor,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}>
                          <Droplets size={8} />
                          {f.rain}
                        </span>
                      ) : (
                        <span style={{ fontSize: 9, color: colors.borderSubtle, fontFamily: t.font.family.sans }}>—</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ── Volume area chart ────────────────────────────────────────── */}
      {isLoading ? (
        <Skeleton height={220} />
      ) : (
        <VolumeAreaChart colors={colors} isGbMode={isGbMode} />
      )}
    </div>
  )
}
