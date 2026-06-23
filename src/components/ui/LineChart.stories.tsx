import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrendingUp } from 'lucide-react'
import { LineChart } from './LineChart'
import { ChartCard } from './ChartCard'

const meta: Meta<typeof LineChart> = {
  title: 'GB CERNE/LineChart',
  component: LineChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Gráfico de linhas SVG para séries temporais. Suporta múltiplas séries, área preenchida, grid, legenda e tooltip interativo. Usa `useTheme()` internamente — funciona em Light e GBMode.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof LineChart>

const MESES = ['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai']

// ─── Série única ──────────────────────────────────────────────────────────────

export const ProducaoMensal: Story = {
  name: 'Produção mensal (série única)',
  args: {
    labels: MESES,
    series: [
      {
        name: 'Sacas colhidas',
        data: [1240, 1380, 1520, 1490, 1600, 1750, 1820, 1680, 1920, 2100],
      },
    ],
    height: 220,
    yFormat: (v) => `${(v / 1000).toFixed(1)}k`,
    showGrid: true,
    showLegend: false,
    area: false,
  },
}

// ─── Multi-série com área ─────────────────────────────────────────────────────

export const ReceitaDespesa: Story = {
  name: 'Receita vs Despesa (multi-série + área)',
  args: {
    labels: MESES,
    series: [
      {
        name: 'Receita',
        data: [42000, 48000, 51000, 46000, 55000, 62000, 58000, 67000, 73000, 80000],
      },
      {
        name: 'Despesa',
        data: [31000, 34000, 38000, 36000, 39000, 42000, 44000, 41000, 45000, 49000],
      },
    ],
    height: 240,
    yFormat: (v) => `R$${(v / 1000).toFixed(0)}k`,
    showGrid: true,
    showLegend: true,
    area: true,
  },
}

// ─── Integrado ao ChartCard ───────────────────────────────────────────────────

export const DentroDoChartCard: Story = {
  name: 'Dentro do ChartCard',
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <ChartCard icon={TrendingUp} title="Evolução de Receita">
        <LineChart
          labels={MESES}
          series={[
            {
              name: 'Fazenda A',
              data: [42000, 48000, 51000, 46000, 55000, 62000, 58000, 67000, 73000, 80000],
            },
            {
              name: 'Fazenda B',
              data: [28000, 30000, 33000, 31000, 36000, 40000, 38000, 44000, 48000, 52000],
            },
          ]}
          height={200}
          yFormat={(v) => `R$${(v / 1000).toFixed(0)}k`}
          area
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
