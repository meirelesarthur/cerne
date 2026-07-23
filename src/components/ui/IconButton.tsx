import React, { useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

type IconButtonSize    = 'xs' | 'sm' | 'md'
type IconButtonVariant = 'ghost' | 'outline' | 'subtle'

interface IconButtonProps {
  icon:       React.ReactNode
  onClick?:   () => void
  /**
   * Mapeia para `t.size.iconBtn.{sm,md,lg}` (28/34/40px) — a escala NÃO
   * corresponde à de `Button` (`sm|md|lg` → 36/40/44px). Mesmo nome de token
   * de tamanho, alvos diferentes; confira `sizeValues` abaixo ao alinhar
   * visualmente um `IconButton` ao lado de um `Button`. Todas as três
   * variantes já superam o hit target mínimo de 24px em desktop.
   */
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

// Tamanho do ícone interno proporcional ao tamanho do botão — evita ícone
// desproporcional (grande demais/pequeno demais) dentro do hit target.
// Só se aplica quando o elemento passado em `icon` ainda não define seu
// próprio `size` explicitamente (Lei 2: extensão com default que preserva o
// comportamento atual dos call sites existentes).
const iconSizeValues: Record<IconButtonSize, number> = {
  xs: t.icon.xs,
  sm: t.icon.sm,
  md: t.icon.md,
}

function withDefaultIconSize(icon: React.ReactNode, size: IconButtonSize): React.ReactNode {
  if (!React.isValidElement(icon)) return icon
  const props = icon.props as { size?: unknown }
  if (props?.size !== undefined) return icon
  return React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
    size: iconSizeValues[size],
  })
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
    ghost:   danger ? t.color.feedback.error.bg   : colors.bg.subtle,
    outline: danger ? t.color.feedback.error.bg   : colors.bg.subtle,
    subtle:  danger ? t.color.feedback.error.bg   : colors.bg.surface,
  }

  const defaultBg: Record<IconButtonVariant, string> = {
    ghost:   'transparent',
    outline: 'transparent',
    subtle:  colors.bg.subtle,
  }

  const defaultColor = danger ? t.color.feedback.error.text : colors.fg.muted
  const hoverColor   = danger ? t.color.feedback.error.text : colors.fg.default

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
          ? `1px solid ${hovered && !disabled ? (danger ? t.color.feedback.error.border : colors.border.default) : colors.border.default}`
          : 'none',
        background:     disabled ? 'transparent' : (hovered ? hoverBg[variant] : defaultBg[variant]),
        color:          disabled ? colors.fg.subtle : (hovered ? hoverColor : defaultColor),
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
