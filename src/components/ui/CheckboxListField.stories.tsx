import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckboxListField, type CheckboxListItem } from './CheckboxListField'

const meta: Meta<typeof CheckboxListField> = {
  title: 'GB CERNE/CheckboxListField',
  component: CheckboxListField,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 380, fontFamily: "'Outfit', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CheckboxListField>

const FAZENDAS: CheckboxListItem[] = [
  { id: '1', label: 'Fazenda São João' },
  { id: '2', label: 'Fazenda Paraíso' },
  { id: '3', label: 'Fazenda Nova Esperança' },
  { id: '4', label: 'Fazenda Santa Rosa' },
  { id: '5', label: 'Fazenda do Vale' },
  { id: '6', label: 'Fazenda Boa Vista' },
  { id: '7', label: 'Fazenda Horizonte' },
]

const PROPRIETARIOS: CheckboxListItem[] = [
  { id: '1', label: 'João Batista Silva' },
  { id: '2', label: 'Maria Aparecida Souza' },
  { id: '3', label: 'Carlos Eduardo Lima' },
]

// ─── Lista longa com busca ──────────────────────────────────────────────────────

export const ListaComBusca: Story = {
  name: 'Lista longa com busca',
  render: () => {
    const [selectedIds, setSelectedIds] = useState<string[]>(['1', '3'])
    return (
      <CheckboxListField
        label="Fazendas Vinculadas"
        items={FAZENDAS}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
        searchPlaceholder="Buscar fazenda..."
        hint="Selecione as fazendas onde este centro de custo será utilizado."
      />
    )
  },
}

// ─── Lista curta sem busca ──────────────────────────────────────────────────────

export const ListaCurtaSemBusca: Story = {
  name: 'Lista curta (sem busca)',
  render: () => {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    return (
      <CheckboxListField
        label="Proprietários"
        items={PROPRIETARIOS}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
      />
    )
  },
}

// ─── Tudo selecionado ───────────────────────────────────────────────────────────

export const TudoSelecionado: Story = {
  name: 'Tudo selecionado',
  render: () => {
    const [selectedIds, setSelectedIds] = useState<string[]>(FAZENDAS.map((f) => f.id))
    return (
      <CheckboxListField
        label="Fazendas Vinculadas"
        items={FAZENDAS}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
      />
    )
  },
}

// ─── Vazia ──────────────────────────────────────────────────────────────────────

export const Vazia: Story = {
  name: 'Sem itens',
  render: () => {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    return (
      <CheckboxListField
        label="Safras Vinculadas"
        items={[]}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
      />
    )
  },
}
