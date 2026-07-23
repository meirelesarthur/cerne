import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'
import { DetailGrid } from './DetailGrid'

const meta = {
  title: 'GB CERNE/DetailGrid',
  component: DetailGrid,
} satisfies Meta<typeof DetailGrid>

export default meta
type Story = StoryObj<typeof meta>

export const Cadastro: Story = {
  args: {
    items: [
      { label: 'Código', value: '001', copyValue: '001' },
      { label: 'Nome', value: 'Banco Cooperativo CERNE' },
      { label: 'Status', value: <Badge label="Ativo" variant="success" /> },
      { label: 'Token', value: 'token-nao-exposto', sensitive: true },
    ],
  },
}
