import { useMemo, useState } from 'react'
import { DateRangePicker } from '../../../components/ui/DatePicker'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { FormField } from '../../../components/ui/FormField'
import { FormSelect } from '../../../components/ui/FormSelect'
import { ReportSummary } from '../../../components/ui/ReportSummary'
import { ReportWorkspace, type ReportExportType } from '../../../components/ui/ReportWorkspace'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { formatCurrency } from '../../../components/ui/CurrencyField'
import { BrandedReportDocument, type PdfTableColumn } from '../../../components/ui/report-pdf/BrandedReportDocument'
import type { Column } from '../../../components/ui/DataTable'
import { downloadReportPdf } from '../../../utils/reportPdf'

interface SupplyRow {
  id: string
  code: string
  requestedAt: string
  requester: string
  authorizer?: string
  farm: string
  ageDays: number
  status: string
  priority: 'Baixa' | 'Média' | 'Alta'
  justification: string
  value: number
}

const SUPPLY_ROWS: SupplyRow[] = [
  { id: '1', code: '0001', requestedAt: '2024-12-30', requester: 'Fazenda Agro365', farm: 'Fazenda Maira', ageDays: 609, status: 'Cotação em andamento', priority: 'Média', justification: 'Teste', value: 100 },
  { id: '2', code: '0002', requestedAt: '2024-12-30', requester: 'Fazenda Agro365', farm: 'Fazenda Maira', ageDays: 609, status: 'Cotação em andamento', priority: 'Média', justification: 'Teste', value: 120 },
  { id: '3', code: '0003', requestedAt: '2024-12-30', requester: 'Fazenda Agro365', farm: 'Fazenda Maira', ageDays: 609, status: 'Solicitação', priority: 'Média', justification: 'Teste valor 3', value: 500 },
  { id: '4', code: '0004', requestedAt: '2025-01-11', requester: 'Suporte', farm: 'Fazenda Maira', ageDays: 597, status: 'Cotação em andamento', priority: 'Média', justification: 'Equipamento estragou', value: 0 },
  { id: '5', code: '0005', requestedAt: '2025-06-02', requester: 'Teste user', farm: 'Fazenda Maira', ageDays: 455, status: 'Cotação em andamento', priority: 'Média', justification: 'Faltou material', value: 0 },
  { id: '6', code: '0006', requestedAt: '2025-06-02', requester: 'Teste user', farm: 'Fazenda Maira', ageDays: 455, status: 'Cotação em andamento', priority: 'Média', justification: 'Reposição', value: 0 },
  { id: '7', code: '0007', requestedAt: '2025-06-02', requester: 'Teste user', farm: 'Fazenda Maira', ageDays: 455, status: 'Cotação em andamento', priority: 'Média', justification: 'Teste', value: 0 },
  { id: '8', code: '0008', requestedAt: '2025-06-02', requester: 'Teste user', authorizer: 'Suporte', farm: 'Fazenda Maira', ageDays: 455, status: 'Compra efetuada', priority: 'Média', justification: 'Teste', value: 2428 },
  { id: '9', code: '0009', requestedAt: '2025-07-09', requester: 'Teste user', authorizer: 'Suporte', farm: 'Fazenda Maira', ageDays: 0, status: 'Pedido finalizado', priority: 'Média', justification: '10', value: 10 },
  { id: '10', code: '0010', requestedAt: '2025-07-09', requester: 'Teste user', authorizer: 'Suporte', farm: 'Fazenda Maira', ageDays: 418, status: 'Compra recebida', priority: 'Média', justification: '10', value: 10 },
  { id: '11', code: '0011', requestedAt: '2025-09-30', requester: 'Suporte', farm: 'Fazenda Maira', ageDays: 335, status: 'Aguardando ciência', priority: 'Média', justification: '123123', value: 0 },
  { id: '12', code: '0012', requestedAt: '2025-10-30', requester: 'Suporte', farm: 'Fazenda Maira', ageDays: 305, status: 'Cotação em andamento', priority: 'Média', justification: '123', value: 0 },
  { id: '13', code: '0013', requestedAt: '2025-10-30', requester: 'Suporte', farm: 'Fazenda Maira', ageDays: 305, status: 'Cotação em andamento', priority: 'Média', justification: '123', value: 0 },
  { id: '14', code: '0014', requestedAt: '2025-10-31', requester: 'Suporte', farm: 'Fazenda Maira', ageDays: 304, status: 'Cotação em andamento', priority: 'Média', justification: 'Reposição de estoque', value: 0 },
  { id: '15', code: '0015', requestedAt: '2025-10-31', requester: 'Suporte', farm: 'Fazenda Maira', ageDays: 304, status: 'Cotação em andamento', priority: 'Média', justification: 'Material de uso diário', value: 0 },
  { id: '16', code: '0016', requestedAt: '2025-10-31', requester: 'Suporte', farm: 'Fazenda Maira', ageDays: 304, status: 'Solicitação', priority: 'Média', justification: 'Necessidade operacional', value: 0 },
  { id: '17', code: '0017', requestedAt: '2025-11-04', requester: 'Suporte', farm: 'Fazenda Maira', ageDays: 300, status: 'Cotação em andamento', priority: 'Média', justification: 'Reposição', value: 0 },
  { id: '18', code: '0018', requestedAt: '2025-11-10', requester: 'Suporte', farm: 'Fazenda Maira', ageDays: 294, status: 'Aguardando ciência', priority: 'Média', justification: 'Material para operação da fazenda', value: 0 },
  { id: '19', code: '0019', requestedAt: '2026-08-31', requester: 'Suporte', authorizer: 'Suporte', farm: 'Fazenda Maira', ageDays: 0, status: 'Pedido finalizado', priority: 'Média', justification: 'Serviço', value: 200 },
]

const formatDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR')
const isOpen = (row: SupplyRow) => !['Pedido finalizado', 'Compra recebida'].includes(row.status)

const SUPPLY_PDF_COLUMNS: PdfTableColumn<SupplyRow>[] = [
  { key: 'code', label: 'Pedido', width: 0.55, render: (row) => row.code },
  { key: 'date', label: 'Data', width: 0.7, render: (row) => formatDate(row.requestedAt) },
  { key: 'requester', label: 'Solicitante', width: 1.15, render: (row) => row.requester },
  { key: 'farm', label: 'Fazenda', width: 1.05, render: (row) => row.farm },
  { key: 'age', label: 'Tempo', width: 0.65, align: 'center', render: (row) => row.ageDays === 0 ? 'Hoje' : `${row.ageDays} dias` },
  { key: 'status', label: 'Status', width: 1.35, render: (row) => row.status },
  { key: 'priority', label: 'Prioridade', width: 0.7, align: 'center', render: (row) => row.priority },
  { key: 'value', label: 'Valor', width: 0.8, align: 'right', render: (row) => formatCurrency(row.value) },
]

function SupplyCard({ row }: { row: SupplyRow }) {
  return <DetailGrid columns={1} items={[
    { label: 'Pedido', value: row.code },
    { label: 'Solicitante', value: row.requester },
    { label: 'Status', value: row.status },
    { label: 'Prioridade', value: row.priority },
    { label: 'Valor', value: formatCurrency(row.value) },
  ]} />
}

export default function SuprimentosReportPage() {
  const [period, setPeriod] = useState<{ start: string | null; end: string | null }>({ start: '2024-12-01', end: '2026-08-31' })
  const [farm, setFarm] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState<SupplyRow[]>([])
  const [hasPreview, setHasPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toasts, show, dismiss } = useToast()

  const summary = useMemo(() => ({
    total: preview.reduce((sum, row) => sum + row.value, 0),
    open: preview.filter(isOpen).length,
    overdue: preview.filter((row) => isOpen(row) && row.ageDays > 30).length,
    finalized: preview.filter((row) => !isOpen(row)).length,
  }), [preview])

  const columns = useMemo<Column<SupplyRow>[]>(() => [
    { key: 'code', label: 'Pedido', render: (row) => row.code },
    { key: 'date', label: 'Data', render: (row) => formatDate(row.requestedAt) },
    { key: 'requester', label: 'Solicitante', render: (row) => row.requester },
    { key: 'age', label: 'Tempo', render: (row) => row.ageDays === 0 ? 'Hoje' : `${row.ageDays} dias` },
    { key: 'status', label: 'Status', render: (row) => row.status },
    { key: 'priority', label: 'Prioridade', render: (row) => row.priority },
    { key: 'value', label: 'Valor', align: 'right', render: (row) => formatCurrency(row.value) },
  ], [])

  const generatePreview = () => {
    setLoading(true)
    window.setTimeout(() => {
      const term = search.trim().toLocaleLowerCase('pt-BR')
      setPreview(SUPPLY_ROWS.filter((row) => (
        (!period.start || row.requestedAt >= period.start)
        && (!period.end || row.requestedAt <= period.end)
        && (!farm || row.farm === farm)
        && (!status || row.status === status)
        && (!priority || row.priority === priority)
        && (!term || `${row.code} ${row.requester} ${row.justification}`.toLocaleLowerCase('pt-BR').includes(term))
      )))
      setHasPreview(true)
      setLoading(false)
      show('Prévia de suprimentos atualizada com sucesso.')
    }, 350)
  }

  const exportReport = (type: ReportExportType) => {
    if (type !== 'PDF') return
    void downloadReportPdf(
      <BrandedReportDocument
        title="Relatório de suprimentos"
        description="Acompanhamento de solicitações, cotações, compras e recebimentos."
        emittedAt={new Date().toLocaleString('pt-BR')}
        metadata={[
          { label: 'Período', value: `${period.start ? formatDate(period.start) : 'Início'} a ${period.end ? formatDate(period.end) : 'Hoje'}` },
          { label: 'Fazenda', value: farm || 'Todas' },
          { label: 'Status', value: status || 'Todos' },
          { label: 'Prioridade', value: priority || 'Todas' },
        ]}
        highlights={[
          { label: 'Valor total', value: formatCurrency(summary.total), helper: `${preview.length} pedido(s)` },
          { label: 'Em aberto', value: String(summary.open) },
          { label: 'Acima de 30 dias', value: String(summary.overdue), helper: 'Pedidos ainda abertos' },
          { label: 'Concluídos', value: String(summary.finalized) },
        ]}
        columns={SUPPLY_PDF_COLUMNS}
        rows={preview}
        firstPageRows={7}
        rowsPerPage={9}
        getRowKey={(row) => row.id}
        getRowDetail={(row) => `${row.justification}${row.authorizer ? ` · Autorizador: ${row.authorizer}` : ''}`}
      />,
      'relatorio-suprimentos-gb-cerne.pdf',
    ).then(() => show('PDF de suprimentos gerado com sucesso.')).catch(() => show('Não foi possível gerar o PDF. Tente novamente.', 'error'))
  }

  const statusOptions = Array.from(new Set(SUPPLY_ROWS.map((row) => row.status)))
  const filters = <>
    <DateRangePicker label="Período do pedido" value={period} onChange={setPeriod} />
    <FormSelect label="Fazenda" value={farm} onChange={(event) => setFarm(event.target.value)} options={[{ value: '', label: 'Todas as fazendas' }, { value: 'Fazenda Maira', label: 'Fazenda Maira' }]} />
    <FormSelect label="Status" value={status} onChange={(event) => setStatus(event.target.value)} options={[{ value: '', label: 'Todos os status' }, ...statusOptions.map((value) => ({ value, label: value }))]} />
    <FormSelect label="Prioridade" value={priority} onChange={(event) => setPriority(event.target.value)} options={[{ value: '', label: 'Todas as prioridades' }, { value: 'Baixa', label: 'Baixa' }, { value: 'Média', label: 'Média' }, { value: 'Alta', label: 'Alta' }]} />
    <FormField label="Pesquisar" placeholder="Código, solicitante ou justificativa" value={search} onChange={(event) => setSearch(event.target.value)} />
  </>

  return <>
    <ReportWorkspace
      title="Suprimentos"
      description="Consulte o ciclo completo dos pedidos e identifique pendências rapidamente."
      filters={filters}
      columns={columns}
      data={preview}
      keyField="id"
      renderCard={(row) => <SupplyCard row={row} />}
      hasPreview={hasPreview}
      loading={loading}
      onPreview={generatePreview}
      onExport={exportReport}
      exportTypes={['PDF']}
      summary={<ReportSummary items={[
        { label: 'Valor total', value: formatCurrency(summary.total), helper: `${preview.length} pedido(s)` },
        { label: 'Em aberto', value: String(summary.open) },
        { label: 'Acima de 30 dias', value: String(summary.overdue), helper: 'Pedidos ainda abertos' },
        { label: 'Concluídos', value: String(summary.finalized) },
      ]} />}
    />
    <ToastContainer toasts={toasts} onDismiss={dismiss} />
  </>
}
