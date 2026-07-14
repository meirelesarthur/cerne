import { useState, useMemo } from 'react'
import { PageContainer }  from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { Stepper }        from '../../../components/ui/Stepper'
import { StepFooter }     from '../../../components/ui/StepFooter'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { t }              from '../../../design/tokens'
import {
  emptyPessoa, isValidNif, EMAIL_RE, validatePix, docTypeOf,
  ROLES, ROLE_LABEL, type Pessoa, type RoleKey,
} from './pessoas.types'
import { StepDadosBasicos } from './steps/StepDadosBasicos'
import { StepEndereco }     from './steps/StepEndereco'
import { StepProprietario } from './steps/StepProprietario'
import { StepFuncionario }  from './steps/StepFuncionario'
import { StepFornecedor }   from './steps/StepFornecedor'
import { StepCliente }      from './steps/StepCliente'
import { StepUsuario }      from './steps/StepUsuario'
import { ConfirmDialog }    from '../../../components/ui/ConfirmDialog'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { focusFirstError } from '../../../hooks/focusFirstError'

// ─── Steps ──────────────────────────────────────────────────────────────────

type StepKey = 'basico' | 'endereco' | RoleKey

const STEP_LABEL: Record<StepKey, string> = {
  basico: 'Dados Básicos',
  endereco: 'Endereço',
  proprietary: ROLE_LABEL.proprietary,
  employee: ROLE_LABEL.employee,
  provider: ROLE_LABEL.provider,
  client: ROLE_LABEL.client,
  user: ROLE_LABEL.user,
}

/** Etapas dinâmicas: fixas (Dados Básicos, Endereço) + uma por papel ativo. */
function computeSteps(p: Pessoa): StepKey[] {
  return ['basico', 'endereco', ...ROLES.filter((r) => p[r.key].enabled).map((r) => r.key)]
}

// ─── Validação por etapa ───────────────────────────────────────────────────────

function validateStep(key: StepKey, form: Pessoa, isEdit: boolean): Record<string, string> {
  const e: Record<string, string> = {}

  if (key === 'basico') {
    if (!form.nif.trim()) e.nif = 'CPF/CNPJ é obrigatório.'
    else if (!isValidNif(form.nif)) e.nif = docTypeOf(form.nif) === 'unknown'
      ? 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).'
      : 'CPF/CNPJ inválido — verifique os dígitos.'
    if (!form.name.trim()) e.name = 'Campo obrigatório.'
    else if (form.name.length > 70) e.name = 'Máximo 70 caracteres.'
    if (!form.nickname.trim()) e.nickname = 'Campo obrigatório.'
    else if (form.nickname.length > 70) e.nickname = 'Máximo 70 caracteres.'
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) e.email = 'E-mail inválido.'
    if (form.user.enabled && !form.email.trim()) e.email = 'E-mail é obrigatório para conceder acesso.'
  }

  if (key === 'endereco') {
    if (!form.cityId) e.cityId = 'Selecione uma cidade.'
    if (!form.address.trim()) e.address = 'Campo obrigatório.'
    if (!form.number.trim()) e.number = 'Campo obrigatório.'
    else if (form.number.length > 60) e.number = 'Máximo 60 caracteres.'
    if (!form.district.trim()) e.district = 'Campo obrigatório.'
    else if (form.district.length > 60) e.district = 'Máximo 60 caracteres.'
  }

  if (key === 'proprietary') {
    form.proprietary.farms.forEach((fs, i) => {
      if (!fs.farmId) e[`prop_farm_${i}`] = 'Selecione a fazenda.'
      const pct = Number(fs.percentage.replace(',', '.'))
      if (fs.percentage && (isNaN(pct) || pct < 0 || pct > 100)) e[`prop_pct_${i}`] = 'Entre 0 e 100.'
    })
  }

  if (key === 'employee') {
    const pixErr = validatePix(form.employee.pixType, form.employee.pix)
    if (pixErr) e.emp_pix = pixErr
  }

  if (key === 'provider') {
    if (form.provider.type === '5' && !form.provider.commission.trim()) e.prov_commission = 'Comissão obrigatória para representante comissionado.'
    if (form.provider.type === '3' && !form.provider.hourValue.trim()) e.prov_hour = 'Valor/hora obrigatório para prestador de serviço.'
    const pixErr = validatePix(form.provider.pixType, form.provider.pix)
    if (pixErr) e.prov_pix = pixErr
  }

  if (key === 'user' && !isEdit) {
    const pwd = form.user.password
    if (!pwd) e.user_password = 'Senha é obrigatória.'
    else if (pwd.length < 8) e.user_password = 'Mínimo 8 caracteres.'
    else if (!/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/\d/.test(pwd)) e.user_password = 'Use ao menos 1 maiúscula, 1 minúscula e 1 número.'
    if (form.user.passwordConfirmation !== pwd) e.user_password_confirmation = 'As senhas não coincidem.'
  }

  return e
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialData?: Pessoa
  /** Modo somente-leitura (ação "Ver detalhes"). */
  readOnly?:    boolean
  onBack:       () => void
  onSave:       (p: Pessoa) => void
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PessoaForm({ initialData, readOnly = false, onBack, onSave }: Props) {
  const isEdit   = Boolean(initialData)
  const disabled = readOnly
  const { toasts, show, dismiss } = useToast()

  const [form, setForm]       = useState<Pessoa>(() => initialData ?? emptyPessoa())
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [currentKey, setCurrentKey] = useState<StepKey>('basico')
  const guard = useUnsavedChangesGuard(onBack)
  // Em edição/visualização, todas as etapas iniciam navegáveis.
  const [completed, setCompleted] = useState<StepKey[]>(
    () => (initialData ? computeSteps(initialData) : []),
  )

  const steps = useMemo(() => computeSteps(form), [form])
  const idx   = Math.max(0, steps.indexOf(currentKey))
  const isLast = idx === steps.length - 1

  // ── Updaters ───────────────────────────────────────────────────────────────
  const clearErrors = () => setErrors((e) => (Object.keys(e).length ? {} : e))

  const set = <K extends keyof Pessoa>(key: K, value: Pessoa[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    guard.setIsDirty(true)
    clearErrors()
  }
  const setRole = <R extends RoleKey>(role: R, patch: Partial<Pessoa[R]>) => {
    setForm((f) => ({ ...f, [role]: { ...f[role], ...patch } }))
    guard.setIsDirty(true)
    clearErrors()
  }
  const onToggleRole = (key: RoleKey, value: boolean) => {
    setRole(key, { enabled: value } as Partial<Pessoa[RoleKey]>)
    if (!value) setCompleted((c) => c.filter((k) => k !== key))
  }

  // ── Navegação ────────────────────────────────────────────────────────────────
  const goTo = (key: StepKey) => { setErrors({}); setCurrentKey(key) }

  const handleNext = () => {
    if (!readOnly) {
      const stepErrors = validateStep(currentKey, form, isEdit)
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        focusFirstError()
        show(Object.values(stepErrors)[0] ?? 'Há campos pendentes — verifique os destaques em vermelho.', 'error')
        return
      }
    }
    setCompleted((c) => (c.includes(currentKey) ? c : [...c, currentKey]))
    if (isLast) {
      if (readOnly) { onBack(); return }
      onSave(form)
      show('Pessoa salva com sucesso.', 'success', 2500)
    } else {
      goTo(steps[idx + 1])
    }
  }

  const handleBack = () => { if (idx > 0) goTo(steps[idx - 1]) }

  const handleStepClick = (id: number) => {
    const key = steps[id - 1]
    if (key && completed.includes(key)) goTo(key)
  }

  // ── Render do step ativo ─────────────────────────────────────────────────────
  const stepProps = { form, errors, set, setRole, disabled }
  const renderStep = () => {
    switch (currentKey) {
      case 'basico':      return <StepDadosBasicos {...stepProps} onToggleRole={onToggleRole} />
      case 'endereco':    return <StepEndereco {...stepProps} />
      case 'proprietary': return <StepProprietario {...stepProps} />
      case 'employee':    return <StepFuncionario {...stepProps} />
      case 'provider':    return <StepFornecedor {...stepProps} />
      case 'client':      return <StepCliente {...stepProps} />
      case 'user':        return <StepUsuario {...stepProps} isEdit={isEdit} />
      default:            return null
    }
  }

  const stepperSteps = steps.map((k, i) => ({ id: i + 1, label: STEP_LABEL[k] }))
  const completedIds = completed
    .map((k) => steps.indexOf(k) + 1)
    .filter((id) => id > 0)

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={
          <StepFooter
            currentStep={idx + 1}
            totalSteps={steps.length}
            onBack={handleBack}
            onNext={handleNext}
            nextLabel={isLast ? (readOnly ? 'Fechar' : 'Salvar Pessoa') : undefined}
          />
        }
        footerBare
      >
        <FormPageHeader
          title={readOnly ? 'Detalhes da Pessoa' : isEdit ? 'Editar Pessoa' : 'Nova Pessoa'}
          subtitle={isEdit ? `${form.name} — ${form.nickname}` : 'Preencha as etapas para cadastrar a pessoa.'}
          onBack={guard.guardedBack}
          paddingTop={t.space[4]}
        />

        <Stepper
          steps={stepperSteps}
          current={idx + 1}
          completed={completedIds}
          onStepClick={handleStepClick}
        />

        <div style={{ padding: '32px 24px 64px' }}>
          {renderStep()}
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
