export interface FazendaRow {
  id: string
  nome: string
  cpfCnpj: string
  cidade: string
  uf: string
  tipoExploracao: string
  areaTotal: number
  ativo: boolean
  /** Áreas internas da fazenda — 2º nível de listagem, exibido ao expandir a linha. */
  areas?: FazendaRow[]
  /** `true` para linhas de área (filhas) — reduz colunas e ações exibidas na tabela. */
  isArea?: boolean
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

/** Converte os dados de detalhe em dados de formulário — usado no modo edição. */
export function detalheToForm(det: FazendaDetalheData): FazendaFormData {
  return {
    nome: det.nome,
    cpfCnpj: det.cpfCnpj,
    inscricaoEstadual: det.inscricaoEstadual,
    telefone: det.telefone,
    tipoExploracao: det.tipoExploracao,
    car: det.car,
    nirf: det.nirf,
    ccir: det.ccir,
    cafir: det.cafir,
    caepi: det.caepi,
    perimetroGeoJSON: det.perimetroGeoJSON ?? '',
    kmlFileName: '',
    pais: det.pais,
    cep: det.cep,
    cidade: det.cidade,
    endereco: det.endereco,
    numero: det.numero,
    bairro: det.bairro,
    latitude: det.latitude,
    longitude: det.longitude,
    moeda: det.moeda,
    areaTotal: det.areaTotal ? String(det.areaTotal) : '',
    valorHa: det.valorHa ? String(det.valorHa) : '',
    taxaRemuneracao: det.taxaRemuneracao ? String(det.taxaRemuneracao) : '',
    ativo: det.ativo,
    usoLivroCaixa: det.usoLivroCaixa,
    observacao: det.observacao,
    centrosCusto: det.centrosCusto.map((cc) => cc.id),
  }
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
