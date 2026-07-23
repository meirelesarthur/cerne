import { useMemo, useState } from 'react'
import { GitMerge, Plus, Upload } from 'lucide-react'
import { AllocationEditor, type AllocationItem } from '../../../components/ui/AllocationEditor'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Checkbox } from '../../../components/ui/Checkbox'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { DropdownMenu } from '../../../components/ui/DropdownMenu'
import { FeedbackBanner } from '../../../components/ui/FeedbackBanner'
import { FormField } from '../../../components/ui/FormField'
import { FormSection } from '../../../components/ui/FormSection'
import { FormSelect } from '../../../components/ui/FormSelect'
import { ImportDialog } from '../../../components/ui/ImportDialog'
import { ListToolbar } from '../../../components/ui/ListToolbar'
import { Modal } from '../../../components/ui/Modal'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Pagination } from '../../../components/ui/Pagination'
import { ReconciliationWorkspace, type ReconciliationItem } from '../../../components/ui/ReconciliationWorkspace'
import { Tabs } from '../../../components/ui/Tabs'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { t } from '../../../design/tokens'

interface OfxImport {
  id: string
  fileName: string
  account: string
  period: string
  importedAt: string
  movements: number
  pending: number
}

const INITIAL_IMPORTS: OfxImport[] = [
  { id: 'ofx-1', fileName: 'extrato-julho-2026.ofx', account: 'Sicredi · Conta Operacional', period: '01/07/2026 — 22/07/2026', importedAt: '22/07/2026 16:42', movements: 48, pending: 3 },
  { id: 'ofx-2', fileName: 'extrato-junho-2026.ofx', account: 'Banco do Brasil · Conta Movimento', period: '01/06/2026 — 30/06/2026', importedAt: '01/07/2026 09:15', movements: 112, pending: 0 },
]

const INITIAL_BANK_ITEMS: ReconciliationItem[] = [
  { id: 'bank-1', date: '22/07/2026', description: 'PIX AGROPECUARIA CAMPO', amount: -4850, status: 'pending' },
  { id: 'bank-2', date: '21/07/2026', description: 'TED RECEBIDA COOPERATIVA', amount: 12600, status: 'pending' },
  { id: 'bank-3', date: '20/07/2026', description: 'TARIFA PACOTE SERVICOS', amount: -89.9, status: 'pending' },
]

const SYSTEM_ITEMS: ReconciliationItem[] = [
  { id: 'sys-1', date: '22/07/2026', description: 'CP-2026-481 · Agropecuária Campo', amount: -4850, status: 'matched' },
  { id: 'sys-2', date: '21/07/2026', description: 'CR-2026-214 · Cooperativa Vale Verde', amount: 12600, status: 'matched' },
]

export default function OfxImportPage() {
  const [tab, setTab] = useState('history')
  const [imports, setImports] = useState(INITIAL_IMPORTS)
  const [bankItems, setBankItems] = useState(INITIAL_BANK_ITEMS)
  const [search, setSearch] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [movementItem, setMovementItem] = useState<ReconciliationItem | null>(null)
  const [linkItem, setLinkItem] = useState<ReconciliationItem | null>(null)
  const [selectedTitle, setSelectedTitle] = useState('sys-1')
  const [account, setAccount] = useState('sicredi')
  const [startDate, setStartDate] = useState('2026-07-01')
  const [endDate, setEndDate] = useState('2026-07-23')
  const [allocations, setAllocations] = useState<AllocationItem[]>([])
  const { toasts, show, dismiss } = useToast()

  const filteredImports = useMemo(() => imports.filter((item) => !search.trim() || `${item.fileName} ${item.account}`.toLowerCase().includes(search.toLowerCase())), [imports, search])

  const markReconciled = (item: ReconciliationItem, status: 'matched' | 'created') => {
    setBankItems((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, status } : candidate))
    setMovementItem(null)
    setLinkItem(null)
    show(status === 'matched' ? 'Título vinculado ao movimento bancário.' : 'Movimento criado e conciliado.')
  }

  const columns: Column<OfxImport>[] = [
    { key: 'file', label: 'Arquivo', render: (item) => item.fileName },
    { key: 'account', label: 'Conta', render: (item) => item.account },
    { key: 'period', label: 'Período', render: (item) => item.period },
    { key: 'movements', label: 'Movimentos', align: 'right', render: (item) => String(item.movements) },
    { key: 'status', label: 'Conciliação', width: 140, render: (item) => <Badge label={item.pending ? `${item.pending} pendentes` : 'Concluída'} variant={item.pending ? 'warning' : 'success'} /> },
    { key: 'actions', label: 'Ações', width: 72, align: 'right', sortable: false, render: () => <DropdownMenu items={[{ id: 'reconcile', label: 'Conciliar', icon: <GitMerge size={15} />, onClick: () => setTab('reconciliation') }]} /> },
  ]

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader title="Importação OFX" description="Importe extratos e concilie movimentos do banco com o financeiro." actions={<Button icon={<Upload size={16} />} onClick={() => setImportOpen(true)}>Importar OFX</Button>} />
        <Tabs items={[{ id: 'history', label: 'Histórico de importações' }, { id: 'reconciliation', label: `Conciliação (${bankItems.filter((item) => item.status === 'pending').length})` }]} activeId={tab} onChange={setTab} syncParam="ofxTab" />

        {tab === 'history' ? (
          <div style={{ marginTop: t.space[4] }}>
            <ListToolbar search={search} onSearch={setSearch} searchPlaceholder="Buscar arquivo ou conta…" />
            <DataTable columns={columns} data={filteredImports} keyField="id" emptyMessage="Nenhuma importação encontrada." />
            <div style={{ marginTop: t.space[4] }}><Pagination page={1} total={filteredImports.length} pageSize={10} onPageChange={() => undefined} /></div>
          </div>
        ) : (
          <div style={{ marginTop: t.space[5] }}>
            <ReconciliationWorkspace
              bankItems={bankItems}
              systemItems={SYSTEM_ITEMS}
              onLink={(item) => { setLinkItem(item); setSelectedTitle(item.amount < 0 ? 'sys-1' : 'sys-2') }}
              onCreate={(item) => { setMovementItem(item); setAllocations([{ id: crypto.randomUUID(), label: 'A classificar', amount: Math.abs(item.amount), percent: 100 }]) }}
            />
          </div>
        )}
      </PageCard>

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Importar extrato OFX"
        accept=".ofx"
        maxSizeMb={5}
        onImport={async (file) => {
          await new Promise((resolve) => window.setTimeout(resolve, 500))
          setImports((current) => [{ id: crypto.randomUUID(), fileName: file.name, account: account === 'sicredi' ? 'Sicredi · Conta Operacional' : 'Banco do Brasil · Conta Movimento', period: `${startDate.split('-').reverse().join('/')} — ${endDate.split('-').reverse().join('/')}`, importedAt: 'Agora', movements: 24, pending: 3 }, ...current])
          setImportOpen(false)
          setTab('reconciliation')
          show('Extrato importado. Revise os movimentos pendentes.')
          return []
        }}
      >
        <FormSection title="Parâmetros do extrato" columns={2}>
          <FormSelect label="Conta" required value={account} onChange={(event) => setAccount(event.target.value)} options={[{ value: 'sicredi', label: 'Sicredi · Conta Operacional' }, { value: 'bb', label: 'Banco do Brasil · Conta Movimento' }]} />
          <FormField label="Data inicial" type="date" required value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <FormField label="Data final" type="date" required value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </FormSection>
      </ImportDialog>

      <Modal open={linkItem !== null} onClose={() => setLinkItem(null)} title="Vincular título" subtitle="Selecione um título com valor compatível." size="lg" footer={<><Button variant="secondary" onClick={() => setLinkItem(null)}>Cancelar</Button><Button disabled={!selectedTitle || !linkItem} onClick={() => linkItem && markReconciled(linkItem, 'matched')}>Vincular e Conciliar</Button></>}>
        {linkItem && <DetailGrid items={[{ label: 'Movimento bancário', value: linkItem.description }, { label: 'Valor', value: Math.abs(linkItem.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }]} />}
        <FormSection title="Títulos encontrados">
          {SYSTEM_ITEMS.map((item) => <Checkbox key={item.id} label={`${item.description} · ${Math.abs(item.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} checked={selectedTitle === item.id} onChange={() => setSelectedTitle(item.id)} />)}
        </FormSection>
      </Modal>

      <Modal open={movementItem !== null} onClose={() => setMovementItem(null)} title="Criar movimento" subtitle="Classifique o movimento antes de conciliá-lo." size="lg" footer={<><Button variant="secondary" onClick={() => setMovementItem(null)}>Cancelar</Button><Button icon={<Plus size={15} />} disabled={!movementItem} onClick={() => movementItem && markReconciled(movementItem, 'created')}>Criar e Conciliar</Button></>}>
        {movementItem && (
          <>
            <FeedbackBanner variant="info" title={movementItem.description} description={`Movimento de ${Math.abs(movementItem.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`} />
            <FormSection title="Rateio"><AllocationEditor items={allocations} targetAmount={Math.abs(movementItem.amount)} onChange={setAllocations} /></FormSection>
          </>
        )}
      </Modal>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
