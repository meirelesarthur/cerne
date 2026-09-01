import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReportSummary } from './ReportSummary'

const meta = {
  title: 'UI/ReportSummary',
  component: ReportSummary,
  args: {
    items: [
      { label: 'Valor total', value: 'R$ 890.230,00', helper: '6 equipamentos' },
      { label: 'Valor atual', value: 'R$ 816.465,79', helper: '91,7% do valor de aquisição' },
      { label: 'Depreciação acumulada', value: 'R$ 73.764,21' },
    ],
  },
} satisfies Meta<typeof ReportSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
