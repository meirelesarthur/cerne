import React from 'react'
import { FolderOpen } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface EmptyStateAction {
  label:   string
  onClick: () => void
}

interface EmptyStateProps {
  message?:     string
  description?: string
  icon?:        React.ReactNode
  action?:      EmptyStateAction
}

export function EmptyState({
  message     = 'Nenhum registro encontrado.',
  description,
  icon,
  action,
}: EmptyStateProps) {
  const { colors, isGbMode } = useTheme()

  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        `${t.space[8]}px ${t.space[4]}px`,
        gap:            t.space[3],
        textAlign:      'center',
      }}
    >
      {/* Ícone */}
      <div
        style={{
          color:        colors.textMuted,
          opacity:      0.65,
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
        }}
      >
        {icon ?? <FolderOpen size={40} strokeWidth={1.5} />}
      </div>

      {/* Mensagem principal */}
      <span
        style={{
          fontSize:   t.font.size.md,
          fontWeight: t.font.weight.medium,
          color:      colors.textSecondary,
          fontFamily: t.font.family.sans,
        }}
      >
        {message}
      </span>

      {/* Descrição opcional */}
      {description && (
        <span
          style={{
            fontSize:   t.font.size.sm,
            color:      colors.textMuted,
            fontFamily: t.font.family.sans,
            maxWidth:   360,
            lineHeight: t.font.lineHeight.normal,
          }}
        >
          {description}
        </span>
      )}

      {/* Ação opcional */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          style={{
            marginTop:    t.space[1],
            height:       36,
            padding:      `0 ${t.space[4]}px`,
            borderRadius: t.radius.DEFAULT,
            border:       `1.5px solid ${isGbMode ? t.color.brand[500] : t.color.brand[600]}`,
            background:   'transparent',
            color:        isGbMode ? t.color.brand[400] : t.color.brand[600],
            fontSize:     t.font.size.base,
            fontWeight:   t.font.weight.semibold,
            fontFamily:   t.font.family.sans,
            cursor:       'pointer',
            transition:   `background ${t.transition.DEFAULT}, color ${t.transition.DEFAULT}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = t.color.brand[600]
            e.currentTarget.style.color      = t.color.neutral[0]
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color      = isGbMode ? t.color.brand[400] : t.color.brand[600]
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
