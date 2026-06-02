import { useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

// ─── KpiStatCard ───────────────────────────────────────────────────────────────
// Cartão de métrica estilo efferd: número grande + label + chip de tendência.

interface KpiStatCardProps {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  trend?: string
  trendUp?: boolean
  accentColor?: string
}

export function KpiStatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  trendUp,
  accentColor,
}: KpiStatCardProps) {
  const { colors, isGbMode } = useTheme()
  const [hov, setHov] = useState(false)
  const ac = accentColor ?? (isGbMode ? '#10b981' : t.color.brand[600])
  const isLong = value.length > 10

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: isGbMode ? 'rgba(14,42,29,0.55)' : colors.surfaceBg,
        backdropFilter: isGbMode ? 'blur(20px)' : undefined,
        WebkitBackdropFilter: isGbMode ? 'blur(20px)' : undefined,
        borderRadius: t.radius.xl,
        border: `1px solid ${hov ? `${ac}55` : colors.border}`,
        borderTop: `2px solid ${ac}`,
        boxShadow: hov
          ? (isGbMode
              ? '0 4px 24px rgba(0,0,0,0.55)'
              : '0 8px 32px rgba(0,0,0,0.10)')
          : (isGbMode
              ? '0 1px 2px rgba(0,0,0,0.30)'
              : '0 1px 2px rgba(0,0,0,0.04)'),
        transition: 'border-color 0.18s ease, box-shadow 0.22s ease',
        padding: t.space[4],
        display: 'flex',
        flexDirection: 'column',
        gap: t.space[2],
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box' as const,
      }}
    >
      {/* Glow blob (GB mode) */}
      {isGbMode && (
        <div
          style={{
            position: 'absolute',
            top: -24,
            right: -24,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${ac}20 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Icon + label row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: t.font.size.xs,
            color: colors.textMuted,
            fontFamily: t.font.family.sans,
            fontWeight: t.font.weight.medium,
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
            lineHeight: 1.4,
            maxWidth: 'calc(100% - 44px)',
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: t.radius.lg,
            background: `${ac}18`,
            border: `1px solid ${ac}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={17} color={ac} />
        </div>
      </div>

      {/* Value */}
      <span
        style={{
          fontSize: isLong ? t.font.size.lg : t.font.size['3xl'],
          fontWeight: t.font.weight.bold,
          color: isGbMode ? '#4ade80' : colors.textPrimary,
          fontFamily: t.font.family.sans,
          lineHeight: 1.1,
          textShadow: isGbMode ? `0 0 24px ${ac}55` : undefined,
        }}
      >
        {value}
      </span>

      {/* Sub text */}
      {sub && (
        <span
          style={{
            fontSize: t.font.size.xs,
            color: colors.textMuted,
            fontFamily: t.font.family.sans,
          }}
        >
          {sub}
        </span>
      )}

      {/* Trend chip */}
      {trend && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            fontSize: t.font.size.xs,
            fontWeight: t.font.weight.semibold,
            color: trendUp ? t.color.success.text : t.color.error.text,
            background: trendUp ? t.color.success.bg : t.color.error.bg,
            borderRadius: t.radius.full,
            padding: `2px ${t.space[2]}px`,
            width: 'fit-content',
          }}
        >
          {trendUp ? '▲' : '▼'} {trend}
        </div>
      )}
    </div>
  )
}
