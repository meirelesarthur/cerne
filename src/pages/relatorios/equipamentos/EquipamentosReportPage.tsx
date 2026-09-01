import { useMemo, useState } from 'react'
import { DateRangePicker } from '../../../components/ui/DatePicker'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { FormSelect } from '../../../components/ui/FormSelect'
import { ReportSummary } from '../../../components/ui/ReportSummary'
import { ReportWorkspace, type ReportExportType } from '../../../components/ui/ReportWorkspace'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { formatCurrency } from '../../../components/ui/CurrencyField'
import { BrandedReportDocument, type PdfTableColumn } from '../../../components/ui/report-pdf/BrandedReportDocument'
import type { Column } from '../../../components/ui/DataTable'
import { downloadReportPdf } from '../../../utils/reportPdf'

interface EquipmentRow {
  id: string
  code: string
  description: string
  acquiredAt: string
  patrimony: string
  plate?: string
  chassis?: string
  year: string
  model: string
  family: string
  owner: string
  status: 'Ativo' | 'Inativo'
  acquisitionValue: number
  residualValue: number
  depreciatedValue: number
}

const EQUIPMENT_ROWS: EquipmentRow[] = [
  { id: '1', code: '0001', description: 'Trator MF 250', acquiredAt: '2024-01-01', patrimony: '0085', year: '2019/2020', model: 'MF 250', family: 'Máquinas Agrícolas', owner: 'Ênio Nunes', status: 'Ativo', acquisitionValue: 180000, residualValue: 54000, depreciatedValue: 37800 },
  { id: '2', code: '0004', description: 'Trator A950', acquiredAt: '2024-07-01', patrimony: '001', year: '2014', model: 'A950', family: 'Máquinas Agrícolas', owner: 'Ênio Nunes', status: 'Ativo', acquisitionValue: 160000, residualValue: 48000, depreciatedValue: 11200.03 },
  { id: '3', code: '0005', description: 'Trator Valmet 68', acquiredAt: '2024-07-01', patrimony: '002', year: '2020', model: 'Valmet 68', family: 'Máquinas Agrícolas', owner: 'Ênio Nunes', status: 'Ativo', acquisitionValue: 50000, residualValue: 15000, depreciatedValue: 3499.97 },
  { id: '4', code: '0030', description: 'Trator BH145', acquiredAt: '2024-12-20', patrimony: '033', year: '2013/2013', model: 'BH 145', family: 'Máquinas Agrícolas', owner: 'Ênio Nunes', status: 'Ativo', acquisitionValue: 250000, residualValue: 75000, depreciatedValue: 13854.19 },
  { id: '5', code: '0045', description: 'Pá carregadeira agrícola PCA3800 VTR', acquiredAt: '2025-05-31', patrimony: '050', chassis: 'A950 SHT CDC JS', year: '2025/2025', model: 'PCA3800 VTR', family: 'Máquinas Agrícolas', owner: 'Ênio Nunes', status: 'Ativo', acquisitionValue: 57700, residualValue: 17310, depreciatedValue: 2356.07 },
  { id: '6', code: '0049', description: 'Trator 7630', acquiredAt: '2025-10-15', patrimony: '062', year: '2023/2023', model: 'Trator 7630', family: 'Máquinas Agrícolas', owner: 'Ênio Nunes', status: 'Ativo', acquisitionValue: 192530, residualValue: 57759, depreciatedValue: 5053.95 },
]

const formatDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR')
const currentValue = (row: EquipmentRow) => row.acquisitionValue - row.depreciatedValue
const depreciableBalance = (row: EquipmentRow) => currentValue(row) - row.residualValue

const EQUIPMENT_PDF_COLUMNS: PdfTableColumn<EquipmentRow>[] = [
  { key: 'code', label: 'Código', width: 0.6, render: (row) => row.code },
  { key: 'description', label: 'Equipamento', width: 1.9, render: (row) => row.description },
  { key: 'acquiredAt', label: 'Aquisição', width: 0.9, render: (row) => formatDate(row.acquiredAt) },
  { key: 'patrimony', label: 'Patrimônio', width: 0.75, render: (row) => row.patrimony },
  { key: 'model', label: 'Ano / modelo', width: 1.05, render: (row) => `${row.year} · ${row.model}` },
  { key: 'acquisitionValue', label: 'Aquisição', width: 0.95, align: 'right', render: (row) => formatCurrency(row.acquisitionValue) },
  { key: 'residualValue', label: 'Residual', width: 0.85, align: 'right', render: (row) => formatCurrency(row.residualValue) },
  { key: 'depreciatedValue', label: 'Depreciado', width: 0.9, align: 'right', render: (row) => formatCurrency(row.depreciatedValue) },
  { key: 'currentValue', label: 'Valor atual', width: 0.95, align: 'right', render: (row) => formatCurrency(currentValue(row)) },
  { key: 'balance', label: 'A depreciar', width: 0.95, align: 'right', render: (row) => formatCurrency(depreciableBalance(row)) },
]

function EquipmentCard({ row }: { row: EquipmentRow }) {
  return <DetailGrid columns={1} items={[
    { label: 'Equipamento', value: row.description },
    { label: 'Patrimônio', value: row.patrimony },
    { label: 'Ano / modelo', value: `${row.year} · ${row.model}` },
    { label: 'Valor atual', value: formatCurrency(currentValue(row)) },
  ]} />
}

export default function EquipamentosReportPage() {
  const [period, setPeriod] = useState<{ start: string | null; end: string | null }>({ start: '2024-01-01', end: '2026-08-31' })
  const [family, setFamily] = useState('')
  const [owner, setOwner] = useState('')
  const [status, setStatus] = useState('Ativo')
  const [preview, setPreview] = useState<EquipmentRow[]>([])
  const [hasPreview, setHasPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toasts, show, dismiss } = useToast()

  const summary = useMemo(() => {
    const acquisition = preview.reduce((sum, row) => sum + row.acquisitionValue, 0)
    const depreciated = preview.reduce((sum, row) => sum + row.depreciatedValue, 0)
    const current = preview.reduce((sum, row) => sum + currentValue(row), 0)
    const residual = preview.reduce((sum, row) => sum + row.residualValue, 0)
    return { acquisition, depreciated, current, residual }
  }, [preview])

  const columns = useMemo<Column<EquipmentRow>[]>(() => [
    { key: 'code', label: 'Código', render: (row) => row.code },
    { key: 'description', label: 'Equipamento', render: (row) => row.description },
    { key: 'patrimony', label: 'Patrimônio', render: (row) => row.patrimony },
    { key: 'model', label: 'Ano / modelo', render: (row) => `${row.year} · ${row.model}` },
    { key: 'acquisition', label: 'Aquisição', align: 'right', render: (row) => formatCurrency(row.acquisitionValue) },
    { key: 'current', label: 'Valor atual', align: 'right', render: (row) => formatCurrency(currentValue(row)) },
  ], [])

  const generatePreview = () => {
    setLoading(true)
    window.setTimeout(() => {
      setPreview(EQUIPMENT_ROWS.filter((row) => (
        (!period.start || row.acquiredAt >= period.start)
        && (!period.end || row.acquiredAt <= period.end)
        && (!family || row.family === family)
        && (!owner || row.owner === owner)
        && (!status || row.status === status)
      )))
      setHasPreview(true)
      setLoading(false)
      show('Prévia patrimonial atualizada com sucesso.')
    }, 350)
  }

  const exportReport = (type: ReportExportType) => {
    if (type !== 'PDF') return
    void downloadReportPdf(
      <BrandedReportDocument
        title="Inventário patrimonial"
        description="Posição financeira e de depreciação dos equipamentos selecionados."
        emittedAt={new Date().toLocaleString('pt-BR')}
        metadata={[
          { label: 'Período', value: `${period.start ? formatDate(period.start) : 'Início'} a ${period.end ? formatDate(period.end) : 'Hoje'}` },
          { label: 'Família', value: family || 'Todas' },
          { label: 'Proprietário', value: owner || 'Todos' },
          { label: 'Status', value: status || 'Todos' },
        ]}
        highlights={[
          { label: 'Valor de aquisição', value: formatCurrency(summary.acquisition), helper: `${preview.length} equipamento(s)` },
          { label: 'Valor atual', value: formatCurrency(summary.current) },
          { label: 'Depreciação acumulada', value: formatCurrency(summary.depreciated) },
          { label: 'Valor residual', value: formatCurrency(summary.residual) },
        ]}
        columns={EQUIPMENT_PDF_COLUMNS}
        rows={preview}
        getRowKey={(row) => row.id}
        getRowDetail={(row) => [row.plate && `Placa ${row.plate}`, row.chassis && `Chassi ${row.chassis}`, `${row.owner} · ${row.status}`].filter(Boolean).join(' · ')}
      />,
      'inventario-patrimonial-gb-cerne.pdf',
    ).then(() => show('PDF do inventário gerado com sucesso.')).catch(() => show('Não foi possível gerar o PDF. Tente novamente.', 'error'))
  }

  const filters = <>
    <DateRangePicker label="Período de aquisição" value={period} onChange={setPeriod} />
    <FormSelect label="Família" value={family} onChange={(event) => setFamily(event.target.value)} options={[{ value: '', label: 'Todas as famílias' }, { value: 'Máquinas Agrícolas', label: 'Máquinas Agrícolas' }]} />
    <FormSelect label="Proprietário" value={owner} onChange={(event) => setOwner(event.target.value)} options={[{ value: '', label: 'Todos os proprietários' }, { value: 'Ênio Nunes', label: 'Ênio Nunes' }]} />
    <FormSelect label="Status" value={status} onChange={(event) => setStatus(event.target.value)} options={[{ value: '', label: 'Todos os status' }, { value: 'Ativo', label: 'Ativo' }, { value: 'Inativo', label: 'Inativo' }]} />
  </>

  return <>
    <ReportWorkspace
      title="Inventário Patrimonial"
      description="Acompanhe valor atual, depreciação e saldo a depreciar dos equipamentos."
      filters={filters}
      columns={columns}
      data={preview}
      keyField="id"
      renderCard={(row) => <EquipmentCard row={row} />}
      hasPreview={hasPreview}
      loading={loading}
      onPreview={generatePreview}
      onExport={exportReport}
      exportTypes={['PDF']}
      summary={<ReportSummary items={[
        { label: 'Valor de aquisição', value: formatCurrency(summary.acquisition), helper: `${preview.length} equipamento(s)` },
        { label: 'Valor atual', value: formatCurrency(summary.current) },
        { label: 'Depreciação acumulada', value: formatCurrency(summary.depreciated) },
        { label: 'Valor residual', value: formatCurrency(summary.residual) },
      ]} />}
    />
    <ToastContainer toasts={toasts} onDismiss={dismiss} />
  </>
}
