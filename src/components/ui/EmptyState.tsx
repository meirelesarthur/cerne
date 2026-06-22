import React from 'react'
import { FolderOpen, SearchX, AlertTriangle } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Button } from './Button'

type EmptyStateVariant = 'empty' | 'search' | 'error'

interface EmptyStateAction {
  label:   string
  onClick: () => void
}

interface EmptyStateProps {
  /** Tipo do estado: lista vazia, busca sem resultado, ou erro de carga */
  variant?:     EmptyStateVariant
  message?:     string
  description?: string
  /** Sobrescreve o ícone padrão da variante */
  icon?:        React.ReactNode
  /** Ação primária (ex.: "Cadastrar fazenda") */
  action?:      EmptyStateAction
  /** Em variant="error": handler do botão "Tentar novamente" */
  onRetry?:     () => void
  /** Mostra spinner no botão de retry enquanto recarrega */
  retrying?:    boolean
}

const defaults: Record<EmptyStateVariant, { icon: React.ReactNode; message: string }> = {
  empty:  { icon: <FolderOpen size={40} strokeWidth={1.5} />,    message: 'Nenhum registro encontrado.' },
  search: { icon: <SearchX size={40} strokeWidth={1.5} />,       message: 'Nenhum resultado para sua busca.' },
  error:  { icon: <AlertTriangle size={40} strokeWidth={1.5} />, message: 'Não foi possível carregar os dados.' },
}

export function EmptyState({
  variant = 'empty',
  message,
  description,
  icon,
  action,
  onRetry,
  retrying = false,
}: EmptyStateProps) {
  const { colors } = useTheme()
  const preset = defaults[variant]
  const isError = variant === 'error'

  return (
    <div
      role={isError ? 'alert' : undefined}
      aria-live={isError ? 'polite' : undefined}
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
          color:          isError ? t.color.feedback.error.text : colors.fg.subtle,
          opacity:        isError ? 0.9 : 0.65,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}
      >
        {icon ?? preset.icon}
      </div>

      {/* Mensagem principal */}
      <span
        style={{
          fontSize:   t.font.size.md,
          fontWeight: t.font.weight.medium,
          color:      colors.fg.muted,
          fontFamily: t.font.family.sans,
        }}
      >
        {message ?? preset.message}
      </span>

      {/* Descrição opcional */}
      {description && (
        <span
          style={{
            fontSize:   t.font.size.sm,
            color:      colors.fg.subtle,
            fontFamily: t.font.family.sans,
            maxWidth:   360,
            lineHeight: t.font.lineHeight.normal,
          }}
        >
          {description}
        </span>
      )}

      {/* Ações */}
      {(action || (isError && onRetry)) && (
        <div style={{ display: 'flex', gap: t.space[2], marginTop: t.space[1] }}>
          {isError && onRetry && (
            <Button variant="primary" onClick={onRetry} loading={retrying}>
              Tentar novamente
            </Button>
          )}
          {action && (
            <Button variant={isError && onRetry ? 'secondary' : 'primary'} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
