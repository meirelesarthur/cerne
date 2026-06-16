import React from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { ToggleSwitch } from './ToggleSwitch'

interface ToggleSectionProps {
  /** Título da seção (ex.: "Funcionário"). */
  title:        string
  /** Texto de apoio sob o título. */
  description?: string
  /** Ícone decorativo à esquerda do título. */
  icon?:        React.ReactNode
  /** Estado de ativação — quando `false`, o corpo fica oculto. */
  active:       boolean
  onToggle:     (v: boolean) => void
  /** Desabilita o toggle (ex.: limite de plano atingido). */
  disabled?:    boolean
  /** Mensagem exibida no corpo quando a seção está inativa. */
  inactiveHint?: string
  /** Conteúdo extra à direita do cabeçalho, antes do toggle (ex.: Badge). */
  headerExtra?: React.ReactNode
  children:     React.ReactNode
}

/**
 * Seção de formulário ativada por um toggle no cabeçalho. Diferente do
 * `CollapsibleSection` (que apenas colapsa conteúdo sempre presente), o
 * `ToggleSection` representa a **ativação de um papel/sub-formulário opcional**:
 * quando inativo, os campos são ocultados (não apenas recolhidos), evitando a
 * confusão do legado em que campos escondidos permaneciam no DOM.
 *
 * Suporta os dois temas (light/GBMode) e tokeniza todos os valores visuais.
 */
export function ToggleSection({
  title, description, icon, active, onToggle, disabled = false,
  inactiveHint, headerExtra, children,
}: ToggleSectionProps) {
  const { colors } = useTheme()

  return (
    <div style={{
      border:       `1px solid ${active ? colors.brand : colors.border}`,
      borderRadius: t.radius.lg,
      overflow:     'hidden',
      marginBottom: t.space[3],
      transition:   `border-color ${t.transition.smooth}`,
    }}>
      {/* Cabeçalho */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        gap:            t.space[3],
        padding:        `${t.space[3]}px ${t.space[4]}px`,
        background:     active ? colors.surfaceSubtle : colors.surfaceBg,
        borderBottom:   active ? `1px solid ${colors.border}` : 'none',
        transition:     `background ${t.transition.smooth}`,
      }}>
        {icon && (
          <span aria-hidden="true" style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          t.space[8],
            height:         t.space[8],
            borderRadius:   t.radius.DEFAULT,
            background:     active ? colors.brandBg : colors.surfaceSubtle,
            color:          active ? colors.brand : colors.textMuted,
            flexShrink:     0,
            transition:     `background ${t.transition.smooth}, color ${t.transition.smooth}`,
          }}>
            {icon}
          </span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize:   t.font.size.md,
            fontWeight: t.font.weight.semibold,
            color:      disabled ? colors.textMuted : colors.textPrimary,
            fontFamily: t.font.family.sans,
          }}>
            {title}
          </div>
          {description && (
            <div style={{
              fontSize:   t.font.size.xs,
              color:      colors.textMuted,
              fontFamily: t.font.family.sans,
              marginTop:  2,
            }}>
              {description}
            </div>
          )}
        </div>
        {headerExtra}
        <ToggleSwitch checked={active} onChange={onToggle} disabled={disabled} />
      </div>

      {/* Corpo */}
      {active ? (
        <div style={{ padding: `${t.space[5]}px ${t.space[5]}px` }}>
          {children}
        </div>
      ) : (
        inactiveHint && (
          <div style={{
            padding:    `${t.space[3]}px ${t.space[4]}px`,
            fontSize:   t.font.size.sm,
            color:      colors.textMuted,
            fontFamily: t.font.family.sans,
          }}>
            {inactiveHint}
          </div>
        )
      )}
    </div>
  )
}
