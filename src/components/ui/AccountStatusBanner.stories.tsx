import type { Meta, StoryObj } from '@storybook/react-vite'
import { AccountStatusBanner } from './AccountStatusBanner'
import { PlanProvider } from '../../auth/PlanContext'

const meta: Meta<typeof AccountStatusBanner> = {
  title:      'GB CERNE/AccountStatusBanner',
  component:  AccountStatusBanner,
  parameters: { layout: 'padded' },
  tags:       ['autodocs'],
  decorators: [
    (Story, ctx) => (
      <PlanProvider
        plan="profissional"
        status={ctx.args.status ?? 'active'}
        trialDaysLeft={ctx.args.trialDaysLeft}
      >
        <Story />
      </PlanProvider>
    ),
  ],
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'trial', 'past_due', 'suspended', 'expired'],
    },
    trialDaysLeft: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof AccountStatusBanner>

// ─── Trial ────────────────────────────────────────────────────────────────────

export const Trial: Story = {
  args: {
    status:        'trial',
    trialDaysLeft: 7,
    onAction:      () => alert('Ir para upgrade'),
  },
}

export const TrialUltimosDias: Story = {
  name: 'Trial — último dia',
  args: {
    status:        'trial',
    trialDaysLeft: 1,
    onAction:      () => alert('Ir para upgrade'),
    actionLabel:   'Fazer upgrade agora',
  },
}

// ─── Past due ─────────────────────────────────────────────────────────────────

export const PastDue: Story = {
  name: 'Pagamento em atraso',
  args: {
    status:   'past_due',
    onAction: () => alert('Ir para faturamento'),
  },
}

// ─── Suspended ────────────────────────────────────────────────────────────────

export const Suspended: Story = {
  name: 'Conta suspensa',
  args: {
    status:   'suspended',
    onAction: () => alert('Contatar suporte'),
    actionLabel: 'Falar com suporte',
  },
}

// ─── Expired ──────────────────────────────────────────────────────────────────

export const Expired: Story = {
  name: 'Assinatura expirada',
  args: {
    status:   'expired',
    onAction: () => alert('Renovar'),
  },
}

// ─── Active (não renderiza) ───────────────────────────────────────────────────

export const Active: Story = {
  name: 'Active — não renderiza nada',
  args: {
    status: 'active',
  },
}

// ─── Sem botão de ação ────────────────────────────────────────────────────────

export const SemAcao: Story = {
  name: 'Trial sem botão de ação',
  args: {
    status:        'trial',
    trialDaysLeft: 14,
  },
}

// ─── Todos os banners ─────────────────────────────────────────────────────────

export const TodosOsStatus: Story = {
  name: 'Todos os status (exceto active)',
  render: () => (
    <PlanProvider plan="essencial" status="active">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AccountStatusBanner
          status="trial"
          trialDaysLeft={7}
          onAction={() => {}}
        />
        <AccountStatusBanner
          status="past_due"
          onAction={() => {}}
        />
        <AccountStatusBanner
          status="suspended"
          onAction={() => {}}
        />
        <AccountStatusBanner
          status="expired"
          onAction={() => {}}
        />
      </div>
    </PlanProvider>
  ),
}
