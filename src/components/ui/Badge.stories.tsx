import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'danger', 'warning', 'neutral'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Success: Story = {
  args: { label: 'Ativo', variant: 'success' },
}

export const Danger: Story = {
  args: { label: 'Inativo', variant: 'danger' },
}

export const Warning: Story = {
  args: { label: 'Pendente', variant: 'warning' },
}

export const Neutral: Story = {
  args: { label: 'Rascunho', variant: 'neutral' },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge label="Ativo" variant="success" />
      <Badge label="Inativo" variant="danger" />
      <Badge label="Pendente" variant="warning" />
      <Badge label="Rascunho" variant="neutral" />
    </div>
  ),
}
