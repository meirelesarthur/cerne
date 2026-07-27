import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './Skeleton'
import { t } from '../../design/tokens'

const meta: Meta<typeof Skeleton> = {
  title: 'GB CERNE/Skeleton',
  component: Skeleton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Retangulo: Story = {
  name: 'Retângulo (cards/listas)',
  args: { variant: 'rect', width: 280, height: 120 },
}

export const Texto: Story = {
  name: 'Texto (múltiplas linhas)',
  args: { variant: 'text', lines: 3, width: 280 },
}

export const Circulo: Story = {
  name: 'Círculo (avatar)',
  args: { variant: 'circle', width: 40 },
}

export const ComposicaoDeCard: Story = {
  name: 'Composição — card de listagem',
  render: () => (
    <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[3] }}>
        <Skeleton variant="circle" width={40} />
        <div style={{ flex: 1 }}>
          <Skeleton variant="text" lines={2} />
        </div>
      </div>
      <Skeleton variant="rect" height={132} />
    </div>
  ),
}
