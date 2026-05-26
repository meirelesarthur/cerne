import type { Embalagem } from './embalagens.types'

export const mockEmbalagens: Embalagem[] = [
  { id: 1, descricao: 'SC 30KG',       quantidade: 30,   unidade: 'kg' },
  { id: 2, descricao: 'SC 60KG',       quantidade: 60,   unidade: 'kg' },
  { id: 3, descricao: 'Big Bag 1T',    quantidade: 1000, unidade: 'kg' },
  { id: 4, descricao: 'Caixa 20L',     quantidade: 20,   unidade: 'L'  },
  { id: 5, descricao: 'Embalagem 5un', quantidade: 5,    unidade: 'un' },
]
