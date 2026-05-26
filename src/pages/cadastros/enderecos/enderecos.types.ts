export type TipoEndereco = 'setor' | 'corredor'

export const TIPO_LABEL: Record<TipoEndereco, string> = {
  setor:    'Setor',
  corredor: 'Corredor',
}

export const TIPO_CHILD: Partial<Record<TipoEndereco, TipoEndereco>> = {
  setor: 'corredor',
}

export const TIPO_COLOR: Record<TipoEndereco, { bg: string; text: string }> = {
  setor:    { bg: '#eff6ff', text: '#2563eb' },
  corredor: { bg: '#f0fdf4', text: '#059669' },
}

export interface Endereco {
  id:        number
  descricao: string
  tipo:      TipoEndereco
  parentId:  number | null
}

export interface EnderecoNode extends Endereco {
  children: EnderecoNode[]
}

export function buildTree(items: Endereco[], parentId: number | null = null): EnderecoNode[] {
  return items
    .filter(i => i.parentId === parentId)
    .map(i => ({ ...i, children: buildTree(items, i.id) }))
}

export function getAllDescendantIds(items: Endereco[], id: number): number[] {
  const direct = items.filter(i => i.parentId === id)
  return direct.flatMap(c => [c.id, ...getAllDescendantIds(items, c.id)])
}
