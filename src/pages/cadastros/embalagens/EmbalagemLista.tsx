import React, { useState, useMemo, useEffect } from 'react'
import {
  Plus, Pencil, Trash2,
} from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { Button }          from '../../../components/ui/Button'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { ListToolbar } from '../../../components/ui/ListToolbar'
import { SortHeader }  from '../../../components/ui/SortHeader'
import { Pagination }      from '../../../components/ui/Pagination'
import { Skeleton }        from '../../../components/ui/Skeleton'
import { EmptyState as EmptyStateUI } from '../../../components/ui/EmptyState'
import { ConfirmDialog }   from '../../../components/ui/ConfirmDialog'
import { IconButton }      from '../../../components/ui/IconButton'
import { t }               from '../../../design/tokens'
import { useTheme }        from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { fmtQtd, UNIDADE_OPTS, type Embalagem } from './embalagens.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  embalagens: Embalagem[]
  onNew:      () => void
  onEdit:     (id: number) => void
  onDelete:   (id: number) => void
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
      const unidadeLabel = UNIDADE_OPTS.find(o => o.value === e.unidade)?.label ?? ''
      const matchSearch  = !q || e.descricao.toLowerCase().includes(q) || unidadeLabel.toLowerCase().includes(q)
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
    show(`Embalagem "${deleteTarget.descricao}" excluída.`, 'info')
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
            <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
              Adicionar Embalagem
            </Button>
          </div>
        }
      />

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <ListToolbar
        search={search}
        onSearch={setSearch}
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
              <SortHeader
                label="Descrição"
                field="descricao"
                activeField="descricao"
                direction={sortDir}
                onSort={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              />
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
        <IconButton icon={<Pencil size={13} />} aria-label="Editar"  size="xs" onClick={onEdit} />
        <IconButton icon={<Trash2 size={13} />} aria-label="Excluir" size="xs" danger onClick={onDeleteReq} />
      </div>
    </div>
  )
}

