import { ArrowLeft } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Button } from './Button'

interface FormPageHeaderProps {
  title:     string
  subtitle?: string
  onBack:    () => void
  backLabel?: string
}

/**
 * Cabeçalho padrão de telas de formulário: título + subtítulo à esquerda e
 * botão "Voltar" à direita, com divisória inferior. Unifica o padrão (a) que
 * estava replicado inline em ProdutoForm, ArmazemForm, EmbalagemCadastro, etc.
 */
export function FormPageHeader({ title, subtitle, onBack, backLabel = 'Voltar' }: FormPageHeaderProps) {
  const { colors } = useTheme()
  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   t.space[6],
        paddingBottom:  t.space[4],
        borderBottom:   `1px solid ${colors.border}`,
        gap:            t.space[4],
      }}
    >
      <div>
        <h1
          style={{
            margin:     0,
            fontSize:   t.font.size['2xl'],
            fontWeight: t.font.weight.bold,
            color:      colors.textPrimary,
            fontFamily: t.font.family.sans,
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
      <Button variant="secondary" size="sm" icon={<ArrowLeft size={13} />} onClick={onBack}>
        {backLabel}
      </Button>
    </div>
  )
}
