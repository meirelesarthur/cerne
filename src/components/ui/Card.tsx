import React from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

type ShadowKey  = 'sm' | 'DEFAULT' | 'md' | 'lg' | 'none'
type RadiusKey  = 'md' | 'lg' | 'xl' | '2xl'

interface CardProps {
  children:  React.ReactNode
  padding?:  number
  shadow?:   ShadowKey
  border?:   boolean
  radius?:   RadiusKey
  className?: string
  style?:    React.CSSProperties
  onClick?:  () => void
}

const shadowValues: Record<ShadowKey, string> = {
  sm:      t.shadow.sm,
  DEFAULT: t.shadow.base,
  md:      t.shadow.md,
  lg:      t.shadow.lg,
  none:    'none',
}

const radiusValues: Record<RadiusKey, number> = {
  md:  t.radius.md,
  lg:  t.radius.lg,
  xl:  t.radius.xl,
  '2xl': t.radius['2xl'],
}

export function Card({
  children,
  padding  = t.space[5],
  shadow   = 'DEFAULT',
  border   = true,
  radius   = 'xl',
  className,
  style,
  onClick,
}: CardProps) {
  const { colors } = useTheme()

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background:   colors.bg.surface,
        borderRadius: radiusValues[radius],
        boxShadow:    shadowValues[shadow],
        border:       border ? `1px solid ${colors.border.default}` : 'none',
        padding:      padding,
        cursor:       onClick ? 'pointer' : undefined,
        boxSizing:    'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
