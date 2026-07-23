import { useMemo, useState } from 'react'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { FormField } from '../../../components/ui/FormField'
import { FormSelect } from '../../../components/ui/FormSelect'
import { MultiSelectField } from '../../../components/ui/MultiSelectField'
import { ReportWorkspace, type ReportExportType } from '../../../components/ui/ReportWorkspace'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { formatCurrency } from '../../../components/ui/CurrencyField'
import type { Column } from '../../../components/ui/DataTable'

interface StockRow {
  id: string
  warehouseId: string
  warehouse: string
  product: string
  group: string
  category: string
  kind: string
  unit: string
  quantity: number
  unitCost: number
}

const WAREHOUSES = [
  { id: 'central', label: 'Armazém Central' },
  { id: 'insumos', label: 'Depósito de Insumos' },
  { id: 'fazenda', label: 'Armazém Fazenda Norte' },
]

const STOCK: StockRow[] = [
  { id: '1', warehouseId: 'central', warehouse: 'Armazém Central', product: 'Milho em grão', group: 'Nutrientes', category: 'Grãos', kind: 'Matéria-prima', unit: 'kg', quantity: 12400, unitCost: 1.36 },
  { id: '2', warehouseId: 'insumos', warehouse: 'Depósito de Insumos', product: 'Farelo de soja', group: 'Nutrientes', category: 'Proteicos', kind: 'Matéria-prima', unit: 'kg', quantity: 6850, unitCost: 2.18 },
  { id: '3', warehouseId: 'fazenda', warehouse: 'Armazém Fazenda Norte', product: 'Semente de milho AG 8700', group: 'Agrícola', category: 'Sementes', kind: 'Insumo', unit: 'sc', quantity: 320, unitCost: 742.5 },
  { id: '4', warehouseId: 'central', warehouse: 'Armazém Central', product: 'Ureia pecuária', group: 'Nutrientes', category: 'Aditivos', kind: 'Insumo', unit: 'kg', quantity: 980, unitCost: 4.42 },
]

const CATEGORY_BY_GROUP: Record<string, string[]> = {
  Nutrientes: ['Grãos', 'Proteicos', 'Aditivos'],
  Agrícola: ['Sementes'],
}

function StockReportCard({ row }: { row: StockRow }) {
  return (
    <DetailGrid columns={1} items={[
      { label: 'Produto', value: row.product },
      { label: 'Armazém', value: row.warehouse },
      { label: 'Saldo', value: `${row.quantity.toLocaleString('pt-BR')} ${row.unit}` },
      { label: 'Valor total', value: formatCurrency(row.quantity * row.unitCost) },
    ]} />
  )
}

export default function EstoqueConsolidadoReportPage() {
  const [warehouses, setWarehouses] = useState<string[]>([])
  const [group, setGroup] = useState('')
  const [category, setCategory] = useState('')
  const [kind, setKind] = useState('')
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState<StockRow[]>([])
  const [hasPreview, setHasPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const { toasts, show, dismiss } = useToast()

  const categories = CATEGORY_BY_GROUP[group] ?? []
  const columns = useMemo<Column<StockRow>[]>(() => [
    { key: 'warehouse', label: 'Armazém', render: (row) => row.warehouse },
    { key: 'product', label: 'Produto', render: (row) => row.product },
    { key: 'classification', label: 'Grupo / Categoria', render: (row) => `${row.group} / ${row.category}` },
    { key: 'quantity', label: 'Saldo', align: 'right', render: (row) => `${row.quantity.toLocaleString('pt-BR')} ${row.unit}` },
    { key: 'unitCost', label: 'Custo unit.', align: 'right', render: (row) => formatCurrency(row.unitCost) },
    { key: 'total', label: 'Valor total', align: 'right', render: (row) => formatCurrency(row.quantity * row.unitCost) },
  ], [])

  const generatePreview = () => {
    setLoading(true)
    setError(undefined)
    window.setTimeout(() => {
      if (search.trim().toLocaleLowerCase('pt-BR') === 'erro') {
        setPreview([])
        setHasPreview(false)
        setError('O serviço de relatórios não respondeu. Revise os filtros ou tente novamente em instantes.')
        setLoading(false)
        return
      }
      const term = search.trim().toLocaleLowerCase('pt-BR')
      const result = STOCK.filter((row) => (
        (warehouses.length === 0 || warehouses.includes(row.warehouseId))
        && (!group || row.group === group)
        && (!category || row.category === category)
        && (!kind || row.kind === kind)
        && (!term || row.product.toLocaleLowerCase('pt-BR').includes(term))
      ))
      setPreview(result)
      setHasPreview(true)
      setLoading(false)
      show('Prévia atualizada com sucesso.')
    }, 450)
  }

  const exportReport = (type: ReportExportType) => {
    const params = new URLSearchParams({ type, group, category, kind, search })
    warehouses.forEach((warehouse) => params.append('warehouses[]', warehouse))
    window.open(`/reports/stocks-consolidated-report?${params.toString()}`, '_blank', 'noopener,noreferrer')
    show(`Relatório ${type} aberto em uma nova aba.`, 'info')
  }

  const filters = (
    <>
      <MultiSelectField
        label="Armazéns"
        required
        options={WAREHOUSES}
        value={warehouses}
        onChange={setWarehouses}
        hint="Sem seleção, a prévia considera todos os armazéns."
      />
      <FormSelect
        label="Grupo"
        value={group}
        onChange={(event) => { setGroup(event.target.value); setCategory('') }}
        options={[{ value: '', label: 'Todos os grupos' }, ...Object.keys(CATEGORY_BY_GROUP).map((value) => ({ value, label: value }))]}
      />
      <FormSelect
        label="Categoria"
        value={category}
        disabled={!group}
        onChange={(event) => setCategory(event.target.value)}
        options={[{ value: '', label: group ? 'Todas as categorias' : 'Selecione um grupo' }, ...categories.map((value) => ({ value, label: value }))]}
      />
      <FormSelect
        label="Classe"
        value={kind}
        onChange={(event) => setKind(event.target.value)}
        options={[{ value: '', label: 'Todas as classes' }, { value: 'Matéria-prima', label: 'Matéria-prima' }, { value: 'Insumo', label: 'Insumo' }]}
      />
      <FormField
        label="Pesquisar por nome"
        placeholder="Ex.: milho"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        hint="Digite “erro” para visualizar o estado de falha recuperável."
      />
    </>
  )

  return (
    <>
      <ReportWorkspace
        title="Estoque Consolidado"
        description="Consulte a posição valorizada de produtos por armazém."
        filters={filters}
        columns={columns}
        data={preview}
        keyField="id"
        renderCard={(row) => <StockReportCard row={row} />}
        hasPreview={hasPreview}
        loading={loading}
        error={error}
        onPreview={generatePreview}
        onExport={exportReport}
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
