import React from 'react'
import { t } from '../../design/tokens'
import { Spinner } from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant
  size?:      ButtonSize
  loading?:   boolean
  icon?:      React.ReactNode
  iconRight?: React.ReactNode
  block?:     boolean
  children:   React.ReactNode
}

const variantBase: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: t.color.brand[600],
    color: t.color.neutral[0],
  },
  secondary: {
    background: t.color.neutral[0],
    color: t.color.neutral[800],
  },
  destructive: {
    background: t.color.neutral[0],
    color: t.color.feedback.error.text,
  },
  ghost: {
    background: 'transparent',
    color: t.color.neutral[600],
  },
}

// Contorno desenhado POR FORA da caixa (box-shadow, não `border`): a altura
// interna fica idêntica à do primary e o contorno não consome espaço de layout,
// então botões preenchidos e contornados alinham perfeitamente lado a lado.
const RING_W = 1.5
const variantRing: Partial<Record<ButtonVariant, string>> = {
  secondary:   t.color.neutral[250],
  destructive: t.color.feedback.error.bg,
}

const variantHover: Record<ButtonVariant, string> = {
  primary:     t.color.brand[700],
  secondary:   t.color.neutral[50],
  destructive: t.color.feedback.error.bg,
  ghost:       t.color.neutral[100],
}

const sizeStyle: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: t.size.btn.sm, padding: `0 ${t.space[3]}px`, fontSize: t.font.size.sm },
  md: { height: t.size.btn.md, padding: `0 ${t.space[4]}px`, fontSize: t.font.size.base },
  lg: { height: t.size.btn.lg, padding: `0 ${t.space[5]}px`, fontSize: t.font.size.md },
}

export function Button({
  variant = 'primary',
  size    = 'md',
  loading = false,
  block   = false,
  icon,
  iconRight,
  children,
  style,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const base       = variantBase[variant]
  const sz         = sizeStyle[size]
  const isDisabled = disabled || loading

  const justify = block && iconRight ? 'space-between' : block ? 'flex-start' : 'center'

  return (
    <button
      {...props}
      className={['gb-focusable', className].filter(Boolean).join(' ')}
      disabled={isDisabled}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: justify,
        width:          block ? '100%' : undefined,
        gap: t.space[1] + t.space[1] / 2,
        borderRadius: t.radius.base,
        fontFamily: t.font.family.sans,
        fontWeight: t.font.weight.semibold,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
        transition: `background ${t.transition.base}, opacity ${t.transition.base}`,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        border: 'none',
        boxShadow: variantRing[variant] ? `0 0 0 ${RING_W}px ${variantRing[variant]}` : undefined,
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
      {loading
        ? <Spinner size="sm" />
        : icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
      {!loading && iconRight && (
        <span style={{ display: 'flex', alignItems: 'center' }}>{iconRight}</span>
      )}
    </button>
  )
}
