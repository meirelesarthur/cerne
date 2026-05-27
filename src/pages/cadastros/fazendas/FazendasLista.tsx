import React, { useState, useMemo, useEffect } from 'react'
import {
  Plus, Pencil, Trash2, SlidersHorizontal, X,
  List, LayoutGrid, MapPin, Layers, Ruler, Eye,
} from 'lucide-react'
import { PageHeader }    from '../../../components/ui/PageHeader'
import { PageContainer } from '../../../components/ui/PageContainer'
import { Button }        from '../../../components/ui/Button'
import { DataTable }     from '../../../components/ui/DataTable'
import { FilterDrawer }  from '../../../components/ui/FilterDrawer'
import { Badge }         from '../../../components/ui/Badge'
import { FormSelect }    from '../../../components/ui/FormSelect'
import { SearchInput }   from '../../../components/ui/SearchInput'
import { Modal }         from '../../../components/ui/Modal'
import { Pagination }    from '../../../components/ui/Pagination'
import { KpiBar }        from '../../../components/ui/KpiBar'
import { t }             from '../../../design/tokens'
import { useTheme }      from '../../../context/ThemeContext'
import { useToast, TOAST_BG } from '../../../hooks/useToast'
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

// ─── Tipo paleta por exploração ───────────────────────────────────────────────

const TIPO_COLOR: Record<string, { bg: string; text: string }> = {
  'Agrícola':     { bg: t.color.brand[50],     text: t.color.brand[600]    },
  'Pecuário':     { bg: t.color.info.bg,        text: t.color.info.text     },
  'Misto':        { bg: t.color.warning.bg,     text: t.color.warning.text  },
  'Silvicultura': { bg: '#f5f3ff',              text: '#7c3aed'             },
  'Piscicultura': { bg: '#ecfeff',              text: '#0891b2'             },
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function FazendasLista({ onNew, onView, onEdit }: FazendasListaProps) {
  const { colors } = useTheme()

  const [data]       = useState<FazendaRow[]>(mockFazendas)
  const [viewMode,   setViewMode]   = useState<ViewMode>('list')
  const [search,     setSearch]     = useState('')
  const [filters,    setFilters]    = useState({ tipoExploracao: '', ativo: '' })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FazendaRow | null>(null)
  const [page,       setPage]       = useState(1)
  const [pageSize,   setPageSize]   = useState(10)
  const { toasts, show } = useToast()

  useEffect(() => { setPage(1) }, [search, filters])

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

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  )

  const activeFilterCount = [filters.tipoExploracao, filters.ativo].filter(Boolean).length
  const clearFilters = () => setFilters({ tipoExploracao: '', ativo: '' })

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    // TODO: chamar API de deleção
    setDeleteTarget(null)
    show(`Fazenda "${deleteTarget.nome}" excluída.`, 'success')
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
        <span style={{ color: colors.textSecondary, fontSize: 12 }}>{row.cpfCnpj}</span>
      ),
    },
    {
      key: 'cidadeUf',
      label: 'Cidade / UF',
      render: (row) => (
        <span style={{ color: colors.textSecondary }}>
          {row.cidade} — {row.uf}
        </span>
      ),
    },
    {
      key: 'tipoExploracao',
      label: 'Tipo Exploração',
      render: (row) => {
        const c = TIPO_COLOR[row.tipoExploracao] ?? { bg: colors.surfaceSubtle, text: colors.textSecondary }
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            background: c.bg, color: c.text,
            fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
            padding: '2px 8px', borderRadius: t.radius.full,
          }}>
            {row.tipoExploracao}
          </span>
        )
      },
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
      width: 80,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="ghost" size="sm"
            style={{ width: 30, height: 30, padding: 0 }}
            onClick={(e) => { e.stopPropagation(); onView(row.id) }}
            title="Visualizar" aria-label="Visualizar fazenda"
          >
            <Eye size={13} />
          </Button>
          <Button
            variant="ghost" size="sm"
            style={{ width: 30, height: 30, padding: 0 }}
            onClick={(e) => { e.stopPropagation(); onEdit(row.id) }}
            title="Editar" aria-label="Editar fazenda"
          >
            <Pencil size={13} />
          </Button>
          <Button
            variant="ghost" size="sm"
            style={{ width: 30, height: 30, padding: 0, color: t.color.neutral[400] }}
            onMouseEnter={e => { e.currentTarget.style.color = t.color.error.text }}
            onMouseLeave={e => { e.currentTarget.style.color = t.color.neutral[400] }}
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row) }}
            title="Excluir" aria-label="Excluir fazenda"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer>

      {/* ── PageHeader ──────────────────────────────────────────────────── */}
      <PageHeader
        title="Fazendas"
        count={data.length}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
              size="md"
              icon={<SlidersHorizontal size={13} />}
              onClick={() => setDrawerOpen(true)}
            >
              Filtros
              {activeFilterCount > 0 && (
                <span style={{
                  background: 'rgba(255,255,255,0.25)',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: t.radius.full,
                  marginLeft: 2,
                }}>
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
              Nova Fazenda
            </Button>
          </div>
        }
      />

      {/* ── KPI Bar ─────────────────────────────────────────────────────── */}
      <KpiBar items={[
        { label: 'Total de Fazendas', value: String(kpis.total), sub: 'cadastradas', trend: 'neutral' },
        { label: 'Ativas', value: String(kpis.ativas), trendValue: `${kpis.ativasPct}%`, trend: 'up', trendLabel: 'percentual do total' },
        { label: 'Inativas', value: String(kpis.inativas), trendValue: kpis.total > 0 ? `${100 - kpis.ativasPct}%` : '0%', trend: kpis.inativas > 0 ? 'down' : 'neutral', trendLabel: 'percentual do total' },
        { label: 'Área Total', value: kpis.areaTotalHa.toLocaleString('pt-BR'), sub: 'hectares', trend: 'up' },
      ]} />

      {/* ── Toolbar: search (esq.) → chips → [spacer] → toggle (dir.) ────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 4, flexWrap: 'wrap' }}>

        {/* Busca — extrema esquerda */}
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar fazenda..." />

        {search.trim() && (
          <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans, whiteSpace: 'nowrap' }}>
            {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
          </span>
        )}

        {/* Chips de filtro ativos */}
        {filters.tipoExploracao && (
          <FilterChip
            label={`Tipo: ${filters.tipoExploracao}`}
            onRemove={() => setFilters((f) => ({ ...f, tipoExploracao: '' }))}
          />
        )}
        {filters.ativo && (
          <FilterChip
            label={filters.ativo === 'true' ? 'Ativo' : 'Inativo'}
            onRemove={() => setFilters((f) => ({ ...f, ativo: '' }))}
          />
        )}
        {activeFilterCount > 1 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar tudo
          </Button>
        )}

        {/* Espaçador */}
        <div style={{ flex: 1 }} />

        {/* Separador vertical */}
        <div style={{ width: 1, height: 22, background: colors.border, flexShrink: 0 }} />

        {/* Toggle Lista / Cards — extrema direita */}
        <ViewToggle value={viewMode} onChange={setViewMode} colors={colors} />
      </div>

      {/* ── Conteúdo: Lista ou Cards ─────────────────────────────────────── */}
      {viewMode === 'list' ? (
        <DataTable<FazendaRow>
          columns={columns}
          data={paginated}
          keyField="id"
          emptyMessage="Nenhuma fazenda encontrada."
          onRowClick={(row) => onView(row.id)}
        />
      ) : (
        <CardsGrid
          data={paginated}
          onView={onView}
          onEdit={onEdit}
          colors={colors}
        />
      )}

      <Pagination
        page={page}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={size => { setPageSize(size); setPage(1) }}
      />

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

      {/* Modal de confirmação de exclusão */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: t.color.error.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Trash2 size={22} color={t.color.error.text} />
            </div>
            <div style={{ fontSize: t.font.size.xl, fontWeight: t.font.weight.semibold, color: colors.textPrimary, marginBottom: 8, fontFamily: t.font.family.sans }}>
              Excluir Fazenda
            </div>
            <p style={{ fontSize: t.font.size.base, color: colors.textMuted, lineHeight: 1.6, fontFamily: t.font.family.sans, margin: '0 0 24px' }}>
              Tem certeza que deseja excluir{' '}
              <strong style={{ color: colors.textPrimary }}>{deleteTarget.nome}</strong>?{' '}
              Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                style={{ background: t.color.error.solid, color: 'white', border: 'none' }}
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={13} />
                Excluir
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toasts */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        display: 'flex', flexDirection: 'column', gap: 8,
        zIndex: t.zIndex.toast, pointerEvents: 'none',
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            style={{
              background: TOAST_BG[toast.type],
              color: 'white',
              padding: '11px 18px',
              borderRadius: t.radius.lg,
              fontSize: t.font.size.base,
              fontWeight: t.font.weight.medium,
              fontFamily: t.font.family.sans,
              boxShadow: t.shadow.lg,
              animation: 'toastIn 0.22s ease',
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

    </PageContainer>
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
      border: `1.5px solid ${colors.border}`,
      borderRadius: t.radius.DEFAULT,
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {items.map((item, idx) => {
        const active = value === item.mode
        return (
          <button
            key={item.mode}
            type="button"
            onClick={() => onChange(item.mode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 34,
              padding: '0 12px',
              border: 'none',
              borderRight: idx < items.length - 1 ? `1.5px solid ${colors.border}` : undefined,
              background: active ? colors.brandBg : colors.surfaceBg,
              color: active ? colors.brand : colors.textSecondary,
              fontSize: t.font.size.sm,
              fontWeight: active ? t.font.weight.semibold : t.font.weight.medium,
              fontFamily: t.font.family.sans,
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
            aria-pressed={active}
          >
            {item.icon}
            {item.label}
          </button>
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
  if (data.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: `${t.space[16]}px ${t.space[4]}px`,
        color: colors.textMuted,
        fontSize: t.font.size.base,
        fontFamily: t.font.family.sans,
      }}>
        Nenhuma fazenda encontrada.
      </div>
    )
  }

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
  const tipoColor = TIPO_COLOR[row.tipoExploracao] ?? { bg: colors.surfaceSubtle, text: colors.textSecondary }

  return (
    <div
      onClick={onView}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? colors.surfaceSubtle : colors.surfaceBg,
        border: `1.5px solid ${hovered ? t.color.brand[300] : colors.border}`,
        borderRadius: t.radius.xl,
        padding: t.space[4],
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
        boxShadow: hovered ? `0 4px 16px rgba(5,150,105,0.10)` : 'none',
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
          color: colors.textPrimary,
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
        <InfoRow icon={<MapPin size={12} />} color={colors.textMuted}>
          {row.cidade} — {row.uf}
        </InfoRow>
        <InfoRow icon={<Layers size={12} />} color={colors.textMuted}>
          <span style={{
            background: tipoColor.bg, color: tipoColor.text,
            fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
            padding: '1px 7px', borderRadius: t.radius.full,
          }}>
            {row.tipoExploracao}
          </span>
        </InfoRow>
        <InfoRow icon={<Ruler size={12} />} color={colors.textMuted}>
          <strong style={{ color: colors.textPrimary, fontWeight: t.font.weight.semibold }}>
            {row.areaTotal.toLocaleString('pt-BR')} ha
          </strong>
        </InfoRow>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: colors.borderSubtle }} />

      {/* Footer actions */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost" size="sm"
          style={{ height: 28, padding: '0 8px', fontSize: t.font.size.xs }}
          onClick={onEdit}
        >
          <Pencil size={12} style={{ marginRight: 4 }} />
          Editar
        </Button>
        <Button
          variant="secondary" size="sm"
          style={{ height: 28, padding: '0 8px', fontSize: t.font.size.xs }}
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

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const { colors } = useTheme()
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: t.space[1],
      height: 34,
      background: colors.brandBg,
      border: `1.5px solid ${colors.brand}`,
      borderRadius: t.radius.DEFAULT,
      padding: `0 ${t.space[2]}px 0 ${t.space[2] + 2}px`,
      fontSize: t.font.size.sm,
      color: colors.brand,
      fontFamily: t.font.family.sans,
      fontWeight: t.font.weight.medium,
    }}>
      {label}
      <button
        type="button"
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.brand, display: 'flex', alignItems: 'center', padding: 0 }}
      >
        <X size={11} />
      </button>
    </div>
  )
}

