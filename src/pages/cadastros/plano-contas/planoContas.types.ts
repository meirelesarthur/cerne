// ─── Tipos base ───────────────────────────────────────────────────────────────

export type ClassePC   = 'sintetica' | 'analitica'
export type CondicaoPC = 'debito' | 'credito' | 'ambos'
export type TipoPC     = 'capex' | 'opex'

export interface Conta {
  id:            number
  codigo:        string
  descricao:     string
  condicao:      CondicaoPC
  classe:        ClassePC
  ativo:         'sim' | 'nao'
  tipo:          TipoPC | ''
  antecessorId:  number | null
  categorias:    string[]
  dataCriacao:   string
  usuarioCriacao: string
}

// ─── Geração de código hierárquico ─────────────────────────────────────────────
// Exemplos do domínio: "1" (raiz) → "1.1" (grupo) → "1.1.01" (folha).
// Nível 1: inteiro sequencial. Nível 2: "{pai}.{n}". Nível 3+: "{pai}.{n}" com padding de 2 dígitos.

export function gerarCodigo(antecessorId: number | null, all: Conta[]): string {
  if (antecessorId === null) {
    const roots = all.filter(c => c.antecessorId === null)
    if (roots.length === 0) return '1'
    const nums = roots.map(c => parseInt(c.codigo.split('.')[0] ?? '0', 10) || 0)
    return String(Math.max(...nums) + 1)
  }

  const parent = all.find(c => c.id === antecessorId)
  if (!parent) return '1.1'

  const parentDepth = parent.codigo.split('.').length
  const children = all.filter(c => c.antecessorId === antecessorId)
  const lastNums = children.map(c => {
    const parts = c.codigo.split('.')
    return parseInt(parts[parts.length - 1] ?? '0', 10) || 0
  })
  const next = Math.max(0, ...lastNums) + 1

  return parentDepth === 1
    ? `${parent.codigo}.${next}`
    : `${parent.codigo}.${String(next).padStart(2, '0')}`
}

export function antecessorLabel(conta: Conta): string {
  return `${conta.codigo} — ${conta.descricao}`
}

/** Ids de todas as contas descendentes de `id` (mesmo padrão de centrosCusto.types.ts). */
export function getAllDescendantContaIds(items: Conta[], id: number): number[] {
  const direct = items.filter(c => c.antecessorId === id)
  return direct.flatMap(c => [c.id, ...getAllDescendantContaIds(items, c.id)])
}

// ─── Labels / opts ────────────────────────────────────────────────────────────

export const CONDICAO_LABEL: Record<CondicaoPC, string> = {
  debito:  'Débito',
  credito: 'Crédito',
  ambos:   'Ambos',
}

export const CLASSE_LABEL: Record<ClassePC, string> = {
  sintetica: 'Sintética',
  analitica: 'Analítica',
}

export const TIPO_LABEL: Record<TipoPC, string> = {
  capex: 'CAPEX',
  opex:  'OPEX',
}

export const CONDICAO_OPTS = [
  { value: '',        label: 'Selecione' },
  { value: 'debito',  label: 'Débito'    },
  { value: 'credito', label: 'Crédito'   },
  { value: 'ambos',   label: 'Ambos'     },
]

export const CLASSE_OPTS = [
  { value: '',          label: 'Selecione'  },
  { value: 'sintetica', label: 'Sintética' },
  { value: 'analitica', label: 'Analítica' },
]

export const TIPO_OPTS = [
  { value: '',      label: 'Nenhum' },
  { value: 'capex', label: 'CAPEX'  },
  { value: 'opex',  label: 'OPEX'   },
]

export const ATIVO_OPTS = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
]
