import type { Meta, StoryObj } from '@storybook/react-vite'
import { type IconName } from './Icon'
import { ChartCard } from './ChartCard'
import { LineChart } from './LineChart'
import { t } from '../../design/tokens'

const meta: Meta<typeof ChartCard> = {
  title: 'GB CERNE/ChartCard',
  component: ChartCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480, fontFamily: "'Outfit', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ChartCard>

const MESES = ['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan']

// ─── Padrão ─────────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <ChartCard icon={'trend-up'} title="Evolução de Receita">
      <LineChart
        labels={MESES}
        series={[{ name: 'Receita', data: [42000, 48000, 51000, 46000, 55000, 62000] }]}
        height={180}
        yFormat={(v) => `R$${(v / 1000).toFixed(0)}k`}
        area
        showLegend={false}
      />
    </ChartCard>
  ),
}

// ─── Com ação no header ─────────────────────────────────────────────────────────

export const ComAcao: Story = {
  name: 'Com ação no header',
  render: () => (
    <ChartCard
      icon={'water'}
      title="Volume Pluviométrico"
      action={
        <span style={{ fontSize: t.font.size.xs, color: t.color.neutral[500] }}>Últimos 6 meses</span>
      }
    >
      <LineChart
        labels={MESES}
        series={[{ name: 'Chuva', data: [120, 95, 60, 40, 30, 80] }]}
        height={180}
        yFormat={(v) => `${v}mm`}
        showLegend={false}
      />
    </ChartCard>
  ),
}

// ─── Sem ícone (padrão nos dashboards — ver Regra G) ────────────────────────────

export const SemIcone: Story = {
  name: 'Sem ícone',
  render: () => (
    <ChartCard title="Margem por hectare">
      <LineChart
        labels={MESES}
        series={[{ name: 'Margem', data: [800, 950, 1020, 890, 1100, 1250] }]}
        height={t.size.chart.sm}
        yFormat={(v) => `R$${v}`}
        showLegend={false}
      />
    </ChartCard>
  ),
}
