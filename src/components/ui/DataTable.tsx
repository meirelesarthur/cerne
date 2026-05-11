import React, { useState } from 'react'
import { t } from '../../design/tokens'

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
  selectable?: boolean
}

function SortIcon({ active }: { active?: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: active ? 1 : 0.35 }}>
      <path d="M7 15l5 5 5-5" stroke={active ? t.color.brand[600] : t.color.neutral[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9l5-5 5 5" stroke={active ? t.color.brand[600] : t.color.neutral[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  emptyMessage = 'Nenhum registro encontrado.',
  loading,
  selectable = true,
}: DataTableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const allKeys = data.map((r) => String(r[keyField]))
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedRows.has(k))
  const someSelected = allKeys.some((k) => selectedRows.has(k)) && !allSelected

  const toggleAll = () => {
    setSelectedRows(allSelected ? new Set() : new Set(allKeys))
  }

  const toggleRow = (key: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleSort = (colKey: string) => {
    if (sortCol === colKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortCol(colKey); setSortDir('asc') }
  }

  const emptyColSpan = columns.length + (selectable ? 1 : 0)

  return (
    <div
      style={{
        border: `1px solid ${t.color.neutral[200]}`,
        borderRadius: t.radius.lg,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: t.color.neutral[50], borderBottom: `1px solid ${t.color.neutral[200]}` }}>
              {selectable && (
                <th style={{ width: 44, padding: `${t.space[1] + t.space[1] / 2}px ${t.space[3]}px`, textAlign: 'center', borderRight: `1px solid ${t.color.neutral[150]}` }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected }}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer', accentColor: t.color.brand[600], width: 14, height: 14 }}
                  />
                </th>
              )}
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{
                    fontSize: t.font.size.sm,
                    fontWeight: t.font.weight.medium,
                    color: t.color.neutral[500],
                    fontFamily: t.font.family.sans,
                    padding: `${t.space[1] + t.space[1] / 2}px ${t.space[3] + t.space[1] / 2}px`,
                    textAlign: col.align ?? 'left',
                    width: col.width,
                    whiteSpace: 'nowrap',
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none',
                    borderRight: i < columns.length - 1 ? `1px solid ${t.color.neutral[150]}` : undefined,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: t.space[1], justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' }}>
                    {col.label}
                    {col.sortable !== false && <SortIcon active={sortCol === col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={emptyColSpan} style={{ textAlign: 'center', padding: `${t.space[10]}px ${t.space[3]}px`, fontSize: t.font.size.base, color: t.color.neutral[400], fontFamily: t.font.family.sans }}>
                  Carregando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={emptyColSpan} style={{ textAlign: 'center', padding: `${t.space[10]}px ${t.space[3]}px`, fontSize: t.font.size.base, color: t.color.neutral[400], fontFamily: t.font.family.sans }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const rowKey = String(row[keyField])
                const isSelected = selectedRows.has(rowKey)
                return (
                  <tr
                    key={rowKey}
                    onMouseEnter={() => setHoveredRow(rowKey)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      background: isSelected ? t.color.brand[50] : hoveredRow === rowKey ? t.color.neutral[50] : t.color.neutral[0],
                      borderBottom: `1px solid ${t.color.neutral[150]}`,
                      transition: `background ${t.transition.fast}`,
                    }}
                  >
                    {selectable && (
                      <td style={{ width: 44, padding: `0 ${t.space[3]}px`, textAlign: 'center', borderRight: `1px solid ${t.color.neutral[150]}` }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(rowKey)}
                          style={{ cursor: 'pointer', accentColor: t.color.brand[600], width: 14, height: 14 }}
                        />
                      </td>
                    )}
                    {columns.map((col, i) => (
                      <td
                        key={col.key}
                        style={{
                          fontSize: t.font.size.base,
                          color: t.color.neutral[900],
                          fontFamily: t.font.family.sans,
                          padding: `${t.space[1] + t.space[1] / 2}px ${t.space[3] + t.space[1] / 2}px`,
                          textAlign: col.align ?? 'left',
                          borderRight: i < columns.length - 1 ? `1px solid ${t.color.neutral[150]}` : undefined,
                        }}
                      >
                        {col.render(row)}
                      </td>
                    ))}
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
