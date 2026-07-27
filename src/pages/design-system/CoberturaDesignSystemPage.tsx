import { useState } from 'react'
import { BookOpen, ExternalLink, GitCompare, LayoutGrid, Rows3 } from 'lucide-react'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { FilterSelect } from '../../components/ui/FilterSelect'
import { Heading } from '../../components/ui/Heading'
import { IconButton } from '../../components/ui/IconButton'
import { PageCard } from '../../components/ui/PageCard'
import { PageContainer } from '../../components/ui/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { Tabs, type TabItem } from '../../components/ui/Tabs'
import { useNavigation } from '../../context/NavigationContext'
import { useTheme } from '../../context/ThemeContext'
import {
  COMPONENT_COVERAGE,
  PATTERN_COVERAGE,
  SCREEN_SHOWCASE,
  SCREEN_KIND_LABELS,
  SHOWCASE_FILTERABLE_COMPONENTS,
  SUBCOMPONENT_COVERAGE,
  getScreensForComponent,
  type ComponentCoverageEntry,
  type ComponentStatus,
  type PatternCoverageEntry,
  type PatternVerdict,
  type ScreenKind,
  type ScreenShowcaseEntry,
  type SubComponentCoverageEntry,
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

const COMPONENT_FILTER_ALL = 'todos'
const COMPONENT_FILTER_OPTIONS = [
  { value: COMPONENT_FILTER_ALL, label: 'Todos os componentes' },
  ...SHOWCASE_FILTERABLE_COMPONENTS.map((name) => ({ value: name, label: name })),
]

// Abas com visualização Cards ↔ Tabela (a de Componentes já é tabela sempre).
const TOGGLABLE_TABS = new Set(['vitrine', 'padroes', 'subcomponentes'])

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
  const [viewMode, setViewMode] = useState<'cards' | 'tabela'>('cards')
  const [componentFilter, setComponentFilter] = useState<string>(COMPONENT_FILTER_ALL)
  const { navigateTo } = useNavigation()
  const { colors } = useTheme()

  const covered = COMPONENT_COVERAGE.length
  const fragile = COMPONENT_COVERAGE.filter((c) => c.status === 'referencia-unica').length
  const recentlyClosed = COMPONENT_COVERAGE.filter((c) => c.status === 'recem-fechado').length
  const richPatterns = PATTERN_COVERAGE.filter((p) => p.verdict === 'rico').length
  const totalInScopePatterns = PATTERN_COVERAGE.filter((p) => p.verdict !== 'fora-de-escopo').length

  const bc = colors.border.default as string

  // KPIs em linha única com divisórias finas (HDivider/VDivider) — mesmo
  // padrão visual dos dashboards (Financeiro/Pecuária), em vez de cartões
  // individuais com sombra própria.
  const kpis: { label: string; value: string; sub: string; badge?: { label: string; variant: BadgeVariant } }[] = [
    { label: 'Componentes com tela-referência', value: `${covered}/${covered}`, sub: '100% dos componentes de ui/' },
    { label: 'Telas na vitrine', value: String(SCREEN_SHOWCASE.length), sub: 'Desenhadas pra cobrir os padrões acima' },
    { label: 'Padrões-âncora ricos', value: `${richPatterns}/${totalInScopePatterns}`, sub: 'Fora de escopo: Dashboard, Relatório' },
    { label: 'Recém-fechados', value: String(recentlyClosed), sub: 'Órfãos fechados nesta rodada (Fase A)' },
    { label: 'Referência única', value: String(fragile), sub: 'Cientes — não é lacuna', badge: { label: 'Frágil', variant: 'warning' } },
  ]

  const filteredScreens =
    componentFilter === COMPONENT_FILTER_ALL
      ? SCREEN_SHOWCASE
      : SCREEN_SHOWCASE.filter((entry) => entry.components?.includes(componentFilter))

  /** Componente clicado na aba Componentes → pula pra Vitrine já filtrada por ele. */
  const openVitrineFilteredBy = (componentName: string) => {
    setComponentFilter(componentName)
    setActiveTab('vitrine')
  }

  const openScreen = (entry: ScreenShowcaseEntry) => {
    if (!entry.moduleId || !entry.itemId) return
    navigateTo(entry.moduleId, entry.itemId)
  }

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

  // ─── Colunas (visualização Tabela) ────────────────────────────────────────

  const screenColumns: Column<ScreenShowcaseEntry>[] = [
    { key: 'screen', label: 'Tela', width: 220, sortable: true, render: (row) => row.screen },
    {
      key: 'kind',
      label: 'Tipo',
      width: 190,
      render: (row) => <Badge label={SCREEN_KIND_LABELS[row.kind]} variant={SCREEN_KIND_VARIANT[row.kind]} />,
    },
    { key: 'description', label: 'Descrição', render: (row) => <span style={{ fontSize: t.font.size.sm }}>{row.description}</span> },
    {
      key: 'components',
      label: 'Componentes',
      width: 200,
      render: (row) => (row.components?.length ? row.components.join(', ') : '—'),
    },
    {
      key: 'action',
      label: 'Ação',
      width: 110,
      align: 'right',
      sortable: false,
      render: (row) =>
        row.moduleId && row.itemId ? (
          <Button variant="ghost" size="sm" onClick={() => openScreen(row)}>Abrir tela</Button>
        ) : (
          <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>—</span>
        ),
    },
  ]

  const patternColumns: Column<PatternCoverageEntry>[] = [
    { key: 'name', label: 'Padrão', width: 260, sortable: true, render: (row) => row.name },
    {
      key: 'verdict',
      label: 'Veredito',
      width: 150,
      render: (row) => {
        const cfg = PATTERN_VERDICT_CONFIG[row.verdict]
        return <Badge label={cfg.label} variant={cfg.variant} />
      },
    },
    { key: 'screens', label: 'Tela(s)-referência', render: (row) => <span style={{ fontSize: t.font.size.sm }}>{row.screens}</span> },
  ]

  const subComponentColumns: Column<SubComponentCoverageEntry>[] = [
    { key: 'name', label: 'Sub-componente', width: 240, sortable: true, render: (row) => row.name },
    { key: 'screens', label: 'Tela(s)-referência', render: (row) => <span style={{ fontSize: t.font.size.sm }}>{row.screens}</span> },
    {
      key: 'note',
      label: 'Nota',
      render: (row) => (row.note ? <span style={{ fontSize: t.font.size.xs, opacity: 0.75 }}>{row.note}</span> : '—'),
    },
  ]

  const componentColumns: Column<ComponentCoverageEntry>[] = [
    {
      key: 'name',
      label: 'Componente',
      width: 220,
      sortable: true,
      render: (row) => {
        const hasShowcase = getScreensForComponent(row.name).length > 0
        return hasShowcase ? (
          <Button variant="ghost" size="sm" onClick={() => openVitrineFilteredBy(row.name)}>
            <code>{row.name}</code>
          </Button>
        ) : (
          <code>{row.name}</code>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      width: 160,
      render: (row) => {
        const cfg = COMPONENT_STATUS_CONFIG[row.status]
        return <Badge label={cfg.label} variant={cfg.variant} />
      },
    },
    {
      key: 'screens',
      label: 'Tela(s)-referência',
      render: (row) => {
        const relatedScreens = getScreensForComponent(row.name)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
            <span style={{ fontSize: t.font.size.sm }}>{row.screens}</span>
            {relatedScreens.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space[1] }}>
                {relatedScreens.map((entry) => (
                  <Button key={entry.screen} variant="ghost" size="sm" onClick={() => openScreen(entry)}>
                    Abrir {entry.screen}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )
      },
    },
  ]

  // ─── Cabeçalho da seção (título da aba + toggle Cards/Tabela) ─────────────

  const sectionToolbar = TOGGLABLE_TABS.has(activeTab) && (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: t.space[1] }}>
      <IconButton
        aria-label="Ver como cards"
        tooltip="Ver como cards"
        icon={<LayoutGrid />}
        variant={viewMode === 'cards' ? 'subtle' : 'ghost'}
        onClick={() => setViewMode('cards')}
      />
      <IconButton
        aria-label="Ver como tabela"
        tooltip="Ver como tabela"
        icon={<Rows3 />}
        variant={viewMode === 'tabela' ? 'subtle' : 'ghost'}
        onClick={() => setViewMode('tabela')}
      />
    </div>
  )

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
          {/* KPIs agregados — linha única com divisórias, como nos dashboards */}
          <div
            style={{
              background: colors.bg.surface,
              borderRadius: t.radius['2xl'],
              border: `1px solid ${bc}`,
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {kpis.flatMap((kpi, i) => [
                i > 0 ? <VDivider key={`d${i}`} color={bc} /> : null,
                <div key={kpi.label} style={{ flex: '1 1 180px', padding: `${t.space[4]}px ${t.space[5]}px` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[1] }}>
                    <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
                      {kpi.label}
                    </span>
                    {kpi.badge && <Badge label={kpi.badge.label} variant={kpi.badge.variant} />}
                  </div>
                  <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default, lineHeight: 1.1, marginBottom: t.space[1] }}>
                    {kpi.value}
                  </div>
                  <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
                    {kpi.sub}
                  </div>
                </div>,
              ])}
            </div>
          </div>

          <Tabs items={TABS} activeId={activeTab} onChange={setActiveTab} syncParam="aba" />

          {activeTab === 'vitrine' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: t.space[2] }}>
                <FilterSelect
                  ariaLabel="Filtrar telas por componente"
                  prefix="Componente:"
                  options={COMPONENT_FILTER_OPTIONS}
                  value={componentFilter}
                  onChange={setComponentFilter}
                />
                <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
                  {filteredScreens.length} de {SCREEN_SHOWCASE.length} telas
                </span>
              </div>
              {sectionToolbar}

              {viewMode === 'cards' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: t.space[4] }}>
                  {filteredScreens.map((entry) => (
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
                          <Button variant="ghost" size="sm" onClick={() => openScreen(entry)}>
                            Abrir tela
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <DataTable columns={screenColumns} data={filteredScreens} keyField="screen" emptyMessage="Nenhuma tela demonstra este componente ainda." />
              )}
            </div>
          )}

          {activeTab === 'padroes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
              {sectionToolbar}
              {viewMode === 'cards' ? (
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
              ) : (
                <DataTable columns={patternColumns} data={PATTERN_COVERAGE} keyField="name" />
              )}
            </div>
          )}

          {activeTab === 'componentes' && (
            <DataTable columns={componentColumns} data={COMPONENT_COVERAGE} keyField="name" />
          )}

          {activeTab === 'subcomponentes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
              {sectionToolbar}
              {viewMode === 'cards' ? (
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
              ) : (
                <DataTable columns={subComponentColumns} data={SUBCOMPONENT_COVERAGE} keyField="name" />
              )}
            </div>
          )}
        </div>
      </PageCard>
    </PageContainer>
  )
}
