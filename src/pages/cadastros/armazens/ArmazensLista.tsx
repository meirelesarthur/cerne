import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Plus, Pencil, Trash2,
  ChevronUp, ChevronDown,
} from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { Button }          from '../../../components/ui/Button'
import { Modal }           from '../../../components/ui/Modal'
import { IconButton }      from '../../../components/ui/IconButton'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { TableSearchInput, FilterChip, FilterButton } from '../../../components/ui/TableToolbar'
import { Pagination }      from '../../../components/ui/Pagination'
import { Skeleton }        from '../../../components/ui/Skeleton'
import { EmptyState as EmptyStateUI } from '../../../components/ui/EmptyState'
import { t }               from '../../../design/tokens'
import { useTheme }        from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
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
  const [filters,      setFilters]     = useState({ tipo: '', ativo: '' })
  const [drawerOpen,   setDrawerOpen]  = useState(false)
  const [sortField,    setSortField]   = useState<SortField>('sigla')
  const [sortDir,      setSortDir]     = useState<SortDir>('asc')
  const [deleteTarget, setDeleteTarget] = useState<Armazem | null>(null)
  const [isLoading,    setIsLoading]   = useState(true)
  const [page,         setPage]        = useState(1)
  const PAGE_SIZE = 10

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // Reset page quando filtros mudam
  useEffect(() => { setPage(1) }, [search, filters.tipo, filters.ativo])

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const activeFilterCount = [filters.tipo, filters.ativo].filter(Boolean).length
  const clearFilters = () => setFilters({ tipo: '', ativo: '' })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = armazens.filter(a => {
      const tipoLabel   = TIPO_ARMAZEM_LABEL[a.tipo] ?? ''
      const statusLabel = a.ativo ? 'ativo' : 'inativo'
      const matchSearch  = !q || a.sigla.toLowerCase().includes(q) || a.descricao.toLowerCase().includes(q) || tipoLabel.toLowerCase().includes(q) || statusLabel.includes(q)
      const matchTipo    = !filters.tipo  || a.tipo === filters.tipo
      const matchAtivo   = filters.ativo === '' || (filters.ativo === 'true' ? a.ativo : !a.ativo)
      return matchSearch && matchTipo && matchAtivo
    })
    base.sort((a, b) => {
      const cmp = a[sortField].localeCompare(b[sortField], 'pt-BR')
      return sortDir === 'asc' ? cmp : -cmp
    })
    return base
  }, [armazens, search, filters, sortField, sortDir])

  const totalFiltered = filtered.length
  const paginatedData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    onDelete(deleteTarget.id)
    show(`Armazém "${deleteTarget.sigla}" excluído.`, 'info')
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
              Adicionar Armazém
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <TableSearchInput value={search} onChange={setSearch} placeholder="Buscar armazém..." />
        {filters.tipo && (
          <FilterChip
            label={`Tipo: ${TIPO_ARMAZEM_LABEL[filters.tipo as TipoArmazem]}`}
            onRemove={() => setFilters(f => ({ ...f, tipo: '' }))}
          />
        )}
        {filters.ativo && (
          <FilterChip
            label={filters.ativo === 'true' ? 'Ativo' : 'Inativo'}
            onRemove={() => setFilters(f => ({ ...f, ativo: '' }))}
          />
        )}
        {activeFilterCount > 1 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>Limpar tudo</Button>
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
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rect" width="100%" height={48} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyStateUI
          message="Nenhum armazém encontrado."
          description="Tente ajustar os filtros ou limpar a busca."
        />
      ) : (
        <>
          <div style={{ background: colors.surfaceBg, border: `1px solid ${border}`, borderRadius: t.radius.lg, overflow: 'hidden' }}>
            {/* Cabeçalho */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 140px 100px 96px', padding: '10px 16px', background: colors.surfaceSubtle, borderBottom: `1px solid ${border}` }}>
              <SortBtn label="Sigla" field="sigla" sortField={sortField} onSort={handleSort} colors={colors} SortIconEl={<SortIcon field="sigla" />} />
              <SortBtn label="Descrição" field="descricao" sortField={sortField} onSort={handleSort} colors={colors} SortIconEl={<SortIcon field="descricao" />} />
              <span style={colStyle}>Tipo</span>
              <span style={colStyle}>Status</span>
              <span style={{ ...colStyle, textAlign: 'right' }}>Ações</span>
            </div>

            {paginatedData.map((arm, idx) => (
              <ArmazemRow
                key={arm.id}
                arm={arm}
                isLast={idx === paginatedData.length - 1}
                onEdit={() => onEdit(arm.id)}
                onDeleteReq={() => setDeleteTarget(arm)}
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

      {/* Modal exclusão */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Excluir armazém"
        subtitle="Esta ação não pode ser desfeita."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              <Trash2 size={13} /> Excluir
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.space[4], padding: `${t.space[1]}px 0` }}>
          <div style={{ width: 52, height: 52, borderRadius: t.radius.full, background: t.color.error.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={22} color={t.color.error.solid} />
          </div>
          <p style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans, lineHeight: 1.6, margin: 0, textAlign: 'center' }}>
            <strong style={{ color: colors.textPrimary }}>{deleteTarget?.sigla} — {deleteTarget?.descricao}</strong>{' '}
            será excluído permanentemente.
          </p>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Filter Drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clearFilters}
        title="Filtrar Armazéns"
        activeCount={activeFilterCount}
      >
        <FormSelect
          label="Tipo"
          options={[
            { value: '', label: 'Todos os tipos' },
            ...TIPO_ARMAZEM_OPTS.map(o => ({ value: o.value, label: o.label })),
          ]}
          value={filters.tipo}
          onChange={e => setFilters(f => ({ ...f, tipo: e.target.value }))}
        />
        <FormSelect
          label="Status"
          options={[
            { value: '',      label: 'Todos'   },
            { value: 'true',  label: 'Ativo'   },
            { value: 'false', label: 'Inativo' },
          ]}
          value={filters.ativo}
          onChange={e => setFilters(f => ({ ...f, ativo: e.target.value }))}
        />
      </FilterDrawer>

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
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: t.space[1] }}>
        <IconButton icon={<Pencil size={13} />} size="sm" variant="ghost" aria-label="Editar"  onClick={onEdit}      />
        <IconButton icon={<Trash2 size={13} />} size="sm" variant="ghost" aria-label="Excluir" onClick={onDeleteReq} danger />
      </div>
    </div>
  )
}

// ActionBtn foi substituído por IconButton de src/components/ui/IconButton

// Modal local substituído por Modal de src/components/ui/Modal
