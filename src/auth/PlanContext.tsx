import React, { createContext, useContext, useMemo } from 'react'

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type PlanTier = 'trial' | 'essencial' | 'profissional' | 'enterprise'

export type AccountStatus = 'active' | 'trial' | 'past_due' | 'suspended' | 'expired'

interface PlanContextValue {
  plan: PlanTier
  status: AccountStatus
  trialDaysLeft?: number
  /**
   * Retorna `true` se a feature está habilitada no plano atual.
   * Enterprise usa wildcard `'*'` e habilita tudo.
   */
  hasFeature(feature: string): boolean
}

// ─── Mapa de features por plano ──────────────────────────────────────────────

export const PLAN_FEATURES: Record<PlanTier, string[]> = {
  trial: [
    'dashboards.basicos',
    'export.csv',
    'usuarios.ate3',
    'safras.ilimitadas',
    'relatorios.basicos',
  ],
  essencial: [
    'dashboards.basicos',
    'export.csv',
    'export.excel',
    'usuarios.ate10',
    'safras.ilimitadas',
    'relatorios.basicos',
    'relatorios.intermediarios',
    'integrações.basicas',
  ],
  profissional: [
    'dashboards.basicos',
    'dashboards.avancados',
    'export.csv',
    'export.excel',
    'export.pdf',
    'usuarios.ilimitados',
    'safras.ilimitadas',
    'relatorios.basicos',
    'relatorios.intermediarios',
    'relatorios.avancados',
    'integrações.basicas',
    'integrações.avancadas',
    'api.acesso',
    'suporte.prioritario',
  ],
  enterprise: ['*'],
}

// ─── Contexto ────────────────────────────────────────────────────────────────

const PlanContext = createContext<PlanContextValue>({
  plan: 'profissional',
  status: 'active',
  trialDaysLeft: undefined,
  hasFeature: () => true,
})

// ─── Provider ────────────────────────────────────────────────────────────────

interface PlanProviderProps {
  children: React.ReactNode
  /**
   * Plano ativo da conta.
   * Padrão: `'profissional'` — garante que telas existentes não quebrem antes
   * do wiring real de billing estar conectado.
   */
  plan?: PlanTier
  /**
   * Status da conta.
   * Padrão: `'active'`.
   */
  status?: AccountStatus
  /** Dias restantes do período de trial. Relevante quando `status === 'trial'`. */
  trialDaysLeft?: number
  /**
   * Lista de feature flags avulsas que sobrescreve (ou complementa) o mapa do
   * plano. Útil para features habilitadas individualmente pelo back-end.
   */
  features?: string[]
}

export function PlanProvider({
  children,
  plan = 'profissional',
  status = 'active',
  trialDaysLeft,
  features,
}: PlanProviderProps) {
  const value = useMemo<PlanContextValue>(() => {
    const planFeatures = features ?? PLAN_FEATURES[plan]
    const hasWildcard = planFeatures.includes('*')

    function hasFeature(feature: string): boolean {
      if (hasWildcard) return true
      return planFeatures.includes(feature)
    }

    return { plan, status, trialDaysLeft, hasFeature }
  }, [plan, status, trialDaysLeft, features])

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Hook de acesso ao contexto de plano e faturamento.
 *
 * @example
 * const { plan, status, hasFeature } = usePlan()
 * if (hasFeature('export.excel')) { ... }
 * if (status === 'past_due') { mostrarBanner() }
 */
export function usePlan(): PlanContextValue {
  return useContext(PlanContext)
}
