import React from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface PageHeaderProps {
  title:        string
  description?: string
  actions?:     React.ReactNode
  count?:       number
  breadcrumb?:  React.ReactNode
}

export function PageHeader({ title, description, actions, count, breadcrumb }: PageHeaderProps) {
  const { colors } = useTheme()

  return (
    <div
      style={{
        paddingTop:    t.space[4],
        paddingBottom: t.space[4],
        marginBottom:  t.space[2],
      }}
    >
      {breadcrumb && (
        <div style={{ marginBottom: t.space[2] }}>{breadcrumb}</div>
      )}
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] / 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          <h1
            style={{
              margin: 0,
              fontSize: t.font.size['2xl'],
              fontWeight: t.font.weight.bold,
              color: colors.fg.default,
              fontFamily: t.font.family.sans,
              lineHeight: 1.2,
              transition: 'color 0.2s',
            }}
          >
            {title}
          </h1>
          {count !== undefined && (
            <span
              style={{
                background: colors.bg.subtle,
                color: colors.fg.subtle,
                fontSize: t.font.size.sm,
                fontWeight: t.font.weight.medium,
                fontFamily: t.font.family.sans,
                padding: `2px 7px`,
                borderRadius: t.radius.md,
                lineHeight: 1.6,
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
              color: colors.fg.subtle,
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
    </div>
  )
}
