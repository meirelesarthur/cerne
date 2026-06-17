import React from 'react'
import { t } from '../../design/tokens'

interface PageContainerProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

/**
 * Wrapper padrão para todas as páginas do sistema.
 *
 * Não aplica recuo lateral: o card de conteúdo (`PageCard`/`Card`) encosta na
 * área útil, ficando a `t.space[2]` (8px) do submenu e das bordas do chassi —
 * o mesmo ritmo de 8px do `AppLayout`. O recuo do conteúdo vem do padding
 * interno do próprio card. Mantém apenas o respiro inferior para páginas que
 * rolam (telas com `PageCard` sobrescrevem com `paddingBottom: 0`).
 */
export function PageContainer({ children, style }: PageContainerProps) {
  return (
    <div
      style={{
        // Longhands (não o shorthand `padding`) para que o override
        // `paddingBottom: 0` das telas com PageCard funcione de forma confiável.
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: t.space[6],
        paddingLeft: 0,
        fontFamily: t.font.family.sans,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
