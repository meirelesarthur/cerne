import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FilterSelect } from './FilterSelect'

const meta: Meta<typeof FilterSelect> = {
  title: 'GB CERNE/FilterSelect',
  component: FilterSelect,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof FilterSelect>

const PERIODOS = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: '12m', label: 'Últimos 12 meses' },
]

const SAFRAS = [
  { value: 'todas', label: 'Todas as safras' },
  { value: '2024-25', label: 'Safra 2024/25' },
  { value: '2023-24', label: 'Safra 2023/24' },
]

// ─── Padrão ─────────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('30d')
    return (
      <FilterSelect
        options={PERIODOS}
        value={value}
        onChange={setValue}
        ariaLabel="Filtrar por período"
      />
    )
  },
}

// ─── Com prefixo ────────────────────────────────────────────────────────────────

export const ComPrefixo: Story = {
  name: 'Com prefixo',
  render: () => {
    const [value, setValue] = useState('30d')
    return (
      <FilterSelect
        options={PERIODOS}
        value={value}
        onChange={setValue}
        ariaLabel="Filtrar por período"
        prefix="Período:"
      />
    )
  },
}

// ─── Outra lista de opções ──────────────────────────────────────────────────────

export const FiltroDeSafra: Story = {
  name: 'Filtro de safra',
  render: () => {
    const [value, setValue] = useState('todas')
    return (
      <FilterSelect
        options={SAFRAS}
        value={value}
        onChange={setValue}
        ariaLabel="Filtrar por safra"
        prefix="Safra:"
      />
    )
  },
}

// ─── Múltiplos filtros em toolbar ───────────────────────────────────────────────

export const ToolbarComMultiplosFiltros: Story = {
  name: 'Múltiplos filtros em toolbar',
  render: () => {
    const [periodo, setPeriodo] = useState('30d')
    const [safra, setSafra] = useState('todas')
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <FilterSelect options={PERIODOS} value={periodo} onChange={setPeriodo} ariaLabel="Filtrar por período" prefix="Período:" />
        <FilterSelect options={SAFRAS} value={safra} onChange={setSafra} ariaLabel="Filtrar por safra" prefix="Safra:" />
      </div>
    )
  },
}
