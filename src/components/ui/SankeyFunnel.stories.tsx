import type { Meta, StoryObj } from '@storybook/react-vite'
import { SankeyFunnel, type SankeyFunnelStage } from './SankeyFunnel'
import { useTheme } from '../../context/ThemeContext'
import { t } from '../../design/tokens'

const meta: Meta<typeof SankeyFunnel> = {
  title: 'GB CERNE/SankeyFunnel',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Funil de conversão em SVG (blocos + conectores) — usado nos dashboards para acompanhar etapas sequenciais (ex.: pedido → aprovação → entrega). Cada estágio é focável e mostra tooltip com a taxa de conversão sobre o total.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SankeyFunnel>

const FUNIL_SUPRIMENTOS: SankeyFunnelStage[] = [
  { label: 'Pedidos', value: 1240 },
  { label: 'Aprovados', value: 980 },
  { label: 'Faturados', value: 720 },
  { label: 'Entregues', value: 610 },
]

const FUNIL_SAFRA: SankeyFunnelStage[] = [
  { label: 'Área plantada', value: 4800, sublabel: '4.800 ha' },
  { label: 'Em colheita', value: 3600 },
  { label: 'Colhido', value: 3120 },
]

export const Padrao: Story = {
  name: 'Padrão — funil de compras',
  render: () => {
    const { colors, isGbMode } = useTheme()
    return (
      <div style={{ maxWidth: 720 }}>
        <SankeyFunnel stages={FUNIL_SUPRIMENTOS} colors={colors} isGbMode={isGbMode} chartHeight={160} />
      </div>
    )
  },
}

export const ComSublabel: Story = {
  name: 'Com sublabel e cor customizada',
  render: () => {
    const { colors, isGbMode } = useTheme()
    return (
      <div style={{ maxWidth: 720 }}>
        <SankeyFunnel
          stages={FUNIL_SAFRA}
          colors={colors}
          isGbMode={isGbMode}
          color={t.chart.series[1]}
          chartHeight={180}
        />
      </div>
    )
  },
}

export const DuasEtapas: Story = {
  name: 'Duas etapas',
  render: () => {
    const { colors, isGbMode } = useTheme()
    return (
      <div style={{ maxWidth: 480 }}>
        <SankeyFunnel
          stages={[
            { label: 'Solicitado', value: 500 },
            { label: 'Concluído', value: 340 },
          ]}
          colors={colors}
          isGbMode={isGbMode}
          chartHeight={140}
        />
      </div>
    )
  },
}
