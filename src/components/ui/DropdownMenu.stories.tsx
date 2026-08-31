import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon } from './Icon'
import { DropdownMenu } from './DropdownMenu'

const meta: Meta<typeof DropdownMenu> = {
  title: 'GB CERNE/DropdownMenu',
  component: DropdownMenu,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DropdownMenu>

export const Default: Story = {
  args: {
    items: [
      { id: 'view', label: 'Visualizar', icon: <Icon name="view" size={13} />, onClick: () => {} },
      { id: 'edit', label: 'Editar', icon: <Icon name="edit" size={13} />, onClick: () => {} },
      { id: 'del', label: 'Excluir', icon: <Icon name="delete" size={13} />, onClick: () => {}, danger: true, divider: true },
    ],
  },
}
