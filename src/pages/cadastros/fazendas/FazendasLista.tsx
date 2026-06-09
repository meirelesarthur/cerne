import React, { useState, useMemo, useEffect } from 'react'
import {
  Plus, Pencil, Trash2,
  List, LayoutGrid, MapPin, Layers, Ruler, Eye,
  TrendingUp, TrendingDown,
} from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { PageCard }         from '../../../components/ui/PageCard'
import { Button }          from '../../../components/ui/Button'
import { IconButton }      from '../../../components/ui/IconButton'
import { DataTable }       from '../../../components/ui/DataTable'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { Badge }           from '../../../components/ui/Badge'
import type { BadgeVariant } from '../../../components/ui/Badge'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { ListToolbar } from '../../../components/ui/ListToolbar'
import { FilterButton } from '../../../components/ui/TableToolbar'
import { Pagination }      from '../../../components/ui/Pagination'
import { Skeleton }        from '../../../components/ui/Skeleton'
import { EmptyState }      from '../../../components/ui/EmptyState'
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

  const [data]       = useState<FazendaRow[]>(mockFazendas)
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
      render: (row) => (
        <Badge
          label={row.tipoExploracao}
          variant={TIPO_VARIANT[row.tipoExploracao] ?? 'neutral'}
        />
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
      width: 80,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.space[1] }}>
          <IconButton
            icon={<Eye size={13} />}
            aria-label="Visualizar fazenda"
            tooltip="Visualizar"
            size="sm"
            onClick={() => onView(row.id)}
          />
          <IconButton
            icon={<Pencil size={13} />}
            aria-label="Editar fazenda"
            tooltip="Editar"
            size="sm"
            onClick={() => onEdit(row.id)}
          />
          <IconButton
            icon={<Trash2 size={13} />}
            aria-label="Excluir fazenda"
            tooltip="Excluir"
            size="sm"
            danger
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
              <div style={{ width: 1, height: 22, background: colors.border, flexShrink: 0 }} />
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
            />
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

    </PageContainer>
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

  const cardBg    = isGbMode ? 'rgba(255,255,255,0.04)' : colors.surfaceBg
  const border    = colors.border

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1,
        border: `1px solid ${border}`,
        borderRadius: t.radius.lg,
        overflow: 'hidden',
        marginBottom: 16,
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
            color: colors.textMuted,
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
              color: colors.textPrimary,
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
                  ? t.color.success.text
                  : item.trend === 'down'
                    ? t.color.error.text
                    : colors.textMuted,
                background: item.trend === 'up'
                  ? t.color.success.bg
                  : item.trend === 'down'
                    ? t.color.error.bg
                    : colors.surfaceSubtle,
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
                color: colors.textMuted,
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
      border: `1.5px solid ${colors.border}`,
      borderRadius: t.radius.DEFAULT,
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
              borderRight:  idx < items.length - 1 ? `1.5px solid ${colors.border}` : undefined,
              borderRadius: 0,
              background:   active ? colors.brandBg   : colors.surfaceBg,
              color:        active ? colors.brand      : colors.textSecondary,
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
          <Badge label={row.tipoExploracao} variant={tipoVariant} />
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

