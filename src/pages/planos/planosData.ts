// Dados (mock) dos planos de contratação do GB Agritech (AGRO365).
// Separado da view para manter a página declarativa. Quando houver backend,
// basta substituir `planos` por dados vindos da API mantendo os tipos.

export interface AddOn {
  id: string
  nome: string
  descricao: string
  precoMensal: number
}

export interface Plano {
  id: 'basico' | 'premium' | 'enterprise'
  nome: string
  subtitulo: string
  /** Selo de destaque exibido no topo do card (ex.: 'Mais popular') */
  destaque?: string
  /** Coluna em destaque (borda brand + elevação) */
  popular?: boolean
  /** Preço base mensal em BRL. `null` = sob consulta (Enterprise) */
  precoMensal: number | null
  features: string[]
  addOns: AddOn[]
}

export const planos: Plano[] = [
  {
    id: 'basico',
    nome: 'Básico',
    subtitulo: 'Para produtores começando a digitalizar a fazenda',
    precoMensal: 249,
    features: [
      'Até 2 fazendas',
      'Até 5 usuários',
      'Cadastros base completos',
      'Dashboards essenciais',
      'Suporte por e-mail',
    ],
    addOns: [
      { id: 'b-usuarios', nome: 'Pacote +5 usuários', descricao: 'Amplia o limite de acessos', precoMensal: 79 },
      { id: 'b-fiscal', nome: 'Módulo Fiscal (NF-e)', descricao: 'Emissão de NF-e e DFe', precoMensal: 129 },
      { id: 'b-relatorios', nome: 'Relatórios avançados', descricao: 'Exportação e relatórios gerenciais', precoMensal: 59 },
    ],
  },
  {
    id: 'premium',
    nome: 'Premium',
    subtitulo: 'Para operações que precisam de gestão integrada',
    destaque: 'Mais popular',
    popular: true,
    precoMensal: 599,
    features: [
      'Até 10 fazendas',
      'Até 25 usuários',
      'Todos os módulos operacionais',
      'Dashboards analíticos completos',
      'Módulo Fiscal (NF-e, CT-e, MDF-e)',
      'Suporte prioritário',
    ],
    addOns: [
      { id: 'p-pecuaria', nome: 'Módulo Pecuária de Corte', descricao: 'Manejo, lotes e reprodução', precoMensal: 149 },
      { id: 'p-frota', nome: 'Gestão de Frota', descricao: 'Manutenções e abastecimentos', precoMensal: 119 },
      { id: 'p-dominio', nome: 'Integração Software Domínio', descricao: 'Exportação contábil automática', precoMensal: 99 },
    ],
  },
  {
    id: 'enterprise',
    nome: 'Enterprise',
    subtitulo: 'Para grupos agrícolas com múltiplas operações',
    precoMensal: null,
    features: [
      'Fazendas e usuários ilimitados',
      'Todos os módulos inclusos',
      'Integrações sob medida',
      'SLA dedicado e gestor de conta',
      'Onboarding e treinamento',
      'Ambiente e segurança dedicados',
    ],
    addOns: [
      { id: 'e-api', nome: 'API dedicada', descricao: 'Acesso programático completo', precoMensal: 0 },
      { id: 'e-bi', nome: 'BI personalizado', descricao: 'Dashboards sob demanda', precoMensal: 0 },
      { id: 'e-suporte', nome: 'Suporte 24/7', descricao: 'Atendimento ininterrupto', precoMensal: 0 },
    ],
  },
]

export const formatBRL = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
