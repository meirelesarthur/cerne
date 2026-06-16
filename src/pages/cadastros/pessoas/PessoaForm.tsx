import { useState, useMemo, useRef } from 'react'
import { Save, Crown, Briefcase, Truck, ShoppingCart, KeyRound, Info } from 'lucide-react'
import { PageContainer }      from '../../../components/ui/PageContainer'
import { PageCard }           from '../../../components/ui/PageCard'
import { Button }             from '../../../components/ui/Button'
import { FormPageHeader }     from '../../../components/ui/FormPageHeader'
import { FormField }          from '../../../components/ui/FormField'
import { FormSelect }         from '../../../components/ui/FormSelect'
import { ToggleSwitch }       from '../../../components/ui/ToggleSwitch'
import { CollapsibleSection } from '../../../components/ui/CollapsibleSection'
import { ToggleSection }      from '../../../components/ui/ToggleSection'
import { RepeaterList }       from '../../../components/ui/RepeaterList'
import { SearchSelect }       from '../../../components/ui/SearchSelect'
import { DatePicker }         from '../../../components/ui/DatePicker'
import { Checkbox }           from '../../../components/ui/Checkbox'
import { Tooltip }            from '../../../components/ui/Tooltip'
import { t }                  from '../../../design/tokens'
import { useTheme }           from '../../../context/ThemeContext'
import { usePermission }      from '../../../auth'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import {
  emptyPessoa, isValidNif, isPJ, EMAIL_RE, validatePix, docTypeOf,
  CIDADES, FAZENDAS, CENTROS_CUSTO, FUNCOES_CBO, BANCOS, PAISES,
  PERFIS_USUARIO, ENCARREGADOS, TIPO_FORNECEDOR, TIPO_CONTA, TIPO_PIX,
  type Pessoa, type RoleKey, type Opt,
} from './pessoas.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialData?: Pessoa
  /** Modo somente-leitura (ação "Ver detalhes"). */
  readOnly?:    boolean
  onBack:       () => void
  onSave:       (p: Pessoa) => void
}

const todayIso = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})()

const onlyDigits = (v: string) => v.replace(/\D/g, '')
const SELECT_PLACEHOLDER: Opt = { value: '', label: 'Selecione...' }

// ─── Sub-componente: toggle como linha de campo booleano ───────────────────────

function ToggleRow({ checked, onChange, label, hint, disabled }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string; disabled?: boolean
}) {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.space[3], padding: `${t.space[2] + 2}px ${t.space[3]}px`, background: colors.surfaceSubtle, borderRadius: t.radius.DEFAULT, border: `1px solid ${colors.border}` }}>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.textPrimary, fontFamily: t.font.family.sans }}>
          {label}
          {hint && (
            <Tooltip label={hint}>
              <span style={{ display: 'flex' }}><Info size={12} color={colors.textMuted} /></span>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-componente: multi-seleção via checkboxes ──────────────────────────────

function MultiCheck({ label, options, selected, onToggle, disabled }: {
  label: string; options: Opt[]; selected: string[]; onToggle: (value: string) => void; disabled?: boolean
}) {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
      <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.textPrimary, fontFamily: t.font.family.sans }}>
        {label}
      </span>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: `${t.space[2]}px ${t.space[4]}px`,
        padding: `${t.space[3]}px`, border: `1px solid ${colors.border}`, borderRadius: t.radius.DEFAULT, background: colors.surfaceBg,
      }}>
        {options.map((o) => (
          <Checkbox key={o.value} label={o.label} checked={selected.includes(o.value)} onChange={() => onToggle(o.value)} disabled={disabled} />
        ))}
      </div>
    </div>
  )
}

const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }
const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: t.space[4] }
const colStack: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: t.space[4] }

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PessoaForm({ initialData, readOnly = false, onBack, onSave }: Props) {
  const { colors }  = useTheme()
  const { can }     = usePermission()
  const isEdit      = Boolean(initialData)
  const canViewSalary = can('pessoa.salary_view')
  const { toasts, show, dismiss } = useToast()

  const [form, setForm]   = useState<Pessoa>(() => initialData ?? emptyPessoa())
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [cityQuery, setCityQuery] = useState(
    () => CIDADES.find((c) => c.value === (initialData?.cityId ?? ''))?.label ?? '',
  )
  const nifRef = useRef<HTMLInputElement>(null)

  const pj = isPJ(form.nif)
  const disabled = readOnly || saving

  // ── Updaters ───────────────────────────────────────────────────────────────
  const set = <K extends keyof Pessoa>(key: K, value: Pessoa[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const setRole = <R extends RoleKey>(role: R, patch: Partial<Pessoa[R]>) =>
    setForm((f) => ({ ...f, [role]: { ...f[role], ...patch } }))

  const toggleInList = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  // ── Validação ────────────────────────────────────────────────────────────────
  const errors = useMemo(() => {
    const e: Record<string, string> = {}
    // Base
    if (!form.nif.trim()) e.nif = 'CPF/CNPJ é obrigatório.'
    else if (!isValidNif(form.nif)) e.nif = docTypeOf(form.nif) === 'unknown'
      ? 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).'
      : 'CPF/CNPJ inválido — verifique os dígitos.'
    if (!form.name.trim()) e.name = 'Campo obrigatório.'
    else if (form.name.length > 70) e.name = 'Máximo 70 caracteres.'
    if (!form.nickname.trim()) e.nickname = 'Campo obrigatório.'
    else if (form.nickname.length > 70) e.nickname = 'Máximo 70 caracteres.'
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) e.email = 'E-mail inválido.'
    if (!form.cityId) e.cityId = 'Selecione uma cidade.'
    if (!form.address.trim()) e.address = 'Campo obrigatório.'
    if (!form.number.trim()) e.number = 'Campo obrigatório.'
    else if (form.number.length > 60) e.number = 'Máximo 60 caracteres.'
    if (!form.district.trim()) e.district = 'Campo obrigatório.'
    else if (form.district.length > 60) e.district = 'Máximo 60 caracteres.'

    // Usuário ativo → e-mail obrigatório (AS-IS)
    if (form.user.enabled && !form.email.trim()) e.email = 'E-mail é obrigatório para conceder acesso.'

    // Proprietário
    if (form.proprietary.enabled) {
      form.proprietary.farms.forEach((fs, i) => {
        if (!fs.farmId) e[`prop_farm_${i}`] = 'Selecione a fazenda.'
        const pct = Number(fs.percentage.replace(',', '.'))
        if (fs.percentage && (isNaN(pct) || pct < 0 || pct > 100)) e[`prop_pct_${i}`] = 'Entre 0 e 100.'
      })
    }

    // Funcionário — PIX por tipo
    if (form.employee.enabled) {
      const pixErr = validatePix(form.employee.pixType, form.employee.pix)
      if (pixErr) e.emp_pix = pixErr
    }

    // Fornecedor — condicionais + PIX
    if (form.provider.enabled) {
      if (form.provider.type === '5' && !form.provider.commission.trim()) e.prov_commission = 'Comissão obrigatória para representante comissionado.'
      if (form.provider.type === '3' && !form.provider.hourValue.trim()) e.prov_hour = 'Valor/hora obrigatório para prestador de serviço.'
      const pixErr = validatePix(form.provider.pixType, form.provider.pix)
      if (pixErr) e.prov_pix = pixErr
    }

    // Usuário — senha apenas na criação
    if (form.user.enabled && !isEdit) {
      const pwd = form.user.password
      if (!pwd) e.user_password = 'Senha é obrigatória.'
      else if (pwd.length < 8) e.user_password = 'Mínimo 8 caracteres.'
      else if (!/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/\d/.test(pwd)) e.user_password = 'Use ao menos 1 maiúscula, 1 minúscula e 1 número.'
      if (form.user.passwordConfirmation !== pwd) e.user_password_confirmation = 'As senhas não coincidem.'
    }

    return e
  }, [form, isEdit])

  const err = (key: string) => (submitted && errors[key]) || undefined

  const handleSubmit = () => {
    setSubmitted(true)
    if (Object.keys(errors).length > 0) {
      show('Há campos pendentes — verifique os destaques em vermelho.', 'error')
      if (errors.nif) nifRef.current?.focus()
      return
    }
    setSaving(true)
    setTimeout(() => { onSave(form); setSaving(false) }, t.delay.loadingShow)
  }

  const nameLabel     = pj ? 'Nome Fantasia' : 'Nome Completo'
  const nicknameLabel = pj ? 'Razão Social' : 'Apelido'

  const cityOptions = CIDADES.map((c) => ({ id: c.value, label: c.label }))

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={onBack} disabled={saving}>
              {readOnly ? 'Voltar' : 'Cancelar'}
            </Button>
            {!readOnly && (
              <Button variant="primary" icon={<Save size={13} />} onClick={handleSubmit} loading={saving}>
                Salvar Pessoa
              </Button>
            )}
          </>
        }
      >
        <FormPageHeader
          title={readOnly ? 'Detalhes da Pessoa' : isEdit ? 'Editar Pessoa' : 'Nova Pessoa'}
          subtitle={isEdit ? `${form.name} — ${form.nickname}` : 'Preencha os dados básicos e ative os papéis aplicáveis.'}
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        <div style={{ maxWidth: 880 }}>

          {/* ── Dados Básicos ───────────────────────────────────────────── */}
          <CollapsibleSection title="Dados Básicos" fieldCount={10} defaultOpen>
            <div style={colStack}>
              <div style={grid2}>
                <FormField
                  ref={nifRef as React.Ref<HTMLInputElement>}
                  label="CPF / CNPJ" required mask="cpfCnpj"
                  placeholder="000.000.000-00"
                  value={form.nif}
                  spellCheck={false}
                  onChange={(e) => set('nif', e.target.value)}
                  error={err('nif')}
                  disabled={disabled}
                  autoComplete="off"
                />
                <FormField
                  label="E-mail"
                  type="email" inputMode="email"
                  required={form.user.enabled}
                  placeholder="nome@empresa.com.br"
                  value={form.email}
                  spellCheck={false}
                  onChange={(e) => set('email', e.target.value)}
                  error={err('email')}
                  disabled={disabled}
                  autoComplete="email"
                />
              </div>
              <div style={grid2}>
                <FormField
                  label={nameLabel} required
                  placeholder={pj ? 'Ex: AgroInsumos do Cerrado' : 'Ex: João da Silva'}
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  error={err('name')}
                  hint={`${form.name.length}/70`}
                  disabled={disabled}
                  maxLength={70}
                />
                <FormField
                  label={nicknameLabel} required
                  placeholder={pj ? 'Ex: AgroInsumos do Cerrado LTDA' : 'Ex: João'}
                  value={form.nickname}
                  onChange={(e) => set('nickname', e.target.value)}
                  error={err('nickname')}
                  hint={`${form.nickname.length}/70`}
                  disabled={disabled}
                  maxLength={70}
                />
              </div>
              <div style={grid2}>
                <FormField
                  label="Telefone" mask="phone" type="tel"
                  placeholder="(00) 00000-0000"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  disabled={disabled}
                  autoComplete="tel"
                />
                <SearchSelect
                  label="Cidade" required
                  placeholder="Busque por nome ou UF…"
                  query={cityQuery}
                  onQueryChange={setCityQuery}
                  options={cityOptions}
                  selectedId={form.cityId || null}
                  onSelect={(opt) => { set('cityId', opt.id); setCityQuery(opt.label) }}
                  onClear={() => { set('cityId', ''); setCityQuery('') }}
                  error={err('cityId')}
                />
              </div>
              <div style={grid3}>
                <FormField
                  label="CEP" mask="cep"
                  placeholder="00000-000"
                  value={form.zipCode}
                  onChange={(e) => set('zipCode', e.target.value)}
                  disabled={disabled}
                  autoComplete="postal-code"
                />
                <FormField
                  label="Endereço" required
                  placeholder="Rua, avenida, rodovia…"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  error={err('address')}
                  disabled={disabled}
                  style={{ gridColumn: 'span 2' } as React.CSSProperties}
                />
              </div>
              <div style={grid2}>
                <FormField
                  label="Número" required
                  placeholder="Ex: 1200 ou S/N"
                  value={form.number}
                  onChange={(e) => set('number', e.target.value)}
                  error={err('number')}
                  disabled={disabled}
                  maxLength={60}
                />
                <FormField
                  label="Bairro" required
                  placeholder="Ex: Centro"
                  value={form.district}
                  onChange={(e) => set('district', e.target.value)}
                  error={err('district')}
                  disabled={disabled}
                  maxLength={60}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* ── Papel: Proprietário ─────────────────────────────────────── */}
          <ToggleSection
            title="Proprietário" icon={<Crown size={16} />}
            description="Dono de fazenda — participação por propriedade e inscrições estaduais."
            active={form.proprietary.enabled}
            onToggle={(v) => setRole('proprietary', { enabled: v })}
            disabled={disabled}
            inactiveHint="Ative para vincular fazendas e inscrições estaduais."
          >
            <div style={colStack}>
              <div>
                <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.textPrimary, fontFamily: t.font.family.sans }}>Inscrições Estaduais</span>
                <div style={{ marginTop: t.space[2] }}>
                  <RepeaterList
                    items={form.proprietary.inscricoes}
                    disabled={disabled}
                    addLabel="Adicionar inscrição"
                    emptyText="Nenhuma inscrição estadual cadastrada."
                    removeLabel="Remover inscrição"
                    onAdd={() => setRole('proprietary', { inscricoes: [...form.proprietary.inscricoes, ''] })}
                    onRemove={(i) => setRole('proprietary', { inscricoes: form.proprietary.inscricoes.filter((_, idx) => idx !== i) })}
                    renderRow={(value, i) => (
                      <FormField
                        label={`Inscrição ${i + 1}`} inputMode="numeric"
                        placeholder="Somente números"
                        value={value}
                        onChange={(e) => setRole('proprietary', { inscricoes: form.proprietary.inscricoes.map((v, idx) => idx === i ? onlyDigits(e.target.value) : v) })}
                        disabled={disabled}
                      />
                    )}
                  />
                </div>
              </div>
              <div>
                <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.textPrimary, fontFamily: t.font.family.sans }}>Fazendas e Participação</span>
                <div style={{ marginTop: t.space[2] }}>
                  <RepeaterList
                    items={form.proprietary.farms}
                    disabled={disabled}
                    align="start"
                    addLabel="Adicionar fazenda"
                    emptyText="Nenhuma fazenda vinculada."
                    removeLabel="Remover fazenda"
                    onAdd={() => setRole('proprietary', { farms: [...form.proprietary.farms, { farmId: '', percentage: '' }] })}
                    onRemove={(i) => setRole('proprietary', { farms: form.proprietary.farms.filter((_, idx) => idx !== i) })}
                    renderRow={(fs, i) => (
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: t.space[3] }}>
                        <FormSelect
                          label="Fazenda"
                          options={[SELECT_PLACEHOLDER, ...FAZENDAS]}
                          value={fs.farmId}
                          onChange={(e) => setRole('proprietary', { farms: form.proprietary.farms.map((x, idx) => idx === i ? { ...x, farmId: e.target.value } : x) })}
                          error={err(`prop_farm_${i}`)}
                          disabled={disabled}
                        />
                        <FormField
                          label="Participação (%)" inputMode="decimal"
                          placeholder="0–100"
                          value={fs.percentage}
                          onChange={(e) => setRole('proprietary', { farms: form.proprietary.farms.map((x, idx) => idx === i ? { ...x, percentage: e.target.value } : x) })}
                          error={err(`prop_pct_${i}`)}
                          disabled={disabled}
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </ToggleSection>

          {/* ── Papel: Funcionário ──────────────────────────────────────── */}
          <ToggleSection
            title="Funcionário" icon={<Briefcase size={16} />}
            description="Colaborador — cargo, função, dados bancários e centro de custo."
            active={form.employee.enabled}
            onToggle={(v) => setRole('employee', { enabled: v })}
            disabled={disabled}
            inactiveHint="Ative para registrar cargo, salário e dados bancários."
          >
            <div style={colStack}>
              <div style={grid2}>
                <FormField label="Cargo" placeholder="Ex: Operador de máquinas" value={form.employee.office} onChange={(e) => setRole('employee', { office: e.target.value })} disabled={disabled} />
                <FormSelect label="Função (CBO)" options={[SELECT_PLACEHOLDER, ...FUNCOES_CBO]} value={form.employee.functionId} onChange={(e) => setRole('employee', { functionId: e.target.value })} disabled={disabled} />
              </div>
              <div style={grid3}>
                <FormSelect label="Centro de Custo" options={[SELECT_PLACEHOLDER, ...CENTROS_CUSTO]} value={form.employee.centerId} onChange={(e) => setRole('employee', { centerId: e.target.value })} disabled={disabled} />
                <FormField label="Valor por Hora" mask="currency" inputMode="numeric" placeholder="R$ 0,00" value={form.employee.hourValue} onChange={(e) => setRole('employee', { hourValue: e.target.value })} disabled={disabled} />
                <DatePicker label="Data de Nascimento" value={form.employee.birthday} max={todayIso} onChange={(iso) => setRole('employee', { birthday: iso })} disabled={disabled} />
              </div>

              {canViewSalary ? (
                <div style={grid2}>
                  <FormField label="Salário Base" mask="currency" inputMode="numeric" hint="Dado sensível — visível apenas com permissão." placeholder="R$ 0,00" value={form.employee.baseSalary} onChange={(e) => setRole('employee', { baseSalary: e.target.value })} disabled={disabled} />
                  <FormField label="Salário Meta" mask="currency" inputMode="numeric" placeholder="R$ 0,00" value={form.employee.goalSalary} onChange={(e) => setRole('employee', { goalSalary: e.target.value })} disabled={disabled} />
                </div>
              ) : (
                <div style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans, padding: `${t.space[2]}px ${t.space[3]}px`, background: colors.surfaceSubtle, borderRadius: t.radius.DEFAULT }}>
                  Dados salariais ocultos — requer permissão <code>pessoa.salary_view</code>.
                </div>
              )}

              <BankFields
                prefix="emp"
                bankId={form.employee.bankId} accountType={form.employee.accountType}
                agency={form.employee.agency} account={form.employee.account}
                pixType={form.employee.pixType} pix={form.employee.pix} pixError={err('emp_pix')}
                onChange={(patch) => setRole('employee', patch)}
                disabled={disabled}
              />
            </div>
          </ToggleSection>

          {/* ── Papel: Fornecedor ───────────────────────────────────────── */}
          <ToggleSection
            title="Fornecedor" icon={<Truck size={16} />}
            description="Vende insumos — filiais, vendedores e dados bancários."
            active={form.provider.enabled}
            onToggle={(v) => setRole('provider', { enabled: v })}
            disabled={disabled}
            inactiveHint="Ative para registrar tipo, filiais e vendedores."
          >
            <div style={colStack}>
              <div style={grid3}>
                <FormSelect label="Tipo de Fornecedor" options={[SELECT_PLACEHOLDER, ...TIPO_FORNECEDOR]} value={form.provider.type} onChange={(e) => setRole('provider', { type: e.target.value })} disabled={disabled} />
                {form.provider.type === '5' && (
                  <FormField label="Comissão (%)" required inputMode="decimal" placeholder="0–100" value={form.provider.commission} onChange={(e) => setRole('provider', { commission: e.target.value })} error={err('prov_commission')} disabled={disabled} />
                )}
                {form.provider.type === '3' && (
                  <FormField label="Valor por Hora" required mask="currency" inputMode="numeric" placeholder="R$ 0,00" value={form.provider.hourValue} onChange={(e) => setRole('provider', { hourValue: e.target.value })} error={err('prov_hour')} disabled={disabled} />
                )}
              </div>
              <div style={grid2}>
                <FormField label="Inscrição Estadual" value={form.provider.stateRegistration} onChange={(e) => setRole('provider', { stateRegistration: e.target.value })} disabled={disabled} />
                <FormField label="Inscrição Municipal" value={form.provider.cityRegistration} onChange={(e) => setRole('provider', { cityRegistration: e.target.value })} disabled={disabled} />
              </div>
              <div style={grid2}>
                <FormField label="Contato" placeholder="Nome do responsável" value={form.provider.contact} onChange={(e) => setRole('provider', { contact: e.target.value })} disabled={disabled} />
                <FormField label="Telefone do Contato" mask="phone" type="tel" placeholder="(00) 00000-0000" value={form.provider.contactPhone} onChange={(e) => setRole('provider', { contactPhone: e.target.value })} disabled={disabled} />
              </div>

              <BankFields
                prefix="prov"
                bankId={form.provider.bankId} accountType={form.provider.accountType}
                agency={form.provider.agency} account={form.provider.account}
                pixType={form.provider.pixType} pix={form.provider.pix} pixError={err('prov_pix')}
                onChange={(patch) => setRole('provider', patch)}
                disabled={disabled}
              />

              {/* Filiais */}
              <div>
                <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.textPrimary, fontFamily: t.font.family.sans }}>Filiais</span>
                <div style={{ marginTop: t.space[2] }}>
                  <RepeaterList
                    items={form.provider.branches}
                    disabled={disabled}
                    align="start"
                    addLabel="Adicionar filial"
                    emptyText="Nenhuma filial cadastrada."
                    removeLabel="Remover filial"
                    onAdd={() => setRole('provider', { branches: [...form.provider.branches, { nif: '', stateRegistration: '', zipCode: '', address: '', cityId: '' }] })}
                    onRemove={(i) => setRole('provider', { branches: form.provider.branches.filter((_, idx) => idx !== i) })}
                    renderRow={(b, i) => (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3], padding: t.space[3], border: `1px solid ${colors.border}`, borderRadius: t.radius.DEFAULT, background: colors.surfaceSubtle }}>
                        <div style={grid2}>
                          <FormField label="CNPJ da Filial" mask="cnpj" inputMode="numeric" value={b.nif} onChange={(e) => setRole('provider', { branches: form.provider.branches.map((x, idx) => idx === i ? { ...x, nif: e.target.value } : x) })} disabled={disabled} />
                          <FormField label="Inscrição Estadual" value={b.stateRegistration} onChange={(e) => setRole('provider', { branches: form.provider.branches.map((x, idx) => idx === i ? { ...x, stateRegistration: e.target.value } : x) })} disabled={disabled} />
                        </div>
                        <div style={grid3}>
                          <FormField label="CEP" mask="cep" value={b.zipCode} onChange={(e) => setRole('provider', { branches: form.provider.branches.map((x, idx) => idx === i ? { ...x, zipCode: e.target.value } : x) })} disabled={disabled} />
                          <FormField label="Endereço" value={b.address} onChange={(e) => setRole('provider', { branches: form.provider.branches.map((x, idx) => idx === i ? { ...x, address: e.target.value } : x) })} disabled={disabled} style={{ gridColumn: 'span 2' } as React.CSSProperties} />
                        </div>
                        <FormSelect label="Cidade" options={[SELECT_PLACEHOLDER, ...CIDADES]} value={b.cityId} onChange={(e) => setRole('provider', { branches: form.provider.branches.map((x, idx) => idx === i ? { ...x, cityId: e.target.value } : x) })} disabled={disabled} />
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Vendedores */}
              <div>
                <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.textPrimary, fontFamily: t.font.family.sans }}>Vendedores</span>
                <div style={{ marginTop: t.space[2] }}>
                  <RepeaterList
                    items={form.provider.sellers}
                    disabled={disabled}
                    align="start"
                    addLabel="Adicionar vendedor"
                    emptyText="Nenhum vendedor cadastrado."
                    removeLabel="Remover vendedor"
                    onAdd={() => setRole('provider', { sellers: [...form.provider.sellers, { name: '', email: '', phone: '' }] })}
                    onRemove={(i) => setRole('provider', { sellers: form.provider.sellers.filter((_, idx) => idx !== i) })}
                    renderRow={(s, i) => (
                      <div style={grid3}>
                        <FormField label="Nome" value={s.name} onChange={(e) => setRole('provider', { sellers: form.provider.sellers.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x) })} disabled={disabled} />
                        <FormField label="E-mail" type="email" spellCheck={false} value={s.email} onChange={(e) => setRole('provider', { sellers: form.provider.sellers.map((x, idx) => idx === i ? { ...x, email: e.target.value } : x) })} disabled={disabled} />
                        <FormField label="Telefone" mask="phone" type="tel" value={s.phone} onChange={(e) => setRole('provider', { sellers: form.provider.sellers.map((x, idx) => idx === i ? { ...x, phone: e.target.value } : x) })} disabled={disabled} />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </ToggleSection>

          {/* ── Papel: Cliente ──────────────────────────────────────────── */}
          <ToggleSection
            title="Cliente" icon={<ShoppingCart size={16} />}
            description="Comprador — inscrições estaduais, contribuinte e dados fiscais."
            active={form.client.enabled}
            onToggle={(v) => setRole('client', { enabled: v })}
            disabled={disabled}
            inactiveHint="Ative para registrar dados fiscais e de contato comercial."
          >
            <div style={colStack}>
              <div style={grid3}>
                <FormField label="Celular" mask="phone" type="tel" value={form.client.cellphone} onChange={(e) => setRole('client', { cellphone: e.target.value })} disabled={disabled} />
                <FormField label="Contato" value={form.client.contact} onChange={(e) => setRole('client', { contact: e.target.value })} disabled={disabled} />
                <FormField label="Telefone do Contato" mask="phone" type="tel" value={form.client.contactPhone} onChange={(e) => setRole('client', { contactPhone: e.target.value })} disabled={disabled} />
              </div>
              <div style={grid2}>
                <FormField label="Inscrição Municipal" maxLength={20} value={form.client.cityRegistration} onChange={(e) => setRole('client', { cityRegistration: e.target.value })} disabled={disabled} />
                <FormField label="Nome da Fazenda" maxLength={100} value={form.client.farmName} onChange={(e) => setRole('client', { farmName: e.target.value })} disabled={disabled} />
              </div>
              <div style={grid2}>
                <ToggleRow label="Consumidor Final" hint="Impacta a tributação na emissão de NF-e." checked={form.client.finalConsumer} onChange={(v) => setRole('client', { finalConsumer: v })} disabled={disabled} />
                <ToggleRow label="Contribuinte" hint="Define se o cliente é contribuinte de ICMS (impacto fiscal)." checked={form.client.taxpayer} onChange={(v) => setRole('client', { taxpayer: v })} disabled={disabled} />
              </div>
              <div style={grid2}>
                <FormSelect label="País" options={PAISES} value={form.client.countryId} onChange={(e) => setRole('client', { countryId: e.target.value })} disabled={disabled} />
                {form.client.countryId !== 'BR' && (
                  <FormField label="ID no Exterior" value={form.client.idAbroad} onChange={(e) => setRole('client', { idAbroad: e.target.value })} disabled={disabled} />
                )}
              </div>
              <div>
                <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.textPrimary, fontFamily: t.font.family.sans }}>Inscrições Estaduais</span>
                <div style={{ marginTop: t.space[2] }}>
                  <RepeaterList
                    items={form.client.stateRegistrations}
                    disabled={disabled}
                    addLabel="Adicionar inscrição"
                    emptyText="Nenhuma inscrição estadual cadastrada."
                    removeLabel="Remover inscrição"
                    onAdd={() => setRole('client', { stateRegistrations: [...form.client.stateRegistrations, ''] })}
                    onRemove={(i) => setRole('client', { stateRegistrations: form.client.stateRegistrations.filter((_, idx) => idx !== i) })}
                    renderRow={(value, i) => (
                      <FormField
                        label={`Inscrição ${i + 1}`}
                        value={value}
                        onChange={(e) => setRole('client', { stateRegistrations: form.client.stateRegistrations.map((v, idx) => idx === i ? e.target.value : v) })}
                        disabled={disabled}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </ToggleSection>

          {/* ── Papel: Usuário ──────────────────────────────────────────── */}
          <ToggleSection
            title="Usuário" icon={<KeyRound size={16} />}
            description="Acesso ao sistema — perfis, fazendas e encarregados."
            active={form.user.enabled}
            onToggle={(v) => setRole('user', { enabled: v })}
            disabled={disabled}
            inactiveHint="Ative para conceder acesso ao sistema."
          >
            <div style={colStack}>
              {!isEdit && (
                <div style={grid2}>
                  <FormField
                    label="Senha" required type="password" autoComplete="new-password"
                    hint="Mínimo 8 caracteres, com maiúscula, minúscula e número."
                    value={form.user.password}
                    onChange={(e) => setRole('user', { password: e.target.value })}
                    error={err('user_password')}
                    disabled={disabled}
                  />
                  <FormField
                    label="Confirmação de Senha" required type="password" autoComplete="new-password"
                    value={form.user.passwordConfirmation}
                    onChange={(e) => setRole('user', { passwordConfirmation: e.target.value })}
                    error={err('user_password_confirmation')}
                    disabled={disabled}
                  />
                </div>
              )}
              {isEdit && (
                <div style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans, padding: `${t.space[2]}px ${t.space[3]}px`, background: colors.surfaceSubtle, borderRadius: t.radius.DEFAULT }}>
                  A senha não é exibida na edição. Use "Redefinir senha" para enviar um novo acesso.
                </div>
              )}
              <ToggleRow label="Conferente de Compras" hint="Perfil especial com permissões de conferência de compras." checked={form.user.purchasingAssistant} onChange={(v) => setRole('user', { purchasingAssistant: v })} disabled={disabled} />
              <MultiCheck label="Perfis" options={PERFIS_USUARIO} selected={form.user.roleIds} onToggle={(v) => setRole('user', { roleIds: toggleInList(form.user.roleIds, v) })} disabled={disabled} />
              <MultiCheck label="Fazendas" options={FAZENDAS} selected={form.user.farmIds} onToggle={(v) => setRole('user', { farmIds: toggleInList(form.user.farmIds, v) })} disabled={disabled} />
              <MultiCheck label="Encarregados" options={ENCARREGADOS} selected={form.user.bossIds} onToggle={(v) => setRole('user', { bossIds: toggleInList(form.user.bossIds, v) })} disabled={disabled} />
            </div>
          </ToggleSection>

        </div>
      </PageCard>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}

// ─── Sub-componente: bloco de dados bancários (Funcionário / Fornecedor) ───────

function BankFields({ prefix, bankId, accountType, agency, account, pixType, pix, pixError, onChange, disabled }: {
  prefix:      string
  bankId:      string
  accountType: string
  agency:      string
  account:     string
  pixType:     string
  pix:         string
  pixError?:   string
  onChange:    (patch: Record<string, string>) => void
  disabled?:   boolean
}) {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
      <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.bold, color: colors.textMuted, fontFamily: t.font.family.sans, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Dados Bancários
      </span>
      <div style={grid2}>
        <FormSelect label="Banco" options={[SELECT_PLACEHOLDER, ...BANCOS]} value={bankId} onChange={(e) => onChange({ bankId: e.target.value })} disabled={disabled} />
        <FormSelect label="Tipo de Conta" options={[SELECT_PLACEHOLDER, ...TIPO_CONTA]} value={accountType} onChange={(e) => onChange({ accountType: e.target.value })} disabled={disabled} />
      </div>
      <div style={grid2}>
        <FormField label="Agência" inputMode="numeric" value={agency} onChange={(e) => onChange({ agency: e.target.value })} disabled={disabled} />
        <FormField label="Conta" inputMode="numeric" value={account} onChange={(e) => onChange({ account: e.target.value })} disabled={disabled} />
      </div>
      <div style={grid2}>
        <FormSelect label="Tipo de Chave PIX" options={[SELECT_PLACEHOLDER, ...TIPO_PIX]} value={pixType} onChange={(e) => onChange({ pixType: e.target.value })} disabled={disabled} />
        <FormField label="Chave PIX" value={pix} onChange={(e) => onChange({ pix: e.target.value })} error={pixError} disabled={disabled} spellCheck={false} key={`${prefix}-pix`} />
      </div>
    </div>
  )
}
