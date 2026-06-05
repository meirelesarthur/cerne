import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pencil, Trash2, Eye } from 'lucide-react'
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
      { id: 'view', label: 'Visualizar', icon: <Eye size={13} />, onClick: () => {} },
      { id: 'edit', label: 'Editar', icon: <Pencil size={13} />, onClick: () => {} },
      { id: 'del', label: 'Excluir', icon: <Trash2 size={13} />, onClick: () => {}, danger: true, divider: true },
    ],
  },
}
