import type { Meta, StoryObj } from '@storybook/react-vite'
import { PieChart } from 'lucide-react'
import { DonutChart } from './DonutChart'
import { ChartCard } from './ChartCard'

const meta: Meta<typeof DonutChart> = {
  title: 'GB CERNE/DonutChart',
  component: DonutChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Gráfico de rosca (donut) SVG com rótulo central, tooltip e legenda. A legenda vai ao LADO quando o card é retangular (o donut usa a altura inteira) e abaixo, em duas colunas, no card estreito. O valor do centro é dimensionado pelo buraco do donut — escolhe o maior degrau da escala que cabe. Slice ativa expande levemente no hover. Funciona em Light e GBMode.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DonutChart>

// ─── Distribuição de custos ───────────────────────────────────────────────────

export const DistribuicaoCustos: Story = {
  name: 'Distribuição de custos',
  args: {
    data: [
      { label: 'Insumos', value: 54000 },
      { label: 'Mão-de-obra', value: 28000 },
      { label: 'Maquinário', value: 21000 },
      { label: 'Irrigação', value: 12000 },
      { label: 'Outros', value: 7800 },
    ],
    height: 280,
    centerLabel: 'Total',
    centerValue: 'R$123k',
    showLegend: true,
    valueFormat: (v) => `R$${(v / 1000).toFixed(1)}k`,
  },
}

// ─── Legenda ao lado × abaixo ─────────────────────────────────────────────────
// Mesmos dados, larguras diferentes: no card largo a legenda vira coluna à
// direita e o donut cresce; no estreito, volta para duas colunas embaixo.

const COE = [
  { label: 'Ração', value: 1290 },
  { label: 'Sanitário', value: 240 },
  { label: 'Mão de obra', value: 280 },
  { label: 'Depreciação', value: 130 },
  { label: 'Outros', value: 108 },
]

export const LegendaAoLado: Story = {
  name: 'Legenda ao lado (card largo)',
  render: () => (
    <div style={{ width: 860 }}>
      <DonutChart
        data={COE}
        height={260}
        centerLabel="COE total"
        centerValue="R$ 2.048"
        valueFormat={(v) => `R$ ${v} mil`}
      />
    </div>
  ),
}

export const LegendaAbaixo: Story = {
  name: 'Legenda abaixo (card estreito)',
  render: () => (
    <div style={{ width: 300 }}>
      <DonutChart
        data={COE}
        height={220}
        centerLabel="COE total"
        centerValue="R$ 2.048"
        valueFormat={(v) => `R$ ${v} mil`}
      />
    </div>
  ),
}

// ─── Culturas por área ────────────────────────────────────────────────────────

export const CulturasPorArea: Story = {
  name: 'Culturas por área plantada',
  args: {
    data: [
      { label: 'Soja', value: 4800 },
      { label: 'Milho', value: 1920 },
      { label: 'Algodão', value: 880 },
      { label: 'Trigo', value: 420 },
    ],
    height: 260,
    centerLabel: 'ha plantados',
    centerValue: '8.020',
    showLegend: true,
    valueFormat: (v) => `${v.toLocaleString('pt-BR')} ha`,
  },
}

// ─── Integrado ao ChartCard ───────────────────────────────────────────────────

export const DentroDoChartCard: Story = {
  name: 'Dentro do ChartCard',
  render: () => (
    <div style={{ maxWidth: 440 }}>
      <ChartCard icon={PieChart} title="Distribuição de Custos — Safra 24/25">
        <DonutChart
          data={[
            { label: 'Insumos', value: 54000 },
            { label: 'Mão-de-obra', value: 28000 },
            { label: 'Maquinário', value: 21000 },
            { label: 'Irrigação', value: 12000 },
            { label: 'Outros', value: 7800 },
          ]}
          height={260}
          centerLabel="Total"
          centerValue="R$123k"
          valueFormat={(v) => `R$${(v / 1000).toFixed(1)}k`}
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
