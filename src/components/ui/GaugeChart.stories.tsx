import type { Meta, StoryObj } from '@storybook/react-vite'
import { GaugeChart } from './GaugeChart'
import { ChartCard } from './ChartCard'
import { Target } from 'lucide-react'
import { t } from '../../design/tokens'

const meta: Meta<typeof GaugeChart> = {
  title: 'GB CERNE/GaugeChart',
  component: GaugeChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Medidor semicircular (180°) com arco de trilho + preenchimento proporcional a `value/max`, valor e rótulo no centro. SVG manual, suporta light e GBMode. Use para metas, atingimento de orçamento e taxas de execução.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof GaugeChart>

export const Padrao: Story = {
  args: { value: 68, centerValue: '68%', centerLabel: 'da meta' },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
}

export const OrcamentoExecutado: Story = {
  args: {
    value: 6.12,
    max: 9.0,
    centerValue: 'R$ 6,12M',
    centerLabel: 'de R$ 9,0M',
    color: t.color.brand[600],
  },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
}

export const NoChartCard: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <ChartCard icon={Target} title="Execução Orçamentária">
        <GaugeChart value={82} centerValue="82%" centerLabel="executado no período" />
      </ChartCard>
    </div>
  ),
}
