import { useMemo, useState } from 'react'
import { FormSelect } from '../../../components/ui/FormSelect'
import { ReportSummary } from '../../../components/ui/ReportSummary'
import { ReportWorkspace, type ReportExportType } from '../../../components/ui/ReportWorkspace'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { DreReportDocument } from '../../../components/ui/report-pdf/DreReportDocument'
import type { Column } from '../../../components/ui/DataTable'
import { downloadReportPdf } from '../../../utils/reportPdf'
import { formatDreCurrency, formatDrePercent, getDreRows, type DreRow, type DreView } from './dreData'

const VIEW_OPTIONS = [
  { value: 'synthetic', label: 'Sintético — grupos e totais' },
  { value: 'analytic', label: 'Analítico — detalhamento por conta' },
]

export default function DreAnualReportPage() {
  const [view, setView] = useState<DreView>('synthetic')
  const [farm, setFarm] = useState('Fazenda Maira')
  const [startYear, setStartYear] = useState('2025')
  const [endYear, setEndYear] = useState('2026')
  const [preview, setPreview] = useState<DreRow[]>([])
  const [hasPreview, setHasPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toasts, show, dismiss } = useToast()

  const totals = useMemo(() => ({
    revenue: 442778.9,
    ebitda: 195554.82,
    profit: 128338.42,
    margin: 28.98,
  }), [])

  const columns = useMemo<Column<DreRow>[]>(() => [
    {
      key: 'description',
      label: 'Descrição',
      width: '42%',
      sortable: false,
      render: (row) => (
        <span style={{ display: 'block', paddingLeft: row.level * 14, fontWeight: row.kind === 'result' ? 600 : row.kind === 'group' ? 500 : 400 }}>
          {row.description}
        </span>
      ),
    },
    { key: '2025', label: '2025', align: 'right', width: '15%', sortable: false, render: (row) => <span style={{ fontWeight: row.kind === 'result' ? 600 : 400 }}>{formatDreCurrency(row.year2025)}</span> },
    { key: '2026', label: '2026', align: 'right', width: '15%', sortable: false, render: (row) => <span style={{ fontWeight: row.kind === 'result' ? 600 : 400 }}>{formatDreCurrency(row.year2026)}</span> },
    { key: 'total', label: 'Acumulado', align: 'right', width: '16%', sortable: false, render: (row) => <span style={{ fontWeight: row.kind === 'result' ? 600 : 400 }}>{formatDreCurrency(row.total)}</span> },
    { key: 'percentage', label: '% da receita', align: 'right', width: '12%', sortable: false, render: (row) => <span style={{ fontWeight: row.kind === 'result' ? 600 : 400 }}>{formatDrePercent(row.percentage)}</span> },
  ], [])

  const generatePreview = () => {
    setLoading(true)
    window.setTimeout(() => {
      setPreview(getDreRows(view))
      setHasPreview(true)
      setLoading(false)
      show(`DRE anual ${view === 'analytic' ? 'analítico' : 'sintético'} atualizada com sucesso.`)
    }, 350)
  }

  const exportReport = (type: ReportExportType) => {
    if (type !== 'PDF') return
    const rows = preview.length > 0 ? preview : getDreRows(view)
    void downloadReportPdf(
      <DreReportDocument view={view} rows={rows} emittedAt={new Date().toLocaleString('pt-BR')} />,
      `dre-anual-${view === 'analytic' ? 'analitico' : 'sintetico'}-gb-cerne.pdf`,
    )
      .then(() => show('PDF da DRE anual gerado com sucesso.'))
      .catch(() => show('Não foi possível gerar o PDF. Tente novamente.', 'error'))
  }

  const filters = <>
    <FormSelect label="Visão" value={view} onChange={(event) => setView(event.target.value as DreView)} options={VIEW_OPTIONS} />
    <FormSelect label="Fazenda" value={farm} onChange={(event) => setFarm(event.target.value)} options={[{ value: 'Fazenda Maira', label: 'Fazenda Maira' }]} />
    <FormSelect label="Ano inicial" value={startYear} onChange={(event) => setStartYear(event.target.value)} options={[{ value: '2025', label: '2025' }]} />
    <FormSelect label="Ano final" value={endYear} onChange={(event) => setEndYear(event.target.value)} options={[{ value: '2026', label: '2026' }]} />
  </>

  return <>
    <ReportWorkspace
      title="DRE Anual"
      description="Compare o resultado do exercício entre anos e aprofunde a leitura até as contas analíticas."
      filters={filters}
      columns={columns}
      data={preview}
      keyField="id"
      renderCard={(row) => <div style={{ fontWeight: row.kind === 'result' ? 600 : 400 }}>{row.description} · {formatDreCurrency(row.total)} · {formatDrePercent(row.percentage)}</div>}
      hasPreview={hasPreview}
      loading={loading}
      onPreview={generatePreview}
      onExport={exportReport}
      exportTypes={['PDF']}
      summary={<ReportSummary items={[
        { label: 'Receita líquida', value: formatDreCurrency(totals.revenue), helper: `${startYear} a ${endYear}` },
        { label: 'EBITDA', value: formatDreCurrency(totals.ebitda) },
        { label: 'Lucro líquido', value: formatDreCurrency(totals.profit) },
        { label: 'Margem líquida', value: formatDrePercent(totals.margin), helper: `${view === 'analytic' ? 'Visão analítica' : 'Visão sintética'}` },
      ]} />}
    />
    <ToastContainer toasts={toasts} onDismiss={dismiss} />
  </>
}
