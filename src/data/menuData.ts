import { type IconName } from '../components/ui/Icon'
export interface NavSubItem {
  id: string
  label: string
  path: string
  icon: IconName
  children?: Omit<NavSubItem, 'children'>[]
}

export interface NavGroup {
  id: string
  label: string
  icon: IconName
  items: NavSubItem[]
}

export interface NavModule {
  id: string
  label: string
  emoji: string
  icon: IconName
  path?: string
  groups?: NavGroup[]
  flatItems?: NavSubItem[]
}

export const menuModules: NavModule[] = [
  {
    id: 'painel',
    label: 'Home',
    emoji: '🏠',
    icon: 'dashboard',
    path: '/',
  },
  {
    id: 'favoritos',
    label: 'Favoritos',
    emoji: '⭐',
    icon: 'star',
    path: '/favoritos',
  },
  {
    id: 'dashboards',
    label: 'Dashboards',
    emoji: '📈',
    icon: 'trend-up',
    flatItems: [
      { id: 'dash-overview', label: 'Visão Geral', path: '/dashboards/visao-geral', icon: 'dashboard' },
      { id: 'dash-fin', label: 'Financeiros', path: '/dashboards/financeiros', icon: 'wallet' },
      { id: 'dash-sup', label: 'Suprimentos', path: '/dashboards/suprimentos', icon: 'cart' },
      { id: 'dash-pec', label: 'Pecuária de Corte', path: '/dashboards/pecuaria', icon: 'cattle' },
      { id: 'dash-dep', label: 'Depreciações', path: '/dashboards/depreciacoes', icon: 'trend-down' },
      { id: 'dash-ati', label: 'Ativos', path: '/dashboards/ativos', icon: 'package' },
      { id: 'dash-usr', label: 'Análise de Usuários', path: '/dashboards/usuarios', icon: 'users' },
      { id: 'dash-plu', label: 'Pluviometria', path: '/dashboards/pluviometria', icon: 'rain' },
      { id: 'dash-lcx', label: 'Livro Caixa', path: '/dashboards/livro-caixa', icon: 'book' },
      { id: 'dash-cur', label: 'Lotação de Currais', path: '/dashboards/lotacao-currais', icon: 'warehouse' },
      { id: 'dash-des', label: 'Desempenho de Lotes', path: '/dashboards/desempenho-lotes', icon: 'activity' },
      { id: 'dash-nut', label: 'Estoque Nutrição', path: '/dashboards/estoque-nutricao', icon: 'package-alt' },
      { id: 'dash-rac', label: 'Consumo de Ração', path: '/dashboards/consumo-racao', icon: 'grain' },
      { id: 'dash-cco', label: 'Custos do Confinamento', path: '/dashboards/custos-confinamento', icon: 'receipt' },
    ],
  },
  {
    id: 'cadastros',
    label: 'Cadastros Base',
    emoji: '🗂️',
    icon: 'layers',
    groups: [
      {
        id: 'cad-estrutura',
        label: 'Estrutura',
        icon: 'layers',
        items: [
          { id: 'cad-est-cc',        label: 'Centros de Custo', path: '/cadastros/centros-custo',   icon: 'layers' },
          { id: 'cad-est-faz',       label: 'Fazendas',         path: '/cadastros/fazendas',         icon: 'building' },
          { id: 'cad-est-saf',       label: 'Safras',           path: '/cadastros/safras',           icon: 'calendar' },
          { id: 'cad-est-pro-lista', label: 'Produtos',         path: '/cadastros/produtos',         icon: 'package-alt' },
          { id: 'cad-est-emb',       label: 'Embalagens',       path: '/cadastros/embalagens',       icon: 'package' },
          { id: 'cad-est-arm',       label: 'Armazéns',         path: '/cadastros/armazens',         icon: 'warehouse' },
          { id: 'cad-est-sal-ini',   label: 'Saldo Inicial',    path: '/cadastros/estoques-iniciais', icon: 'wallet' },
          { id: 'cad-est-end',       label: 'Endereçamentos',   path: '/cadastros/enderecos',        icon: 'location' },
          { id: 'cad-est-rat',       label: 'Rateios / Categorias', path: '/cadastros/rateios-categorias', icon: 'percent' },
        ],
      },
      {
        id: 'cad-pessoas',
        label: 'Pessoas',
        icon: 'users',
        items: [
          { id: 'cad-pes-per', label: 'Meu perfil',        path: '/cadastros/perfil',      icon: 'user-settings' },
          { id: 'cad-pes-uni', label: 'Pessoas',           path: '/cadastros/pessoas',     icon: 'users' },
          { id: 'cad-pes-pro', label: 'Proprietários',     path: '/cadastros/proprietarios', icon: 'contact' },
          { id: 'cad-pes-fun', label: 'Funcionários',      path: '/cadastros/funcionarios', icon: 'safety' },
          { id: 'cad-pes-for', label: 'Fornecedores',      path: '/cadastros/fornecedores', icon: 'truck' },
          { id: 'cad-pes-cli', label: 'Clientes',          path: '/cadastros/clientes',    icon: 'handshake' },
          { id: 'cad-pes-usr', label: 'Usuários',          path: '/cadastros/usuarios',    icon: 'user-check' },
          { id: 'cad-pes-aut', label: 'Autorizadores',     path: '/cadastros/autorizadores', icon: 'shield-check' },
          { id: 'cad-pes-rol', label: 'Perfis de Acesso',  path: '/cadastros/perfis-acesso', icon: 'lock' },
        ],
      },
      {
        id: 'cad-financeiros',
        label: 'Financeiros',
        icon: 'credit-card',
        items: [
          { id: 'cad-fin-ban', label: 'Bancos',                  path: '/cadastros/bancos',               icon: 'bank' },
          { id: 'cad-fin-agr', label: 'Agrupadores Contábeis',   path: '/cadastros/agrupadores-contabeis', icon: 'list-tree' },
          { id: 'cad-fin-bco', label: 'Contas Bancárias',        path: '/cadastros/contas-bancarias',     icon: 'bank' },
          { id: 'cad-fin-sal', label: 'Saldo Inicial',           path: '/cadastros/saldo-inicial',        icon: 'wallet' },
          { id: 'cad-fin-cnd', label: 'Condições de Pagamento',  path: '/cadastros/condicoes-pagamento',  icon: 'credit-card' },
          { id: 'cad-fin-cat', label: 'Categorias Financeiras',  path: '/cadastros/categorias',           icon: 'tag' },
        ],
      },
      {
        id: 'cad-fiscais',
        label: 'Fiscais',
        icon: 'scale',
        items: [
          { id: 'cad-fis-emi', label: 'Emissores NFe',              path: '/cadastros/emissores',           icon: 'document' },
          { id: 'cad-fis-sin', label: 'Sincronização DFe',          path: '/cadastros/sincronizacao-dfe',   icon: 'refresh' },
          { id: 'cad-fis-nfse', label: 'Sincronização NFS-e',       path: '/cadastros/sincronizacao-nfse',  icon: 'refresh' },
          { id: 'cad-fis-reg', label: 'Regras Fiscais',             path: '/cadastros/regras-fiscais',      icon: 'scale' },
          { id: 'cad-fis-cnt', label: 'Contador',                   path: '/cadastros/contador',            icon: 'calculator' },
          { id: 'cad-fis-nat', label: 'Natureza de Operação',       path: '/cadastros/natureza-operacao',   icon: 'git-branch' },
          { id: 'cad-fis-inf', label: 'Informações Complementares', path: '/cadastros/info-complementares', icon: 'info' },
          { id: 'cad-fis-pla', label: 'Plano de Contas',            path: '/cadastros/plano-contas',        icon: 'list-tree' },
        ],
      },
      {
        id: 'cad-agricolas',
        label: 'Agrícolas',
        icon: 'grain',
        items: [
          { id: 'cad-agr-ope', label: 'Operações',           path: '/cadastros/operacoes',      icon: 'settings-sliders' },
          { id: 'cad-agr-ati', label: 'Atividades',          path: '/cadastros/atividades',     icon: 'clipboard-list' },
          { id: 'cad-agr-cul', label: 'Cultura / Variedade', path: '/cadastros/cultura',        icon: 'sprout' },
          { id: 'cad-agr-cic', label: 'Ciclo de Produção',   path: '/cadastros/ciclo-producao', icon: 'rotate' },
        ],
      },
      {
        id: 'cad-pecuarios',
        label: 'Pecuários',
        icon: 'cattle',
        items: [
          { id: 'cad-pec-par', label: 'Parâmetros / Peso', path: '/cadastros/parametros-peso', icon: 'scale' },
          { id: 'cad-pec-for', label: 'Forragem',          path: '/cadastros/forragem',        icon: 'grain' },
          { id: 'cad-pec-reb', label: 'Rebanho',           path: '/cadastros/rebanho',         icon: 'cattle' },
          { id: 'cad-pec-mod', label: 'Módulo Pastejo',    path: '/cadastros/modulo-pastejo',  icon: 'map' },
          { id: 'cad-pec-coc', label: 'Cochos',            path: '/cadastros/cochos',          icon: 'package-alt' },
          { id: 'cad-pec-lot', label: 'Lotes Animais',     path: '/cadastros/lotes-animais',   icon: 'layers' },
          { id: 'cad-pec-lmo', label: 'Lote / Módulo',     path: '/cadastros/lote-modulo',     icon: 'stock' },
          { id: 'cad-pec-lar', label: 'Lote / Área',       path: '/cadastros/lote-area',       icon: 'location' },
        ],
      },
      {
        id: 'cad-bens',
        label: 'Bens / Ativos',
        icon: 'package',
        items: [
          { id: 'cad-ben-inv', label: 'Inventário',                path: '/cadastros/inventario',            icon: 'clipboard-list' },
          { id: 'cad-ben-dep', label: 'Depreciação Mensal',        path: '/cadastros/depreciacao-mensal',    icon: 'trend-down' },
          { id: 'cad-ben-pre', label: 'Previsão de Depreciação',   path: '/cadastros/previsao-depreciacao',  icon: 'chart-line' },
        ],
      },
      {
        id: 'cad-gerais',
        label: 'Gerais',
        icon: 'filter-advanced',
        items: [
          { id: 'cad-ger-cid', label: 'Cidades',                   path: '/cadastros/cidades',            icon: 'location' },
          { id: 'cad-ger-ser', label: 'Serviços',                  path: '/cadastros/servicos',           icon: 'briefcase' },
          { id: 'cad-ger-est', label: 'Estorno',                   path: '/cadastros/estorno',            icon: 'undo' },
          { id: 'cad-ger-par', label: 'Parametrizações do sistema', path: '/cadastros/parametrizacoes', icon: 'settings' },
        ],
      },
    ],
  },
  {
    id: 'administrativo',
    label: 'Administrativo',
    emoji: '🏢',
    icon: 'building',
    groups: [
      {
        id: 'adm-suprimentos',
        label: 'Suprimentos',
        icon: 'cart',
        items: [
          { id: 'adm-sup-sla', label: 'Parâmetros SLA',         path: '/administrativo/sla',            icon: 'timer' },
          { id: 'adm-sup-meu', label: 'Meus Processos',         path: '/administrativo/meus-processos', icon: 'list-checks' },
          { id: 'adm-sup-sol', label: 'Solicitação',            path: '/administrativo/solicitacao',    icon: 'document-add' },
          { id: 'adm-sup-rej', label: 'Rejeitados / Cancelados', path: '/administrativo/rejeitados',    icon: 'error' },
          { id: 'adm-sup-cot', label: 'Cotações',               path: '/administrativo/cotacoes',       icon: 'document-search' },
          { id: 'adm-sup-aut', label: 'Autorização',            path: '/administrativo/autorizacao',    icon: 'shield-check' },
          { id: 'adm-sup-com', label: 'Compras',                path: '/administrativo/compras',        icon: 'cart' },
          { id: 'adm-sup-rec', label: 'Recebimentos',           path: '/administrativo/recebimentos',   icon: 'package-check' },
        ],
      },
      {
        id: 'adm-estoque',
        label: 'Estoque',
        icon: 'warehouse',
        items: [
          { id: 'adm-est-dfe',  label: 'Doc. Fiscal / Entrada',            path: '/administrativo/doc-fiscal',      icon: 'document-import' },
          { id: 'adm-est-ent',  label: 'Entrada / Insumos',                path: '/administrativo/entrada-insumos', icon: 'arrow-down-circle' },
          { id: 'adm-est-dfe2', label: 'DFe Recebidas',                    path: '/administrativo/dfe-recebidas',   icon: 'inbox' },
          { id: 'adm-est-bai',  label: 'Baixa de Estoque',                 path: '/administrativo/baixa-estoque',   icon: 'package-minus' },
          { id: 'adm-est-req',  label: 'Requisição / Saída',               path: '/administrativo/requisicao',      icon: 'package-open' },
          { id: 'adm-est-dev',  label: 'Devolução / Entrada',              path: '/administrativo/devolucao',       icon: 'undo' },
          { id: 'adm-est-cor',  label: 'Correção de Estoque',              path: '/administrativo/correcao',        icon: 'wrench' },
          { id: 'adm-est-trm',  label: 'Transferência entre Armazéns',     path: '/administrativo/transf-armazens', icon: 'arrow-left-right' },
          { id: 'adm-est-trf',  label: 'Transferência entre Fazendas',     path: '/administrativo/transf-fazendas', icon: 'repeat' },
          { id: 'adm-est-sal',  label: 'Saldo de Estoque',                 path: '/administrativo/saldo-estoque',   icon: 'chart-bar' },
          {
            id: 'adm-est-fab', label: 'Fábrica', path: '/administrativo/fabrica', icon: 'factory',
            children: [
              { id: 'adm-est-fab-for', label: 'Formulação', path: '/administrativo/fabrica/formulacao', icon: 'lab' },
              { id: 'adm-est-fab-bat', label: 'Batida',     path: '/administrativo/fabrica/batida',     icon: 'blend' },
            ],
          },
        ],
      },
      {
        id: 'adm-gestao-pessoal',
        label: 'Gestão Pessoal',
        icon: 'user-check',
        items: [
          { id: 'adm-gp-eve', label: 'Eventos',                path: '/administrativo/eventos',          icon: 'calendar' },
          { id: 'adm-gp-fun', label: 'Funções',                path: '/administrativo/funcoes',          icon: 'briefcase' },
          { id: 'adm-gp-equ', label: 'Equipes',                path: '/administrativo/equipes',          icon: 'users' },
          { id: 'adm-gp-fal', label: 'Registro de Faltas',     path: '/administrativo/faltas',           icon: 'calendar-off' },
          { id: 'adm-gp-adi', label: 'Adiantamento Salarial',  path: '/administrativo/adiantamento',     icon: 'currency' },
          { id: 'adm-gp-reg', label: 'Registro de Eventos',    path: '/administrativo/registro-eventos', icon: 'clipboard-list' },
          { id: 'adm-gp-fxe', label: 'Funcionário x Eventos',  path: '/administrativo/func-eventos',     icon: 'user-settings' },
          { id: 'adm-gp-apu', label: 'Apuração Mensal',        path: '/administrativo/apuracao',         icon: 'calculator' },
        ],
      },
      {
        id: 'adm-gestao-doc',
        label: 'Gestão Documentos',
        icon: 'documents',
        items: [
          { id: 'adm-gd-tip', label: 'Tipo de Documento', path: '/administrativo/tipo-documento', icon: 'document-type' },
          { id: 'adm-gd-doc', label: 'Documentos',        path: '/administrativo/documentos',     icon: 'document' },
        ],
      },
    ],
  },
  {
    id: 'operacional',
    label: 'Operacional',
    emoji: '⚙️',
    icon: 'gauge',
    groups: [
      {
        id: 'ope-agricultura',
        label: 'Agricultura',
        icon: 'grain',
        items: [
          { id: 'ope-agr-pla', label: 'Planejamentos',            path: '/operacional/planejamentos',   icon: 'clipboard-list' },
          { id: 'ope-agr-apo', label: 'Apontamentos',             path: '/operacional/apontamentos',    icon: 'edit-line' },
          { id: 'ope-agr-rom', label: 'Romaneios',                path: '/operacional/romaneios',       icon: 'document' },
          { id: 'ope-agr-mar', label: 'Marcação',                 path: '/operacional/marcacao',        icon: 'tag' },
          { id: 'ope-agr-car', label: 'Carregamento',             path: '/operacional/carregamento',    icon: 'truck' },
          { id: 'ope-agr-ras', label: 'Rastreabilidade',          path: '/operacional/rastreabilidade', icon: 'route' },
          { id: 'ope-agr-des', label: 'Descontos / Classificação', path: '/operacional/descontos',      icon: 'percent' },
          { id: 'ope-agr-pes', label: 'Pesagem Rodoviária',       path: '/operacional/pesagem',         icon: 'scale' },
          { id: 'ope-agr-con', label: 'Contratos de Venda',       path: '/operacional/contratos-venda', icon: 'signature' },
          { id: 'ope-agr-col', label: 'Colheita de Frutas',       path: '/operacional/colheita-frutas', icon: 'sprout' },
        ],
      },
      {
        id: 'ope-pecuaria',
        label: 'Pecuária',
        icon: 'cattle',
        items: [
          { id: 'ope-pec-ges', label: 'Gestão Animais',          path: '/operacional/gestao-animais',        icon: 'cattle' },
          { id: 'ope-pec-inv', label: 'Inventariado',            path: '/operacional/inventariado',          icon: 'clipboard-check' },
          { id: 'ope-pec-pla', label: 'Planejamento Pecuário',   path: '/operacional/planejamento-pecuario', icon: 'clipboard-list' },
          { id: 'ope-pec-map', label: 'Mapa de Confinamento',    path: '/operacional/mapa-confinamento',    icon: 'map' },
          { id: 'ope-pec-tra', label: 'Transferências',          path: '/operacional/transferencias',        icon: 'arrow-left-right' },
          { id: 'ope-pec-mov', label: 'Movimentações',           path: '/operacional/movimentacoes',         icon: 'repeat' },
          { id: 'ope-pec-man', label: 'Manejo',                  path: '/operacional/manejo',                icon: 'settings-sliders' },
          { id: 'ope-pec-rep', label: 'Reprodução',              path: '/operacional/reproducao',            icon: 'heart' },
          {
            id: 'ope-pec-cfc', label: 'Confinamento — Cadastros', path: '/operacional/confinamento/cadastros', icon: 'warehouse',
            children: [
              { id: 'ope-pec-cfc-pat', label: 'Pátios',  path: '/operacional/confinamento/patios',  icon: 'stock' },
              { id: 'ope-pec-cfc-set', label: 'Setores', path: '/operacional/confinamento/setores', icon: 'layers' },
              { id: 'ope-pec-cfc-cur', label: 'Currais', path: '/operacional/confinamento/currais', icon: 'fence' },
            ],
          },
          {
            id: 'ope-pec-cfn', label: 'Confinamento — Nutrição', path: '/operacional/confinamento/nutricao', icon: 'grain',
            children: [
              { id: 'ope-pec-cfn-die', label: 'Dieta',            path: '/operacional/confinamento/dieta',        icon: 'nutrition' },
              { id: 'ope-pec-cfn-fas', label: 'Fases / Regras Troca', path: '/operacional/confinamento/fases-troca', icon: 'repeat' },
              { id: 'ope-pec-cfn-bat', label: 'Batelada',         path: '/operacional/confinamento/batelada',     icon: 'blend' },
              { id: 'ope-pec-cfn-tra', label: 'Trato Diário',     path: '/operacional/confinamento/trato-diario', icon: 'clipboard-list' },
              { id: 'ope-pec-cfn-coc', label: 'Leitura de Cocho', path: '/operacional/confinamento/leitura-cocho', icon: 'package-alt' },
            ],
          },
        ],
      },
      {
        id: 'ope-pluviometria',
        label: 'Pluviometria',
        icon: 'rain',
        items: [
          { id: 'ope-plu', label: 'Pluviometria', path: '/operacional/pluviometria', icon: 'rain' },
        ],
      },
      {
        id: 'ope-vendas',
        label: 'Vendas',
        icon: 'shopping-bag',
        items: [
          { id: 'ope-ven-orc', label: 'Orçamentos', path: '/operacional/orcamentos', icon: 'calculator' },
          { id: 'ope-ven-ped', label: 'Pedidos',    path: '/operacional/pedidos',    icon: 'clipboard-list' },
          { id: 'ope-ven-ven', label: 'Vendas',     path: '/operacional/vendas',     icon: 'shopping-bag' },
        ],
      },
      {
        id: 'ope-ordens',
        label: 'Ordens de Serviço',
        icon: 'clipboard-check',
        items: [
          { id: 'ope-os-min', label: 'Minhas OS',      path: '/operacional/minhas-os',     icon: 'clipboard-check' },
          { id: 'ope-os-lis', label: 'Lista de OS',    path: '/operacional/lista-os',      icon: 'list-checks' },
          { id: 'ope-os-mon', label: 'Monitoramento',  path: '/operacional/monitoramento', icon: 'activity' },
          { id: 'ope-os-ava', label: 'Avaliações',     path: '/operacional/avaliacoes',    icon: 'star' },
        ],
      },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    emoji: '💰',
    icon: 'wallet',
    groups: [
      {
        id: 'fin-principal',
        label: 'Financeiro',
        icon: 'wallet',
        items: [
          { id: 'fin-pag', label: 'Contas a Pagar',              path: '/financeiro/pagar',        icon: 'arrow-up-circle' },
          { id: 'fin-bai', label: 'Baixa de Títulos',             path: '/financeiro/baixa-titulos', icon: 'document-check' },
          { id: 'fin-rec', label: 'Contas a Receber',            path: '/financeiro/receber',       icon: 'arrow-down-circle' },
          { id: 'fin-cai', label: 'Mov. Caixa / Bancário',       path: '/financeiro/caixa',         icon: 'wallet' },
          { id: 'fin-flu', label: 'Fluxo Bancário',              path: '/financeiro/fluxo',         icon: 'bank' },
          { id: 'fin-con', label: 'Gestão de Contratos',         path: '/financeiro/contratos',     icon: 'signature' },
          { id: 'fin-pre', label: 'Prev. Orçamentária',          path: '/financeiro/previsao',      icon: 'chart-line' },
          { id: 'fin-cng', label: 'Congelamentos Financeiros',   path: '/financeiro/congelamentos', icon: 'lock' },
          { id: 'fin-imp', label: 'Importação Mov. Bancários',   path: '/financeiro/importacao',    icon: 'upload' },
        ],
      },
      {
        id: 'fin-conciliacao',
        label: 'Conciliação',
        icon: 'git-merge',
        items: [
          { id: 'fin-cnc-ofx', label: 'Importação OFX',      path: '/financeiro/ofx',                icon: 'upload' },
          { id: 'fin-cnc-mes', label: 'Meses Conciliados',   path: '/financeiro/meses-conciliados',  icon: 'calendar-check' },
        ],
      },
    ],
  },
  {
    id: 'frota',
    label: 'Gestão de Frota',
    emoji: '🚜',
    icon: 'truck',
    flatItems: [
      { id: 'fro-man', label: 'Manutenções',               path: '/frota/manutencoes',    icon: 'wrench' },
      { id: 'fro-aba', label: 'Abastecimentos',            path: '/frota/abastecimentos', icon: 'fuel' },
      { id: 'fro-pre', label: 'Manutenções Preventivas',   path: '/frota/preventivas',    icon: 'shield-check' },
      { id: 'fro-rev', label: 'Revisões Agendadas',        path: '/frota/revisoes',       icon: 'calendar-clock' },
      { id: 'fro-tra', label: 'Transferência de Máquinas', path: '/frota/transferencias', icon: 'arrow-left-right' },
    ],
  },
  {
    id: 'fiscal',
    label: 'Gestão Fiscal',
    emoji: '📄',
    icon: 'receipt',
    groups: [
      {
        id: 'fis-nfe',
        label: 'NF-e',
        icon: 'document',
        items: [
          { id: 'fis-nfe-emi', label: 'NFe Emitidas',   path: '/fiscal/nfe-emitidas', icon: 'document-check' },
          { id: 'fis-nfe-xml', label: 'Arquivos XML',   path: '/fiscal/xml',         icon: 'document-code' },
          { id: 'fis-nfe-dfe', label: 'DFe Recebidas',  path: '/fiscal/dfe',         icon: 'inbox' },
        ],
      },
      {
        id: 'fis-cte',
        label: 'CT-e',
        icon: 'truck',
        items: [
          { id: 'fis-cte-lis', label: 'Lista de CTe',     path: '/fiscal/cte-lista',      icon: 'list-checks' },
          { id: 'fis-cte-nov', label: 'Nova CTe',         path: '/fiscal/cte-nova',       icon: 'document-add' },
          { id: 'fis-cte-man', label: 'Manifestar CTe',   path: '/fiscal/cte-manifestar', icon: 'signature' },
        ],
      },
      {
        id: 'fis-mdfe',
        label: 'MDF-e',
        icon: 'documents',
        items: [
          { id: 'fis-mdf-lis', label: 'Lista de MDFe', path: '/fiscal/mdfe-lista', icon: 'list-checks' },
          { id: 'fis-mdf-nov', label: 'Nova MDFe',      path: '/fiscal/mdfe-nova', icon: 'document-add' },
        ],
      },
      {
        id: 'fis-outros',
        label: 'Outros',
        icon: 'more-horizontal',
        items: [
          { id: 'fis-nfse', label: 'NFSe Recebidas',              path: '/fiscal/nfse',            icon: 'inbox' },
          { id: 'fis-lcd', label: 'LCDPR — Livro Caixa Digital', path: '/fiscal/lcdpr',           icon: 'book' },
          { id: 'fis-par', label: 'Partida Dobrada',             path: '/fiscal/partida-dobrada', icon: 'git-compare' },
        ],
      },
    ],
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    emoji: '📋',
    icon: 'chart-column',
    flatItems: [
      { id: 'rel-ben', label: 'Bens / Ativo',      path: '/relatorios/bens',            icon: 'package' },
      { id: 'rel-agr', label: 'Agricultura',       path: '/relatorios/agricultura',     icon: 'grain' },
      { id: 'rel-pec', label: 'Pecuária',          path: '/relatorios/pecuaria',        icon: 'cattle' },
      { id: 'rel-plu', label: 'Pluviometria',      path: '/relatorios/pluviometria',    icon: 'rain' },
      { id: 'rel-fin', label: 'Financeiro',        path: '/relatorios/financeiro',      icon: 'wallet' },
      { id: 'rel-dre', label: 'DRE Anual',         path: '/relatorios/dre-anual',       icon: 'wallet' },
      { id: 'rel-est', label: 'Estoque',           path: '/relatorios/estoque',         icon: 'warehouse' },
      { id: 'rel-sup', label: 'Suprimentos',       path: '/relatorios/suprimentos',     icon: 'cart' },
      { id: 'rel-ven', label: 'Vendas',            path: '/relatorios/vendas',          icon: 'shopping-bag' },
      { id: 'rel-gpe', label: 'Gestão Pessoal',    path: '/relatorios/gestao-pessoal',  icon: 'users' },
      { id: 'rel-gfi', label: 'Gestão Fiscal',     path: '/relatorios/gestao-fiscal',   icon: 'scale' },
      { id: 'rel-gfr', label: 'Gestão de Frotas',  path: '/relatorios/frotas',          icon: 'truck' },
    ],
  },
  {
    id: 'integracoes',
    label: 'Integrações',
    emoji: '🔗',
    icon: 'network',
    groups: [
      {
        id: 'int-dominio',
        label: 'Software Domínio',
        icon: 'globe',
        items: [
          { id: 'int-dom-soft', label: 'Software Domínio', path: '/integracoes/dominio', icon: 'globe' },
        ],
      },
      {
        id: 'int-cta',
        label: 'CTA Smart',
        icon: 'fuel',
        items: [
          { id: 'int-cta-cfg', label: 'Configuração',   path: '/integracoes/cta-smart',                icon: 'settings-sliders' },
          { id: 'int-cta-aba', label: 'Abastecimentos', path: '/integracoes/cta-smart-abastecimentos', icon: 'fuel' },
        ],
      },
      {
        id: 'int-exp-dom',
        label: 'Exportação / Domínio',
        icon: 'upload',
        items: [
          { id: 'int-exp-bco',  label: 'Mov. Bancário',           path: '/integracoes/exp-bancario', icon: 'bank' },
          { id: 'int-exp-fol',  label: 'Folha Salarial',          path: '/integracoes/exp-folha',    icon: 'banknote' },
          { id: 'int-exp-cp',   label: 'Contas Pagar / Receber',  path: '/integracoes/exp-cp',       icon: 'credit-card' },
          { id: 'int-exp-nfse', label: 'NFSe',                    path: '/integracoes/exp-nfse',     icon: 'document' },
        ],
      },
      {
        id: 'int-compartilhamento',
        label: 'Compartilhamento',
        icon: 'share',
        items: [
          { id: 'int-sha', label: 'Compartilhamento', path: '/integracoes/compartilhamento', icon: 'share' },
        ],
      },
      {
        id: 'int-exp-csv',
        label: 'Exportações / CSV',
        icon: 'table',
        items: [
          { id: 'int-csv', label: 'Exportação CSV', path: '/integracoes/csv', icon: 'table' },
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
