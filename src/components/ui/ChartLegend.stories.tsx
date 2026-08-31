import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChartLegend } from './ChartLegend'
import { t } from '../../design/tokens'

const meta: Meta<typeof ChartLegend> = {
  title: 'GB CERNE/ChartLegend',
  component: ChartLegend,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ChartLegend>

// ─── Ponto (séries de área, barra e fatia) ──────────────────────────────────────

export const Default: Story = {
  args: {
    items: [
      { label: 'Receitas', color: t.color.brand[600] },
      { label: 'Despesas', color: t.color.feedback.error.solid },
      { label: 'Margem', color: t.color.accent.purple.text },
    ],
  },
}

// ─── Linha (séries de linha) ────────────────────────────────────────────────────

export const Linha: Story = {
  args: {
    marker: 'line',
    items: [
      { label: 'Entradas', color: t.color.brand[600] },
      { label: 'Saídas', color: t.color.feedback.error.solid },
      { label: 'Saldo', color: t.color.neutral[500], dashed: true },
    ],
  },
}

// ─── Projeção (traço tracejado) ─────────────────────────────────────────────────

export const ComProjecao: Story = {
  args: {
    marker: 'line',
    items: [
      { label: 'Realizado', color: t.color.brand[600] },
      { label: 'Projeção', color: t.color.brand[400], dashed: true },
    ],
  },
}
