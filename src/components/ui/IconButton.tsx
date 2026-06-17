import React, { useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

type IconButtonSize    = 'xs' | 'sm' | 'md'
type IconButtonVariant = 'ghost' | 'outline' | 'subtle'

interface IconButtonProps {
  icon:       React.ReactNode
  onClick?:   () => void
  size?:      IconButtonSize
  variant?:   IconButtonVariant
  tooltip?:   string
  disabled?:  boolean
  danger?:    boolean
  'aria-label': string
}

const sizeValues: Record<IconButtonSize, number> = {
  xs: t.size.iconBtn.sm,
  sm: t.size.iconBtn.md,
  md: t.size.iconBtn.lg,
}

export function IconButton({
  icon,
  onClick,
  size    = 'sm',
  variant = 'ghost',
  tooltip,
  disabled = false,
  danger   = false,
  'aria-label': ariaLabel,
}: IconButtonProps) {
  const { colors } = useTheme()
  const [hovered, setHovered] = useState(false)

  const dim = sizeValues[size]

  const hoverBg: Record<IconButtonVariant, string> = {
    ghost:   danger ? t.color.error.bg   : colors.surfaceSubtle,
    outline: danger ? t.color.error.bg   : colors.surfaceSubtle,
    subtle:  danger ? t.color.error.bg   : colors.surfaceBg,
  }

  const defaultBg: Record<IconButtonVariant, string> = {
    ghost:   'transparent',
    outline: 'transparent',
    subtle:  colors.surfaceSubtle,
  }

  const defaultColor = danger ? t.color.error.text : colors.textSecondary
  const hoverColor   = danger ? t.color.error.text : colors.textPrimary

  return (
    <button
      type="button"
      className="gb-focusable"
      onClick={disabled ? undefined : onClick}
      aria-label={ariaLabel}
      title={tooltip}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          dim,
        height:         dim,
        borderRadius:   t.radius.md,
        border:         variant === 'outline'
          ? `1px solid ${hovered && !disabled ? (danger ? t.color.error.border : colors.border) : colors.border}`
          : 'none',
        background:     disabled ? 'transparent' : (hovered ? hoverBg[variant] : defaultBg[variant]),
        color:          disabled ? colors.textMuted : (hovered ? hoverColor : defaultColor),
        cursor:         disabled ? 'not-allowed' : 'pointer',
        opacity:        disabled ? 0.45 : 1,
        transition:     `background ${t.transition.fast}, color ${t.transition.fast}`,
        padding:        0,
        boxSizing:      'border-box',
        flexShrink:     0,
      }}
    >
      {icon}
    </button>
  )
}
