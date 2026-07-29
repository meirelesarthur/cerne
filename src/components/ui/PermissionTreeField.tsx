import React, { useMemo, useState } from 'react'
import { Search, X, ChevronRight } from 'lucide-react'
import { Checkbox } from './Checkbox'
import { IconButton } from './IconButton'
import { EmptyState } from './EmptyState'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { LEAF_IDS_BY_NODE, type PermissionNode } from '../../data/permissionsCatalog'

interface PermissionTreeFieldProps {
  tree: PermissionNode[]
  /** Ids de FOLHA concedidas — nunca ids de módulo/funcionalidade/sub-recurso (estado desses é sempre derivado). */
  selected: string[]
  onChange: (ids: string[]) => void
  title?: string
  searchPlaceholder?: string
}

// Faixa Unicode das marcas de combinação (acentos) no bloco "Combining
// Diacritical Marks" — descartadas após normalização NFD para permitir
// buscar "depreciacao" e encontrar "Depreciação".
const COMBINING_MARK_RANGE_START = 0x0300
const COMBINING_MARK_RANGE_END = 0x036f

function normalize(value: string): string {
  let result = ''
  for (const char of value.normalize('NFD')) {
    const codePoint = char.codePointAt(0) ?? 0
    if (codePoint < COMBINING_MARK_RANGE_START || codePoint > COMBINING_MARK_RANGE_END) {
      result += char
    }
  }
  return result.toLowerCase()
}

function collectDescendantIds(node: PermissionNode, out: Set<string>) {
  out.add(node.id)
  node.children?.forEach((child) => collectDescendantIds(child, out))
}

/** null = sem busca ativa (renderiza tudo). Set = ids visíveis (nó bate a busca, é ancestral ou descendente de um que bate). */
function computeVisibleIds(tree: PermissionNode[], query: string): Set<string> | null {
  const q = query.trim()
  if (!q) return null
  const normalizedQuery = normalize(q)
  const visible = new Set<string>()

  function walk(node: PermissionNode): boolean {
    const selfMatch = normalize(node.label).includes(normalizedQuery)
    let childMatch = false
    node.children?.forEach((child) => {
      if (walk(child)) childMatch = true
    })
    if (selfMatch || childMatch) {
      visible.add(node.id)
      if (selfMatch) collectDescendantIds(node, visible)
      return true
    }
    return false
  }

  tree.forEach(walk)
  return visible
}

/**
 * Árvore de permissões N-níveis com checkbox tri-state por nó, busca (com
 * normalização de acentos) e contadores "selecionados/total" por nó e global.
 * Generaliza `CategoryTreeField` (2 níveis, sem busca) — reaproveita
 * `Checkbox`/`IconButton`/`EmptyState` do kit, nunca reimplementa essas
 * primitivas localmente (Lei 1 / Regra A).
 *
 * Invariante: `selected` contém só ids de FOLHA. Nós de agregação (módulo/
 * funcionalidade/sub-recurso) nunca entram em `selected` — seu estado
 * checked/indeterminate é sempre derivado via `LEAF_IDS_BY_NODE`.
 */
export function PermissionTreeField({
  tree,
  selected,
  onChange,
  title = 'Permissões',
  searchPlaceholder = 'Buscar permissão...',
}: PermissionTreeFieldProps) {
  const { colors } = useTheme()
  const [expandedManual, setExpandedManual] = useState<Record<string, boolean>>({})
  const [query, setQuery] = useState('')

  const selectedSet = useMemo(() => new Set(selected), [selected])

  const selectedCountByNode = useMemo(() => {
    const map = new Map<string, number>()
    for (const [nodeId, leafIds] of LEAF_IDS_BY_NODE) {
      let count = 0
      for (const leafId of leafIds) if (selectedSet.has(leafId)) count++
      map.set(nodeId, count)
    }
    return map
  }, [selectedSet])

  const visibleIds = useMemo(() => computeVisibleIds(tree, query), [tree, query])

  const isOpen = (id: string) => (visibleIds ? visibleIds.has(id) : !!expandedManual[id])

  const toggleExpand = (id: string) => {
    setExpandedManual((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleNode = (node: PermissionNode) => {
    const leafIds = LEAF_IDS_BY_NODE.get(node.id) ?? [node.id]
    const allSelected = leafIds.every((id) => selectedSet.has(id))
    if (allSelected) {
      const toRemove = new Set(leafIds)
      onChange(selected.filter((id) => !toRemove.has(id)))
    } else {
      const toAdd = leafIds.filter((id) => !selectedSet.has(id))
      onChange([...selected, ...toAdd])
    }
  }

  const renderNode = (node: PermissionNode, depth: number): React.ReactNode => {
    if (visibleIds && !visibleIds.has(node.id)) return null

    const isLeaf = !node.children || node.children.length === 0
    const total = LEAF_IDS_BY_NODE.get(node.id)?.length ?? 1
    const count = selectedCountByNode.get(node.id) ?? 0
    const checked = total > 0 && count === total
    const indeterminate = !isLeaf && count > 0 && count < total
    const open = !isLeaf && isOpen(node.id)

    return (
      <div key={node.id}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.space[2],
            padding: `${t.space[1] + 2}px ${t.space[2]}px`,
            paddingLeft: depth * t.space[5] + t.space[2],
            borderRadius: t.radius.base,
          }}
        >
          {!isLeaf ? (
            <IconButton
              icon={
                <ChevronRight
                  size={14}
                  style={{
                    transform: open ? 'rotate(90deg)' : 'none',
                    transition: `transform ${t.animation.duration.fast}`,
                  }}
                />
              }
              aria-label={open ? `Recolher ${node.label}` : `Expandir ${node.label}`}
              aria-expanded={open}
              size="xs"
              variant="ghost"
              onClick={() => toggleExpand(node.id)}
            />
          ) : (
            <span style={{ width: t.size.iconBtn.sm, flexShrink: 0 }} aria-hidden="true" />
          )}

          <Checkbox checked={checked} indeterminate={indeterminate} onChange={() => toggleNode(node)} aria-label={node.label} />

          <span
            style={{
              flex: 1,
              fontSize: t.font.size.sm,
              fontWeight: isLeaf ? t.font.weight.normal : t.font.weight.semibold,
              color: colors.fg.default,
              fontFamily: t.font.family.sans,
            }}
          >
            {node.label}
          </span>

          {!isLeaf && total > 1 && (
            <span
              style={{
                fontSize: t.font.size.xs,
                color: colors.fg.subtle,
                fontFamily: t.font.family.sans,
                flexShrink: 0,
              }}
            >
              {count}/{total}
            </span>
          )}
        </div>

        {!isLeaf && open && <div>{node.children!.map((child) => renderNode(child, depth + 1))}</div>}
      </div>
    )
  }

  const totalSelected = selected.length
  const noResults = visibleIds !== null && visibleIds.size === 0

  return (
    <div style={{ border: `1px solid ${colors.border.default}`, borderRadius: t.radius.xl, overflow: 'hidden' }}>
      <div
        style={{
          padding: '14px 18px',
          borderBottom: `1px solid ${colors.border.default}`,
          background: colors.bg.subtle,
          display: 'flex',
          flexDirection: 'column',
          gap: t.space[2],
        }}
      >
        <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default, fontFamily: t.font.family.sans }}>
          {title}
          {totalSelected > 0 && (
            <span
              style={{
                marginLeft: 8,
                fontSize: t.font.size.xs,
                fontWeight: t.font.weight.medium,
                padding: '1px 7px',
                borderRadius: t.radius.full,
                background: colors.accent.subtle,
                color: colors.accent.default,
              }}
            >
              {totalSelected} selecionada{totalSelected !== 1 ? 's' : ''}
            </span>
          )}
        </span>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.space[1] + 3,
            height: t.size.controlSm,
            border: `1.5px solid ${colors.border.default}`,
            borderRadius: t.radius.base,
            padding: `0 ${t.space[2] + 2}px`,
            background: colors.bg.surface,
          }}
        >
          <Search size={13} color={colors.fg.subtle} aria-hidden="true" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            spellCheck={false}
            aria-label={searchPlaceholder}
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: t.font.size.sm,
              color: colors.fg.default,
              fontFamily: t.font.family.sans,
            }}
          />
          {query && <IconButton icon={<X size={11} />} aria-label="Limpar busca" size="xs" onClick={() => setQuery('')} />}
        </div>
      </div>

      <div style={{ padding: '8px 10px 12px', display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 420, overflowY: 'auto' }}>
        {noResults ? <EmptyState variant="search" message={`Nenhuma permissão encontrada para "${query}".`} /> : tree.map((node) => renderNode(node, 0))}
      </div>
    </div>
  )
}
