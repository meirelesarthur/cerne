import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

export interface Column<T> {
  key: string
  label: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  emptyMessage?: string
  loading?: boolean
  onRowClick?: (row: T) => void
  /**
   * Retorna os filhos de uma linha (2º nível hierárquico). Quando informado,
   * habilita expand/collapse com chevron na primeira coluna — linhas sem
   * filhos permanecem inalteradas. Ex.: áreas internas de uma fazenda.
   */
  getChildren?: (row: T) => T[] | undefined
}

function SortIcon({ active, color }: { active?: boolean; color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: active ? 1 : 0.35 }}>
      <path d="M7 15l5 5 5-5" stroke={active ? t.color.brand[600] : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9l5-5 5 5" stroke={active ? t.color.brand[600] : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DataTable<T extends object>({
  columns,
  data,
  keyField,
  emptyMessage = 'Nenhum registro encontrado.',
  loading,
  onRowClick,
  getChildren,
}: DataTableProps<T>) {
  const { colors, isGbMode } = useTheme()
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

  const handleSort = (colKey: string) => {
    if (sortCol === colKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortCol(colKey); setSortDir('asc') }
  }

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Achata a árvore em uma lista linear { row, level } — só desce para os
  // filhos de linhas explicitamente expandidas.
  function flattenRows(rows: T[], level = 0): { row: T; level: number }[] {
    return rows.flatMap((row) => {
      const key = String(row[keyField])
      const children = getChildren?.(row)
      const entry = { row, level }
      if (children && children.length > 0 && expandedKeys.has(key)) {
        return [entry, ...flattenRows(children, level + 1)]
      }
      return [entry]
    })
  }

  const flatRows = getChildren ? flattenRows(data) : data.map((row) => ({ row, level: 0 }))

  // Derived colors
  const borderColor   = colors.border.default
  const borderSubtle  = colors.border.subtle
  const theadBg       = isGbMode ? t.color.state.row.hoverGb : t.color.neutral[50]
  const rowBg         = colors.bg.surface
  const rowHoverBg    = isGbMode ? t.color.state.row.selectedGb : t.color.neutral[50]
  const textHead      = colors.fg.muted
  const textCell      = colors.fg.default
  const emptyColor    = colors.fg.subtle

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: t.radius.lg,
        overflow: 'hidden',
        width: '100%',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: theadBg, borderBottom: `1px solid ${borderColor}` }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{
                    fontSize: t.font.size.xs,
                    fontWeight: t.font.weight.semibold,
                    color: textHead,
                    fontFamily: t.font.family.sans,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: `${t.space[2] + 2}px ${t.space[4]}px`,
                    textAlign: col.align ?? 'left',
                    width: col.width,
                    whiteSpace: 'nowrap',
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none',
                    transition: 'color 0.2s',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: t.space[1], justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' }}>
                    {col.label}
                    {col.sortable !== false && <SortIcon active={sortCol === col.key} color={textHead} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr style={{ background: rowBg }}>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: `${t.space[10]}px ${t.space[3]}px`, fontSize: t.font.size.base, color: emptyColor, fontFamily: t.font.family.sans }}>
                  Carregando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr style={{ background: rowBg }}>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: `${t.space[10]}px ${t.space[3]}px`, fontSize: t.font.size.base, color: emptyColor, fontFamily: t.font.family.sans }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              flatRows.map(({ row, level }) => {
                const rowKey = String(row[keyField])
                const isHovered = hoveredRow === rowKey
                const children = getChildren?.(row)
                const hasChildren = !!children && children.length > 0
                const isExpanded = expandedKeys.has(rowKey)
                return (
                  <tr
                    key={rowKey}
                    onMouseEnter={() => setHoveredRow(rowKey)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => onRowClick?.(row)}
                    style={{
                      background: isHovered
                        ? rowHoverBg
                        : level > 0
                          ? (isGbMode ? t.color.state.row.stripedGb : t.color.state.row.striped)
                          : rowBg,
                      borderBottom: `1px solid ${borderSubtle}`,
                      transition: `background ${t.transition.fast}`,
                      cursor: onRowClick ? 'pointer' : 'default',
                    }}
                  >
                    {columns.map((col, colIdx) => {
                      const content = col.render(row)
                      return (
                        <td
                          key={col.key}
                          style={{
                            fontSize: t.font.size.base,
                            color: textCell,
                            fontFamily: t.font.family.sans,
                            padding: `0 ${t.space[4]}px`,
                            textAlign: col.align ?? 'left',
                            transition: 'color 0.2s, background 0.15s',
                            height: t.size.tableRow,
                            maxWidth: col.width,
                            boxSizing: 'border-box',
                            // Sem overflow:hidden na célula — o truncamento fica a cargo do
                            // <div> interno (ellipsis), permitindo que overlays da coluna
                            // (ex.: DropdownMenu de ações) escapem sem serem cortados.
                          }}
                        >
                          {colIdx === 0 && getChildren ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], paddingLeft: level * 18 }}>
                              {hasChildren ? (
                                <button
                                  type="button"
                                  aria-label={isExpanded ? 'Recolher' : 'Expandir'}
                                  onClick={(e) => { e.stopPropagation(); toggleExpand(rowKey) }}
                                  style={{
                                    width: 16,
                                    height: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: colors.fg.subtle,
                                    flexShrink: 0,
                                    padding: 0,
                                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: `transform ${t.transition.fast}`,
                                  }}
                                >
                                  <ChevronRight size={13} />
                                </button>
                              ) : (
                                <span style={{ width: 16, flexShrink: 0 }} />
                              )}
                              <div
                                title={typeof content === 'string' ? content : undefined}
                                style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              >
                                {content}
                              </div>
                            </div>
                          ) : (
                            /* Trunca com reticências; texto completo no hover (title) */
                            <div
                              title={typeof content === 'string' ? content : undefined}
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {content}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
