import { useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { AllocationEditor, type AllocationItem } from '../../../components/ui/AllocationEditor'
import { AsyncSearchSelect } from '../../../components/ui/AsyncSearchSelect'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { CurrencyField } from '../../../components/ui/CurrencyField'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { FeedbackBanner } from '../../../components/ui/FeedbackBanner'
import { FileUpload, type UploadedFile } from '../../../components/ui/FileUpload'
import { FormField } from '../../../components/ui/FormField'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormSection } from '../../../components/ui/FormSection'
import { FormSelect } from '../../../components/ui/FormSelect'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import type { SearchSelectOption } from '../../../components/ui/SearchSelect'

const ACCOUNT_OPTIONS: SearchSelectOption[] = [
  { id: 'account-1', code: '001/4587-2', label: 'Banco do Brasil · Conta Movimento' },
  { id: 'account-2', code: '748/9912-0', label: 'Sicredi · Conta Operacional' },
  { id: 'account-3', code: '341/7721-4', label: 'Itaú · Investimentos' },
]

async function loadAccounts(query: string, signal: AbortSignal) {
  await new Promise((resolve, reject) => {
    const timer = window.setTimeout(resolve, 350)
    signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Abortado', 'AbortError')) })
  })
  return ACCOUNT_OPTIONS.filter((option) => `${option.code} ${option.label}`.toLowerCase().includes(query.toLowerCase()))
}

export default function BaixaTitulosPage() {
  const [writeoffType, setWriteoffType] = useState('bank')
  const [account, setAccount] = useState<SearchSelectOption | null>(ACCOUNT_OPTIONS[0])
  const [movementDate, setMovementDate] = useState('2026-07-23')
  const [amount, setAmount] = useState(18000)
  const [discount, setDiscount] = useState(0)
  const [penalty, setPenalty] = useState(0)
  const [interest, setInterest] = useState(450)
  const [increase, setIncrease] = useState(0)
  const [allocations, setAllocations] = useState<AllocationItem[]>([
    { id: 'allocation-1', label: 'Insumos agrícolas', amount: 11070, percent: 60 },
    { id: 'allocation-2', label: 'Operação de plantio', amount: 7380, percent: 40 },
  ])
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toasts, show, dismiss } = useToast()

  const netValue = amount - discount + penalty + interest + increase
  const allocated = allocations.reduce((total, item) => total + item.amount, 0)
  const balanced = Math.abs(netValue - allocated) < 0.01
  const canSubmit = Boolean(account && movementDate && amount > 0 && amount <= 25000 && balanced)

  const originDetails = useMemo(() => [
    { label: 'Título', value: 'CP-2026-00481' },
    { label: 'Fornecedor', value: 'Agroinsumos Cerrado Ltda.' },
    { label: 'Vencimento', value: '25/07/2026' },
    { label: 'Saldo disponível', value: 'R$ 25.000,00' },
    { label: 'Estado', value: <Badge label="Em aberto" variant="warning" /> },
    { label: 'Documento', value: 'NF-e 48291' },
  ], [])

  const submit = async () => {
    setSaving(true)
    await new Promise((resolve) => window.setTimeout(resolve, 700))
    setSaving(false)
    setConfirmOpen(false)
    show('Baixa efetivada com sucesso.')
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={(
          <>
            <Button variant="secondary" icon={<ArrowLeft size={16} />}>Voltar</Button>
            <Button icon={<CheckCircle2 size={16} />} disabled={!canSubmit} onClick={() => setConfirmOpen(true)}>Efetivar Baixa</Button>
          </>
        )}
      >
        <FormPageHeader title="Baixa de Título" subtitle="Revise os valores e o rateio antes de efetivar a quitação." onBack={() => undefined} />

        <FormSection title="Título de origem" subtitle="Informações somente-leitura da conta a pagar.">
          <DetailGrid items={originDetails} columns={3} />
        </FormSection>

        <FormSection title="Informações gerais" columns={2}>
          <FormSelect
            label="Tipo de baixa"
            required
            value={writeoffType}
            onChange={(event) => setWriteoffType(event.target.value)}
            options={[
              { value: 'bank', label: 'Movimento bancário' },
              { value: 'cross', label: 'Baixa cruzada' },
              { value: 'invoice', label: 'Nota fiscal' },
              { value: 'card', label: 'Fatura / Cartão' },
            ]}
          />
          <FormField label="Data do movimento" type="date" required value={movementDate} onChange={(event) => setMovementDate(event.target.value)} />
          <AsyncSearchSelect label="Conta contábil / banco" required selectedId={account?.id} selectedOption={account} onSelect={setAccount} onClear={() => setAccount(null)} loadOptions={loadAccounts} />
        </FormSection>

        {writeoffType === 'bank' && (
          <FeedbackBanner variant="info" title="Movimento bancário" description="A quitação será vinculada à conta selecionada e aparecerá na conciliação." />
        )}
        {writeoffType === 'cross' && (
          <FormSection title="Baixa cruzada" subtitle="Selecione o título de contrapartida com saldo disponível." columns={2}>
            <FormField label="Cliente / fornecedor" value="Cooperativa Vale Verde" readOnly />
            <FormField label="Título de contrapartida" value="CR-2026-00214 · R$ 18.450,00" readOnly />
          </FormSection>
        )}
        {writeoffType === 'invoice' && (
          <FormSection title="Nota fiscal vinculada" columns={2}>
            <FormField label="Chave da NF-e" placeholder="44 dígitos" maxLength={44} />
            <FormField label="Número da nota" placeholder="Ex.: 48291" />
          </FormSection>
        )}

        <FormSection title="Valores" subtitle="O valor líquido é recalculado a cada alteração." columns={3}>
          <CurrencyField label="Valor da baixa" value={amount} onChange={setAmount} required error={amount > 25000 ? 'O valor não pode exceder o saldo de R$ 25.000,00.' : undefined} />
          <CurrencyField label="Desconto" value={discount} onChange={setDiscount} />
          <CurrencyField label="Multa" value={penalty} onChange={setPenalty} />
          <CurrencyField label="Juros" value={interest} onChange={setInterest} />
          <CurrencyField label="Acréscimo" value={increase} onChange={setIncrease} />
          <CurrencyField label="Valor líquido" value={netValue} onChange={() => undefined} readOnly />
        </FormSection>

        <FormSection title="Rateio" subtitle="Distribua exatamente o valor líquido entre categorias e centros de custo.">
          <AllocationEditor items={allocations} targetAmount={netValue} onChange={setAllocations} />
        </FormSection>

        <FormSection title="Documento" subtitle="Anexe o comprovante em PDF, com até 2 MB.">
          <FileUpload
            label="Comprovante"
            accept="application/pdf,.pdf"
            maxSizeMb={2}
            files={files}
            onFilesAdded={(newFiles) => setFiles(newFiles.map((file) => ({ id: crypto.randomUUID(), name: file.name, size: file.size, status: 'done' })))}
            onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
          />
        </FormSection>
      </PageCard>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={submit}
        loading={saving}
        tone="default"
        title="Efetivar baixa do título?"
        message="O movimento financeiro e o rateio serão registrados. Confira os dados antes de continuar."
        confirmLabel="Efetivar Baixa"
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
