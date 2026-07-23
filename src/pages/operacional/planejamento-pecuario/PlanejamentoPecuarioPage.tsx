import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { CurrencyField, formatCurrency } from '../../../components/ui/CurrencyField'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { DropdownMenu } from '../../../components/ui/DropdownMenu'
import { FormField } from '../../../components/ui/FormField'
import { FormSection } from '../../../components/ui/FormSection'
import { FormSelect } from '../../../components/ui/FormSelect'
import { Modal } from '../../../components/ui/Modal'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageHeader } from '../../../components/ui/PageHeader'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { t } from '../../../design/tokens'

type PlanningKind = 'species' | 'operation' | 'equipment' | 'product' | 'service' | 'acquisition'

interface PlanningRow {
  id: string
  label: string
  kind: PlanningKind
  quantity: number
  unitPrice: number
  unit: string
  children?: PlanningRow[]
}

const INITIAL_ROWS: PlanningRow[] = [
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

const kindLabel: Record<PlanningKind, string> = {
  species: 'Espécie / Categoria', operation: 'Operação', equipment: 'Equipamento', product: 'Produto', service: 'Serviço', acquisition: 'Aquisição',
}

function updateRows(rows: PlanningRow[], id: string, updater: (row: PlanningRow) => PlanningRow): PlanningRow[] {
  return rows.map((row) => row.id === id ? updater(row) : { ...row, children: row.children ? updateRows(row.children, id, updater) : undefined })
}

function removeRows(rows: PlanningRow[], id: string): PlanningRow[] {
  return rows.filter((row) => row.id !== id).map((row) => ({ ...row, children: row.children ? removeRows(row.children, id) : undefined }))
}

export default function PlanejamentoPecuarioPage() {
  const [rows, setRows] = useState(INITIAL_ROWS)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<PlanningRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PlanningRow | null>(null)
  const [kind, setKind] = useState<PlanningKind>('product')
  const [label, setLabel] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [unitPrice, setUnitPrice] = useState(0)
  const [unit, setUnit] = useState('un./ha')
  const { toasts, show, dismiss } = useToast()

  const total = useMemo(() => {
    const sum = (items: PlanningRow[]): number => items.reduce((result, item) => result + item.quantity * item.unitPrice + sum(item.children ?? []), 0)
    return sum(rows)
  }, [rows])

  const openEditor = (row?: PlanningRow) => {
    setEditing(row ?? null)
    setKind(row?.kind ?? 'product')
    setLabel(row?.label ?? '')
    setQuantity(row?.quantity ?? 0)
    setUnitPrice(row?.unitPrice ?? 0)
    setUnit(row?.unit ?? 'un./ha')
    setEditorOpen(true)
  }

  const save = () => {
    if (!label.trim()) return
    const next: PlanningRow = { id: editing?.id ?? crypto.randomUUID(), label: label.trim(), kind, quantity, unitPrice, unit, children: editing?.children }
    if (editing) setRows((current) => updateRows(current, editing.id, () => next))
    else setRows((current) => updateRows(current, 'nutrition', (row) => ({ ...row, children: [...(row.children ?? []), next] })))
    setEditorOpen(false)
    show(editing ? 'Item atualizado no planejamento.' : 'Item adicionado ao planejamento.')
  }

  const columns: Column<PlanningRow>[] = [
    { key: 'label', label: 'Estrutura do planejamento', render: (row) => row.label },
    { key: 'kind', label: 'Tipo', width: 150, render: (row) => <Badge label={kindLabel[row.kind]} variant={row.kind === 'species' ? 'success' : row.kind === 'operation' ? 'info' : 'neutral'} /> },
    { key: 'quantity', label: 'Qtd./ha', width: 120, align: 'right', render: (row) => row.quantity ? `${row.quantity.toLocaleString('pt-BR')} ${row.unit}` : '—' },
    { key: 'unitPrice', label: 'Vl. unit./ha', width: 150, align: 'right', render: (row) => row.unitPrice ? formatCurrency(row.unitPrice) : '—' },
    { key: 'total', label: 'Vl. total/ha', width: 150, align: 'right', render: (row) => row.quantity && row.unitPrice ? formatCurrency(row.quantity * row.unitPrice) : '—' },
    { key: 'actions', label: 'Ações', width: 72, align: 'right', sortable: false, render: (row) => row.kind === 'species' || row.kind === 'operation' ? null : <DropdownMenu items={[
      { id: 'edit', label: 'Editar', icon: <Pencil size={15} />, onClick: () => openEditor(row) },
      { id: 'delete', label: 'Excluir…', icon: <Trash2 size={15} />, danger: true, divider: true, onClick: () => setDeleteTarget(row) },
    ]} /> },
  ]

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader title="Planejamento Pecuário" description="Custos e insumos por espécie, categoria e operação." actions={<Button icon={<Plus size={16} />} onClick={() => openEditor()}>Adicionar Item</Button>} />
        <DataTable columns={columns} data={rows} keyField="id" getChildren={(row) => row.children} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: t.space[4] }}>
          <Badge label={`Total planejado: ${formatCurrency(total)}/ha`} variant="success" />
        </div>
      </PageCard>

      <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title={editing ? 'Editar item planejado' : 'Adicionar item planejado'} subtitle="O valor total é calculado automaticamente." size="lg" footer={<><Button variant="secondary" onClick={() => setEditorOpen(false)}>Cancelar</Button><Button disabled={!label.trim()} onClick={save}>Salvar Item</Button></>}>
        <FormSection title="Classificação" columns={2}>
          <FormSelect label="Tipo" required value={kind} onChange={(event) => setKind(event.target.value as PlanningKind)} options={[
            { value: 'equipment', label: 'Equipamento' }, { value: 'product', label: 'Produto' }, { value: 'service', label: 'Serviço' }, { value: 'acquisition', label: 'Aquisição' },
          ]} />
          <FormField label="Descrição" required value={label} onChange={(event) => setLabel(event.target.value)} />
        </FormSection>
        <FormSection title="Cálculo" columns={2}>
          <FormField label="Quantidade / ha" type="number" inputMode="decimal" min={0} step="0.01" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
          <FormField label="Unidade" value={unit} onChange={(event) => setUnit(event.target.value)} />
          <CurrencyField label="Valor unitário / ha" value={unitPrice} onChange={setUnitPrice} />
          <CurrencyField label="Valor total / ha" value={quantity * unitPrice} onChange={() => undefined} readOnly />
        </FormSection>
      </Modal>

      <ConfirmDialog open={deleteTarget !== null} onCancel={() => setDeleteTarget(null)} onConfirm={() => {
        if (!deleteTarget) return
        setRows((current) => removeRows(current, deleteTarget.id))
        setDeleteTarget(null)
        show('Item removido do planejamento.', 'warning')
      }} title="Excluir item do planejamento?" message="O total planejado será recalculado imediatamente." confirmLabel="Excluir Item" />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
