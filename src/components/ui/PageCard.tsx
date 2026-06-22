import React from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface PageCardProps {
  children: React.ReactNode
  /**
   * Rodapé fixo na base do card (barra de ações de formulário, StepFooter…).
   * Quando ausente, todo o conteúdo rola junto (padrão de listagens).
   */
  footer?: React.ReactNode
  /**
   * Quando `true`, o slot do rodapé aplica apenas borda superior + padding
   * horizontal, deixando o nó do rodapé controlar o resto (ex.: `StepFooter`,
   * que já traz padding vertical e layout próprios). Default `false` → rodapé
   * em flex com padding e justificação.
   */
  footerBare?: boolean
  /** Justificação do rodapé padrão (ignorado quando `footerBare`). Default `space-between`. */
  footerJustify?: 'space-between' | 'flex-end'
}

/**
 * Casca padrão de telas de listagem e cadastro.
 *
 * Renderiza um card que preenche exatamente a altura da navegação secundária
 * (`calc(100vh - t.layout.contentOffset)`) com **scroll somente interno** — a
 * página não rola, apenas o corpo do card. Opcionalmente fixa um rodapé na base.
 *
 * Fonte única do padrão (Lei 2): ajustes de altura, sombra ou scroll feitos aqui
 * propagam para todas as telas. Não recriar este card inline nas páginas.
 *
 * Uso típico:
 * ```tsx
 * <PageContainer style={{ paddingBottom: 0 }}>
 *   <PageCard footer={<><Button>Cancelar</Button><Button>Salvar</Button></>}>
 *     <FormPageHeader … />
 *     … conteúdo …
 *   </PageCard>
 *   {/* overlays (ConfirmDialog, Modal, Toast, FilterDrawer) ficam FORA do card *​/}
 * </PageContainer>
 * ```
 */
export function PageCard({
  children,
  footer,
  footerBare = false,
  footerJustify = 'space-between',
}: PageCardProps) {
  const { colors, isGbMode } = useTheme()

  return (
    <div
      style={{
        background:    colors.bg.surface,
        borderRadius:  t.radius.xl,
        boxShadow:     isGbMode ? t.shadow.cardDark : t.shadow.card,
        display:       'flex',
        flexDirection: 'column',
        height:        `calc(100vh - ${t.layout.contentOffset}px)`,
        overflow:      'hidden',
        transition:    'background 0.2s',
      }}
    >
      {/* Corpo com scroll interno */}
      <div
        style={{
          flex:        1,
          overflowY:   'auto',
          padding:     `0 ${t.space[6]}px ${footer ? 0 : t.space[6]}px`,
        }}
      >
        {children}
      </div>

      {/* Rodapé fixo */}
      {footer && (
        <div
          style={
            footerBare
              ? {
                  padding:    `0 ${t.space[6]}px`,
                  borderTop:  `1px solid ${colors.border.subtle}`,
                  flexShrink: 0,
                }
              : {
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: footerJustify,
                  gap:            t.space[3],
                  padding:        `${t.space[3]}px ${t.space[6]}px`,
                  borderTop:      `1px solid ${colors.border.subtle}`,
                  flexShrink:     0,
                }
          }
        >
          {footer}
        </div>
      )}
    </div>
  )
}
