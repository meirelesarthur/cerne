export type PlanoId = 'essencial' | 'profissional' | 'enterprise'

export interface FeatureItem {
  label: string
  tooltip?: string
}

export interface Plano {
  id: PlanoId
  nome: string
  subtitulo: string
  destaque?: string
  popular?: boolean
  precoUsuarioMesAnual: number | null
  precoUsuarioMesMensal: number | null
  economiaPercentual: number
  limiteUsuarios: number | null
  trialDias: number
  features: FeatureItem[]
}

export interface AddOn {
  id: string
  nome: string
  descricao: string
  precoUsuarioMesAnual: number
  disponivelEm: PlanoId[]
}

export interface LinhaComparacao {
  feature: string
  tooltip?: string
  essencial: boolean | string
  profissional: boolean | string
  enterprise: boolean | string
}

export interface CategoriaComparacao {
  id: string
  titulo: string
  linhas: LinhaComparacao[]
}

export const planos: Plano[] = [
  {
    id: 'essencial',
    nome: 'Essencial',
    subtitulo: 'Para produtores que estão digitalizando a fazenda',
    precoUsuarioMesAnual: 49,
    precoUsuarioMesMensal: 59,
    economiaPercentual: 17,
    limiteUsuarios: 300,
    trialDias: 30,
    features: [
      { label: 'Fazendas ilimitadas' },
      { label: 'Cadastros base completos' },
      { label: 'Gestão de safras e produtos' },
      { label: 'Dashboards essenciais' },
      { label: 'Controle de estoque inicial' },
      { label: 'Suporte por e-mail' },
    ],
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    subtitulo: 'Para operações que precisam de gestão integrada e análise avançada',
    destaque: 'Mais popular',
    popular: true,
    precoUsuarioMesAnual: 99,
    precoUsuarioMesMensal: 119,
    economiaPercentual: 17,
    limiteUsuarios: 300,
    trialDias: 30,
    features: [
      { label: 'Tudo do Essencial' },
      { label: 'Módulos operacionais completos' },
      { label: 'Dashboards analíticos avançados' },
      { label: 'Emissão NF-e, CT-e e MDF-e' },
      { label: 'Gestão financeira e fluxo de caixa' },
      { label: 'Relatórios e exportações' },
      { label: 'Suporte prioritário' },
    ],
  },
  {
    id: 'enterprise',
    nome: 'Enterprise',
    subtitulo: 'Para grupos agrícolas com múltiplas operações e integrações sob medida',
    precoUsuarioMesAnual: null,
    precoUsuarioMesMensal: null,
    economiaPercentual: 0,
    limiteUsuarios: null,
    trialDias: 0,
    features: [
      { label: 'Usuários ilimitados' },
      { label: 'Todos os módulos inclusos' },
      { label: 'Integrações e API sob medida' },
      { label: 'SLA dedicado e gestor de conta' },
      { label: 'Onboarding e treinamento in-loco' },
      { label: 'Ambiente e segurança dedicados' },
      { label: 'Suporte 24/7' },
    ],
  },
]

export const addOns: AddOn[] = [
  {
    id: 'pecuaria',
    nome: 'Pecuária de Corte',
    descricao: 'Manejo de lotes, reprodução, histórico sanitário e rastreabilidade animal',
    precoUsuarioMesAnual: 19,
    disponivelEm: ['essencial', 'profissional'],
  },
  {
    id: 'frota',
    nome: 'Gestão de Frota',
    descricao: 'Manutenções, abastecimentos, preventivas e rastreamento de equipamentos',
    precoUsuarioMesAnual: 14,
    disponivelEm: ['essencial', 'profissional'],
  },
  {
    id: 'fiscal',
    nome: 'Fiscal NF-e Completo',
    descricao: 'NF-e, CT-e, MDF-e e DFe com LCDPR e exportação contábil',
    precoUsuarioMesAnual: 22,
    disponivelEm: ['essencial'],
  },
  {
    id: 'dominio',
    nome: 'Integração Domínio',
    descricao: 'Exportação automática para Software Domínio (contabilidade)',
    precoUsuarioMesAnual: 9,
    disponivelEm: ['essencial', 'profissional'],
  },
  {
    id: 'bi',
    nome: 'Relatórios e BI',
    descricao: 'Dashboards personalizados, análises avançadas e exportação gerencial',
    precoUsuarioMesAnual: 11,
    disponivelEm: ['essencial'],
  },
]

export const tabelaComparativa: CategoriaComparacao[] = [
  {
    id: 'cadastros',
    titulo: 'Cadastros e Estrutura',
    linhas: [
      { feature: 'Fazendas ilimitadas', essencial: true, profissional: true, enterprise: true },
      { feature: 'Safras e centros de custo', essencial: true, profissional: true, enterprise: true },
      { feature: 'Produtos, embalagens e armazéns', essencial: true, profissional: true, enterprise: true },
      { feature: 'Cadastro de pessoas e fornecedores', essencial: true, profissional: true, enterprise: true },
      { feature: 'Bens e ativos fixos', essencial: false, profissional: true, enterprise: true },
    ],
  },
  {
    id: 'operacional',
    titulo: 'Operacional e Agricultura',
    linhas: [
      { feature: 'Planejamento agrícola', essencial: true, profissional: true, enterprise: true },
      { feature: 'Apontamentos e romaneios', essencial: false, profissional: true, enterprise: true },
      { feature: 'Rastreabilidade de lote', essencial: false, profissional: true, enterprise: true },
      { feature: 'Pluviometria', essencial: true, profissional: true, enterprise: true },
      { feature: 'Suprimentos e compras', essencial: false, profissional: true, enterprise: true },
    ],
  },
  {
    id: 'pecuaria',
    titulo: 'Pecuária',
    linhas: [
      { feature: 'Manejo de lotes', essencial: 'Add-on', profissional: 'Add-on', enterprise: true },
      { feature: 'Histórico sanitário', essencial: 'Add-on', profissional: 'Add-on', enterprise: true },
      { feature: 'Reprodução e genealogia', essencial: 'Add-on', profissional: 'Add-on', enterprise: true },
    ],
  },
  {
    id: 'financeiro',
    titulo: 'Financeiro e Fiscal',
    linhas: [
      { feature: 'Contas a pagar e receber', essencial: false, profissional: true, enterprise: true },
      { feature: 'Fluxo de caixa', essencial: false, profissional: true, enterprise: true },
      { feature: 'Conciliação OFX', essencial: false, profissional: true, enterprise: true },
      { feature: 'Emissão NF-e', essencial: 'Add-on', profissional: true, enterprise: true },
      { feature: 'CT-e e MDF-e', essencial: false, profissional: true, enterprise: true },
      { feature: 'LCDPR', essencial: false, profissional: true, enterprise: true },
    ],
  },
  {
    id: 'frota',
    titulo: 'Frota e Manutenção',
    linhas: [
      { feature: 'Controle de abastecimentos', essencial: 'Add-on', profissional: 'Add-on', enterprise: true },
      { feature: 'Manutenções preventivas', essencial: 'Add-on', profissional: 'Add-on', enterprise: true },
      { feature: 'Revisões e transferências', essencial: 'Add-on', profissional: 'Add-on', enterprise: true },
    ],
  },
  {
    id: 'relatorios',
    titulo: 'Relatórios e Dashboards',
    linhas: [
      { feature: 'Dashboards essenciais', essencial: true, profissional: true, enterprise: true },
      { feature: 'Dashboards analíticos avançados', essencial: false, profissional: true, enterprise: true },
      { feature: 'BI e dashboards personalizados', essencial: 'Add-on', profissional: 'Add-on', enterprise: true },
      { feature: 'Exportação de relatórios (PDF/Excel)', essencial: false, profissional: true, enterprise: true },
    ],
  },
  {
    id: 'integracoes',
    titulo: 'Integrações',
    linhas: [
      { feature: 'Exportação bancária (OFX)', essencial: false, profissional: true, enterprise: true },
      { feature: 'Software Domínio (contabilidade)', essencial: 'Add-on', profissional: 'Add-on', enterprise: true },
      { feature: 'API dedicada', essencial: false, profissional: false, enterprise: true },
      { feature: 'Integrações sob medida', essencial: false, profissional: false, enterprise: true },
    ],
  },
  {
    id: 'suporte',
    titulo: 'Suporte e SLA',
    linhas: [
      { feature: 'Suporte por e-mail', essencial: true, profissional: true, enterprise: true },
      { feature: 'Suporte prioritário', essencial: false, profissional: true, enterprise: true },
      { feature: 'SLA e gestor de conta dedicado', essencial: false, profissional: false, enterprise: true },
      { feature: 'Onboarding e treinamento', essencial: false, profissional: false, enterprise: true },
      { feature: 'Suporte 24/7', essencial: false, profissional: false, enterprise: true },
    ],
  },
]

export const formatBRL = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
