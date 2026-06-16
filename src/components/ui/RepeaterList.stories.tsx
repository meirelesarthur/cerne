import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { RepeaterList } from './RepeaterList'
import { FormField } from './FormField'

const meta: Meta<typeof RepeaterList> = {
  title: 'GB CERNE/RepeaterList',
  component: RepeaterList,
  parameters: { layout: 'padded', backgrounds: { default: 'white' } },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560, fontFamily: "'Outfit', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof RepeaterList>

export const InscricoesEstaduais: Story = {
  render: () => {
    const [items, setItems] = useState<string[]>(['123456789'])
    return (
      <RepeaterList
        items={items}
        addLabel="Adicionar inscrição"
        emptyText="Nenhuma inscrição estadual cadastrada."
        removeLabel="Remover inscrição"
        onAdd={() => setItems((p) => [...p, ''])}
        onRemove={(i) => setItems((p) => p.filter((_, idx) => idx !== i))}
        renderRow={(value, index) => (
          <FormField
            label={`Inscrição Estadual ${index + 1}`}
            value={value}
            placeholder="Somente números"
            onChange={(e) =>
              setItems((p) => p.map((v, idx) => (idx === index ? e.target.value : v)))
            }
          />
        )}
      />
    )
  },
}

export const Empty: Story = {
  render: () => {
    const [items, setItems] = useState<string[]>([])
    return (
      <RepeaterList
        items={items}
        addLabel="Adicionar vendedor"
        emptyText="Nenhum vendedor cadastrado."
        onAdd={() => setItems((p) => [...p, ''])}
        onRemove={(i) => setItems((p) => p.filter((_, idx) => idx !== i))}
        renderRow={(value, index) => (
          <FormField
            label="Nome do vendedor"
            value={value}
            onChange={(e) =>
              setItems((p) => p.map((v, idx) => (idx === index ? e.target.value : v)))
            }
          />
        )}
      />
    )
  },
}
