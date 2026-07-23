import {
  LayoutDashboard,
  Star,
  TrendingUp,
  TrendingDown,
  Layers,
  Building2,
  Gauge,
  Wallet,
  Truck,
  Receipt,
  BarChart3,
  BarChart,
  Network,
  Users,
  CreditCard,
  Scale,
  Wheat,
  Beef,
  Package,
  Package2,
  SlidersHorizontal,
  ShoppingCart,
  Warehouse,
  UserCheck,
  Files,
  CloudRain,
  ShoppingBag,
  ClipboardCheck,
  GitMerge,
  FileText,
  MoreHorizontal,
  Globe,
  Upload,
  Table,
  FileInput,
  ArrowUpCircle,
  ArrowDownCircle,
  BookOpen,
  Activity,
  Calendar,
  MapPin,
  UserCog,
  ShieldCheck,
  Landmark,
  Tag,
  RefreshCw,
  Calculator,
  GitBranch,
  Info,
  ListTree,
  Settings2,
  ClipboardList,
  Sprout,
  RotateCw,
  Map,
  Boxes,
  LineChart,
  Settings,
  Timer,
  ListChecks,
  FilePlus,
  XCircle,
  FileSearch,
  PackageCheck,
  Inbox,
  PackageMinus,
  PackageOpen,
  Undo2,
  Wrench,
  ArrowLeftRight,
  Repeat,
  Factory,
  Briefcase,
  CalendarX,
  DollarSign,
  FileType,
  PenLine,
  Route,
  Percent,
  FileSignature,
  Heart,
  Lock,
  CalendarCheck,
  Fuel,
  CalendarClock,
  FileCheck,
  FileCode,
  GitCompare,
  Banknote,
  type LucideIcon,
} from 'lucide-react'

export interface NavSubItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
  children?: Omit<NavSubItem, 'children'>[]
}

export interface NavGroup {
  id: string
  label: string
  icon: LucideIcon
  items: NavSubItem[]
}

export interface NavModule {
  id: string
  label: string
  emoji: string
  icon: LucideIcon
  path?: string
  groups?: NavGroup[]
  flatItems?: NavSubItem[]
}

export const menuModules: NavModule[] = [
  {
    id: 'painel',
    label: 'Home',
    emoji: '🏠',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    id: 'favoritos',
    label: 'Favoritos',
    emoji: '⭐',
    icon: Star,
    path: '/favoritos',
  },
  {
    id: 'dashboards',
    label: 'Dashboards',
    emoji: '📈',
    icon: TrendingUp,
    flatItems: [
      { id: 'dash-overview', label: 'Visão Geral', path: '/dashboards/visao-geral', icon: LayoutDashboard },
      { id: 'dash-fin', label: 'Financeiros', path: '/dashboards/financeiros', icon: Wallet },
      { id: 'dash-sup', label: 'Suprimentos', path: '/dashboards/suprimentos', icon: ShoppingCart },
      { id: 'dash-pec', label: 'Pecuária de Corte', path: '/dashboards/pecuaria', icon: Beef },
      { id: 'dash-dep', label: 'Depreciações', path: '/dashboards/depreciacoes', icon: TrendingDown },
      { id: 'dash-ati', label: 'Ativos', path: '/dashboards/ativos', icon: Package },
      { id: 'dash-usr', label: 'Análise de Usuários', path: '/dashboards/usuarios', icon: Users },
      { id: 'dash-plu', label: 'Pluviometria', path: '/dashboards/pluviometria', icon: CloudRain },
      { id: 'dash-lcx', label: 'Livro Caixa', path: '/dashboards/livro-caixa', icon: BookOpen },
      { id: 'dash-cur', label: 'Lotação de Currais', path: '/dashboards/lotacao-currais', icon: Warehouse },
      { id: 'dash-des', label: 'Desempenho de Lotes', path: '/dashboards/desempenho-lotes', icon: Activity },
      { id: 'dash-nut', label: 'Estoque Nutrição', path: '/dashboards/estoque-nutricao', icon: Package2 },
      { id: 'dash-rac', label: 'Consumo de Ração', path: '/dashboards/consumo-racao', icon: Wheat },
      { id: 'dash-cco', label: 'Custos do Confinamento', path: '/dashboards/custos-confinamento', icon: Receipt },
    ],
  },
  {
    id: 'cadastros',
    label: 'Cadastros Base',
    emoji: '🗂️',
    icon: Layers,
    groups: [
      {
        id: 'cad-estrutura',
        label: 'Estrutura',
        icon: Layers,
        items: [
          { id: 'cad-est-cc',        label: 'Centros de Custo', path: '/cadastros/centros-custo',   icon: Layers },
          { id: 'cad-est-faz',       label: 'Fazendas',         path: '/cadastros/fazendas',         icon: Building2 },
          { id: 'cad-est-saf',       label: 'Safras',           path: '/cadastros/safras',           icon: Calendar },
          { id: 'cad-est-pro-lista', label: 'Catálogo',         path: '/cadastros/produtos/catalogo', icon: BookOpen },
          { id: 'cad-est-emb',       label: 'Embalagens',       path: '/cadastros/embalagens',       icon: Package },
          { id: 'cad-est-arm',       label: 'Armazéns',         path: '/cadastros/armazens',         icon: Warehouse },
          { id: 'cad-est-sal-ini',   label: 'Saldo Inicial',    path: '/cadastros/estoques-iniciais', icon: Wallet },
          { id: 'cad-est-end',       label: 'Endereçamentos',   path: '/cadastros/enderecos',        icon: MapPin },
        ],
      },
      {
        id: 'cad-pessoas',
        label: 'Pessoas',
        icon: Users,
        items: [
          { id: 'cad-pes-per', label: 'Perfil de Usuário', path: '/cadastros/perfil',      icon: UserCog },
          { id: 'cad-pes-uni', label: 'Pessoas',           path: '/cadastros/pessoas',     icon: Users },
          { id: 'cad-pes-usr', label: 'Usuários',          path: '/cadastros/usuarios',    icon: UserCheck },
          { id: 'cad-pes-aut', label: 'Autorizadores',     path: '/cadastros/autorizadores', icon: ShieldCheck },
        ],
      },
      {
        id: 'cad-financeiros',
        label: 'Financeiros',
        icon: CreditCard,
        items: [
          { id: 'cad-fin-ban', label: 'Bancos',                  path: '/cadastros/bancos',               icon: Landmark },
          { id: 'cad-fin-bco', label: 'Contas Bancárias',        path: '/cadastros/contas-bancarias',     icon: Landmark },
          { id: 'cad-fin-sal', label: 'Saldo Inicial',           path: '/cadastros/saldo-inicial',        icon: Wallet },
          { id: 'cad-fin-cnd', label: 'Condições de Pagamento',  path: '/cadastros/condicoes-pagamento',  icon: CreditCard },
          { id: 'cad-fin-cat', label: 'Categorias Financeiras',  path: '/cadastros/categorias',           icon: Tag },
        ],
      },
      {
        id: 'cad-fiscais',
        label: 'Fiscais',
        icon: Scale,
        items: [
          { id: 'cad-fis-emi', label: 'Emissores NFe',              path: '/cadastros/emissores',           icon: FileText },
          { id: 'cad-fis-sin', label: 'Sincronização DFe',          path: '/cadastros/sincronizacao-dfe',   icon: RefreshCw },
          { id: 'cad-fis-reg', label: 'Regras Fiscais',             path: '/cadastros/regras-fiscais',      icon: Scale },
          { id: 'cad-fis-cnt', label: 'Contador',                   path: '/cadastros/contador',            icon: Calculator },
          { id: 'cad-fis-nat', label: 'Natureza de Operação',       path: '/cadastros/natureza-operacao',   icon: GitBranch },
          { id: 'cad-fis-inf', label: 'Informações Complementares', path: '/cadastros/info-complementares', icon: Info },
          { id: 'cad-fis-pla', label: 'Plano de Contas',            path: '/cadastros/plano-contas',        icon: ListTree },
        ],
      },
      {
        id: 'cad-agricolas',
        label: 'Agrícolas',
        icon: Wheat,
        items: [
          { id: 'cad-agr-ope', label: 'Operações',           path: '/cadastros/operacoes',      icon: Settings2 },
          { id: 'cad-agr-ati', label: 'Atividades',          path: '/cadastros/atividades',     icon: ClipboardList },
          { id: 'cad-agr-cul', label: 'Cultura / Variedade', path: '/cadastros/cultura',        icon: Sprout },
          { id: 'cad-agr-cic', label: 'Ciclo de Produção',   path: '/cadastros/ciclo-producao', icon: RotateCw },
        ],
      },
      {
        id: 'cad-pecuarios',
        label: 'Pecuários',
        icon: Beef,
        items: [
          { id: 'cad-pec-par', label: 'Parâmetros / Peso', path: '/cadastros/parametros-peso', icon: Scale },
          { id: 'cad-pec-for', label: 'Forragem',          path: '/cadastros/forragem',        icon: Wheat },
          { id: 'cad-pec-reb', label: 'Rebanho',           path: '/cadastros/rebanho',         icon: Beef },
          { id: 'cad-pec-mod', label: 'Módulo Pastejo',    path: '/cadastros/modulo-pastejo',  icon: Map },
          { id: 'cad-pec-coc', label: 'Cochos',            path: '/cadastros/cochos',          icon: Package2 },
          { id: 'cad-pec-lot', label: 'Lotes Animais',     path: '/cadastros/lotes-animais',   icon: Layers },
          { id: 'cad-pec-lmo', label: 'Lote / Módulo',     path: '/cadastros/lote-modulo',     icon: Boxes },
          { id: 'cad-pec-lar', label: 'Lote / Área',       path: '/cadastros/lote-area',       icon: MapPin },
        ],
      },
      {
        id: 'cad-bens',
        label: 'Bens / Ativos',
        icon: Package,
        items: [
          { id: 'cad-ben-inv', label: 'Inventário',                path: '/cadastros/inventario',            icon: ClipboardList },
          { id: 'cad-ben-dep', label: 'Depreciação Mensal',        path: '/cadastros/depreciacao-mensal',    icon: TrendingDown },
          { id: 'cad-ben-pre', label: 'Previsão de Depreciação',   path: '/cadastros/previsao-depreciacao',  icon: LineChart },
        ],
      },
      {
        id: 'cad-gerais',
        label: 'Gerais',
        icon: SlidersHorizontal,
        items: [
          { id: 'cad-ger-cid', label: 'Cidades',                   path: '/cadastros/cidades',            icon: MapPin },
          { id: 'cad-ger-par', label: 'Parametrizações do sistema', path: '/cadastros/parametrizacoes', icon: Settings },
        ],
      },
    ],
  },
  {
    id: 'administrativo',
    label: 'Administrativo',
    emoji: '🏢',
    icon: Building2,
    groups: [
      {
        id: 'adm-suprimentos',
        label: 'Suprimentos',
        icon: ShoppingCart,
        items: [
          { id: 'adm-sup-sla', label: 'Parâmetros SLA',         path: '/administrativo/sla',            icon: Timer },
          { id: 'adm-sup-meu', label: 'Meus Processos',         path: '/administrativo/meus-processos', icon: ListChecks },
          { id: 'adm-sup-sol', label: 'Solicitação',            path: '/administrativo/solicitacao',    icon: FilePlus },
          { id: 'adm-sup-rej', label: 'Rejeitados / Cancelados', path: '/administrativo/rejeitados',    icon: XCircle },
          { id: 'adm-sup-cot', label: 'Cotações',               path: '/administrativo/cotacoes',       icon: FileSearch },
          { id: 'adm-sup-aut', label: 'Autorização',            path: '/administrativo/autorizacao',    icon: ShieldCheck },
          { id: 'adm-sup-com', label: 'Compras',                path: '/administrativo/compras',        icon: ShoppingCart },
          { id: 'adm-sup-rec', label: 'Recebimentos',           path: '/administrativo/recebimentos',   icon: PackageCheck },
        ],
      },
      {
        id: 'adm-estoque',
        label: 'Estoque',
        icon: Warehouse,
        items: [
          { id: 'adm-est-dfe',  label: 'Doc. Fiscal / Entrada',            path: '/administrativo/doc-fiscal',      icon: FileInput },
          { id: 'adm-est-dfe2', label: 'DFe Recebidas',                    path: '/administrativo/dfe-recebidas',   icon: Inbox },
          { id: 'adm-est-bai',  label: 'Baixa de Estoque',                 path: '/administrativo/baixa-estoque',   icon: PackageMinus },
          { id: 'adm-est-req',  label: 'Requisição / Saída',               path: '/administrativo/requisicao',      icon: PackageOpen },
          { id: 'adm-est-dev',  label: 'Devolução / Entrada',              path: '/administrativo/devolucao',       icon: Undo2 },
          { id: 'adm-est-cor',  label: 'Correção de Estoque',              path: '/administrativo/correcao',        icon: Wrench },
          { id: 'adm-est-trm',  label: 'Transferência entre Armazéns',     path: '/administrativo/transf-armazens', icon: ArrowLeftRight },
          { id: 'adm-est-trf',  label: 'Transferência entre Fazendas',     path: '/administrativo/transf-fazendas', icon: Repeat },
          { id: 'adm-est-sal',  label: 'Saldo de Estoque',                 path: '/administrativo/saldo-estoque',   icon: BarChart },
          { id: 'adm-est-fab',  label: 'Fábrica',                         path: '/administrativo/fabrica',         icon: Factory },
        ],
      },
      {
        id: 'adm-gestao-pessoal',
        label: 'Gestão Pessoal',
        icon: UserCheck,
        items: [
          { id: 'adm-gp-eve', label: 'Eventos',                path: '/administrativo/eventos',          icon: Calendar },
          { id: 'adm-gp-fun', label: 'Funções',                path: '/administrativo/funcoes',          icon: Briefcase },
          { id: 'adm-gp-equ', label: 'Equipes',                path: '/administrativo/equipes',          icon: Users },
          { id: 'adm-gp-fal', label: 'Registro de Faltas',     path: '/administrativo/faltas',           icon: CalendarX },
          { id: 'adm-gp-adi', label: 'Adiantamento Salarial',  path: '/administrativo/adiantamento',     icon: DollarSign },
          { id: 'adm-gp-reg', label: 'Registro de Eventos',    path: '/administrativo/registro-eventos', icon: ClipboardList },
          { id: 'adm-gp-fxe', label: 'Funcionário x Eventos',  path: '/administrativo/func-eventos',     icon: UserCog },
          { id: 'adm-gp-apu', label: 'Apuração Mensal',        path: '/administrativo/apuracao',         icon: Calculator },
        ],
      },
      {
        id: 'adm-gestao-doc',
        label: 'Gestão Documentos',
        icon: Files,
        items: [
          { id: 'adm-gd-tip', label: 'Tipo de Documento', path: '/administrativo/tipo-documento', icon: FileType },
          { id: 'adm-gd-doc', label: 'Documentos',        path: '/administrativo/documentos',     icon: FileText },
        ],
      },
    ],
  },
  {
    id: 'operacional',
    label: 'Operacional',
    emoji: '⚙️',
    icon: Gauge,
    groups: [
      {
        id: 'ope-agricultura',
        label: 'Agricultura',
        icon: Wheat,
        items: [
          { id: 'ope-agr-pla', label: 'Planejamentos',            path: '/operacional/planejamentos',   icon: ClipboardList },
          { id: 'ope-agr-apo', label: 'Apontamentos',             path: '/operacional/apontamentos',    icon: PenLine },
          { id: 'ope-agr-rom', label: 'Romaneios',                path: '/operacional/romaneios',       icon: FileText },
          { id: 'ope-agr-car', label: 'Carregamento',             path: '/operacional/carregamento',    icon: Truck },
          { id: 'ope-agr-ras', label: 'Rastreabilidade',          path: '/operacional/rastreabilidade', icon: Route },
          { id: 'ope-agr-des', label: 'Descontos / Classificação', path: '/operacional/descontos',      icon: Percent },
          { id: 'ope-agr-pes', label: 'Pesagem Rodoviária',       path: '/operacional/pesagem',         icon: Scale },
          { id: 'ope-agr-con', label: 'Contratos de Venda',       path: '/operacional/contratos-venda', icon: FileSignature },
        ],
      },
      {
        id: 'ope-pecuaria',
        label: 'Pecuária',
        icon: Beef,
        items: [
          { id: 'ope-pec-ges', label: 'Gestão Animais',          path: '/operacional/gestao-animais',        icon: Beef },
          { id: 'ope-pec-inv', label: 'Inventariado',            path: '/operacional/inventariado',          icon: ClipboardCheck },
          { id: 'ope-pec-pla', label: 'Planejamento Pecuário',   path: '/operacional/planejamento-pecuario', icon: ClipboardList },
          { id: 'ope-pec-tra', label: 'Transferências',          path: '/operacional/transferencias',        icon: ArrowLeftRight },
          { id: 'ope-pec-mov', label: 'Movimentações',           path: '/operacional/movimentacoes',         icon: Repeat },
          { id: 'ope-pec-man', label: 'Manejo',                  path: '/operacional/manejo',                icon: Settings2 },
          { id: 'ope-pec-rep', label: 'Reprodução',              path: '/operacional/reproducao',            icon: Heart },
        ],
      },
      {
        id: 'ope-pluviometria',
        label: 'Pluviometria',
        icon: CloudRain,
        items: [
          { id: 'ope-plu', label: 'Pluviometria', path: '/operacional/pluviometria', icon: CloudRain },
        ],
      },
      {
        id: 'ope-vendas',
        label: 'Vendas',
        icon: ShoppingBag,
        items: [
          { id: 'ope-ven-orc', label: 'Orçamentos', path: '/operacional/orcamentos', icon: Calculator },
          { id: 'ope-ven-ped', label: 'Pedidos',    path: '/operacional/pedidos',    icon: ClipboardList },
          { id: 'ope-ven-ven', label: 'Vendas',     path: '/operacional/vendas',     icon: ShoppingBag },
        ],
      },
      {
        id: 'ope-ordens',
        label: 'Ordens de Serviço',
        icon: ClipboardCheck,
        items: [
          { id: 'ope-os-min', label: 'Minhas OS',      path: '/operacional/minhas-os',     icon: ClipboardCheck },
          { id: 'ope-os-lis', label: 'Lista de OS',    path: '/operacional/lista-os',      icon: ListChecks },
          { id: 'ope-os-mon', label: 'Monitoramento',  path: '/operacional/monitoramento', icon: Activity },
          { id: 'ope-os-ava', label: 'Avaliações',     path: '/operacional/avaliacoes',    icon: Star },
        ],
      },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    emoji: '💰',
    icon: Wallet,
    groups: [
      {
        id: 'fin-principal',
        label: 'Financeiro',
        icon: Wallet,
        items: [
          { id: 'fin-pag', label: 'Contas a Pagar',              path: '/financeiro/pagar',        icon: ArrowUpCircle },
          { id: 'fin-bai', label: 'Baixa de Títulos',             path: '/financeiro/baixa-titulos', icon: FileCheck },
          { id: 'fin-rec', label: 'Contas a Receber',            path: '/financeiro/receber',       icon: ArrowDownCircle },
          { id: 'fin-cai', label: 'Mov. Caixa / Bancário',       path: '/financeiro/caixa',         icon: Wallet },
          { id: 'fin-flu', label: 'Fluxo Bancário',              path: '/financeiro/fluxo',         icon: Landmark },
          { id: 'fin-con', label: 'Gestão de Contratos',         path: '/financeiro/contratos',     icon: FileSignature },
          { id: 'fin-pre', label: 'Prev. Orçamentária',          path: '/financeiro/previsao',      icon: LineChart },
          { id: 'fin-cng', label: 'Congelamentos Financeiros',   path: '/financeiro/congelamentos', icon: Lock },
          { id: 'fin-imp', label: 'Importação Mov. Bancários',   path: '/financeiro/importacao',    icon: Upload },
        ],
      },
      {
        id: 'fin-conciliacao',
        label: 'Conciliação',
        icon: GitMerge,
        items: [
          { id: 'fin-cnc-ofx', label: 'Importação OFX',      path: '/financeiro/ofx',                icon: Upload },
          { id: 'fin-cnc-mes', label: 'Meses Conciliados',   path: '/financeiro/meses-conciliados',  icon: CalendarCheck },
        ],
      },
    ],
  },
  {
    id: 'frota',
    label: 'Gestão de Frota',
    emoji: '🚜',
    icon: Truck,
    flatItems: [
      { id: 'fro-man', label: 'Manutenções',               path: '/frota/manutencoes',    icon: Wrench },
      { id: 'fro-aba', label: 'Abastecimentos',            path: '/frota/abastecimentos', icon: Fuel },
      { id: 'fro-pre', label: 'Manutenções Preventivas',   path: '/frota/preventivas',    icon: ShieldCheck },
      { id: 'fro-rev', label: 'Revisões Agendadas',        path: '/frota/revisoes',       icon: CalendarClock },
      { id: 'fro-tra', label: 'Transferência de Máquinas', path: '/frota/transferencias', icon: ArrowLeftRight },
    ],
  },
  {
    id: 'fiscal',
    label: 'Gestão Fiscal',
    emoji: '📄',
    icon: Receipt,
    groups: [
      {
        id: 'fis-nfe',
        label: 'NF-e',
        icon: FileText,
        items: [
          { id: 'fis-nfe-emi', label: 'NFe Emitidas',   path: '/fiscal/nfe-emitidas', icon: FileCheck },
          { id: 'fis-nfe-xml', label: 'Arquivos XML',   path: '/fiscal/xml',         icon: FileCode },
          { id: 'fis-nfe-dfe', label: 'DFe Recebidas',  path: '/fiscal/dfe',         icon: Inbox },
        ],
      },
      {
        id: 'fis-cte',
        label: 'CT-e',
        icon: Truck,
        items: [
          { id: 'fis-cte-lis', label: 'Lista de CTe',     path: '/fiscal/cte-lista',      icon: ListChecks },
          { id: 'fis-cte-nov', label: 'Nova CTe',         path: '/fiscal/cte-nova',       icon: FilePlus },
          { id: 'fis-cte-man', label: 'Manifestar CTe',   path: '/fiscal/cte-manifestar', icon: FileSignature },
        ],
      },
      {
        id: 'fis-mdfe',
        label: 'MDF-e',
        icon: Files,
        items: [
          { id: 'fis-mdf-lis', label: 'Lista de MDFe', path: '/fiscal/mdfe-lista', icon: ListChecks },
          { id: 'fis-mdf-nov', label: 'Nova MDFe',      path: '/fiscal/mdfe-nova', icon: FilePlus },
        ],
      },
      {
        id: 'fis-outros',
        label: 'Outros',
        icon: MoreHorizontal,
        items: [
          { id: 'fis-lcd', label: 'LCDPR — Livro Caixa Digital', path: '/fiscal/lcdpr',           icon: BookOpen },
          { id: 'fis-par', label: 'Partida Dobrada',             path: '/fiscal/partida-dobrada', icon: GitCompare },
        ],
      },
    ],
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    emoji: '📋',
    icon: BarChart3,
    flatItems: [
      { id: 'rel-ben', label: 'Bens / Ativo',      path: '/relatorios/bens',            icon: Package },
      { id: 'rel-agr', label: 'Agricultura',       path: '/relatorios/agricultura',     icon: Wheat },
      { id: 'rel-pec', label: 'Pecuária',          path: '/relatorios/pecuaria',        icon: Beef },
      { id: 'rel-fin', label: 'Financeiro',        path: '/relatorios/financeiro',      icon: Wallet },
      { id: 'rel-est', label: 'Estoque',           path: '/relatorios/estoque',         icon: Warehouse },
      { id: 'rel-sup', label: 'Suprimentos',       path: '/relatorios/suprimentos',     icon: ShoppingCart },
      { id: 'rel-ven', label: 'Vendas',            path: '/relatorios/vendas',          icon: ShoppingBag },
      { id: 'rel-gpe', label: 'Gestão Pessoal',    path: '/relatorios/gestao-pessoal',  icon: Users },
      { id: 'rel-gfi', label: 'Gestão Fiscal',     path: '/relatorios/gestao-fiscal',   icon: Scale },
      { id: 'rel-gfr', label: 'Gestão de Frotas',  path: '/relatorios/frotas',          icon: Truck },
    ],
  },
  {
    id: 'integracoes',
    label: 'Integrações',
    emoji: '🔗',
    icon: Network,
    groups: [
      {
        id: 'int-dominio',
        label: 'Software Domínio',
        icon: Globe,
        items: [
          { id: 'int-dom-soft', label: 'Software Domínio', path: '/integracoes/dominio', icon: Globe },
        ],
      },
      {
        id: 'int-exp-dom',
        label: 'Exportação / Domínio',
        icon: Upload,
        items: [
          { id: 'int-exp-bco',  label: 'Mov. Bancário',           path: '/integracoes/exp-bancario', icon: Landmark },
          { id: 'int-exp-fol',  label: 'Folha Salarial',          path: '/integracoes/exp-folha',    icon: Banknote },
          { id: 'int-exp-cp',   label: 'Contas Pagar / Receber',  path: '/integracoes/exp-cp',       icon: CreditCard },
          { id: 'int-exp-nfse', label: 'NFSe',                    path: '/integracoes/exp-nfse',     icon: FileText },
        ],
      },
      {
        id: 'int-exp-csv',
        label: 'Exportações / CSV',
        icon: Table,
        items: [
          { id: 'int-csv', label: 'Exportação CSV', path: '/integracoes/csv', icon: Table },
        ],
      },
    ],
  },
]

export interface NavItemMatch {
  item:   NavSubItem
  module: NavModule
}

/** Localiza uma funcionalidade (item de menu) pelo id, junto do módulo ao qual pertence. */
export function findNavItemById(id: string): NavItemMatch | null {
  for (const module of menuModules) {
    const items = [
      ...(module.flatItems ?? []),
      ...(module.groups?.flatMap((g) => g.items) ?? []),
    ]
    for (const item of items) {
      if (item.id === id) return { item, module }
      const child = item.children?.find((c) => c.id === id)
      if (child) return { item: child as NavSubItem, module }
    }
  }
  return null
}
