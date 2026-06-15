import React from 'react'
import { usePlan } from '../../auth/PlanContext'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface FeatureGateProps {
  /**
   * Identificador da feature que deve estar habilitada no plano atual.
   * Exemplos: `'export.excel'`, `'dashboards.avancados'`, `'api.acesso'`.
   */
  feature: string
  /**
   * Conteúdo renderizado quando a feature está habilitada.
   */
  children: React.ReactNode
  /**
   * Conteúdo renderizado quando a feature **não** está habilitada.
   * Se omitido, renderiza `null` (elemento simplesmente desaparece).
   */
  fallback?: React.ReactNode
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Renderiza `children` apenas se a feature estiver habilitada no plano atual.
 * Caso contrário, renderiza `fallback` (ou nada, se omitido).
 *
 * @example
 * <FeatureGate feature="export.excel" fallback={<UpgradePrompt requiredPlan="essencial" />}>
 *   <ExportButton />
 * </FeatureGate>
 */
export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const { hasFeature } = usePlan()
  return <>{hasFeature(feature) ? children : fallback}</>
}
