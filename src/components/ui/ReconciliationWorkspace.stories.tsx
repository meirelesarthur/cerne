import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReconciliationWorkspace } from './ReconciliationWorkspace'

const meta = {
  title: 'GB CERNE/ReconciliationWorkspace',
  component: ReconciliationWorkspace,
} satisfies Meta<typeof ReconciliationWorkspace>

export default meta
type Story = StoryObj<typeof meta>

export const ConciliacaoOFX: Story = {
  args: {
    bankItems: [{ id: '1', date: '22/07/2026', description: 'PIX FORNECEDOR CAMPO', amount: -4850, status: 'pending' }],
    systemItems: [{ id: '2', date: '22/07/2026', description: 'CP-2026-481 · Fornecedor Campo', amount: -4850, status: 'matched' }],
    onLink: () => undefined,
    onCreate: () => undefined,
  },
}
