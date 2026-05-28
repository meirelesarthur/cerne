import React, { useState, useCallback } from 'react'
import { ArrowLeft, ArrowRight, Save, Calendar } from 'lucide-react'
import { PageContainer } from '../../../components/ui/PageContainer'
import { Button }        from '../../../components/ui/Button'
import { FormField }     from '../../../components/ui/FormField'
import { FormSelect }    from '../../../components/ui/FormSelect'
import { Stepper }       from '../../../components/ui/Stepper'
import { t }             from '../../../design/tokens'
import { useTheme }      from '../../../context/ThemeContext'
import { WeekCanvas }    from './WeekCanvas'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import {
  generateWeeks, fmtYMDtoDMY, MES_OPTS,
  type Safra, type Week, type Mes,
} from './safras.types'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface FormData {
  desc: string
  ativo: 'sim' | 'nao'
  reb: 'individual' | 'coletivo' | 'nenhum'
  ini: string
  fim: string
  evo: 'habilitado' | 'desabilitado'
  s1: Mes
  s2: Mes
}

const emptyForm: FormData = {
  desc: '',
  ativo: 'sim',
  reb: 'individual',
  ini: '',
  fim: '',
  evo: 'habilitado',
  s1: 'jan',
  s2: 'jul',
}

// ─── Steps ───────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Dados Gerais' },
  { id: 2, label: 'Semanas' },
  { id: 3, label: 'Concluído' },
]

// ─── Opções de select ─────────────────────────────────────────────────────────

const STATUS_OPTS    = [{ value: 'sim', label: 'Ativa' }, { value: 'nao', label: 'Inativa' }]
const REBANHO_OPTS   = [{ value: 'individual', label: 'Individual' }, { value: 'coletivo', label: 'Coletivo' }, { value: 'nenhum', label: 'Nenhum' }]
const EVOLUCAO_OPTS  = [{ value: 'habilitado', label: 'Habilitado' }, { value: 'desabilitado', label: 'Desabilitado' }]

// ─── Props ───────────────────────────────────────────────────────────────────

interface SafraCadastroProps {
  initialData?: Safra
  onBack: () => void
  onSave: (safra: Safra) => void
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SafraCadastro({ initialData, onBack, onSave }: SafraCadastroProps) {
  const { colors } = useTheme()
  const { toasts, show, dismiss } = useToast()

  const isEdit = !!initialData

  const [step, setStep] = useState(1)
  const [completed, setCompleted] = useState<number[]>([])

  const [form, setForm] = useState<FormData>(() =>
    initialData
      ? {
          desc:  initialData.desc,
          ativo: initialData.ativo,
          reb:   initialData.reb,
          ini:   initialData.ini,
          fim:   initialData.fim,
          evo:   initialData.evo,
          s1:    initialData.s1,
          s2:    initialData.s2,
        }
      : emptyForm
  )

  const [weeks, setWeeks] = useState<Week[]>(initialData?.weeks ?? [])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  // ── Validação do step 1 ───────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.desc.trim()) errs.desc = 'Descrição é obrigatória.'
    if (!form.ini) errs.ini = 'Data de início é obrigatória.'
    if (!form.fim) errs.fim = 'Data de fim é obrigatória.'
    if (form.ini && form.fim && form.fim <= form.ini) errs.fim = 'A data de fim deve ser posterior à de início.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Avançar step 1 → 2 ───────────────────────────────────────────────────
  const handleNextStep = () => {
    if (!validateStep1()) return
    // Gerar ou regentar semanas
    const datesChanged =
      !initialData ||
      initialData.ini !== form.ini ||
      initialData.fim !== form.fim

    const newWeeks = datesChanged
      ? generateWeeks(form.ini, form.fim)
      : generateWeeks(form.ini, form.fim, initialData?.weeks)

    setWeeks(newWeeks)
    setCompleted(prev => prev.includes(1) ? prev : [...prev, 1])
    setStep(2)
  }

  // ── Voltar step 2 → 1 ─────────────────────────────────────────────────────
  const handleBack = () => {
    if (step === 2) { setStep(1); return }
    onBack()
  }

  // ── Salvar ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    const safra: Safra = {
      id:   initialData?.id ?? 0,
      desc: form.desc.trim(),
      ini:  form.ini,
      fim:  form.fim,
      ativo: form.ativo,
      reb:   form.reb,
      evo:   form.evo,
      s1:    form.s1,
      s2:    form.s2,
      weeks,
    }
    show(isEdit ? 'Safra atualizada com sucesso!' : 'Safra cadastrada com sucesso!')
    setTimeout(() => onSave(safra), 800)
  }

  const handleWeeksChange = useCallback((w: Week[]) => setWeeks(w), [])

  // ── Header dinâmico ───────────────────────────────────────────────────────
  const pageTitle = isEdit ? `Editar — ${initialData!.desc}` : 'Nova Safra'
  const pageDesc  = isEdit ? 'Atualize os dados da safra' : 'Preencha os dados da safra'

  return (
    <PageContainer>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handleBack}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, display: 'flex', alignItems: 'center', padding: 0, transition: 'color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = colors.textPrimary }}
              onMouseLeave={e => { e.currentTarget.style.color = colors.textMuted }}
              aria-label="Voltar"
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: colors.brandBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} color={colors.brand} />
              </div>
              <div>
                <h1 style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.textPrimary, margin: 0, fontFamily: t.font.family.sans, letterSpacing: '-0.3px' }}>
                  {pageTitle}
                </h1>
                <p style={{ fontSize: t.font.size.sm, color: colors.textMuted, margin: 0, fontFamily: t.font.family.sans }}>
                  {pageDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Card principal ─────────────────────────────────────────────────── */}
      <div style={{ background: colors.surfaceBg, borderRadius: t.radius['2xl'], overflow: 'hidden', transition: 'background 0.2s' }}>

        {/* Stepper */}
        <div style={{ padding: '24px 24px 0' }}>
          <Stepper steps={STEPS} current={step} completed={completed} onStepClick={() => {}} />
        </div>

        {/* Conteúdo do step */}
        <div style={{ padding: '32px 24px 40px' }}>
          {step === 1 ? (
            <Step1
              form={form}
              errors={errors}
              onChange={set}
            />
          ) : (
            <Step2
              weeks={weeks}
              form={form}
              onWeeksChange={handleWeeksChange}
            />
          )}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 16, padding: '16px 0',
      }}>
        <Button variant="secondary" onClick={handleBack} icon={<ArrowLeft size={14} />}>
          {step === 1 ? 'Cancelar' : 'Voltar'}
        </Button>
        {step === 1 ? (
          <Button variant="primary" onClick={handleNextStep} icon={<ArrowRight size={14} />}>
            Configurar Semanas
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSave} icon={<Save size={14} />}>
            Salvar Safra
          </Button>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}

// ─── Step 1: Dados Gerais ─────────────────────────────────────────────────────

function Step1({
  form,
  errors,
  onChange,
}: {
  form: FormData
  errors: Record<string, string>
  onChange: (f: keyof FormData, v: string) => void
}) {
  const { colors } = useTheme()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>

      {/* Linha 1: Descrição */}
      <FormField
        label="Descrição"
        required
        placeholder="Ex.: Safra 2026/2027"
        value={form.desc}
        error={errors.desc}
        onChange={e => onChange('desc', e.target.value)}
      />

      {/* Linha 2: Status + Rebanho */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FormSelect
          label="Status"
          options={STATUS_OPTS}
          value={form.ativo}
          onChange={e => onChange('ativo', e.target.value)}
        />
        <FormSelect
          label="Controle de Rebanho"
          options={REBANHO_OPTS}
          value={form.reb}
          onChange={e => onChange('reb', e.target.value)}
        />
      </div>

      {/* Linha 3: Datas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FormField
          label="Data de Início"
          required
          type="date"
          value={form.ini}
          error={errors.ini}
          onChange={e => onChange('ini', e.target.value)}
        />
        <FormField
          label="Data de Fim"
          required
          type="date"
          value={form.fim}
          error={errors.fim}
          onChange={e => onChange('fim', e.target.value)}
        />
      </div>

      {/* Linha 4: Evolução + Semestres */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <FormSelect
          label="Evolução de Rebanho"
          options={EVOLUCAO_OPTS}
          value={form.evo}
          onChange={e => onChange('evo', e.target.value)}
        />
        <FormSelect
          label="1º Semestre inicia em"
          options={MES_OPTS}
          value={form.s1}
          onChange={e => onChange('s1', e.target.value)}
        />
        <FormSelect
          label="2º Semestre inicia em"
          options={MES_OPTS}
          value={form.s2}
          onChange={e => onChange('s2', e.target.value)}
        />
      </div>
    </div>
  )
}

// ─── Step 2: Código Visual ────────────────────────────────────────────────────

function Step2({
  weeks,
  form,
  onWeeksChange,
}: {
  weeks: Week[]
  form: FormData
  onWeeksChange: (w: Week[]) => void
}) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: t.font.size.xl, fontWeight: 700, color: '#171717', margin: '0 0 4px', fontFamily: "'Outfit', sans-serif" }}>
          Código Visual de Semanas
        </h2>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0, fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>
          Defina as cores de cada semana. Este código será exibido em calendários, relatórios e dashboards.
          Clique e arraste sobre os tiles para pintar múltiplas semanas de uma vez.
        </p>
      </div>
      <WeekCanvas
        weeks={weeks}
        desc={form.desc}
        iniLabel={fmtYMDtoDMY(form.ini)}
        fimLabel={fmtYMDtoDMY(form.fim)}
        editable
        onWeeksChange={onWeeksChange}
      />
    </div>
  )
}
