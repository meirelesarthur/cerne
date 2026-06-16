import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Briefcase } from 'lucide-react'
import { ToggleSection } from './ToggleSection'
import { FormField } from './FormField'
import { FormSelect } from './FormSelect'

const meta: Meta<typeof ToggleSection> = {
  title: 'GB CERNE/ToggleSection',
  component: ToggleSection,
  parameters: { layout: 'padded', backgrounds: { default: 'white' } },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640, fontFamily: "'Outfit', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ToggleSection>

export const Default: Story = {
  render: () => {
    const [active, setActive] = useState(false)
    return (
      <ToggleSection
        title="Funcionário"
        description="Ative para registrar dados de colaborador (cargo, salário, banco)."
        icon={<Briefcase size={16} />}
        active={active}
        onToggle={setActive}
        inactiveHint="Papel inativo — ative o toggle para preencher os dados."
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormField label="Cargo" placeholder="Ex: Operador de máquinas" />
          <FormSelect
            label="Centro de Custo"
            options={[
              { value: '', label: 'Selecione...' },
              { value: '1', label: '1.01 — Lavoura' },
            ]}
          />
        </div>
      </ToggleSection>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <ToggleSection
      title="Usuário"
      description="Limite de usuários do plano atingido."
      active={false}
      onToggle={() => {}}
      disabled
      inactiveHint="Faça upgrade do plano para liberar novos acessos."
    >
      <div />
    </ToggleSection>
  ),
}
