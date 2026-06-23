import type { Meta, StoryObj } from '@storybook/react-vite'
import { Layers } from 'lucide-react'
import { StackedBarChart } from './StackedBarChart'
import { ChartCard } from './ChartCard'

const meta: Meta<typeof StackedBarChart> = {
  title: 'GB CERNE/StackedBarChart',
  component: StackedBarChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Gráfico de barras empilhadas SVG — vertical ou horizontal. Ideal para visualizar composição de custos, culturas ou categorias ao longo do tempo.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof StackedBarChart>

const MESES = ['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan']

// ─── Vertical — composição de custos ─────────────────────────────────────────

export const ComposicaoCustos: Story = {
  name: 'Composição de custos por mês (vertical)',
  args: {
    labels: MESES,
    series: [
      { name: 'Insumos', data: [18000, 22000, 31000, 14000, 8000, 11000] },
      { name: 'Mão-de-obra', data: [9000, 10000, 12000, 11000, 9500, 10000] },
      { name: 'Maquinário', data: [7000, 8500, 14000, 6000, 5000, 7500] },
      { name: 'Outros', data: [3000, 3500, 4000, 2800, 2200, 3200] },
    ],
    height: 250,
    horizontal: false,
    yFormat: (v) => `R$${(v / 1000).toFixed(0)}k`,
    showLegend: true,
  },
}

// ─── Horizontal — produção por cultura ───────────────────────────────────────

export const ProducaoPorCultura: Story = {
  name: 'Produção por fazenda e cultura (horizontal)',
  args: {
    labels: ['Boa Vista', 'Cerrado', 'Serra Verde', 'Chapada'],
    series: [
      { name: 'Soja', data: [3200, 2800, 4100, 1900] },
      { name: 'Milho', data: [1400, 900, 1800, 800] },
      { name: 'Algodão', data: [600, 400, 700, 300] },
    ],
    height: 220,
    horizontal: true,
    yFormat: (v) => `${v.toLocaleString('pt-BR')} sc`,
    showLegend: true,
  },
}

// ─── Integrado ao ChartCard ───────────────────────────────────────────────────

export const DentroDoChartCard: Story = {
  name: 'Dentro do ChartCard',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <ChartCard icon={Layers} title="Composição de Custos — Safra 24/25">
        <StackedBarChart
          labels={MESES}
          series={[
            { name: 'Insumos', data: [18000, 22000, 31000, 14000, 8000, 11000] },
            { name: 'Mão-de-obra', data: [9000, 10000, 12000, 11000, 9500, 10000] },
            { name: 'Maquinário', data: [7000, 8500, 14000, 6000, 5000, 7500] },
          ]}
          height={200}
          yFormat={(v) => `R$${(v / 1000).toFixed(0)}k`}
        />
      </ChartCard>
    </div>
  ),
}

// ─── Estado vazio ─────────────────────────────────────────────────────────────

export const SemDados: Story = {
  name: 'Estado vazio',
  args: {
    labels: [],
    series: [],
    height: 220,
  },
}
