import { ALL_LEAF_IDS, LEAF_IDS_BY_NODE, PERMISSION_CATALOG, type PermissionNode } from '../../../data/permissionsCatalog'

export interface PerfilAcesso {
  id: string
  nome: string
  descricao?: string
  /** Controla se o perfil aparece nos seletores de atribuição a usuário — nunca afeta `permissoes`. */
  visivelAoUsuario: boolean
  /** Ids de FOLHA do catálogo de permissões — nunca ids de módulo/funcionalidade. */
  permissoes: string[]
  /** Mock — quantos usuários usam este perfil hoje; usado só para avisar na exclusão, nunca bloqueia. */
  usuariosVinculados: number
}

function findModule(label: string): PermissionNode | undefined {
  return PERMISSION_CATALOG.find((module) => module.label === label)
}

function fullModuleLeaves(moduleLabel: string): string[] {
  const module = findModule(moduleLabel)
  return module ? LEAF_IDS_BY_NODE.get(module.id) ?? [] : []
}

function viewOnlyModuleLeaves(moduleLabel: string): string[] {
  return fullModuleLeaves(moduleLabel).filter((id) => id.endsWith('.view'))
}

/** Sanitiza contra o catálogo atual (proteção contra drift — ver PermissionTreeField). */
function sanitize(ids: string[]): string[] {
  return [...new Set(ids)].filter((id) => ALL_LEAF_IDS.has(id))
}

export const MOCK_PERFIS: PerfilAcesso[] = [
  {
    id: '1',
    nome: 'Administrador_Master',
    descricao: 'Acesso irrestrito a todos os módulos do sistema.',
    visivelAoUsuario: true,
    permissoes: sanitize([...ALL_LEAF_IDS]),
    usuariosVinculados: 3,
  },
  {
    id: '2',
    nome: 'Agri_Advanced',
    descricao: 'Gestão completa das operações agrícolas e cadastros base.',
    visivelAoUsuario: true,
    permissoes: sanitize([...fullModuleLeaves('Operacional'), ...fullModuleLeaves('Cadastros Base')]),
    usuariosVinculados: 5,
  },
  {
    id: '3',
    nome: 'Agri_Basico',
    descricao: 'Consulta de operações agrícolas e cadastros base, sem edição.',
    visivelAoUsuario: true,
    permissoes: sanitize([...viewOnlyModuleLeaves('Operacional'), ...viewOnlyModuleLeaves('Cadastros Base')]),
    usuariosVinculados: 8,
  },
  {
    id: '4',
    nome: 'Pecuaria_Advanced',
    descricao: 'Gestão completa de operações pecuárias, com consulta a cadastros.',
    visivelAoUsuario: true,
    permissoes: sanitize([...fullModuleLeaves('Operacional'), ...viewOnlyModuleLeaves('Cadastros Base')]),
    usuariosVinculados: 4,
  },
  {
    id: '5',
    nome: 'Pecuaria_Basico',
    descricao: 'Consulta das operações pecuárias.',
    visivelAoUsuario: true,
    permissoes: sanitize(viewOnlyModuleLeaves('Operacional')),
    usuariosVinculados: 6,
  },
  {
    id: '6',
    nome: 'BPO_Financ',
    descricao: 'Gestão financeira e fiscal terceirizada.',
    visivelAoUsuario: true,
    permissoes: sanitize([...fullModuleLeaves('Financeiro'), ...fullModuleLeaves('Gestão Fiscal')]),
    usuariosVinculados: 2,
  },
  {
    id: '7',
    nome: 'BPO_Fiscal',
    descricao: 'Gestão fiscal terceirizada, com consulta financeira.',
    visivelAoUsuario: true,
    permissoes: sanitize([...fullModuleLeaves('Gestão Fiscal'), ...viewOnlyModuleLeaves('Financeiro')]),
    usuariosVinculados: 0,
  },
  {
    id: '8',
    nome: 'Financeiro_Analista',
    descricao: 'Consulta de dados financeiros e relatórios.',
    visivelAoUsuario: true,
    permissoes: sanitize([...viewOnlyModuleLeaves('Financeiro'), ...viewOnlyModuleLeaves('Relatórios')]),
    usuariosVinculados: 0,
  },
  {
    id: '9',
    nome: 'Operacional_Supervisor',
    descricao: 'Supervisão completa das operações de campo.',
    visivelAoUsuario: true,
    permissoes: sanitize(fullModuleLeaves('Operacional')),
    usuariosVinculados: 7,
  },
  {
    id: '10',
    nome: 'Compras_Aprovador',
    descricao: 'Gestão completa de suprimentos e aprovação de compras.',
    visivelAoUsuario: true,
    permissoes: sanitize(fullModuleLeaves('Administrativo')),
    usuariosVinculados: 3,
  },
  {
    id: '11',
    nome: 'Gestor_Fazenda',
    descricao: 'Gestão de cadastros base, com consulta financeira e de dashboards.',
    visivelAoUsuario: true,
    permissoes: sanitize([
      ...fullModuleLeaves('Cadastros Base'),
      ...viewOnlyModuleLeaves('Financeiro'),
      ...viewOnlyModuleLeaves('Dashboards'),
    ]),
    usuariosVinculados: 12,
  },
  {
    id: '12',
    nome: 'Suporte_TI',
    descricao: 'Gestão de integrações e frota — perfil técnico interno.',
    visivelAoUsuario: false,
    permissoes: sanitize([...fullModuleLeaves('Integrações'), ...fullModuleLeaves('Gestão de Frota')]),
    usuariosVinculados: 1,
  },
  {
    id: '13',
    nome: 'RH_Basico',
    descricao: 'Consulta de processos administrativos.',
    visivelAoUsuario: true,
    permissoes: sanitize(viewOnlyModuleLeaves('Administrativo')),
    usuariosVinculados: 0,
  },
  {
    id: '14',
    nome: 'Comercial_Vendas',
    descricao: 'Consulta de relatórios e dashboards comerciais.',
    visivelAoUsuario: true,
    permissoes: sanitize([...viewOnlyModuleLeaves('Relatórios'), ...viewOnlyModuleLeaves('Dashboards')]),
    usuariosVinculados: 0,
  },
  {
    id: '15',
    nome: 'Auditor_Externo',
    descricao: 'Consulta irrestrita, sem permissão de edição em nenhum módulo.',
    visivelAoUsuario: false,
    permissoes: sanitize([...ALL_LEAF_IDS].filter((id) => id.endsWith('.view'))),
    usuariosVinculados: 0,
  },
  {
    id: '16',
    nome: 'Suporte_Legado',
    descricao: 'Perfil criado para uma integração legada, ainda sem permissões configuradas.',
    visivelAoUsuario: false,
    permissoes: [],
    usuariosVinculados: 0,
  },
]
