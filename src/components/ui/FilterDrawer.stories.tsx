import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { FilterDrawer } from './FilterDrawer'
import { FormField } from './FormField'
import { FormSelect } from './FormSelect'
import { Button } from './Button'
import { SlidersHorizontal } from 'lucide-react'

const meta: Meta<typeof FilterDrawer> = {
  title: 'UI/FilterDrawer',
  component: FilterDrawer,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof FilterDrawer>

// ─── Interativo ───────────────────────────────────────────────────────────────

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [estado, setEstado] = useState('')
    const [status, setStatus] = useState('')

    const activeCount = [estado, status].filter(Boolean).length

    return (
      <div style={{ padding: 24 }}>
        <Button
          variant="secondary"
          icon={<SlidersHorizontal size={14} />}
          onClick={() => setOpen(true)}
        >
          Filtros {activeCount > 0 && `(${activeCount})`}
        </Button>

        <FilterDrawer
          open={open}
          onClose={() => setOpen(false)}
          onClear={() => { setEstado(''); setStatus('') }}
          activeCount={activeCount}
        >
          <FormSelect
            label="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'MT', label: 'Mato Grosso' },
              { value: 'GO', label: 'Goiás' },
              { value: 'MS', label: 'Mato Grosso do Sul' },
              { value: 'SP', label: 'São Paulo' },
            ]}
          />
          <FormSelect
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'ativo', label: 'Ativo' },
              { value: 'inativo', label: 'Inativo' },
            ]}
          />
          <FormField label="Área mínima (ha)" placeholder="Ex: 500" />
          <FormField label="Área máxima (ha)" placeholder="Ex: 5000" />
        </FilterDrawer>
      </div>
    )
  },
}

// ─── Aberto (estático) ────────────────────────────────────────────────────────

export const Open: Story = {
  render: () => (
    <FilterDrawer
      open
      onClose={() => {}}
      onClear={() => {}}
      activeCount={2}
    >
      <FormSelect
        label="Estado"
        value="MT"
        onChange={() => {}}
        options={[
          { value: 'MT', label: 'Mato Grosso' },
          { value: 'GO', label: 'Goiás' },
        ]}
      />
      <FormField label="Área mínima (ha)" value="500" />
    </FilterDrawer>
  ),
}

// ─── Sem filtros ativos ───────────────────────────────────────────────────────

export const NoActiveFilters: Story = {
  render: () => (
    <FilterDrawer
      open
      onClose={() => {}}
      onClear={() => {}}
      activeCount={0}
      title="Filtrar fazendas"
    >
      <FormField label="Nome" placeholder="Buscar por nome..." />
      <FormSelect
        label="Estado"
        value=""
        onChange={() => {}}
        options={[
          { value: '', label: 'Todos os estados' },
          { value: 'MT', label: 'Mato Grosso' },
          { value: 'GO', label: 'Goiás' },
        ]}
      />
    </FilterDrawer>
  ),
}
