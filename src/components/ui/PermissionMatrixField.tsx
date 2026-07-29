import React, { useMemo, useState } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { Checkbox } from './Checkbox'
import { IconButton } from './IconButton'
import { EmptyState } from './EmptyState'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { DOCUMENT_LEAF_IDS, LEAF_IDS_BY_NODE, type PermissionNode } from '../../data/permissionsCatalog'

interface PermissionMatrixFieldProps {
  tree: PermissionNode[]
  /** Ids de FOLHA concedidas — nunca ids de módulo/grupo/funcionalidade (estado desses é sempre derivado). */
  selected: string[]
  onChange: (ids: string[]) => void
  searchPlaceholder?: string
}

interface ColumnDef {
  key: string
  label: string
}

const ACTION_COLUMNS: ColumnDef[] = [
  { key: 'view', label: 'Visualizar' },
  { key: 'create', label: 'Criar' },
  { key: 'edit', label: 'Editar' },
  { key: 'delete', label: 'Deletar' },
  { key: 'documentos', label: 'Documentos' },
]

const GRID_TEMPLATE = `minmax(220px, 1fr) repeat(${ACTION_COLUMNS.length}, ${t.size.permissionActionCol}px) ${t.size.permissionQtyCol}px`

// Faixa Unicode das marcas de combinação (acentos) — descartadas após
// normalização NFD para permitir buscar "depreciacao" e achar "Depreciação".
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

function isAggregatorId(id: string): boolean {
  return id.startsWith('perm-mod-') || id.startsWith('perm-group-')
}

function nodeMatches(node: PermissionNode, normalizedQuery: string): boolean {
  if (normalize(node.label).includes(normalizedQuery)) return true
  return (node.children ?? []).some((child) => nodeMatches(child, normalizedQuery))
}

function collectDescendantIds(node: PermissionNode, out: Set<string>) {
  out.add(node.id)
  node.children?.forEach((child) => collectDescendantIds(child, out))
}

/** null = sem busca ativa. Set = ids visíveis (nó bate a busca, é ancestral ou descendente de um que bate). */
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

/** Ids de folha de um nó filtrados por coluna: ação direta (view/create/edit/delete, excluindo sub-recurso) ou "documentos" (só sub-recurso, agregado). */
function leavesForColumn(node: PermissionNode, columnKey: string): string[] {
  const all = LEAF_IDS_BY_NODE.get(node.id) ?? []
  if (columnKey === 'documentos') return all.filter((id) => DOCUMENT_LEAF_IDS.has(id))
  return all.filter((id) => id.endsWith(`.${columnKey}`) && !DOCUMENT_LEAF_IDS.has(id))
}

/**
 * Matriz de permissões: grade de colunas fixas (Visualizar/Criar/Editar/
 * Deletar/Documentos/Qtd) alinhadas em todas as linhas. Módulo e grupo são
 * linhas agregadoras (fundo `bg.subtle`, expansíveis, com contador "X/Y" na
 * coluna Qtd); funcionalidade é linha final (fundo `bg.surface`, sem
 * expansão — suas ações e o agregado de sub-recurso já aparecem inline nas
 * colunas). Todo checkbox de coluna (inclusive nas linhas agregadoras)
 * seleciona/desmarca em massa só as folhas daquela coluna sob aquele nó.
 *
 * Reaproveita `Checkbox`/`IconButton`/`EmptyState` do kit (Lei 1 / Regra A).
 * Invariante: `selected` contém só ids de FOLHA — o estado de qualquer
 * checkbox é sempre derivado via `LEAF_IDS_BY_NODE`/`DOCUMENT_LEAF_IDS`.
 */
export function PermissionMatrixField({
  tree,
  selected,
  onChange,
  searchPlaceholder = 'Buscar...',
}: PermissionMatrixFieldProps) {
  const { colors } = useTheme()
  const [expandedManual, setExpandedManual] = useState<Record<string, boolean>>({})
  const [query, setQuery] = useState('')

  const selectedSet = useMemo(() => new Set(selected), [selected])
  const visibleIds = useMemo(() => computeVisibleIds(tree, query), [tree, query])

  const isOpen = (id: string) => (visibleIds ? visibleIds.has(id) : !!expandedManual[id])
  const toggleExpand = (id: string) => setExpandedManual((prev) => ({ ...prev, [id]: !prev[id] }))

  const toggleLeaves = (leafIds: string[]) => {
    if (leafIds.length === 0) return
    const allSelected = leafIds.every((id) => selectedSet.has(id))
    if (allSelected) {
      const toRemove = new Set(leafIds)
      onChange(selected.filter((id) => !toRemove.has(id)))
    } else {
      const toAdd = leafIds.filter((id) => !selectedSet.has(id))
      onChange([...selected, ...toAdd])
    }
  }

  const totalSelected = selected.length
  const noResults = visibleIds !== null && visibleIds.size === 0

  return (
    <div style={{ border: `1px solid ${colors.border.default}`, borderRadius: t.radius.xl, overflow: 'hidden' }}>
      {/* Busca + contador global */}
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[4], padding: t.space[3], background: colors.bg.surface }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: t.space[2] + 2,
            height: t.size.btn.lg,
            border: `1px solid ${colors.border.default}`,
            borderRadius: t.radius.xl,
            padding: `0 ${t.space[4]}px`,
            background: colors.bg.input,
          }}
        >
          <Search size={16} color={colors.fg.subtle} aria-hidden="true" style={{ flexShrink: 0 }} />
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
              fontSize: t.font.size.md,
              color: colors.fg.default,
              fontFamily: t.font.family.sans,
            }}
          />
          <kbd
            aria-hidden="true"
            style={{
              fontSize: t.font.size.xs,
              background: colors.bg.subtle,
              border: `1px solid ${colors.border.default}`,
              borderRadius: 6,
              padding: '2px 7px',
              color: colors.fg.subtle,
              fontFamily: t.font.family.sans,
              flexShrink: 0,
            }}
          >
            ⌘K
          </kbd>
        </div>
        <span style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.bold, color: colors.fg.default, fontFamily: t.font.family.sans, flexShrink: 0 }}>
          {totalSelected} selecionada{totalSelected !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Cabeçalho de colunas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID_TEMPLATE,
          alignItems: 'center',
          padding: `${t.space[2]}px ${t.space[3]}px`,
          background: colors.bg.subtle,
          borderTop: `1px solid ${colors.border.default}`,
          borderBottom: `1px solid ${colors.border.default}`,
        }}
      >
        <div
          style={{
            fontSize: t.font.size.xs,
            fontWeight: t.font.weight.semibold,
            color: colors.fg.subtle,
            fontFamily: t.font.family.sans,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Funcionalidade
        </div>
        {ACTION_COLUMNS.map((col) => (
          <div
            key={col.key}
            style={{
              textAlign: 'center',
              fontSize: t.font.size['2xs'],
              fontWeight: t.font.weight.semibold,
              color: colors.fg.subtle,
              fontFamily: t.font.family.sans,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {col.label}
          </div>
        ))}
        <div
          style={{
            textAlign: 'center',
            fontSize: t.font.size['2xs'],
            fontWeight: t.font.weight.semibold,
            color: colors.fg.subtle,
            fontFamily: t.font.family.sans,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Qtd
        </div>
      </div>

      {/* Corpo */}
      <div style={{ maxHeight: 560, overflowY: 'auto', overflowX: 'auto' }}>
        {noResults ? (
          <div style={{ padding: t.space[4] }}>
            <EmptyState variant="search" message={`Nenhuma permissão encontrada para "${query}".`} />
          </div>
        ) : (
          tree.map((node) => (
            <MatrixRow
              key={node.id}
              node={node}
              depth={0}
              visibleIds={visibleIds}
              isOpen={isOpen}
              onToggleExpand={toggleExpand}
              selectedSet={selectedSet}
              onToggleLeaves={toggleLeaves}
              colors={colors}
            />
          ))
        )}
      </div>
    </div>
  )
}

function MatrixRow({
  node,
  depth,
  visibleIds,
  isOpen,
  onToggleExpand,
  selectedSet,
  onToggleLeaves,
  colors,
}: {
  node: PermissionNode
  depth: number
  visibleIds: Set<string> | null
  isOpen: (id: string) => boolean
  onToggleExpand: (id: string) => void
  selectedSet: Set<string>
  onToggleLeaves: (leafIds: string[]) => void
  colors: ReturnType<typeof useTheme>['colors']
}) {
  if (visibleIds && !visibleIds.has(node.id)) return null

  const isAggregator = isAggregatorId(node.id)
  const open = isAggregator && isOpen(node.id)
  const allLeaves = LEAF_IDS_BY_NODE.get(node.id) ?? []
  const rowSelectedCount = allLeaves.filter((id) => selectedSet.has(id)).length
  const rowChecked = allLeaves.length > 0 && rowSelectedCount === allLeaves.length
  const rowIndeterminate = rowSelectedCount > 0 && rowSelectedCount < allLeaves.length

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID_TEMPLATE,
          alignItems: 'center',
          minHeight: t.size.tableRow,
          background: isAggregator ? colors.bg.subtle : colors.bg.surface,
          borderBottom: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], paddingLeft: depth * t.space[5] + t.space[2], minWidth: 0 }}>
          {isAggregator ? (
            <IconButton
              icon={
                <ChevronRight
                  size={14}
                  style={{ transform: open ? 'rotate(90deg)' : 'none', transition: `transform ${t.animation.duration.fast}` }}
                />
              }
              aria-label={open ? `Recolher ${node.label}` : `Expandir ${node.label}`}
              aria-expanded={open}
              size="xs"
              variant="ghost"
              onClick={() => onToggleExpand(node.id)}
            />
          ) : (
            <span style={{ width: t.size.iconBtn.sm, flexShrink: 0 }} aria-hidden="true" />
          )}

          <Checkbox checked={rowChecked} indeterminate={rowIndeterminate} onChange={() => onToggleLeaves(allLeaves)} aria-label={node.label} />

          <span
            style={{
              fontSize: t.font.size.sm,
              fontWeight: isAggregator ? t.font.weight.semibold : t.font.weight.normal,
              color: colors.fg.default,
              fontFamily: t.font.family.sans,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {node.label}
          </span>
        </div>

        {ACTION_COLUMNS.map((col) => {
          const leaves = leavesForColumn(node, col.key)
          if (leaves.length === 0) {
            return (
              <div key={col.key} style={{ display: 'flex', justifyContent: 'center' }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: t.size.checkbox,
                    height: t.size.checkbox,
                    borderRadius: t.radius.sm,
                    border: `1.5px solid ${colors.border.subtle}`,
                    opacity: 0.5,
                  }}
                />
              </div>
            )
          }
          const count = leaves.filter((id) => selectedSet.has(id)).length
          const checked = count === leaves.length
          const indeterminate = count > 0 && count < leaves.length
          return (
            <div key={col.key} style={{ display: 'flex', justifyContent: 'center' }}>
              <Checkbox
                checked={checked}
                indeterminate={indeterminate}
                onChange={() => onToggleLeaves(leaves)}
                aria-label={`${col.label} — ${node.label}`}
              />
            </div>
          )
        })}

        <div style={{ textAlign: 'center', fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
          {isAggregator ? `${rowSelectedCount}/${allLeaves.length}` : ''}
        </div>
      </div>

      {isAggregator && open && node.children?.map((child) => (
        <MatrixRow
          key={child.id}
          node={child}
          depth={depth + 1}
          visibleIds={visibleIds}
          isOpen={isOpen}
          onToggleExpand={onToggleExpand}
          selectedSet={selectedSet}
          onToggleLeaves={onToggleLeaves}
          colors={colors}
        />
      ))}
    </div>
  )
}
