import { useMemo, useState } from 'react'
import { Eye, ShieldCheck } from 'lucide-react'
import { Badge, type BadgeVariant } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { DropdownMenu } from '../../../components/ui/DropdownMenu'
import { FeedbackBanner } from '../../../components/ui/FeedbackBanner'
import { FilterSelect } from '../../../components/ui/FilterSelect'
import { FormField } from '../../../components/ui/FormField'
import { FormSection } from '../../../components/ui/FormSection'
import { ListToolbar } from '../../../components/ui/ListToolbar'
import { Modal } from '../../../components/ui/Modal'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Pagination } from '../../../components/ui/Pagination'
import { ResponsiveDataTable } from '../../../components/ui/ResponsiveDataTable'
import { StatusLegend } from '../../../components/ui/StatusLegend'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { WorkflowTimeline } from '../../../components/ui/WorkflowTimeline'
import { formatCurrency } from '../../../components/ui/CurrencyField'
import { t } from '../../../design/tokens'

type PurchaseStatus = 'quotation' | 'approval' | 'authorized' | 'rejected'

interface PurchaseRequest {
  id: string
  code: string
  requester: string
  supplier: string
  total: number
  urgent: boolean
  status: PurchaseStatus
  createdAt: string
}

interface QuoteItem {
  id: string
  product: string
  quantity: number
  unit: string
  unitPrice: number
}

const STATUS_CONFIG: Record<PurchaseStatus, { label: string; variant: BadgeVariant }> = {
  quotation: { label: 'Em cotação', variant: 'info' },
  approval: { label: 'Aguardando autorização', variant: 'warning' },
  authorized: { label: 'Autorizada', variant: 'success' },
  rejected: { label: 'Recusada', variant: 'danger' },
}

const QUOTE_ITEMS: QuoteItem[] = [
  { id: '1', product: 'Sal mineral 30 kg', quantity: 80, unit: 'SC', unitPrice: 128.5 },
  { id: '2', product: 'Núcleo proteico', quantity: 25, unit: 'SC', unitPrice: 214 },
  { id: '3', product: 'Frete rodoviário', quantity: 1, unit: 'SV', unitPrice: 1850 },
]

const INITIAL_REQUESTS: PurchaseRequest[] = [
  { id: 'req-1', code: 'SC-2026-0184', requester: 'Marina Alves', supplier: 'NutriCampo', total: 17480, urgent: true, status: 'approval', createdAt: '22/07/2026' },
  { id: 'req-2', code: 'SC-2026-0179', requester: 'Carlos Nogueira', supplier: 'Agro Peças Centro-Oeste', total: 8950, urgent: false, status: 'quotation', createdAt: '20/07/2026' },
  { id: 'req-3', code: 'SC-2026-0168', requester: 'Renata Lima', supplier: 'Fertilizantes Vale', total: 42600, urgent: false, status: 'authorized', createdAt: '17/07/2026' },
]

export default function AutorizacaoCompraPage() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<PurchaseRequest | null>(null)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const { toasts, show, dismiss } = useToast()

  const filtered = useMemo(() => requests.filter((request) => {
    const query = search.trim().toLocaleLowerCase('pt-BR')
    const matchesSearch = !query || `${request.code} ${request.requester} ${request.supplier}`.toLocaleLowerCase('pt-BR').includes(query)
    return matchesSearch && (status === 'all' || request.status === status)
  }), [requests, search, status])
  const pageSize = 10
  const pageRequests = filtered.slice((page - 1) * pageSize, page * pageSize)

  const updateStatus = (nextStatus: PurchaseStatus) => {
    if (!selected) return
    setRequests((current) => current.map((request) => request.id === selected.id ? { ...request, status: nextStatus } : request))
    setSelected(null)
    setRejecting(false)
    setReason('')
    show(nextStatus === 'authorized' ? 'Compra autorizada com sucesso.' : 'Solicitação recusada e devolvida ao responsável.', nextStatus === 'authorized' ? 'success' : 'warning')
  }

  const columns: Column<PurchaseRequest>[] = [
    { key: 'code', label: 'Solicitação', width: 170, render: (request) => request.code },
    { key: 'requester', label: 'Solicitante', render: (request) => request.requester },
    { key: 'supplier', label: 'Fornecedor', render: (request) => request.supplier },
    { key: 'total', label: 'Total', align: 'right', render: (request) => formatCurrency(request.total) },
    { key: 'priority', label: 'Tipo', width: 110, render: (request) => <Badge label={request.urgent ? 'Urgente' : 'Normal'} variant={request.urgent ? 'danger' : 'neutral'} /> },
    { key: 'status', label: 'Status', width: 190, render: (request) => <Badge label={STATUS_CONFIG[request.status].label} variant={STATUS_CONFIG[request.status].variant} /> },
    { key: 'actions', label: 'Ações', width: 72, align: 'right', sortable: false, render: (request) => (
      <DropdownMenu items={[{
        id: 'open',
        label: request.status === 'approval' ? 'Revisar e autorizar' : request.status === 'authorized' ? 'Dar ciência' : 'Ver detalhes',
        icon: request.status === 'approval' ? <ShieldCheck size={15} /> : <Eye size={15} />,
        onClick: () => setSelected(request),
      }]} />
    ) },
  ]

  const quoteColumns: Column<QuoteItem>[] = [
    { key: 'product', label: 'Item', render: (item) => item.product },
    { key: 'quantity', label: 'Quantidade', align: 'right', render: (item) => `${item.quantity} ${item.unit}` },
    { key: 'unitPrice', label: 'Valor unitário', align: 'right', render: (item) => formatCurrency(item.unitPrice) },
    { key: 'total', label: 'Total', align: 'right', render: (item) => formatCurrency(item.quantity * item.unitPrice) },
  ]

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader title="Autorização de Compra" description="Revise cotações e decida as solicitações sob sua responsabilidade." count={filtered.length} />
        <ListToolbar
          search={search}
          onSearch={(value) => { setSearch(value); setPage(1) }}
          searchPlaceholder="Buscar solicitação, responsável ou fornecedor…"
          actions={<FilterSelect ariaLabel="Filtrar por status" prefix="Status:" value={status} onChange={(value) => { setStatus(value); setPage(1) }} options={[{ value: 'all', label: 'Todos' }, ...Object.entries(STATUS_CONFIG).map(([value, config]) => ({ value, label: config.label }))]} />}
        />
        <div style={{ marginBottom: t.space[4] }}>
          <StatusLegend items={Object.values(STATUS_CONFIG).map((config) => ({ label: config.label, variant: config.variant }))} />
        </div>
        <ResponsiveDataTable columns={columns} data={pageRequests} keyField="id" emptyMessage="Nenhuma solicitação encontrada." renderCard={(request) => <DetailGrid columns={1} items={[
          { label: 'Solicitação', value: request.code },
          { label: 'Fornecedor', value: request.supplier },
          { label: 'Valor', value: formatCurrency(request.total) },
          { label: 'Status', value: <Badge label={STATUS_CONFIG[request.status].label} variant={STATUS_CONFIG[request.status].variant} /> },
        ]} />} />
        <div style={{ marginTop: t.space[4] }}><Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} /></div>
      </PageCard>

      <Modal
        open={selected !== null && !rejecting}
        onClose={() => setSelected(null)}
        title={selected ? `Cotação ${selected.code}` : 'Cotação'}
        subtitle="Compare os dados da solicitação antes de decidir."
        size="lg"
        footer={selected?.status === 'approval' ? <><Button variant="destructive" onClick={() => setRejecting(true)}>Recusar…</Button><Button onClick={() => updateStatus('authorized')}>Autorizar Compra</Button></> : <Button onClick={() => setSelected(null)}>Fechar</Button>}
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[5] }}>
            <WorkflowTimeline steps={[
              { id: 'request', label: 'Solicitação', status: 'completed', description: selected.createdAt },
              { id: 'quotation', label: 'Cotação', status: 'completed', description: '3 propostas' },
              { id: 'approval', label: 'Autorização', status: selected.status === 'approval' ? 'current' : selected.status === 'rejected' ? 'rejected' : 'completed' },
              { id: 'purchase', label: 'Compra', status: selected.status === 'authorized' ? 'current' : 'pending' },
            ]} />
            {selected.urgent && <FeedbackBanner variant="warning" title="Solicitação urgente" description="O solicitante marcou esta compra como crítica para a operação." />}
            <DetailGrid items={[
              { label: 'Solicitante', value: selected.requester },
              { label: 'Fornecedor escolhido', value: selected.supplier },
              { label: 'Condição de pagamento', value: '28 dias' },
              { label: 'Valor total', value: formatCurrency(selected.total) },
            ]} />
            <FormSection title="Itens da cotação"><DataTable columns={quoteColumns} data={QUOTE_ITEMS} keyField="id" /></FormSection>
          </div>
        )}
      </Modal>

      <Modal open={rejecting} onClose={() => setRejecting(false)} title="Recusar solicitação" subtitle="Explique o motivo para orientar a correção do solicitante." size="sm" footer={<><Button variant="secondary" onClick={() => setRejecting(false)}>Voltar</Button><Button variant="destructive" disabled={reason.trim().length < 10} onClick={() => updateStatus('rejected')}>Confirmar Recusa</Button></>}>
        <FormField label="Motivo da recusa" required multiline rows={4} value={reason} onChange={(event) => setReason(event.target.value)} error={reason.length > 0 && reason.trim().length < 10 ? 'Descreva o motivo em pelo menos 10 caracteres.' : undefined} />
      </Modal>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
