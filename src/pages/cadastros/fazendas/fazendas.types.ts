export interface FazendaRow {
  id: string
  nome: string
  cpfCnpj: string
  cidade: string
  uf: string
  tipoExploracao: string
  areaTotal: number
  ativo: boolean
}

export interface FazendaFormData {
  // Step 1
  nome: string
  cpfCnpj: string
  inscricaoEstadual: string
  telefone: string
  // Step 2
  tipoExploracao: string
  car: string
  nirf: string
  ccir: string
  cafir: string
  caepi: string
  // Step 3 – Demarcação
  perimetroGeoJSON: string
  kmlFileName: string
  // Step 4 – Endereço
  pais: string
  cep: string
  cidade: string
  endereco: string
  numero: string
  bairro: string
  latitude: string
  longitude: string
  // Step 4
  moeda: string
  areaTotal: string
  valorHa: string
  taxaRemuneracao: string
  ativo: boolean
  usoLivroCaixa: boolean
  // Step 5
  observacao: string
  centrosCusto: string[]
}

export interface FazendaDetalheData {
  id: string
  // Identificação
  nome: string
  cpfCnpj: string
  inscricaoEstadual: string
  telefone: string
  // Documentação
  tipoExploracao: string
  car: string
  nirf: string
  ccir: string
  cafir: string
  caepi: string
  // Localização
  pais: string
  cep: string
  cidade: string
  uf: string
  endereco: string
  numero: string
  bairro: string
  latitude: string
  longitude: string
  perimetroGeoJSON?: string
  // Financeiro
  moeda: string
  areaTotal: number
  valorHa: number
  taxaRemuneracao: number
  ativo: boolean
  usoLivroCaixa: boolean
  // Centros de Custo
  centrosCusto: Array<{
    id: string
    codigo: string
    classe: string
    condicao: string
    descricao: string
  }>
  observacao: string
}

export const emptyFazendaForm: FazendaFormData = {
  nome: '',
  cpfCnpj: '',
  inscricaoEstadual: '',
  telefone: '',
  tipoExploracao: '',
  car: '',
  nirf: '',
  ccir: '',
  cafir: '',
  caepi: '',
  perimetroGeoJSON: '',
  kmlFileName: '',
  pais: 'Brasil',
  cep: '',
  cidade: '',
  endereco: '',
  numero: '',
  bairro: '',
  latitude: '',
  longitude: '',
  moeda: 'BRL',
  areaTotal: '',
  valorHa: '',
  taxaRemuneracao: '',
  ativo: true,
  usoLivroCaixa: true,
  observacao: '',
  centrosCusto: [],
}
