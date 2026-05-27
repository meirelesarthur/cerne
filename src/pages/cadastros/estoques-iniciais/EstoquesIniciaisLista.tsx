import React, { useState, useMemo } from 'react'
import {
  Plus, Pencil, Trash2, X, ChevronUp,
  ChevronLeft, ChevronRight, Download, Package,
} from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { Button }          from '../../../components/ui/Button'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { TableSearchInput, FilterChip, FilterButton } from '../../../components/ui/TableToolbar'
import { t }               from '../../../design/tokens'
import { useTheme }        from '../../../context/ThemeContext'
import type { EstoqueInicial } from './estoques-iniciais.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  registros: EstoqueInicial[]
  onNew:    () => void
  onEdit:   (id: number) => void
  onDelete: (id: number) => void
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast { id: number; message: string; type: 'success' | 'error' }

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const show = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }
  return { toasts, show }
}

// ─── ToastList ────────────────────────────────────────────────────────────────

function ToastList({ toasts }: { toasts: Toast[] }) {
  return (
    <div style={{ position: 'fixed', top: 72, right: 24, display: 'flex', flexDirection: 'column', gap: 8, zIndex: t.zIndex.toast, pointerEvents: 'none' }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            background: toast.type === 'success' ? '#14532d' : '#dc2626',
            color: 'white',
            padding: '11px 18px',
            borderRadius: t.radius.lg,
            fontSize: t.font.size.base,
            fontWeight: t.font.weight.medium,
            fontFamily: t.font.family.sans,
            boxShadow: t.shadow.lg,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            pointerEvents: 'auto',
            animation: 'toastIn 0.22s ease',
          }}
        >
          {toast.message}
        </div>
      ))}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(16px) } to { opacity:1; transform:translateX(0) } }`}</style>
    </div>
  )
}

// ─── Modal (delete confirmation) ──────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const { colors } = useTheme()
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: t.zIndex.overlay, padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ background: colors.surfaceBg, borderRadius: 24, padding: '28px', maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(.94) translateY(10px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>
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

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function fmtQtde(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}

function fmtUnit(v: number): string {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
}

function fmtTotal(v: number): string {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Componente principal ─────────────────────────────────────────────────────

const PAGE_SIZE = 10

export default function EstoquesIniciaisLista({ registros, onNew, onEdit, onDelete }: Props) {
  const { colors } = useTheme()
  const { toasts, show } = useToast()

  const [search,        setSearch]        = useState('')
  const [filterArmazem, setFilterArmazem] = useState('')
  const [drawerOpen,    setDrawerOpen]    = useState(false)
  const [sortDir,       setSortDir]       = useState<'asc' | 'desc'>('desc')
  const [deleteId,      setDeleteId]      = useState<number | null>(null)
  const [page,          setPage]          = useState(1)

  const activeFilterCount = filterArmazem !== '' ? 1 : 0
  const clearFilters = () => { setFilterArmazem(''); setPage(1) }

  // Armazém options
  const armazemOpts = useMemo(() => {
    const map = new Map<number, string>()
    registros.forEach(r => map.set(r.armazemId, r.armazemDescricao))
    return Array.from(map.entries()).map(([id, desc]) => ({ value: String(id), label: desc }))
  }, [registros])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let base = registros.filter(r => {
      const matchSearch = !q || r.produtoDescricao.toLowerCase().includes(q) || r.produtoCodigo.toLowerCase().includes(q) || r.armazemDescricao.toLowerCase().includes(q)
      const matchArmazem = !filterArmazem || r.armazemId === Number(filterArmazem)
      return matchSearch && matchArmazem
    })
    base = [...base].sort((a, b) => {
      const cmp = a.dtMovimento.localeCompare(b.dtMovimento)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return base
  }, [registros, search, filterArmazem, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const pageSlice  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleDeleteConfirm = () => {
    if (deleteId === null) return
    onDelete(deleteId)
    show('Registro excluído com sucesso.')
    setDeleteId(null)
  }

  // Summary bar data
  const uniqueArmazens = useMemo(() => new Set(registros.map(r => r.armazemId)).size, [registros])
  const lastEntry = useMemo(() => {
    if (registros.length === 0) return '—'
    const sorted = [...registros].sort((a, b) => b.dtMovimento.localeCompare(a.dtMovimento))
    return fmtDate(sorted[0].dtMovimento)
  }, [registros])

  const border = colors.border

  const colTemplate = '2fr 56px 1.6fr 110px 110px 110px 130px 110px 96px'

  const colStyle: React.CSSProperties = {
    fontSize: t.font.size.xs,
    fontWeight: t.font.weight.semibold,
    color: colors.textMuted,
    fontFamily: t.font.family.sans,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  return (
    <PageContainer>

      <PageHeader
        title="Saldo Inicial de Estoque"
        count={registros.length}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="md" icon={<Download size={14} />}>
              Exportar
            </Button>
            <FilterButton
              active={activeFilterCount > 0}
              count={activeFilterCount}
              onClick={() => setDrawerOpen(true)}
            />
            <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
              Adicionar
            </Button>
          </div>
        }
      />

      {/* Summary bar */}
      <div style={{
        background: colors.surfaceSubtle,
        padding: t.space[3],
        borderRadius: t.radius.lg,
        fontSize: t.font.size.xs,
        color: colors.textMuted,
        fontFamily: t.font.family.sans,
        marginBottom: 12,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}>
        <Package size={12} color={colors.brand} />
        <span>
          <strong style={{ color: colors.textPrimary }}>{registros.length}</strong> registros · {' '}
          <strong style={{ color: colors.textPrimary }}>{uniqueArmazens}</strong> armazéns · Última entrada: {' '}
          <strong style={{ color: colors.textPrimary }}>{lastEntry}</strong>
        </span>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <TableSearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Buscar produto, código..." />
        {filterArmazem && (
          <FilterChip
            label={`Armazém: ${armazemOpts.find(o => o.value === filterArmazem)?.label ?? filterArmazem}`}
            onRemove={() => { setFilterArmazem(''); setPage(1) }}
          />
        )}
        <span style={{ marginLeft: 'auto', fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans, whiteSpace: 'nowrap' }}>
          {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {/* Table card */}
      {filtered.length === 0 ? (
        <EmptyState hasSearch={hasFilters} onNew={onNew} colors={colors} />
      ) : (
        <div style={{ background: colors.surfaceBg, border: `1px solid ${border}`, borderRadius: t.radius.lg, overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: colTemplate, padding: '10px 16px', background: colors.surfaceSubtle, borderBottom: `1px solid ${border}`, alignItems: 'center', gap: 8 }}>
            <span style={colStyle}>Produto</span>
            <span style={colStyle}>Un.</span>
            <span style={colStyle}>Armazém</span>
            <span style={{ ...colStyle, textAlign: 'right' }}>Qtde.</span>
            <span style={{ ...colStyle, textAlign: 'right' }}>Vl. Unit.</span>
            <span style={{ ...colStyle, textAlign: 'right' }}>Valor Total</span>
            <button
              type="button"
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              style={{ ...colStyle, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 3, textAlign: 'left' as const }}
            >
              Dt. Movimento
              <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <ChevronUp  size={9} style={{ opacity: sortDir === 'asc'  ? 1 : 0.3 }} />
                <ChevronDown size={9} style={{ opacity: sortDir === 'desc' ? 1 : 0.3 }} />
              </span>
            </button>
            <span style={colStyle}>Lote</span>
            <span style={{ ...colStyle, textAlign: 'right' }}>Ações</span>
          </div>

          {/* Rows */}
          {pageSlice.map((r, idx) => (
            <TableRow
              key={r.id}
              registro={r}
              isLast={idx === pageSlice.length - 1}
              onEdit={() => onEdit(r.id)}
              onDeleteReq={() => setDeleteId(r.id)}
              colors={colors}
              border={border}
              colTemplate={colTemplate}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
          <span>{filtered.length} registros</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: `1px solid ${colors.border}`, borderRadius: t.radius.DEFAULT, cursor: safePage === 1 ? 'not-allowed' : 'pointer', color: safePage === 1 ? colors.textMuted : colors.textPrimary, opacity: safePage === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={13} />
            </button>
            <span style={{ color: colors.textPrimary, fontWeight: t.font.weight.medium }}>
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: `1px solid ${colors.border}`, borderRadius: t.radius.DEFAULT, cursor: safePage === totalPages ? 'not-allowed' : 'pointer', color: safePage === totalPages ? colors.textMuted : colors.textPrimary, opacity: safePage === totalPages ? 0.4 : 1 }}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {filtered.length > 0 && filtered.length <= PAGE_SIZE && (
        <div style={{ marginTop: 10, fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
          {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
        </div>
      )}

      {/* Delete modal */}
      {deleteId !== null && (
        <Modal onClose={() => setDeleteId(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '4px 0' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={22} color="#dc2626" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold, color: colors.textPrimary, fontFamily: t.font.family.sans, marginBottom: 8 }}>
                Confirmar exclusão
              </div>
              <p style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans, lineHeight: 1.6, margin: 0 }}>
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
              <Button variant="secondary" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="destructive" style={{ flex: 1 }} onClick={handleDeleteConfirm}>
                <Trash2 size={13} /> Excluir
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <ToastList toasts={toasts} />

      {/* Filter Drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clearFilters}
        title="Filtrar Saldo Inicial"
        activeCount={activeFilterCount}
      >
        <FormSelect
          label="Armazém"
          options={[
            { value: '', label: 'Todos os armazéns' },
            ...armazemOpts,
          ]}
          value={filterArmazem}
          onChange={e => { setFilterArmazem(e.target.value); setPage(1) }}
        />
      </FilterDrawer>

    </PageContainer>
  )
}

// ─── TableRow ─────────────────────────────────────────────────────────────────

function TableRow({ registro, isLast, onEdit, onDeleteReq, colors, border, colTemplate }: {
  registro: EstoqueInicial
  isLast: boolean
  onEdit: () => void
  onDeleteReq: () => void
  colors: ReturnType<typeof useTheme>['colors']
  border: string
  colTemplate: string
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: colTemplate,
        padding: '11px 16px',
        borderBottom: isLast ? 'none' : `1px solid ${border}`,
        background: hovered ? colors.surfaceSubtle : 'transparent',
        transition: 'background 0.12s',
        alignItems: 'center',
        gap: 8,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Produto */}
      <div title={registro.produtoDescricao} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
        <span style={{ fontSize: t.font.size.sm, color: colors.textPrimary, fontFamily: t.font.family.sans, fontWeight: t.font.weight.medium }}>
          {registro.produtoCodigo}
        </span>
        <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans, marginLeft: 6 }}>
          {registro.produtoDescricao}
        </span>
      </div>

      {/* Un. */}
      <span style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans }}>
        {registro.unidade}
      </span>

      {/* Armazém */}
      <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {registro.armazemDescricao}
      </span>

      {/* Qtde. */}
      <span style={{ fontSize: t.font.size.sm, color: colors.textPrimary, fontFamily: t.font.family.sans, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {fmtQtde(registro.qtdeTotal)}
      </span>

      {/* Vl. Unit. */}
      <span style={{ fontSize: t.font.size.sm, color: colors.textPrimary, fontFamily: t.font.family.sans, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {fmtUnit(registro.vlUnitario)}
      </span>

      {/* Valor Total */}
      <span style={{ fontSize: t.font.size.sm, color: colors.textPrimary, fontFamily: t.font.family.sans, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: t.font.weight.semibold }}>
        {fmtTotal(registro.valorTotal)}
      </span>

      {/* Dt. Movimento */}
      <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans }}>
        {fmtDate(registro.dtMovimento)}
      </span>

      {/* Lote */}
      <span style={{ fontSize: t.font.size.sm, color: registro.loteFornecedor ? colors.textPrimary : colors.textMuted, fontFamily: t.font.family.sans }}>
        {registro.loteFornecedor || '—'}
      </span>

      {/* Ações */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
        <ActionBtn icon={<Pencil size={13} />} label="Editar"  onClick={onEdit}      colors={colors} />
        <ActionBtn icon={<Trash2 size={13} />} label="Excluir" onClick={onDeleteReq} colors={colors} danger />
      </div>
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ hasSearch, onNew, colors }: { hasSearch: boolean; onNew: () => void; colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12, textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: colors.brandBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Package size={24} color={colors.brand} strokeWidth={1.5} />
      </div>
      <div style={{ fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold, color: colors.textPrimary, fontFamily: t.font.family.sans }}>
        {hasSearch ? 'Nenhum registro encontrado' : 'Nenhum saldo inicial cadastrado'}
      </div>
      <div style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans }}>
        {hasSearch ? 'Ajuste os filtros de busca.' : 'Comece adicionando o primeiro saldo inicial.'}
      </div>
      {!hasSearch && (
        <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
          Adicionar
        </Button>
      )}
    </div>
  )
}
