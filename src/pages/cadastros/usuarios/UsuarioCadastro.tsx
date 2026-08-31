import { useState, useEffect, useRef } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard } from '../../../components/ui/PageCard'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { Button } from '../../../components/ui/Button'
import { FormField } from '../../../components/ui/FormField'
import { FormSection } from '../../../components/ui/FormSection'
import { MultiSelectField } from '../../../components/ui/MultiSelectField'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { t } from '../../../design/tokens'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { ROLE_OPTIONS, FARM_OPTIONS, BOSS_OPTIONS, emptyDraft, type UserRecord } from './usuarios.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface UsuarioCadastroProps {
  initialData?: UserRecord
  onBack:       () => void
  onSave:       (user: UserRecord) => void
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function UsuarioCadastro({ initialData, onBack, onSave }: UsuarioCadastroProps) {
  const isEdit = !!initialData

  const [draft, setDraft] = useState<UserRecord>(() => (initialData ? { ...initialData } : emptyDraft()))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const { toasts, show, dismiss } = useToast()
  const guard = useUnsavedChangesGuard(onBack)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    guard.setIsDirty(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const set = <K extends keyof UserRecord>(field: K, value: UserRecord[K]) => {
    setDraft((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next })
  }

  // ── Validação ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {}
    if (!draft.name.trim()) nextErrors.name = 'Informe o nome do usuário.'
    if (!draft.nif.trim()) nextErrors.nif = 'Informe o CPF do usuário.'
    if (!draft.email.includes('@')) nextErrors.email = 'Informe um e-mail válido.'
    if (draft.roles.length === 0) nextErrors.roles = 'Selecione ao menos um perfil.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  // ── Salvar ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (submitting) return
    if (!validate()) return
    setSubmitting(true)
    onSave({ ...draft, id: initialData?.id ?? draft.id })
    show(isEdit ? 'Usuário atualizado com sucesso.' : 'Usuário cadastrado com sucesso.')
    setSubmitting(false)
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      {/* ── Card principal com scroll interno + footer fixo ──────────────── */}
      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={guard.guardedBack} icon={<Icon name="arrow-left" size={14} />} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave} icon={<Icon name="save" size={14} />} loading={submitting} disabled={submitting}>
              {isEdit ? 'Salvar alterações' : 'Cadastrar Usuário'}
            </Button>
          </>
        }
      >

        {/* Header */}
        <FormPageHeader
          title={isEdit ? 'Editar Usuário' : 'Novo Usuário'}
          subtitle={isEdit ? `${initialData!.name} — ${initialData!.email}` : 'Preencha os dados para cadastrar um usuário'}
          onBack={guard.guardedBack}
          paddingTop={t.space[4]}
        />

        {/* Campos do formulário */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: t.space[6] }}>
          <FormSection title="Identificação" columns={2}>
            <FormField label="Nome" required value={draft.name} error={errors.name} onChange={(event) => set('name', event.target.value)} />
            <FormField label="CPF" required value={draft.nif} readOnly={isEdit} mask="cpf" error={errors.nif} onChange={(event) => set('nif', event.target.value)} />
            <FormField label="E-mail" type="email" required value={draft.email} error={errors.email} allowPasswordManager onChange={(event) => set('email', event.target.value)} />
          </FormSection>
          <FormSection title="Acesso" subtitle="Perfis e escopos concedidos ao usuário.">
            <MultiSelectField label="Perfis" required options={ROLE_OPTIONS} value={draft.roles} error={errors.roles} onChange={(roles) => set('roles', roles)} />
            <MultiSelectField label="Fazendas" options={FARM_OPTIONS} value={draft.farms} onChange={(farms) => set('farms', farms)} />
            <MultiSelectField label="Encarregados" options={BOSS_OPTIONS} value={draft.bosses} onChange={(bosses) => set('bosses', bosses)} />
          </FormSection>
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
