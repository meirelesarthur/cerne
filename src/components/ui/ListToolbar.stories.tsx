import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ListToolbar } from './ListToolbar'

const meta: Meta<typeof ListToolbar> = {
  title: 'GB CERNE/ListToolbar',
  component: ListToolbar,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ListToolbar>

export const SemFiltros: Story = {
  render: () => {
    const [search, setSearch] = useState('')
    return (
      <ListToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Buscar por código, descrição..."
        onOpenFilter={() => {}}
        filterCount={0}
      />
    )
  },
}

export const ComChips: Story = {
  render: () => {
    const [search, setSearch] = useState('')
    return (
      <ListToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Buscar por código, descrição..."
        onOpenFilter={() => {}}
        filterCount={3}
        onClearAll={() => {}}
        chips={[
          { label: 'Condição: Ambos', onRemove: () => {} },
          { label: 'Classe: Sintética', onRemove: () => {} },
          { label: 'Ativo', onRemove: () => {} },
        ]}
      />
    )
  },
}
