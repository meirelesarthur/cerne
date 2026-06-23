import type { Meta, StoryObj } from '@storybook/react-vite'
import { LayoutDashboard } from 'lucide-react'
import { GroupedBarChart } from './GroupedBarChart'
import { ChartCard } from './ChartCard'

const meta: Meta<typeof GroupedBarChart> = {
  title: 'GB CERNE/GroupedBarChart',
  component: GroupedBarChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Gráfico de barras agrupadas SVG — múltiplas séries lado a lado por categoria. Útil para comparar períodos ou safras em paralelo.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof GroupedBarChart>

const SAFRAS = ['Ago/Set', 'Out/Nov', 'Dez/Jan', 'Fev/Mar', 'Abr/Mai']

// ─── Duas safras ──────────────────────────────────────────────────────────────

export const ComparacaoSafras: Story = {
  name: 'Comparação de safras',
  args: {
    labels: SAFRAS,
    series: [
      { name: 'Safra 23/24', data: [8200, 9400, 11200, 10600, 12800] },
      { name: 'Safra 24/25', data: [8900, 10100, 12400, 11800, 14200] },
    ],
    height: 240,
    yFormat: (v) => `${(v / 1000).toFixed(1)}k sc`,
    showLegend: true,
  },
}

// ─── Três séries (custos) ─────────────────────────────────────────────────────

export const CustosPorEtapa: Story = {
  name: 'Custos por etapa e categoria',
  args: {
    labels: ['Plantio', 'Crescimento', 'Colheita'],
    series: [
      { name: 'Insumos', data: [42000, 18000, 8000] },
      { name: 'Mão-de-obra', data: [15000, 12000, 24000] },
      { name: 'Maquinário', data: [22000, 9000, 31000] },
    ],
    height: 250,
    yFormat: (v) => `R$${(v / 1000).toFixed(0)}k`,
    showLegend: true,
  },
}

// ─── Integrado ao ChartCard ───────────────────────────────────────────────────

export const DentroDoChartCard: Story = {
  name: 'Dentro do ChartCard',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <ChartCard icon={LayoutDashboard} title="Produção — Safra 23/24 vs 24/25">
        <GroupedBarChart
          labels={SAFRAS}
          series={[
            { name: 'Safra 23/24', data: [8200, 9400, 11200, 10600, 12800] },
            { name: 'Safra 24/25', data: [8900, 10100, 12400, 11800, 14200] },
          ]}
          height={200}
          yFormat={(v) => `${(v / 1000).toFixed(1)}k`}
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
