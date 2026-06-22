import { type ReactNode } from 'react'
import { X } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { IconButton } from './IconButton'

interface FormPageHeaderProps {
  title:       string
  subtitle?:   string
  onBack:      () => void
  closeLabel?: string
  /** Conteúdo opcional alinhado à direita (ex.: status + botão Editar em telas de detalhe). */
  actions?:    ReactNode
  /** Espaçamento superior — alinha o título ao padrão das listagens (PageHeader). */
  paddingTop?: number
}

/**
 * Cabeçalho padrão de telas de cadastro e visualização: título + subtítulo à
 * esquerda e botão X de fechar no extremo direito. Fonte única do padrão —
 * não recriar headers inline nas páginas.
 */
export function FormPageHeader({
  title, subtitle, onBack, closeLabel = 'Fechar', actions, paddingTop,
}: FormPageHeaderProps) {
  const { colors } = useTheme()
  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        paddingTop:     paddingTop,
        marginBottom:   t.space[6],
        gap:            t.space[4],
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h1
          style={{
            margin:        0,
            fontSize:      t.font.size['2xl'],
            fontWeight:    t.font.weight.bold,
            color:         colors.fg.default,
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
              color:      colors.fg.subtle,
              fontFamily: t.font.family.sans,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[3], flexShrink: 0 }}>
        {actions}
        <IconButton
          icon={<X size={20} strokeWidth={2} />}
          onClick={onBack}
          aria-label={closeLabel}
        />
      </div>
    </div>
  )
}
