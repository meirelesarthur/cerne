import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from './Spinner'
import { t } from '../../design/tokens'

const meta: Meta<typeof Spinner> = {
  title: 'GB CERNE/Spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}

export default meta
type Story = StoryObj<typeof Spinner>

export const Default: Story = {
  args: { size: 'md', color: t.color.brand[600] },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: t.color.brand[600] }}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
}
