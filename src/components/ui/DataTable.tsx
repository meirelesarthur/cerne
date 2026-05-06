import React, { useState } from 'react'

export interface Column<T> {
  key: string
  label: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  render: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  emptyMessage?: string
  loading?: boolean
}

export function DataTable<T>({ columns, data, keyField, emptyMessage = 'Nenhum registro encontrado.', loading }: DataTableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  background: '#fafafa',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#616161',
                  fontFamily: "'Outfit', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: '10px 14px',
                  borderBottom: '1px solid #f0f0f0',
                  textAlign: col.align ?? 'left',
                  width: col.width,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  textAlign: 'center',
                  padding: '32px 14px',
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
                colSpan={columns.length}
                style={{
                  textAlign: 'center',
                  padding: '32px 14px',
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
              return (
                <tr
                  key={rowKey}
                  onMouseEnter={() => setHoveredRow(rowKey)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    background: hoveredRow === rowKey ? '#fafafa' : 'white',
                    borderBottom: '1px solid #f9f9f9',
                    transition: 'background 0.1s',
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        fontSize: 13,
                        color: '#1a1a1a',
                        fontFamily: "'Outfit', sans-serif",
                        padding: '12px 14px',
                        textAlign: col.align ?? 'left',
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
  )
}
