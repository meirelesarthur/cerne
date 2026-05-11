import React from 'react'
import { t } from '../../design/tokens'

interface StepHeaderProps {
  title: string
  subtitle: string
}

export function StepHeader({ title, subtitle }: StepHeaderProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        marginBottom: t.space[8],
      }}
    >
      <h2
        style={{
          fontSize: t.font.size['2xl'],
          fontWeight: t.font.weight.bold,
          color: t.color.neutral[900],
          fontFamily: t.font.family.sans,
          margin: `0 0 ${t.space[2]}px`,
          letterSpacing: '-0.4px',
          lineHeight: t.font.lineHeight.tight,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: t.font.size.base,
          color: t.color.neutral[400],
          fontFamily: t.font.family.sans,
          margin: 0,
          lineHeight: t.font.lineHeight.normal,
        }}
      >
        {subtitle}
      </p>
    </div>
  )
}
