import React from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface StepHeaderProps {
  title: string
  subtitle: string
}

export function StepHeader({ title, subtitle }: StepHeaderProps) {
  const { colors } = useTheme()

  return (
    <div style={{ textAlign: 'center', marginBottom: t.space[8] }}>
      <h2
        style={{
          fontSize: t.font.size['2xl'],
          fontWeight: t.font.weight.bold,
          color: colors.textPrimary,
          fontFamily: t.font.family.sans,
          margin: `0 0 ${t.space[2]}px`,
          letterSpacing: '-0.4px',
          lineHeight: t.font.lineHeight.tight,
          transition: 'color 0.2s',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: t.font.size.base,
          color: colors.textMuted,
          fontFamily: t.font.family.sans,
          margin: 0,
          lineHeight: t.font.lineHeight.normal,
          transition: 'color 0.2s',
        }}
      >
        {subtitle}
      </p>
    </div>
  )
}
