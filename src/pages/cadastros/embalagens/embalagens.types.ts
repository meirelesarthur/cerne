export type UnidadeMedida = 'kg' | 't' | 'sc' | 'L' | 'un'

export const UNIDADE_OPTS: { value: UnidadeMedida; label: string }[] = [
  { value: 'kg', label: 'kg — Quilograma' },
  { value: 't',  label: 't — Tonelada' },
  { value: 'sc', label: 'sc — Saca' },
  { value: 'L',  label: 'L — Litro' },
  { value: 'un', label: 'un — Unidade' },
]

export interface Embalagem {
  id:         number
  descricao:  string
  quantidade: number
  unidade:    UnidadeMedida
}

export function fmtQtd(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
