import { useState, useMemo, useEffect } from 'react'
import {
  Plus, Pencil, Trash2, Package, Eye,
  Download,
} from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { PageCard }         from '../../../components/ui/PageCard'
import { Button }          from '../../../components/ui/Button'
import { IconButton }      from '../../../components/ui/IconButton'
import { Checkbox }        from '../../../components/ui/Checkbox'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { BulkActionBar }   from '../../../components/ui/BulkActionBar'
import { EmptyState }      from '../../../components/ui/EmptyState'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { ListToolbar } from '../../../components/ui/ListToolbar'
import { Pagination }      from '../../../components/ui/Pagination'
import { ConfirmDialog }   from '../../../components/ui/ConfirmDialog'
import { Skeleton }        from '../../../components/ui/Skeleton'
import { t }               from '../../../design/tokens'
import { useTheme }        from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import {
  GRUPOS, CATEGORIAS, CLASSES,
  TIPO_PRODUTO_LABEL, TIPO_PRODUTO_OPTS,
  type Produto, type TipoProduto,
} from './produtos.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  produtos:         Produto[]
  isLoading?:       boolean
  onNew:            () => void
  onView:           (id: number) => void
  onEdit:           (id: number) => void
  onDelete:         (id: number) => void
  onBulkActivate:   (ids: number[]) => void
  onBulkDeactivate: (ids: number[]) => void
  onBulkDelete:     (ids: number[]) => void
}

// ─── Badge helpers ────────────────────────────────────────────────────────────

const TIPO_COLORS: Record<TipoProduto, { bg: string; text: string }> = {
  insumo:     { bg: t.color.brand[50],   text: t.color.brand[600] },
  producao:   { bg: t.color.feedback.info.bg,     text: t.color.feedback.info.text },
  subproduto: { bg: t.color.feedback.warning.bg,  text: t.color.feedback.warning.text },
  servico:    { bg: t.color.neutral[100], text: t.color.neutral[600] },
}

type SortField = 'codigo' | 'descricao'
type SortDir   = 'asc' | 'desc'

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ProdutosLista({
  produtos, isLoading = false, onNew, onView, onEdit, onDelete,
  onBulkActivate, onBulkDeactivate, onBulkDelete,
}: Props) {
  const { colors } = useTheme()
  const { toasts, show, dismiss } = useToast()

  // ── Filtros ──────────────────────────────────────────────────────────────────
  const [searchRaw,    setSearchRaw]    = useState('')
  const [search,       setSearch]       = useState('')
  const [grupoFilter,  setGrupoFilter]  = useState<string>('')
  const [catFilter,    setCatFilter]    = useState<string>('')
  const [classeFilter, setClasseFilter] = useState<string>('')
  const [tipoFilter,   setTipoFilter]   = useState<string>('')
  const [ativoFilter,  setAtivoFilter]  = useState<string>('')
  const [drawerOpen,   setDrawerOpen]   = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchRaw), 300)
    return () => clearTimeout(timer)
  }, [searchRaw])

  // Cascade: reset cat when grupo changes
  useEffect(() => { setCatFilter(''); setClasseFilter('') }, [grupoFilter])
  useEffect(() => { setClasseFilter('') }, [catFilter])

  // ── Ordenação e paginação ────────────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>('codigo')
  const [sortDir,   setSortDir]   = useState<SortDir>('asc')
  const [page,      setPage]      = useState(1)
  const [pageSize,  setPageSize]  = useState(10)

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  // ── Seleção ──────────────────────────────────────────────────────────────────
  const [selected,     setSelected]     = useState(new Set<number>())
  const [deleteTarget, setDeleteTarget] = useState<Produto | null>(null)

  const activeFilterCount = [grupoFilter, catFilter, classeFilter, tipoFilter, ativoFilter].filter(Boolean).length
  const clearFilters = () => {
    setGrupoFilter(''); setCatFilter(''); setClasseFilter(''); setTipoFilter(''); setAtivoFilter('')
  }

  // ── Opções filtradas em cascata ──────────────────────────────────────────────
  const catOpts    = useMemo(() => CATEGORIAS.filter(c => !grupoFilter  || c.grupoId    === Number(grupoFilter)), [grupoFilter])
  const classeOpts = useMemo(() => CLASSES.filter(c   => !catFilter     || c.categoriaId === Number(catFilter)), [catFilter])

  // ── Dados filtrados ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = [...produtos]
    if (q)           list = list.filter(p => {
      const grupoNome = GRUPOS.find(g => g.id === p.grupoId)?.nome ?? ''
      const tipoLabel = TIPO_PRODUTO_LABEL[p.tipo] ?? ''
      const status    = p.ativo ? 'ativo' : 'inativo'
      return p.descricao.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || grupoNome.toLowerCase().includes(q) || tipoLabel.toLowerCase().includes(q) || status.includes(q)
    })
    if (grupoFilter) list = list.filter(p => p.grupoId === Number(grupoFilter))
    if (catFilter)   list = list.filter(p => p.categoriaId === Number(catFilter))
    if (classeFilter)list = list.filter(p => p.classeId === Number(classeFilter))
    if (tipoFilter)  list = list.filter(p => p.tipo === tipoFilter)
    if (ativoFilter) list = list.filter(p => String(p.ativo) === ativoFilter)
    list.sort((a, b) => {
      const cmp = a[sortField].localeCompare(b[sortField], 'pt-BR')
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [produtos, search, grupoFilter, catFilter, classeFilter, tipoFilter, ativoFilter, sortField, sortDir])

  // Reset page on filter change
  useEffect(() => setPage(1), [search, grupoFilter, catFilter, classeFilter, tipoFilter, ativoFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize)

  const isAllSelected     = paginated.length > 0 && paginated.every(p => selected.has(p.id))
  const isPartialSelected = paginated.some(p => selected.has(p.id)) && !isAllSelected

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const next = new Set(selected)
      paginated.forEach(p => next.delete(p.id))
      setSelected(next)
    } else {
      const next = new Set(selected)
      paginated.forEach(p => next.add(p.id))
      setSelected(next)
    }
  }

  const toggleOne = (id: number) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    onDelete(deleteTarget.id)
    setSelected(prev => { const n = new Set(prev); n.delete(deleteTarget.id); return n })
    show(`"${deleteTarget.descricao}" excluído.`, 'info')
    setDeleteTarget(null)
  }

  const handleBulkActivate = () => {
    const ids = [...selected]
    onBulkActivate(ids)
    show(`${ids.length} produto(s) ativado(s).`, 'success')
    setSelected(new Set())
  }

  const handleBulkDeactivate = () => {
    const ids = [...selected]
    onBulkDeactivate(ids)
    show(`${ids.length} produto(s) inativado(s).`, 'info')
    setSelected(new Set())
  }

  const handleBulkDelete = () => {
    const ids = [...selected]
    onBulkDelete(ids)
    show(`${ids.length} produto(s) excluído(s).`, 'info')
    setSelected(new Set())
  }

  // ── Colunas da tabela ────────────────────────────────────────────────────────
  const columns: Column<Produto>[] = [
    {
      key: 'select',
      label: (
        <Checkbox
          checked={isAllSelected}
          indeterminate={isPartialSelected}
          onChange={toggleSelectAll}
          aria-label="Selecionar todos os produtos"
        />
      ),
      width: 40,
      align: 'center',
      sortable: false,
      render: prod => (
        <div onClick={e => e.stopPropagation()} style={{ display: 'flex', justifyContent: 'center' }}>
          <Checkbox checked={selected.has(prod.id)} onChange={() => toggleOne(prod.id)} aria-label={`Selecionar ${prod.descricao}`} />
        </div>
      ),
    },
    {
      key: 'codigo',
      label: 'Código',
      width: 100,
      render: prod => (
        <span title={prod.codigo} style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.bold, color: colors.fg.muted, fontFamily: t.font.family.sans, letterSpacing: '0.05em' }}>
          {prod.codigo}
        </span>
      ),
    },
    {
      key: 'descricao',
      label: 'Descrição',
      render: prod => prod.descricao,
    },
    {
      key: 'grupo',
      label: 'Grupo',
      width: 160,
      sortable: false,
      render: prod => {
        const grupoNome = GRUPOS.find(g => g.id === prod.grupoId)?.nome ?? '—'
        return (
          <span title={grupoNome} style={{ fontSize: t.font.size.xs, color: colors.fg.muted, fontFamily: t.font.family.sans }}>
            {grupoNome}
          </span>
        )
      },
    },
    {
      key: 'tipo',
      label: 'Tipo',
      width: 110,
      sortable: false,
      render: prod => {
        const tipoCor = TIPO_COLORS[prod.tipo]
        return (
          <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, fontFamily: t.font.family.sans, padding: '3px 8px', borderRadius: t.radius.full, background: tipoCor.bg, color: tipoCor.text }}>
            {TIPO_PRODUTO_LABEL[prod.tipo]}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      width: 90,
      sortable: false,
      render: prod => (
        <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, fontFamily: t.font.family.sans, padding: '3px 8px', borderRadius: t.radius.full, background: prod.ativo ? t.color.brand[50] : t.color.neutral[100], color: prod.ativo ? t.color.brand[600] : t.color.neutral[600] }}>
            {prod.ativo ? 'Ativo' : 'Inativo'}
          </span>
      ),
    },
    {
      key: 'acoes',
      label: 'Ações',
      align: 'right',
      width: t.size.iconBtn.md * 3 + t.space[1] * 2,
      sortable: false,
      render: prod => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }} onClick={e => e.stopPropagation()}>
          <IconButton icon={<Eye size={t.icon.xs} />} aria-label="Visualizar" onClick={() => onView(prod.id)} size="sm" variant="ghost" />
          <IconButton icon={<Pencil size={t.icon.xs} />} aria-label="Editar"  onClick={() => onEdit(prod.id)} size="sm" variant="ghost" />
          <IconButton icon={<Trash2 size={t.icon.xs} />} aria-label="Excluir" onClick={() => setDeleteTarget(prod)} size="sm" variant="ghost" danger />
        </div>
      ),
    },
  ]

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      <PageCard>

        {/* Header */}
        <PageHeader
          title="Produtos"
          count={produtos.length}
          actions={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="md" icon={<Download size={14} />} disabled>
                Exportar
              </Button>
              <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
                Adicionar Produto
              </Button>
            </div>
          }
        />

        {/* Toolbar: busca + chips */}
        <ListToolbar
          search={searchRaw}
          onSearch={setSearchRaw}
          searchPlaceholder="Buscar produto..."
          onOpenFilter={() => setDrawerOpen(true)}
          filterCount={activeFilterCount}
          onClearAll={clearFilters}
          chips={[
            grupoFilter && {
              label: `Grupo: ${GRUPOS.find(g => String(g.id) === grupoFilter)?.nome ?? grupoFilter}`,
              onRemove: () => { setGrupoFilter(''); setCatFilter(''); setClasseFilter('') },
            },
            catFilter && {
              label: `Cat.: ${catOpts.find(c => String(c.id) === catFilter)?.nome ?? catFilter}`,
              onRemove: () => { setCatFilter(''); setClasseFilter('') },
            },
            classeFilter && {
              label: `Classe: ${classeOpts.find(c => String(c.id) === classeFilter)?.nome ?? classeFilter}`,
              onRemove: () => setClasseFilter(''),
            },
            tipoFilter && {
              label: `Tipo: ${TIPO_PRODUTO_LABEL[tipoFilter as TipoProduto] ?? tipoFilter}`,
              onRemove: () => setTipoFilter(''),
            },
            ativoFilter && {
              label: ativoFilter === 'true' ? 'Ativo' : 'Inativo',
              onRemove: () => setAtivoFilter(''),
            },
          ]}
        />

        {/* Tabela */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: pageSize }, (_, i) => (
              <Skeleton key={i} variant="rect" height={44} width="100%" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          (() => {
            const hasSearch = searchRaw.length > 0 || !!grupoFilter || !!catFilter || !!classeFilter || !!tipoFilter || !!ativoFilter
            return (
              <EmptyState
                icon={<Package size={40} strokeWidth={1.5} />}
                message={hasSearch ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                description={hasSearch ? 'Ajuste os filtros de busca.' : 'Comece cadastrando o primeiro produto.'}
                action={hasSearch ? undefined : { label: 'Adicionar Produto', onClick: onNew }}
              />
            )
          })()
        ) : (
          <DataTable
            columns={columns}
            data={paginated}
            keyField="id"
            onRowClick={prod => onView(prod.id)}
            sortColumn={sortField}
            sortDirection={sortDir}
            onSortChange={key => handleSort(key as SortField)}
            pagination={
              <Pagination
                page={page}
                total={filtered.length}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={size => { setPageSize(size); setPage(1) }}
                showPageSizeSelector
              />
            }
          />
        )}

      </PageCard>

      {/* Bulk action bar */}
      <BulkActionBar
        count={selected.size}
        noun="selecionado"
        onClose={() => setSelected(new Set())}
        actions={[
          { label: 'Ativar',   onClick: handleBulkActivate },
          { label: 'Inativar', onClick: handleBulkDeactivate },
          { label: 'Excluir',  onClick: handleBulkDelete, danger: true },
        ]}
      />

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        title="Excluir produto?"
        message={
          deleteTarget
            ? `${deleteTarget.codigo} — ${deleteTarget.descricao} será excluído permanentemente. Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        tone="destructive"
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Filter Drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clearFilters}
        title="Filtrar Produtos"
        activeCount={activeFilterCount}
      >
        <FormSelect
          label="Grupo"
          options={[{ value: '', label: 'Todos os Grupos' }, ...GRUPOS.map(g => ({ value: String(g.id), label: g.nome }))]}
          value={grupoFilter}
          onChange={e => { setGrupoFilter(e.target.value); setCatFilter(''); setClasseFilter('') }}
        />
        <FormSelect
          label="Categoria"
          options={[{ value: '', label: 'Todas as Categorias' }, ...catOpts.map(c => ({ value: String(c.id), label: c.nome }))]}
          value={catFilter}
          onChange={e => { setCatFilter(e.target.value); setClasseFilter('') }}
        />
        <FormSelect
          label="Classe"
          options={[{ value: '', label: 'Todas as Classes' }, ...classeOpts.map(c => ({ value: String(c.id), label: c.nome }))]}
          value={classeFilter}
          onChange={e => setClasseFilter(e.target.value)}
        />
        <FormSelect
          label="Tipo"
          options={[{ value: '', label: 'Todos os Tipos' }, ...TIPO_PRODUTO_OPTS.map(o => ({ value: o.value, label: o.label }))]}
          value={tipoFilter}
          onChange={e => setTipoFilter(e.target.value)}
        />
        <FormSelect
          label="Status"
          options={[{ value: '', label: 'Todos' }, { value: 'true', label: 'Ativo' }, { value: 'false', label: 'Inativo' }]}
          value={ativoFilter}
          onChange={e => setAtivoFilter(e.target.value)}
        />
      </FilterDrawer>

    </PageContainer>
  )
}

