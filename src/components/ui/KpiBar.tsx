import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

export interface KpiItem {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  trendLabel?: string
}

interface KpiBarProps {
  items: KpiItem[]
}

export function KpiBar({ items }: KpiBarProps) {
  const { colors, isGbMode } = useTheme()
  const cardBg = isGbMode ? 'rgba(255,255,255,0.04)' : colors.surfaceBg
  const border  = colors.border

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        gap: 1,
        border: `1px solid ${border}`,
        borderRadius: t.radius.lg,
        overflow: 'hidden',
        marginBottom: t.space[4],
      }}
    >
      {items.map((item, idx) => (
        <div
          key={item.label}
          style={{
            padding: `${t.space[4]}px ${t.space[5]}px`,
            background: cardBg,
            borderRight: idx < items.length - 1 ? `1px solid ${border}` : undefined,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <span style={{
            fontSize: t.font.size.xs,
            fontWeight: t.font.weight.medium,
            color: colors.textMuted,
            fontFamily: t.font.family.sans,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {item.label}
          </span>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: t.font.size['3xl'],
              fontWeight: t.font.weight.bold,
              color: colors.textPrimary,
              fontFamily: t.font.family.sans,
              lineHeight: 1,
            }}>
              {item.value}
            </span>

            {item.trendValue && (
              <span
                title={item.trendLabel}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: t.font.size.xs,
                  fontWeight: t.font.weight.semibold,
                  color: item.trend === 'up'
                    ? t.color.success.text
                    : item.trend === 'down'
                      ? t.color.error.text
                      : colors.textMuted,
                  background: item.trend === 'up'
                    ? t.color.success.bg
                    : item.trend === 'down'
                      ? t.color.error.bg
                      : colors.surfaceSubtle,
                  padding: '2px 6px',
                  borderRadius: t.radius.full,
                  cursor: item.trendLabel ? 'help' : undefined,
                }}>
                {item.trend === 'up'   && <TrendingUp  size={10} />}
                {item.trend === 'down' && <TrendingDown size={10} />}
                {item.trendValue}
              </span>
            )}

            {item.sub && (
              <span style={{
                fontSize: t.font.size.sm,
                color: colors.textMuted,
                fontFamily: t.font.family.sans,
              }}>
                {item.sub}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
