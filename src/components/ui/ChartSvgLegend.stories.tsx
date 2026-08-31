import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChartSvgLegend, chartLegendHeight } from './ChartSvgLegend'
import { t } from '../../design/tokens'

const meta: Meta<typeof ChartSvgLegend> = {
  title: 'GB CERNE/ChartSvgLegend',
  component: ChartSvgLegend,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ChartSvgLegend>

/** A legenda vive dentro do SVG do gráfico — o decorator simula esse contexto. */
function Canvas({ width, children }: { width: number; children: React.ReactNode }) {
  return (
    <svg width={width} height={chartLegendHeight(1)} viewBox={`0 0 ${width} ${chartLegendHeight(1)}`} style={{ display: 'block' }}>
      {children}
    </svg>
  )
}

// ─── Padrão ─────────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Canvas width={520}>
      <ChartSvgLegend
        items={[
          { name: 'Máquinas/Equip.', color: t.color.brand[600] },
          { name: 'Veículos', color: t.color.brand[400] },
          { name: 'Benfeitorias', color: t.color.brand[200] },
          { name: 'Outros', color: t.color.neutral[300] },
        ]}
        k={1}
        x={0}
        y={0}
        maxWidth={520}
      />
    </Canvas>
  ),
}

// ─── Espaço curto ───────────────────────────────────────────────────────────────
// `maxWidth` corta o que não caberia na faixa em vez de deixar vazar do gráfico.

export const EspacoCurto: Story = {
  name: 'Espaço curto',
  render: () => (
    <Canvas width={200}>
      <ChartSvgLegend
        items={[
          { name: 'Máquinas/Equip.', color: t.color.brand[600] },
          { name: 'Veículos', color: t.color.brand[400] },
          { name: 'Benfeitorias', color: t.color.brand[200] },
        ]}
        k={1}
        x={0}
        y={0}
        maxWidth={200}
      />
    </Canvas>
  ),
}
