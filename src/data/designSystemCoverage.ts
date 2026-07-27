/**
 * GB CERNE — Fonte de dados da Cobertura do Design System
 *
 * Deriva de `docs/COBERTURA_DESIGN_SYSTEM.md` (a fonte de verdade legível por humanos).
 * Consumido por `src/pages/design-system/CoberturaDesignSystemPage.tsx`.
 *
 * Ao atualizar a cobertura real, atualize o `.md` primeiro e reflita aqui —
 * nunca o contrário, para não haver duas fontes divergentes.
 */

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type ComponentStatus =
  | 'coberto'           // tem ao menos 1 tela-referência viva
  | 'recem-fechado'     // era órfão; fechado pelo backlog de cobertura (Fase A)
  | 'referencia-unica'  // coberto, mas por 1 única tela — frágil se ela sair do catálogo

export interface ComponentCoverageEntry {
  name: string
  status: ComponentStatus
  screens: string
}

export type PatternVerdict = 'rico' | 'fora-de-escopo'

export interface PatternCoverageEntry {
  name: string
  verdict: PatternVerdict
  screens: string
  note?: string
}

export interface SubComponentCoverageEntry {
  name: string
  screens: string
  note?: string
}

// ─── Componentes de src/components/ui/ (85) ────────────────────────────────

const AMPLO = 'Uso amplo — presente na maioria das telas de Cadastros/Financeiro/Administrativo (ver Storybook para exemplos isolados).'

export const COMPONENT_COVERAGE: ComponentCoverageEntry[] = [
  // Recém-fechados (Fase A do backlog de cobertura)
  { name: 'AccountStatusBanner', status: 'recem-fechado', screens: 'design-system/EstadosContaPage' },
  { name: 'FeatureGate', status: 'recem-fechado', screens: 'design-system/EstadosContaPage' },
  { name: 'UpgradePrompt', status: 'recem-fechado', screens: 'design-system/EstadosContaPage' },
  { name: 'RadioGroup', status: 'recem-fechado', screens: 'design-system/EstadosContaPage' },

  // Referência única (frágil, ciente — ver Apêndice A do plano)
  { name: 'TreeView', status: 'referencia-unica', screens: 'cadastros/agrupadores-contabeis' },
  { name: 'WorkflowTimeline', status: 'referencia-unica', screens: 'administrativo/autorizacao' },
  { name: 'StatusLegend', status: 'referencia-unica', screens: 'administrativo/autorizacao' },
  { name: 'ReconciliationWorkspace', status: 'referencia-unica', screens: 'financeiro/ofx' },
  { name: 'EntityBoard', status: 'referencia-unica', screens: 'operacional/mapa-confinamento' },
  { name: 'ReportWorkspace', status: 'referencia-unica', screens: 'relatorios/estoque-consolidado' },
  { name: 'TypedConfirmDialog', status: 'referencia-unica', screens: 'cadastros/animais' },
  { name: 'DatePicker', status: 'referencia-unica', screens: 'cadastros/pessoas (StepFuncionario)' },
  { name: 'RepeaterList', status: 'referencia-unica', screens: 'cadastros/pessoas (StepProprietario/Cliente/Fornecedor)' },

  // Padrão / composto — cobertos
  { name: 'CrudPattern', status: 'coberto', screens: 'cadastros/bancos, cidades, animais' },
  { name: 'ResponsiveDataTable', status: 'coberto', screens: 'administrativo/autorizacao, cadastros/usuarios (+ via CrudPattern)' },
  { name: 'DetailGrid', status: 'coberto', screens: 'autorizacao, agrupadores-contabeis, usuarios, baixa-titulos, ofx, dominio, mapa-confinamento, estoque-consolidado' },
  { name: 'AsyncSearchSelect', status: 'coberto', screens: 'financeiro/baixa-titulos, integracoes/dominio' },
  { name: 'MultiSelectField', status: 'coberto', screens: 'cadastros/usuarios, relatorios/estoque-consolidado' },
  { name: 'ImportDialog', status: 'coberto', screens: 'cadastros/animais (parsing real), cadastros/usuarios, financeiro/ofx, cadastros/plano-contas (PlanoContasImportModal)' },
  { name: 'CurrencyField', status: 'coberto', screens: 'administrativo/autorizacao, operacional/planejamento-pecuario, financeiro/baixa-titulos, relatorios/estoque-consolidado' },
  { name: 'AllocationEditor', status: 'coberto', screens: 'financeiro/ofx, financeiro/baixa-titulos' },
  { name: 'SecretField', status: 'coberto', screens: 'integracoes/dominio, cadastros/usuarios' },
  { name: 'CategoryTreeField', status: 'coberto', screens: 'cadastros/centros-custo, cadastros/plano-contas' },
  { name: 'CheckboxListField', status: 'coberto', screens: 'cadastros/contas-bancarias, cadastros/emissores' },
  { name: 'SearchSelect', status: 'coberto', screens: 'cadastros/contas-bancarias, estoques-iniciais, pessoas (StepEndereco)' },
  { name: 'FilterSelect', status: 'coberto', screens: 'administrativo/autorizacao, operacional/mapa-confinamento' },
  { name: 'CollapsibleSection', status: 'coberto', screens: 'cadastros/estoques-iniciais, cadastros/produtos (ProdutoForm)' },
  { name: 'MapView', status: 'coberto', screens: 'cadastros/fazendas (FazendaDetalhe), operacional/mapa-confinamento' },
  { name: 'FileUpload', status: 'coberto', screens: 'financeiro/baixa-titulos, cadastros/emissores, cadastros/plano-contas (import)' },
  { name: 'BulkActionBar', status: 'coberto', screens: 'cadastros/produtos/ProdutosLista' },
  { name: 'SortHeader', status: 'coberto', screens: 'cadastros/produtos, embalagens, armazens, estoques-iniciais' },
  { name: 'FilterDrawer', status: 'coberto', screens: 'presente em quase todas as listagens de Cadastros (fazendas, safras, centros-custo, embalagens, armazens, enderecos, estoques-iniciais, plano-contas, contas-bancarias, emissores, produtos, pessoas)' },
  { name: 'Stepper', status: 'coberto', screens: 'cadastros/fazendas, safras, pessoas (cadastro multi-etapa)' },
  { name: 'StepHeader', status: 'coberto', screens: 'cadastros/fazendas, safras, pessoas (steps)' },
  { name: 'StepFooter', status: 'coberto', screens: 'cadastros/fazendas, safras, pessoas (steps)' },

  // Primitivas amplamente usadas
  { name: 'Avatar', status: 'coberto', screens: AMPLO },
  { name: 'Badge', status: 'coberto', screens: AMPLO },
  { name: 'Breadcrumb', status: 'coberto', screens: 'components/layout/Topbar' },
  { name: 'BarChart', status: 'coberto', screens: 'pages/dashboards/* (fora de escopo, mas coberto)' },
  { name: 'Button', status: 'coberto', screens: AMPLO },
  { name: 'Card', status: 'coberto', screens: 'design-system/EstadosContaPage, pages/planos' },
  { name: 'ChartCard', status: 'coberto', screens: 'pages/dashboards/*' },
  { name: 'Checkbox', status: 'coberto', screens: AMPLO },
  { name: 'ConfirmDialog', status: 'coberto', screens: AMPLO },
  { name: 'CurrencyField', status: 'coberto', screens: 'ver acima' },
  { name: 'DataTable', status: 'coberto', screens: 'integracoes/dominio, planejamento-pecuario, ofx (+ via CrudPattern/ResponsiveDataTable)' },
  { name: 'Divider', status: 'coberto', screens: 'pages/Login, pages/planos' },
  { name: 'DonutChart', status: 'coberto', screens: 'pages/dashboards/*' },
  { name: 'DropdownMenu', status: 'coberto', screens: 'components/layout/Topbar + amplo em listagens' },
  { name: 'EmptyState', status: 'coberto', screens: AMPLO },
  { name: 'FarmSwitcher', status: 'coberto', screens: 'components/layout/Topbar' },
  { name: 'FeedbackBanner', status: 'coberto', screens: 'autorizacao, baixa-titulos, ofx, dominio, mapa-confinamento, usuarios, design-system/EstadosContaPage' },
  { name: 'FormField', status: 'coberto', screens: AMPLO },
  { name: 'FormPageHeader', status: 'coberto', screens: 'AMPLO — cabeçalho de todos os formulários de cadastro' },
  { name: 'FormSection', status: 'coberto', screens: AMPLO },
  { name: 'FormSelect', status: 'coberto', screens: AMPLO },
  { name: 'GaugeChart', status: 'coberto', screens: 'pages/dashboards/*' },
  { name: 'GroupedBarChart', status: 'coberto', screens: 'pages/dashboards/*' },
  { name: 'Heading', status: 'coberto', screens: 'cadastros/pessoas, centros-custo, plano-contas, contas-bancarias, emissores, pages/planos' },
  { name: 'HeatmapChart', status: 'coberto', screens: 'pages/dashboards/*' },
  { name: 'IconButton', status: 'coberto', screens: 'AMPLO — ações de linha em listagens e cabeçalhos' },
  { name: 'InterpretationLetter', status: 'coberto', screens: 'pages/dashboards/*' },
  { name: 'KpiStatCard', status: 'coberto', screens: 'pages/dashboards/*' },
  { name: 'LineChart', status: 'coberto', screens: 'pages/dashboards/*' },
  { name: 'ListToolbar', status: 'coberto', screens: AMPLO },
  { name: 'Modal', status: 'coberto', screens: AMPLO },
  { name: 'PageCard', status: 'coberto', screens: AMPLO },
  { name: 'PageContainer', status: 'coberto', screens: AMPLO },
  { name: 'PageHeader', status: 'coberto', screens: AMPLO },
  { name: 'Pagination', status: 'coberto', screens: 'AMPLO (+ via CrudPattern/ResponsiveDataTable)' },
  { name: 'ProgressBar', status: 'coberto', screens: 'pages/Login (indicador de progresso)' },
  { name: 'SankeyFunnel', status: 'coberto', screens: 'pages/dashboards/* (funil)' },
  { name: 'SectionDividers', status: 'coberto', screens: 'pages/dashboards/* (HDivider/VDivider)' },
  { name: 'Skeleton', status: 'coberto', screens: 'AMPLO — estado de loading das listagens' },
  { name: 'SparklineArea', status: 'coberto', screens: 'pages/dashboards/*' },
  { name: 'Spinner', status: 'coberto', screens: 'pages/Login, Button (prop loading)' },
  { name: 'SSOButton', status: 'coberto', screens: 'pages/Login' },
  { name: 'StackedBarChart', status: 'coberto', screens: 'pages/dashboards/*' },
  { name: 'Tabs', status: 'coberto', screens: 'financeiro/ofx, operacional/mapa-confinamento, pages/planos' },
  { name: 'Tag', status: 'coberto', screens: 'pages/planos' },
  { name: 'Toast', status: 'coberto', screens: 'AMPLO — ToastContainer/useToast em quase toda tela com mutação' },
  { name: 'ToggleSection', status: 'coberto', screens: 'cadastros/pessoas (steps)' },
  { name: 'ToggleSwitch', status: 'coberto', screens: 'AMPLO — flags booleanas em formulários' },
  { name: 'Tooltip', status: 'coberto', screens: 'components/layout/Sidebar' },
  { name: 'Trend', status: 'coberto', screens: 'pages/dashboards/*' },
]

// ─── Padrões primários (fora Dashboard/Relatório) ──────────────────────────

export const PATTERN_COVERAGE: PatternCoverageEntry[] = [
  { name: 'CRUD base', verdict: 'rico', screens: 'cadastros/bancos (âncora, simples por design) + embalagens, contas-bancarias, armazens (Estrutura)' },
  { name: 'Relatório', verdict: 'fora-de-escopo', screens: 'relatorios/estoque-consolidado — tratado à parte, um a um' },
  { name: 'Componente/Infra (AppShell)', verdict: 'rico', screens: 'components/layout/AppLayout + Sidebar + Topbar + SecondaryNav' },
  { name: 'Consulta read-only', verdict: 'rico', screens: 'cadastros/cidades (âncora simples) + cadastros/fazendas/FazendaDetalhe + safras/SafraDetalhe' },
  { name: 'Dashboard', verdict: 'fora-de-escopo', screens: 'pages/dashboards/* (14 telas) — tratado à parte, um a um' },
  { name: 'Mapa/espacial/drag-drop', verdict: 'rico', screens: 'operacional/mapa-confinamento (visualização, por design) + cadastros/fazendas/steps/Step3Mapa (edição)' },
  { name: 'Standalone/pública', verdict: 'rico', screens: 'pages/Login + components/layout/PublicLayout' },
  { name: 'SPA/React', verdict: 'rico', screens: 'operacional/planejamento-pecuario' },
  { name: 'Exportação/integração', verdict: 'rico', screens: 'integracoes/dominio' },
  { name: 'Transação/documento', verdict: 'rico', screens: 'financeiro/baixa-titulos' },
  { name: 'Workflow/ação', verdict: 'rico', screens: 'administrativo/autorizacao' },
  { name: 'Importação (embutida em CRUD)', verdict: 'rico', screens: 'financeiro/ofx' },
]

export const SUBCOMPONENT_COVERAGE: SubComponentCoverageEntry[] = [
  { name: 'Selects AJAX em cascata', screens: 'cadastros/produtos/ProdutoForm (4 níveis)', note: 'Referência mais rica que a âncora sugerida (Pessoas).' },
  { name: 'Import em massa', screens: 'cadastros/plano-contas/PlanoContasImportModal + cadastros/animais (parsing real)', note: 'Animais corrigido — antes era mock.' },
  { name: 'Treeview / hierarquia', screens: 'cadastros/plano-contas/PlanoContaCadastro + centros-custo/CentroCustoCadastro (antecessor, anti-ciclo, código automático)', note: 'Agrupadores Contábeis recebendo o mesmo upgrade.' },
  { name: 'Blocos condicionais (fiscal/produto)', screens: 'cadastros/produtos/ProdutoForm' },
  { name: 'Exportação & RBAC', screens: 'cadastros/usuarios (atribuição de papel) + design-system/EstadosContaPage (RBAC visível em UI)' },
]
