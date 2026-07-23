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
  /** Tamanho do valor principal — default aplica degraus graduais conforme o
   *  comprimento do texto (ver `defaultValueSize`). Informe para forçar um
   *  tamanho fixo (ex.: padronizar todos os cards de um dashboard). */
  valueSize?: keyof typeof t.font.size
}

/** Degraus graduais de tamanho do valor — número sempre grande e legível,
 *  nunca dois tamanhos diferentes para o mesmo comprimento de string. */
function defaultValueSize(value: string): keyof typeof t.font.size {
  if (value.length > 16) return 'xl'
  if (value.length > 10) return '2xl'
  return '3xl'
}

export function KpiStatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  trendUp,
  accentColor,
  valueSize,
}: KpiStatCardProps) {
  const { colors, isGbMode } = useTheme()
  const [hov, setHov] = useState(false)
  const ac = accentColor ?? (isGbMode ? t.color.brand[500] : t.color.brand[600])
  const resolvedValueSize = valueSize ?? defaultValueSize(value)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: isGbMode ? t.color.gb.surface : colors.bg.surface,
        backdropFilter: isGbMode ? 'blur(20px)' : undefined,
        WebkitBackdropFilter: isGbMode ? 'blur(20px)' : undefined,
        borderRadius: t.radius.xl,
        border: `1px solid ${hov ? `${ac}55` : colors.border.default}`,
        borderTop: `2px solid ${ac}`,
        boxShadow: hov
          ? (isGbMode ? t.shadow.cardDarkHover : t.shadow.cardHover)
          : (isGbMode ? t.shadow.cardDark     : t.shadow.card),
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
            color: colors.fg.subtle,
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
          <Icon size={t.icon.md} color={ac} />
        </div>
      </div>

      {/* Value */}
      <span
        style={{
          fontSize: t.font.size[resolvedValueSize],
          fontWeight: t.font.weight.bold,
          color: isGbMode ? t.color.gb.accent : colors.fg.default,
          fontFamily: t.font.family.sans,
          lineHeight: t.font.lineHeight.tight,
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
            color: colors.fg.subtle,
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
            color: trendUp ? t.color.feedback.success.text : t.color.feedback.error.text,
            background: trendUp ? t.color.feedback.success.bg : t.color.feedback.error.bg,
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
