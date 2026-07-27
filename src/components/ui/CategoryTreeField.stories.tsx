import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CategoryTreeField } from './CategoryTreeField'
import { CATEGORIAS_FINANCEIRAS_TREE } from '../../data/categoriasFinanceiras'

const meta: Meta<typeof CategoryTreeField> = {
  title: 'GB CERNE/CategoryTreeField',
  component: CategoryTreeField,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 420, fontFamily: "'Outfit', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CategoryTreeField>

// Amostra reduzida (3 grupos) para manter a story legível.
const AMOSTRA = CATEGORIAS_FINANCEIRAS_TREE.slice(0, 3)

// ─── Sem seleção ────────────────────────────────────────────────────────────────

export const SemSelecao: Story = {
  name: 'Sem seleção',
  render: () => {
    const [selected, setSelected] = useState<string[]>([])
    return <CategoryTreeField tree={AMOSTRA} selected={selected} onChange={setSelected} />
  },
}

// ─── Com seleção parcial ────────────────────────────────────────────────────────

export const ComSelecaoParcial: Story = {
  name: 'Com seleção parcial',
  render: () => {
    const [selected, setSelected] = useState<string[]>([
      AMOSTRA[0].children[0].id,
      AMOSTRA[0].children[1].id,
      AMOSTRA[1].id,
      ...AMOSTRA[1].children.map((c) => c.id),
    ])
    return <CategoryTreeField tree={AMOSTRA} selected={selected} onChange={setSelected} />
  },
}

// ─── Título customizado ─────────────────────────────────────────────────────────

export const TituloCustomizado: Story = {
  name: 'Título customizado',
  render: () => {
    const [selected, setSelected] = useState<string[]>([])
    return (
      <CategoryTreeField
        tree={AMOSTRA}
        selected={selected}
        onChange={setSelected}
        title="Categorias vinculadas ao centro de custo"
      />
    )
  },
}

// ─── Árvore completa ────────────────────────────────────────────────────────────

export const ArvoreCompleta: Story = {
  name: 'Árvore completa (todos os grupos)',
  render: () => {
    const [selected, setSelected] = useState<string[]>([])
    return <CategoryTreeField tree={CATEGORIAS_FINANCEIRAS_TREE} selected={selected} onChange={setSelected} />
  },
}
