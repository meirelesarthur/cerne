import { useState } from 'react'
import { AlertTriangle, Boxes, Sparkles, ShieldCheck } from 'lucide-react'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Heading } from '../../components/ui/Heading'
import { KpiStatCard } from '../../components/ui/KpiStatCard'
import { PageCard } from '../../components/ui/PageCard'
import { PageContainer } from '../../components/ui/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader'
import { Tabs, type TabItem } from '../../components/ui/Tabs'
import {
  COMPONENT_COVERAGE,
  PATTERN_COVERAGE,
  SUBCOMPONENT_COVERAGE,
  type ComponentCoverageEntry,
  type ComponentStatus,
  type PatternVerdict,
} from '../../data/designSystemCoverage'
import { t } from '../../design/tokens'

// ─── Config visual dos vereditos ────────────────────────────────────────────

const COMPONENT_STATUS_CONFIG: Record<ComponentStatus, { label: string; variant: BadgeVariant }> = {
  coberto: { label: 'Coberto', variant: 'success' },
  'recem-fechado': { label: 'Recém-fechado', variant: 'info' },
  'referencia-unica': { label: 'Referência única', variant: 'warning' },
}

const PATTERN_VERDICT_CONFIG: Record<PatternVerdict, { label: string; variant: BadgeVariant }> = {
  rico: { label: 'Rico', variant: 'success' },
  'fora-de-escopo': { label: 'Fora de escopo', variant: 'neutral' },
}

const TABS: TabItem[] = [
  { id: 'padroes', label: 'Padrões-âncora' },
  { id: 'componentes', label: 'Componentes' },
  { id: 'subcomponentes', label: 'Sub-componentes do CRUD' },
]

// ─── Página ──────────────────────────────────────────────────────────────────

/**
 * Painel interno (dev/PO) de cobertura do design system — deriva de
 * `src/data/designSystemCoverage.ts` (por sua vez espelho de
 * `docs/COBERTURA_DESIGN_SYSTEM.md`). Fora do menu de negócio; alcançado
 * apenas pelo gatilho dev-only do Topbar (`import.meta.env.DEV`).
 */
export default function CoberturaDesignSystemPage() {
  const [activeTab, setActiveTab] = useState('padroes')

  const covered = COMPONENT_COVERAGE.length
  const fragile = COMPONENT_COVERAGE.filter((c) => c.status === 'referencia-unica').length
  const recentlyClosed = COMPONENT_COVERAGE.filter((c) => c.status === 'recem-fechado').length
  const richPatterns = PATTERN_COVERAGE.filter((p) => p.verdict === 'rico').length
  const totalInScopePatterns = PATTERN_COVERAGE.filter((p) => p.verdict !== 'fora-de-escopo').length

  const componentColumns: Column<ComponentCoverageEntry>[] = [
    { key: 'name', label: 'Componente', width: 220, sortable: true, render: (row) => <code>{row.name}</code> },
    {
      key: 'status',
      label: 'Status',
      width: 160,
      render: (row) => {
        const cfg = COMPONENT_STATUS_CONFIG[row.status]
        return <Badge label={cfg.label} variant={cfg.variant} />
      },
    },
    { key: 'screens', label: 'Tela(s)-referência', render: (row) => row.screens },
  ]

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader
          title="Cobertura do Design System"
          description="Painel interno de devs/POs — progresso da cobertura de componentes e telas-referência (dashboards e relatórios ficam fora, tratados um a um)."
        />

        <div style={{ padding: `0 ${t.space[1]}px ${t.space[6]}px`, display: 'flex', flexDirection: 'column', gap: t.space[6] }}>
          {/* KPIs agregados */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: t.space[4],
            }}
          >
            <KpiStatCard
              icon={Boxes}
              label="Componentes com tela-referência"
              value={`${covered}/${covered}`}
              sub="100% dos componentes de ui/"
            />
            <KpiStatCard
              icon={ShieldCheck}
              label="Padrões-âncora ricos"
              value={`${richPatterns}/${totalInScopePatterns}`}
              sub="Fora de escopo: Dashboard, Relatório"
            />
            <KpiStatCard
              icon={Sparkles}
              label="Recém-fechados"
              value={String(recentlyClosed)}
              sub="Órfãos fechados nesta rodada (Fase A)"
            />
            <KpiStatCard
              icon={AlertTriangle}
              label="Referência única (frágil)"
              value={String(fragile)}
              sub="Cientes — não é lacuna, apenas monitorar"
              accentColor={t.color.feedback.warning.text}
            />
          </div>

          <Tabs items={TABS} activeId={activeTab} onChange={setActiveTab} syncParam="aba" />

          {activeTab === 'padroes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: t.space[4] }}>
              {PATTERN_COVERAGE.map((pattern) => {
                const cfg = PATTERN_VERDICT_CONFIG[pattern.verdict]
                return (
                  <Card key={pattern.name} padding={t.space[4]}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: t.space[2] }}>
                      <Heading level={4} size="base">{pattern.name}</Heading>
                      <Badge label={cfg.label} variant={cfg.variant} />
                    </div>
                    <p style={{ margin: 0, marginTop: t.space[2], fontSize: t.font.size.sm, color: 'inherit', fontFamily: t.font.family.sans }}>
                      {pattern.screens}
                    </p>
                  </Card>
                )
              })}
            </div>
          )}

          {activeTab === 'componentes' && (
            <DataTable columns={componentColumns} data={COMPONENT_COVERAGE} keyField="name" />
          )}

          {activeTab === 'subcomponentes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: t.space[4] }}>
              {SUBCOMPONENT_COVERAGE.map((sub) => (
                <Card key={sub.name} padding={t.space[4]}>
                  <Heading level={4} size="base">{sub.name}</Heading>
                  <p style={{ margin: 0, marginTop: t.space[2], fontSize: t.font.size.sm, fontFamily: t.font.family.sans }}>
                    {sub.screens}
                  </p>
                  {sub.note && (
                    <p style={{ margin: 0, marginTop: t.space[1], fontSize: t.font.size.xs, fontFamily: t.font.family.sans, opacity: 0.75 }}>
                      {sub.note}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageCard>
    </PageContainer>
  )
}
