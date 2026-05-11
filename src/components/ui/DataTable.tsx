import React, { useState } from 'react'

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
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0, opacity: active ? 1 : 0.35 }}
    >
      <path d="M7 15l5 5 5-5" stroke={active ? '#059669' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9l5-5 5 5" stroke={active ? '#059669' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    if (allSelected) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(allKeys))
    }
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
    if (sortCol === colKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(colKey)
      setSortDir('asc')
    }
  }

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {selectable && (
                <th
                  style={{
                    width: 44,
                    padding: '10px 12px',
                    textAlign: 'center',
                    borderRight: '1px solid #f0f0f0',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected }}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer', accentColor: '#059669', width: 14, height: 14 }}
                  />
                </th>
              )}
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#6b7280',
                    fontFamily: "'Outfit', sans-serif",
                    padding: '6px 14px',
                    textAlign: col.align ?? 'left',
                    width: col.width,
                    whiteSpace: 'nowrap',
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none',
                    borderRight: i < columns.length - 1 ? '1px solid #f0f0f0' : undefined,
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start',
                    }}
                  >
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
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  style={{
                    textAlign: 'center',
                    padding: '40px 14px',
                    fontSize: 13,
                    color: '#9ca3af',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Carregando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  style={{
                    textAlign: 'center',
                    padding: '40px 14px',
                    fontSize: 13,
                    color: '#9ca3af',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
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
                      background: isSelected ? '#f0fdf4' : hoveredRow === rowKey ? '#f9fafb' : 'white',
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background 0.1s',
                    }}
                  >
                    {selectable && (
                      <td
                        style={{
                          width: 44,
                          padding: '0 12px',
                          textAlign: 'center',
                          borderRight: '1px solid #f3f4f6',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(rowKey)}
                          style={{ cursor: 'pointer', accentColor: '#059669', width: 14, height: 14 }}
                        />
                      </td>
                    )}
                    {columns.map((col, i) => (
                      <td
                        key={col.key}
                        style={{
                          fontSize: 13,
                          color: '#111827',
                          fontFamily: "'Outfit', sans-serif",
                          padding: '7px 14px',
                          textAlign: col.align ?? 'left',
                          borderRight: i < columns.length - 1 ? '1px solid #f3f4f6' : undefined,
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
