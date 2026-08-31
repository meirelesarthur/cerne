import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Icon } from './Icon'
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
        icon={<Icon name="briefcase" size={16} />}
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

export const SelectionCard: Story = {
  render: () => {
    const [active, setActive] = useState(true)
    return (
      <ToggleSection
        title="Proprietário"
        description="Dono de fazenda — participação por propriedade e inscrições estaduais."
        icon={<Icon name="briefcase" size={16} />}
        active={active}
        onToggle={setActive}
        activeHint={'Etapa "Proprietário" adicionada — configure a seguir.'}
        inactiveHint="Ative para adicionar a etapa de configuração."
      />
    )
  },
}

export const CardGrid: Story = {
  render: () => {
    const roles = [
      { key: 'proprietary', label: 'Proprietário', hint: 'Dono de fazenda — participação por propriedade e inscrições estaduais.', icon: <Icon name="crown" size={16} /> },
      { key: 'employee',    label: 'Funcionário',   hint: 'Colaborador — cargo, função, dados bancários e centro de custo.',      icon: <Icon name="briefcase" size={16} /> },
      { key: 'provider',    label: 'Fornecedor',    hint: 'Vende insumos — filiais, vendedores e dados bancários.',               icon: <Icon name="truck" size={16} /> },
      { key: 'client',      label: 'Cliente',       hint: 'Comprador — inscrições estaduais, contribuinte e dados fiscais.',      icon: <Icon name="cart" size={16} /> },
      { key: 'user',        label: 'Usuário',       hint: 'Acesso ao sistema — perfis, fazendas e encarregados.',                 icon: <Icon name="key" size={16} /> },
    ]
    const [active, setActive] = useState<Record<string, boolean>>({ proprietary: true, user: true })
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: 12 }}>
        {roles.map((r) => (
          <ToggleSection
            key={r.key}
            variant="card"
            title={r.label}
            description={r.hint}
            icon={r.icon}
            active={!!active[r.key]}
            onToggle={(v) => setActive((prev) => ({ ...prev, [r.key]: v }))}
            activeHint={`Etapa "${r.label}" adicionada — configure a seguir.`}
          />
        ))}
      </div>
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
