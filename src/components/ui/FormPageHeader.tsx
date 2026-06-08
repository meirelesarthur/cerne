import { type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { IconButton } from './IconButton'

interface FormPageHeaderProps {
  title:      string
  subtitle?:  string
  onBack:     () => void
  backLabel?: string
  /** Conteúdo opcional alinhado à direita (ex.: status + botão Editar em telas de detalhe). */
  actions?:   ReactNode
}

/**
 * Cabeçalho padrão de telas de cadastro e visualização: seta "voltar" à
 * esquerda, título + subtítulo ao lado e, opcionalmente, ações à direita.
 * Fonte única do padrão — não recriar headers inline nas páginas.
 */
export function FormPageHeader({ title, subtitle, onBack, backLabel = 'Voltar', actions }: FormPageHeaderProps) {
  const { colors } = useTheme()
  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   t.space[6],
        gap:            t.space[4],
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[3], minWidth: 0 }}>
        <IconButton
          icon={<ArrowLeft size={20} strokeWidth={2} />}
          onClick={onBack}
          aria-label={backLabel}
        />
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin:        0,
              fontSize:      t.font.size['2xl'],
              fontWeight:    t.font.weight.bold,
              color:         colors.textPrimary,
              fontFamily:    t.font.family.sans,
              letterSpacing: '-0.3px',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                margin:     `${t.space[1]}px 0 0`,
                fontSize:   t.font.size.sm,
                color:      colors.textMuted,
                fontFamily: t.font.family.sans,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[3], flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  )
}
