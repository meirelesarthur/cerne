import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Plus, Pencil, Trash2, Package, X,
  ChevronUp, ChevronDown,
} from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { Button }          from '../../../components/ui/Button'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { TableSearchInput, FilterChip, FilterButton } from '../../../components/ui/TableToolbar'
import { Pagination }      from '../../../components/ui/Pagination'
import { Skeleton }        from '../../../components/ui/Skeleton'
import { EmptyState as EmptyStateUI } from '../../../components/ui/EmptyState'
import { t }               from '../../../design/tokens'
import { useTheme }        from '../../../context/ThemeContext'
import { fmtQtd, UNIDADE_OPTS, type Embalagem } from './embalagens.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  embalagens: Embalagem[]
  onNew:      () => void
  onEdit:     (id: number) => void
  onDelete:   (id: number) => void
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastItem { id: number; message: string; type: 'ok' | 'err' | 'neutral' }

const TOAST_BG: Record<ToastItem['type'], string> = {
  ok:      '#14532d',
  err:     '#dc2626',
  neutral: '#374151',
}

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

// ─── Componente principal ─────────────────────────────────────────────────────

type SortDir = 'asc' | 'desc'

export default function EmbalagemLista({ embalagens, onNew, onEdit, onDelete }: Props) {
  const { colors } = useTheme()
  const { toasts, show, dismiss } = useToast()

  const [search,       setSearch]      = useState('')
  const [filters,      setFilters]     = useState({ unidade: '' })
  const [drawerOpen,   setDrawerOpen]  = useState(false)
  const [sortDir,      setSortDir]     = useState<SortDir>('asc')
  const [deleteTarget, setDeleteTarget] = useState<Embalagem | null>(null)
  const [isLoading,    setIsLoading]   = useState(true)
  const [page,         setPage]        = useState(1)
  const PAGE_SIZE = 10

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // Reset page quando filtros mudam
  useEffect(() => { setPage(1) }, [search, filters.unidade])

  const border  = colors.border
  const activeFilterCount = [filters.unidade].filter(Boolean).length
  const clearFilters = () => setFilters({ unidade: '' })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = embalagens.filter(e => {
      const matchSearch  = !q || e.descricao.toLowerCase().includes(q)
      const matchUnidade = !filters.unidade || e.unidade === filters.unidade
      return matchSearch && matchUnidade
    })
    base.sort((a, b) => {
      const cmp = a.descricao.localeCompare(b.descricao, 'pt-BR')
      return sortDir === 'asc' ? cmp : -cmp
    })
    return base
  }, [embalagens, search, filters, sortDir])

  const totalFiltered = filtered.length
  const paginatedData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    onDelete(deleteTarget.id)
    show(`Embalagem "${deleteTarget.descricao}" excluída.`, 'neutral')
    setDeleteTarget(null)
  }

  // expose show para o pai via callback
  // (o pai não chama diretamente — toasts locais aqui)

  return (
    <PageContainer>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <PageHeader
        title="Embalagens"
        count={embalagens.length}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FilterButton
              active={activeFilterCount > 0}
              count={activeFilterCount}
              onClick={() => setDrawerOpen(true)}
            />
            <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
              Adicionar Embalagem
            </Button>
          </div>
        }
      />

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <TableSearchInput value={search} onChange={setSearch} placeholder="Buscar embalagem..." />
        {filters.unidade && (
          <FilterChip
            label={`Un.: ${UNIDADE_OPTS.find(o => o.value === filters.unidade)?.label.split(' — ')[0] ?? filters.unidade}`}
            onRemove={() => setFilters(f => ({ ...f, unidade: '' }))}
          />
        )}
        <span style={{ marginLeft: 'auto', fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans, whiteSpace: 'nowrap' }}>
          {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {/* ── Tabela ──────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rect" width="100%" height={48} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyStateUI
          message="Nenhuma embalagem encontrada."
          description="Tente ajustar os filtros ou limpar a busca."
        />
      ) : (
        <>
          <div style={{
            background: colors.surfaceBg,
            border: `1px solid ${border}`,
            borderRadius: t.radius.lg,
            overflow: 'hidden',
          }}>
            {/* Cabeçalho */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 140px 160px 96px',
              padding: '10px 16px',
              background: colors.surfaceSubtle,
              borderBottom: `1px solid ${border}`,
            }}>
              {/* Descrição — ordenável */}
              <button
                type="button"
                onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold,
                  color: colors.textMuted, fontFamily: t.font.family.sans,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
              >
                Descrição
                <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <ChevronUp  size={9} style={{ opacity: sortDir === 'asc'  ? 1 : 0.35 }} />
                  <ChevronDown size={9} style={{ opacity: sortDir === 'desc' ? 1 : 0.35 }} />
                </span>
              </button>
              {['Quantidade', 'Un. de Medida', 'Ações'].map((h, i) => (
                <span key={h} style={{
                  fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold,
                  color: colors.textMuted, fontFamily: t.font.family.sans,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  textAlign: i === 2 ? 'right' : 'left',
                }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Linhas */}
            {paginatedData.map((emb, idx) => (
              <EmbalagemRow
                key={emb.id}
                emb={emb}
                isLast={idx === paginatedData.length - 1}
                onEdit={() => onEdit(emb.id)}
                onDeleteReq={() => setDeleteTarget(emb)}
                colors={colors}
                border={border}
              />
            ))}
          </div>

          {totalFiltered > PAGE_SIZE && (
            <div style={{
              marginTop: t.space[4],
              paddingTop: t.space[4],
              borderTop: `1px solid ${colors.borderSubtle}`,
            }}>
              <Pagination
                page={page}
                total={totalFiltered}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {/* Rodapé */}
      {!isLoading && filtered.length > 0 && (
        <div style={{ marginTop: 10, fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
          N. Registros: {filtered.length}
        </div>
      )}

      {/* ── Modal: Confirmar exclusão ────────────────────────────────────────── */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '4px 0' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trash2 size={22} color="#dc2626" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold,
                color: colors.textPrimary, fontFamily: t.font.family.sans, marginBottom: 8,
              }}>
                Excluir embalagem?
              </div>
              <p style={{
                fontSize: t.font.size.sm, color: colors.textSecondary,
                fontFamily: t.font.family.sans, lineHeight: 1.6, margin: 0,
              }}>
                <strong style={{ color: colors.textPrimary }}>{deleteTarget.descricao}</strong>{' '}
                será excluída permanentemente. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
              <Button variant="secondary" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                style={{ flex: 1 }}
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={13} />
                Excluir
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Toasts ──────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 72, right: 24,
        display: 'flex', flexDirection: 'column', gap: 8,
        zIndex: t.zIndex.toast, pointerEvents: 'none',
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              background: TOAST_BG[toast.type], color: 'white',
              padding: '11px 18px', borderRadius: t.radius.lg,
              fontSize: t.font.size.base, fontWeight: t.font.weight.medium,
              fontFamily: t.font.family.sans, boxShadow: t.shadow.lg,
              display: 'flex', alignItems: 'center', gap: 10,
              pointerEvents: 'auto',
              animation: 'toastIn 0.22s ease',
            }}
          >
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 0, display: 'flex' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(16px) } to { opacity:1; transform:translateX(0) } }`}</style>

      {/* Filter Drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clearFilters}
        title="Filtrar Embalagens"
        activeCount={activeFilterCount}
      >
        <FormSelect
          label="Unidade de Medida"
          options={[
            { value: '', label: 'Todas' },
            ...UNIDADE_OPTS.map(o => ({ value: o.value, label: o.label })),
          ]}
          value={filters.unidade}
          onChange={e => setFilters(f => ({ ...f, unidade: e.target.value }))}
        />
      </FilterDrawer>

    </PageContainer>
  )
}

// ─── Linha da tabela ──────────────────────────────────────────────────────────

function EmbalagemRow({
  emb, isLast, onEdit, onDeleteReq, colors, border,
}: {
  emb:         Embalagem
  isLast:      boolean
  onEdit:      () => void
  onDeleteReq: () => void
  colors:      ReturnType<typeof useTheme>['colors']
  border:      string
}) {
  const [hovered, setHovered] = useState(false)
  const unidadeLabel = UNIDADE_OPTS.find(o => o.value === emb.unidade)?.label.split(' — ')[0] ?? emb.unidade

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 140px 160px 96px',
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : `1px solid ${border}`,
        background: hovered ? colors.surfaceSubtle : 'transparent',
        transition: 'background 0.12s',
        alignItems: 'center',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{
        fontSize: t.font.size.base, fontWeight: t.font.weight.semibold,
        color: colors.brand, fontFamily: t.font.family.sans,
      }}>
        {emb.descricao}
      </span>

      <span style={{
        fontSize: t.font.size.sm, color: colors.textSecondary,
        fontFamily: t.font.family.sans, fontVariantNumeric: 'tabular-nums',
      }}>
        {fmtQtd(emb.quantidade)}
      </span>

      <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans }}>
        {unidadeLabel}
      </span>

      {/* Ações inline */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
        <ActionBtn icon={<Pencil size={13} />} label="Editar"  onClick={onEdit}      colors={colors} />
        <ActionBtn icon={<Trash2 size={13} />} label="Excluir" onClick={onDeleteReq} colors={colors} danger />
      </div>
    </div>
  )
}

function ActionBtn({
  icon, label, onClick, colors, danger = false,
}: {
  icon:    React.ReactNode
  label:   string
  onClick: () => void
  colors:  ReturnType<typeof useTheme>['colors']
  danger?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hov ? (danger ? '#fee2e2' : colors.surfaceSubtle) : 'transparent',
        border: `1px solid ${hov ? (danger ? '#fca5a5' : colors.border) : 'transparent'}`,
        borderRadius: t.radius.DEFAULT,
        cursor: 'pointer',
        color: hov ? (danger ? '#dc2626' : colors.textPrimary) : colors.textMuted,
        transition: 'background 0.12s, border-color 0.12s, color 0.12s',
      }}
    >
      {icon}
    </button>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ onNew, hasSearch }: { onNew: () => void; hasSearch: boolean }) {
  const { colors } = useTheme()
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 20px', gap: 12, textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, background: colors.brandBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Package size={24} color={colors.brand} strokeWidth={1.5} />
      </div>
      <div style={{ fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold, color: colors.textPrimary, fontFamily: t.font.family.sans }}>
        {hasSearch ? 'Nenhuma embalagem encontrada' : 'Nenhuma embalagem cadastrada'}
      </div>
      <div style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans }}>
        {hasSearch ? 'Ajuste o filtro de busca ou' : 'Comece adicionando sua primeira embalagem.'}
      </div>
      {!hasSearch && (
        <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
          Adicionar Embalagem
        </Button>
      )}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const { colors } = useTheme()
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: t.zIndex.overlay, padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.surfaceBg, borderRadius: 24, padding: '28px',
          maxWidth: 420, width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(.94) translateY(10px) } to { opacity:1; transform:scale(1) translateY(0) } }
      `}</style>
    </div>
  )
}
