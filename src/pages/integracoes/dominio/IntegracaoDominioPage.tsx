import { useState } from 'react'
import { Eye, Pencil, Plus, RefreshCw, Wifi } from 'lucide-react'
import { AsyncSearchSelect } from '../../../components/ui/AsyncSearchSelect'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { DropdownMenu } from '../../../components/ui/DropdownMenu'
import { FeedbackBanner } from '../../../components/ui/FeedbackBanner'
import { FormSection } from '../../../components/ui/FormSection'
import { Modal } from '../../../components/ui/Modal'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageHeader } from '../../../components/ui/PageHeader'
import { SecretField } from '../../../components/ui/SecretField'
import type { SearchSelectOption } from '../../../components/ui/SearchSelect'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { ToggleSwitch } from '../../../components/ui/ToggleSwitch'
import { t } from '../../../design/tokens'

interface IntegrationRecord {
  id: string
  issuer: SearchSelectOption
  accountant: SearchSelectOption
  token: string
  enabled: boolean
  lastSync: string
  status: 'connected' | 'attention'
}

const ISSUERS: SearchSelectOption[] = [
  { id: 'issuer-1', code: '12.345.678/0001-90', label: 'Fazenda Boa Esperança Ltda.' },
  { id: 'issuer-2', code: '98.765.432/0001-10', label: 'Agropecuária Horizonte S.A.' },
]
const ACCOUNTANTS: SearchSelectOption[] = [
  { id: 'accountant-1', code: 'CRC-MT 008142', label: 'Contábil Cerrado' },
  { id: 'accountant-2', code: 'CRC-GO 015221', label: 'Domínio Rural Contabilidade' },
]

function createLoader(options: SearchSelectOption[]) {
  return async (query: string, signal: AbortSignal) => {
    await new Promise((resolve, reject) => {
      const timer = window.setTimeout(resolve, 350)
      signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Abortado', 'AbortError')) })
    })
    return options.filter((option) => `${option.code} ${option.label}`.toLowerCase().includes(query.toLowerCase()))
  }
}

const loadIssuers = createLoader(ISSUERS)
const loadAccountants = createLoader(ACCOUNTANTS)

const INITIAL: IntegrationRecord[] = [
  { id: 'integration-1', issuer: ISSUERS[0], accountant: ACCOUNTANTS[0], token: 'gb_dom_live_7m39x21', enabled: true, lastSync: 'Hoje, 08:42', status: 'connected' },
]

export default function IntegracaoDominioPage() {
  const [records, setRecords] = useState(INITIAL)
  const [editorOpen, setEditorOpen] = useState(false)
  const [showOpen, setShowOpen] = useState(false)
  const [selected, setSelected] = useState<IntegrationRecord | null>(null)
  const [issuer, setIssuer] = useState<SearchSelectOption | null>(null)
  const [accountant, setAccountant] = useState<SearchSelectOption | null>(null)
  const [token, setToken] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [testing, setTesting] = useState(false)
  const [connection, setConnection] = useState<'idle' | 'success' | 'error'>('idle')
  const { toasts, show, dismiss } = useToast()

  const openEditor = (record?: IntegrationRecord) => {
    setSelected(record ?? null)
    setIssuer(record?.issuer ?? null)
    setAccountant(record?.accountant ?? null)
    setToken(record?.token ?? '')
    setEnabled(record?.enabled ?? true)
    setConnection('idle')
    setEditorOpen(true)
  }

  const testConnection = async () => {
    setTesting(true)
    setConnection('idle')
    await new Promise((resolve) => window.setTimeout(resolve, 800))
    setTesting(false)
    setConnection(token.trim().length >= 10 && issuer && accountant ? 'success' : 'error')
  }

  const save = () => {
    if (!issuer || !accountant || connection !== 'success') return
    const next: IntegrationRecord = { id: selected?.id ?? crypto.randomUUID(), issuer, accountant, token, enabled, lastSync: 'Ainda não sincronizado', status: 'connected' }
    setRecords((current) => selected ? current.map((record) => record.id === selected.id ? next : record) : [next, ...current])
    setEditorOpen(false)
    show(selected ? 'Integração atualizada com sucesso.' : 'Integração configurada com sucesso.')
  }

  const columns: Column<IntegrationRecord>[] = [
    { key: 'issuer', label: 'Emissor', render: (record) => record.issuer.label },
    { key: 'accountant', label: 'Contador', render: (record) => record.accountant.label },
    { key: 'status', label: 'Conexão', width: 130, render: (record) => <Badge label={record.status === 'connected' ? 'Conectada' : 'Atenção'} variant={record.status === 'connected' ? 'success' : 'warning'} /> },
    { key: 'sync', label: 'Última sincronização', width: 180, render: (record) => record.lastSync },
    { key: 'active', label: 'Situação', width: 110, render: (record) => <Badge label={record.enabled ? 'Ativa' : 'Inativa'} variant={record.enabled ? 'info' : 'neutral'} /> },
    { key: 'actions', label: 'Ações', width: 72, align: 'right', sortable: false, render: (record) => <DropdownMenu items={[
      { id: 'show', label: 'Ver detalhes', icon: <Eye size={15} />, onClick: () => { setSelected(record); setShowOpen(true) } },
      { id: 'edit', label: 'Editar', icon: <Pencil size={15} />, onClick: () => openEditor(record) },
      { id: 'sync', label: 'Sincronizar agora', icon: <RefreshCw size={15} />, divider: true, onClick: () => show('Sincronização enviada para processamento.', 'info') },
    ]} /> },
  ]

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader title="Integração Domínio" description="Conecte emissores e contadores para a exportação contábil." count={records.length} actions={<Button icon={<Plus size={16} />} onClick={() => openEditor()}>Nova Integração</Button>} />
        <DataTable columns={columns} data={records} keyField="id" emptyMessage="Nenhuma integração configurada." />
      </PageCard>

      <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title={selected ? 'Editar Integração' : 'Nova Integração'} subtitle="Teste a conexão antes de salvar a configuração." size="lg" footer={<><Button variant="secondary" onClick={() => setEditorOpen(false)}>Cancelar</Button><Button disabled={connection !== 'success'} onClick={save}>Salvar Integração</Button></>}>
        <FormSection title="Identificação" columns={2}>
          <AsyncSearchSelect label="Emissor" required selectedId={issuer?.id} selectedOption={issuer} onSelect={(option) => { setIssuer(option); setConnection('idle') }} onClear={() => { setIssuer(null); setConnection('idle') }} loadOptions={loadIssuers} />
          <AsyncSearchSelect label="Contador" required selectedId={accountant?.id} selectedOption={accountant} onSelect={(option) => { setAccountant(option); setConnection('idle') }} onClear={() => { setAccountant(null); setConnection('idle') }} loadOptions={loadAccountants} />
        </FormSection>
        <FormSection title="Credencial e conexão">
          <SecretField label="Token de integração" required value={token} onChange={(value) => { setToken(value); setConnection('idle') }} hint="O token é armazenado com proteção e nunca é exibido em texto plano por padrão." />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.space[3], marginTop: t.space[4] }}>
            <span style={{ fontFamily: t.font.family.sans }}>Integração ativa</span>
            <ToggleSwitch checked={enabled} onChange={setEnabled} />
          </div>
          <div style={{ marginTop: t.space[4] }}><Button variant="secondary" icon={<Wifi size={16} />} loading={testing} disabled={!issuer || !accountant || token.length < 10} onClick={testConnection}>Testar Conexão</Button></div>
        </FormSection>
        {connection === 'success' && <FeedbackBanner variant="success" title="Conexão validada" description={`${accountant?.label} reconheceu o cliente ${issuer?.label}. Você já pode salvar.`} />}
        {connection === 'error' && <FeedbackBanner variant="error" title="Não foi possível validar a conexão" description="Confira o emissor, o contador e o token; depois tente novamente." action={{ label: 'Tentar novamente', onClick: testConnection }} />}
      </Modal>

      <Modal open={showOpen} onClose={() => setShowOpen(false)} title="Detalhes da Integração" size="lg" footer={<Button onClick={() => setShowOpen(false)}>Fechar</Button>}>
        {selected && <DetailGrid items={[
          { label: 'Emissor', value: selected.issuer.label },
          { label: 'Contador', value: selected.accountant.label },
          { label: 'Token', value: selected.token, sensitive: true },
          { label: 'Status', value: <Badge label={selected.enabled ? 'Ativa' : 'Inativa'} variant={selected.enabled ? 'success' : 'neutral'} /> },
          { label: 'Última sincronização', value: selected.lastSync },
        ]} />}
      </Modal>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
