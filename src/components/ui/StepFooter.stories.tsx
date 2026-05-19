import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { StepFooter } from './StepFooter'
import { StepHeader } from './StepHeader'
import { Stepper } from './Stepper'

const meta: Meta<typeof StepFooter> = {
  title: 'UI/StepFooter',
  component: StepFooter,
  parameters: { layout: 'padded', backgrounds: { default: 'white' } },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof StepFooter>

const steps = [
  { id: 1, label: 'Identificação' },
  { id: 2, label: 'Localização' },
  { id: 3, label: 'Documentação' },
  { id: 4, label: 'Revisão' },
]

// ─── Estáticos ────────────────────────────────────────────────────────────────

export const FirstStep: Story = {
  args: {
    currentStep: 1,
    totalSteps: 4,
    onBack: () => {},
    onNext: () => {},
  },
}

export const MiddleStep: Story = {
  args: {
    currentStep: 2,
    totalSteps: 4,
    onBack: () => {},
    onNext: () => {},
  },
}

export const LastStep: Story = {
  args: {
    currentStep: 4,
    totalSteps: 4,
    onBack: () => {},
    onNext: () => {},
    nextLabel: 'Salvar Fazenda',
  },
}

// ─── Completo com Stepper e StepHeader ───────────────────────────────────────

const stepHeaders = [
  { title: 'Identificação', subtitle: 'Dados básicos da propriedade' },
  { title: 'Localização', subtitle: 'Endereço e coordenadas' },
  { title: 'Documentação', subtitle: 'Documentos necessários' },
  { title: 'Revisão', subtitle: 'Confirme as informações' },
]

export const FullWizard: Story = {
  render: () => {
    const [current, setCurrent] = useState(1)
    const [completed, setCompleted] = useState<number[]>([])

    const handleNext = () => {
      if (current < steps.length) {
        setCompleted((c) => [...c, current])
        setCurrent((s) => s + 1)
      }
    }

    const handleBack = () => {
      if (current > 1) setCurrent((s) => s - 1)
    }

    const h = stepHeaders[current - 1]

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640, margin: '0 auto' }}>
        <Stepper
          steps={steps}
          current={current}
          completed={completed}
          onStepClick={(id) => { if (completed.includes(id)) setCurrent(id) }}
        />
        <StepHeader title={h.title} subtitle={h.subtitle} />
        <div
          style={{
            minHeight: 120,
            border: '1.5px dashed #e5e5e5',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: 13,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Conteúdo da etapa {current}
        </div>
        <StepFooter
          currentStep={current}
          totalSteps={steps.length}
          onBack={handleBack}
          onNext={handleNext}
          nextLabel={current === steps.length ? 'Salvar Fazenda' : undefined}
        />
      </div>
    )
  },
}
