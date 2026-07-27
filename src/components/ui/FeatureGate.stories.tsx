import type { Meta, StoryObj } from '@storybook/react-vite'
import { FeatureGate } from './FeatureGate'
import { PlanProvider } from '../../auth/PlanContext'
import { Card } from './Card'
import { UpgradePrompt } from './UpgradePrompt'

const meta: Meta<typeof FeatureGate> = {
  title: 'GB CERNE/FeatureGate',
  component: FeatureGate,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Renderiza `children` apenas se a feature estiver habilitada no plano atual (via `usePlan()`, de `src/auth/PlanContext.tsx`). As stories envolvem o componente em `PlanProvider` com planos distintos para demonstrar os dois caminhos.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof FeatureGate>

// ─── Feature habilitada ─────────────────────────────────────────────────────────

export const FeatureHabilitada: Story = {
  name: 'Feature habilitada no plano',
  render: () => (
    <PlanProvider plan="profissional" status="active">
      <FeatureGate feature="dashboards.avancados">
        <Card>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>
            Conteúdo do dashboard avançado (visível — plano Profissional tem a feature).
          </span>
        </Card>
      </FeatureGate>
    </PlanProvider>
  ),
}

// ─── Feature bloqueada, sem fallback ────────────────────────────────────────────

export const FeatureBloqueadaSemFallback: Story = {
  name: 'Feature bloqueada, sem fallback (nada renderiza)',
  render: () => (
    <PlanProvider plan="essencial" status="active">
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6b7280', width: 320 }}>
        <p style={{ margin: '0 0 8px' }}>
          Plano Essencial não tem a feature <code>dashboards.avancados</code> — o elemento abaixo
          simplesmente desaparece:
        </p>
        <FeatureGate feature="dashboards.avancados">
          <Card>Conteúdo do dashboard avançado</Card>
        </FeatureGate>
        <p style={{ margin: '8px 0 0', fontStyle: 'italic' }}>(nada é exibido aqui)</p>
      </div>
    </PlanProvider>
  ),
}

// ─── Feature bloqueada, com fallback de upgrade ─────────────────────────────────

export const FeatureBloqueadaComFallback: Story = {
  name: 'Feature bloqueada, com fallback de upgrade',
  render: () => (
    <PlanProvider plan="essencial" status="active">
      <div style={{ width: 420 }}>
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
          <Card>Conteúdo de acesso à API</Card>
        </FeatureGate>
      </div>
    </PlanProvider>
  ),
}

// ─── Enterprise (wildcard libera tudo) ──────────────────────────────────────────

export const PlanoEnterprise: Story = {
  name: 'Plano Enterprise (wildcard libera tudo)',
  render: () => (
    <PlanProvider plan="enterprise" status="active">
      <FeatureGate feature="qualquer.feature.inexistente">
        <Card>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>
            Conteúdo visível — plano Enterprise habilita qualquer feature via wildcard.
          </span>
        </Card>
      </FeatureGate>
    </PlanProvider>
  ),
}
