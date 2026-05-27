import React, { useState, useMemo } from 'react'
import {
  Plus, X, Pencil, Trash2, Package,
  ChevronUp, ChevronDown,
} from 'lucide-react'
import { PageHeader }    from '../../../components/ui/PageHeader'
import { PageContainer } from '../../../components/ui/PageContainer'
import { Button }        from '../../../components/ui/Button'
import { t }             from '../../../design/tokens'
import { useTheme }      from '../../../context/ThemeContext'
import { useToast, TOAST_BG } from '../../../hooks/useToast'
import { SearchInput }         from '../../../components/ui/SearchInput'
import { Modal }               from '../../../components/ui/Modal'
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
  const [sortDir,      setSortDir]     = useState<SortDir>('asc')
  const [deleteTarget, setDeleteTarget] = useState<Embalagem | null>(null)

  const border  = colors.border

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = q ? embalagens.filter(e => e.descricao.toLowerCase().includes(q)) : [...embalagens]
    base.sort((a, b) => {
      const cmp = a.descricao.localeCompare(b.descricao, 'pt-BR')
      return sortDir === 'asc' ? cmp : -cmp
    })
    return base
  }, [embalagens, search, sortDir])

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    onDelete(deleteTarget.id)
    show(`Embalagem "${deleteTarget.descricao}" excluída.`, 'neutral')
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
          <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
            Adicionar Embalagem
          </Button>
        }
      />

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <SearchInput value={search} onChange={setSearch} />
        <span style={{ marginLeft: 'auto', fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans, whiteSpace: 'nowrap' }}>
          {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {/* ── Tabela ──────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState onNew={onNew} hasSearch={search.length > 0} />
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
            gridTemplateColumns: '1fr 140px 160px 96px',
            padding: '10px 16px',
            background: colors.surfaceSubtle,
            borderBottom: `1px solid ${border}`,
          }}>
            {/* Descrição — ordenável */}
            <button
              type="button"
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold,
                color: colors.textMuted, fontFamily: t.font.family.sans,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}
            >
              Descrição
              <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <ChevronUp  size={9} style={{ opacity: sortDir === 'asc'  ? 1 : 0.35 }} />
                <ChevronDown size={9} style={{ opacity: sortDir === 'desc' ? 1 : 0.35 }} />
              </span>
            </button>
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
          {filtered.map((emb, idx) => (
            <EmbalagemRow
              key={emb.id}
              emb={emb}
              isLast={idx === filtered.length - 1}
              onEdit={() => onEdit(emb.id)}
              onDeleteReq={() => setDeleteTarget(emb)}
              colors={colors}
              border={border}
            />
          ))}
        </div>
      )}

      {/* Rodapé */}
      {filtered.length > 0 && (
        <div style={{ marginTop: 10, fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
          N. Registros: {filtered.length}
        </div>
      )}

      {/* ── Modal: Confirmar exclusão ────────────────────────────────────────── */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '4px 0' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trash2 size={22} color="#dc2626" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold,
                color: colors.textPrimary, fontFamily: t.font.family.sans, marginBottom: 8,
              }}>
                Excluir embalagem?
              </div>
              <p style={{
                fontSize: t.font.size.sm, color: colors.textSecondary,
                fontFamily: t.font.family.sans, lineHeight: 1.6, margin: 0,
              }}>
                <strong style={{ color: colors.textPrimary }}>{deleteTarget.descricao}</strong>{' '}
                será excluída permanentemente. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
              <Button variant="secondary" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                style={{ flex: 1 }}
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={13} />
                Excluir
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Toasts ──────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 72, right: 24,
        display: 'flex', flexDirection: 'column', gap: 8,
        zIndex: t.zIndex.toast, pointerEvents: 'none',
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              background: TOAST_BG[toast.type], color: 'white',
              padding: '11px 18px', borderRadius: t.radius.lg,
              fontSize: t.font.size.base, fontWeight: t.font.weight.medium,
              fontFamily: t.font.family.sans, boxShadow: t.shadow.lg,
              display: 'flex', alignItems: 'center', gap: 10,
              pointerEvents: 'auto',
              animation: 'toastIn 0.22s ease',
            }}
          >
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 0, display: 'flex' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(16px) } to { opacity:1; transform:translateX(0) } }`}</style>

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
        <ActionBtn icon={<Pencil size={13} />} label="Editar"  onClick={onEdit}      colors={colors} />
        <ActionBtn icon={<Trash2 size={13} />} label="Excluir" onClick={onDeleteReq} colors={colors} danger />
      </div>
    </div>
  )
}

function ActionBtn({
  icon, label, onClick, colors, danger = false,
}: {
  icon:    React.ReactNode
  label:   string
  onClick: () => void
  colors:  ReturnType<typeof useTheme>['colors']
  danger?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hov ? (danger ? '#fee2e2' : colors.surfaceSubtle) : 'transparent',
        border: `1px solid ${hov ? (danger ? '#fca5a5' : colors.border) : 'transparent'}`,
        borderRadius: t.radius.DEFAULT,
        cursor: 'pointer',
        color: hov ? (danger ? '#dc2626' : colors.textPrimary) : colors.textMuted,
        transition: 'background 0.12s, border-color 0.12s, color 0.12s',
      }}
    >
      {icon}
    </button>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ onNew, hasSearch }: { onNew: () => void; hasSearch: boolean }) {
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
        <Package size={24} color={colors.brand} strokeWidth={1.5} />
      </div>
      <div style={{ fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold, color: colors.textPrimary, fontFamily: t.font.family.sans }}>
        {hasSearch ? 'Nenhuma embalagem encontrada' : 'Nenhuma embalagem cadastrada'}
      </div>
      <div style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans }}>
        {hasSearch ? 'Ajuste o filtro de busca ou' : 'Comece adicionando sua primeira embalagem.'}
      </div>
      {!hasSearch && (
        <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
          Adicionar Embalagem
        </Button>
      )}
    </div>
  )
}

