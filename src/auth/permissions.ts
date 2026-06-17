/**
 * GB CERNE — Modelo de permissões (RBAC)
 *
 * Roles definem o que cada perfil pode fazer. O papel 'admin' possui o curinga
 * '*' que satisfaz qualquer permissão verificada via `roleCan`.
 *
 * Convenção de permissões: `<domínio>.<ação>`
 *   Domínios:  fazenda | safra | produto | usuario | config | relatorio | financeiro
 *   Ações:     view | create | edit | delete | export | import | manage
 */

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type Role = 'admin' | 'manager' | 'operator' | 'viewer'

/** String no formato `dominio.acao` ou o curinga `*` */
export type Permission = string

// ─── Mapa de papéis → permissões ────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  /**
   * Administrador — acesso irrestrito.
   * O curinga '*' é interpretado por `roleCan` como "qualquer permissão".
   */
  admin: ['*'],

  /**
   * Gerente — acesso operacional completo.
   * Não pode gerenciar usuários, configurações do sistema nem exportar dados.
   */
  manager: [
    'fazenda.view',
    'fazenda.create',
    'fazenda.edit',
    'fazenda.delete',
    'safra.view',
    'safra.create',
    'safra.edit',
    'safra.delete',
    'produto.view',
    'produto.create',
    'produto.edit',
    'produto.delete',
    'relatorio.view',
    'relatorio.export',
    'financeiro.view',
    'financeiro.create',
    'financeiro.edit',
    'financeiro.delete',
    'financeiro.export',
  ],

  /**
   * Operador — pode criar e editar, mas não excluir nem acessar área financeira.
   */
  operator: [
    'fazenda.view',
    'fazenda.create',
    'fazenda.edit',
    'safra.view',
    'safra.create',
    'safra.edit',
    'produto.view',
    'produto.create',
    'produto.edit',
    'relatorio.view',
    'financeiro.view',
  ],

  /**
   * Visualizador — somente leitura em todos os domínios.
   */
  viewer: [
    'fazenda.view',
    'safra.view',
    'produto.view',
    'relatorio.view',
    'financeiro.view',
  ],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Verifica se um papel possui determinada permissão.
 *
 * Respeita o curinga `*`: se o papel possuir `['*']`, qualquer permissão é
 * concedida sem necessidade de listá-las individualmente.
 *
 * @example
 * roleCan('admin', 'usuario.delete')  // true  — curinga
 * roleCan('operator', 'fazenda.edit') // true   — listada
 * roleCan('viewer', 'fazenda.delete') // false  — não listada
 */
export function roleCan(role: Role, perm: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role]
  if (!perms) return false
  if (perms.includes('*')) return true
  return perms.includes(perm)
}
