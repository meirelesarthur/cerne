import type { Meta, StoryObj } from '@storybook/react-vite'
import { HeatmapChart } from './HeatmapChart'
import { useTheme } from '../../context/ThemeContext'
import { t } from '../../design/tokens'

// HeatmapChart recebe `colors`/`isGbMode` como props em vez de ler o contexto
// internamente (quem o usa nos dashboards já tem esses valores via useTheme()).
// A story lê o mesmo contexto (fornecido globalmente pelo decorator do
// preview.tsx) para repassar os valores corretos ao componente.
function ConnectedHeatmap(props: Omit<React.ComponentProps<typeof HeatmapChart>, 'colors' | 'isGbMode'>) {
  const { colors, isGbMode } = useTheme()
  return <HeatmapChart {...props} colors={colors} isGbMode={isGbMode} />
}

const meta: Meta<typeof HeatmapChart> = {
  title: 'GB CERNE/HeatmapChart',
  component: HeatmapChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Mapa de calor SVG para densidade de atividade (ex.: receita por dia/hora). Recebe `colors`/`isGbMode` do chamador — as stories usam `useTheme()` para repassar o tema ativo do Storybook.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 460 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof HeatmapChart>

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const HORARIOS = ['6h', '9h', '12h', '15h', '18h', '21h', '0h', '3h']

const ATIVIDADE_RECEITA = [
  [2, 5, 8, 12, 6, 3, 1, 0],
  [3, 6, 9, 14, 7, 4, 1, 0],
  [1, 4, 7, 10, 5, 2, 0, 0],
  [4, 7, 11, 16, 8, 5, 2, 1],
  [5, 9, 13, 18, 10, 6, 3, 1],
  [1, 2, 3, 5, 2, 1, 0, 0],
  [0, 1, 1, 2, 1, 0, 0, 0],
]

// ─── Padrão ─────────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <ConnectedHeatmap data={ATIVIDADE_RECEITA} rowLabels={DIAS} colLabels={HORARIOS} />
  ),
}

// ─── Cor de destaque customizada ────────────────────────────────────────────────

export const CorCustomizada: Story = {
  name: 'Cor de destaque customizada',
  render: () => (
    <ConnectedHeatmap
      data={ATIVIDADE_RECEITA}
      rowLabels={DIAS}
      colLabels={HORARIOS}
      highColor={t.color.accent.purple.text}
    />
  ),
}

// ─── Dados esparsos ─────────────────────────────────────────────────────────────

export const DadosEsparsos: Story = {
  name: 'Dados esparsos (maioria zerada)',
  render: () => (
    <ConnectedHeatmap
      data={[
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0],
      ]}
      rowLabels={['Talhão A', 'Talhão B', 'Talhão C']}
      colLabels={['Jan', 'Fev', 'Mar', 'Abr', 'Mai']}
    />
  ),
}

// ─── Grade pequena ──────────────────────────────────────────────────────────────

export const GradePequena: Story = {
  name: 'Grade pequena (poucas linhas/colunas)',
  render: () => (
    <ConnectedHeatmap
      data={[
        [8, 12],
        [3, 6],
      ]}
      rowLabels={['Safra 2023/24', 'Safra 2024/25']}
      colLabels={['1º Sem', '2º Sem']}
    />
  ),
}
