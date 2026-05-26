import React, { useState, useMemo, useCallback } from 'react'
import {
  Plus, Search, X, Pencil, Trash2, Warehouse,
  ChevronUp, ChevronDown,
} from 'lucide-react'
import { PageHeader }    from '../../../components/ui/PageHeader'
import { PageContainer } from '../../../components/ui/PageContainer'
import { Button }        from '../../../components/ui/Button'
import { t }             from '../../../design/tokens'
import { useTheme }      from '../../../context/ThemeContext'
import {
  TIPO_ARMAZEM_LABEL, TIPO_ARMAZEM_OPTS,
  type Armazem, type TipoArmazem,
} from './armazens.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  armazens: Armazem[]
  onNew:    () => void
  onEdit:   (id: number) => void
  onDelete: (id: number) => void
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastItem { id: number; message: string; type: 'ok' | 'err' | 'neutral' }
const TOAST_BG: Record<ToastItem['type'], string> = { ok: '#14532d', err: '#dc2626', neutral: '#374151' }

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const show = useCallback((message: string, type: ToastItem['type'] = 'ok') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])
  const dismiss = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), [])
  return { toasts, show, dismiss }
}

// ─── Badges ───────────────────────────────────────────────────────────────────

const TIPO_COLORS: Record<TipoArmazem, { bg: string; text: string }> = {
  insumos:    { bg: t.color.brand[50],   text: t.color.brand[600] },
  formulacao: { bg: t.color.info.bg,     text: t.color.info.text },
  producao:   { bg: t.color.warning.bg,  text: t.color.warning.text },
}

type SortField = 'sigla' | 'descricao'
type SortDir   = 'asc' | 'desc'

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ArmazensLista({ armazens, onNew, onEdit, onDelete }: Props) {
  const { colors } = useTheme()
  const { toasts, show, dismiss } = useToast()

  const [search,       setSearch]      = useState('')
  const [sortField,    setSortField]   = useState<SortField>('sigla')
  const [sortDir,      setSortDir]     = useState<SortDir>('asc')
  const [deleteTarget, setDeleteTarget] = useState<Armazem | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = q
      ? armazens.filter(a =>
          a.sigla.toLowerCase().includes(q) ||
          a.descricao.toLowerCase().includes(q)
        )
      : [...armazens]
    base.sort((a, b) => {
      const cmp = a[sortField].localeCompare(b[sortField], 'pt-BR')
      return sortDir === 'asc' ? cmp : -cmp
    })
    return base
  }, [armazens, search, sortField, sortDir])

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    onDelete(deleteTarget.id)
    show(`Armazém "${deleteTarget.sigla}" excluído.`, 'neutral')
    setDeleteTarget(null)
  }

  const border = colors.border

  const SortIcon = ({ field }: { field: SortField }) => (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <ChevronUp  size={9} style={{ opacity: sortField === field && sortDir === 'asc'  ? 1 : 0.3 }} />
      <ChevronDown size={9} style={{ opacity: sortField === field && sortDir === 'desc' ? 1 : 0.3 }} />
    </span>
  )

  const colStyle: React.CSSProperties = {
    fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold,
    color: colors.textMuted, fontFamily: t.font.family.sans,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  }

  return (
    <PageContainer>

      <PageHeader
        title="Armazéns"
        count={armazens.length}
        actions={
          <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
            Adicionar Armazém
          </Button>
        }
      />

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar armazém..." />
        <span style={{ marginLeft: 'auto', fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans, whiteSpace: 'nowrap' }}>
          {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <EmptyState onNew={onNew} hasSearch={search.length > 0} />
      ) : (
        <div style={{ background: colors.surfaceBg, border: `1px solid ${border}`, borderRadius: t.radius.lg, overflow: 'hidden' }}>
          {/* Cabeçalho */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 140px 100px 96px', padding: '10px 16px', background: colors.surfaceSubtle, borderBottom: `1px solid ${border}` }}>
            <SortBtn label="Sigla" field="sigla" sortField={sortField} onSort={handleSort} colors={colors} SortIconEl={<SortIcon field="sigla" />} />
            <SortBtn label="Descrição" field="descricao" sortField={sortField} onSort={handleSort} colors={colors} SortIconEl={<SortIcon field="descricao" />} />
            <span style={colStyle}>Tipo</span>
            <span style={colStyle}>Status</span>
            <span style={{ ...colStyle, textAlign: 'right' }}>Ações</span>
          </div>

          {filtered.map((arm, idx) => (
            <ArmazemRow
              key={arm.id}
              arm={arm}
              isLast={idx === filtered.length - 1}
              onEdit={() => onEdit(arm.id)}
              onDeleteReq={() => setDeleteTarget(arm)}
              colors={colors}
              border={border}
            />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ marginTop: 10, fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
          N. Registros: {filtered.length}
        </div>
      )}

      {/* Modal exclusão */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '4px 0' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={22} color="#dc2626" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold, color: colors.textPrimary, fontFamily: t.font.family.sans, marginBottom: 8 }}>
                Excluir armazém?
              </div>
              <p style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans, lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: colors.textPrimary }}>{deleteTarget.sigla} — {deleteTarget.descricao}</strong>{' '}
                será excluído permanentemente. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
              <Button variant="secondary" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button variant="destructive" style={{ flex: 1 }} onClick={handleDeleteConfirm}>
                <Trash2 size={13} /> Excluir
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toasts */}
      <div style={{ position: 'fixed', top: 72, right: 24, display: 'flex', flexDirection: 'column', gap: 8, zIndex: t.zIndex.toast, pointerEvents: 'none' }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{ background: TOAST_BG[toast.type], color: 'white', padding: '11px 18px', borderRadius: t.radius.lg, fontSize: t.font.size.base, fontWeight: t.font.weight.medium, fontFamily: t.font.family.sans, boxShadow: t.shadow.lg, display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto', animation: 'toastIn 0.22s ease' }}>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 0, display: 'flex' }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(16px) } to { opacity:1; transform:translateX(0) } }`}</style>

    </PageContainer>
  )
}

// ─── SortBtn ──────────────────────────────────────────────────────────────────

function SortBtn({ label, field, sortField, onSort, colors, SortIconEl }: {
  label: string; field: SortField; sortField: SortField
  onSort: (f: SortField) => void
  colors: ReturnType<typeof useTheme>['colors']
  SortIconEl: React.ReactNode
}) {
  return (
    <button type="button" onClick={() => onSort(field)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.textMuted, fontFamily: t.font.family.sans, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label} {SortIconEl}
    </button>
  )
}

// ─── ArmazemRow ───────────────────────────────────────────────────────────────

function ArmazemRow({ arm, isLast, onEdit, onDeleteReq, colors, border }: {
  arm: Armazem; isLast: boolean
  onEdit: () => void; onDeleteReq: () => void
  colors: ReturnType<typeof useTheme>['colors']; border: string
}) {
  const [hovered, setHovered] = useState(false)
  const tipoCor = TIPO_COLORS[arm.tipo]

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '80px 1fr 140px 100px 96px', padding: '12px 16px', borderBottom: isLast ? 'none' : `1px solid ${border}`, background: hovered ? colors.surfaceSubtle : 'transparent', transition: 'background 0.12s', alignItems: 'center' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.bold, color: colors.brand, fontFamily: t.font.family.sans, letterSpacing: '0.02em' }}>
        {arm.sigla}
      </span>
      <span style={{ fontSize: t.font.size.base, color: colors.textPrimary, fontFamily: t.font.family.sans }}>
        {arm.descricao}
      </span>
      <span style={{ display: 'inline-flex' }}>
        <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, fontFamily: t.font.family.sans, padding: '3px 10px', borderRadius: t.radius.full, background: tipoCor.bg, color: tipoCor.text }}>
          {TIPO_ARMAZEM_LABEL[arm.tipo]}
        </span>
      </span>
      <span style={{ display: 'inline-flex' }}>
        <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, fontFamily: t.font.family.sans, padding: '3px 10px', borderRadius: t.radius.full, background: arm.ativo ? t.color.brand[50] : t.color.neutral[100], color: arm.ativo ? t.color.brand[600] : t.color.neutral[500] }}>
          {arm.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </span>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
        <ActionBtn icon={<Pencil size={13} />} label="Editar"  onClick={onEdit}      colors={colors} />
        <ActionBtn icon={<Trash2 size={13} />} label="Excluir" onClick={onDeleteReq} colors={colors} danger />
      </div>
    </div>
  )
}

// ─── ActionBtn ────────────────────────────────────────────────────────────────

function ActionBtn({ icon, label, onClick, colors, danger = false }: {
  icon: React.ReactNode; label: string; onClick: () => void
  colors: ReturnType<typeof useTheme>['colors']; danger?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <button type="button" title={label} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hov ? (danger ? '#fee2e2' : colors.surfaceSubtle) : 'transparent', border: `1px solid ${hov ? (danger ? '#fca5a5' : colors.border) : 'transparent'}`, borderRadius: t.radius.DEFAULT, cursor: 'pointer', color: hov ? (danger ? '#dc2626' : colors.textPrimary) : colors.textMuted, transition: 'background 0.12s, border-color 0.12s, color 0.12s' }}>
      {icon}
    </button>
  )
}

// ─── SearchInput ──────────────────────────────────────────────────────────────

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, height: 34, border: `1.5px solid ${focused ? t.color.brand[600] : colors.border}`, borderRadius: t.radius.DEFAULT, padding: '0 10px', background: colors.surfaceBg, transition: 'border-color 0.15s', minWidth: 240 }}>
      <Search size={13} color={focused ? t.color.brand[600] : colors.textMuted} style={{ flexShrink: 0 }} />
      <input type="search" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: t.font.size.sm, color: colors.textPrimary, fontFamily: t.font.family.sans, minWidth: 0 }} />
      {value && (
        <button type="button" onClick={() => onChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: colors.textMuted }}>
          <X size={11} />
        </button>
      )}
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ onNew, hasSearch }: { onNew: () => void; hasSearch: boolean }) {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12, textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: colors.brandBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Warehouse size={24} color={colors.brand} strokeWidth={1.5} />
      </div>
      <div style={{ fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold, color: colors.textPrimary, fontFamily: t.font.family.sans }}>
        {hasSearch ? 'Nenhum armazém encontrado' : 'Nenhum armazém cadastrado'}
      </div>
      <div style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans }}>
        {hasSearch ? 'Ajuste o filtro de busca.' : 'Comece adicionando o primeiro armazém.'}
      </div>
      {!hasSearch && (
        <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
          Adicionar Armazém
        </Button>
      )}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const { colors } = useTheme()
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: t.zIndex.overlay, padding: 24 }} onClick={onClose}>
      <div style={{ background: colors.surfaceBg, borderRadius: 24, padding: '28px', maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(.94) translateY(10px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>
    </div>
  )
}
