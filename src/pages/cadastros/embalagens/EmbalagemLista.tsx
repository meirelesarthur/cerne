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
import { EmptyState as EmptyStateUI } from '../../../components/ui/EmptyState'
import { ConfirmDialog }   from '../../../components/ui/ConfirmDialog'
import { IconButton }      from '../../../components/ui/IconButton'
import { t }               from '../../../design/tokens'
import { useTheme }        from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { fmtQtd, UNIDADE_OPTS, type Embalagem } from './embalagens.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  embalagens: Embalagem[]
  onNew:      () => void
  onView:     (id: number) => void
  onEdit:     (id: number) => void
  onDelete:   (id: number) => void
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EmbalagemLista({ embalagens, onNew, onView, onEdit, onDelete }: Props) {
  const { colors } = useTheme()
  const { toasts, show, dismiss } = useToast()

  const [searchRaw,    setSearchRaw]   = useState('')
  const search = useDebouncedValue(searchRaw, 300)
  const [filters,      setFilters]     = useState({ unidade: '' })
  const [drawerOpen,   setDrawerOpen]  = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Embalagem | null>(null)
  // Mock síncrono — sem chamada real, não há motivo para simular loading.
  const [isLoading]   = useState(false)
  const [page,         setPage]        = useState(1)
  const PAGE_SIZE = 10


  // Reset page quando filtros mudam
  useEffect(() => { setPage(1) }, [search, filters.unidade])

  const activeFilterCount = [filters.unidade].filter(Boolean).length
  const clearFilters = () => setFilters({ unidade: '' })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = embalagens.filter(e => {
      const unidadeLabel = UNIDADE_OPTS.find(o => o.value === e.unidade)?.label ?? ''
      const matchSearch  = !q || e.descricao.toLowerCase().includes(q) || unidadeLabel.toLowerCase().includes(q)
      const matchUnidade = !filters.unidade || e.unidade === filters.unidade
      return matchSearch && matchUnidade
    })
    base.sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR'))
    return base
  }, [embalagens, search, filters])

  const totalFiltered = filtered.length
  const paginatedData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    onDelete(deleteTarget.id)
    show(`Embalagem "${deleteTarget.descricao}" excluída.`, 'info')
    setDeleteTarget(null)
  }

  const columns: Column<Embalagem>[] = [
    {
      key: 'descricao',
      label: 'DESCRIÇÃO',
      sortable: false,
      render: (emb) => (
        <span
          title={emb.descricao}
          style={{ fontWeight: t.font.weight.semibold, color: colors.accent.default, fontFamily: t.font.family.sans }}
        >
          {emb.descricao}
        </span>
      ),
    },
    {
      key: 'quantidade',
      label: 'QUANTIDADE',
      width: 140,
      sortable: false,
      render: (emb) => (
        <span title={fmtQtd(emb.quantidade)} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {fmtQtd(emb.quantidade)}
        </span>
      ),
    },
    {
      key: 'unidade',
      label: 'UN. DE MEDIDA',
      width: 160,
      sortable: false,
      render: (emb) => {
        const label = UNIDADE_OPTS.find(o => o.value === emb.unidade)?.label.split(' — ')[0] ?? emb.unidade
        return <span title={label}>{label}</span>
      },
    },
    {
      key: 'acoes',
      label: 'AÇÕES',
      align: 'right',
      width: 96,
      sortable: false,
      render: (emb) => (
        <div onClick={ev => ev.stopPropagation()} style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <IconButton icon={<Icon name="edit" size={13} />} aria-label="Editar"  size="xs" onClick={() => onEdit(emb.id)} />
          <IconButton icon={<Icon name="delete" size={13} />} aria-label="Excluir" size="xs" danger onClick={() => setDeleteTarget(emb)} />
        </div>
      ),
    },
  ]

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      <PageCard>

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <PageHeader
          title="Embalagens"
          count={embalagens.length}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button variant="primary" size="md" icon={<Icon name="add" size={14} />} onClick={onNew}>
                Adicionar Embalagem
              </Button>
            </div>
          }
        />

        {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
        <ListToolbar
          search={searchRaw}
          onSearch={setSearchRaw}
          searchPlaceholder="Buscar embalagem..."
          onOpenFilter={() => setDrawerOpen(true)}
          filterCount={activeFilterCount}
          chips={[
            filters.unidade && {
              label: `Un.: ${UNIDADE_OPTS.find(o => o.value === filters.unidade)?.label.split(' — ')[0] ?? filters.unidade}`,
              onRemove: () => setFilters(f => ({ ...f, unidade: '' })),
            },
          ]}
        />

        {/* ── Tabela ──────────────────────────────────────────────────────────── */}
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
              <EmptyStateUI
                message={hasSearch ? 'Nenhuma embalagem encontrada.' : 'Nenhuma embalagem cadastrada.'}
                description={hasSearch ? 'Tente ajustar os filtros ou limpar a busca.' : 'Comece adicionando a primeira embalagem.'}
                action={hasSearch ? undefined : { label: 'Adicionar Embalagem', onClick: onNew }}
              />
            )
          })()
        ) : (
          <DataTable
            columns={columns}
            data={paginatedData}
            keyField="id"
            onRowClick={(row) => onView(row.id)}
            pagination={
              <Pagination
                page={page}
                total={totalFiltered}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            }
          />
        )}

      </PageCard>

      {/* ── ConfirmDialog: Confirmar exclusão ───────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        tone="destructive"
        title="Excluir embalagem?"
        message={
          deleteTarget
            ? `"${deleteTarget.descricao}" será excluída permanentemente. Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

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

