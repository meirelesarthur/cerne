import React, { createContext, useContext, useMemo } from 'react'
import { type Role, type Permission, ROLE_PERMISSIONS, roleCan } from './permissions'

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface PermissionContextValue {
  role: Role
  /**
   * Verifica se o usuário possui a(s) permissão(ões) indicadas.
   *
   * @param perm  - Permissão única ou lista de permissões.
   * @param mode  - `'any'` (padrão) → basta ter ao menos uma;
   *               `'all'` → precisa ter todas.
   */
  can(perm: Permission | Permission[], mode?: 'any' | 'all'): boolean
}

// ─── Contexto ────────────────────────────────────────────────────────────────

const PermissionContext = createContext<PermissionContextValue>({
  role: 'admin',
  can: () => true,
})

// ─── Provider ────────────────────────────────────────────────────────────────

interface PermissionProviderProps {
  children: React.ReactNode
  /**
   * Papel do usuário autenticado.
   * Padrão: `'admin'` — garante que telas existentes não quebrem enquanto
   * o wiring de autenticação real não está conectado.
   */
  role?: Role
  /**
   * Lista de permissões avulsas que sobrescreve o mapa do papel.
   * Útil para permissões customizadas vindas do back-end (ex.: feature flags
   * por organização) sem precisar criar um papel inteiramente novo.
   */
  permissions?: Permission[]
}

export function PermissionProvider({
  children,
  role = 'admin',
  permissions,
}: PermissionProviderProps) {
  const value = useMemo<PermissionContextValue>(() => {
    // Se `permissions` foi fornecida, ela substitui completamente o mapa do papel.
    const effectivePerms = permissions ?? ROLE_PERMISSIONS[role]
    const hasWildcard = effectivePerms.includes('*')

    function can(perm: Permission | Permission[], mode: 'any' | 'all' = 'any'): boolean {
      if (hasWildcard) return true
      const list = Array.isArray(perm) ? perm : [perm]
      if (mode === 'all') return list.every((p) => effectivePerms.includes(p))
      return list.some((p) => effectivePerms.includes(p))
    }

    return { role, can }
  }, [role, permissions])

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Hook de acesso ao contexto de permissões.
 *
 * @example
 * const { can } = usePermission()
 * if (can('fazenda.delete')) { ... }
 * if (can(['safra.create', 'safra.edit'], 'all')) { ... }
 */
export function usePermission(): PermissionContextValue {
  return useContext(PermissionContext)
}
