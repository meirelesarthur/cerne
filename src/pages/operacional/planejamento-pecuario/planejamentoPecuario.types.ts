// ─── Tipos base ───────────────────────────────────────────────────────────────

export type PlanningKind = 'species' | 'operation' | 'equipment' | 'product' | 'service' | 'acquisition'

export interface PlanningRow {
  id: string
  label: string
  kind: PlanningKind
  quantity: number
  unitPrice: number
  unit: string
  children?: PlanningRow[]
}

export const INITIAL_ROWS: PlanningRow[] = [
  {
    id: 'bovine', label: 'Bovinos · Recria e engorda', kind: 'species', quantity: 0, unitPrice: 0, unit: '', children: [
      {
        id: 'nutrition', label: 'Nutrição', kind: 'operation', quantity: 0, unitPrice: 0, unit: '', children: [
          { id: 'mineral', label: 'Sal mineral 30 kg', kind: 'product', quantity: 4.2, unitPrice: 128.5, unit: 'sc/ha' },
          { id: 'tractor', label: 'Trator 95 cv', kind: 'equipment', quantity: 1.5, unitPrice: 235, unit: 'h/ha' },
        ],
      },
      {
        id: 'health', label: 'Manejo sanitário', kind: 'operation', quantity: 0, unitPrice: 0, unit: '', children: [
          { id: 'vaccine', label: 'Vacinação de protocolo', kind: 'service', quantity: 1, unitPrice: 84, unit: 'cab.' },
        ],
      },
    ],
  },
]

export const kindLabel: Record<PlanningKind, string> = {
  species: 'Espécie / Categoria', operation: 'Operação', equipment: 'Equipamento', product: 'Produto', service: 'Serviço', acquisition: 'Aquisição',
}

// ─── Mutação imutável da árvore ────────────────────────────────────────────────

export function updateRows(rows: PlanningRow[], id: string, updater: (row: PlanningRow) => PlanningRow): PlanningRow[] {
  return rows.map((row) => row.id === id ? updater(row) : { ...row, children: row.children ? updateRows(row.children, id, updater) : undefined })
}

export function removeRows(rows: PlanningRow[], id: string): PlanningRow[] {
  return rows.filter((row) => row.id !== id).map((row) => ({ ...row, children: row.children ? removeRows(row.children, id) : undefined }))
}
