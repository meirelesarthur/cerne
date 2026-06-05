import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from './Avatar'

const meta: Meta<typeof Avatar> = {
  title: 'GB CERNE/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const Initials: Story = {
  args: { name: 'Arthur Meireles', size: 'md' },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar name="Arthur Meireles" size="sm" />
      <Avatar name="Arthur Meireles" size="md" />
      <Avatar name="Arthur Meireles" size="lg" />
    </div>
  ),
}

export const SingleName: Story = {
  args: { name: 'Greenbelt', size: 'lg' },
}
