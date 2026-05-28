import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Plus, Pencil, Trash2, Package, X,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Download, CheckSquare,
} from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { Button }          from '../../../components/ui/Button'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { TableSearchInput, FilterChip, FilterButton } from '../../../components/ui/TableToolbar'
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
  onNew:            () => void
  onEdit:           (id: number) => void
  onDelete:         (id: number) => void
  onBulkActivate:   (ids: number[]) => void
  onBulkDeactivate: (ids: number[]) => void
  onBulkDelete:     (ids: number[]) => void
}

// ─── Badge helpers ────────────────────────────────────────────────────────────

const TIPO_COLORS: Record<TipoProduto, { bg: string; text: string }> = {
  insumo:     { bg: t.color.brand[50],   text: t.color.brand[600] },
  producao:   { bg: t.color.info.bg,     text: t.color.info.text },
  subproduto: { bg: t.color.warning.bg,  text: t.color.warning.text },
  servico:    { bg: t.color.neutral[100], text: t.color.neutral[500] },
}

type SortField = 'codigo' | 'descricao'
type SortDir   = 'asc' | 'desc'

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ProdutosLista({
  produtos, onNew, onEdit, onDelete,
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

  const border = colors.border

  const colStyle: React.CSSProperties = {
    fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold,
    color: colors.textMuted, fontFamily: t.font.family.sans,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  }

  const SortIcon = ({ field }: { field: SortField }) => (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <ChevronUp  size={9} style={{ opacity: sortField === field && sortDir === 'asc'  ? 1 : 0.3 }} />
      <ChevronDown size={9} style={{ opacity: sortField === field && sortDir === 'desc' ? 1 : 0.3 }} />
    </span>
  )

  const GRID = '40px 100px 1fr 160px 110px 90px 96px'

  return (
    <PageContainer>

      {/* Header */}
      <PageHeader
        title="Catálogo de Produtos"
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <TableSearchInput value={searchRaw} onChange={setSearchRaw} placeholder="Buscar produto..." />
        {grupoFilter && (
          <FilterChip
            label={`Grupo: ${GRUPOS.find(g => String(g.id) === grupoFilter)?.nome ?? grupoFilter}`}
            onRemove={() => { setGrupoFilter(''); setCatFilter(''); setClasseFilter('') }}
          />
        )}
        {catFilter && (
          <FilterChip
            label={`Cat.: ${catOpts.find(c => String(c.id) === catFilter)?.nome ?? catFilter}`}
            onRemove={() => { setCatFilter(''); setClasseFilter('') }}
          />
        )}
        {classeFilter && (
          <FilterChip
            label={`Classe: ${classeOpts.find(c => String(c.id) === classeFilter)?.nome ?? classeFilter}`}
            onRemove={() => setClasseFilter('')}
          />
        )}
        {tipoFilter && (
          <FilterChip
            label={`Tipo: ${TIPO_PRODUTO_LABEL[tipoFilter as TipoProduto] ?? tipoFilter}`}
            onRemove={() => setTipoFilter('')}
          />
        )}
        {ativoFilter && (
          <FilterChip
            label={ativoFilter === 'true' ? 'Ativo' : 'Inativo'}
            onRemove={() => setAtivoFilter('')}
          />
        )}
        {activeFilterCount > 1 && (
          <button
            type="button"
            onClick={clearFilters}
            style={{ background: 'none', border: 'none', fontSize: t.font.size.xs, color: colors.textMuted, cursor: 'pointer', padding: '0 4px', fontFamily: t.font.family.sans }}
          >
            Limpar tudo
          </button>
        )}
        <div style={{ flex: 1 }} />
        <FilterButton
          active={activeFilterCount > 0}
          count={activeFilterCount}
          onClick={() => setDrawerOpen(true)}
        />
        <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans, whiteSpace: 'nowrap' }}>
          {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <EmptyState onNew={onNew} hasSearch={searchRaw.length > 0 || !!grupoFilter || !!catFilter || !!classeFilter || !!tipoFilter || !!ativoFilter} />
      ) : (
        <div style={{ background: colors.surfaceBg, border: `1px solid ${border}`, borderRadius: t.radius.lg, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: GRID, padding: '10px 16px', background: colors.surfaceSubtle, borderBottom: `1px solid ${border}`, alignItems: 'center' }}>
            {/* Checkbox all */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeaderCheckbox checked={isAllSelected} partial={isPartialSelected} onChange={toggleSelectAll} colors={colors} />
            </div>
            <button type="button" onClick={() => handleSort('codigo')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, ...colStyle }}>
              Código <SortIcon field="codigo" />
            </button>
            <button type="button" onClick={() => handleSort('descricao')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, ...colStyle }}>
              Descrição <SortIcon field="descricao" />
            </button>
            <span style={colStyle}>Grupo</span>
            <span style={colStyle}>Tipo</span>
            <span style={colStyle}>Status</span>
            <span style={{ ...colStyle, textAlign: 'right' }}>Ações</span>
          </div>

          {paginated.map((prod, idx) => (
            <ProdutoRow
              key={prod.id}
              prod={prod}
              isLast={idx === paginated.length - 1}
              isSelected={selected.has(prod.id)}
              onToggle={() => toggleOne(prod.id)}
              onEdit={() => onEdit(prod.id)}
              onDeleteReq={() => setDeleteTarget(prod)}
              colors={colors}
              border={border}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {filtered.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>Linhas:</span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
            style={{ height: 28, border: `1px solid ${border}`, borderRadius: t.radius.DEFAULT, padding: '0 8px', fontSize: t.font.size.xs, fontFamily: t.font.family.sans, color: colors.textPrimary, background: colors.inputBg, cursor: 'pointer', outline: 'none' }}
          >
            {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans, marginLeft: 4 }}>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} de {filtered.length}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <PageBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} colors={colors} border={border}>
              <ChevronLeft size={13} />
            </PageBtn>
            <PageBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} colors={colors} border={border}>
              <ChevronRight size={13} />
            </PageBtn>
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: t.color.neutral[800], borderRadius: t.radius.xl, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.28)', zIndex: t.zIndex.toast, whiteSpace: 'nowrap' }}>
          <CheckSquare size={15} color={t.color.brand[400]} />
          <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: 'white', fontFamily: t.font.family.sans }}>
            {selected.size} selecionado{selected.size !== 1 ? 's' : ''}
          </span>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
          <BulkBtn onClick={handleBulkActivate}>Ativar</BulkBtn>
          <BulkBtn onClick={handleBulkDeactivate}>Inativar</BulkBtn>
          <BulkBtn onClick={handleBulkDelete} danger>Excluir</BulkBtn>
          <button onClick={() => setSelected(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 4, display: 'flex', marginLeft: 4 }}>
            <X size={14} />
          </button>
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
              <div style={{ fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold, color: colors.textPrimary, fontFamily: t.font.family.sans, marginBottom: 8 }}>Excluir produto?</div>
              <p style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans, lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: colors.textPrimary }}>{deleteTarget.codigo} — {deleteTarget.descricao}</strong>{' '}
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

// ─── ProdutoRow ───────────────────────────────────────────────────────────────

function ProdutoRow({ prod, isLast, isSelected, onToggle, onEdit, onDeleteReq, colors, border }: {
  prod: Produto; isLast: boolean; isSelected: boolean
  onToggle: () => void; onEdit: () => void; onDeleteReq: () => void
  colors: ReturnType<typeof useTheme>['colors']; border: string
}) {
  const [hovered, setHovered] = useState(false)
  const grupoNome = GRUPOS.find(g => g.id === prod.grupoId)?.nome ?? '—'
  const tipoCor = TIPO_COLORS[prod.tipo]
  const GRID = '40px 100px 1fr 160px 110px 90px 96px'

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: GRID, padding: '11px 16px', borderBottom: isLast ? 'none' : `1px solid ${border}`, background: isSelected ? `${t.color.brand[50]}99` : hovered ? colors.surfaceSubtle : 'transparent', transition: 'background 0.12s', alignItems: 'center' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <RowCheckbox checked={isSelected} onChange={onToggle} colors={colors} />
      </div>
      <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.bold, color: colors.textSecondary, fontFamily: t.font.family.sans, letterSpacing: '0.05em' }}>
        {prod.codigo}
      </span>
      <span style={{ fontSize: t.font.size.base, color: colors.textPrimary, fontFamily: t.font.family.sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={prod.descricao}>
        {prod.descricao}
      </span>
      <span style={{ fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans }}>
        {grupoNome}
      </span>
      <span style={{ display: 'inline-flex' }}>
        <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, fontFamily: t.font.family.sans, padding: '3px 8px', borderRadius: t.radius.full, background: tipoCor.bg, color: tipoCor.text }}>
          {TIPO_PRODUTO_LABEL[prod.tipo]}
        </span>
      </span>
      <span style={{ display: 'inline-flex' }}>
        <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, fontFamily: t.font.family.sans, padding: '3px 8px', borderRadius: t.radius.full, background: prod.ativo ? t.color.brand[50] : t.color.neutral[100], color: prod.ativo ? t.color.brand[600] : t.color.neutral[500] }}>
          {prod.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </span>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
        <ActionBtn icon={<Pencil size={13} />} label="Editar"  onClick={onEdit}      colors={colors} />
        <ActionBtn icon={<Trash2 size={13} />} label="Excluir" onClick={onDeleteReq} colors={colors} danger />
      </div>
    </div>
  )
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function HeaderCheckbox({ checked, partial, onChange, colors }: {
  checked: boolean; partial: boolean; onChange: () => void
  colors: ReturnType<typeof useTheme>['colors']
}) {
  return (
    <button type="button" onClick={onChange} style={{ width: 16, height: 16, border: `1.5px solid ${checked || partial ? t.color.brand[600] : colors.border}`, borderRadius: t.radius.sm, background: checked ? t.color.brand[600] : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s', padding: 0, flexShrink: 0 }}>
      {checked && <span style={{ width: 8, height: 8, background: 'white', borderRadius: 1, display: 'block' }} />}
      {partial && !checked && <span style={{ width: 8, height: 2, background: t.color.brand[600], borderRadius: 1, display: 'block' }} />}
    </button>
  )
}

function RowCheckbox({ checked, onChange, colors }: {
  checked: boolean; onChange: () => void
  colors: ReturnType<typeof useTheme>['colors']
}) {
  return (
    <button type="button" onClick={e => { e.stopPropagation(); onChange() }} style={{ width: 16, height: 16, border: `1.5px solid ${checked ? t.color.brand[600] : colors.border}`, borderRadius: t.radius.sm, background: checked ? t.color.brand[600] : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s', padding: 0, flexShrink: 0 }}>
      {checked && <span style={{ width: 8, height: 8, background: 'white', borderRadius: 1, display: 'block' }} />}
    </button>
  )
}

function BulkBtn({ onClick, danger, children }: { onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  const [hov, setHov] = useState(false)
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ padding: '4px 12px', borderRadius: t.radius.DEFAULT, border: 'none', cursor: 'pointer', fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, fontFamily: t.font.family.sans, background: hov ? (danger ? t.color.error.text : t.color.brand[600]) : (danger ? 'rgba(220,38,38,0.2)' : 'rgba(255,255,255,0.15)'), color: danger ? (hov ? 'white' : '#fca5a5') : 'white', transition: 'background 0.12s, color 0.12s' }}>
      {children}
    </button>
  )
}

function PageBtn({ onClick, disabled, children, colors, border }: {
  onClick: () => void; disabled: boolean; children: React.ReactNode
  colors: ReturnType<typeof useTheme>['colors']; border: string
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${border}`, borderRadius: t.radius.DEFAULT, background: colors.surfaceBg, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, color: colors.textMuted }}>
      {children}
    </button>
  )
}

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

function EmptyState({ onNew, hasSearch }: { onNew: () => void; hasSearch: boolean }) {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12, textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: colors.brandBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Package size={24} color={colors.brand} strokeWidth={1.5} />
      </div>
      <div style={{ fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold, color: colors.textPrimary, fontFamily: t.font.family.sans }}>
        {hasSearch ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
      </div>
      <div style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans }}>
        {hasSearch ? 'Ajuste os filtros de busca.' : 'Comece adicionando o primeiro produto ao catálogo.'}
      </div>
      {!hasSearch && <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>Adicionar Produto</Button>}
    </div>
  )
}

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
