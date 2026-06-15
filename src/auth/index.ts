/**
 * GB CERNE — Auth barrel
 *
 * Importe tudo de '@/auth' (ou 'src/auth') — nunca importe diretamente dos
 * arquivos internos para manter a superfície pública estável.
 *
 * @example
 * import {
 *   PermissionProvider, usePermission, PermissionGuard,
 *   SessionProvider, useSession, SessionExpiredModal,
 *   setSessionExpireHandler, triggerSessionExpire,
 *   roleCan, ROLE_PERMISSIONS,
 *   type Role, type Permission,
 * } from '@/auth'
 */

// ─── Permissões ───────────────────────────────────────────────────────────────
export { ROLE_PERMISSIONS, roleCan }        from './permissions'
export type { Role, Permission }            from './permissions'

// ─── PermissionContext ────────────────────────────────────────────────────────
export { PermissionProvider, usePermission } from './PermissionContext'

// ─── PermissionGuard ─────────────────────────────────────────────────────────
export { PermissionGuard }                  from './PermissionGuard'

// ─── SessionContext ───────────────────────────────────────────────────────────
export {
  SessionProvider,
  useSession,
  setSessionExpireHandler,
  triggerSessionExpire,
}                                           from './SessionContext'

// ─── SessionExpiredModal ──────────────────────────────────────────────────────
export { SessionExpiredModal }              from './SessionExpiredModal'
