export type TipoArmazem = 'insumos' | 'formulacao' | 'producao'

export const TIPO_ARMAZEM_LABEL: Record<TipoArmazem, string> = {
  insumos:    'Insumos',
  formulacao: 'Formulação',
  producao:   'Produção',
}

export const TIPO_ARMAZEM_OPTS: { value: TipoArmazem; label: string }[] = [
  { value: 'insumos',    label: 'Insumos' },
  { value: 'formulacao', label: 'Formulação' },
  { value: 'producao',   label: 'Produção' },
]

export interface Armazem {
  id:        number
  sigla:     string
  descricao: string
  tipo:      TipoArmazem
  ativo:     boolean
}

export function generateNextSigla(existing: Armazem[]): string {
  const nums = existing
    .map(a => a.sigla.match(/^AZM(\d+)$/)?.[1])
    .filter((n): n is string => n !== undefined)
    .map(n => parseInt(n, 10))
  const max = nums.length > 0 ? Math.max(...nums) : 0
  return `AZM${String(max + 1).padStart(2, '0')}`
}
