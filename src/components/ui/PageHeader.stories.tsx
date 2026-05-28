import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus, Download } from 'lucide-react'
import { PageHeader } from './PageHeader'

const meta: Meta<typeof PageHeader> = {
  title: 'GB CERNE/PageHeader',
  component: PageHeader,
  parameters: { layout: 'padded', backgrounds: { default: 'white' } },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ fontFamily: "'Outfit', sans-serif", padding: 24 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof PageHeader>

export const Default: Story = {
  args: {
    title: 'Fazendas',
  },
}

export const WithCount: Story = {
  args: {
    title: 'Fazendas',
    count: 12,
  },
}

export const WithDescription: Story = {
  args: {
    title: 'Fazendas',
    count: 12,
    description: 'Gerencie as propriedades rurais cadastradas no sistema',
  },
}

export const WithActions: Story = {
  args: {
    title: 'Fazendas',
    count: 12,
    description: 'Gerencie as propriedades rurais cadastradas no sistema',
    actions: (
      <>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: '1.5px solid #e5e5e5',
            background: 'white',
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: "'Outfit', sans-serif",
            color: '#1a1a1a',
          }}
        >
          <Download size={14} />
          Exportar
        </button>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: 'none',
            background: '#059669',
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: "'Outfit', sans-serif",
            color: 'white',
          }}
        >
          <Plus size={14} />
          Nova Fazenda
        </button>
      </>
    ),
  },
}
