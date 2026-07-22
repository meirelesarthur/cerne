import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { Button }        from '../../../components/ui/Button'
import { FormField }     from '../../../components/ui/FormField'
import { FormSelect }    from '../../../components/ui/FormSelect'
import { SearchSelect, type SearchSelectOption } from '../../../components/ui/SearchSelect'
import { CheckboxListField } from '../../../components/ui/CheckboxListField'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { focusFirstError } from '../../../hooks/focusFirstError'
import { t }             from '../../../design/tokens'
import { useTheme }      from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { mockPessoas } from '../pessoas/pessoas.mock'
import { mockFazendas } from '../fazendas/fazendas.mock'
import {
  BANCOS_FEBRABAN, TIPO_CONTA_OPTS, SIM_NAO_OPTS, TIPO_BOLETO_OPTS,
  bancoLabel, contaInvestimentoLabel, opcoesContaInvestimento, formatCurrencyBRL,
  type ContaBancaria, type TipoContaBancaria,
} from './contasBancarias.types'

/** "R$ 1.234,56" (ou parcial) → 1234.56 */
function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 0
  return parseInt(digits, 10) / 100
}

interface ContaBancariaCadastroProps {
  initialData?: ContaBancaria
  allContas:    ContaBancaria[]
  onBack:       () => void
  onSave:       (conta: ContaBancaria) => void
  readOnly?:    boolean
}

interface FormData {
  banco:                     string
  agencia:                   string
  conta:                     string
  usaNoLivroCaixa:           'sim' | 'nao'
  tipo:                      TipoContaBancaria | ''
  sigla:                     string
  descricao:                 string
  emiteBoleto:                'sim' | 'nao'
  proprietarios:             string[]
  limite:                    string
  ativo:                     'sim' | 'nao'
  carteira:                  string
  convenioCodBeneficiario:   string
  tipoBoleto:                'cnab240' | 'cnab400' | ''
  contaInvestimentoVinculadaId: string
  fazendasVinculadas:        string[]
}

const emptyForm: FormData = {
  banco: '', agencia: '', conta: '', usaNoLivroCaixa: 'sim', tipo: '', sigla: '', descricao: '',
  emiteBoleto: 'nao', proprietarios: [], limite: '', ativo: 'sim',
  carteira: '', convenioCodBeneficiario: '', tipoBoleto: '',
  contaInvestimentoVinculadaId: '', fazendasVinculadas: [],
}

export default function ContaBancariaCadastro({
  initialData, allContas, onBack, onSave, readOnly = false,
}: ContaBancariaCadastroProps) {
  const { colors } = useTheme()
  const isEdit = !!initialData

  const [form, setForm] = useState<FormData>(() =>
    initialData
      ? {
          banco: initialData.banco, agencia: initialData.agencia, conta: initialData.conta,
          usaNoLivroCaixa: initialData.usaNoLivroCaixa, tipo: initialData.tipo,
          sigla: initialData.sigla, descricao: initialData.descricao,
          emiteBoleto: initialData.emiteBoleto,
          proprietarios: initialData.proprietarios.map(String),
          limite: formatCurrencyBRL(initialData.limite), ativo: initialData.ativo,
          carteira: initialData.carteira, convenioCodBeneficiario: initialData.convenioCodBeneficiario,
          tipoBoleto: initialData.tipoBoleto,
          contaInvestimentoVinculadaId: initialData.contaInvestimentoVinculadaId !== null ? String(initialData.contaInvestimentoVinculadaId) : '',
          fazendasVinculadas: initialData.fazendasVinculadas,
        }
      : emptyForm
  )

  const [bancoQuery, setBancoQuery] = useState(() => initialData ? bancoLabel(initialData.banco) : '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const { toasts, show, dismiss } = useToast()
  const guard = useUnsavedChangesGuard(onBack)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (!readOnly) guard.setIsDirty(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  const bancoOptions: SearchSelectOption[] = BANCOS_FEBRABAN.map(b => ({ id: b.code, label: b.label, code: b.code }))

  const contaInvestimentoOpts = [
    { value: '', label: 'Nenhuma' },
    ...opcoesContaInvestimento(allContas, initialData?.id).map(c => ({ value: String(c.id), label: contaInvestimentoLabel(c) })),
  ]

  const pessoasItems = mockPessoas.map(p => ({ id: String(p.id), label: p.name }))
  const fazendasItems = mockFazendas.map(f => ({ id: f.id, label: f.nome }))

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.banco)               errs.banco = 'Selecione um banco.'
    if (!form.agencia.trim())      errs.agencia = 'Agência é obrigatória.'
    if (!form.conta.trim())        errs.conta = 'Conta é obrigatória.'
    if (!form.tipo)                errs.tipo = 'Selecione um tipo.'
    if (!form.sigla.trim())        errs.sigla = 'Sigla é obrigatória.'
    if (!form.descricao.trim())    errs.descricao = 'Descrição é obrigatória.'

    const limiteNum = parseCurrencyInput(form.limite)
    if (Number.isNaN(limiteNum) || limiteNum < 0) errs.limite = 'Informe um valor numérico não negativo.'

    if (!isEdit || form.banco !== initialData?.banco || form.agencia !== initialData?.agencia || form.conta !== initialData?.conta) {
      const duplicado = allContas.some(c =>
        c.id !== initialData?.id && c.banco === form.banco && c.agencia.trim() === form.agencia.trim() && c.conta.trim() === form.conta.trim()
      )
      if (duplicado) errs.conta = 'Já existe uma conta cadastrada com este banco, agência e conta.'
    }

    if (form.emiteBoleto === 'sim') {
      if (!form.carteira.trim())                errs.carteira = 'Carteira é obrigatória quando a conta emite boleto.'
      if (!form.convenioCodBeneficiario.trim())  errs.convenioCodBeneficiario = 'Convênio/Cód. Beneficiário é obrigatório quando a conta emite boleto.'
      if (!form.tipoBoleto)                      errs.tipoBoleto = 'Selecione o tipo do boleto.'
      if (form.proprietarios.length === 0)       errs.proprietarios = 'Selecione ao menos um proprietário para emissão de boleto.'
    }

    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      show(`Corrija os campos destacados: ${Object.values(errs)[0]}`, 'error')
      focusFirstError()
      return false
    }
    return true
  }

  const handleSave = () => {
    if (submitting || readOnly) return
    if (!validate()) return

    const conta: ContaBancaria = {
      id: initialData?.id ?? 0,
      banco: form.banco, agencia: form.agencia.trim(), conta: form.conta.trim(),
      usaNoLivroCaixa: form.usaNoLivroCaixa, tipo: form.tipo, sigla: form.sigla.trim(), descricao: form.descricao.trim(),
      emiteBoleto: form.emiteBoleto,
      proprietarios: form.proprietarios.map(Number),
      limite: parseCurrencyInput(form.limite),
      ativo: form.ativo,
      carteira: form.emiteBoleto === 'sim' ? form.carteira.trim() : '',
      convenioCodBeneficiario: form.emiteBoleto === 'sim' ? form.convenioCodBeneficiario.trim() : '',
      tipoBoleto: form.emiteBoleto === 'sim' ? form.tipoBoleto : '',
      contaInvestimentoVinculadaId: form.contaInvestimentoVinculadaId === '' ? null : Number(form.contaInvestimentoVinculadaId),
      fazendasVinculadas: form.fazendasVinculadas,
      saldo: initialData?.saldo ?? 0,
      dataCriacao: initialData?.dataCriacao ?? new Date().toISOString().slice(0, 10),
      usuarioCriacao: initialData?.usuarioCriacao ?? 'Silvio Ventura',
    }

    setSubmitting(true)
    setTimeout(() => {
      onSave(conta)
      show(isEdit ? 'Conta bancária atualizada com sucesso!' : 'Conta bancária cadastrada com sucesso!')
      setSubmitting(false)
    }, 800)
  }

  const title = readOnly
    ? `Visualizar — ${initialData!.descricao}`
    : isEdit ? `Editar — ${initialData!.descricao}` : 'Nova Conta Bancária'
  const subtitle = readOnly
    ? 'Dados da conta bancária (somente leitura)'
    : isEdit ? 'Atualize os dados da conta bancária' : 'Preencha os dados para criar uma conta bancária'

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      <PageCard
        footer={
          readOnly ? (
            <Button variant="secondary" onClick={onBack} icon={<ArrowLeft size={14} />}>Voltar</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={guard.guardedBack} icon={<ArrowLeft size={14} />} disabled={submitting}>
                Voltar
              </Button>
              <Button variant="primary" onClick={handleSave} icon={<Save size={14} />} loading={submitting} disabled={submitting}>
                {isEdit ? 'Salvar alterações' : 'Salvar'}
              </Button>
            </>
          )
        }
      >

          <FormPageHeader title={title} subtitle={subtitle} onBack={guard.guardedBack} paddingTop={t.space[4]} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: t.space[6] }}>

            {/* ── Seção: Informações Gerais ────────────────────────────── */}
            <SectionBlock title="Informações Gerais" colors={colors}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
                  <SearchSelect
                    label="Banco"
                    required
                    query={bancoQuery}
                    onQueryChange={q => { setBancoQuery(q); if (!q) set('banco', '') }}
                    options={bancoOptions}
                    selectedId={form.banco || null}
                    onSelect={opt => { set('banco', opt.id); setBancoQuery(opt.label) }}
                    onClear={() => { set('banco', ''); setBancoQuery('') }}
                    placeholder="Buscar banco por nome ou código..."
                    error={errors.banco}
                    disabled={readOnly}
                  />
                  <FormField label="Agência" required value={form.agencia} error={errors.agencia} onChange={e => set('agencia', e.target.value)} disabled={readOnly} />
                  <FormField label="Conta" required value={form.conta} error={errors.conta} onChange={e => set('conta', e.target.value)} disabled={readOnly} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                  <FormSelect label="Tipo" required options={TIPO_CONTA_OPTS} value={form.tipo} error={errors.tipo} onChange={e => set('tipo', e.target.value as TipoContaBancaria | '')} disabled={readOnly} />
                  <FormField label="Sigla" required placeholder="Ex.: BB-CC" value={form.sigla} error={errors.sigla} onChange={e => set('sigla', e.target.value)} disabled={readOnly} />
                  <FormSelect label="Usa no Livro Caixa" required options={SIM_NAO_OPTS} value={form.usaNoLivroCaixa} onChange={e => set('usaNoLivroCaixa', e.target.value as 'sim' | 'nao')} disabled={readOnly} />
                  <FormSelect label="Ativo" required options={SIM_NAO_OPTS} value={form.ativo} onChange={e => set('ativo', e.target.value as 'sim' | 'nao')} disabled={readOnly} />
                </div>

                <FormField label="Descrição" required placeholder="Ex.: Banco do Brasil — Conta Movimento" value={form.descricao} error={errors.descricao} onChange={e => set('descricao', e.target.value)} disabled={readOnly} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <FormField label="Limite" required hint="Limite de crédito/cheque especial associado à conta." mask="currency" value={form.limite} placeholder="R$ 0,00" error={errors.limite} onChange={e => set('limite', e.target.value)} disabled={readOnly} />
                  <FormSelect
                    label="Conta Investimento Vinculada"
                    hint="Associa esta conta a uma aplicação financeira ou caixa interno existente."
                    options={contaInvestimentoOpts}
                    value={form.contaInvestimentoVinculadaId}
                    onChange={e => set('contaInvestimentoVinculadaId', e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                {!readOnly && isEdit && (
                  <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default, fontFamily: t.font.family.sans }}>
                    Saldo atual: {formatCurrencyBRL(initialData!.saldo)}
                    <span style={{ fontWeight: t.font.weight.normal, color: colors.fg.subtle, marginLeft: 8, fontSize: t.font.size.xs }}>
                      (calculado a partir do Saldo Inicial + lançamentos — não editável aqui)
                    </span>
                  </div>
                )}
                {readOnly && (
                  <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default, fontFamily: t.font.family.sans }}>
                    Saldo atual: {formatCurrencyBRL(initialData!.saldo)}
                  </div>
                )}
              </div>
            </SectionBlock>

            {/* ── Seção: Emissão de Boleto ──────────────────────────────── */}
            <SectionBlock title="Emissão de Boleto" colors={colors}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FormSelect label="Emite Boleto" required options={SIM_NAO_OPTS} value={form.emiteBoleto} onChange={e => set('emiteBoleto', e.target.value as 'sim' | 'nao')} disabled={readOnly} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <FormField label="Carteira" required={form.emiteBoleto === 'sim'} disabled={readOnly || form.emiteBoleto === 'nao'} value={form.carteira} error={errors.carteira} onChange={e => set('carteira', e.target.value)} />
                  <FormField label="Convênio / Cód. Beneficiário" required={form.emiteBoleto === 'sim'} disabled={readOnly || form.emiteBoleto === 'nao'} value={form.convenioCodBeneficiario} error={errors.convenioCodBeneficiario} onChange={e => set('convenioCodBeneficiario', e.target.value)} />
                  <FormSelect label="Tipo do Boleto" required={form.emiteBoleto === 'sim'} disabled={readOnly || form.emiteBoleto === 'nao'} options={TIPO_BOLETO_OPTS} value={form.tipoBoleto} error={errors.tipoBoleto} onChange={e => set('tipoBoleto', e.target.value as 'cnab240' | 'cnab400' | '')} />
                </div>

                <CheckboxListField
                  label="Proprietários"
                  hint={form.emiteBoleto === 'sim' ? 'Obrigatório: identifica o(s) titular(es)/beneficiário(s) para geração do boleto.' : undefined}
                  items={readOnly ? pessoasItems.filter(p => form.proprietarios.includes(p.id)) : pessoasItems}
                  selectedIds={form.proprietarios}
                  onChange={ids => set('proprietarios', ids)}
                  searchPlaceholder="Buscar pessoa..."
                />
                {errors.proprietarios && (
                  <span role="alert" style={{ fontSize: t.font.size.xs, color: t.color.feedback.error.text, fontFamily: t.font.family.sans }}>
                    {errors.proprietarios}
                  </span>
                )}
              </div>
            </SectionBlock>

            {/* ── Seção: Fazendas Vinculadas ────────────────────────────── */}
            <SectionBlock title="Fazendas Vinculadas" colors={colors}>
              <CheckboxListField
                label="Propriedades"
                items={readOnly ? fazendasItems.filter(f => form.fazendasVinculadas.includes(f.id)) : fazendasItems}
                selectedIds={form.fazendasVinculadas}
                onChange={ids => set('fazendasVinculadas', ids)}
                searchPlaceholder="Buscar fazenda..."
              />
            </SectionBlock>

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

function SectionBlock({ title, colors, children }: { title: string; colors: ReturnType<typeof useTheme>['colors']; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.subtle, fontFamily: t.font.family.sans, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {title}
      </span>
      {children}
    </div>
  )
}
