import { Badge } from '../../../components/ui/Badge'
import type { DetailItem } from '../../../components/ui/DetailGrid'

// ─── Tipos base ───────────────────────────────────────────────────────────────

export interface UserRecord {
  id: string
  name: string
  nif: string
  email: string
  roles: string[]
  farms: string[]
  bosses: string[]
  online: boolean
}

// ─── Opções ───────────────────────────────────────────────────────────────────

export const ROLE_OPTIONS = [
  { id: 'manager', label: 'Gestor' },
  { id: 'financial', label: 'Financeiro' },
  { id: 'livestock', label: 'Pecuária' },
  { id: 'purchases', label: 'Compras' },
]
export const FARM_OPTIONS = [
  { id: 'farm-1', label: 'Fazenda Boa Esperança' },
  { id: 'farm-2', label: 'Fazenda Horizonte' },
  { id: 'farm-3', label: 'Fazenda Santa Clara' },
]
export const BOSS_OPTIONS = [
  { id: 'boss-1', label: 'Marina Alves' },
  { id: 'boss-2', label: 'Carlos Nogueira' },
]

// ─── Mock inicial ─────────────────────────────────────────────────────────────

export const INITIAL_USERS: UserRecord[] = [
  { id: 'user-1', name: 'Marina Alves', nif: '123.456.789-09', email: 'marina@gbcerne.com', roles: ['manager', 'financial'], farms: ['farm-1', 'farm-2'], bosses: [], online: true },
  { id: 'user-2', name: 'Carlos Nogueira', nif: '987.654.321-00', email: 'carlos@gbcerne.com', roles: ['livestock'], farms: ['farm-1'], bosses: ['boss-1'], online: false },
  { id: 'user-3', name: 'Renata Lima', nif: '741.852.963-00', email: 'renata@gbcerne.com', roles: ['purchases'], farms: ['farm-3'], bosses: ['boss-1'], online: true },
]

// ─── Derivados ────────────────────────────────────────────────────────────────

export const emptyDraft = (): UserRecord => ({ id: '', name: '', nif: '', email: '', roles: [], farms: [], bosses: [], online: false })

export function labels(ids: string[], options: { id: string; label: string }[]) {
  return ids.map((id) => options.find((option) => option.id === id)?.label ?? id).join(', ')
}

/** Itens do DetailGrid — fonte única usada tanto no card mobile da listagem quanto na tela de detalhe. */
export function detailItems(user: UserRecord): DetailItem[] {
  return [
    { label: 'Nome', value: user.name },
    { label: 'CPF', value: user.nif },
    { label: 'E-mail', value: user.email, copyValue: user.email },
    { label: 'Status', value: <Badge label={user.online ? 'Online' : 'Offline'} variant={user.online ? 'success' : 'neutral'} /> },
    { label: 'Perfis', value: labels(user.roles, ROLE_OPTIONS) },
    { label: 'Fazendas', value: labels(user.farms, FARM_OPTIONS) || 'Todas' },
  ]
}
