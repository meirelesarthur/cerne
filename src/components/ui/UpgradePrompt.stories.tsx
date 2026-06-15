import type { Meta, StoryObj } from '@storybook/react-vite'
import { UpgradePrompt } from './UpgradePrompt'
import { PlanProvider } from '../../auth/PlanContext'
import { FeatureGate } from './FeatureGate'

const meta: Meta<typeof UpgradePrompt> = {
  title:      'GB CERNE/UpgradePrompt',
  component:  UpgradePrompt,
  parameters: { layout: 'centered' },
  tags:       ['autodocs'],
  decorators: [
    (Story) => (
      <PlanProvider plan="essencial" status="active">
        <div style={{ width: 480 }}>
          <Story />
        </div>
      </PlanProvider>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['card', 'inline'],
    },
    requiredPlan: {
      control: 'select',
      options: ['trial', 'essencial', 'profissional', 'enterprise'],
    },
  },
}

export default meta
type Story = StoryObj<typeof UpgradePrompt>

// ─── Card (padrão) ────────────────────────────────────────────────────────────

export const CardDefault: Story = {
  name: 'Card — padrão',
  args: {
    requiredPlan: 'profissional',
    onUpgrade:    () => alert('Ir para upgrade'),
  },
}

export const CardComTitulo: Story = {
  name: 'Card — título e mensagem personalizados',
  args: {
    title:        'Exportação avançada',
    message:      'Exporte seus dados em Excel com formatação completa de tabelas e gráficos embutidos.',
    requiredPlan: 'essencial',
    onUpgrade:    () => alert('Ir para upgrade'),
  },
}

export const CardSemAcao: Story = {
  name: 'Card — sem botão de ação',
  args: {
    requiredPlan: 'enterprise',
  },
}

// ─── Inline ───────────────────────────────────────────────────────────────────

export const Inline: Story = {
  args: {
    variant:      'inline',
    message:      'Acesso à API disponível no plano Profissional.',
    requiredPlan: 'profissional',
    onUpgrade:    () => alert('Ir para upgrade'),
  },
}

export const InlineSemBotao: Story = {
  name: 'Inline — sem botão',
  args: {
    variant:  'inline',
    message:  'Dashboards avançados disponíveis a partir do plano Profissional.',
  },
}

// ─── FeatureGate integrado ────────────────────────────────────────────────────

export const ComFeatureGate: Story = {
  name: 'Integração com FeatureGate',
  render: () => (
    <PlanProvider plan="essencial" status="active">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6b7280', margin: 0 }}>
          Plano ativo: <strong>Essencial</strong> — feature <code>api.acesso</code> está bloqueada.
        </p>
        <FeatureGate
          feature="api.acesso"
          fallback={
            <UpgradePrompt
              title="Acesso à API"
              message="Integre seus sistemas diretamente com a plataforma GB CERNE via API REST."
              requiredPlan="profissional"
              onUpgrade={() => alert('Ir para upgrade')}
            />
          }
        >
          <div>Conteúdo da API (não será exibido no plano Essencial)</div>
        </FeatureGate>
      </div>
    </PlanProvider>
  ),
}

// ─── Todos os planos ──────────────────────────────────────────────────────────

export const TodosOsPlanos: Story = {
  name: 'Todos os planos requeridos',
  render: () => (
    <PlanProvider plan="trial" status="trial" trialDaysLeft={5}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 480 }}>
        {(['essencial', 'profissional', 'enterprise'] as const).map((plan) => (
          <UpgradePrompt
            key={plan}
            requiredPlan={plan}
            onUpgrade={() => alert(`Upgrade para ${plan}`)}
            variant="inline"
          />
        ))}
      </div>
    </PlanProvider>
  ),
}
