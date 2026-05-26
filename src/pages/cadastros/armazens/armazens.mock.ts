import type { Armazem } from './armazens.types'

export const mockArmazens: Armazem[] = [
  { id: 1, sigla: 'AZM01', descricao: 'Armazém Insumos Trindade',    tipo: 'insumos',    ativo: true  },
  { id: 2, sigla: 'AZM02', descricao: 'Armazém Insumos Ração',       tipo: 'formulacao', ativo: true  },
  { id: 3, sigla: 'AZM03', descricao: 'Armazém Produção Trindade',   tipo: 'producao',   ativo: true  },
  { id: 4, sigla: 'AZM04', descricao: 'Tanque Combustível Trindade', tipo: 'insumos',    ativo: true  },
  { id: 5, sigla: 'AZM05', descricao: 'Depósito Fazenda Leste',      tipo: 'producao',   ativo: false },
]
