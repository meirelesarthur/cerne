import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Save, Trash2, Plus, ImagePlus } from 'lucide-react'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { Button }        from '../../../components/ui/Button'
import { FormField }     from '../../../components/ui/FormField'
import { FormSelect }    from '../../../components/ui/FormSelect'
import { Checkbox }      from '../../../components/ui/Checkbox'
import { IconButton }    from '../../../components/ui/IconButton'
import { FileUpload, type UploadedFile } from '../../../components/ui/FileUpload'
import { CheckboxListField } from '../../../components/ui/CheckboxListField'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { focusFirstError } from '../../../hooks/focusFirstError'
import { t }             from '../../../design/tokens'
import { useTheme }      from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { mockFazendas } from '../fazendas/fazendas.mock'
import {
  AMBIENTE_OPTS, REGIME_OPTS, SIM_NAO_OPTS, UF_OPTS, isValidCpfCnpj,
  type Emissor, type Ambiente, type Regime, type InscricaoEstadual,
} from './emissores.types'

interface EmissorCadastroProps {
  initialData?: Emissor
  onBack:       () => void
  onSave:       (emissor: Emissor) => void
}

interface FormData {
  cpfCnpj: string
  razaoSocial: string
  nomeFantasia: string
  email: string
  ativo: 'sim' | 'nao'
  cep: string
  rua: string
  numero: string
  bairro: string
  cidade: string
  emiteNfe: 'sim' | 'nao'
  ultimoNumeroNfe: string
  ultimoNumeroCte: string
  ultimoNumeroMdfe: string
  numeroSerieNfe: string
  numeroSerieCte: string
  numeroSerieMdfe: string
  ambiente: Ambiente | ''
  regime: Regime | ''
  fazendas: string[]
}

const emptyForm: FormData = {
  cpfCnpj: '', razaoSocial: '', nomeFantasia: '', email: '', ativo: 'sim',
  cep: '', rua: '', numero: '', bairro: '', cidade: '',
  emiteNfe: 'nao',
  ultimoNumeroNfe: '0', ultimoNumeroCte: '0', ultimoNumeroMdfe: '0',
  numeroSerieNfe: '1', numeroSerieCte: '1', numeroSerieMdfe: '1',
  ambiente: '', regime: '', fazendas: [],
}

let ieSeq = 1000

export default function EmissorCadastro({ initialData, onBack, onSave }: EmissorCadastroProps) {
  const { colors } = useTheme()
  const isEdit = !!initialData

  const [form, setForm] = useState<FormData>(() =>
    initialData
      ? {
          cpfCnpj: initialData.cpfCnpj, razaoSocial: initialData.razaoSocial, nomeFantasia: initialData.nomeFantasia,
          email: initialData.email, ativo: initialData.ativo,
          cep: initialData.cep, rua: initialData.rua, numero: initialData.numero, bairro: initialData.bairro, cidade: initialData.cidade,
          emiteNfe: initialData.emiteNfe,
          ultimoNumeroNfe: initialData.ultimoNumeroNfe, ultimoNumeroCte: initialData.ultimoNumeroCte, ultimoNumeroMdfe: initialData.ultimoNumeroMdfe,
          numeroSerieNfe: initialData.numeroSerieNfe, numeroSerieCte: initialData.numeroSerieCte, numeroSerieMdfe: initialData.numeroSerieMdfe,
          ambiente: initialData.ambiente, regime: initialData.regime, fazendas: initialData.fazendas,
        }
      : emptyForm
  )

  const [logoFiles, setLogoFiles] = useState<UploadedFile[]>(
    initialData?.logoUrl ? [{ id: 'logo', name: 'logo.png', size: 0, status: 'done' }] : []
  )
  const [ies, setIes] = useState<InscricaoEstadual[]>(initialData?.inscricoesEstaduais ?? [])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ieErrors, setIeErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [pendingAmbiente, setPendingAmbiente] = useState<Ambiente | null>(null)
  const { toasts, show, dismiss } = useToast()
  const guard = useUnsavedChangesGuard(onBack)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    guard.setIsDirty(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, ies, logoFiles])

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  // ── Autopreenchimento por CEP (ViaCEP — melhor esforço, falha silenciosa) ──
  const handleCepBlur = async () => {
    const digits = form.cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          rua: data.logradouro || prev.rua,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade ? `${data.localidade}/${data.uf}` : prev.cidade,
        }))
      }
    } catch {
      // Sem internet ou serviço fora do ar — usuário preenche manualmente.
    }
  }

  // ── Ambiente: confirmação ao trocar Homologação → Produção ────────────────
  const handleAmbienteChange = (value: Ambiente | '') => {
    if (form.ambiente === 'homologacao' && value === 'producao') {
      setPendingAmbiente('producao')
      return
    }
    set('ambiente', value)
  }

  // ── Inscrições Estaduais ───────────────────────────────────────────────────
  const addIe = () => setIes(prev => [...prev, { id: `ie-${ieSeq++}`, uf: 'MT', numero: '', isento: false }])
  const removeIe = (id: string) => setIes(prev => prev.filter(ie => ie.id !== id))
  const updateIe = (id: string, patch: Partial<InscricaoEstadual>) => {
    setIes(prev => prev.map(ie => ie.id === id ? { ...ie, ...patch } : ie))
    if (ieErrors[id]) setIeErrors(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  const logoHint = 'Usada na impressão do DANFE/documento fiscal. Proporção recomendada 100x100px.'

  // ── Validação ───────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.cpfCnpj.trim())        errs.cpfCnpj = 'CPF/CNPJ é obrigatório.'
    else if (!isValidCpfCnpj(form.cpfCnpj)) errs.cpfCnpj = 'CPF/CNPJ inválido — verifique o dígito verificador.'
    if (!form.razaoSocial.trim())    errs.razaoSocial = 'Razão social é obrigatória.'
    if (!form.nomeFantasia.trim())   errs.nomeFantasia = 'Nome fantasia é obrigatório.'
    if (!form.email.trim())          errs.email = 'E-mail é obrigatório.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Informe um e-mail válido.'
    if (!form.cep.trim())            errs.cep = 'CEP é obrigatório.'
    if (!form.rua.trim())            errs.rua = 'Rua é obrigatória.'
    if (!form.numero.trim())         errs.numero = 'Número é obrigatório.'
    if (!form.bairro.trim())         errs.bairro = 'Bairro é obrigatório.'
    if (!form.cidade.trim())         errs.cidade = 'Cidade é obrigatória.'

    if (form.emiteNfe === 'sim') {
      if (!form.numeroSerieNfe.trim())  errs.numeroSerieNfe = 'Série da NFe é obrigatória.'
      if (!form.numeroSerieCte.trim())  errs.numeroSerieCte = 'Série do CTe é obrigatória.'
      if (!form.numeroSerieMdfe.trim()) errs.numeroSerieMdfe = 'Série do MDFe é obrigatória.'
      if (!form.ambiente)               errs.ambiente = 'Selecione o ambiente.'
      if (!form.regime)                 errs.regime = 'Selecione o regime.'
    }

    const ieErrs: Record<string, string> = {}
    ies.forEach(ie => {
      if (!ie.isento && !ie.numero.trim()) ieErrs[ie.id] = 'Informe a Inscrição Estadual ou marque Isento.'
    })
    setIeErrors(ieErrs)

    setErrors(errs)
    const hasErrors = Object.keys(errs).length > 0 || Object.keys(ieErrs).length > 0
    if (hasErrors) {
      const firstMsg = Object.values(errs)[0] ?? Object.values(ieErrs)[0]
      show(`Corrija os campos destacados: ${firstMsg}`, 'error')
      focusFirstError()
      return false
    }
    return true
  }

  const doSave = () => {
    const emissor: Emissor = {
      id: initialData?.id ?? 0,
      logoUrl: logoFiles.length > 0 ? (initialData?.logoUrl ?? 'mock://logo') : null,
      cpfCnpj: form.cpfCnpj.trim(), razaoSocial: form.razaoSocial.trim(), nomeFantasia: form.nomeFantasia.trim(),
      email: form.email.trim(), ativo: form.ativo,
      cep: form.cep.trim(), rua: form.rua.trim(), numero: form.numero.trim(), bairro: form.bairro.trim(), cidade: form.cidade.trim(),
      emiteNfe: form.emiteNfe,
      ultimoNumeroNfe: form.ultimoNumeroNfe, ultimoNumeroCte: form.ultimoNumeroCte, ultimoNumeroMdfe: form.ultimoNumeroMdfe,
      numeroSerieNfe: form.numeroSerieNfe, numeroSerieCte: form.numeroSerieCte, numeroSerieMdfe: form.numeroSerieMdfe,
      ambiente: form.emiteNfe === 'sim' ? form.ambiente : '', regime: form.emiteNfe === 'sim' ? form.regime : '',
      fazendas: form.fazendas,
      inscricoesEstaduais: ies,
      certificado: initialData?.certificado ?? null,
      dataCriacao: initialData?.dataCriacao ?? new Date().toISOString().slice(0, 10),
      usuarioCriacao: initialData?.usuarioCriacao ?? 'Silvio Ventura',
    }
    setSubmitting(true)
    setTimeout(() => {
      onSave(emissor)
      show(isEdit ? 'Emissor atualizado com sucesso!' : 'Emissor cadastrado com sucesso!')
      setSubmitting(false)
    }, 800)
  }

  const handleSave = () => {
    if (submitting) return
    if (!validate()) return
    doSave()
  }

  const fazendasItems = mockFazendas.map(f => ({ id: f.id, label: f.nome }))

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={guard.guardedBack} icon={<ArrowLeft size={14} />} disabled={submitting}>
              Voltar
            </Button>
            <Button variant="primary" onClick={handleSave} icon={<Save size={14} />} loading={submitting} disabled={submitting}>
              {isEdit ? 'Salvar alterações' : 'Salvar'}
            </Button>
          </>
        }
      >

          <FormPageHeader
            title={isEdit ? `Editar — ${initialData!.razaoSocial}` : 'Novo Emissor'}
            subtitle={isEdit ? 'Atualize os dados do emissor' : 'Preencha os dados para criar um emissor de NFe/CTe/MDFe'}
            onBack={guard.guardedBack}
            paddingTop={t.space[4]}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: t.space[6] }}>

            {/* ── Informações Gerais ────────────────────────────────────── */}
            <SectionBlock title="Informações Gerais" colors={colors}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FileUpload
                  label="Logo"
                  hint={logoHint}
                  accept="image/*"
                  maxSizeMb={2}
                  files={logoFiles}
                  onFilesAdded={(files) => setLogoFiles(files.map((f, i) => ({ id: `logo-${i}-${f.name}`, name: f.name, size: f.size, status: 'done' })))}
                  onRemove={() => setLogoFiles([])}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 16 }}>
                  <FormField label="CPF/CNPJ" required mask="cpfCnpj" value={form.cpfCnpj} error={errors.cpfCnpj} onChange={e => set('cpfCnpj', e.target.value)} />
                  <FormField label="Razão Social" required value={form.razaoSocial} error={errors.razaoSocial} onChange={e => set('razaoSocial', e.target.value)} />
                  <FormSelect label="Ativo" required options={SIM_NAO_OPTS} value={form.ativo} onChange={e => set('ativo', e.target.value as 'sim' | 'nao')} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <FormField label="Nome Fantasia" required value={form.nomeFantasia} error={errors.nomeFantasia} onChange={e => set('nomeFantasia', e.target.value)} />
                  <FormField label="Email" required type="email" spellCheck={false} value={form.email} error={errors.email} onChange={e => set('email', e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 16 }}>
                  <FormField label="CEP" required mask="cep" value={form.cep} error={errors.cep} onChange={e => set('cep', e.target.value)} onBlur={handleCepBlur} />
                  <FormField label="Rua" required value={form.rua} error={errors.rua} onChange={e => set('rua', e.target.value)} />
                  <FormField label="Número" required value={form.numero} error={errors.numero} onChange={e => set('numero', e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <FormField label="Bairro" required value={form.bairro} error={errors.bairro} onChange={e => set('bairro', e.target.value)} />
                  <FormField label="Cidade" required hint="Preenchido automaticamente ao informar o CEP." value={form.cidade} error={errors.cidade} onChange={e => set('cidade', e.target.value)} />
                </div>
              </div>
            </SectionBlock>

            {/* ── Configuração de Numeração Fiscal ──────────────────────── */}
            <SectionBlock title="Configuração de Numeração Fiscal" colors={colors}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FormSelect label="Emite NFe" required options={SIM_NAO_OPTS} value={form.emiteNfe} onChange={e => set('emiteNfe', e.target.value as 'sim' | 'nao')} />

                {form.emiteNfe === 'sim' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                      <FormField label="Último Número NFe" hint="Último número de NFe emitido — base para a próxima numeração." value={form.ultimoNumeroNfe} onChange={e => set('ultimoNumeroNfe', e.target.value.replace(/\D/g, ''))} />
                      <FormField label="Último Número CTe" value={form.ultimoNumeroCte} onChange={e => set('ultimoNumeroCte', e.target.value.replace(/\D/g, ''))} />
                      <FormField label="Último Número MDFe" value={form.ultimoNumeroMdfe} onChange={e => set('ultimoNumeroMdfe', e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                      <FormField label="Série NFe" required hint="Série fiscal vigente para o documento." value={form.numeroSerieNfe} error={errors.numeroSerieNfe} onChange={e => set('numeroSerieNfe', e.target.value.replace(/\D/g, ''))} />
                      <FormField label="Série CTe" required value={form.numeroSerieCte} error={errors.numeroSerieCte} onChange={e => set('numeroSerieCte', e.target.value.replace(/\D/g, ''))} />
                      <FormField label="Série MDFe" required value={form.numeroSerieMdfe} error={errors.numeroSerieMdfe} onChange={e => set('numeroSerieMdfe', e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <FormSelect label="Ambiente" required options={AMBIENTE_OPTS} value={form.ambiente} error={errors.ambiente} onChange={e => handleAmbienteChange(e.target.value as Ambiente | '')} />
                      <FormSelect label="Regime" required options={REGIME_OPTS} value={form.regime} error={errors.regime} onChange={e => set('regime', e.target.value as Regime | '')} />
                    </div>
                  </>
                )}
              </div>
            </SectionBlock>

            {/* ── Fazendas Vinculadas ───────────────────────────────────── */}
            <SectionBlock title="Fazendas Vinculadas" colors={colors}>
              <CheckboxListField
                label="Propriedades"
                items={fazendasItems}
                selectedIds={form.fazendas}
                onChange={ids => set('fazendas', ids)}
                searchPlaceholder="Buscar fazenda..."
              />
            </SectionBlock>

            {/* ── Inscrições Estaduais ──────────────────────────────────── */}
            <SectionBlock title="Inscrições Estaduais" colors={colors}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ies.map(ie => (
                  <div key={ie.id} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 140px 40px', gap: 10, alignItems: 'flex-start' }}>
                    <FormSelect
                      label="UF"
                      options={UF_OPTS}
                      value={ie.uf}
                      onChange={e => updateIe(ie.id, { uf: e.target.value })}
                    />
                    <FormField
                      label="Inscrição Estadual"
                      value={ie.numero}
                      error={ieErrors[ie.id]}
                      disabled={ie.isento}
                      placeholder={ie.isento ? 'ISENTO' : ''}
                      onChange={e => updateIe(ie.id, { numero: e.target.value })}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', height: t.size.control, marginTop: 22 }}>
                      <Checkbox
                        label="Isento"
                        checked={ie.isento}
                        onChange={checked => updateIe(ie.id, { isento: checked, numero: checked ? '' : ie.numero })}
                        aria-label={`Isento de IE (${ie.uf})`}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', height: t.size.control, marginTop: 22 }}>
                      <IconButton icon={<Trash2 size={14} />} aria-label="Remover inscrição estadual" onClick={() => removeIe(ie.id)} danger />
                    </div>
                  </div>
                ))}
                <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addIe} style={{ alignSelf: 'flex-start' }}>
                  Adicionar Item
                </Button>
              </div>
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

      <ConfirmDialog
        open={pendingAmbiente !== null}
        tone="default"
        title="Trocar para ambiente de Produção?"
        message="Em Produção, os documentos fiscais emitidos passam a ser válidos juridicamente perante a SEFAZ. Confirme que deseja sair do ambiente de testes (Homologação)."
        confirmLabel="Confirmar Produção"
        onConfirm={() => { set('ambiente', 'producao'); setPendingAmbiente(null) }}
        onCancel={() => setPendingAmbiente(null)}
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
