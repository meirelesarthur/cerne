import type { Meta, StoryObj } from '@storybook/react-vite'
import { TreeView } from './TreeView'

const meta = {
  title: 'GB CERNE/TreeView',
  component: TreeView,
} satisfies Meta<typeof TreeView>

export default meta
type Story = StoryObj<typeof meta>

export const AgrupadoresContabeis: Story = {
  args: {
    maxDepth: 4,
    nodes: [
      {
        id: '1', label: '1 · Ativo', description: 'Grupo sintético', children: [
          {
            id: '1.1', label: '1.1 · Ativo circulante', children: [
              { id: '1.1.1', label: '1.1.1 · Disponibilidades' },
            ],
          },
        ],
      },
      { id: '2', label: '2 · Passivo', description: 'Grupo sintético' },
    ],
  },
}
