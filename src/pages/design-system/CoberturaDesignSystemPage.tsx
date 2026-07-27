import { useState } from 'react'
import { AlertTriangle, BookOpen, Boxes, ExternalLink, GitCompare, Sparkles, ShieldCheck } from 'lucide-react'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Heading } from '../../components/ui/Heading'
import { KpiStatCard } from '../../components/ui/KpiStatCard'
import { PageCard } from '../../components/ui/PageCard'
import { PageContainer } from '../../components/ui/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader'
import { Tabs, type TabItem } from '../../components/ui/Tabs'
import { useNavigation } from '../../context/NavigationContext'
import { useTheme } from '../../context/ThemeContext'
import {
  COMPONENT_COVERAGE,
  PATTERN_COVERAGE,
  SCREEN_SHOWCASE,
  SCREEN_KIND_LABELS,
  SUBCOMPONENT_COVERAGE,
  type ComponentCoverageEntry,
  type ComponentStatus,
  type PatternVerdict,
  type ScreenKind,
} from '../../data/designSystemCoverage'
import { t } from '../../design/tokens'

// ─── Links externos (Storybook/Chromatic) ──────────────────────────────────
// Sobrescrevíveis por env var (Cloudflare > Settings > Environment Variables)
// sem precisar de novo deploy de código. Os valores padrão são o último
// build publicado via `npm run chromatic` — atualize ao trocar de projeto
// Chromatic ou publicar um Storybook com host próprio.
const STORYBOOK_URL =
  import.meta.env.VITE_STORYBOOK_URL || 'https://69fbb4d23569b2759aad4d30-awatevdqwv.chromatic.com/'
const CHROMATIC_BUILD_URL =
  import.meta.env.VITE_CHROMATIC_URL || 'https://www.chromatic.com/build?appId=69fbb4d23569b2759aad4d30&number=12'

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

const SCREEN_KIND_VARIANT: Record<ScreenKind, BadgeVariant> = {
  'crud-simples': 'info',
  'crud-complexo': 'purple',
  'crud-hierarquico': 'cyan',
  consulta: 'neutral',
  transacional: 'success',
  workflow: 'warning',
  'import-conciliacao': 'success',
  espacial: 'purple',
  spa: 'cyan',
  integracao: 'info',
  fundacao: 'neutral',
  'fora-de-escopo': 'neutral',
  'referencia-interna': 'warning',
}

const TABS: TabItem[] = [
  { id: 'vitrine', label: 'Vitrine por tela' },
  { id: 'padroes', label: 'Padrões-âncora' },
  { id: 'componentes', label: 'Componentes' },
  { id: 'subcomponentes', label: 'Sub-componentes do CRUD' },
]

// ─── Página ──────────────────────────────────────────────────────────────────

/**
 * Painel interno (dev/PO) de cobertura do design system — deriva de
 * `src/data/designSystemCoverage.ts` (por sua vez espelho de
 * `docs/COBERTURA_DESIGN_SYSTEM.md`). Fora do menu de negócio; alcançado
 * pelo gatilho "Design System" do Topbar. Visível em qualquer build
 * (dev ou produção/Cloudflare) a menos que `VITE_SHOW_DS_PANEL=false`
 * seja definido explicitamente — ver Topbar.tsx.
 */
export default function CoberturaDesignSystemPage() {
  const [activeTab, setActiveTab] = useState('vitrine')
  const { navigateTo } = useNavigation()
  const { colors } = useTheme()

  const covered = COMPONENT_COVERAGE.length
  const fragile = COMPONENT_COVERAGE.filter((c) => c.status === 'referencia-unica').length
  const recentlyClosed = COMPONENT_COVERAGE.filter((c) => c.status === 'recem-fechado').length
  const richPatterns = PATTERN_COVERAGE.filter((p) => p.verdict === 'rico').length
  const totalInScopePatterns = PATTERN_COVERAGE.filter((p) => p.verdict !== 'fora-de-escopo').length

  const externalLinkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: t.space[2],
    height: t.size.btn.sm,
    padding: `0 ${t.space[3]}px`,
    borderRadius: t.radius.md,
    border: `1.5px solid ${colors.border.default}`,
    color: colors.fg.default,
    fontFamily: t.font.family.sans,
    fontSize: t.font.size.sm,
    fontWeight: t.font.weight.medium,
    textDecoration: 'none',
  }

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
          description="Guia interno de devs/POs — o que já é vitrine, de qual padrão, e onde reutilizar (dashboards e relatórios ficam fora, tratados um a um)."
          actions={
            <div style={{ display: 'flex', gap: t.space[2] }}>
              <a href={STORYBOOK_URL} target="_blank" rel="noreferrer" style={externalLinkStyle}>
                <BookOpen size={15} aria-hidden="true" />
                Storybook
              </a>
              <a href={CHROMATIC_BUILD_URL} target="_blank" rel="noreferrer" style={externalLinkStyle}>
                <GitCompare size={15} aria-hidden="true" />
                Build Chromatic
                <ExternalLink size={12} aria-hidden="true" style={{ opacity: 0.6 }} />
              </a>
            </div>
          }
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

          {activeTab === 'vitrine' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: t.space[4] }}>
              {SCREEN_SHOWCASE.map((entry) => (
                <Card key={entry.screen} padding={t.space[4]}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: t.space[2] }}>
                    <Heading level={4} size="base">{entry.screen}</Heading>
                    <Badge label={SCREEN_KIND_LABELS[entry.kind]} variant={SCREEN_KIND_VARIANT[entry.kind]} />
                  </div>
                  <code style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>{entry.path}</code>
                  <p style={{ margin: 0, marginTop: t.space[2], fontSize: t.font.size.sm, fontFamily: t.font.family.sans, lineHeight: t.font.lineHeight.normal }}>
                    {entry.description}
                  </p>
                  {entry.moduleId && entry.itemId && (
                    <div style={{ marginTop: t.space[3] }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateTo(entry.moduleId!, entry.itemId)}
                      >
                        Abrir tela
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

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
