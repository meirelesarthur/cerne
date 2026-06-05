import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tag } from './Tag'

const meta: Meta<typeof Tag> = {
  title: 'GB CERNE/Tag',
  component: Tag,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'brand', 'success', 'danger', 'warning', 'info', 'purple', 'cyan'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Tag>

export const Default: Story = {
  args: { label: 'Grãos', variant: 'brand' },
}

export const Removable: Story = {
  args: { label: 'Safra 2024', variant: 'success', onRemove: () => {} },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Tag label="Neutral" variant="neutral" />
      <Tag label="Brand" variant="brand" />
      <Tag label="Success" variant="success" />
      <Tag label="Danger" variant="danger" />
      <Tag label="Warning" variant="warning" />
      <Tag label="Info" variant="info" />
      <Tag label="Purple" variant="purple" />
      <Tag label="Cyan" variant="cyan" />
    </div>
  ),
}
