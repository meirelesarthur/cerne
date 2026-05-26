import React from 'react'
import { t } from '../../design/tokens'

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

const variantBase: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: t.color.brand[600],
    color: t.color.neutral[0],
    border: 'none',
  },
  secondary: {
    background: t.color.neutral[0],
    color: t.color.neutral[800],
    border: `1.5px solid ${t.color.neutral[250]}`,
  },
  destructive: {
    background: t.color.neutral[0],
    color: t.color.error.text,
    border: `1.5px solid ${t.color.error.bg}`,
  },
  ghost: {
    background: 'transparent',
    color: t.color.neutral[600],
    border: 'none',
  },
}

const variantHover: Record<ButtonVariant, string> = {
  primary:     t.color.brand[700],
  secondary:   t.color.neutral[50],
  destructive: t.color.error.bg,
  ghost:       t.color.neutral[100],
}

const sizeStyle: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: 32,  padding: `0 ${t.space[3]}px`, fontSize: t.font.size.sm },
  md: { height: 36,  padding: `0 ${t.space[4]}px`, fontSize: t.font.size.base },
  lg: { height: 44,  padding: `0 ${t.space[5]}px`, fontSize: t.font.size.md },
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const base = variantBase[variant]
  const sz = sizeStyle[size]
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.space[1] + t.space[1] / 2,
        borderRadius: t.radius.DEFAULT,
        fontFamily: t.font.family.sans,
        fontWeight: t.font.weight.semibold,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
        transition: `background ${t.transition.DEFAULT}, opacity ${t.transition.DEFAULT}`,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...base,
        ...sz,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) e.currentTarget.style.background = variantHover[variant]
        props.onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) e.currentTarget.style.background = base.background as string
        props.onMouseLeave?.(e)
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {loading ? 'Aguarde...' : children}
    </button>
  )
}
