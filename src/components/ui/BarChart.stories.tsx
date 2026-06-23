import type { Meta, StoryObj } from '@storybook/react-vite'
import { BarChart2 } from 'lucide-react'
import { BarChart } from './BarChart'
import { ChartCard } from './ChartCard'
import { t } from '../../design/tokens'

const meta: Meta<typeof BarChart> = {
  title: 'GB CERNE/BarChart',
  component: BarChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Gráfico de barras SVG — vertical ou horizontal. Série única com cor global ou por item. Hover com tooltip tokenizado, grid e labels de eixo.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof BarChart>

// ─── Vertical ─────────────────────────────────────────────────────────────────

export const CustosPorCategoria: Story = {
  name: 'Custos por categoria (vertical)',
  args: {
    data: [
      { label: 'Semente', value: 28500 },
      { label: 'Fertilizante', value: 54000 },
      { label: 'Defensivo', value: 38200 },
      { label: 'Mão-de-obra', value: 31700 },
      { label: 'Maquinário', value: 22400 },
      { label: 'Irrigação', value: 17800 },
    ],
    height: 240,
    horizontal: false,
    yFormat: (v) => `R$${(v / 1000).toFixed(0)}k`,
  },
}

// ─── Horizontal ───────────────────────────────────────────────────────────────

export const ProducaoPorFazenda: Story = {
  name: 'Produção por fazenda (horizontal)',
  args: {
    data: [
      { label: 'Fazenda Boa Vista', value: 4820 },
      { label: 'Fazenda Cerrado', value: 3650 },
      { label: 'Fazenda Serra Verde', value: 5210 },
      { label: 'Fazenda Chapada', value: 2940 },
      { label: 'Fazenda Rio Doce', value: 4100 },
    ],
    height: 220,
    horizontal: true,
    yFormat: (v) => `${v.toLocaleString('pt-BR')} sc`,
    color: t.chart.series[0],
  },
}

// ─── Integrado ao ChartCard ───────────────────────────────────────────────────

export const DentroDoChartCard: Story = {
  name: 'Dentro do ChartCard',
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <ChartCard icon={BarChart2} title="Custos Operacionais por Categoria">
        <BarChart
          data={[
            { label: 'Semente', value: 28500 },
            { label: 'Fertilizante', value: 54000 },
            { label: 'Defensivo', value: 38200 },
            { label: 'Mão-de-obra', value: 31700 },
            { label: 'Maquinário', value: 22400 },
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
    data: [],
    height: 220,
  },
}
