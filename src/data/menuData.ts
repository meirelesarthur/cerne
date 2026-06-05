import {
  LayoutDashboard,
  Star,
  TrendingUp,
  Layers,
  Building2,
  Gauge,
  Wallet,
  Truck,
  Receipt,
  BarChart3,
  Network,
  Users,
  CreditCard,
  Scale,
  Wheat,
  Beef,
  Package,
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
  type LucideIcon,
} from 'lucide-react'

export interface NavSubItem {
  id: string
  label: string
  path: string
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
    flatItems: [
      { id: 'fav-dfe', label: 'DFe Recebidas', path: '/favoritos/dfe' },
      { id: 'fav-pagar', label: 'C. a Pagar', path: '/favoritos/pagar' },
      { id: 'fav-receber', label: 'C. a Receber', path: '/favoritos/receber' },
      { id: 'fav-caixa', label: 'Mov. Caixa/Bancário', path: '/favoritos/caixa' },
      { id: 'fav-ofx', label: 'Importação OFX', path: '/favoritos/ofx' },
    ],
  },
  {
    id: 'dashboards',
    label: 'Dashboards',
    emoji: '📈',
    icon: TrendingUp,
    flatItems: [
      { id: 'dash-overview', label: 'Visão Geral', path: '/dashboards/visao-geral' },
      { id: 'dash-fin', label: 'Financeiros', path: '/dashboards/financeiros' },
      { id: 'dash-sup', label: 'Suprimentos', path: '/dashboards/suprimentos' },
      { id: 'dash-pec', label: 'Pecuária de Corte', path: '/dashboards/pecuaria' },
      { id: 'dash-dep', label: 'Depreciações', path: '/dashboards/depreciacoes' },
      { id: 'dash-ati', label: 'Ativos', path: '/dashboards/ativos' },
      { id: 'dash-usr', label: 'Análise de Usuários', path: '/dashboards/usuarios' },
      { id: 'dash-plu', label: 'Pluviometria', path: '/dashboards/pluviometria' },
      { id: 'dash-lcx', label: 'Livro Caixa', path: '/dashboards/livro-caixa' },
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
          { id: 'cad-est-cc', label: 'Centros de Custo', path: '/cadastros/centros-custo' },
          { id: 'cad-est-faz', label: 'Fazendas', path: '/cadastros/fazendas' },
          { id: 'cad-est-saf', label: 'Safras', path: '/cadastros/safras' },
          {
            id: 'cad-est-pro', label: 'Produtos', path: '/cadastros/produtos',
            children: [
              { id: 'cad-est-pro-lista', label: 'Catálogo',       path: '/cadastros/produtos/catalogo' },
              { id: 'cad-est-emb',       label: 'Embalagens',     path: '/cadastros/embalagens' },
              { id: 'cad-est-arm',       label: 'Armazéns',       path: '/cadastros/armazens' },
              { id: 'cad-est-sal-ini',   label: 'Saldo Inicial',  path: '/cadastros/estoques-iniciais' },
            ],
          },
          { id: 'cad-est-end', label: 'Endereçamentos', path: '/cadastros/enderecos' },
        ],
      },
      {
        id: 'cad-pessoas',
        label: 'Pessoas',
        icon: Users,
        items: [
          { id: 'cad-pes-per', label: 'Perfil de Usuário', path: '/cadastros/perfil' },
          { id: 'cad-pes-uni', label: 'Pessoas Unificado', path: '/cadastros/pessoas' },
          { id: 'cad-pes-pro', label: 'Proprietários', path: '/cadastros/proprietarios' },
          { id: 'cad-pes-fun', label: 'Funcionários', path: '/cadastros/funcionarios' },
          { id: 'cad-pes-for', label: 'Fornecedores', path: '/cadastros/fornecedores' },
          { id: 'cad-pes-cli', label: 'Clientes', path: '/cadastros/clientes' },
          { id: 'cad-pes-usr', label: 'Usuários', path: '/cadastros/usuarios' },
          { id: 'cad-pes-aut', label: 'Autorizadores', path: '/cadastros/autorizadores' },
        ],
      },
      {
        id: 'cad-financeiros',
        label: 'Financeiros',
        icon: CreditCard,
        items: [
          { id: 'cad-fin-bco', label: 'Contas Bancárias', path: '/cadastros/contas-bancarias' },
          { id: 'cad-fin-sal', label: 'Saldo Inicial', path: '/cadastros/saldo-inicial' },
          { id: 'cad-fin-cnd', label: 'Condições de Pagamento', path: '/cadastros/condicoes-pagamento' },
          { id: 'cad-fin-cat', label: 'Categorias Financeiras', path: '/cadastros/categorias' },
        ],
      },
      {
        id: 'cad-fiscais',
        label: 'Fiscais',
        icon: Scale,
        items: [
          { id: 'cad-fis-emi', label: 'Emissores NFe', path: '/cadastros/emissores' },
          { id: 'cad-fis-sin', label: 'Sincronização DFe', path: '/cadastros/sincronizacao-dfe' },
          { id: 'cad-fis-reg', label: 'Regras Fiscais', path: '/cadastros/regras-fiscais' },
          { id: 'cad-fis-cnt', label: 'Contador', path: '/cadastros/contador' },
          { id: 'cad-fis-nat', label: 'Natureza de Operação', path: '/cadastros/natureza-operacao' },
          { id: 'cad-fis-inf', label: 'Informações Complementares', path: '/cadastros/info-complementares' },
          { id: 'cad-fis-pla', label: 'Plano de Contas', path: '/cadastros/plano-contas' },
        ],
      },
      {
        id: 'cad-agricolas',
        label: 'Agrícolas',
        icon: Wheat,
        items: [
          { id: 'cad-agr-ope', label: 'Operações', path: '/cadastros/operacoes' },
          { id: 'cad-agr-ati', label: 'Atividades', path: '/cadastros/atividades' },
          { id: 'cad-agr-cul', label: 'Cultura / Variedade', path: '/cadastros/cultura' },
          { id: 'cad-agr-cic', label: 'Ciclo de Produção', path: '/cadastros/ciclo-producao' },
        ],
      },
      {
        id: 'cad-pecuarios',
        label: 'Pecuários',
        icon: Beef,
        items: [
          { id: 'cad-pec-par', label: 'Parâmetros / Peso', path: '/cadastros/parametros-peso' },
          { id: 'cad-pec-for', label: 'Forragem', path: '/cadastros/forragem' },
          { id: 'cad-pec-reb', label: 'Rebanho', path: '/cadastros/rebanho' },
          { id: 'cad-pec-mod', label: 'Módulo Pastejo', path: '/cadastros/modulo-pastejo' },
          { id: 'cad-pec-coc', label: 'Cochos', path: '/cadastros/cochos' },
          { id: 'cad-pec-lot', label: 'Lotes Animais', path: '/cadastros/lotes-animais' },
          { id: 'cad-pec-lmo', label: 'Lote / Módulo', path: '/cadastros/lote-modulo' },
          { id: 'cad-pec-lar', label: 'Lote / Área', path: '/cadastros/lote-area' },
        ],
      },
      {
        id: 'cad-bens',
        label: 'Bens / Ativos',
        icon: Package,
        items: [
          { id: 'cad-ben-inv', label: 'Inventário', path: '/cadastros/inventario' },
          { id: 'cad-ben-dep', label: 'Depreciação Mensal', path: '/cadastros/depreciacao-mensal' },
          { id: 'cad-ben-pre', label: 'Previsão de Depreciação', path: '/cadastros/previsao-depreciacao' },
        ],
      },
      {
        id: 'cad-gerais',
        label: 'Gerais',
        icon: SlidersHorizontal,
        items: [
          { id: 'cad-ger-par', label: 'Parametrizações do sistema', path: '/cadastros/parametrizacoes' },
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
          { id: 'adm-sup-sla', label: 'Parâmetros SLA', path: '/administrativo/sla' },
          { id: 'adm-sup-meu', label: 'Meus Processos', path: '/administrativo/meus-processos' },
          { id: 'adm-sup-sol', label: 'Solicitação', path: '/administrativo/solicitacao' },
          { id: 'adm-sup-rej', label: 'Rejeitados / Cancelados', path: '/administrativo/rejeitados' },
          { id: 'adm-sup-cot', label: 'Cotações', path: '/administrativo/cotacoes' },
          { id: 'adm-sup-aut', label: 'Autorização', path: '/administrativo/autorizacao' },
          { id: 'adm-sup-com', label: 'Compras', path: '/administrativo/compras' },
          { id: 'adm-sup-rec', label: 'Recebimentos', path: '/administrativo/recebimentos' },
        ],
      },
      {
        id: 'adm-estoque',
        label: 'Estoque',
        icon: Warehouse,
        items: [
          { id: 'adm-est-dfe', label: 'Doc. Fiscal / Entrada', path: '/administrativo/doc-fiscal' },
          { id: 'adm-est-dfe2', label: 'DFe Recebidas', path: '/administrativo/dfe-recebidas' },
          { id: 'adm-est-bai', label: 'Baixa de Estoque', path: '/administrativo/baixa-estoque' },
          { id: 'adm-est-req', label: 'Requisição / Saída', path: '/administrativo/requisicao' },
          { id: 'adm-est-dev', label: 'Devolução / Entrada', path: '/administrativo/devolucao' },
          { id: 'adm-est-cor', label: 'Correção de Estoque', path: '/administrativo/correcao' },
          { id: 'adm-est-trm', label: 'Transferência entre Armazéns', path: '/administrativo/transf-armazens' },
          { id: 'adm-est-trf', label: 'Transferência entre Fazendas', path: '/administrativo/transf-fazendas' },
          { id: 'adm-est-sal', label: 'Saldo de Estoque', path: '/administrativo/saldo-estoque' },
          { id: 'adm-est-fab', label: 'Fábrica', path: '/administrativo/fabrica' },
        ],
      },
      {
        id: 'adm-gestao-pessoal',
        label: 'Gestão Pessoal',
        icon: UserCheck,
        items: [
          { id: 'adm-gp-eve', label: 'Eventos', path: '/administrativo/eventos' },
          { id: 'adm-gp-fun', label: 'Funções', path: '/administrativo/funcoes' },
          { id: 'adm-gp-equ', label: 'Equipes', path: '/administrativo/equipes' },
          { id: 'adm-gp-fal', label: 'Registro de Faltas', path: '/administrativo/faltas' },
          { id: 'adm-gp-adi', label: 'Adiantamento Salarial', path: '/administrativo/adiantamento' },
          { id: 'adm-gp-reg', label: 'Registro de Eventos', path: '/administrativo/registro-eventos' },
          { id: 'adm-gp-fxe', label: 'Funcionário x Eventos', path: '/administrativo/func-eventos' },
          { id: 'adm-gp-apu', label: 'Apuração Mensal', path: '/administrativo/apuracao' },
        ],
      },
      {
        id: 'adm-gestao-doc',
        label: 'Gestão Documentos',
        icon: Files,
        items: [
          { id: 'adm-gd-tip', label: 'Tipo de Documento', path: '/administrativo/tipo-documento' },
          { id: 'adm-gd-doc', label: 'Documentos', path: '/administrativo/documentos' },
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
          { id: 'ope-agr-pla', label: 'Planejamentos', path: '/operacional/planejamentos' },
          { id: 'ope-agr-apo', label: 'Apontamentos', path: '/operacional/apontamentos' },
          { id: 'ope-agr-rom', label: 'Romaneios', path: '/operacional/romaneios' },
          { id: 'ope-agr-car', label: 'Carregamento', path: '/operacional/carregamento' },
          { id: 'ope-agr-ras', label: 'Rastreabilidade', path: '/operacional/rastreabilidade' },
          { id: 'ope-agr-des', label: 'Descontos / Classificação', path: '/operacional/descontos' },
          { id: 'ope-agr-pes', label: 'Pesagem Rodoviária', path: '/operacional/pesagem' },
          { id: 'ope-agr-con', label: 'Contratos de Venda', path: '/operacional/contratos-venda' },
        ],
      },
      {
        id: 'ope-pecuaria',
        label: 'Pecuária',
        icon: Beef,
        items: [
          { id: 'ope-pec-ges', label: 'Gestão Animais', path: '/operacional/gestao-animais' },
          { id: 'ope-pec-inv', label: 'Inventariado', path: '/operacional/inventariado' },
          { id: 'ope-pec-pla', label: 'Planejamento Pecuário', path: '/operacional/planejamento-pecuario' },
          { id: 'ope-pec-tra', label: 'Transferências', path: '/operacional/transferencias' },
          { id: 'ope-pec-mov', label: 'Movimentações', path: '/operacional/movimentacoes' },
          { id: 'ope-pec-man', label: 'Manejo', path: '/operacional/manejo' },
          { id: 'ope-pec-rep', label: 'Reprodução', path: '/operacional/reproducao' },
        ],
      },
      {
        id: 'ope-pluviometria',
        label: 'Pluviometria',
        icon: CloudRain,
        items: [
          { id: 'ope-plu', label: 'Pluviometria', path: '/operacional/pluviometria' },
        ],
      },
      {
        id: 'ope-vendas',
        label: 'Vendas',
        icon: ShoppingBag,
        items: [
          { id: 'ope-ven-orc', label: 'Orçamentos', path: '/operacional/orcamentos' },
          { id: 'ope-ven-ped', label: 'Pedidos', path: '/operacional/pedidos' },
          { id: 'ope-ven-ven', label: 'Vendas', path: '/operacional/vendas' },
        ],
      },
      {
        id: 'ope-ordens',
        label: 'Ordens de Serviço',
        icon: ClipboardCheck,
        items: [
          { id: 'ope-os-min', label: 'Minhas OS', path: '/operacional/minhas-os' },
          { id: 'ope-os-lis', label: 'Lista de OS', path: '/operacional/lista-os' },
          { id: 'ope-os-mon', label: 'Monitoramento', path: '/operacional/monitoramento' },
          { id: 'ope-os-ava', label: 'Avaliações', path: '/operacional/avaliacoes' },
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
          { id: 'fin-pag', label: 'Contas a Pagar', path: '/financeiro/pagar' },
          { id: 'fin-rec', label: 'Contas a Receber', path: '/financeiro/receber' },
          { id: 'fin-cai', label: 'Mov. Caixa / Bancário', path: '/financeiro/caixa' },
          { id: 'fin-flu', label: 'Fluxo Bancário', path: '/financeiro/fluxo' },
          { id: 'fin-con', label: 'Gestão de Contratos', path: '/financeiro/contratos' },
          { id: 'fin-pre', label: 'Prev. Orçamentária', path: '/financeiro/previsao' },
          { id: 'fin-cng', label: 'Congelamentos Financeiros', path: '/financeiro/congelamentos' },
          { id: 'fin-imp', label: 'Importação Mov. Bancários', path: '/financeiro/importacao' },
        ],
      },
      {
        id: 'fin-conciliacao',
        label: 'Conciliação',
        icon: GitMerge,
        items: [
          { id: 'fin-cnc-ofx', label: 'Importação OFX', path: '/financeiro/ofx' },
          { id: 'fin-cnc-mes', label: 'Meses Conciliados', path: '/financeiro/meses-conciliados' },
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
      { id: 'fro-man', label: 'Manutenções', path: '/frota/manutencoes' },
      { id: 'fro-aba', label: 'Abastecimentos', path: '/frota/abastecimentos' },
      { id: 'fro-pre', label: 'Manutenções Preventivas', path: '/frota/preventivas' },
      { id: 'fro-rev', label: 'Revisões Agendadas', path: '/frota/revisoes' },
      { id: 'fro-tra', label: 'Transferência de Máquinas', path: '/frota/transferencias' },
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
          { id: 'fis-nfe-emi', label: 'NFe Emitidas', path: '/fiscal/nfe-emitidas' },
          { id: 'fis-nfe-xml', label: 'Arquivos XML', path: '/fiscal/xml' },
          { id: 'fis-nfe-dfe', label: 'DFe Recebidas', path: '/fiscal/dfe' },
        ],
      },
      {
        id: 'fis-cte',
        label: 'CT-e',
        icon: Truck,
        items: [
          { id: 'fis-cte-lis', label: 'Lista de CTe', path: '/fiscal/cte-lista' },
          { id: 'fis-cte-nov', label: 'Nova CTe', path: '/fiscal/cte-nova' },
          { id: 'fis-cte-man', label: 'Manifestar CTe', path: '/fiscal/cte-manifestar' },
        ],
      },
      {
        id: 'fis-mdfe',
        label: 'MDF-e',
        icon: Files,
        items: [
          { id: 'fis-mdf-lis', label: 'Lista de MDFe', path: '/fiscal/mdfe-lista' },
          { id: 'fis-mdf-nov', label: 'Nova MDFe', path: '/fiscal/mdfe-nova' },
        ],
      },
      {
        id: 'fis-outros',
        label: 'Outros',
        icon: MoreHorizontal,
        items: [
          { id: 'fis-lcd', label: 'LCDPR — Livro Caixa Digital', path: '/fiscal/lcdpr' },
          { id: 'fis-par', label: 'Partida Dobrada', path: '/fiscal/partida-dobrada' },
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
      { id: 'rel-ben', label: 'Bens / Ativo', path: '/relatorios/bens' },
      { id: 'rel-agr', label: 'Agricultura', path: '/relatorios/agricultura' },
      { id: 'rel-pec', label: 'Pecuária', path: '/relatorios/pecuaria' },
      { id: 'rel-fin', label: 'Financeiro', path: '/relatorios/financeiro' },
      { id: 'rel-est', label: 'Estoque', path: '/relatorios/estoque' },
      { id: 'rel-sup', label: 'Suprimentos', path: '/relatorios/suprimentos' },
      { id: 'rel-ven', label: 'Vendas', path: '/relatorios/vendas' },
      { id: 'rel-gpe', label: 'Gestão Pessoal', path: '/relatorios/gestao-pessoal' },
      { id: 'rel-gfi', label: 'Gestão Fiscal', path: '/relatorios/gestao-fiscal' },
      { id: 'rel-gfr', label: 'Gestão de Frotas', path: '/relatorios/frotas' },
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
          { id: 'int-dom-soft', label: 'Software Domínio', path: '/integracoes/dominio' },
        ],
      },
      {
        id: 'int-exp-dom',
        label: 'Exportação / Domínio',
        icon: Upload,
        items: [
          { id: 'int-exp-bco', label: 'Mov. Bancário', path: '/integracoes/exp-bancario' },
          { id: 'int-exp-fol', label: 'Folha Salarial', path: '/integracoes/exp-folha' },
          { id: 'int-exp-cp', label: 'Contas Pagar / Receber', path: '/integracoes/exp-cp' },
          { id: 'int-exp-nfse', label: 'NFSe', path: '/integracoes/exp-nfse' },
        ],
      },
      {
        id: 'int-exp-csv',
        label: 'Exportações / CSV',
        icon: Table,
        items: [
          { id: 'int-csv', label: 'Exportação CSV', path: '/integracoes/csv' },
        ],
      },
    ],
  },
]
