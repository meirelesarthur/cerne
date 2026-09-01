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

interface PayableRow {
  id: string
  titleNumber: string
  invoiceNumber?: string
  dueAt: string
  interest: number
  balance: number
  value: number
  syntheticAccount: string
  analyticAccount: string
  supplierDocument: string
  supplier: string
  owner: string
  history: string
  issuedAt: string
  type: string
  farm: string
  classification: 'Não classificado' | 'CAPEX'
  installment: string
  products?: string
  costCenter: string
}

const PAYABLE_ROWS: PayableRow[] = [
  { id: '1', titleNumber: '1165', dueAt: '2027-03-05', interest: 0, balance: 16666.67, value: 16666.67, syntheticAccount: 'Pgto amortizações', analyticAccount: 'Empréstimo de custeio', supplierDocument: '01.452.651/0001-85', supplier: 'Taurus Distribuidora de Petróleo Ltda.', owner: 'Ênio Nunes', history: 'Financiamento', issuedAt: '2024-09-18', type: 'Duplicata', farm: 'Fazenda Maira', classification: 'Não classificado', installment: '3 / 6', costCenter: 'Soja' },
  { id: '2', titleNumber: '1165', dueAt: '2027-03-05', interest: 0, balance: 3333.33, value: 3333.33, syntheticAccount: 'Juros pagos', analyticAccount: 'Juros de custeio', supplierDocument: '01.452.651/0001-85', supplier: 'Taurus Distribuidora de Petróleo Ltda.', owner: 'Ênio Nunes', history: 'Financiamento', issuedAt: '2024-09-18', type: 'Duplicata', farm: 'Fazenda Maira', classification: 'Não classificado', installment: '3 / 6', costCenter: 'Soja' },
  { id: '3', titleNumber: '5987', dueAt: '2026-09-19', interest: 0, balance: 10000, value: 10000, syntheticAccount: 'Pgto amortizações', analyticAccount: 'Empréstimo de custeio', supplierDocument: '18.240.007/0001-46', supplier: 'Agro365 Serv. e Com. Ltda.', owner: 'Ênio Nunes', history: 'Financiamento', issuedAt: '2024-09-19', type: 'Duplicata', farm: 'Fazenda Maira', classification: 'Não classificado', installment: '2 / 5', costCenter: 'Soja' },
  { id: '4', titleNumber: '123', invoiceNumber: '123', dueAt: '2025-05-20', interest: 0, balance: 35.94, value: 285.93, syntheticAccount: 'Reposição de animais', analyticAccount: 'Compra de animais - recria', supplierDocument: '18.240.007/0001-46', supplier: 'Agro365 Serv. e Com. Ltda.', owner: 'Ênio Nunes', history: 'Compra de animais', issuedAt: '2025-05-20', type: 'Boleto', farm: 'Fazenda Maira', classification: 'Não classificado', installment: '1 / 4', products: 'Bovinos - fêmeas acima de 36 meses; bucha de parafuso', costCenter: 'Soja' },
  { id: '5', titleNumber: '61882865', dueAt: '2025-07-30', interest: 0, balance: 41184, value: 41184, syntheticAccount: 'Reposição de animais', analyticAccount: 'Compra de animais - recria', supplierDocument: '320.800.770-15', supplier: 'Luiz Antonio Venker Menezes', owner: 'Ênio Nunes', history: 'Cópia de documento e atestado animal', issuedAt: '2025-07-30', type: 'Nota Fiscal - NF-e', farm: 'Fazenda Maira', classification: 'Não classificado', installment: '1 / 1', costCenter: 'Centro de custo / Apropriar' },
  { id: '6', titleNumber: '124327', invoiceNumber: '124327', dueAt: '2025-09-12', interest: 0, balance: 95.68, value: 95.68, syntheticAccount: 'Serviços de terceiros', analyticAccount: 'Aluguel de máquinas', supplierDocument: '02.151.215/0001-39', supplier: 'Madesil Ltda.', owner: 'Ênio Nunes', history: 'Pedido de venda 000001002715', issuedAt: '2025-08-13', type: 'Duplicata', farm: 'Fazenda Maira', classification: 'Não classificado', installment: '1 / 1', products: 'Esmalte Color 3,6 L amarelo canário; Resicolor 9263', costCenter: 'Centro de custo / Apropriar' },
  { id: '7', titleNumber: '123123', invoiceNumber: '123123', dueAt: '2025-09-19', interest: 0, balance: 172.5, value: 172.5, syntheticAccount: 'Reposição de animais', analyticAccount: 'Compra de animais - recria', supplierDocument: '10.439.340/0003-39', supplier: 'Agripetro Transporte e Comércio de Combustíveis', owner: 'Ênio Nunes', history: 'Reposição de estoque veterinário', issuedAt: '2025-09-19', type: 'Boleto', farm: 'Fazenda Maira', classification: 'Não classificado', installment: '1 / 1', products: 'Dectomax antiparasitário injetável 200 ml', costCenter: 'Centro de custo / Apropriar' },
  { id: '8', titleNumber: '49061299', dueAt: '2026-02-06', interest: 250, balance: 2050, value: 2300, syntheticAccount: 'Tarifas / Multas / Taxas', analyticAccount: 'Tarifas bancárias', supplierDocument: '18.240.007/0001-46', supplier: 'Agro365 Serv. e Com. Ltda.', owner: 'Ênio Nunes', history: 'Financeiro da fatura 0068', issuedAt: '2026-01-21', type: 'Débito / Cartão', farm: 'Fazenda Maira', classification: 'Não classificado', installment: '1 / 1', costCenter: 'Cria' },
  { id: '9', titleNumber: '001', dueAt: '2026-01-29', interest: 0, balance: 1000, value: 1000, syntheticAccount: 'Impostos sobre vendas', analyticAccount: 'Imposto - COFINS', supplierDocument: 'S/ID', supplier: 'Teste', owner: 'Ênio Nunes', history: 'Tributo', issuedAt: '2026-01-27', type: 'Duplicata', farm: 'Fazenda Maira', classification: 'CAPEX', installment: '1 / 1', costCenter: 'Centro de custo / Apropriar' },
  { id: '10', titleNumber: '1414', invoiceNumber: '1414', dueAt: '2026-02-07', interest: 0, balance: 72500, value: 72500, syntheticAccount: 'Combustíveis / Lubrificantes', analyticAccount: 'Gasolina / Etanol', supplierDocument: '37.314.846/0001-06', supplier: 'Acacio José de Oliveira', owner: 'Ênio Nunes', history: 'Conta a pagar originada da nota fiscal', issuedAt: '2026-02-07', type: 'Pix', farm: 'Fazenda Maira', classification: 'Não classificado', installment: '1 / 1', products: 'Produto X', costCenter: 'Escritório Central' },
  { id: '11', titleNumber: '94046714', dueAt: '2026-01-10', interest: 0, balance: 1900, value: 1900, syntheticAccount: 'Despesas administrativas', analyticAccount: 'Energia elétrica', supplierDocument: '00.000.000/0000-01', supplier: 'Fornecedor sem identificação', owner: 'Ênio Nunes', history: 'Financeiro da fatura 0066', issuedAt: '2026-04-27', type: 'Boleto', farm: 'Fazenda Maira', classification: 'Não classificado', installment: '1 / 1', costCenter: 'Soja' },
  { id: '12', titleNumber: '4/2026', dueAt: '2026-05-05', interest: 0, balance: 1950, value: 1950, syntheticAccount: 'Mão de obra', analyticAccount: 'Salários permanentes', supplierDocument: '291.145.746-32', supplier: 'Pedro Mário', owner: 'Ênio Nunes', history: 'Folha de pagamento ref. 4/2026', issuedAt: '2026-05-05', type: 'Folha de pagamento', farm: 'Fazenda Maira', classification: 'Não classificado', installment: '1 / 1', costCenter: 'Escritório Central' },
  { id: '13', titleNumber: '101010', dueAt: '2026-09-29', interest: 0, balance: 20000, value: 20000, syntheticAccount: 'Pgto amortizações', analyticAccount: 'Empréstimo particular', supplierDocument: '18.240.007/0001-46', supplier: 'Agro365 Serv. e Com. Ltda.', owner: 'Ênio Nunes', history: 'Financiamento 24/06/2026', issuedAt: '2026-06-24', type: 'Pix', farm: 'Fazenda Maira', classification: 'Não classificado', installment: '4 / 5', costCenter: 'Cria' },
  { id: '14', titleNumber: '44', dueAt: '2026-08-31', interest: 0, balance: 200, value: 200, syntheticAccount: 'Manutenções de máquinas', analyticAccount: 'Serviços mecânicos', supplierDocument: '18.240.007/0001-46', supplier: 'Agro365 Serv. e Com. Ltda.', owner: 'Ênio Nunes', history: 'Teste máquinas e implementos', issuedAt: '2026-08-31', type: 'Boleto', farm: 'Fazenda Maira', classification: 'Não classificado', installment: '1 / 1', costCenter: 'Escritório Central' },
]

const REPORT_TODAY = '2026-08-31'
const formatDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR')
const dueStatus = (row: PayableRow) => row.dueAt < REPORT_TODAY ? 'Vencido' : row.dueAt === REPORT_TODAY ? 'Vence hoje' : 'A vencer'

const PAYABLE_PDF_COLUMNS: PdfTableColumn<PayableRow>[] = [
  { key: 'title', label: 'Título', width: 0.6, render: (row) => row.titleNumber },
  { key: 'due', label: 'Vencimento', width: 0.8, render: (row) => `${formatDate(row.dueAt)}\n${dueStatus(row)}` },
  { key: 'supplier', label: 'Fornecedor', width: 1.45, render: (row) => row.supplier },
  { key: 'account', label: 'Conta', width: 1.2, render: (row) => `${row.syntheticAccount}\n${row.analyticAccount}` },
  { key: 'farm', label: 'Fazenda', width: 0.85, render: (row) => row.farm },
  { key: 'costCenter', label: 'Centro de custo', width: 1.05, render: (row) => row.costCenter },
  { key: 'installment', label: 'Parcela', width: 0.55, align: 'center', render: (row) => row.installment },
  { key: 'type', label: 'Tipo', width: 0.8, render: (row) => row.type },
  { key: 'value', label: 'Valor', width: 0.8, align: 'right', render: (row) => formatCurrency(row.value) },
  { key: 'balance', label: 'Saldo', width: 0.8, align: 'right', render: (row) => formatCurrency(row.balance) },
]

function PayableCard({ row }: { row: PayableRow }) {
  return <DetailGrid columns={1} items={[
    { label: 'Título', value: row.titleNumber },
    { label: 'Fornecedor', value: row.supplier },
    { label: 'Vencimento', value: `${formatDate(row.dueAt)} · ${dueStatus(row)}` },
    { label: 'Conta', value: `${row.syntheticAccount} / ${row.analyticAccount}` },
    { label: 'Saldo', value: formatCurrency(row.balance) },
  ]} />
}

export default function ContasPagarReportPage() {
  const [period, setPeriod] = useState<{ start: string | null; end: string | null }>({ start: '2025-01-01', end: '2030-12-31' })
  const [farm, setFarm] = useState('')
  const [owner, setOwner] = useState('')
  const [classification, setClassification] = useState('')
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState<PayableRow[]>([])
  const [hasPreview, setHasPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toasts, show, dismiss } = useToast()

  const summary = useMemo(() => ({
    value: preview.reduce((sum, row) => sum + row.value, 0),
    balance: preview.reduce((sum, row) => sum + row.balance, 0),
    interest: preview.reduce((sum, row) => sum + row.interest, 0),
    overdue: preview.filter((row) => dueStatus(row) === 'Vencido').length,
  }), [preview])

  const columns = useMemo<Column<PayableRow>[]>(() => [
    { key: 'title', label: 'Título', render: (row) => row.titleNumber },
    { key: 'due', label: 'Vencimento', render: (row) => `${formatDate(row.dueAt)} · ${dueStatus(row)}` },
    { key: 'supplier', label: 'Fornecedor', render: (row) => row.supplier },
    { key: 'account', label: 'Conta', render: (row) => `${row.syntheticAccount} / ${row.analyticAccount}` },
    { key: 'farm', label: 'Fazenda', render: (row) => row.farm },
    { key: 'value', label: 'Valor', align: 'right', render: (row) => formatCurrency(row.value) },
    { key: 'balance', label: 'Saldo', align: 'right', render: (row) => formatCurrency(row.balance) },
  ], [])

  const generatePreview = () => {
    setLoading(true)
    window.setTimeout(() => {
      const term = search.trim().toLocaleLowerCase('pt-BR')
      setPreview(PAYABLE_ROWS.filter((row) => (
        (!period.start || row.dueAt >= period.start)
        && (!period.end || row.dueAt <= period.end)
        && (!farm || row.farm === farm)
        && (!owner || row.owner === owner)
        && (!classification || row.classification === classification)
        && (!term || `${row.titleNumber} ${row.invoiceNumber ?? ''} ${row.supplier} ${row.history}`.toLocaleLowerCase('pt-BR').includes(term))
      )))
      setHasPreview(true)
      setLoading(false)
      show('Prévia de contas a pagar atualizada com sucesso.')
    }, 350)
  }

  const exportReport = (type: ReportExportType) => {
    if (type !== 'PDF') return
    void downloadReportPdf(
      <BrandedReportDocument
        title="Contas a pagar"
        description="Posição de títulos, vencimentos, fornecedores e saldos em aberto."
        emittedAt={new Date().toLocaleString('pt-BR')}
        metadata={[
          { label: 'Vencimento', value: `${period.start ? formatDate(period.start) : 'Início'} a ${period.end ? formatDate(period.end) : 'Em aberto'}` },
          { label: 'Fazenda', value: farm || 'Todas' },
          { label: 'Proprietário', value: owner || 'Todos' },
          { label: 'Classificação', value: classification || 'Todas' },
        ]}
        highlights={[
          { label: 'Valor dos títulos', value: formatCurrency(summary.value), helper: `${preview.length} lançamento(s)` },
          { label: 'Saldo em aberto', value: formatCurrency(summary.balance) },
          { label: 'Juros', value: formatCurrency(summary.interest) },
          { label: 'Títulos vencidos', value: String(summary.overdue), helper: `Referência: ${formatDate(REPORT_TODAY)}` },
        ]}
        columns={PAYABLE_PDF_COLUMNS}
        rows={preview}
        firstPageRows={7}
        rowsPerPage={7}
        getRowKey={(row) => row.id}
        getRowDetail={(row) => [
          `Doc. ${row.supplierDocument}`,
          `Emissão ${formatDate(row.issuedAt)}`,
          row.history,
          row.products && `Produtos: ${row.products}`,
          row.classification,
        ].filter(Boolean).join(' · ')}
      />,
      'contas-a-pagar-gb-cerne.pdf',
    ).then(() => show('PDF de contas a pagar gerado com sucesso.')).catch(() => show('Não foi possível gerar o PDF. Tente novamente.', 'error'))
  }

  const filters = <>
    <DateRangePicker label="Período de vencimento" value={period} onChange={setPeriod} />
    <FormSelect label="Fazenda" value={farm} onChange={(event) => setFarm(event.target.value)} options={[{ value: '', label: 'Todas as fazendas' }, { value: 'Fazenda Maira', label: 'Fazenda Maira' }]} />
    <FormSelect label="Proprietário" value={owner} onChange={(event) => setOwner(event.target.value)} options={[{ value: '', label: 'Todos os proprietários' }, { value: 'Ênio Nunes', label: 'Ênio Nunes' }]} />
    <FormSelect label="Classificação" value={classification} onChange={(event) => setClassification(event.target.value)} options={[{ value: '', label: 'Todas as classificações' }, { value: 'Não classificado', label: 'Não classificado' }, { value: 'CAPEX', label: 'CAPEX' }]} />
    <FormField label="Pesquisar" placeholder="Título, nota, fornecedor ou histórico" value={search} onChange={(event) => setSearch(event.target.value)} />
  </>

  return <>
    <ReportWorkspace
      title="Contas a Pagar"
      description="Analise vencimentos e saldos sem perder os detalhes contábeis de cada título."
      filters={filters}
      columns={columns}
      data={preview}
      keyField="id"
      renderCard={(row) => <PayableCard row={row} />}
      hasPreview={hasPreview}
      loading={loading}
      onPreview={generatePreview}
      onExport={exportReport}
      exportTypes={['PDF']}
      summary={<ReportSummary items={[
        { label: 'Valor dos títulos', value: formatCurrency(summary.value), helper: `${preview.length} lançamento(s)` },
        { label: 'Saldo em aberto', value: formatCurrency(summary.balance) },
        { label: 'Juros', value: formatCurrency(summary.interest) },
        { label: 'Títulos vencidos', value: String(summary.overdue), helper: `Referência: ${formatDate(REPORT_TODAY)}` },
      ]} />}
    />
    <ToastContainer toasts={toasts} onDismiss={dismiss} />
  </>
}
