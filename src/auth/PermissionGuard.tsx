import React from 'react'
import { type Permission } from './permissions'
import { usePermission } from './PermissionContext'

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface PermissionGuardProps {
  /** Permissão única ou lista de permissões que a rota/elemento exige. */
  need: Permission | Permission[]
  /**
   * `'any'` (padrão) — renderiza se o usuário tiver ao menos uma das permissões.
   * `'all'`          — renderiza somente se o usuário tiver todas.
   */
  mode?: 'any' | 'all'
  /**
   * Conteúdo renderizado quando o usuário NÃO possui a permissão.
   * Padrão: `null` (não renderiza nada).
   */
  fallback?: React.ReactNode
  children: React.ReactNode
}

// ─── Componente ──────────────────────────────────────────────────────────────

/**
 * Wrapper declarativo de controle de acesso.
 *
 * Renderiza `children` somente se o usuário tiver as permissões indicadas;
 * caso contrário exibe `fallback` (padrão: nada).
 *
 * @example
 * // Oculta o botão "Excluir" para quem não pode deletar fazendas
 * <PermissionGuard need="fazenda.delete">
 *   <Button variant="destructive" onClick={onDelete}>Excluir…</Button>
 * </PermissionGuard>
 *
 * @example
 * // Exibe mensagem de acesso negado quando não tem TODAS as permissões
 * <PermissionGuard need={['safra.create', 'safra.edit']} mode="all" fallback={<AccessDenied />}>
 *   <SafraForm />
 * </PermissionGuard>
 */
export function PermissionGuard({
  need,
  mode = 'any',
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { can } = usePermission()
  return can(need, mode) ? <>{children}</> : <>{fallback}</>
}
