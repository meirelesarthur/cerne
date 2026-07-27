import type { Meta, StoryObj } from '@storybook/react-vite'
import { SparklineArea } from './SparklineArea'
import { t } from '../../design/tokens'

const meta: Meta<typeof SparklineArea> = {
  title: 'GB CERNE/SparklineArea',
  component: SparklineArea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Mini-gráfico de área/linha SVG usado em KPIs de dashboard para mostrar a tendência recente de um indicador.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SparklineArea>

const TENDENCIA_ALTA = [42, 45, 41, 48, 52, 55, 58, 62, 60, 65]
const TENDENCIA_BAIXA = [65, 62, 60, 58, 55, 52, 48, 45, 41, 38]

export const TendenciaDeAlta: Story = {
  name: 'Tendência de alta',
  args: { data: TENDENCIA_ALTA, color: t.color.feedback.success.solid, height: 60 },
  render: (args) => <div style={{ width: 200 }}><SparklineArea {...args} /></div>,
}

export const TendenciaDeBaixa: Story = {
  name: 'Tendência de baixa',
  args: { data: TENDENCIA_BAIXA, color: t.color.feedback.error.solid, height: 60 },
  render: (args) => <div style={{ width: 200 }}><SparklineArea {...args} /></div>,
}

export const SemPreenchimento: Story = {
  name: 'Sem preenchimento (apenas linha)',
  args: { data: TENDENCIA_ALTA, filled: false, height: 60 },
  render: (args) => <div style={{ width: 200 }}><SparklineArea {...args} /></div>,
}

export const CorPadraoDaMarca: Story = {
  name: 'Cor padrão da marca',
  args: { data: [30, 34, 32, 40, 38, 44, 47, 50], height: 48 },
  render: (args) => <div style={{ width: 180 }}><SparklineArea {...args} /></div>,
}
