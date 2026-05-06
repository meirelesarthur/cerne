import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Stepper } from './Stepper'

const steps = [
  { id: 1, label: 'Identificação' },
  { id: 2, label: 'Localização' },
  { id: 3, label: 'Documentação' },
  { id: 4, label: 'Financeiro' },
  { id: 5, label: 'Revisão' },
]

const meta: Meta<typeof Stepper> = {
  title: 'UI/Stepper',
  component: Stepper,
  parameters: { layout: 'padded', backgrounds: { default: 'white' } },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Stepper>

export const Step1: Story = {
  args: {
    steps,
    current: 1,
    completed: [],
    onStepClick: () => {},
  },
}

export const Step3WithCompleted: Story = {
  args: {
    steps,
    current: 3,
    completed: [1, 2],
    onStepClick: () => {},
  },
}

export const AllCompleted: Story = {
  args: {
    steps,
    current: 5,
    completed: [1, 2, 3, 4],
    onStepClick: () => {},
  },
}

export const Interactive: Story = {
  render: () => {
    const [current, setCurrent] = useState(2)
    const [completed, setCompleted] = useState([1])

    const handleNext = () => {
      if (current < steps.length) {
        setCompleted((c) => [...c, current])
        setCurrent((s) => s + 1)
      }
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Outfit', sans-serif" }}>
        <Stepper
          steps={steps}
          current={current}
          completed={completed}
          onStepClick={(id) => {
            if (completed.includes(id)) setCurrent(id)
          }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleNext}
            disabled={current >= steps.length}
            style={{
              padding: '8px 20px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontFamily: "'Outfit', sans-serif",
              cursor: 'pointer',
            }}
          >
            Próximo
          </button>
        </div>
      </div>
    )
  },
}
