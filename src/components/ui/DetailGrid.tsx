import type { ReactNode } from 'react'
import { t } from '../../design/tokens'
import { ViewField } from './FormField'

export interface DetailItem {
  label: string
  value: ReactNode
  copyValue?: string
  sensitive?: boolean
}

interface ReadOnlyFieldProps extends DetailItem {}

// Delega para a variação "Visualização" do FormField (Lei 2 — fonte única):
// todo campo somente-leitura do kit, seja um <FormField variant="view">
// direto ou um item de DetailGrid, usa a mesma implementação/estilo.
export function ReadOnlyField({ label, value, copyValue, sensitive }: ReadOnlyFieldProps) {
  return <ViewField label={label} value={value} copyValue={copyValue} sensitive={sensitive} />
}

interface DetailGridProps {
  items: DetailItem[]
  columns?: 1 | 2 | 3
  responsive?: boolean
}

export function DetailGrid({ items, columns = 2, responsive = false }: DetailGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: responsive
          ? `repeat(auto-fit, minmax(min(100%, ${columns === 2 ? t.size.drawer : t.size.stepBtn}px), 1fr))`
          : `repeat(${columns}, minmax(0, 1fr))`,
        gap: t.space[3],
      }}
    >
      {items.map((item) => <ReadOnlyField key={item.label} {...item} />)}
    </div>
  )
}
