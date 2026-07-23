import type { Meta, StoryObj } from '@storybook/react-vite'
import { WorkflowTimeline } from './WorkflowTimeline'

const meta = {
  title: 'GB CERNE/WorkflowTimeline',
  component: WorkflowTimeline,
} satisfies Meta<typeof WorkflowTimeline>

export default meta
type Story = StoryObj<typeof meta>

export const AutorizacaoDeCompra: Story = {
  args: {
    steps: [
      { id: 'request', label: 'Solicitação', status: 'completed', description: 'Enviada em 21/07' },
      { id: 'quote', label: 'Cotação', status: 'completed', description: '3 propostas' },
      { id: 'approval', label: 'Autorização', status: 'current', description: 'Aguardando decisão' },
      { id: 'purchase', label: 'Compra', status: 'pending' },
    ],
  },
}
