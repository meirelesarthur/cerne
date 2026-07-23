import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusLegend } from './StatusLegend'

const meta = {
  title: 'GB CERNE/StatusLegend',
  component: StatusLegend,
} satisfies Meta<typeof StatusLegend>

export default meta
type Story = StoryObj<typeof meta>

export const Compras: Story = {
  args: {
    items: [
      { label: 'Pendente', variant: 'warning' },
      { label: 'Em análise', variant: 'info' },
      { label: 'Autorizada', variant: 'success' },
      { label: 'Recusada', variant: 'danger' },
    ],
  },
}
