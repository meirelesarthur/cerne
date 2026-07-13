import React, { useState, useMemo, useEffect } from 'react'
import {
  Plus, Pencil, Trash2,
  List, LayoutGrid, MapPin, Layers, Ruler, Eye,
  TrendingUp, TrendingDown, ListPlus, X,
} from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { PageCard }         from '../../../components/ui/PageCard'
import { Button }          from '../../../components/ui/Button'
import { IconButton }      from '../../../components/ui/IconButton'
import { DataTable }       from '../../../components/ui/DataTable'
import { DropdownMenu }    from '../../../components/ui/DropdownMenu'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { Badge }           from '../../../components/ui/Badge'
import type { BadgeVariant } from '../../../components/ui/Badge'
import { FormField }       from '../../../components/ui/FormField'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { ToggleSwitch }    from '../../../components/ui/ToggleSwitch'
import { Modal }           from '../../../components/ui/Modal'
import { ListToolbar } from '../../../components/ui/ListToolbar'
import { FilterButton } from '../../../components/ui/TableToolbar'
import { Pagination }      from '../../../components/ui/Pagination'
import { Skeleton }        from '../../../components/ui/Skeleton'
import { EmptyState }      from '../../../components/ui/EmptyState'
import { ConfirmDialog }   from '../../../components/ui/ConfirmDialog'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { t }               from '../../../design/tokens'
import { useTheme }        from '../../../context/ThemeContext'
import { mockFazendas }  from './fazendas.mock'
import type { FazendaRow } from './fazendas.types'
import type { Column }     from '../../../components/ui/DataTable'

// ─── tipos ───────────────────────────────────────────────────────────────────

type ViewMode = 'list' | 'cards'

interface FazendasListaProps {
  onNew:  () => void
  onView: (id: string) => void
  onEdit: (id: string) => void
}

// ─── Opções de filtro ─────────────────────────────────────────────────────────

const tipoOptions = [
  { value: '',             label: 'Todos os tipos'  },
  { value: 'Agrícola',     label: 'Agrícola'        },
  { value: 'Pecuário',     label: 'Pecuário'        },
  { value: 'Misto',        label: 'Misto'           },
  { value: 'Silvicultura', label: 'Silvicultura'    },
  { value: 'Piscicultura', label: 'Piscicultura'    },
]

const ativoOptions = [
  { value: '',      label: 'Todos'    },
  { value: 'true',  label: 'Ativo'   },
  { value: 'false', label: 'Inativo' },
]

// ─── Variante de badge por tipo de exploração ─────────────────────────────────

const TIPO_VARIANT: Record<string, BadgeVariant> = {
  'Agrícola':     'success',
  'Pecuário':     'info',
  'Misto':        'warning',
  'Silvicultura': 'purple',
  'Piscicultura': 'cyan',
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function FazendasLista({ onNew, onView, onEdit }: FazendasListaProps) {
  const { colors, isGbMode } = useTheme()

  const [data, setData] = useState<FazendaRow[]>(mockFazendas)
  const [deleteTarget, setDeleteTarget] = useState<FazendaRow | null>(null)
  const [areaTarget, setAreaTarget] = useState<FazendaRow | null>(null)
  const [multiAreaTarget, setMultiAreaTarget] = useState<FazendaRow | null>(null)
  const { toasts, show, dismiss } = useToast()
  const [viewMode,   setViewMode]   = useState<ViewMode>('list')
  const [search,     setSearch]     = useState('')
  const [filters,    setFilters]    = useState({ tipoExploracao: '', ativo: '' })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isLoading,  setIsLoading]  = useState(true)
  const [page,       setPage]       = useState(1)
  const PAGE_SIZE = 10

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // Reset page quando filtros mudam
  useEffect(() => { setPage(1) }, [search, filters.tipoExploracao, filters.ativo])

  // ── KPIs derivados dos dados brutos (não filtrados) ───────────────────────
  const kpis = useMemo(() => {
    const total     = data.length
    const ativas    = data.filter(f => f.ativo).length
    const inativas  = data.filter(f => !f.ativo).length
    const areaTotalHa = data.reduce((s, f) => s + f.areaTotal, 0)
    const ativasPct = total > 0 ? Math.round((ativas / total) * 100) : 0
    return { total, ativas, inativas, areaTotalHa, ativasPct }
  }, [data])

  // ── Dados filtrados ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return data.filter((row) => {
      const matchSearch =
        !q ||
        row.nome.toLowerCase().includes(q)    ||
        row.cidade.toLowerCase().includes(q)  ||
        row.uf.toLowerCase().includes(q)      ||
        row.tipoExploracao.toLowerCase().includes(q)
      const matchTipo =
        !filters.tipoExploracao || row.tipoExploracao === filters.tipoExploracao
      const matchAtivo =
        filters.ativo === '' ||
        (filters.ativo === 'true' ? row.ativo : !row.ativo)
      return matchSearch && matchTipo && matchAtivo
    })
  }, [data, search, filters])

  const totalFiltered = filtered.length
  const paginatedData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const activeFilterCount = [filters.tipoExploracao, filters.ativo].filter(Boolean).length
  const clearFilters = () => setFilters({ tipoExploracao: '', ativo: '' })

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    // Áreas (filhas) são removidas da lista `areas` da fazenda-pai; fazendas
    // (raiz) são removidas da lista principal.
    if (deleteTarget.isArea) {
      setData((prev) => prev.map((f) => ({
        ...f,
        areas: f.areas?.filter((a) => a.id !== deleteTarget.id),
      })))
    } else {
      setData((prev) => prev.filter((f) => f.id !== deleteTarget.id))
    }
    show(`"${deleteTarget.nome}" excluída.`, 'info')
    setDeleteTarget(null)
  }

  const handleSaveArea = (novaArea: { nome: string; areaTotal: number; ativo: boolean }) => {
    if (!areaTarget) return
    const area: FazendaRow = {
      id: `${areaTarget.id}-${crypto.randomUUID()}`,
      nome: novaArea.nome,
      cpfCnpj: '',
      cidade: '',
      uf: '',
      tipoExploracao: '',
      areaTotal: novaArea.areaTotal,
      ativo: novaArea.ativo,
      isArea: true,
    }
    setData((prev) => prev.map((f) => (
      f.id === areaTarget.id ? { ...f, areas: [...(f.areas ?? []), area] } : f
    )))
    show(`Área "${novaArea.nome}" adicionada a "${areaTarget.nome}".`, 'success')
    setAreaTarget(null)
  }

  const handleSaveMultiAreas = (novasAreas: { nome: string; areaTotal: number }[]) => {
    if (!multiAreaTarget) return
    const areas: FazendaRow[] = novasAreas.map((a) => ({
      id: `${multiAreaTarget.id}-${crypto.randomUUID()}`,
      nome: a.nome,
      cpfCnpj: '',
      cidade: '',
      uf: '',
      tipoExploracao: '',
      areaTotal: a.areaTotal,
      ativo: true,
      isArea: true,
    }))
    setData((prev) => prev.map((f) => (
      f.id === multiAreaTarget.id ? { ...f, areas: [...(f.areas ?? []), ...areas] } : f
    )))
    show(`${areas.length} área${areas.length !== 1 ? 's' : ''} adicionada${areas.length !== 1 ? 's' : ''} a "${multiAreaTarget.nome}".`, 'success')
    setMultiAreaTarget(null)
  }

  // ── Colunas da tabela ─────────────────────────────────────────────────────
  const columns: Column<FazendaRow>[] = [
    {
      key: 'nome',
      label: 'Nome',
      render: (row) => <span style={{ fontWeight: 500 }}>{row.nome}</span>,
    },
    {
      key: 'cpfCnpj',
      label: 'CPF / CNPJ',
      render: (row) => (
        row.cpfCnpj
          ? <span style={{ color: colors.fg.muted, fontSize: 12 }}>{row.cpfCnpj}</span>
          : null
      ),
    },
    {
      key: 'cidadeUf',
      label: 'Cidade / UF',
      render: (row) => (
        row.cidade
          ? <span style={{ color: colors.fg.muted }}>{row.cidade} — {row.uf}</span>
          : null
      ),
    },
    {
      key: 'tipoExploracao',
      label: 'Tipo Exploração',
      render: (row) => (
        row.tipoExploracao
          ? <Badge label={row.tipoExploracao} variant={TIPO_VARIANT[row.tipoExploracao] ?? 'neutral'} />
          : null
      ),
    },
    {
      key: 'areaTotal',
      label: 'Área Total',
      align: 'right',
      render: (row) => (
        <span style={{ fontWeight: t.font.weight.medium }}>
          {row.areaTotal.toLocaleString('pt-BR')} ha
        </span>
      ),
    },
    {
      key: 'ativo',
      label: 'Status',
      align: 'center',
      sortable: false,
      render: (row) => (
        <Badge label={row.ativo ? 'Ativo' : 'Inativo'} variant={row.ativo ? 'success' : 'neutral'} />
      ),
    },
    {
      key: 'acoes',
      label: 'Ações',
      align: 'center',
      sortable: false,
      width: 60,
      render: (row) => (
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu
            ariaLabel={`Ações de ${row.nome}`}
            items={
              row.isArea
                ? [
                    { id: 'view',   label: 'Visualizar', icon: <Eye size={14} />,    onClick: () => onView(row.id) },
                    { id: 'edit',   label: 'Editar',      icon: <Pencil size={14} />, onClick: () => onEdit(row.id) },
                    { id: 'delete', label: 'Excluir',     icon: <Trash2 size={14} />, danger: true, divider: true, onClick: () => setDeleteTarget(row) },
                  ]
                : [
                    { id: 'view',       label: 'Visualizar',                icon: <Eye size={14} />,     onClick: () => onView(row.id) },
                    { id: 'add-area',   label: 'Adicionar Área',            icon: <Plus size={14} />,    onClick: () => setAreaTarget(row) },
                    { id: 'add-multi',  label: 'Adicionar Múltiplas Áreas', icon: <ListPlus size={14} />, onClick: () => setMultiAreaTarget(row) },
                    { id: 'edit',       label: 'Editar',                    icon: <Pencil size={14} />,   divider: true, onClick: () => onEdit(row.id) },
                    { id: 'delete',     label: 'Excluir',                   icon: <Trash2 size={14} />,   danger: true, onClick: () => setDeleteTarget(row) },
                  ]
            }
          />
        </div>
      ),
    },
  ]

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      <PageCard>

        {/* ── PageHeader ──────────────────────────────────────────────────── */}
        <PageHeader
          title="Fazendas"
          count={data.length}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
                Nova Fazenda
              </Button>
            </div>
          }
        />

        {/* ── KPI Bar ─────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[4], marginBottom: t.space[4] }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rect" width="100%" height={80} />
            ))}
          </div>
        ) : (
          <KpiBar kpis={kpis} colors={colors} isGbMode={isGbMode} />
        )}

        {/* ── Toolbar: busca + filtro + toggle (linha 1) · chips (linha 2) ──── */}
        <ListToolbar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Buscar fazenda..."
          onClearAll={clearFilters}
          chips={[
            filters.tipoExploracao && {
              label: `Tipo: ${filters.tipoExploracao}`,
              onRemove: () => setFilters((f) => ({ ...f, tipoExploracao: '' })),
            },
            filters.ativo && {
              label: filters.ativo === 'true' ? 'Ativo' : 'Inativo',
              onRemove: () => setFilters((f) => ({ ...f, ativo: '' })),
            },
          ]}
          actions={
            <>
              <ViewToggle value={viewMode} onChange={setViewMode} colors={colors} />
              <div style={{ width: 1, height: 22, background: colors.border.default, flexShrink: 0 }} />
              <FilterButton
                active={activeFilterCount > 0}
                count={activeFilterCount}
                onClick={() => setDrawerOpen(true)}
              />
            </>
          }
        />

        {/* ── Conteúdo: Lista ou Cards ─────────────────────────────────────── */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rect" width="100%" height={48} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            message="Nenhuma fazenda encontrada."
            description="Tente ajustar os filtros ou limpar a busca."
          />
        ) : viewMode === 'list' ? (
          <>
            <DataTable<FazendaRow>
              columns={columns}
              data={paginatedData}
              keyField="id"
              emptyMessage="Nenhuma fazenda encontrada."
              onRowClick={(row) => onView(row.id)}
              getChildren={(row) => row.areas}
            />
            {totalFiltered > PAGE_SIZE && (
              <div style={{
                marginTop: t.space[4],
                paddingTop: t.space[4],
                borderTop: `1px solid ${colors.border.subtle}`,
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
        ) : (
          <>
            <CardsGrid
              data={paginatedData}
              onView={onView}
              onEdit={onEdit}
              colors={colors}
            />
            {totalFiltered > PAGE_SIZE && (
              <div style={{
                marginTop: t.space[4],
                paddingTop: t.space[4],
                borderTop: `1px solid ${colors.border.subtle}`,
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

      </PageCard>

      {/* ── Filter Drawer ────────────────────────────────────────────────── */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clearFilters}
        title="Filtrar Fazendas"
        activeCount={activeFilterCount}
      >
        <FormSelect
          label="Tipo de Exploração"
          options={tipoOptions}
          value={filters.tipoExploracao}
          onChange={(e) => setFilters((f) => ({ ...f, tipoExploracao: e.target.value }))}
        />
        <FormSelect
          label="Status"
          options={ativoOptions}
          value={filters.ativo}
          onChange={(e) => setFilters((f) => ({ ...f, ativo: e.target.value }))}
        />
      </FilterDrawer>

      {/* ── Confirmação de exclusão ──────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title={deleteTarget?.isArea ? 'Excluir área' : 'Excluir fazenda'}
        message={
          deleteTarget
            ? `"${deleteTarget.nome}" será excluída permanentemente. Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
      />

      {/* ── Modal: Adicionar Área ────────────────────────────────────────── */}
      <AreaModal
        open={!!areaTarget}
        fazendaNome={areaTarget?.nome}
        onClose={() => setAreaTarget(null)}
        onSave={handleSaveArea}
      />

      {/* ── Modal: Adicionar Múltiplas Áreas ─────────────────────────────── */}
      <MultiAreaModal
        open={!!multiAreaTarget}
        fazendaNome={multiAreaTarget?.nome}
        onClose={() => setMultiAreaTarget(null)}
        onSave={handleSaveMultiAreas}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

    </PageContainer>
  )
}

// ─── Modal: Adicionar Área (única) ────────────────────────────────────────────

interface AreaModalProps {
  open: boolean
  fazendaNome?: string
  onClose: () => void
  onSave: (area: { nome: string; areaTotal: number; ativo: boolean }) => void
}

function AreaModal({ open, fazendaNome, onClose, onSave }: AreaModalProps) {
  const [nome, setNome] = useState('')
  const [areaTotal, setAreaTotal] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [errors, setErrors] = useState<{ nome?: string; areaTotal?: string }>({})

  // Reseta o form sempre que o modal é reaberto para uma fazenda diferente
  useEffect(() => {
    if (open) {
      setNome('')
      setAreaTotal('')
      setAtivo(true)
      setErrors({})
    }
  }, [open])

  const handleSave = () => {
    const nomeTrim = nome.trim()
    const areaNum = Number(areaTotal.replace(',', '.'))
    const nextErrors: typeof errors = {}
    if (!nomeTrim) nextErrors.nome = 'Informe o nome da área.'
    if (!areaTotal || !(areaNum > 0)) nextErrors.areaTotal = 'Informe uma área válida.'
    if (Object.keys(nextErrors).length > 0) { setErrors(nextErrors); return }

    onSave({ nome: nomeTrim, areaTotal: areaNum, ativo })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adicionar Área"
      subtitle={fazendaNome}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Salvar</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4] }}>
        <FormField
          label="Nome da Área"
          required
          value={nome}
          onChange={(e) => { setNome(e.target.value); setErrors((er) => ({ ...er, nome: undefined })) }}
          error={errors.nome}
          placeholder="Ex: Talhão 03"
        />
        <FormField
          label="Área (ha)"
          required
          type="number"
          min="0"
          step="0.01"
          value={areaTotal}
          onChange={(e) => { setAreaTotal(e.target.value); setErrors((er) => ({ ...er, areaTotal: undefined })) }}
          error={errors.areaTotal}
          placeholder="Ex: 250"
        />
        <ToggleSwitch checked={ativo} onChange={setAtivo} label="Ativo" />
      </div>
    </Modal>
  )
}

// ─── Modal: Adicionar Múltiplas Áreas ──────────────────────────────────────────

interface MultiAreaRow {
  key: string
  nome: string
  areaTotal: string
}

function newMultiAreaRow(): MultiAreaRow {
  return { key: crypto.randomUUID(), nome: '', areaTotal: '' }
}

interface MultiAreaModalProps {
  open: boolean
  fazendaNome?: string
  onClose: () => void
  onSave: (areas: { nome: string; areaTotal: number }[]) => void
}

function MultiAreaModal({ open, fazendaNome, onClose, onSave }: MultiAreaModalProps) {
  const { colors } = useTheme()
  const [rows, setRows] = useState<MultiAreaRow[]>([newMultiAreaRow()])
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (open) {
      setRows([newMultiAreaRow()])
      setError(undefined)
    }
  }, [open])

  const updateRow = (key: string, field: 'nome' | 'areaTotal', value: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)))
    setError(undefined)
  }

  const addRow = () => setRows((prev) => [...prev, newMultiAreaRow()])
  const removeRow = (key: string) => setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev))

  const handleSave = () => {
    const valid = rows
      .map((r) => ({ nome: r.nome.trim(), areaTotal: Number(r.areaTotal.replace(',', '.')) }))
      .filter((r) => r.nome && r.areaTotal > 0)

    if (valid.length === 0) { setError('Preencha ao menos uma área com nome e tamanho válidos.'); return }
    onSave(valid)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adicionar Múltiplas Áreas"
      subtitle={fazendaNome}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Salvar</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
        {rows.map((row, idx) => (
          <div key={row.key} style={{ display: 'flex', gap: t.space[2], alignItems: 'flex-end' }}>
            <div style={{ flex: 2 }}>
              <FormField
                label={idx === 0 ? 'Nome da Área' : ''}
                value={row.nome}
                onChange={(e) => updateRow(row.key, 'nome', e.target.value)}
                placeholder="Ex: Talhão 03"
              />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                label={idx === 0 ? 'Área (ha)' : ''}
                type="number"
                min="0"
                step="0.01"
                value={row.areaTotal}
                onChange={(e) => updateRow(row.key, 'areaTotal', e.target.value)}
                placeholder="Ex: 250"
              />
            </div>
            <IconButton
              icon={<X size={14} />}
              aria-label="Remover linha"
              tooltip="Remover"
              size="sm"
              danger
              disabled={rows.length === 1}
              onClick={() => removeRow(row.key)}
            />
          </div>
        ))}

        {error && (
          <span style={{ fontSize: t.font.size.xs, color: t.color.feedback.error.text, fontFamily: t.font.family.sans }}>
            {error}
          </span>
        )}

        <Button
          variant="ghost"
          size="sm"
          icon={<Plus size={13} />}
          onClick={addRow}
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '9px',
            border: `1px dashed ${colors.border.default}`,
            borderRadius: t.radius.base,
            color: colors.fg.subtle,
            fontSize: t.font.size.sm,
            fontWeight: t.font.weight.medium,
          }}
        >
          Adicionar linha
        </Button>
      </div>
    </Modal>
  )
}

// ─── KPI Bar ──────────────────────────────────────────────────────────────────

interface KpiItem {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

function KpiBar({
  kpis,
  colors,
  isGbMode,
}: {
  kpis: { total: number; ativas: number; inativas: number; areaTotalHa: number; ativasPct: number }
  colors: ReturnType<typeof useTheme>['colors']
  isGbMode: boolean
}) {
  const items: KpiItem[] = [
    {
      label: 'Total de Fazendas',
      value: String(kpis.total),
      sub: 'cadastradas',
      trend: 'neutral',
    },
    {
      label: 'Ativas',
      value: String(kpis.ativas),
      trendValue: `${kpis.ativasPct}%`,
      trend: 'up',
    },
    {
      label: 'Inativas',
      value: String(kpis.inativas),
      trendValue: kpis.total > 0 ? `${100 - kpis.ativasPct}%` : '0%',
      trend: kpis.inativas > 0 ? 'down' : 'neutral',
    },
    {
      label: 'Área Total',
      value: kpis.areaTotalHa.toLocaleString('pt-BR'),
      sub: 'hectares',
      trend: 'up',
    },
  ]

  const cardBg    = isGbMode ? t.color.state.row.hoverGb : colors.bg.surface
  const border    = colors.border.default

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1,
        border: `1px solid ${border}`,
        borderRadius: t.radius.lg,
        overflow: 'hidden',
        marginBottom: t.space[4],
      }}
    >
      {items.map((item, idx) => (
        <div
          key={item.label}
          style={{
            padding: `${t.space[4]}px ${t.space[5]}px`,
            background: cardBg,
            borderRight: idx < items.length - 1 ? `1px solid ${border}` : undefined,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <span style={{
            fontSize: t.font.size.xs,
            fontWeight: t.font.weight.medium,
            color: colors.fg.subtle,
            fontFamily: t.font.family.sans,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {item.label}
          </span>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{
              fontSize: t.font.size['3xl'],
              fontWeight: t.font.weight.bold,
              color: colors.fg.default,
              fontFamily: t.font.family.sans,
              lineHeight: 1,
            }}>
              {item.value}
            </span>

            {item.trendValue && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: t.font.size.xs,
                fontWeight: t.font.weight.semibold,
                color: item.trend === 'up'
                  ? t.color.feedback.success.text
                  : item.trend === 'down'
                    ? t.color.feedback.error.text
                    : colors.fg.subtle,
                background: item.trend === 'up'
                  ? t.color.feedback.success.bg
                  : item.trend === 'down'
                    ? t.color.feedback.error.bg
                    : colors.bg.subtle,
                padding: '2px 6px',
                borderRadius: t.radius.full,
              }}>
                {item.trend === 'up'   && <TrendingUp  size={10} />}
                {item.trend === 'down' && <TrendingDown size={10} />}
                {item.trendValue}
              </span>
            )}

            {item.sub && (
              <span style={{
                fontSize: t.font.size.sm,
                color: colors.fg.subtle,
                fontFamily: t.font.family.sans,
              }}>
                {item.sub}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── View Toggle ──────────────────────────────────────────────────────────────

function ViewToggle({
  value,
  onChange,
  colors,
}: {
  value: ViewMode
  onChange: (v: ViewMode) => void
  colors: ReturnType<typeof useTheme>['colors']
}) {
  const items: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'list',  icon: <List       size={14} />, label: 'Lista'  },
    { mode: 'cards', icon: <LayoutGrid size={14} />, label: 'Cards'  },
  ]

  return (
    <div style={{
      display: 'inline-flex',
      border: `1.5px solid ${colors.border.default}`,
      borderRadius: t.radius.base,
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {items.map((item, idx) => {
        const active = value === item.mode
        return (
          <Button
            key={item.mode}
            variant="ghost"
            size="sm"
            icon={item.icon}
            onClick={() => onChange(item.mode)}
            aria-pressed={active}
            style={{
              borderRight:  idx < items.length - 1 ? `1.5px solid ${colors.border.default}` : undefined,
              borderRadius: 0,
              background:   active ? colors.accent.subtle   : colors.bg.surface,
              color:        active ? colors.accent.default      : colors.fg.muted,
              fontWeight:   active ? t.font.weight.semibold : t.font.weight.medium,
              height:       34,
              padding:      `0 ${t.space[3]}px`,
            }}
          >
            {item.label}
          </Button>
        )
      })}
    </div>
  )
}


// ─── Cards Grid ───────────────────────────────────────────────────────────────

function CardsGrid({
  data,
  onView,
  onEdit,
  colors,
}: {
  data: FazendaRow[]
  onView: (id: string) => void
  onEdit: (id: string) => void
  colors: ReturnType<typeof useTheme>['colors']
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: t.space[3],
    }}>
      {data.map((row) => (
        <FazendaCard
          key={row.id}
          row={row}
          onView={() => onView(row.id)}
          onEdit={() => onEdit(row.id)}
          colors={colors}
        />
      ))}
    </div>
  )
}

function FazendaCard({
  row,
  onView,
  onEdit,
  colors,
}: {
  row: FazendaRow
  onView: () => void
  onEdit: () => void
  colors: ReturnType<typeof useTheme>['colors']
}) {
  const [hovered, setHovered] = useState(false)
  const tipoVariant = TIPO_VARIANT[row.tipoExploracao] ?? 'neutral'

  return (
    <div
      onClick={onView}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? colors.bg.subtle : colors.bg.surface,
        border: `1.5px solid ${hovered ? t.color.brand[300] : colors.border.default}`,
        borderRadius: t.radius.xl,
        padding: t.space[4],
        cursor: 'pointer',
        transition: `background ${t.transition.base}, border-color ${t.transition.base}, box-shadow ${t.transition.base}`,
        boxShadow: hovered ? t.shadow.cardHover : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: t.space[3],
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <span style={{
          fontSize: t.font.size.md,
          fontWeight: t.font.weight.semibold,
          color: colors.fg.default,
          fontFamily: t.font.family.sans,
          lineHeight: 1.3,
          flex: 1,
        }}>
          {row.nome}
        </span>
        <Badge label={row.ativo ? 'Ativo' : 'Inativo'} variant={row.ativo ? 'success' : 'neutral'} />
      </div>

      {/* Infos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] + 2 }}>
        <InfoRow icon={<MapPin size={12} />} color={colors.fg.subtle}>
          {row.cidade} — {row.uf}
        </InfoRow>
        <InfoRow icon={<Layers size={12} />} color={colors.fg.subtle}>
          <Badge label={row.tipoExploracao} variant={tipoVariant} />
        </InfoRow>
        <InfoRow icon={<Ruler size={12} />} color={colors.fg.subtle}>
          <strong style={{ color: colors.fg.default, fontWeight: t.font.weight.semibold }}>
            {row.areaTotal.toLocaleString('pt-BR')} ha
          </strong>
        </InfoRow>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: colors.border.subtle }} />

      {/* Footer actions */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost" size="sm"
          onClick={onEdit}
        >
          <Pencil size={12} style={{ marginRight: 4 }} />
          Editar
        </Button>
        <Button
          variant="secondary" size="sm"
          onClick={onView}
        >
          <Eye size={12} style={{ marginRight: 4 }} />
          Ver detalhes
        </Button>
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  color,
  children,
}: {
  icon: React.ReactNode
  color: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color, fontSize: t.font.size.sm, fontFamily: t.font.family.sans }}>
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>
      {children}
    </div>
  )
}

