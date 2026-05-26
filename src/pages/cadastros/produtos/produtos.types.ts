export type TipoProduto = 'insumo' | 'producao' | 'subproduto' | 'servico'
export type UnidadeProduto = 'kg' | 't' | 'sc' | 'L' | 'un' | 'ha' | 'h' | 'm3' | 'pc' | 'cx'

export const TIPO_PRODUTO_LABEL: Record<TipoProduto, string> = {
  insumo:     'Insumo',
  producao:   'Produção',
  subproduto: 'Subproduto',
  servico:    'Serviço',
}

export const TIPO_PRODUTO_OPTS: { value: TipoProduto; label: string }[] = [
  { value: 'insumo',     label: 'Insumo' },
  { value: 'producao',   label: 'Produção' },
  { value: 'subproduto', label: 'Subproduto' },
  { value: 'servico',    label: 'Serviço' },
]

export const UNIDADE_PRODUTO_OPTS: { value: UnidadeProduto; label: string }[] = [
  { value: 'kg',  label: 'kg — Quilograma' },
  { value: 't',   label: 't — Tonelada' },
  { value: 'sc',  label: 'sc — Saca' },
  { value: 'L',   label: 'L — Litro' },
  { value: 'un',  label: 'un — Unidade' },
  { value: 'ha',  label: 'ha — Hectare' },
  { value: 'h',   label: 'h — Hora' },
  { value: 'm3',  label: 'm³ — Metro cúbico' },
  { value: 'pc',  label: 'pc — Peça' },
  { value: 'cx',  label: 'cx — Caixa' },
]

// ─── Hierarquia de classificação ─────────────────────────────────────────────

export interface GrupoProduto      { id: number; nome: string }
export interface CategoriaProduto  { id: number; nome: string; grupoId: number }
export interface ClasseProduto     { id: number; nome: string; categoriaId: number }
export interface VariedadeProduto  { id: number; nome: string; classeId: number }

export const GRUPOS: GrupoProduto[] = [
  { id: 1, nome: 'Insumos Gerais' },
  { id: 2, nome: 'Defensivos' },
  { id: 3, nome: 'Fertilizantes' },
  { id: 4, nome: 'Combustíveis e Lubrificantes' },
  { id: 5, nome: 'Peças e Manutenção' },
  { id: 6, nome: 'Sementes' },
]

export const CATEGORIAS: CategoriaProduto[] = [
  { id: 1, nome: 'Diversos',             grupoId: 1 },
  { id: 2, nome: 'Maquinário e Equip.',  grupoId: 1 },
  { id: 3, nome: 'Filtros e Vedações',   grupoId: 1 },
  { id: 4, nome: 'Fungicidas',           grupoId: 2 },
  { id: 5, nome: 'Herbicidas',           grupoId: 2 },
  { id: 6, nome: 'Inseticidas',          grupoId: 2 },
  { id: 7, nome: 'Adubos e Corretivos',  grupoId: 3 },
  { id: 8, nome: 'Fertilizantes Foliares', grupoId: 3 },
  { id: 9, nome: 'Óleo Diesel',          grupoId: 4 },
  { id: 10, nome: 'Lubrificantes',       grupoId: 4 },
  { id: 11, nome: 'Peças de Reposição',  grupoId: 5 },
  { id: 12, nome: 'Ferramentas',         grupoId: 5 },
  { id: 13, nome: 'Soja',               grupoId: 6 },
  { id: 14, nome: 'Milho',              grupoId: 6 },
]

export const CLASSES: ClasseProduto[] = [
  { id: 1, nome: 'Outros',       categoriaId: 1 },
  { id: 2, nome: 'Filtros',      categoriaId: 3 },
  { id: 3, nome: 'Vedações',     categoriaId: 3 },
  { id: 4, nome: 'Fungicida SC', categoriaId: 4 },
  { id: 5, nome: 'Fungicida EC', categoriaId: 4 },
  { id: 6, nome: 'Pós-emergência', categoriaId: 5 },
  { id: 7, nome: 'Pré-emergência', categoriaId: 5 },
  { id: 8, nome: 'Adubo Base',   categoriaId: 7 },
  { id: 9, nome: 'Adubo Cobertura', categoriaId: 7 },
  { id: 10, nome: 'S-10',        categoriaId: 9 },
  { id: 11, nome: 'Óleo Motor',  categoriaId: 10 },
  { id: 12, nome: 'Transmissão', categoriaId: 10 },
  { id: 13, nome: 'Peças Gerais', categoriaId: 11 },
  { id: 14, nome: 'Convencional', categoriaId: 13 },
  { id: 15, nome: 'Transgênica', categoriaId: 13 },
]

export const VARIEDADES: VariedadeProduto[] = [
  { id: 1, nome: 'BMX Potência', classeId: 14 },
  { id: 2, nome: 'TMG 7062',     classeId: 14 },
  { id: 3, nome: 'Intacta RR2',  classeId: 15 },
  { id: 4, nome: 'ROUNDUP READY', classeId: 15 },
]

// ─── NCM (amostra) ────────────────────────────────────────────────────────────

export interface NCMOption { value: string; label: string }

export const NCM_OPTS: NCMOption[] = [
  { value: '01012900', label: '01012900 — Outros equídeos, vivos' },
  { value: '31010000', label: '31010000 — Adubos, fertilizantes de origem animal' },
  { value: '31021000', label: '31021000 — Ureia' },
  { value: '31042000', label: '31042000 — Cloreto de potássio' },
  { value: '31051000', label: '31051000 — Adubo NPK' },
  { value: '38089390', label: '38089390 — Herbicidas' },
  { value: '38081900', label: '38081900 — Inseticidas' },
  { value: '38082000', label: '38082000 — Fungicidas' },
  { value: '27101259', label: '27101259 — Óleo Diesel' },
  { value: '27101921', label: '27101921 — Óleos Lubrificantes' },
  { value: '84314900', label: '84314900 — Peças para máquinas' },
  { value: '84212300', label: '84212300 — Elementos filtrantes' },
  { value: '12010090', label: '12010090 — Soja, outros' },
  { value: '10059010', label: '10059010 — Milho em grão' },
]

// ─── Cat. Financeira (amostra) ────────────────────────────────────────────────

export interface CatFinanceiraOption { value: string; label: string }

export const CAT_FINANCEIRA_OPTS: CatFinanceiraOption[] = [
  { value: '1', label: 'Insumos Agrícolas' },
  { value: '2', label: 'Manutenção de Máquinas' },
  { value: '3', label: 'Combustíveis' },
  { value: '4', label: 'Defensivos Agrícolas' },
  { value: '5', label: 'Fertilizantes e Corretivos' },
  { value: '6', label: 'Sementes' },
  { value: '7', label: 'Peças de Reposição' },
]

// ─── Tipo de Produto ──────────────────────────────────────────────────────────

export interface Produto {
  id:               number
  codigo:           string
  descricao:        string
  ncm:              string
  unidadePrimaria:  UnidadeProduto
  unidadeSecundaria?: UnidadeProduto | ''
  fatorConversao?:  number | ''
  grupoId:          number | ''
  categoriaId:      number | ''
  classeId:         number | ''
  variedadeId:      number | ''
  controlaEstoque:  boolean
  estoqueMinimo:    number | ''
  controlaLote:     boolean
  controlaQualidade: boolean
  precoMedio:       number
  valorReferencia:  number | ''
  catFinanceiraId:  string
  tipo:             TipoProduto
  ativo:            boolean
  apontamento:      boolean
  principioAtivo:   string
  adicionaInventario: boolean
  emitirNFe:        boolean
  dtUltCompra:      string
}
