import type { Meta, StoryObj } from '@storybook/react-vite'
import { Breadcrumb } from './Breadcrumb'

const meta: Meta<typeof Breadcrumb> = {
  title: 'GB CERNE/Breadcrumb',
  component: Breadcrumb,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Breadcrumb>

export const Default: Story = {
  args: {
    items: [
      { label: 'Início', onClick: () => {} },
      { label: 'Cadastros Base', onClick: () => {} },
      { label: 'Fazendas' },
    ],
  },
}

export const TwoLevels: Story = {
  args: {
    items: [
      { label: 'Início', onClick: () => {} },
      { label: 'Dashboards' },
    ],
  },
}
