import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ToggleField } from './ToggleField'

const meta = {
  title: 'GB CERNE/ToggleField',
  component: ToggleField,
  tags: ['autodocs'],
} satisfies Meta<typeof ToggleField>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {
  args: {
    checked: true,
    onChange: () => {},
    label: 'Controla estoque',
    description: 'Acompanha entradas, saídas e saldo disponível.',
  },
  render: () => {
    const [checked, setChecked] = useState(true)
    return (
      <ToggleField
        checked={checked}
        onChange={setChecked}
        label="Controla estoque"
        description="Acompanha entradas, saídas e saldo disponível."
      />
    )
  },
}

export const Desabilitado: Story = {
  args: {
    checked: false,
    onChange: () => {},
    label: 'Controla qualidade',
    description: 'Exige análise antes do uso.',
    disabled: true,
  },
}
