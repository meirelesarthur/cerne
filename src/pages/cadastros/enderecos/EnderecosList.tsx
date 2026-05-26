import React, { useState, useMemo } from 'react'
import {
  Plus, Pencil, Trash2, ChevronRight, MapPin, Search, X,
} from 'lucide-react'
import { PageHeader }    from '../../../components/ui/PageHeader'
import { PageContainer } from '../../../components/ui/PageContainer'
import { Button }        from '../../../components/ui/Button'
import { t }             from '../../../design/tokens'
import { useTheme }      from '../../../context/ThemeContext'
import {
  buildTree, TIPO_LABEL, TIPO_COLOR, TIPO_CHILD,
  type Endereco, type EnderecoNode,
} from './enderecos.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  enderecos:    Endereco[]
  onAddRoot:    () => void
  onAddChild:   (parentId: number) => void
  onEdit:       (id: number) => void
  onDelete:     (id: number) => void
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastMsg { id: number; text: string; type: 'ok' | 'neutral' | 'err' }

const TOAST_BG: Record<ToastMsg['type'], string> = {
  ok:      '#14532d',
  neutral: '#374151',
  err:     '#dc2626',
}

function useToast() {
  const [items, setItems] = useState<ToastMsg[]>([])
  const show = (text: string, type: ToastMsg['type'] = 'ok') => {
    const id = Date.now()
    setItems(p => [...p, { id, text, type }])
    setTimeout(() => setItems(p => p.filter(i => i.id !== id)), 4000)
  }
  const dismiss = (id: number) => setItems(p => p.filter(i => i.id !== id))
  return { items, show, dismiss }
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EnderecosList({
  enderecos, onAddRoot, onAddChild, onEdit, onDelete,
}: Props) {
  const { colors } = useTheme()
  const { items: toasts, show, dismiss } = useToast()

  const [search,       setSearch]       = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Endereco | null>(null)
  const [expandedIds,  setExpandedIds]  = useState<Set<number>>(() => {
    // expandir setores por padrão
    const s = new Set<number>()
    enderecos.filter(e => e.tipo === 'setor').forEach(e => s.add(e.id))
    return s
  })

  const border = colors.border

  const tree = useMemo(() => buildTree(enderecos), [enderecos])

  // busca flat — filtra nós que batem e mantém ancestrais
  const filteredTree = useMemo(() => {
    if (!search.trim()) return tree
    const q = search.trim().toLowerCase()
    function filterNodes(nodes: EnderecoNode[]): EnderecoNode[] {
      return nodes.reduce<EnderecoNode[]>((acc, node) => {
        const childMatches = filterNodes(node.children)
        const selfMatch = node.descricao.toLowerCase().includes(q)
        if (selfMatch || childMatches.length > 0) {
          acc.push({ ...node, children: childMatches })
        }
        return acc
      }, [])
    }
    return filterNodes(tree)
  }, [tree, search])

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    onDelete(deleteTarget.id)
    show(`Endereçamento "${deleteTarget.descricao}" excluído.`, 'neutral')
    setDeleteTarget(null)
  }

  const totalCount = enderecos.length

  return (
    <PageContainer>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <PageHeader
        title="Endereçamentos"
        count={totalCount}
        actions={
          <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onAddRoot}>
            Adicionar Setor
          </Button>
        }
      />

      {/* ── Toolbar ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <SearchInput value={search} onChange={setSearch} />
        <span style={{ marginLeft: 'auto', fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans, whiteSpace: 'nowrap' }}>
          {totalCount} {totalCount === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {/* ── Tree ──────────────────────────────────────────────────────────────── */}
      {filteredTree.length === 0 ? (
        <EmptyState onAddRoot={onAddRoot} hasSearch={search.length > 0} />
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
            gridTemplateColumns: '1fr 120px 104px',
            padding: '10px 16px',
            background: colors.surfaceSubtle,
            borderBottom: `1px solid ${border}`,
          }}>
            {['Descrição', 'Tipo', 'Ações'].map((h, i) => (
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

          {/* Nodes */}
          {filteredTree.map((node, idx) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              isLastSibling={idx === filteredTree.length - 1}
              expandedIds={expandedIds}
              onToggle={toggleExpand}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDeleteReq={setDeleteTarget}
              colors={colors}
              border={border}
              forceExpand={search.length > 0}
            />
          ))}
        </div>
      )}

      {/* ── Modal: Confirmar exclusão ──────────────────────────────────────────── */}
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
                Excluir endereçamento?
              </div>
              <p style={{
                fontSize: t.font.size.sm, color: colors.textSecondary,
                fontFamily: t.font.family.sans, lineHeight: 1.6, margin: 0,
              }}>
                <strong style={{ color: colors.textPrimary }}>{deleteTarget.descricao}</strong>
                {enderecos.some(e => e.parentId === deleteTarget.id) && (
                  <> e todos os seus sub-endereçamentos</>
                )}{' '}
                serão excluídos permanentemente. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
              <Button variant="secondary" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" style={{ flex: 1 }} onClick={handleDeleteConfirm}>
                <Trash2 size={13} />
                Excluir
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Toasts ────────────────────────────────────────────────────────────── */}
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
              pointerEvents: 'auto', animation: 'toastIn 0.22s ease',
            }}
          >
            <span style={{ flex: 1 }}>{toast.text}</span>
            <button onClick={() => dismiss(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 0, display: 'flex' }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateX(16px) } to { opacity:1; transform:translateX(0) } }
        @keyframes modalIn { from { opacity:0; transform:scale(.94) translateY(10px) } to { opacity:1; transform:scale(1) translateY(0) } }
      `}</style>

    </PageContainer>
  )
}

// ─── TreeNode (recursivo) ─────────────────────────────────────────────────────

function TreeNode({
  node, depth, isLastSibling, expandedIds, onToggle, onAddChild,
  onEdit, onDeleteReq, colors, border, forceExpand,
}: {
  node:           EnderecoNode
  depth:          number
  isLastSibling:  boolean
  expandedIds:    Set<number>
  onToggle:       (id: number) => void
  onAddChild:     (parentId: number) => void
  onEdit:         (id: number) => void
  onDeleteReq:    (e: Endereco) => void
  colors:         ReturnType<typeof useTheme>['colors']
  border:         string
  forceExpand:    boolean
}) {
  const [hovered, setHovered] = useState(false)
  const hasChildren = node.children.length > 0
  const isExpanded  = forceExpand || expandedIds.has(node.id)
  const canHaveChild = Boolean(TIPO_CHILD[node.tipo])
  const tipoColor = TIPO_COLOR[node.tipo]
  const indent = depth * 24

  const isLastRow = isLastSibling && (!isExpanded || !hasChildren)

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 120px 104px',
          padding: '10px 16px',
          paddingLeft: 16 + indent,
          borderBottom: isLastRow && depth === 0 ? 'none' : `1px solid ${border}`,
          background: hovered ? colors.surfaceSubtle : 'transparent',
          transition: 'background 0.12s',
          alignItems: 'center',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Descrição */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          {/* Toggle ▼/► */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggle(node.id)}
              style={{
                width: 18, height: 18, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
                color: colors.textMuted, borderRadius: t.radius.sm,
                transition: 'color 0.12s',
              }}
            >
              <ChevronRight
                size={13}
                style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.15s ease',
                  flexShrink: 0,
                }}
              />
            </button>
          ) : (
            <span style={{ width: 18, height: 18, flexShrink: 0 }} />
          )}
          <span style={{
            fontSize: t.font.size.base,
            fontWeight: depth === 0 ? t.font.weight.semibold : t.font.weight.medium,
            color: depth === 0 ? colors.brand : colors.textPrimary,
            fontFamily: t.font.family.sans,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {node.descricao}
          </span>
        </div>

        {/* Tipo (badge) */}
        <div>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '2px 9px', borderRadius: t.radius.full,
            fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
            fontFamily: t.font.family.sans,
            background: tipoColor.bg, color: tipoColor.text,
          }}>
            {TIPO_LABEL[node.tipo]}
          </span>
        </div>

        {/* Ações inline */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
          {canHaveChild && (
            <ActionBtn
              icon={<Plus size={12} />}
              label={`Adicionar ${TIPO_LABEL[TIPO_CHILD[node.tipo]!]}`}
              onClick={() => onAddChild(node.id)}
              colors={colors}
            />
          )}
          <ActionBtn icon={<Pencil size={12} />} label="Editar"  onClick={() => onEdit(node.id)}      colors={colors} />
          <ActionBtn icon={<Trash2 size={12} />} label="Excluir" onClick={() => onDeleteReq(node)}    colors={colors} danger />
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && node.children.map((child, idx) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          isLastSibling={idx === node.children.length - 1 && isLastSibling}
          expandedIds={expandedIds}
          onToggle={onToggle}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDeleteReq={onDeleteReq}
          colors={colors}
          border={border}
          forceExpand={forceExpand}
        />
      ))}
    </>
  )
}

// ─── ActionBtn ────────────────────────────────────────────────────────────────

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
        width: 28, height: 28,
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

// ─── SearchInput ──────────────────────────────────────────────────────────────

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7, height: 34,
      border: `1.5px solid ${focused ? t.color.brand[600] : colors.border}`,
      borderRadius: t.radius.DEFAULT, padding: '0 10px',
      background: colors.surfaceBg, transition: 'border-color 0.15s', minWidth: 240,
    }}>
      <Search size={13} color={focused ? t.color.brand[600] : colors.textMuted} style={{ flexShrink: 0 }} />
      <input
        type="search"
        placeholder="Buscar endereçamento..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, border: 'none', background: 'transparent', outline: 'none',
          fontSize: t.font.size.sm, color: colors.textPrimary,
          fontFamily: t.font.family.sans, minWidth: 0,
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

function EmptyState({ onAddRoot, hasSearch }: { onAddRoot: () => void; hasSearch: boolean }) {
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
        <MapPin size={24} color={colors.brand} strokeWidth={1.5} />
      </div>
      <div style={{ fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold, color: colors.textPrimary, fontFamily: t.font.family.sans }}>
        {hasSearch ? 'Nenhum endereçamento encontrado' : 'Nenhum endereçamento cadastrado'}
      </div>
      <div style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans }}>
        {hasSearch ? 'Ajuste o filtro de busca.' : 'Comece adicionando o primeiro setor.'}
      </div>
      {!hasSearch && (
        <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onAddRoot}>
          Adicionar Setor
        </Button>
      )}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const { colors } = useTheme()
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: t.zIndex.overlay, padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.surfaceBg, borderRadius: 24, padding: 28,
          maxWidth: 420, width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
