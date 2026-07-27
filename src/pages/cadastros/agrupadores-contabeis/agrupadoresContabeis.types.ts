// ─── Tipos base ───────────────────────────────────────────────────────────────
// Mesmo modelo de hierarquia usado em Plano de Contas / Centro de Custo:
// lista plana com `antecessorId`, código gerado a partir do antecessor e
// prevenção de ciclo via `getAllDescendantAgrupadorIds` (ver planoContas.types.ts).

export interface AgrupadorContabil {
  id:           number
  codigo:       string
  nome:         string
  ativo:        'sim' | 'nao'
  antecessorId: number | null
}

// ─── Geração de código hierárquico ─────────────────────────────────────────────
// Mesma convenção de Plano de Contas: "1" (raiz) → "1.1" (grupo) → "1.1.01" (folha).
// Nível 1: inteiro sequencial. Nível 2: "{pai}.{n}". Nível 3+: "{pai}.{n}" com padding de 2 dígitos.

export function gerarCodigo(antecessorId: number | null, all: AgrupadorContabil[]): string {
  if (antecessorId === null) {
    const roots = all.filter(a => a.antecessorId === null)
    if (roots.length === 0) return '1'
    const nums = roots.map(a => parseInt(a.codigo.split('.')[0] ?? '0', 10) || 0)
    return String(Math.max(...nums) + 1)
  }

  const parent = all.find(a => a.id === antecessorId)
  if (!parent) return '1.1'

  const parentDepth = parent.codigo.split('.').length
  const children = all.filter(a => a.antecessorId === antecessorId)
  const lastNums = children.map(a => {
    const parts = a.codigo.split('.')
    return parseInt(parts[parts.length - 1] ?? '0', 10) || 0
  })
  const next = Math.max(0, ...lastNums) + 1

  return parentDepth === 1
    ? `${parent.codigo}.${next}`
    : `${parent.codigo}.${String(next).padStart(2, '0')}`
}

export function antecessorLabel(agrupador: AgrupadorContabil): string {
  return `${agrupador.codigo} — ${agrupador.nome}`
}

/** Ids de todos os agrupadores descendentes de `id` (mesmo padrão de planoContas.types.ts). */
export function getAllDescendantAgrupadorIds(items: AgrupadorContabil[], id: number): number[] {
  const direct = items.filter(a => a.antecessorId === id)
  return direct.flatMap(a => [a.id, ...getAllDescendantAgrupadorIds(items, a.id)])
}

/** Classe derivada: sintético quem tem descendentes, analítico quem não tem (folha). */
export function classeOf(id: number, all: AgrupadorContabil[]): 'sintetica' | 'analitica' {
  return all.some(a => a.antecessorId === id) ? 'sintetica' : 'analitica'
}

export const CLASSE_LABEL: Record<'sintetica' | 'analitica', string> = {
  sintetica: 'Sintético',
  analitica: 'Analítico',
}

export const ATIVO_OPTS = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
]
