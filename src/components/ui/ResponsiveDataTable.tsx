import type { ReactNode } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { DataTable, type Column } from './DataTable'
import { EmptyState } from './EmptyState'
import { Skeleton } from './Skeleton'

interface ResponsiveDataTableProps<T extends object> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  renderCard: (row: T) => ReactNode
  emptyMessage?: string
  loading?: boolean
}

/** Tabela no desktop e cartões equivalentes abaixo de 768 px. */
export function ResponsiveDataTable<T extends object>({ columns, data, keyField, renderCard, emptyMessage, loading }: ResponsiveDataTableProps<T>) {
  const { colors } = useTheme()
  return (
    <>
      <div className="hidden md:block">
        <DataTable columns={columns} data={data} keyField={keyField} emptyMessage={emptyMessage} loading={loading} />
      </div>
      <div className="md:hidden">
        {loading ? (
          <div style={{ display: 'grid', gap: t.space[3] }}>
            {[0, 1, 2].map((item) => <Skeleton key={item} height={132} variant="rect" />)}
          </div>
        ) : data.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <div style={{ display: 'grid', gap: t.space[3] }}>
            {data.map((row) => (
              <article key={String(row[keyField])} style={{ padding: t.space[4], border: `1px solid ${colors.border.default}`, borderRadius: t.radius.lg, background: colors.bg.surface }}>
                {renderCard(row)}
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
