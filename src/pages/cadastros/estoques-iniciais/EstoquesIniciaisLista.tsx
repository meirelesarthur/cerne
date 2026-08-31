import { useState, useMemo, useEffect } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { PageCard }         from '../../../components/ui/PageCard'
import { Button }          from '../../../components/ui/Button'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { ListToolbar } from '../../../components/ui/ListToolbar'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { Pagination }      from '../../../components/ui/Pagination'
import { Skeleton }        from '../../../components/ui/Skeleton'
import { EmptyState }      from '../../../components/ui/EmptyState'
import { ConfirmDialog }   from '../../../components/ui/ConfirmDialog'
import { IconButton }      from '../../../components/ui/IconButton'
import { t }               from '../../../design/tokens'
import { useTheme }        from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import type { EstoqueInicial } from './estoques-iniciais.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  registros: EstoqueInicial[]
  onNew:    () => void
  onView:   (id: number) => void
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

export default function EstoquesIniciaisLista({ registros, onNew, onView, onEdit, onDelete }: Props) {
  const { colors } = useTheme()
  const { toasts, show, dismiss } = useToast()

  const [searchRaw,     setSearchRaw]     = useState('')
  const search = useDebouncedValue(searchRaw, 300)
  const [filterArmazem, setFilterArmazem] = useState('')
  const [drawerOpen,    setDrawerOpen]    = useState(false)
  const [sortDir,       setSortDir]       = useState<'asc' | 'desc'>('desc')
  const [deleteId,      setDeleteId]      = useState<number | null>(null)
  const [page,          setPage]          = useState(1)
  // Mock síncrono — sem chamada real, não há motivo para simular loading.
  const [isLoading]     = useState(false)

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

  const columns: Column<EstoqueInicial>[] = [
    {
      key: 'produto',
      label: 'PRODUTO',
      sortable: false,
      render: (r) => (
        <div title={`${r.produtoCodigo} ${r.produtoDescricao}`} style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: t.font.size.sm, color: colors.fg.default, fontFamily: t.font.family.sans, fontWeight: t.font.weight.medium }}>
            {r.produtoCodigo}
          </span>
          <span style={{ fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans, marginLeft: 6 }}>
            {r.produtoDescricao}
          </span>
        </div>
      ),
    },
    {
      key: 'unidade',
      label: 'UN.',
      width: 56,
      sortable: false,
      render: (r) => r.unidade,
    },
    {
      key: 'armazem',
      label: 'ARMAZÉM',
      sortable: false,
      render: (r) => r.armazemDescricao,
    },
    {
      key: 'qtde',
      label: 'QTDE.',
      align: 'right',
      width: 110,
      sortable: false,
      render: (r) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtQtde(r.qtdeTotal)}</span>
      ),
    },
    {
      key: 'vlUnitario',
      label: 'VL. UNIT.',
      align: 'right',
      width: 110,
      sortable: false,
      render: (r) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtUnit(r.vlUnitario)}</span>
      ),
    },
    {
      key: 'valorTotal',
      label: 'VALOR TOTAL',
      align: 'right',
      width: 110,
      sortable: false,
      render: (r) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: t.font.weight.semibold, color: colors.fg.default }}>
          {fmtTotal(r.valorTotal)}
        </span>
      ),
    },
    {
      key: 'dtMovimento',
      label: 'DT. MOVIMENTO',
      width: 130,
      sortable: true,
      render: (r) => fmtDate(r.dtMovimento),
    },
    {
      key: 'lote',
      label: 'LOTE',
      width: 110,
      sortable: false,
      render: (r) => (
        <span style={{ color: r.loteFornecedor ? colors.fg.default : colors.fg.subtle }}>
          {r.loteFornecedor || '—'}
        </span>
      ),
    },
    {
      key: 'acoes',
      label: 'AÇÕES',
      align: 'right',
      width: 96,
      sortable: false,
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }} onClick={e => e.stopPropagation()}>
          <IconButton icon={<Icon name="edit" size={13} />} aria-label="Editar"  tooltip="Editar"  size="xs" onClick={() => onEdit(r.id)} />
          <IconButton icon={<Icon name="delete" size={13} />} aria-label="Excluir" tooltip="Excluir" size="xs" danger onClick={() => setDeleteId(r.id)} />
        </div>
      ),
    },
  ]

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      <PageCard>

        <PageHeader
          title="Saldo Inicial de Estoque"
          count={registros.length}
          actions={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="md" icon={<Icon name="download" size={14} />} disabled title="Em breve">
                Exportar
              </Button>
              <Button variant="primary" size="md" icon={<Icon name="add" size={14} />} onClick={onNew}>
                Adicionar
              </Button>
            </div>
          }
        />

        {/* Summary bar */}
        <div style={{
          background: colors.bg.subtle,
          padding: t.space[3],
          borderRadius: t.radius.lg,
          fontSize: t.font.size.xs,
          color: colors.fg.subtle,
          fontFamily: t.font.family.sans,
          marginBottom: 12,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}>
          <Icon name="package" size={12} color={colors.accent.default} />
          <span>
            <strong style={{ color: colors.fg.default }}>{registros.length}</strong> registros · {' '}
            <strong style={{ color: colors.fg.default }}>{uniqueArmazens}</strong> armazéns · Última entrada: {' '}
            <strong style={{ color: colors.fg.default }}>{lastEntry}</strong>
          </span>
        </div>

        {/* Filter bar */}
        <ListToolbar
          search={searchRaw}
          onSearch={v => { setSearchRaw(v); setPage(1) }}
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
          (() => {
            const hasSearch = search.trim().length > 0 || activeFilterCount > 0
            return (
              <EmptyState
                message={hasSearch ? 'Nenhum registro encontrado.' : 'Nenhum saldo inicial cadastrado.'}
                description={hasSearch ? 'Tente ajustar os filtros ou limpar a busca.' : 'Comece adicionando o primeiro saldo inicial.'}
                action={hasSearch ? undefined : { label: 'Adicionar', onClick: onNew }}
              />
            )
          })()
        ) : (
          <DataTable
            columns={columns}
            data={pageSlice}
            keyField="id"
            onRowClick={(row) => onView(row.id)}
            sortColumn="dtMovimento"
            sortDirection={sortDir}
            onSortChange={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            pagination={
              <Pagination
                page={safePage}
                total={filtered.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            }
          />
        )}

      </PageCard>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Confirmar exclusão"
        message={(() => {
          const r = registros.find(x => x.id === deleteId)
          return r
            ? `${r.produtoDescricao} — ${r.armazemDescricao} será excluído permanentemente. Esta ação não pode ser desfeita.`
            : 'Esta ação não pode ser desfeita.'
        })()}
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

