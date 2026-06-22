import React from 'react'
import { X } from 'lucide-react'
import { t } from '../../design/tokens'

type TagVariant = 'neutral' | 'brand' | 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'cyan'

interface TagProps {
  label:     string
  variant?:  TagVariant
  icon?:     React.ReactNode
  onRemove?: () => void
}

const variantStyle: Record<TagVariant, { bg: string; color: string }> = {
  neutral: { bg: t.color.neutral[100],  color: t.color.neutral[700] },
  brand:   { bg: t.color.brand[50],     color: t.color.brand[700]   },
  success: { bg: t.color.feedback.success.bg,    color: t.color.feedback.success.text },
  danger:  { bg: t.color.feedback.error.bg,      color: t.color.feedback.error.text   },
  warning: { bg: t.color.feedback.warning.bg,    color: t.color.feedback.warning.text },
  info:    { bg: t.color.feedback.info.bg,       color: t.color.feedback.info.text    },
  purple:  { bg: t.color.accent.purple.bg,     color: t.color.accent.purple.text  },
  cyan:    { bg: t.color.accent.cyan.bg,       color: t.color.accent.cyan.text    },
}

/**
 * Chip/etiqueta genérico para categorização e metadados. Diferente do
 * `FilterChip` (que é específico de filtros de tabela). Suporta ícone à
 * esquerda e botão de remoção opcional.
 */
export function Tag({ label, variant = 'neutral', icon, onRemove }: TagProps) {
  const s = variantStyle[variant]
  return (
    <span
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          t.space[1],
        background:   s.bg,
        color:        s.color,
        fontSize:     t.font.size.xs,
        fontWeight:   t.font.weight.semibold,
        fontFamily:   t.font.family.sans,
        padding:      `${t.space[1]}px ${t.space[2]}px`,
        borderRadius: t.radius.full,
        lineHeight:   1,
        whiteSpace:   'nowrap',
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }} aria-hidden="true">{icon}</span>}
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover ${label}`}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            background:     'none',
            border:         'none',
            cursor:         'pointer',
            color:          'inherit',
            opacity:        0.7,
            padding:        0,
            marginLeft:     t.space[1] / 2,
            borderRadius:   t.radius.full,
            lineHeight:     1,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7' }}
        >
          <X size={11} />
        </button>
      )}
    </span>
  )
}
