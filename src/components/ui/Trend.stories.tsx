import type { Meta, StoryObj } from '@storybook/react-vite'
import { Trend } from './Trend'
import { t } from '../../design/tokens'

const meta: Meta<typeof Trend> = {
  title: 'GB CERNE/Trend',
  component: Trend,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Badge de variação percentual usado nos KPIs dos dashboards — indica alta (verde) ou queda (vermelho) em relação ao período anterior.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Trend>

export const Alta: Story = {
  name: 'Alta',
  args: { value: '+12,4%', up: true },
}

export const Queda: Story = {
  name: 'Queda',
  args: { value: '-6,8%', up: false },
}

export const EmContextoDeKpi: Story = {
  name: 'Em contexto de KPI',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1], fontFamily: t.font.family.sans }}>
      <span style={{ fontSize: t.font.size.xl, fontWeight: t.font.weight.bold, color: t.color.neutral[900] }}>
        R$ 1.284.900
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
        <Trend value="+8,2%" up />
        <span style={{ fontSize: t.font.size.xs, color: t.color.neutral[500] }}>vs. safra anterior</span>
      </div>
    </div>
  ),
}
