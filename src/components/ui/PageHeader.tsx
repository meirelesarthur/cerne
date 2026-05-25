import React from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  count?: number
}

export function PageHeader({ title, description, actions, count }: PageHeaderProps) {
  const { colors } = useTheme()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: t.space[2],
        marginBottom: t.space[5],
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] / 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          <span
            style={{
              fontSize: t.font.size.xl,
              fontWeight: t.font.weight.semibold,
              color: colors.textPrimary,
              fontFamily: t.font.family.sans,
              transition: 'color 0.2s',
            }}
          >
            {title}
          </span>
          {count !== undefined && (
            <span
              style={{
                background: colors.surfaceSubtle,
                color: colors.textSecondary,
                fontSize: t.font.size.xs,
                fontWeight: t.font.weight.medium,
                fontFamily: t.font.family.sans,
                padding: `2px ${t.space[2]}px`,
                borderRadius: t.radius.full,
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {count}
            </span>
          )}
        </div>
        {description && (
          <span
            style={{
              fontSize: t.font.size.sm,
              color: colors.textMuted,
              fontFamily: t.font.family.sans,
              transition: 'color 0.2s',
            }}
          >
            {description}
          </span>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          {actions}
        </div>
      )}
    </div>
  )
}
