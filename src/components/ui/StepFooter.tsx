import React from 'react'
import { t } from '../../design/tokens'
import { Button } from './Button'
import { useTheme } from '../../context/ThemeContext'

interface StepFooterProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  backLabel?: string
  /** Sobrescreve o desabilitar padrão do botão Voltar (default: desabilitado na 1ª etapa). Útil quando a 1ª etapa deve permitir "Cancelar". */
  backDisabled?: boolean
}

/**
 * Rodapé padrão para formulários multi-step.
 * Exibe contador de etapas e botões de navegação consistentes.
 */
export function StepFooter({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  nextLabel,
  backLabel = 'Voltar',
  backDisabled,
}: StepFooterProps) {
  const { colors } = useTheme()
  const isFirst = currentStep === 1
  const isLast  = currentStep === totalSteps
  const label   = nextLabel ?? (isLast ? 'Salvar' : 'Próximo')
  const isBackDisabled = backDisabled ?? isFirst

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${t.space[3]}px 0`,
        marginTop: t.space[2],
      }}
    >
      <span
        style={{
          fontSize: t.font.size.sm,
          color: colors.textMuted,
          fontFamily: t.font.family.sans,
          transition: `color ${t.transition.smooth}`,
        }}
      >
        Etapa {currentStep} de {totalSteps}
      </span>

      <div style={{ display: 'flex', gap: t.space[2] }}>
        <Button
          variant="secondary"
          size="md"
          style={{ width: t.size.stepBtn }}
          onClick={onBack}
          disabled={isBackDisabled}
        >
          {backLabel}
        </Button>
        <Button
          variant="primary"
          size="md"
          style={{ width: t.size.stepBtn }}
          onClick={onNext}
        >
          {label}
        </Button>
      </div>
    </div>
  )
}
