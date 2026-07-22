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

/** Ids de todos os centros analíticos descendentes de `id` (padrão de enderecos.types.ts). */
export function getAllDescendantCentroIds(items: CentroCusto[], id: number): number[] {
  const direct = items.filter(c => c.antecessorId === id)
  return direct.flatMap(c => [c.id, ...getAllDescendantCentroIds(items, c.id)])
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

// Árvore de categorias financeiras: fonte única em `src/data/categoriasFinanceiras.ts`
// (usada aqui e no Plano de Contas via `CategoryTreeField`) — não duplicar localmente.
