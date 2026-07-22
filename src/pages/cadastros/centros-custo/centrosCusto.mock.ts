import type { CentroCusto } from './centrosCusto.types'

export const mockCentrosCusto: CentroCusto[] = [
  // ── Raiz 1.01 — Administração (Sintética) ─────────────────────────────────
  {
    id: 1, codigo: '1.01', condicao: 'ambos', descricao: 'Administração',
    ativo: 'sim', apontamento: 'sim', tipo: 'administrativo',
    antecessorId: null, categorias: [],
  },
  {
    id: 2, codigo: '1.01.001', condicao: 'ambos', descricao: 'Sede',
    ativo: 'sim', apontamento: 'sim', tipo: 'administrativo',
    antecessorId: 1, categorias: ['cat-16', 'cat-28-1'],
  },
  {
    id: 3, codigo: '1.01.002', condicao: 'ambos', descricao: 'Escritório Pompéu',
    ativo: 'sim', apontamento: 'sim', tipo: 'administrativo',
    antecessorId: 1, categorias: ['cat-16'],
  },
  {
    id: 4, codigo: '1.01.003', condicao: 'ambos', descricao: 'Investimentos',
    ativo: 'sim', apontamento: 'sim', tipo: 'produtivo',
    antecessorId: 1, categorias: [],
  },
  {
    id: 5, codigo: '1.01.004', condicao: 'ambos', descricao: 'Administração Geral',
    ativo: 'sim', apontamento: 'sim', tipo: 'administrativo',
    antecessorId: 1, categorias: ['cat-16'],
  },
  {
    id: 6, codigo: '1.01.005', condicao: 'ambos', descricao: 'Edifício São Francisco',
    ativo: 'sim', apontamento: 'sim', tipo: 'administrativo',
    antecessorId: 1, categorias: [],
  },
  {
    id: 7, codigo: '1.01.006', condicao: 'ambos', descricao: 'Edifício Bela Vista',
    ativo: 'sim', apontamento: 'sim', tipo: 'administrativo',
    antecessorId: 1, categorias: [],
  },
  {
    id: 8, codigo: '1.01.007', condicao: 'ambos', descricao: 'Fiat Uno',
    ativo: 'sim', apontamento: 'sim', tipo: 'administrativo',
    antecessorId: 1, categorias: [],
  },
  {
    id: 9, codigo: '1.01.008', condicao: 'ambos', descricao: 'Loteamento Bela Vista',
    ativo: 'sim', apontamento: 'sim', tipo: 'administrativo',
    antecessorId: 1, categorias: [],
  },
  {
    id: 10, codigo: '1.01.009', condicao: 'ambos', descricao: 'Renault Oroch',
    ativo: 'sim', apontamento: 'sim', tipo: 'administrativo',
    antecessorId: 1, categorias: [],
  },
  // ── Raiz 1.02 — Produção Agrícola (Sintética) ─────────────────────────────
  {
    id: 11, codigo: '1.02', condicao: 'ambos', descricao: 'Produção Agrícola',
    ativo: 'sim', apontamento: 'sim', tipo: 'produtivo',
    antecessorId: null, categorias: [],
  },
  {
    id: 12, codigo: '1.02.001', condicao: 'receita', descricao: 'Lavoura de Soja',
    ativo: 'sim', apontamento: 'sim', tipo: 'produtivo',
    antecessorId: 11, categorias: ['cat-1', 'cat-1-1'],
  },
  {
    id: 13, codigo: '1.02.002', condicao: 'receita', descricao: 'Lavoura de Milho',
    ativo: 'sim', apontamento: 'sim', tipo: 'produtivo',
    antecessorId: 11, categorias: ['cat-1', 'cat-1-1'],
  },
  {
    id: 14, codigo: '1.02.003', condicao: 'receita', descricao: 'Lavoura de Café',
    ativo: 'sim', apontamento: 'sim', tipo: 'produtivo',
    antecessorId: 11, categorias: ['cat-1'],
  },
  // ── Raiz 1.03 — Pecuária (Sintética) ─────────────────────────────────────
  {
    id: 15, codigo: '1.03', condicao: 'ambos', descricao: 'Pecuária',
    ativo: 'sim', apontamento: 'sim', tipo: 'produtivo',
    antecessorId: null, categorias: [],
  },
  {
    id: 16, codigo: '1.03.001', condicao: 'receita', descricao: 'Bovinocultura de Corte',
    ativo: 'sim', apontamento: 'sim', tipo: 'produtivo',
    antecessorId: 15, categorias: ['cat-3', 'cat-3-6'],
  },
  {
    id: 17, codigo: '1.03.002', condicao: 'receita', descricao: 'Bovinocultura de Leite',
    ativo: 'sim', apontamento: 'sim', tipo: 'produtivo',
    antecessorId: 15, categorias: ['cat-3', 'cat-3-10'],
  },
  {
    id: 18, codigo: '1.03.003', condicao: 'receita', descricao: 'Suinocultura',
    ativo: 'sim', apontamento: 'sim', tipo: 'produtivo',
    antecessorId: 15, categorias: ['cat-7'],
  },
  // ── Raiz 1.04 — Custos Fixos (Sintética, Inativa) ─────────────────────────
  {
    id: 19, codigo: '1.04', condicao: 'despesa', descricao: 'Custos Fixos',
    ativo: 'nao', apontamento: 'nao', tipo: 'administrativo',
    antecessorId: null, categorias: [],
  },
  {
    id: 20, codigo: '1.04.001', condicao: 'despesa', descricao: 'Energia Elétrica',
    ativo: 'nao', apontamento: 'nao', tipo: 'administrativo',
    antecessorId: 19, categorias: ['cat-16', 'cat-16-1'],
  },
]
