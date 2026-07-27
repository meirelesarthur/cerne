import type { Meta, StoryObj } from '@storybook/react-vite'
import { Wallet, TrendingUp, Sprout, AlertTriangle } from 'lucide-react'
import { KpiStatCard } from './KpiStatCard'
import { t } from '../../design/tokens'

const meta: Meta<typeof KpiStatCard> = {
  title: 'GB CERNE/KpiStatCard',
  component: KpiStatCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 260, fontFamily: "'Outfit', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof KpiStatCard>

// ─── Padrão ─────────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    icon: Wallet,
    label: 'Saldo Total',
    value: 'R$ 482,3K',
    sub: 'Período completo',
    trend: '12,4%',
    trendUp: true,
  },
}

// ─── Tendência negativa ─────────────────────────────────────────────────────────

export const TendenciaNegativa: Story = {
  name: 'Tendência negativa',
  args: {
    icon: AlertTriangle,
    label: 'Contas a Pagar Vencidas',
    value: 'R$ 38,1K',
    sub: '+30 dias',
    trend: '8,2%',
    trendUp: false,
    accentColor: t.color.feedback.error.solid,
  },
}

// ─── Sem tendência ──────────────────────────────────────────────────────────────

export const SemTendencia: Story = {
  name: 'Sem tendência',
  args: {
    icon: Sprout,
    label: 'Área Plantada',
    value: '1.240 ha',
    sub: 'Safra 2024/25',
  },
}

// ─── Valor longo (degrau de fonte menor) ────────────────────────────────────────

export const ValorLongo: Story = {
  name: 'Valor longo (degrau de fonte automático)',
  args: {
    icon: TrendingUp,
    label: 'Margem por Hectare',
    value: 'R$ 1.847,90/ha',
    trend: '5,1%',
    trendUp: true,
  },
}

// ─── Grade de KPIs (uso real em dashboard) ──────────────────────────────────────

export const GradeDeKpis: Story = {
  name: 'Grade de KPIs (uso real em dashboard)',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, width: 560 }}>
      <KpiStatCard icon={Wallet} label="Saldo Total" value="R$ 482,3K" trend="12,4%" trendUp />
      <KpiStatCard icon={TrendingUp} label="A Receber" value="R$ 210,0K" trend="4,8%" trendUp />
      <KpiStatCard icon={AlertTriangle} label="A Pagar" value="R$ 96,5K" trend="3,1%" trendUp={false} accentColor={t.color.feedback.error.solid} />
      <KpiStatCard icon={Sprout} label="Área Plantada" value="1.240 ha" sub="Safra 2024/25" />
    </div>
  ),
}
