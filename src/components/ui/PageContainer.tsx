import React from 'react'
import { t } from '../../design/tokens'

interface PageContainerProps {
  children: React.ReactNode
}

/**
 * Wrapper padrão para todas as páginas do sistema.
 * Garante padding consistente sem configurar por tela.
 */
export function PageContainer({ children }: PageContainerProps) {
  return (
    <div
      style={{
        padding: `0 ${t.space[6]}px ${t.space[6]}px`,
        fontFamily: t.font.family.sans,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  )
}
