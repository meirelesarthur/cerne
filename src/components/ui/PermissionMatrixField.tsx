import React, { useMemo, useState } from 'react'
import { Search, X, ChevronRight } from 'lucide-react'
import { Checkbox } from './Checkbox'
import { IconButton } from './IconButton'
import { EmptyState } from './EmptyState'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { LEAF_IDS_BY_NODE, type PermissionNode } from '../../data/permissionsCatalog'

interface PermissionMatrixFieldProps {
  tree: PermissionNode[]
  /** Ids de FOLHA concedidas — nunca ids de módulo/funcionalidade/sub-recurso (estado desses é sempre derivado). */
  selected: string[]
  onChange: (ids: string[]) => void
  title?: string
  searchPlaceholder?: string
}

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

function isLeaf(node: PermissionNode): boolean {
  return !node.children || node.children.length === 0
}

function nodeMatches(node: PermissionNode, normalizedQuery: string): boolean {
  if (normalize(node.label).includes(normalizedQuery)) return true
  return (node.children ?? []).some((child) => nodeMatches(child, normalizedQuery))
}

/** Rótulos de ação (colunas) de um módulo — lidos da primeira funcionalidade com folhas diretas (todas as funcionalidades de um módulo compartilham o mesmo conjunto de ações). */
function getModuleActionLabels(module: PermissionNode): string[] {
  for (const feature of module.children ?? []) {
    const directLeaves = (feature.children ?? []).filter(isLeaf)
    if (directLeaves.length > 0) return directLeaves.map((leaf) => leaf.label)
  }
  for (const feature of module.children ?? []) {
    for (const branch of feature.children ?? []) {
      const directLeaves = (branch.children ?? []).filter(isLeaf)
      if (directLeaves.length > 0) return directLeaves.map((leaf) => leaf.label)
    }
  }
  return ['Visualizar', 'Criar', 'Editar', 'Deletar']
}

/**
 * Matriz de permissões: cada módulo é uma seção com cabeçalho cinza
 * (organizacional, sem checkbox — só expande/recolhe) e uma tabela de
 * funcionalidades por baixo. Cada linha de funcionalidade tem um checkbox
 * "selecionar tudo" à esquerda e uma coluna por ação (Visualizar/Criar/Editar/
 * Deletar). Quando a funcionalidade tem sub-recurso aninhado (ex.: "Documentos"
 * dentro de "Contas a Pagar"), o sub-recurso aparece como um bloco extra de
 * colunas na mesma linha, com seu próprio rótulo.
 *
 * Reaproveita `Checkbox`/`IconButton`/`EmptyState` do kit (Lei 1 / Regra A).
 * Invariante: `selected` contém só ids de FOLHA — o estado da linha (checked/
 * indeterminate) é sempre derivado via `LEAF_IDS_BY_NODE`.
 */
export function PermissionMatrixField({
  tree,
  selected,
  onChange,
  title = 'Permissões',
  searchPlaceholder = 'Buscar permissão...',
}: PermissionMatrixFieldProps) {
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

  const normalizedQuery = query.trim() ? normalize(query.trim()) : ''

  const visibleModules = useMemo(() => {
    if (!normalizedQuery) return tree.map((module) => ({ module, features: module.children ?? [] }))
    return tree
      .map((module) => {
        const moduleLabelMatches = normalize(module.label).includes(normalizedQuery)
        const features = moduleLabelMatches
          ? module.children ?? []
          : (module.children ?? []).filter((feature) => nodeMatches(feature, normalizedQuery))
        return { module, features }
      })
      .filter((entry) => entry.features.length > 0)
  }, [tree, normalizedQuery])

  const isExpanded = (moduleId: string) => (normalizedQuery ? true : !!expandedManual[moduleId])
  const toggleExpand = (moduleId: string) => setExpandedManual((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }))

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

  const totalSelected = selected.length
  const noResults = normalizedQuery !== '' && visibleModules.length === 0

  return (
    <div style={{ border: `1px solid ${colors.border.default}`, borderRadius: t.radius.xl, overflow: 'hidden' }}>
      {/* Cabeçalho: título + contador + busca */}
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

      {/* Corpo: seções por módulo */}
      <div style={{ maxHeight: 520, overflowY: 'auto', overflowX: 'auto' }}>
        {noResults ? (
          <div style={{ padding: t.space[4] }}>
            <EmptyState variant="search" message={`Nenhuma permissão encontrada para "${query}".`} />
          </div>
        ) : (
          visibleModules.map(({ module, features }) => {
            const open = isExpanded(module.id)
            const total = LEAF_IDS_BY_NODE.get(module.id)?.length ?? 0
            const count = selectedCountByNode.get(module.id) ?? 0
            const actionLabels = getModuleActionLabels(module)

            return (
              <div key={module.id} style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                {/* Cabeçalho do módulo — cinza, sem checkbox, só expande/recolhe */}
                <button
                  type="button"
                  className="gb-focusable"
                  onClick={() => toggleExpand(module.id)}
                  aria-expanded={open}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.space[2],
                    padding: `${t.space[2]}px ${t.space[3]}px`,
                    background: colors.bg.subtle,
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <ChevronRight
                    size={14}
                    color={colors.fg.subtle}
                    style={{ transform: open ? 'rotate(90deg)' : 'none', transition: `transform ${t.animation.duration.fast}`, flexShrink: 0 }}
                  />
                  <span style={{ flex: 1, fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default, fontFamily: t.font.family.sans }}>
                    {module.label}
                  </span>
                  <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans, flexShrink: 0 }}>
                    {count}/{total}
                  </span>
                </button>

                {open && (
                  <div>
                    {/* Cabeçalho de colunas — alinhado aos checkboxes de ação de cada linha */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: `${t.space[1]}px ${t.space[3]}px`, background: colors.bg.surface }}>
                      <div style={{ width: t.size.permissionFeatureCol, flexShrink: 0 }} />
                      {actionLabels.map((label) => (
                        <div
                          key={label}
                          style={{
                            width: t.size.permissionActionCol,
                            flexShrink: 0,
                            textAlign: 'center',
                            fontSize: t.font.size['2xs'],
                            fontWeight: t.font.weight.semibold,
                            color: colors.fg.subtle,
                            fontFamily: t.font.family.sans,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {label}
                        </div>
                      ))}
                    </div>

                    {features.map((feature) => (
                      <FeatureRow
                        key={feature.id}
                        feature={feature}
                        selectedSet={selectedSet}
                        selectedCountByNode={selectedCountByNode}
                        onToggle={toggleNode}
                        colors={colors}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function FeatureRow({
  feature,
  selectedSet,
  selectedCountByNode,
  onToggle,
  colors,
}: {
  feature: PermissionNode
  selectedSet: Set<string>
  selectedCountByNode: Map<string, number>
  onToggle: (node: PermissionNode) => void
  colors: ReturnType<typeof useTheme>['colors']
}) {
  const children = feature.children ?? []
  const leaves = children.filter(isLeaf)
  const branches = children.filter((child) => !isLeaf(child))

  const total = LEAF_IDS_BY_NODE.get(feature.id)?.length ?? 0
  const count = selectedCountByNode.get(feature.id) ?? 0
  const checked = total > 0 && count === total
  const indeterminate = count > 0 && count < total

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${t.space[1] + 2}px ${t.space[3]}px`,
        borderTop: `1px solid ${colors.border.subtle}`,
        gap: t.space[4],
      }}
    >
      <div style={{ width: t.size.permissionFeatureCol, flexShrink: 0, display: 'flex', alignItems: 'center', gap: t.space[2] }}>
        <Checkbox checked={checked} indeterminate={indeterminate} onChange={() => onToggle(feature)} aria-label={feature.label} />
        <span style={{ fontSize: t.font.size.sm, color: colors.fg.default, fontFamily: t.font.family.sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {feature.label}
        </span>
      </div>

      {leaves.length > 0 && (
        <div style={{ display: 'flex' }}>
          {leaves.map((leaf) => (
            <div key={leaf.id} style={{ width: t.size.permissionActionCol, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
              <Checkbox checked={selectedSet.has(leaf.id)} onChange={() => onToggle(leaf)} aria-label={`${leaf.label} — ${feature.label}`} />
            </div>
          ))}
        </div>
      )}

      {branches.map((branch) => {
        const branchLeaves = (branch.children ?? []).filter(isLeaf)
        return (
          <div
            key={branch.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              paddingLeft: t.space[4],
              borderLeft: `1px solid ${colors.border.subtle}`,
            }}
          >
            <span style={{ fontSize: t.font.size['2xs'], fontWeight: t.font.weight.medium, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
              {branch.label}
            </span>
            <div style={{ display: 'flex' }}>
              {branchLeaves.map((leaf) => (
                <div key={leaf.id} style={{ width: t.size.permissionActionCol, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                  <Checkbox checked={selectedSet.has(leaf.id)} onChange={() => onToggle(leaf)} aria-label={`${leaf.label} — ${branch.label}`} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
