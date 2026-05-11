import React from 'react'
import { t } from '../../design/tokens'
import { Button } from './Button'

interface StepFooterProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  backLabel?: string
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
}: StepFooterProps) {
  const isFirst = currentStep === 1
  const isLast  = currentStep === totalSteps
  const label   = nextLabel ?? (isLast ? 'Salvar' : 'Próximo')

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
          color: t.color.neutral[400],
          fontFamily: t.font.family.sans,
        }}
      >
        Etapa {currentStep} de {totalSteps}
      </span>

      <div style={{ display: 'flex', gap: t.space[2] }}>
        <Button
          variant="secondary"
          size="md"
          style={{ width: 180 }}
          onClick={onBack}
          disabled={isFirst}
        >
          {backLabel}
        </Button>
        <Button
          variant="primary"
          size="md"
          style={{ width: 180 }}
          onClick={onNext}
        >
          {label}
        </Button>
      </div>
    </div>
  )
}
