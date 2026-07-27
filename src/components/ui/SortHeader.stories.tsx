import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SortHeader } from './SortHeader'
import { t } from '../../design/tokens'

const meta: Meta<typeof SortHeader> = {
  title: 'GB CERNE/SortHeader',
  component: SortHeader,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Cabeçalho de coluna ordenável para tabelas montadas em grid (listagens que não usam `DataTable`, que já tem ordenação própria).',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SortHeader>

export const Ascendente: Story = {
  args: { label: 'Fazenda', field: 'nome', activeField: 'nome', direction: 'asc', onSort: () => {} },
}

export const Descendente: Story = {
  args: { label: 'Área (ha)', field: 'area', activeField: 'area', direction: 'desc', onSort: () => {}, align: 'right' },
}

export const Inativa: Story = {
  name: 'Coluna inativa (sem ordenação aplicada)',
  args: { label: 'Município', field: 'municipio', activeField: 'nome', direction: 'asc', onSort: () => {} },
}

/** Grid de colunas interativo — clique alterna a coluna e a direção de ordenação. */
export const GridDeColunas: Story = {
  name: 'Grid de colunas (interativo)',
  render: () => {
    const [activeField, setActiveField] = useState('nome')
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc')

    const handleSort = (field: string) => {
      if (field === activeField) setDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
      else { setActiveField(field); setDirection('asc') }
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: t.space[4], width: 480 }}>
        <SortHeader label="Fazenda" field="nome" activeField={activeField} direction={direction} onSort={handleSort} />
        <SortHeader label="Município" field="municipio" activeField={activeField} direction={direction} onSort={handleSort} />
        <SortHeader label="Área (ha)" field="area" activeField={activeField} direction={direction} onSort={handleSort} align="right" />
      </div>
    )
  },
}
