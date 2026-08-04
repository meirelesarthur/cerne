import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { formatCurrency } from '../../../components/ui/CurrencyField'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { DropdownMenu } from '../../../components/ui/DropdownMenu'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageHeader } from '../../../components/ui/PageHeader'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { t } from '../../../design/tokens'
import PlanejamentoItemCadastro from './PlanejamentoItemCadastro'
import { INITIAL_ROWS, kindLabel, removeRows, updateRows, type PlanningRow } from './planejamentoPecuario.types'

type View = 'list' | 'form'

export default function PlanejamentoPecuarioPage() {
  const [view, setView] = useState<View>('list')
  const [rows, setRows] = useState(INITIAL_ROWS)
  const [editing, setEditing] = useState<PlanningRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PlanningRow | null>(null)
  const { toasts, show, dismiss } = useToast()

  const total = useMemo(() => {
    const sum = (items: PlanningRow[]): number => items.reduce((result, item) => result + item.quantity * item.unitPrice + sum(item.children ?? []), 0)
    return sum(rows)
  }, [rows])

  const openEditor = (row?: PlanningRow) => {
    setEditing(row ?? null)
    setView('form')
  }

  const handleSaveItem = (row: PlanningRow, parentId: string) => {
    const isEdit = editing !== null
    setRows((current) => {
      const withoutOld = isEdit ? removeRows(current, row.id) : current
      return updateRows(withoutOld, parentId, (parent) => ({ ...parent, children: [...(parent.children ?? []), row] }))
    })
    setEditing(null)
    setView('list')
    show(isEdit ? 'Item atualizado no planejamento.' : 'Item adicionado ao planejamento.')
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

  if (view === 'form') {
    return (
      <PlanejamentoItemCadastro
        initialData={editing ?? undefined}
        allRows={rows}
        onBack={() => { setEditing(null); setView('list') }}
        onSave={handleSaveItem}
      />
    )
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader title="Planejamento Pecuário" description="Custos e insumos por espécie, categoria e operação." actions={<Button icon={<Plus size={16} />} onClick={() => openEditor()}>Adicionar Item</Button>} />
        <DataTable columns={columns} data={rows} keyField="id" getChildren={(row) => row.children} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: t.space[4] }}>
          <Badge label={`Total planejado: ${formatCurrency(total)}/ha`} variant="success" />
        </div>
      </PageCard>

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
