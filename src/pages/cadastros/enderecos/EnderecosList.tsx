import { useState, useMemo } from 'react'
import {
  Plus, Pencil, Trash2, ChevronRight, MapPin,
} from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { PageCard }         from '../../../components/ui/PageCard'
import { Button }          from '../../../components/ui/Button'
import { IconButton }      from '../../../components/ui/IconButton'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { FilterButton } from '../../../components/ui/TableToolbar'
import { ListToolbar } from '../../../components/ui/ListToolbar'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { ConfirmDialog }   from '../../../components/ui/ConfirmDialog'
import { EmptyState }      from '../../../components/ui/EmptyState'
import { t }               from '../../../design/tokens'
import { useTheme }        from '../../../context/ThemeContext'
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

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EnderecosList({
  enderecos, onAddRoot, onAddChild, onEdit, onDelete,
}: Props) {
  const { colors } = useTheme()
  const { toasts, show, dismiss } = useToast()

  const [search,       setSearch]       = useState('')
  const [filters,      setFilters]      = useState({ tipo: '' })
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Endereco | null>(null)
  const [expandedIds,  setExpandedIds]  = useState<Set<number>>(() => {
    // expandir setores por padrão
    const s = new Set<number>()
    enderecos.filter(e => e.tipo === 'setor').forEach(e => s.add(e.id))
    return s
  })

  const activeFilterCount = [filters.tipo].filter(Boolean).length
  const clearFilters = () => setFilters({ tipo: '' })

  const border = colors.border

  const tree = useMemo(() => buildTree(enderecos), [enderecos])

  // busca flat — filtra nós que batem e mantém ancestrais
  const filteredTree = useMemo(() => {
    const q = search.trim().toLowerCase()
    function filterNodes(nodes: EnderecoNode[]): EnderecoNode[] {
      return nodes.reduce<EnderecoNode[]>((acc, node) => {
        const childMatches = filterNodes(node.children)
        const selfMatch = (!q || node.descricao.toLowerCase().includes(q)) && (!filters.tipo || node.tipo === filters.tipo)
        if (selfMatch || childMatches.length > 0) {
          acc.push({ ...node, children: childMatches })
        }
        return acc
      }, [])
    }
    return filterNodes(tree)
  }, [tree, search, filters])

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
    show(`Endereçamento "${deleteTarget.descricao}" excluído.`, 'info')
    setDeleteTarget(null)
  }

  const totalCount = enderecos.length

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      <PageCard>

        {/* ── Header ────────────────────────────────────────────────────────────── */}
        <PageHeader
          title="Endereçamentos"
          count={totalCount}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FilterButton
                active={activeFilterCount > 0}
                count={activeFilterCount}
                onClick={() => setDrawerOpen(true)}
              />
              <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onAddRoot}>
                Adicionar Setor
              </Button>
            </div>
          }
        />

        {/* ── Toolbar ───────────────────────────────────────────────────────────── */}
        <ListToolbar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Buscar endereçamento..."
          chips={[
            filters.tipo && {
              label: `Tipo: ${TIPO_LABEL[filters.tipo as keyof typeof TIPO_LABEL] ?? filters.tipo}`,
              onRemove: () => setFilters(f => ({ ...f, tipo: '' })),
            },
          ]}
        />

        {/* ── Tree ──────────────────────────────────────────────────────────────── */}
        {filteredTree.length === 0 ? (
          search.length > 0 ? (
            <EmptyState
              icon={<MapPin size={40} strokeWidth={1.5} />}
              message="Nenhum endereçamento encontrado"
              description="Ajuste o filtro de busca."
            />
          ) : (
            <EmptyState
              icon={<MapPin size={40} strokeWidth={1.5} />}
              message="Nenhum endereçamento cadastrado"
              description="Comece adicionando o primeiro setor."
              action={{ label: 'Adicionar Setor', onClick: onAddRoot }}
            />
          )
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

      </PageCard>

      {/* ── Confirmar exclusão ────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir endereçamento?"
        message={
          deleteTarget
            ? `"${deleteTarget.descricao}"${enderecos.some(e => e.parentId === deleteTarget.id) ? ' e todos os seus sub-endereçamentos' : ''} serão excluídos permanentemente. Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        tone="destructive"
      />

      {/* ── Toasts ────────────────────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Filter Drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clearFilters}
        title="Filtrar Endereçamentos"
        activeCount={activeFilterCount}
      >
        <FormSelect
          label="Tipo"
          options={[
            { value: '',         label: 'Todos'     },
            { value: 'setor',    label: 'Setor'     },
            { value: 'corredor', label: 'Corredor'  },
          ]}
          value={filters.tipo}
          onChange={e => setFilters(f => ({ ...f, tipo: e.target.value }))}
        />
      </FilterDrawer>

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
          padding: '0 16px',
          paddingLeft: 16 + indent,
          height: t.size.tableRow,
          borderBottom: isLastRow && depth === 0 ? 'none' : `1px solid ${border}`,
          background: hovered ? colors.surfaceSubtle : 'transparent',
          transition: 'background 0.12s',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Descrição */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          {/* Toggle ▼/► */}
          {hasChildren ? (
            <IconButton
              icon={
                <ChevronRight
                  size={13}
                  style={{
                    transform: isExpanded ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.15s ease',
                    flexShrink: 0,
                  }}
                />
              }
              aria-label={isExpanded ? 'Recolher' : 'Expandir'}
              onClick={() => onToggle(node.id)}
              size="xs"
            />
          ) : (
            <span style={{ width: 18, height: 18, flexShrink: 0 }} />
          )}
          <span title={node.descricao} style={{
            fontSize: t.font.size.base,
            fontWeight: depth === 0 ? t.font.weight.semibold : t.font.weight.medium,
            color: depth === 0 ? colors.brand : colors.textPrimary,
            fontFamily: t.font.family.sans,
            minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
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
            <IconButton
              icon={<Plus size={13} />}
              aria-label={`Adicionar ${TIPO_LABEL[TIPO_CHILD[node.tipo]!]}`}
              onClick={() => onAddChild(node.id)}
              size="sm"
              variant="ghost"
            />
          )}
          <IconButton icon={<Pencil size={13} />} aria-label="Editar"  onClick={() => onEdit(node.id)}   size="sm" variant="ghost" />
          <IconButton icon={<Trash2 size={13} />} aria-label="Excluir" onClick={() => onDeleteReq(node)} size="sm" variant="ghost" danger />
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


