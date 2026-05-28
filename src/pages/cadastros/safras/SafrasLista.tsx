import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Plus, MoreVertical, Eye, Pencil, Trash2,
  Info, Calendar, CheckCircle2,
} from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { Button }          from '../../../components/ui/Button'
import { Badge }           from '../../../components/ui/Badge'
import { Modal }           from '../../../components/ui/Modal'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { IconButton }      from '../../../components/ui/IconButton'
import { TableSearchInput, FilterChip, FilterButton } from '../../../components/ui/TableToolbar'
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
  const [openDropId,   setOpenDropId]   = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Safra | null>(null)
  const [showInfo,     setShowInfo]     = useState(false)
  const [isLoading,    setIsLoading]    = useState(true)
  const [page,         setPage]         = useState(1)
  const PAGE_SIZE = 10

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => { setPage(1) }, [search, statusFilter])

  const activeFilterCount = statusFilter !== 'todas' ? 1 : 0
  const clearFilters = () => setStatusFilter('todas')

  useEffect(() => {
    if (openDropId === null) return
    const handler = () => setOpenDropId(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [openDropId])

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
      const statusLabel = s.ativo === 'sim' ? 'ativa' : 'inativa'
      const matchSearch = !q || s.desc.toLowerCase().includes(q) || s.ini.includes(q) || s.fim.includes(q) || statusLabel.includes(q) || String(s.weeks.length).includes(q)
      const matchStatus =
        statusFilter === 'todas'   ? true :
        statusFilter === 'ativas'  ? s.ativo === 'sim' :
                                     s.ativo === 'nao'
      return matchSearch && matchStatus
    })
  }, [safras, search, statusFilter])

  const totalFiltered = filtered.length
  const paginatedData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    onDelete(deleteTarget.id)
    setDeleteTarget(null)
    show(`Safra "${deleteTarget.desc}" excluída.`, 'info')
  }

  const cardBg = isGbMode ? 'rgba(255,255,255,0.04)' : colors.surfaceBg
  const border  = colors.border

  return (
    <PageContainer>

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

      {/* ── KPI cards ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[4], marginBottom: t.space[4] }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rect" width="100%" height={80} />
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          border: `1px solid ${border}`,
          borderRadius: t.radius.lg,
          overflow: 'hidden',
          marginBottom: t.space[4],
        }}>
          <KpiCard label="Total de Safras" value={String(kpis.total)} sub="cadastradas" bg={cardBg} border={border} hasBorderRight />
          <KpiCard
            label="Ativas"
            value={String(kpis.ativas)}
            sub=""
            bg={cardBg}
            border={border}
            accent={t.color.success.text}
            hasBorderRight
          />
          <KpiCard
            label="Safra Atual"
            value={safrAtual?.desc ?? '—'}
            sub={safrAtual ? `${fmtYMDtoDMY(safrAtual.ini)} — ${fmtYMDtoDMY(safrAtual.fim)}` : 'Nenhuma ativa'}
            bg={cardBg}
            border={border}
            hasBorderRight
            compact
          />
          <KpiCard
            label="Encerradas"
            value={String(kpis.encerradas)}
            sub=""
            bg={cardBg}
            border={border}
            accent={t.color.neutral[400]}
          />
        </div>
      )}

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] + 2, marginBottom: t.space[3], flexWrap: 'wrap' }}>
        <TableSearchInput value={search} onChange={setSearch} placeholder="Buscar safra..." />
        {statusFilter !== 'todas' && (
          <FilterChip
            label={statusFilter === 'ativas' ? 'Ativas' : 'Inativas'}
            onRemove={clearFilters}
          />
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
        <>
          <div style={{
            background:   colors.surfaceBg,
            border:       `1px solid ${border}`,
            borderRadius: t.radius.lg,
            overflow:     'hidden',
          }}>
            {/* Cabeçalho */}
            <div style={{
              display:         'grid',
              gridTemplateColumns: '1fr 120px 120px 100px 80px 52px',
              padding:         `${t.space[2] + 2}px ${t.space[4]}px`,
              background:      colors.surfaceSubtle,
              borderBottom:    `1px solid ${border}`,
            }}>
              {['Descrição', 'Dt. Início', 'Dt. Fim', 'Status', 'Semanas', ''].map((h, i) => (
                <span key={i} style={{
                  fontSize:      t.font.size.xs,
                  fontWeight:    t.font.weight.semibold,
                  color:         colors.textMuted,
                  fontFamily:    t.font.family.sans,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign:     i >= 4 ? 'center' : undefined,
                }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Linhas */}
            {paginatedData.map((safra, idx) => (
              <SafraRow
                key={safra.id}
                safra={safra}
                isLast={idx === paginatedData.length - 1}
                openDropId={openDropId}
                onOpenDrop={setOpenDropId}
                onView={onView}
                onEdit={onEdit}
                onDeleteReq={setDeleteTarget}
                colors={colors}
                border={border}
              />
            ))}
          </div>

          {totalFiltered > PAGE_SIZE && (
            <div style={{
              marginTop:  t.space[4],
              paddingTop: t.space[4],
              borderTop:  `1px solid ${colors.borderSubtle}`,
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

      {/* ── Modal: Confirmar exclusão ────────────────────────────────────── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              <Trash2 size={13} />
              Excluir Safra…
            </Button>
          </>
        }
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width:          52,
            height:         52,
            borderRadius:   '50%',
            background:     t.color.error.bg,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto',
            marginBottom:   t.space[4],
          }}>
            <Trash2 size={22} color={t.color.error.solid} />
          </div>
          <p style={{
            fontSize:   t.font.size.base,
            color:      colors.textSecondary,
            lineHeight: t.font.lineHeight.relaxed,
            fontFamily: t.font.family.sans,
            margin:     0,
          }}>
            Tem certeza que deseja excluir{' '}
            <strong style={{ color: colors.textPrimary }}>{deleteTarget?.desc}</strong>?{' '}
            Esta ação não pode ser desfeita.
          </p>
        </div>
      </Modal>

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
            background:     t.color.info.bg,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto',
          }}>
            <Info size={22} color={t.color.info.text} />
          </div>
          <div style={{ fontSize: t.font.size.base, color: colors.textSecondary, lineHeight: t.font.lineHeight.relaxed, fontFamily: t.font.family.sans, display: 'flex', flexDirection: 'column', gap: t.space[2] + 2 }}>
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

// ─── SafraRow ─────────────────────────────────────────────────────────────────

function SafraRow({
  safra,
  isLast,
  openDropId,
  onOpenDrop,
  onView,
  onEdit,
  onDeleteReq,
  colors,
  border,
}: {
  safra:        Safra
  isLast:       boolean
  openDropId:   number | null
  onOpenDrop:   (id: number | null) => void
  onView:       (id: number) => void
  onEdit:       (id: number) => void
  onDeleteReq:  (s: Safra) => void
  colors:       ReturnType<typeof useTheme>['colors']
  border:       string
}) {
  const [hovered, setHovered] = useState(false)
  const isOpen  = openDropId === safra.id
  const isAtiva = safra.ativo === 'sim'

  return (
    <div
      style={{
        display:         'grid',
        gridTemplateColumns: '1fr 120px 120px 100px 80px 52px',
        padding:         `${t.space[3]}px ${t.space[4]}px`,
        borderBottom:    isLast ? 'none' : `1px solid ${border}`,
        background:      hovered ? colors.surfaceSubtle : 'transparent',
        transition:      `background ${t.transition.fast}`,
        cursor:          'pointer',
        alignItems:      'center',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onView(safra.id)}
    >
      {/* Descrição */}
      <span style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.semibold, color: colors.brand, fontFamily: t.font.family.sans }}>
        {safra.desc}
      </span>

      {/* Dt. Início */}
      <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans, fontVariantNumeric: 'tabular-nums' }}>
        {fmtYMDtoDMY(safra.ini)}
      </span>

      {/* Dt. Fim */}
      <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans, fontVariantNumeric: 'tabular-nums' }}>
        {fmtYMDtoDMY(safra.fim)}
      </span>

      {/* Status badge — usa componente Badge */}
      <div>
        <Badge label={isAtiva ? 'Ativa' : 'Inativa'} variant={isAtiva ? 'success' : 'neutral'} />
      </div>

      {/* Semanas */}
      <span style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans, textAlign: 'center' }}>
        {safra.weeks.length} sem.
      </span>

      {/* Ações — dropdown */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
        <IconButton
          icon={<MoreVertical size={14} />}
          aria-label="Ações da safra"
          size="sm"
          variant={isOpen ? 'outline' : 'ghost'}
          onClick={() => onOpenDrop(isOpen ? null : safra.id)}
        />

        {isOpen && (
          <div
            role="menu"
            style={{
              position:    'absolute',
              top:         '100%',
              right:       0,
              marginTop:   t.space[1],
              background:  colors.surfaceBg,
              border:      `1px solid ${colors.border}`,
              borderRadius: t.radius.lg,
              boxShadow:   t.shadow.lg,
              minWidth:    140,
              zIndex:      t.zIndex.dropdown,
              overflow:    'hidden',
              animation:   'dropIn 0.12s ease',
            }}
          >
            <Button block variant="ghost" size="sm" icon={<Eye size={13} />}
              onClick={() => { onOpenDrop(null); onView(safra.id) }}
            >
              Visualizar
            </Button>
            <Button block variant="ghost" size="sm" icon={<Pencil size={13} />}
              onClick={() => { onOpenDrop(null); onEdit(safra.id) }}
            >
              Editar
            </Button>
            <div style={{ height: 1, background: colors.borderSubtle, margin: `${t.space[1]}px 0` }} />
            <Button block variant="ghost" size="sm" icon={<Trash2 size={13} />}
              style={{ color: t.color.error.text }}
              onClick={() => { onOpenDrop(null); onDeleteReq(safra) }}
            >
              Excluir
            </Button>
          </div>
        )}
      </div>
    </div>
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
      <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.textMuted, fontFamily: t.font.family.sans, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{
        fontSize:   compact ? t.font.size.md : t.font.size['3xl'],
        fontWeight: t.font.weight.bold,
        color:      accent ?? colors.textPrimary,
        fontFamily: t.font.family.sans,
        lineHeight: 1.1,
        wordBreak:  'break-word',
      }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
          {sub}
        </span>
      )}
    </div>
  )
}

// ─── Animações ────────────────────────────────────────────────────────────────

const globalStyles = `
  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-5px) scale(.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    @keyframes dropIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
  }
`

// Injetar estilos globais uma vez
if (typeof document !== 'undefined' && !document.getElementById('safras-lista-styles')) {
  const s = document.createElement('style')
  s.id = 'safras-lista-styles'
  s.textContent = globalStyles
  document.head.appendChild(s)
}
