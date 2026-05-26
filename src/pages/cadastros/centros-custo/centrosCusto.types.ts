// ─── Tipos base ───────────────────────────────────────────────────────────────

export type ClasseCC    = 'sintetica' | 'analitica'
export type CondicaoCC  = 'ambos' | 'receita' | 'despesa'
export type TipoCC      = 'produtivo' | 'improdutivo' | 'administrativo'

export interface CentroCusto {
  id:           number
  codigo:       string
  condicao:     CondicaoCC
  descricao:    string
  ativo:        'sim' | 'nao'
  apontamento:  'sim' | 'nao'
  tipo:         TipoCC
  antecessorId: number | null
  categorias:   string[]
}

// ─── Derivados ────────────────────────────────────────────────────────────────

export function classeOf(antecessorId: number | null): ClasseCC {
  return antecessorId === null ? 'sintetica' : 'analitica'
}

export function gerarCodigo(antecessorId: number | null, all: CentroCusto[]): string {
  if (antecessorId === null) {
    const roots = all.filter(c => c.antecessorId === null)
    if (roots.length === 0) return '1.01'
    const nums = roots.map(c => parseInt(c.codigo.split('.')[1] ?? '0', 10))
    return `1.${String(Math.max(...nums) + 1).padStart(2, '0')}`
  }
  const parent = all.find(c => c.id === antecessorId)
  if (!parent) return '1.01.001'
  const children = all.filter(c => c.antecessorId === antecessorId)
  if (children.length === 0) return `${parent.codigo}.001`
  const lastNums = children.map(c => {
    const parts = c.codigo.split('.')
    return parseInt(parts[parts.length - 1] ?? '0', 10)
  })
  return `${parent.codigo}.${String(Math.max(...lastNums) + 1).padStart(3, '0')}`
}

export function antecessorLabel(cc: CentroCusto): string {
  return `${cc.codigo} — ${cc.descricao}`
}

// ─── Labels / opts ────────────────────────────────────────────────────────────

export const CONDICAO_LABEL: Record<CondicaoCC, string> = {
  ambos:   'Ambos',
  receita: 'Receita',
  despesa: 'Despesa',
}

export const TIPO_LABEL: Record<TipoCC, string> = {
  produtivo:      'Produtivo',
  improdutivo:    'Improdutivo',
  administrativo: 'Administrativo',
}

export const CLASSE_LABEL: Record<ClasseCC, string> = {
  sintetica: 'Sintética',
  analitica: 'Analítica',
}

export const CONDICAO_OPTS = [
  { value: '',        label: 'Selecione'  },
  { value: 'ambos',   label: 'Ambos'      },
  { value: 'receita', label: 'Receita'    },
  { value: 'despesa', label: 'Despesa'    },
]

export const TIPO_OPTS = [
  { value: 'produtivo',      label: 'Produtivo'       },
  { value: 'improdutivo',    label: 'Improdutivo'      },
  { value: 'administrativo', label: 'Administrativo'   },
]

export const ATIVO_OPTS = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
]

// ─── Árore de categorias financeiras ─────────────────────────────────────────

export interface CatItem {
  id:    string
  label: string
}

export interface Categoria {
  id:       string
  label:    string
  children: CatItem[]
}

export const CATEGORIAS_TREE: Categoria[] = [
  {
    id: 'rec-agr',
    label: 'RECEITAS DA AGRICULTURA',
    children: [
      { id: 'rec-agr-gra', label: 'Grãos e Cereais'       },
      { id: 'rec-agr-hor', label: 'Horticultura'           },
      { id: 'rec-agr-fru', label: 'Fruticultura'           },
      { id: 'rec-agr-sil', label: 'Silagem'                },
      { id: 'rec-agr-caf', label: 'Café'                   },
    ],
  },
  {
    id: 'rec-sub-agr',
    label: 'RECEITAS DE SUBPRODUTOS DA AGRICULTURA',
    children: [
      { id: 'rec-sub-agr-pal', label: 'Palha'              },
      { id: 'rec-sub-agr-res', label: 'Resíduos Agrícolas' },
      { id: 'rec-sub-agr-bio', label: 'Biogás'             },
    ],
  },
  {
    id: 'rec-pec',
    label: 'RECEITAS DA PECUÁRIA',
    children: [
      { id: 'rec-pec-bov', label: 'Bovinocultura de Corte' },
      { id: 'rec-pec-lei', label: 'Bovinocultura de Leite' },
      { id: 'rec-pec-sui', label: 'Suinocultura'           },
      { id: 'rec-pec-avi', label: 'Avicultura'             },
      { id: 'rec-pec-ovi', label: 'Ovinocultura'           },
    ],
  },
  {
    id: 'rec-sub-pec',
    label: 'RECEITAS DE SUBPRODUTOS DA PECUÁRIA',
    children: [
      { id: 'rec-sub-pec-est', label: 'Esterco / Fertilizante' },
      { id: 'rec-sub-pec-cou', label: 'Couro e Derivados'      },
      { id: 'rec-sub-pec-lan', label: 'Lã'                     },
    ],
  },
  {
    id: 'rec-pis',
    label: 'RECEITAS PISCICULTURA',
    children: [
      { id: 'rec-pis-til', label: 'Tilápia'         },
      { id: 'rec-pis-tra', label: 'Truta'            },
      { id: 'rec-pis-tam', label: 'Tambaqui'         },
      { id: 'rec-pis-pam', label: 'Pacu / Tambatinga'},
    ],
  },
  {
    id: 'des-ope',
    label: 'DESPESAS OPERACIONAIS',
    children: [
      { id: 'des-ope-ins', label: 'Insumos Agrícolas'        },
      { id: 'des-ope-mae', label: 'Mão de Obra Rural'        },
      { id: 'des-ope-com', label: 'Combustível e Lubrificantes' },
      { id: 'des-ope-man', label: 'Manutenção de Máquinas'   },
    ],
  },
  {
    id: 'des-adm',
    label: 'DESPESAS ADMINISTRATIVAS',
    children: [
      { id: 'des-adm-sal', label: 'Salários e Encargos'      },
      { id: 'des-adm-alg', label: 'Aluguel e Arrendamento'   },
      { id: 'des-adm-ser', label: 'Serviços Terceirizados'   },
      { id: 'des-adm-tel', label: 'Telefone e Internet'      },
    ],
  },
]
