import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Save, Wifi } from 'lucide-react'
import { AsyncSearchSelect } from '../../../components/ui/AsyncSearchSelect'
import { Button } from '../../../components/ui/Button'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { FeedbackBanner } from '../../../components/ui/FeedbackBanner'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormSection } from '../../../components/ui/FormSection'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { SecretField } from '../../../components/ui/SecretField'
import type { SearchSelectOption } from '../../../components/ui/SearchSelect'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { ToggleSwitch } from '../../../components/ui/ToggleSwitch'
import { t } from '../../../design/tokens'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { loadAccountants, loadIssuers, type IntegrationRecord } from './IntegracaoDominioPage'

interface IntegracaoDominioCadastroProps {
  initialData?: IntegrationRecord
  onBack: () => void
  onSave: (record: IntegrationRecord) => void
}

export default function IntegracaoDominioCadastro({
  initialData, onBack, onSave,
}: IntegracaoDominioCadastroProps) {
  const isEdit = !!initialData

  const [issuer, setIssuer] = useState<SearchSelectOption | null>(initialData?.issuer ?? null)
  const [accountant, setAccountant] = useState<SearchSelectOption | null>(initialData?.accountant ?? null)
  const [token, setToken] = useState(initialData?.token ?? '')
  const [enabled, setEnabled] = useState(initialData?.enabled ?? true)
  const [testing, setTesting] = useState(false)
  const [connection, setConnection] = useState<'idle' | 'success' | 'error'>('idle')

  const { toasts, show, dismiss } = useToast()
  const guard = useUnsavedChangesGuard(onBack)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    guard.setIsDirty(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issuer, accountant, token, enabled])

  const testConnection = async () => {
    setTesting(true)
    setConnection('idle')
    await new Promise((resolve) => window.setTimeout(resolve, 800))
    setTesting(false)
    setConnection(token.trim().length >= 10 && issuer && accountant ? 'success' : 'error')
  }

  const handleSave = () => {
    if (!issuer || !accountant || connection !== 'success') return
    const record: IntegrationRecord = {
      id: initialData?.id ?? crypto.randomUUID(),
      issuer,
      accountant,
      token,
      enabled,
      lastSync: initialData?.lastSync ?? 'Ainda não sincronizado',
      status: initialData?.status ?? 'connected',
    }
    onSave(record)
    show(isEdit ? 'Integração atualizada com sucesso.' : 'Integração configurada com sucesso.')
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={guard.guardedBack} icon={<ArrowLeft size={14} />}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave} icon={<Save size={14} />} disabled={connection !== 'success'}>
              {isEdit ? 'Salvar alterações' : 'Salvar Integração'}
            </Button>
          </>
        }
      >
        <FormPageHeader
          title={isEdit ? 'Editar Integração' : 'Nova Integração'}
          subtitle="Teste a conexão antes de salvar a configuração."
          onBack={guard.guardedBack}
          paddingTop={t.space[4]}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: t.space[6] }}>
          <FormSection title="Identificação" columns={2}>
            <AsyncSearchSelect
              label="Emissor"
              required
              selectedId={issuer?.id}
              selectedOption={issuer}
              onSelect={(option) => { setIssuer(option); setConnection('idle') }}
              onClear={() => { setIssuer(null); setConnection('idle') }}
              loadOptions={loadIssuers}
            />
            <AsyncSearchSelect
              label="Contador"
              required
              selectedId={accountant?.id}
              selectedOption={accountant}
              onSelect={(option) => { setAccountant(option); setConnection('idle') }}
              onClear={() => { setAccountant(null); setConnection('idle') }}
              loadOptions={loadAccountants}
            />
          </FormSection>

          <FormSection title="Credencial e conexão">
            <SecretField
              label="Token de integração"
              required
              value={token}
              onChange={(value) => { setToken(value); setConnection('idle') }}
              hint="O token é armazenado com proteção e nunca é exibido em texto plano por padrão."
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.space[3], marginTop: t.space[4] }}>
              <span style={{ fontFamily: t.font.family.sans }}>Integração ativa</span>
              <ToggleSwitch checked={enabled} onChange={setEnabled} />
            </div>
            <div style={{ marginTop: t.space[4] }}>
              <Button variant="secondary" icon={<Wifi size={16} />} loading={testing} disabled={!issuer || !accountant || token.length < 10} onClick={testConnection}>
                Testar Conexão
              </Button>
            </div>
          </FormSection>

          {connection === 'success' && (
            <FeedbackBanner
              variant="success"
              title="Conexão validada"
              description={`${accountant?.label} reconheceu o cliente ${issuer?.label}. Você já pode salvar.`}
            />
          )}
          {connection === 'error' && (
            <FeedbackBanner
              variant="error"
              title="Não foi possível validar a conexão"
              description="Confira o emissor, o contador e o token; depois tente novamente."
              action={{ label: 'Tentar novamente', onClick: testConnection }}
            />
          )}
        </div>
      </PageCard>

      <ConfirmDialog
        open={guard.showExitModal}
        title="Alterações não salvas"
        message="Você tem alterações não salvas. Deseja sair sem salvar?"
        tone="destructive"
        confirmLabel="Sair sem salvar"
        cancelLabel="Ficar"
        onConfirm={guard.confirmExit}
        onCancel={guard.cancelExit}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
