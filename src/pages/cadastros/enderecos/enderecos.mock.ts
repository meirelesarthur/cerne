import type { Endereco } from './enderecos.types'

export const mockEnderecos: Endereco[] = [
  { id: 1, descricao: 'Armazém Central',  tipo: 'setor',    parentId: null },
  { id: 2, descricao: 'Corredor A',       tipo: 'corredor', parentId: 1    },
  { id: 3, descricao: 'Corredor B',       tipo: 'corredor', parentId: 1    },
  { id: 4, descricao: 'Depósito Leste',   tipo: 'setor',    parentId: null },
  { id: 5, descricao: 'Corredor 01',      tipo: 'corredor', parentId: 4    },
  { id: 6, descricao: 'Galpão Sul',       tipo: 'setor',    parentId: null },
]
