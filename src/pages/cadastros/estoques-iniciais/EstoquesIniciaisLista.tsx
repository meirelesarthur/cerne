import React, { useState, useMemo, useEffect } from 'react'
import {
  Plus, Pencil, Trash2, ChevronUp, ChevronDown,
  Download, Package,
} from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { Button }          from '../../../components/ui/Button'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { ListToolbar } from '../../../components/ui/ListToolbar'
import { Pagination }      from '../../../components/ui/Pagination'
import { Skeleton }        from '../../../components/ui/Skeleton'
import { EmptyState }      from '../../../components/ui/EmptyState'
import { ConfirmDialog }   from '../../../components/ui/ConfirmDialog'
import { IconButton }      from '../../../components/ui/IconButton'
import { t }               from '../../../design/tokens'
import { useTheme }        from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import type { EstoqueInicial } from './estoques-iniciais.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  registros: EstoqueInicial[]
  onNew:    () => void
  onEdit:   (id: number) => void
  onDelete: (id: number) => void
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
  const { toasts, show, dismiss } = useToast()

  const [search,        setSearch]        = useState('')
  const [filterArmazem, setFilterArmazem] = useState('')
  const [drawerOpen,    setDrawerOpen]    = useState(false)
  const [sortDir,       setSortDir]       = useState<'asc' | 'desc'>('desc')
  const [deleteId,      setDeleteId]      = useState<number | null>(null)
  const [page,          setPage]          = useState(1)
  const [isLoading,     setIsLoading]     = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // Reset page quando filtros mudam
  useEffect(() => { setPage(1) }, [search, filterArmazem])

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
      <ListToolbar
        search={search}
        onSearch={v => { setSearch(v); setPage(1) }}
        searchPlaceholder="Buscar produto, código ou armazém..."
        onOpenFilter={() => setDrawerOpen(true)}
        filterCount={activeFilterCount}
        chips={[
          filterArmazem && {
            label: `Armazém: ${armazemOpts.find(o => o.value === filterArmazem)?.label ?? filterArmazem}`,
            onRemove: () => { setFilterArmazem(''); setPage(1) },
          },
        ]}
      />

      {/* Table card */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rect" width="100%" height={48} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          message="Nenhum registro encontrado."
          description="Tente ajustar os filtros ou limpar a busca."
        />
      ) : (
        <>
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

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div style={{
              marginTop: t.space[4],
              paddingTop: t.space[4],
              borderTop: `1px solid ${colors.borderSubtle}`,
            }}>
              <Pagination
                page={safePage}
                total={filtered.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          )}

        </>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Confirmar exclusão"
        message="Esta ação não pode ser desfeita."
        tone="destructive"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

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
        <IconButton icon={<Pencil size={13} />} aria-label="Editar"  tooltip="Editar"  size="xs" onClick={onEdit} />
        <IconButton icon={<Trash2 size={13} />} aria-label="Excluir" tooltip="Excluir" size="xs" danger onClick={onDeleteReq} />
      </div>
    </div>
  )
}

