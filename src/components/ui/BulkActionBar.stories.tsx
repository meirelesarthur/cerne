import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { BulkActionBar } from './BulkActionBar'
import { Button } from './Button'

const meta: Meta<typeof BulkActionBar> = {
  title: 'GB CERNE/BulkActionBar',
  component: BulkActionBar,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof BulkActionBar>

// ─── Padrão (vários selecionados) ──────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div style={{ padding: 24, height: 240 }}>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6b7280', margin: 0 }}>
        3 fazendas selecionadas na listagem — a barra fica fixada no rodapé central da tela.
      </p>
      <BulkActionBar
        count={3}
        noun="fazenda"
        actions={[
          { label: 'Exportar', onClick: () => alert('Exportar selecionadas') },
          { label: 'Excluir', onClick: () => alert('Excluir selecionadas'), danger: true },
        ]}
        onClose={() => {}}
      />
    </div>
  ),
}

// ─── Um único item (singular) ──────────────────────────────────────────────────

export const ItemUnico: Story = {
  name: 'Um item selecionado (singular)',
  render: () => (
    <div style={{ padding: 24, height: 240 }}>
      <BulkActionBar
        count={1}
        noun="safra"
        actions={[{ label: 'Arquivar', onClick: () => alert('Arquivar safra') }]}
        onClose={() => {}}
      />
    </div>
  ),
}

// ─── Ação destrutiva única ──────────────────────────────────────────────────────

export const SomenteDestrutiva: Story = {
  name: 'Apenas ação destrutiva',
  render: () => (
    <div style={{ padding: 24, height: 240 }}>
      <BulkActionBar
        count={5}
        noun="lançamento"
        actions={[{ label: 'Excluir', onClick: () => alert('Excluir lançamentos'), danger: true }]}
        onClose={() => {}}
      />
    </div>
  ),
}

// ─── Interativo (toggle de seleção) ────────────────────────────────────────────

export const Interativo: Story = {
  render: () => {
    const [count, setCount] = useState(4)
    return (
      <div style={{ padding: 24, height: 240, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Button variant="secondary" onClick={() => setCount((c) => (c > 0 ? c - 1 : 4))}>
          {count > 0 ? 'Remover um item da seleção' : 'Selecionar 4 itens'}
        </Button>
        <BulkActionBar
          count={count}
          noun="produto"
          actions={[
            { label: 'Exportar', onClick: () => alert('Exportar') },
            { label: 'Excluir', onClick: () => alert('Excluir'), danger: true },
          ]}
          onClose={() => setCount(0)}
        />
      </div>
    )
  },
}
