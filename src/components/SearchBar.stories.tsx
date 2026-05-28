import type { Meta, StoryObj } from '@storybook/react-vite'
import SearchBar from './SearchBar'

const meta: Meta<typeof SearchBar> = {
  title: 'GB CERNE/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Barra de busca global com índice de todos os módulos e itens de menu. Atalho Ctrl+K / ⌘K. Navegação por teclado (↑↓ + Enter). Highlight do termo buscado.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SearchBar>

export const Default: Story = {
  args: {
    onNavigate: (path) => console.log('Navegar para:', path),
  },
}

export const WithNavigate: Story = {
  args: {
    onNavigate: (path) => alert(`Navegando para: ${path}`),
  },
  parameters: {
    docs: {
      description: {
        story: 'Digite "fazend", "fiscal" ou "financeiro" para ver os resultados e o highlight.',
      },
    },
  },
}
