import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { IconButton } from './IconButton'

export interface TreeNode {
  id: string
  label: string
  description?: string
  children?: TreeNode[]
  disabled?: boolean
}

interface TreeViewProps {
  nodes: TreeNode[]
  selectedId?: string | null
  onSelect?: (node: TreeNode) => void
  onAddChild?: (node: TreeNode, depth: number) => void
  onDelete?: (node: TreeNode) => void
  maxDepth?: number
  ariaLabel?: string
}

export function TreeView({
  nodes,
  selectedId,
  onSelect,
  onAddChild,
  onDelete,
  maxDepth,
  ariaLabel = 'Hierarquia',
}: TreeViewProps) {
  const { colors } = useTheme()
  const allIds = useMemo(() => {
    const ids: string[] = []
    const visit = (items: TreeNode[]) => items.forEach((item) => { ids.push(item.id); if (item.children) visit(item.children) })
    visit(nodes)
    return ids
  }, [nodes])
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(allIds))

  const toggle = (id: string) => setExpanded((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  const renderNodes = (items: TreeNode[], depth: number) => (
    <ul role={depth === 0 ? 'tree' : 'group'} aria-label={depth === 0 ? ariaLabel : undefined} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {items.map((node) => {
        const hasChildren = Boolean(node.children?.length)
        const isExpanded = expanded.has(node.id)
        const selected = node.id === selectedId
        const canAdd = onAddChild && (maxDepth === undefined || depth + 1 < maxDepth)
        return (
          <li key={node.id} role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={selected}>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], minHeight: t.size.control, padding: `${t.space[1]}px ${t.space[2]}px ${t.space[1]}px ${depth * t.space[5] + t.space[2]}px`, borderRadius: t.radius.base, background: selected ? colors.accent.subtle : 'transparent' }}>
              {hasChildren ? (
                <IconButton icon={isExpanded ? <ChevronDown size={t.icon.xs} /> : <ChevronRight size={t.icon.xs} />} aria-label={isExpanded ? `Recolher ${node.label}` : `Expandir ${node.label}`} size="xs" variant="ghost" onClick={() => toggle(node.id)} />
              ) : <span aria-hidden="true" style={{ width: t.size.iconBtn.sm }} />}
              <button type="button" className="gb-focusable" disabled={node.disabled} onClick={() => onSelect?.(node)} style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', cursor: node.disabled ? 'not-allowed' : 'pointer', textAlign: 'left', padding: `${t.space[1]}px`, fontFamily: t.font.family.sans, color: node.disabled ? colors.fg.subtle : colors.fg.default }}>
                <span style={{ display: 'block', fontSize: t.font.size.base, fontWeight: t.font.weight.medium }}>{node.label}</span>
                {node.description && <span style={{ display: 'block', marginTop: 2, fontSize: t.font.size.xs, color: colors.fg.subtle }}>{node.description}</span>}
              </button>
              {canAdd && <IconButton icon={<Plus size={t.icon.xs} />} aria-label={`Criar descendente em ${node.label}`} size="sm" variant="ghost" onClick={() => onAddChild(node, depth)} />}
              {onDelete && <IconButton icon={<Trash2 size={t.icon.xs} />} aria-label={hasChildren ? `${node.label} possui descendentes e não pode ser excluído` : `Excluir ${node.label}`} size="sm" variant="ghost" danger disabled={hasChildren} onClick={() => onDelete(node)} />}
            </div>
            {hasChildren && isExpanded && renderNodes(node.children ?? [], depth + 1)}
          </li>
        )
      })}
    </ul>
  )

  return <div style={{ border: `1px solid ${colors.border.default}`, borderRadius: t.radius.lg, padding: t.space[2], background: colors.bg.surface }}>{renderNodes(nodes, 0)}</div>
}
