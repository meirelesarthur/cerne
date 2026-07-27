import type { Meta, StoryObj } from '@storybook/react-vite'
import { FarmSwitcher } from './FarmSwitcher'
import { FarmProvider } from '../../context/FarmContext'

const meta: Meta<typeof FarmSwitcher> = {
  title: 'GB CERNE/FarmSwitcher',
  component: FarmSwitcher,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Seletor de fazenda ativa (usado na Topbar). Depende de `FarmProvider` (`src/context/FarmContext.tsx`) para a lista de fazendas e a fazenda atual — a story envolve o componente no provider para funcionar isoladamente.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <FarmProvider>
        <div style={{ fontFamily: "'Outfit', sans-serif" }}>
          <Story />
        </div>
      </FarmProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FarmSwitcher>

// ─── Padrão ─────────────────────────────────────────────────────────────────────

export const Default: Story = {}

// ─── Sobre fundo escuro (Topbar) ────────────────────────────────────────────────

export const SobreFundoEscuro: Story = {
  name: 'Sobre fundo escuro (Topbar)',
  render: () => (
    <div style={{ background: '#111827', padding: 16, borderRadius: 8 }}>
      <FarmSwitcher />
    </div>
  ),
}
