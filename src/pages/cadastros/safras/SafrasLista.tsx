import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  Plus, Search, X, MoreVertical, Eye, Pencil, Trash2,
  Info, Calendar, CheckCircle2,
} from 'lucide-react'
import { PageHeader }    from '../../../components/ui/PageHeader'
import { PageContainer } from '../../../components/ui/PageContainer'
import { Button }        from '../../../components/ui/Button'
import { Badge }         from '../../../components/ui/Badge'
import { t }             from '../../../design/tokens'
import { useTheme }      from '../../../context/ThemeContext'
import { fmtYMDtoDMY }  from './safras.types'
import type { Safra }    from './safras.types'

// ─── Props ───────────────────────────────────────────────────────────────────

interface SafrasListaProps {
  safras:   Safra[]
  onNew:    () => void
  onView:   (id: number) => void
  onEdit:   (id: number) => void
  onDelete: (id: number) => void
}

// ─── Toast ───────────────────────────────────────────────────────────────────

interface ToastItem {
  id: number
  message: string
  type: 'ok' | 'inf' | 'error'
}

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const show = useCallback((message: string, type: ToastItem['type'] = 'ok') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3400)
  }, [])
  return { toasts, show }
}

const TOAST_BG: Record<ToastItem['type'], string> = {
  ok:    '#14532d',
  inf:   '#1d4ed8',
  error: '#dc2626',
}

// ─── Componente principal ─────────────────────────────────────────────────────

type StatusFilter = 'todas' | 'ativas' | 'inativas'

export default function SafrasLista({ safras, onNew, onView, onEdit, onDelete }: SafrasListaProps) {
  const { colors, isGbMode } = useTheme()
  const { toasts, show } = useToast()

  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>('todas')
  const [openDropId,    setOpenDropId]    = useState<number | null>(null)
  const [deleteTarget,  setDeleteTarget]  = useState<Safra | null>(null)
  const [showInfo,      setShowInfo]      = useState(false)

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    if (openDropId === null) return
    const handler = () => setOpenDropId(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [openDropId])

  // ── Safra atual (ativa com ini mais recente) ─────────────────────────────
  const safrAtual = useMemo(() => {
    const ativas = safras.filter(s => s.ativo === 'sim')
    if (!ativas.length) return null
    return ativas.reduce((a, b) => a.ini > b.ini ? a : b)
  }, [safras])

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => ({
    total:     safras.length,
    ativas:    safras.filter(s => s.ativo === 'sim').length,
    encerradas: safras.filter(s => s.ativo === 'nao').length,
  }), [safras])

  // ── Filtro ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return safras.filter(s => {
      const matchSearch = !q || s.desc.toLowerCase().includes(q)
      const matchStatus =
        statusFilter === 'todas'   ? true :
        statusFilter === 'ativas'  ? s.ativo === 'sim' :
                                     s.ativo === 'nao'
      return matchSearch && matchStatus
    })
  }, [safras, search, statusFilter])

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    onDelete(deleteTarget.id)
    setDeleteTarget(null)
    show(`Safra "${deleteTarget.desc}" excluída.`, 'inf')
  }

  const cardBg   = isGbMode ? 'rgba(255,255,255,0.04)' : colors.surfaceBg
  const border   = colors.border

  // ── Pills de status ───────────────────────────────────────────────────────
  const pills: { id: StatusFilter; label: string; dot?: string }[] = [
    { id: 'todas',    label: 'Todas' },
    { id: 'ativas',   label: 'Ativas',   dot: '#16a34a' },
    { id: 'inativas', label: 'Inativas', dot: '#94a3b8' },
  ]

  return (
    <PageContainer>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <PageHeader
        title="Safras"
        count={safras.length}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1,
        border: `1px solid ${border}`,
        borderRadius: t.radius.lg,
        overflow: 'hidden',
        marginBottom: 16,
      }}>
        <KpiCard label="Total de Safras" value={String(kpis.total)} sub="cadastradas" bg={cardBg} border={border} />
        <KpiCard
          label="Ativas"
          value={String(kpis.ativas)}
          sub=""
          bg={cardBg}
          border={border}
          accent="#16a34a"
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
          accent="#94a3b8"
        />
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <SearchInput value={search} onChange={setSearch} />
        <div style={{ width: 1, height: 22, background: border, flexShrink: 0 }} />
        <div style={{ display: 'flex', gap: 4 }}>
          {pills.map(p => {
            const active = statusFilter === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setStatusFilter(p.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  height: 32,
                  padding: '0 12px',
                  background: active ? '#f0fdf4' : 'transparent',
                  border: `1.5px solid ${active ? '#16a34a' : border}`,
                  borderRadius: t.radius.full,
                  fontSize: t.font.size.sm,
                  fontWeight: active ? t.font.weight.semibold : t.font.weight.medium,
                  color: active ? '#166534' : colors.textSecondary,
                  cursor: 'pointer',
                  fontFamily: t.font.family.sans,
                  transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                }}
              >
                {p.dot && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? p.dot : colors.textMuted, flexShrink: 0 }} />
                )}
                {p.label}
              </button>
            )
          })}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans, whiteSpace: 'nowrap' }}>
          {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {/* ── Tabela ────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState onNew={onNew} />
      ) : (
        <div style={{
          background: colors.surfaceBg,
          border: `1px solid ${border}`,
          borderRadius: t.radius.lg,
          overflow: 'hidden',
        }}>
          {/* Cabeçalho */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 120px 100px 80px 52px',
            padding: '10px 16px',
            background: colors.surfaceSubtle,
            borderBottom: `1px solid ${border}`,
          }}>
            {['Descrição', 'Dt. Início', 'Dt. Fim', 'Status', 'Semanas', ''].map((h, i) => (
              <span key={i} style={{
                fontSize: t.font.size.xs,
                fontWeight: t.font.weight.semibold,
                color: colors.textMuted,
                fontFamily: t.font.family.sans,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: i >= 4 ? 'center' : undefined,
              }}>
                {h}
              </span>
            ))}
          </div>

          {/* Linhas */}
          {filtered.map((safra, idx) => (
            <SafraRow
              key={safra.id}
              safra={safra}
              isLast={idx === filtered.length - 1}
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
      )}

      {/* Rodapé */}
      <div style={{ marginTop: 10, fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
        N. Registros: {filtered.length}
      </div>

      {/* ── Modal: Confirmar exclusão ────────────────────────────────────── */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Trash2 size={22} color="#dc2626" />
            </div>
            <div style={{ fontSize: t.font.size.xl, fontWeight: t.font.weight.semibold, color: '#171717', marginBottom: 8, fontFamily: t.font.family.sans }}>
              Excluir Safra
            </div>
            <p style={{ fontSize: t.font.size.base, color: '#6b7280', lineHeight: 1.6, fontFamily: t.font.family.sans, margin: '0 0 24px' }}>
              Tem certeza que deseja excluir{' '}
              <strong style={{ color: '#171717' }}>{deleteTarget.desc}</strong>?{' '}
              Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                style={{ background: '#dc2626', color: 'white', border: 'none' }}
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={13} />
                Excluir
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Saiba Mais ────────────────────────────────────────────── */}
      {showInfo && (
        <Modal onClose={() => setShowInfo(false)}>
          <div>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#dbeafe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Info size={22} color="#1d4ed8" />
            </div>
            <div style={{ fontSize: t.font.size.xl, fontWeight: t.font.weight.semibold, color: '#171717', marginBottom: 12, textAlign: 'center', fontFamily: t.font.family.sans }}>
              Sobre as Safras
            </div>
            <div style={{ fontSize: t.font.size.base, color: '#404040', lineHeight: 1.7, fontFamily: t.font.family.sans, display: 'flex', flexDirection: 'column', gap: 10 }}>
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
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button variant="primary" onClick={() => setShowInfo(false)}>
                <CheckCircle2 size={14} />
                Entendido
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Toasts ──────────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: t.zIndex.toast,
        pointerEvents: 'none',
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
  safra: Safra
  isLast: boolean
  openDropId: number | null
  onOpenDrop: (id: number | null) => void
  onView: (id: number) => void
  onEdit: (id: number) => void
  onDeleteReq: (s: Safra) => void
  colors: ReturnType<typeof useTheme>['colors']
  border: string
}) {
  const [hovered, setHovered] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const isOpen = openDropId === safra.id

  const isAtiva = safra.ativo === 'sim'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 120px 120px 100px 80px 52px',
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : `1px solid ${border}`,
        background: hovered ? colors.surfaceSubtle : 'transparent',
        transition: 'background 0.12s',
        cursor: 'pointer',
        alignItems: 'center',
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

      {/* Status badge */}
      <div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '2px 9px',
          background: isAtiva ? '#dcfce7' : '#f1f5f9',
          color: isAtiva ? '#166534' : '#475569',
          borderRadius: t.radius.full,
          fontSize: t.font.size.xs,
          fontWeight: t.font.weight.medium,
          fontFamily: t.font.family.sans,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isAtiva ? '#16a34a' : '#94a3b8', flexShrink: 0 }} />
          {isAtiva ? 'Ativa' : 'Inativa'}
        </span>
      </div>

      {/* Semanas */}
      <span style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans, textAlign: 'center' }}>
        {safra.weeks.length} sem.
      </span>

      {/* Ações */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
        <button
          ref={btnRef}
          type="button"
          onClick={e => {
            e.stopPropagation()
            onOpenDrop(isOpen ? null : safra.id)
          }}
          style={{
            width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isOpen ? colors.surfaceSubtle : 'transparent',
            border: `1px solid ${isOpen ? border : 'transparent'}`,
            borderRadius: t.radius.DEFAULT,
            cursor: 'pointer',
            color: colors.textMuted,
            transition: 'background 0.12s, border-color 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = colors.surfaceSubtle; e.currentTarget.style.borderColor = border }}
          onMouseLeave={e => {
            if (!isOpen) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
            }
          }}
          aria-label="Ações"
        >
          <MoreVertical size={14} />
        </button>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 4,
              background: '#ffffff',
              border: `1px solid #e5e7eb`,
              borderRadius: t.radius.lg,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: 140,
              zIndex: t.zIndex.dropdown,
              overflow: 'hidden',
              animation: 'dropIn 0.12s ease',
            }}
          >
            <DropItem icon={<Eye size={13} />} label="Visualizar" onClick={() => { onOpenDrop(null); onView(safra.id) }} />
            <DropItem icon={<Pencil size={13} />} label="Editar" onClick={() => { onOpenDrop(null); onEdit(safra.id) }} />
            <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
            <DropItem icon={<Trash2 size={13} />} label="Excluir" onClick={() => { onOpenDrop(null); onDeleteReq(safra) }} danger />
          </div>
        )}
      </div>
    </div>
  )
}

function DropItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', textAlign: 'left',
        padding: '8px 14px',
        background: hov ? (danger ? '#fee2e2' : '#f5f5f5') : 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: t.font.size.sm,
        color: danger ? '#dc2626' : '#404040',
        fontFamily: t.font.family.sans,
        fontWeight: t.font.weight.medium,
        transition: 'background 0.1s',
      }}
    >
      {icon}
      {label}
    </button>
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
      padding: `${t.space[4]}px ${t.space[5]}px`,
      background: bg,
      borderRight: hasBorderRight ? `1px solid ${border}` : undefined,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.textMuted, fontFamily: t.font.family.sans, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{
        fontSize: compact ? t.font.size.md : t.font.size['3xl'],
        fontWeight: t.font.weight.bold,
        color: accent ?? colors.textPrimary,
        fontFamily: t.font.family.sans,
        lineHeight: 1.1,
        wordBreak: 'break-word',
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

// ─── SearchInput ──────────────────────────────────────────────────────────────

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7, height: 34,
      border: `1.5px solid ${focused ? t.color.brand[600] : colors.border}`,
      borderRadius: t.radius.DEFAULT, padding: '0 10px',
      background: colors.surfaceBg, transition: 'border-color 0.15s', minWidth: 220,
    }}>
      <Search size={13} color={focused ? t.color.brand[600] : colors.textMuted} style={{ flexShrink: 0 }} />
      <input
        type="search"
        placeholder="Buscar safra..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, border: 'none', background: 'transparent', outline: 'none',
          fontSize: t.font.size.sm, color: colors.textPrimary, fontFamily: t.font.family.sans, minWidth: 0,
        }}
      />
      {value && (
        <button type="button" onClick={() => onChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: colors.textMuted }}>
          <X size={11} />
        </button>
      )}
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  const { colors } = useTheme()
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 20px', gap: 12, textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, background: colors.brandBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Calendar size={24} color={colors.brand} strokeWidth={1.5} />
      </div>
      <div style={{ fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold, color: colors.textPrimary, fontFamily: t.font.family.sans }}>
        Nenhuma safra encontrada
      </div>
      <div style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans }}>
        Ajuste os filtros ou crie uma nova safra.
      </div>
      <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
        Adicionar Safra
      </Button>
    </div>
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: t.zIndex.overlay,
        padding: 24,
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: '32px 28px',
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          animation: 'modalIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalIn { from { opacity: 0; transform: scale(.94) translateY(10px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes dropIn  { from { opacity: 0; transform: translateY(-5px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  )
}
