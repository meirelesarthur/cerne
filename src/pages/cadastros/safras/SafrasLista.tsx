import React, { useState, useMemo, useEffect } from 'react'
import {
  Plus, Eye, Pencil, Trash2,
  Info, Calendar, CheckCircle2,
} from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { PageCard }         from '../../../components/ui/PageCard'
import { Button }          from '../../../components/ui/Button'
import { Badge }           from '../../../components/ui/Badge'
import { Modal }           from '../../../components/ui/Modal'
import { ConfirmDialog }   from '../../../components/ui/ConfirmDialog'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { DropdownMenu }    from '../../../components/ui/DropdownMenu'
import { ListToolbar } from '../../../components/ui/ListToolbar'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { Pagination }      from '../../../components/ui/Pagination'
import { Skeleton }        from '../../../components/ui/Skeleton'
import { EmptyState }      from '../../../components/ui/EmptyState'
import { t }               from '../../../design/tokens'
import { useTheme }        from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { fmtYMDtoDMY }    from './safras.types'
import type { Safra }      from './safras.types'

// ─── Props ───────────────────────────────────────────────────────────────────

interface SafrasListaProps {
  safras:   Safra[]
  onNew:    () => void
  onView:   (id: number) => void
  onEdit:   (id: number) => void
  onDelete: (id: number) => void
}

// ─── Componente principal ─────────────────────────────────────────────────────

type StatusFilter = 'todas' | 'ativas' | 'inativas'

export default function SafrasLista({ safras, onNew, onView, onEdit, onDelete }: SafrasListaProps) {
  const { colors, isGbMode } = useTheme()
  const { toasts, show, dismiss } = useToast()

  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas')
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Safra | null>(null)
  /** Ids em soft-delete: já ocultos da lista, aguardando a janela de "Desfazer". */
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<number>>(new Set())
  const [showInfo,     setShowInfo]     = useState(false)
  // Mock síncrono — sem chamada real, não há motivo para simular loading.
  const [isLoading]    = useState(false)
  const [page,         setPage]         = useState(1)
  const PAGE_SIZE = 10

  useEffect(() => { setPage(1) }, [search, statusFilter])

  const activeFilterCount = statusFilter !== 'todas' ? 1 : 0
  const clearFilters = () => setStatusFilter('todas')

  const safrAtual = useMemo(() => {
    const ativas = safras.filter(s => s.ativo === 'sim')
    if (!ativas.length) return null
    return ativas.reduce((a, b) => a.ini > b.ini ? a : b)
  }, [safras])

  const kpis = useMemo(() => ({
    total:      safras.length,
    ativas:     safras.filter(s => s.ativo === 'sim').length,
    encerradas: safras.filter(s => s.ativo === 'nao').length,
  }), [safras])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return safras.filter(s => {
      if (pendingDeleteIds.has(s.id)) return false
      const statusLabel = s.ativo === 'sim' ? 'ativa' : 'inativa'
      const matchSearch = !q || s.desc.toLowerCase().includes(q) || fmtYMDtoDMY(s.ini).includes(q) || fmtYMDtoDMY(s.fim).includes(q) || statusLabel.includes(q) || String(s.weeks.length).includes(q)
      const matchStatus =
        statusFilter === 'todas'   ? true :
        statusFilter === 'ativas'  ? s.ativo === 'sim' :
                                     s.ativo === 'nao'
      return matchSearch && matchStatus
    })
  }, [safras, search, statusFilter, pendingDeleteIds])

  const totalFiltered = filtered.length
  const paginatedData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    const { id, desc } = deleteTarget
    setDeleteTarget(null)
    // Soft-delete otimista: some da lista na hora, mas só remove de fato do
    // estado do pai após a janela de undo (o toast pausa no hover — Toast.tsx).
    setPendingDeleteIds((prev) => new Set(prev).add(id))
    const timer = window.setTimeout(() => {
      setPendingDeleteIds((prev) => { const next = new Set(prev); next.delete(id); return next })
      onDelete(id)
    }, 4000)
    show(`Safra "${desc}" excluída.`, {
      type: 'info',
      duration: 4000,
      action: {
        label: 'Desfazer',
        onClick: () => {
          window.clearTimeout(timer)
          setPendingDeleteIds((prev) => { const next = new Set(prev); next.delete(id); return next })
        },
      },
    })
  }

  const cardBg = isGbMode ? 'rgba(255,255,255,0.04)' : colors.bg.surface

  const columns: Column<Safra>[] = [
    {
      key: 'desc',
      label: 'Descrição',
      sortable: false,
      render: (s) => (
        <span style={{ fontWeight: t.font.weight.semibold, color: colors.accent.default, fontFamily: t.font.family.sans }}>
          {s.desc}
        </span>
      ),
    },
    {
      key: 'ini',
      label: 'Dt. Início',
      width: 120,
      sortable: false,
      render: (s) => (
        <span style={{ fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans, fontVariantNumeric: 'tabular-nums' }}>
          {fmtYMDtoDMY(s.ini)}
        </span>
      ),
    },
    {
      key: 'fim',
      label: 'Dt. Fim',
      width: 120,
      sortable: false,
      render: (s) => (
        <span style={{ fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans, fontVariantNumeric: 'tabular-nums' }}>
          {fmtYMDtoDMY(s.fim)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: 100,
      sortable: false,
      render: (s) => (
        <Badge label={s.ativo === 'sim' ? 'Ativa' : 'Inativa'} variant={s.ativo === 'sim' ? 'success' : 'neutral'} />
      ),
    },
    {
      key: 'weeks',
      label: 'Semanas',
      width: 80,
      align: 'center',
      sortable: false,
      render: (s) => (
        <span style={{ fontSize: t.font.size.sm, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
          {s.weeks.length} sem.
        </span>
      ),
    },
    {
      key: 'acoes',
      label: '',
      width: 52,
      align: 'center',
      sortable: false,
      render: (s) => (
        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', justifyContent: 'center' }}>
          <DropdownMenu
            ariaLabel="Ações da safra"
            align="right"
            items={[
              { id: 'view', label: 'Visualizar', icon: <Eye size={13} />, onClick: () => onView(s.id) },
              { id: 'edit', label: 'Editar', icon: <Pencil size={13} />, onClick: () => onEdit(s.id) },
              { id: 'delete', label: 'Excluir', icon: <Trash2 size={13} />, onClick: () => setDeleteTarget(s), danger: true, divider: true },
            ]}
          />
        </div>
      ),
    },
  ]

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      <PageCard>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <PageHeader
          title="Safras"
          count={safras.length}
          actions={
            <div style={{ display: 'flex', gap: t.space[2], alignItems: 'center' }}>
              <Button
                variant="secondary"
                size="sm"
                icon={<Info size={13} />}
                onClick={() => setShowInfo(true)}
              >
                Saiba Mais
              </Button>
              <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
                Nova Safra
              </Button>
            </div>
          }
        />

        {/* ── Toolbar ───────────────────────────────────────────────────────── */}
        <ListToolbar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Buscar safra..."
          onOpenFilter={() => setDrawerOpen(true)}
          filterCount={activeFilterCount}
          chips={[
            statusFilter !== 'todas' && {
              label: statusFilter === 'ativas' ? 'Ativas' : 'Inativas',
              onRemove: clearFilters,
            },
          ]}
        />

        {/* ── Tabela ────────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rect" width="100%" height={48} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            message="Nenhuma safra encontrada."
            description="Tente ajustar os filtros ou cadastre uma nova safra."
            icon={<Calendar size={40} strokeWidth={1.5} />}
            action={{ label: 'Nova Safra', onClick: onNew }}
          />
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

      {/* ── Confirmação de exclusão ──────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        title="Excluir safra?"
        message={
          deleteTarget
            ? `${deleteTarget.desc} será excluída permanentemente. Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        tone="destructive"
      />

      {/* ── Modal: Saiba Mais ────────────────────────────────────────────── */}
      <Modal
        open={showInfo}
        onClose={() => setShowInfo(false)}
        title="Sobre as Safras"
        size="sm"
        footer={
          <Button variant="primary" onClick={() => setShowInfo(false)}>
            <CheckCircle2 size={14} />
            Entendido
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
          <div style={{
            width:          52,
            height:         52,
            borderRadius:   '50%',
            background:     t.color.feedback.info.bg,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto',
          }}>
            <Info size={22} color={t.color.feedback.info.text} />
          </div>
          <div style={{ fontSize: t.font.size.base, color: colors.fg.muted, lineHeight: t.font.lineHeight.relaxed, fontFamily: t.font.family.sans, display: 'flex', flexDirection: 'column', gap: t.space[2] + 2 }}>
            <p style={{ margin: 0 }}>
              Uma <strong>Safra</strong> é o período agrícola de referência que serve como eixo temporal de toda a gestão da fazenda, definindo o intervalo no qual produção, movimentação de rebanho, custos e receitas são contabilizados.
            </p>
            <p style={{ margin: 0 }}>
              As <strong>cores das semanas</strong> formam um código visual compartilhado em todo o sistema. Em calendários de vacinação, relatórios de produção e controle de rebanho, cada semana é exibida com sua cor identificadora — permitindo que a equipe de campo reconheça períodos rapidamente.
            </p>
            <p style={{ margin: 0 }}>
              Toda entrada de dados no sistema fica <strong>tagueada com a cor da semana vigente</strong> da safra ativa, tornando possível agrupar e filtrar visualmente por período em relatórios.
            </p>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Filter Drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clearFilters}
        title="Filtrar Safras"
        activeCount={activeFilterCount}
      >
        <FormSelect
          label="Status"
          options={[
            { value: 'todas',    label: 'Todas'    },
            { value: 'ativas',   label: 'Ativas'   },
            { value: 'inativas', label: 'Inativas' },
          ]}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as StatusFilter)}
        />
      </FilterDrawer>

    </PageContainer>
  )
}

// ─── KpiCard ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, bg, border, accent, hasBorderRight, compact
}: {
  label: string; value: string; sub: string;
  bg: string; border: string; accent?: string; hasBorderRight?: boolean; compact?: boolean
}) {
  const { colors } = useTheme()
  return (
    <div style={{
      padding:     `${t.space[4]}px ${t.space[5]}px`,
      background:  bg,
      borderRight: hasBorderRight ? `1px solid ${border}` : undefined,
      display:     'flex',
      flexDirection: 'column',
      gap:         t.space[1],
    }}>
      <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.fg.subtle, fontFamily: t.font.family.sans, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{
        fontSize:   compact ? t.font.size.md : t.font.size['3xl'],
        fontWeight: t.font.weight.bold,
        color:      accent ?? colors.fg.default,
        fontFamily: t.font.family.sans,
        lineHeight: 1.1,
        wordBreak:  'break-word',
      }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
          {sub}
        </span>
      )}
    </div>
  )
}

