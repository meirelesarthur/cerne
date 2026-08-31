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

/**
 * Taxonomia de telas — o "catálogo de vitrine" para handoff: cada tela real
 * do produto, o tipo de padrão que ela demonstra e o que replicar dela.
 * `moduleId`/`itemId` (quando presentes) apontam para os ids reais de
 * `src/data/menuData.ts`, usados por `useNavigation().navigateTo()` para o
 * botão "Abrir tela".
 */
export type ScreenKind =
  | 'crud-simples'
  | 'crud-complexo'
  | 'crud-hierarquico'
  | 'consulta'
  | 'transacional'
  | 'workflow'
  | 'import-conciliacao'
  | 'espacial'
  | 'spa'
  | 'integracao'
  | 'fundacao'
  | 'fora-de-escopo'
  | 'referencia-interna'

export interface ScreenShowcaseEntry {
  screen: string
  path: string
  kind: ScreenKind
  description: string
  moduleId?: string
  itemId?: string
  /**
   * Componentes DISTINTIVOS que esta tela demonstra — curado, não exaustivo.
   * Primitivas de uso amplo (Button, FormField, PageHeader...) ficam de fora
   * de propósito: listá-las em toda tela tornaria o filtro por componente
   * inútil (bater em tudo). Use para os componentes de padrão/compostos que
   * valem a pena navegar até essa tela para ver funcionando.
   */
  components?: string[]
}

export const SCREEN_KIND_LABELS: Record<ScreenKind, string> = {
  'crud-simples': 'CRUD simples',
  'crud-complexo': 'CRUD complexo',
  'crud-hierarquico': 'CRUD hierárquico',
  consulta: 'Consulta somente leitura',
  transacional: 'Editor transacional',
  workflow: 'Workflow / aprovação',
  'import-conciliacao': 'Importação & conciliação',
  espacial: 'Espacial / drag-drop',
  spa: 'Aplicação embutida (SPA)',
  integracao: 'Integração externa',
  fundacao: 'Fundação do design system',
  'fora-de-escopo': 'Fora de escopo (tratado à parte)',
  'referencia-interna': 'Referência interna (não é tela de produto)',
}

export const SCREEN_SHOWCASE: ScreenShowcaseEntry[] = [
  {
    screen: 'Bancos',
    path: 'cadastros/bancos',
    kind: 'crud-simples',
    description: 'Cadastro administrativo mínimo — listagem, busca, criar/editar/ver, excluir. Base do CrudPattern, simples por design; não copie os campos, copie a estrutura.',
    moduleId: 'cadastros', itemId: 'cad-fin-ban',
    components: ['CrudPattern'],
  },
  {
    screen: 'Cidades',
    path: 'cadastros/cidades',
    kind: 'consulta',
    description: 'CrudPattern em modo readOnly — para cadastros que vêm de fonte oficial/integração, sem escrita do usuário.',
    moduleId: 'cadastros', itemId: 'cad-ger-cid',
    components: ['CrudPattern'],
  },
  {
    screen: 'Fazendas',
    path: 'cadastros/fazendas',
    kind: 'crud-complexo',
    description: 'Wizard multi-etapa (Stepper) com mapa editável (Leaflet + desenho de polígono), documentos e detalhe com abas. A referência mais rica de cadastro do catálogo.',
    moduleId: 'cadastros', itemId: 'cad-est-faz',
    components: ['Stepper', 'StepHeader', 'StepFooter', 'MapView', 'FilterDrawer', 'Tabs'],
  },
  {
    screen: 'Safras',
    path: 'cadastros/safras',
    kind: 'crud-complexo',
    description: 'Cadastro multi-etapa + WeekCanvas (pintura semana a semana com arraste contínuo) — interação sob medida, sem componente equivalente ainda no catálogo.',
    moduleId: 'cadastros', itemId: 'cad-est-saf',
    components: ['Stepper', 'StepHeader', 'StepFooter'],
  },
  {
    screen: 'Pessoas',
    path: 'cadastros/pessoas',
    kind: 'crud-complexo',
    description: 'Formulário com etapas condicionais por papel (cliente/fornecedor/funcionário/proprietário/usuário) — referência de RepeaterList, DatePicker e ToggleSection.',
    moduleId: 'cadastros', itemId: 'cad-pes-uni',
    components: ['Stepper', 'StepHeader', 'StepFooter', 'RepeaterList', 'DatePicker', 'ToggleSection', 'SearchSelect'],
  },
  {
    screen: 'Produtos',
    path: 'cadastros/produtos',
    kind: 'crud-complexo',
    description: 'Cadastro multi-etapa (Stepper) com cascata de seleção real de 4 níveis + campos condicionais fiscais. Referência de blocos condicionais e Select AJAX cascata.',
    moduleId: 'cadastros', itemId: 'cad-est-pro-lista',
    components: ['Stepper', 'StepHeader', 'StepFooter', 'BulkActionBar', 'SortHeader'],
  },
  {
    screen: 'Plano de Contas',
    path: 'cadastros/plano-contas',
    kind: 'crud-hierarquico',
    description: 'Antecessor selecionável, prevenção de ciclo, código automático + import real de CSV com modelo pré-preenchido. Referência principal de hierarquia e de import em massa.',
    moduleId: 'cadastros', itemId: 'cad-fis-pla',
    components: ['CategoryTreeField', 'FileUpload'],
  },
  {
    screen: 'Centros de Custo',
    path: 'cadastros/centros-custo',
    kind: 'crud-hierarquico',
    description: 'Mesmo padrão de hierarquia do Plano de Contas (antecessor, anti-ciclo, código automático).',
    moduleId: 'cadastros', itemId: 'cad-est-cc',
    components: ['CategoryTreeField'],
  },
  {
    screen: 'Agrupadores Contábeis',
    path: 'cadastros/agrupadores-contabeis',
    kind: 'crud-hierarquico',
    description: 'Hierarquia via TreeView com o mesmo padrão de antecessor/anti-ciclo — variante do padrão acima sobre uma árvore visual.',
    moduleId: 'cadastros', itemId: 'cad-fin-agr',
    components: ['TreeView'],
  },
  {
    screen: 'Rebanho / Animais',
    path: 'cadastros/rebanho',
    kind: 'crud-complexo',
    description: 'Seleção múltipla e ação em massa, importação real de CSV com validação por linha, exclusão com confirmação nomeada (TypedConfirmDialog).',
    moduleId: 'cadastros', itemId: 'cad-pec-reb',
    components: ['CrudPattern', 'ImportDialog', 'TypedConfirmDialog'],
  },
  {
    screen: 'Usuários',
    path: 'cadastros/usuarios',
    kind: 'crud-complexo',
    description: 'CRUD administrativo com atribuição de papel/permissões, exportação e redefinição de senha (SecretField, MultiSelectField).',
    moduleId: 'cadastros', itemId: 'cad-pes-usr',
    components: ['MultiSelectField', 'SecretField', 'ImportDialog', 'ResponsiveDataTable'],
  },
  {
    screen: 'Embalagens / Armazéns / Endereçamentos / Saldo Inicial / Contas Bancárias / Emissores',
    path: 'cadastros/*',
    kind: 'crud-simples',
    description: 'Família de cadastros administrativos médios — replicam o padrão-fábrica com pequenas variações de campo (upload de certificado, checklist, busca). Use qualquer uma como ponto de partida.',
    moduleId: 'cadastros', itemId: 'cad-est-emb',
    components: ['CheckboxListField', 'FileUpload', 'SearchSelect'],
  },
  {
    screen: 'Baixa de Títulos',
    path: 'financeiro/baixa-titulos',
    kind: 'transacional',
    description: 'Campos monetários e percentuais, rateio (AllocationEditor), upload de comprovante, confirmação antes de efetivar.',
    moduleId: 'financeiro', itemId: 'fin-bai',
    components: ['AllocationEditor', 'CurrencyField', 'AsyncSearchSelect', 'FileUpload'],
  },
  {
    screen: 'Importação OFX',
    path: 'financeiro/ofx',
    kind: 'import-conciliacao',
    description: 'Upload de arquivo bancário, histórico de importações e ambiente de conciliação (ReconciliationWorkspace).',
    moduleId: 'financeiro', itemId: 'fin-cnc-ofx',
    components: ['ReconciliationWorkspace', 'ImportDialog', 'AllocationEditor'],
  },
  {
    screen: 'Autorização de Compra',
    path: 'administrativo/autorizacao',
    kind: 'workflow',
    description: 'Timeline de status, cotação e ações condicionadas ao papel do usuário (WorkflowTimeline, StatusLegend).',
    moduleId: 'administrativo', itemId: 'adm-sup-aut',
    components: ['WorkflowTimeline', 'StatusLegend', 'ResponsiveDataTable', 'FilterSelect', 'CurrencyField'],
  },
  {
    screen: 'Planejamento Pecuário',
    path: 'operacional/planejamento-pecuario',
    kind: 'spa',
    description: 'Tabela hierárquica com cálculo recursivo e edição em modal — telas ricas que funcionam como uma pequena aplicação dentro do produto.',
    moduleId: 'operacional', itemId: 'ope-pec-pla',
    components: ['CurrencyField', 'DataTable'],
  },
  {
    screen: 'Mapa de Confinamento',
    path: 'operacional/mapa-confinamento',
    kind: 'espacial',
    description: 'Quadro (EntityBoard) com arrastar-e-soltar entre pátios/setores/currais, alternativa acessível por menu, e visualização geográfica com polígonos.',
    moduleId: 'operacional', itemId: 'ope-pec-map',
    components: ['EntityBoard', 'MapView', 'FilterSelect'],
  },
  {
    screen: 'Integração Domínio',
    path: 'integracoes/dominio',
    kind: 'integracao',
    description: 'Credencial protegida (SecretField), teste de conexão, busca assíncrona (AsyncSearchSelect) — referência de integrações externas.',
    moduleId: 'integracoes', itemId: 'int-dom-soft',
    components: ['SecretField', 'AsyncSearchSelect'],
  },
  {
    screen: 'Login & Shell (AppLayout)',
    path: '/ (raiz)',
    kind: 'fundacao',
    description: 'Layout público, autenticação e shell de navegação (sidebar/topbar/tema) — a moldura de toda tela interna. Não replicar; estender via prop.',
    components: ['SSOButton', 'Divider', 'ProgressBar', 'Breadcrumb', 'FarmSwitcher', 'Tooltip'],
  },
  {
    screen: 'Relatórios (11 hubs de menu / 92 telas no discovery)',
    path: 'relatorios/*',
    kind: 'fora-de-escopo',
    description: 'ReportWorkspace (âncora: Estoque Consolidado) já é o padrão-fábrica de relatório. Os demais relatórios são endereçados um a um, separadamente — fora deste backlog.',
    moduleId: 'relatorios', itemId: 'rel-est',
    components: ['ReportWorkspace', 'MultiSelectField'],
  },
  {
    screen: 'Dashboards (14 telas)',
    path: 'dashboards/*',
    kind: 'fora-de-escopo',
    description: 'Família de gráficos já 100% demonstrada (BarChart, LineChart, DonutChart, KpiStatCard, etc.). Endereçados um a um, separadamente — fora deste backlog.',
    moduleId: 'dashboards', itemId: 'dash-overview',
    components: ['BarChart', 'LineChart', 'DonutChart', 'StackedBarChart', 'GroupedBarChart', 'GaugeChart', 'HeatmapChart', 'SparklineArea', 'SankeyFunnel', 'ChartCard', 'KpiStatCard', 'Trend', 'DashboardGrid', 'InterpretationLetter'],
  },
  {
    screen: 'Estados de Conta & RBAC',
    path: 'design-system/estados-conta',
    kind: 'referencia-interna',
    description: 'Vitrine de billing/feature-gating/RBAC visível para devs/POs. Não é uma funcionalidade de produto — não copiar como tela de negócio. Acesse pelo mesmo menu "Design System" do Topbar.',
    components: ['AccountStatusBanner', 'FeatureGate', 'UpgradePrompt', 'RadioGroup'],
  },
]

/** Telas (com `components` preenchido) que demonstram o componente dado — para o filtro cruzado do painel. */
export function getScreensForComponent(componentName: string): ScreenShowcaseEntry[] {
  return SCREEN_SHOWCASE.filter((entry) => entry.components?.includes(componentName))
}

/** Nomes de componentes curados em `SCREEN_SHOWCASE`, ordenados — opções do filtro da Vitrine. */
export const SHOWCASE_FILTERABLE_COMPONENTS: string[] = Array.from(
  new Set(SCREEN_SHOWCASE.flatMap((entry) => entry.components ?? [])),
).sort((a, b) => a.localeCompare(b))

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
  { name: 'DetailGrid', status: 'coberto', screens: 'autorizacao, agrupadores-contabeis, usuarios, baixa-titulos, ofx, dominio, mapa-confinamento, estoque-consolidado, cadastros/produtos (ProdutoDetalhe)' },
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
  { name: 'CollapsibleSection', status: 'coberto', screens: 'cadastros/estoques-iniciais' },
  { name: 'MapView', status: 'coberto', screens: 'cadastros/fazendas (FazendaDetalhe), operacional/mapa-confinamento' },
  { name: 'FileUpload', status: 'coberto', screens: 'financeiro/baixa-titulos, cadastros/emissores, cadastros/plano-contas (import)' },
  { name: 'BulkActionBar', status: 'coberto', screens: 'cadastros/produtos/ProdutosLista' },
  { name: 'SortHeader', status: 'coberto', screens: 'cadastros/produtos, embalagens, armazens, estoques-iniciais' },
  { name: 'FilterDrawer', status: 'coberto', screens: 'presente em quase todas as listagens de Cadastros (fazendas, safras, centros-custo, embalagens, armazens, enderecos, estoques-iniciais, plano-contas, contas-bancarias, emissores, produtos, pessoas)' },
  { name: 'Stepper', status: 'coberto', screens: 'cadastros/fazendas, safras, pessoas, produtos (cadastro e detalhe)' },
  { name: 'StepHeader', status: 'coberto', screens: 'cadastros/fazendas, safras, pessoas, produtos (steps)' },
  { name: 'StepFooter', status: 'coberto', screens: 'cadastros/fazendas, safras, pessoas, produtos (steps)' },

  // Primitivas amplamente usadas
  { name: 'Avatar', status: 'coberto', screens: AMPLO },
  { name: 'Badge', status: 'coberto', screens: AMPLO },
  { name: 'Breadcrumb', status: 'coberto', screens: 'components/layout/Topbar' },
  { name: 'BarChart', status: 'coberto', screens: 'pages/dashboards/* (fora de escopo, mas coberto)' },
  { name: 'Button', status: 'coberto', screens: AMPLO },
  { name: 'Card', status: 'coberto', screens: 'design-system/EstadosContaPage, pages/planos' },
  { name: 'ChartCard', status: 'referencia-unica', screens: 'pages/dashboards/Pluviometria (frame do DashboardCard + expandir)' },
  { name: 'ChartLegend', status: 'coberto', screens: 'pages/dashboards/* (legenda de série no action do card)' },
  { name: 'ChartSvgLegend', status: 'coberto', screens: 'components/ui/{Bar,GroupedBar,StackedBar,Line}Chart (legenda interna)' },
  { name: 'Checkbox', status: 'coberto', screens: AMPLO },
  { name: 'ConfirmDialog', status: 'coberto', screens: AMPLO },
  { name: 'DashboardGrid', status: 'coberto', screens: 'pages/dashboards/* (casca das 14 telas: Grid/Header/Row/Stack/Card/KpiCard/Skeleton)' },
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
  { name: 'KpiStatCard', status: 'referencia-unica', screens: 'apenas story — dashboards usam DashboardKpiCard (rótulo + valor + Trend, sem ícone)' },
  { name: 'LineChart', status: 'coberto', screens: 'pages/dashboards/*' },
  { name: 'ListToolbar', status: 'coberto', screens: AMPLO },
  { name: 'Modal', status: 'coberto', screens: AMPLO },
  { name: 'PageCard', status: 'coberto', screens: AMPLO },
  { name: 'PageContainer', status: 'coberto', screens: AMPLO },
  { name: 'PageHeader', status: 'coberto', screens: AMPLO },
  { name: 'Pagination', status: 'coberto', screens: 'AMPLO (+ via CrudPattern/ResponsiveDataTable)' },
  { name: 'ProgressBar', status: 'coberto', screens: 'pages/Login (indicador de progresso)' },
  { name: 'SankeyFunnel', status: 'coberto', screens: 'pages/dashboards/* (funil)' },
  { name: 'SectionDividers', status: 'referencia-unica', screens: 'cadastros/safras/SafraDetalhe (HDivider/VDivider) — dashboards migraram para DashboardGrid' },
  { name: 'Skeleton', status: 'coberto', screens: 'AMPLO — estado de loading das listagens' },
  { name: 'SparklineArea', status: 'coberto', screens: 'pages/dashboards/*' },
  { name: 'Spinner', status: 'coberto', screens: 'pages/Login, Button (prop loading)' },
  { name: 'SSOButton', status: 'coberto', screens: 'pages/Login' },
  { name: 'StackedBarChart', status: 'coberto', screens: 'pages/dashboards/*' },
  { name: 'TableToolbar', status: 'coberto', screens: 'cadastros/fazendas, cadastros/enderecos (FilterButton)' },
  { name: 'Tabs', status: 'coberto', screens: 'financeiro/ofx, operacional/mapa-confinamento, pages/planos' },
  { name: 'Tag', status: 'coberto', screens: 'pages/planos' },
  { name: 'Toast', status: 'coberto', screens: 'GLOBAL — ToastProvider preserva feedback entre cadastro/lista; useToast cobre telas com mutação' },
  { name: 'ToggleSection', status: 'coberto', screens: 'cadastros/pessoas (steps)' },
  { name: 'ToggleField', status: 'coberto', screens: 'cadastros/produtos (estoque e operação)' },
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
  { name: 'Treeview / hierarquia', screens: 'cadastros/plano-contas/PlanoContaCadastro + centros-custo/CentroCustoCadastro (antecessor, anti-ciclo, código automático)', note: 'Agrupadores Contábeis recebeu o mesmo upgrade (via FormSelect de antecessor, não CategoryTreeField).' },
  { name: 'Blocos condicionais (fiscal/produto)', screens: 'cadastros/produtos/ProdutoForm' },
  { name: 'Exportação & RBAC', screens: 'cadastros/usuarios (atribuição de papel) + design-system/EstadosContaPage (RBAC visível em UI)' },
]
