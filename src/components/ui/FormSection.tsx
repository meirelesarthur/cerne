import React from 'react'
import { t } from '../../design/tokens'

interface FormSectionProps {
  title: string
  subtitle?: string
  columns?: 1 | 2 | 3
  children: React.ReactNode
}

export function FormSection({ title, subtitle, columns = 1, children }: FormSectionProps) {
  return (
    <div style={{ marginBottom: t.space[6] }}>
      <div
        style={{
          fontSize: t.font.size.base,
          fontWeight: t.font.weight.semibold,
          color: t.color.neutral[800],
          fontFamily: t.font.family.sans,
          paddingBottom: t.space[2] + t.space[1] / 2,
          borderBottom: `1px solid ${t.color.neutral[150]}`,
          marginBottom: subtitle ? t.space[1] : 0,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: t.font.size.sm,
            color: t.color.neutral[400],
            fontFamily: t.font.family.sans,
          }}
        >
          {subtitle}
        </div>
      )}
      <div
        style={{
          paddingTop: t.space[4],
          display: columns > 1 ? 'grid' : 'block',
          gridTemplateColumns: columns === 2 ? '1fr 1fr' : columns === 3 ? '1fr 1fr 1fr' : undefined,
          gap: columns > 1 ? t.space[4] : undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}
