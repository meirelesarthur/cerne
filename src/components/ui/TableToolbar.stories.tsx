import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TableSearchInput, FilterChip, FilterButton } from './TableToolbar'
import { Button } from './Button'
import { t } from '../../design/tokens'

const meta: Meta = {
  title: 'GB CERNE/TableToolbar',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Módulo de peças da barra de ferramentas de listagem — `TableSearchInput`, `FilterChip` e `FilterButton` — compostas na ordem canônica da Regra B: busca · chips ativos · "Limpar tudo" · botão de filtros.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

export const CampoDeBusca: Story = {
  name: 'TableSearchInput',
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div style={{ width: 320 }}>
        <TableSearchInput value={value} onChange={setValue} placeholder="Buscar por código, descrição..." />
      </div>
    )
  },
}

export const ChipDeFiltro: Story = {
  name: 'FilterChip',
  render: () => (
    <div style={{ display: 'flex', gap: t.space[2] }}>
      <FilterChip label="Safra: 24/25" onRemove={() => {}} />
      <FilterChip label="Status: Ativa" onRemove={() => {}} />
    </div>
  ),
}

export const BotaoDeFiltros: Story = {
  name: 'FilterButton',
  render: () => {
    const [active, setActive] = useState(false)
    return <FilterButton active={active} count={active ? 3 : 0} onClick={() => setActive((a) => !a)} />
  },
}

/** Composição completa da toolbar de listagem — ordem canônica (Regra B). */
export const ToolbarCompleta: Story = {
  name: 'Toolbar completa',
  render: () => {
    const [search, setSearch] = useState('')
    const [filtersOpen, setFiltersOpen] = useState(false)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], flexWrap: 'wrap' }}>
        <TableSearchInput value={search} onChange={setSearch} placeholder="Buscar por código, descrição..." />
        <FilterChip label="Safra: 24/25" onRemove={() => {}} />
        <FilterChip label="Status: Ativa" onRemove={() => {}} />
        <Button variant="ghost" size="sm" onClick={() => {}}>Limpar tudo</Button>
        <FilterButton active={filtersOpen} count={2} onClick={() => setFiltersOpen((o) => !o)} />
      </div>
    )
  },
}
