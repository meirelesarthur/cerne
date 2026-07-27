import { useState } from 'react'
import { Download, Eye, Lock, Plus, Trash2 } from 'lucide-react'
import { PermissionGuard, PermissionProvider, type Role } from '../../auth'
import { PlanProvider, type AccountStatus } from '../../auth/PlanContext'
import { AccountStatusBanner } from '../../components/ui/AccountStatusBanner'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { FeatureGate } from '../../components/ui/FeatureGate'
import { FeedbackBanner } from '../../components/ui/FeedbackBanner'
import { Heading } from '../../components/ui/Heading'
import { PageCard } from '../../components/ui/PageCard'
import { PageContainer } from '../../components/ui/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader'
import { RadioGroup, type RadioOption } from '../../components/ui/RadioGroup'
import { ToastContainer, useToast } from '../../components/ui/Toast'
import { UpgradePrompt } from '../../components/ui/UpgradePrompt'
import { useTheme } from '../../context/ThemeContext'
import { t } from '../../design/tokens'

// ─── Dados de demonstração ───────────────────────────────────────────────────

interface AccountStatusDemo {
  status: AccountStatus
  label: string
  trialDaysLeft?: number
}

const ACCOUNT_STATES: AccountStatusDemo[] = [
  { status: 'trial', label: 'Em avaliação', trialDaysLeft: 7 },
  { status: 'past_due', label: 'Pagamento em atraso' },
  { status: 'suspended', label: 'Conta suspensa' },
  { status: 'expired', label: 'Assinatura expirada' },
]

const ROLE_OPTIONS: RadioOption[] = [
  { value: 'admin', label: 'Administrador', description: 'Acesso irrestrito — permissão curinga (*).' },
  { value: 'manager', label: 'Gerente', description: 'Operação completa; sem gestão de usuários/config nem exportação.' },
  { value: 'operator', label: 'Operador', description: 'Cria e edita; não exclui nem acessa a área financeira.' },
  { value: 'viewer', label: 'Visualizador', description: 'Somente leitura em todos os domínios.' },
]

// ─── Página ──────────────────────────────────────────────────────────────────

/**
 * Tela de referência (fora do fluxo de negócio) para os padrões de billing,
 * feature-gating e RBAC visível do design system GB CERNE. Fecha a cobertura
 * de `AccountStatusBanner`, `FeatureGate`, `UpgradePrompt` e `RadioGroup` —
 * antes órfãos, sem tela viva que os exercitasse — e demonstra RBAC como
 * UI condicionada à permissão de quem está vendo a tela, distinto da
 * atribuição de papel a um usuário (isso já é feito em Cadastros > Usuários).
 */
export default function EstadosContaPage() {
  const { colors } = useTheme()
  const [simulatedRole, setSimulatedRole] = useState<Role>('viewer')
  const { toasts, show, dismiss } = useToast()

  const sectionDescriptionStyle: React.CSSProperties = {
    margin: 0,
    marginTop: t.space[1],
    maxWidth: 720,
    fontSize: t.font.size.sm,
    color: colors.fg.subtle,
    fontFamily: t.font.family.sans,
    lineHeight: t.font.lineHeight.normal,
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader
          title="Estados de Conta & Controle de Acesso"
          description="Referência viva dos padrões de billing, feature-gating e RBAC — consulta para devs e POs, fora do fluxo de negócio."
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: t.space[8],
            padding: `0 ${t.space[1]}px ${t.space[6]}px`,
          }}
        >
          {/* ── Seção 1 — Estados de conta ────────────────────────────────── */}
          <section>
            <Heading level={3} size="lg">Estados de conta</Heading>
            <p style={sectionDescriptionStyle}>
              <code>AccountStatusBanner</code> lido do contexto de plano (<code>usePlan()</code>),
              com override explícito por prop nesta vitrine — cada cartão simula um status
              diferente da assinatura.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: t.space[4],
                marginTop: t.space[4],
              }}
            >
              {ACCOUNT_STATES.map((demo) => (
                <Card key={demo.status} padding={t.space[4]}>
                  <Badge label={demo.label} variant="neutral" />
                  <div style={{ marginTop: t.space[3] }}>
                    <AccountStatusBanner
                      status={demo.status}
                      trialDaysLeft={demo.trialDaysLeft}
                      onAction={() => show(`Simulação: ação de "${demo.label}" acionada.`, 'info')}
                    />
                  </div>
                </Card>
              ))}
            </div>

            <div style={{ marginTop: t.space[4] }}>
              <FeedbackBanner
                variant="info"
                title='Status "active" não renderiza nada'
                description='Comportamento esperado do componente: para contas ativas, AccountStatusBanner retorna null — nenhum aviso é necessário no dia a dia.'
              />
            </div>
          </section>

          {/* ── Seção 2 — Recurso bloqueado por plano ─────────────────────── */}
          <section>
            <Heading level={3} size="lg">Recurso bloqueado por plano</Heading>
            <p style={sectionDescriptionStyle}>
              <code>FeatureGate</code> decide o que renderizar a partir de <code>usePlan().hasFeature()</code>;
              quando o recurso não está no plano, mostra <code>UpgradePrompt</code>. Esta seção simula
              uma conta no plano <strong>Essencial</strong> (via <code>PlanProvider</code> local).
            </p>

            <PlanProvider plan="essencial">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: t.space[4],
                  marginTop: t.space[4],
                }}
              >
                <Card padding={t.space[4]}>
                  <Badge label="Recurso fora do plano atual" variant="warning" />
                  <div style={{ marginTop: t.space[3] }}>
                    <FeatureGate
                      feature="dashboards.avancados"
                      fallback={
                        <UpgradePrompt
                          requiredPlan="profissional"
                          onUpgrade={() => show('Simulação: redirecionar para upgrade de plano.', 'info')}
                        />
                      }
                    >
                      <FeedbackBanner
                        variant="success"
                        title="Dashboards avançados liberados"
                        description="Este plano já tem acesso ao recurso — este bloco não deveria aparecer no plano Essencial."
                      />
                    </FeatureGate>
                  </div>
                </Card>

                <Card padding={t.space[4]}>
                  <Badge label="Recurso já incluso no plano" variant="success" />
                  <div style={{ marginTop: t.space[3] }}>
                    <FeatureGate
                      feature="export.csv"
                      fallback={
                        <UpgradePrompt
                          variant="inline"
                          requiredPlan="essencial"
                          onUpgrade={() => show('Simulação: redirecionar para upgrade de plano.', 'info')}
                        />
                      }
                    >
                      <Button
                        variant="secondary"
                        icon={<Download size={16} aria-hidden="true" />}
                        onClick={() => show('Exportação simulada iniciada.', 'success')}
                      >
                        Exportar CSV
                      </Button>
                    </FeatureGate>
                  </div>
                </Card>
              </div>
            </PlanProvider>
          </section>

          {/* ── Seção 3 — RBAC visível por papel ──────────────────────────── */}
          <section>
            <Heading level={3} size="lg">Controle de acesso por papel (RBAC visível)</Heading>
            <p style={sectionDescriptionStyle}>
              Diferente de <strong>atribuir um papel a um usuário</strong> (formulário de
              Cadastros &gt; Usuários), esta seção demonstra a <strong>UI se comportando de
              forma diferente conforme o papel de quem está vendo a tela</strong>, via{' '}
              <code>PermissionGuard</code>/<code>usePermission().can()</code>. Escolha um papel
              simulado para ver as ações mudarem em tempo real.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(240px, 300px) 1fr',
                gap: t.space[6],
                marginTop: t.space[4],
                alignItems: 'start',
              }}
            >
              <Card padding={t.space[4]}>
                <RadioGroup
                  label="Papel simulado"
                  name="simulated-role"
                  value={simulatedRole}
                  onChange={(value) => setSimulatedRole(value as Role)}
                  options={ROLE_OPTIONS}
                />
              </Card>

              <Card padding={t.space[4]}>
                <PermissionProvider role={simulatedRole}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space[2] }}>
                    {/* Oculta por completo quando não permitido — sem fallback */}
                    <PermissionGuard need="fazenda.view">
                      <Button variant="secondary" icon={<Eye size={16} aria-hidden="true" />}>
                        Ver Fazenda
                      </Button>
                    </PermissionGuard>

                    {/* Substitui por estado desabilitado quando não permitido — com fallback */}
                    <PermissionGuard
                      need="fazenda.create"
                      fallback={
                        <Button variant="secondary" disabled icon={<Lock size={16} aria-hidden="true" />}>
                          Criar Fazenda
                        </Button>
                      }
                    >
                      <Button variant="secondary" icon={<Plus size={16} aria-hidden="true" />}>
                        Criar Fazenda
                      </Button>
                    </PermissionGuard>

                    <PermissionGuard
                      need="fazenda.delete"
                      fallback={
                        <Button variant="destructive" disabled icon={<Lock size={16} aria-hidden="true" />}>
                          Excluir Fazenda…
                        </Button>
                      }
                    >
                      <Button variant="destructive" icon={<Trash2 size={16} aria-hidden="true" />}>
                        Excluir Fazenda…
                      </Button>
                    </PermissionGuard>

                    <PermissionGuard
                      need="financeiro.export"
                      fallback={
                        <Button variant="secondary" disabled icon={<Lock size={16} aria-hidden="true" />}>
                          Exportar Financeiro
                        </Button>
                      }
                    >
                      <Button variant="secondary" icon={<Download size={16} aria-hidden="true" />}>
                        Exportar Financeiro
                      </Button>
                    </PermissionGuard>
                  </div>
                </PermissionProvider>

                <div style={{ marginTop: t.space[4] }}>
                  <FeedbackBanner
                    variant="info"
                    title="Ocultar vs. desabilitar"
                    description='"Ver Fazenda" some por completo sem a permissão (sem fallback); as demais trocam para um estado desabilitado com ícone de cadeado (com fallback) — os dois usos válidos de PermissionGuard, conforme a necessidade de UX de cada ação.'
                  />
                </div>
              </Card>
            </div>
          </section>
        </div>
      </PageCard>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
