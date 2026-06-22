import React, { useState } from 'react'
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
}: DataTableProps<T>) {
  const { colors, isGbMode } = useTheme()
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (colKey: string) => {
    if (sortCol === colKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortCol(colKey); setSortDir('asc') }
  }

  // Derived colors
  const borderColor   = colors.border.default
  const borderSubtle  = colors.border.subtle
  const theadBg       = isGbMode ? 'rgba(255,255,255,0.03)' : t.color.neutral[50]
  const rowBg         = colors.bg.surface
  const rowHoverBg    = isGbMode ? 'rgba(16,185,129,0.06)' : t.color.neutral[50]
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
              data.map((row) => {
                const rowKey = String(row[keyField])
                const isHovered = hoveredRow === rowKey
                return (
                  <tr
                    key={rowKey}
                    onMouseEnter={() => setHoveredRow(rowKey)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => onRowClick?.(row)}
                    style={{
                      background: isHovered ? rowHoverBg : rowBg,
                      borderBottom: `1px solid ${borderSubtle}`,
                      transition: `background ${t.transition.fast}`,
                      cursor: onRowClick ? 'pointer' : 'default',
                    }}
                  >
                    {columns.map((col) => {
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
                            overflow: 'hidden',
                          }}
                        >
                          {/* Trunca com reticências; texto completo no hover (title) */}
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
