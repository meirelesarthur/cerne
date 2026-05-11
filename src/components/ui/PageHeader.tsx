import React from 'react'
import { t } from '../../design/tokens'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  count?: number
}

export function PageHeader({ title, description, actions, count }: PageHeaderProps) {
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
              color: t.color.neutral[800],
              fontFamily: t.font.family.sans,
            }}
          >
            {title}
          </span>
          {count !== undefined && (
            <span
              style={{
                background: t.color.neutral[100],
                color: t.color.neutral[500],
                fontSize: t.font.size.xs,
                fontWeight: t.font.weight.medium,
                fontFamily: t.font.family.sans,
                padding: `2px ${t.space[2]}px`,
                borderRadius: t.radius.full,
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
              color: t.color.neutral[400],
              fontFamily: t.font.family.sans,
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
