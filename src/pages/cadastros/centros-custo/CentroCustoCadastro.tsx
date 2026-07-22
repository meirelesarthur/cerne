import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { Button }        from '../../../components/ui/Button'
import { FormField }     from '../../../components/ui/FormField'
import { FormSelect }    from '../../../components/ui/FormSelect'
import { CategoryTreeField } from '../../../components/ui/CategoryTreeField'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { t }             from '../../../design/tokens'
import { useTheme }      from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { CATEGORIAS_FINANCEIRAS_TREE } from '../../../data/categoriasFinanceiras'
import {
  gerarCodigo, classeOf, CLASSE_LABEL, antecessorLabel,
  CONDICAO_OPTS, TIPO_OPTS, ATIVO_OPTS,
  type CentroCusto, type CondicaoCC, type TipoCC,
} from './centrosCusto.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CentroCustoCadastroProps {
  initialData?: CentroCusto
  allCentros:   CentroCusto[]
  onBack:       () => void
  onSave:       (cc: CentroCusto) => void
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormData {
  condicao:     CondicaoCC | ''
  descricao:    string
  ativo:        'sim' | 'nao'
  apontamento:  'sim' | 'nao'
  tipo:         TipoCC
  antecessorId: number | null
  categorias:   string[]
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CentroCustoCadastro({
  initialData, allCentros, onBack, onSave,
}: CentroCustoCadastroProps) {
  const { colors } = useTheme()
  const isEdit     = !!initialData

  const [form, setForm] = useState<FormData>(() =>
    initialData
      ? {
          condicao:     initialData.condicao,
          descricao:    initialData.descricao,
          ativo:        initialData.ativo,
          apontamento:  initialData.apontamento,
          tipo:         initialData.tipo,
          antecessorId: initialData.antecessorId,
          categorias:   initialData.categorias,
        }
      : {
          condicao:     '',
          descricao:    '',
          ativo:        'sim',
          apontamento:  'sim',
          tipo:         'produtivo',
          antecessorId: null,
          categorias:   [],
        }
  )

  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const { toasts, show, dismiss } = useToast()
  const guard = useUnsavedChangesGuard(onBack)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    guard.setIsDirty(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  // Classe derivada
  const classe = classeOf(form.antecessorId)

  // Preview do código
  const codigoPreview = initialData?.codigo ?? gerarCodigo(form.antecessorId, allCentros)

  // Opções de antecessor (excluir o próprio item em edição)
  const antecessorOpts = [
    { value: '', label: 'Nenhum (Centro Raiz)' },
    ...allCentros
      .filter(c => c.id !== initialData?.id)
      .map(c => ({ value: String(c.id), label: antecessorLabel(c) })),
  ]

  // ── Validação ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.condicao)         errs.condicao  = 'Selecione uma condição.'
    if (!form.descricao.trim()) errs.descricao = 'Descrição é obrigatória.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Salvar ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (submitting) return
    if (!validate()) return
    const cc: CentroCusto = {
      id:           initialData?.id ?? 0,
      codigo:       codigoPreview,
      condicao:     form.condicao as CondicaoCC,
      descricao:    form.descricao.trim(),
      ativo:        form.ativo,
      apontamento:  form.apontamento,
      tipo:         form.tipo,
      antecessorId: form.antecessorId,
      categorias:   form.categorias,
    }
    setSubmitting(true)
    setTimeout(() => {
      onSave(cc)
      show(isEdit ? 'Centro atualizado com sucesso!' : 'Centro cadastrado com sucesso!')
      setSubmitting(false)
    }, 800)
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      {/* ── Card principal com scroll interno + footer fixo ──────────────── */}
      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={guard.guardedBack} icon={<ArrowLeft size={14} />} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave} icon={<Save size={14} />} loading={submitting} disabled={submitting}>
              {isEdit ? 'Salvar alterações' : 'Cadastrar Centro'}
            </Button>
          </>
        }
      >

          {/* Header */}
          <FormPageHeader
            title={isEdit ? `Editar — ${initialData!.descricao}` : 'Novo Centro de Custo'}
            subtitle={isEdit ? 'Atualize os dados do centro de custo' : 'Preencha os dados para criar um centro de custo'}
            onBack={guard.guardedBack}
            paddingTop={t.space[4]}
          />

          {/* Campos do formulário */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: t.space[6] }}>

            {/* Código derivado (read-only) */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px',
              background: colors.bg.subtle,
              borderRadius: t.radius.lg,
              border: `1px solid ${colors.border.subtle}`,
            }}>
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans, fontWeight: t.font.weight.semibold, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Código gerado:
              </span>
              <span style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.bold, color: colors.fg.default, fontFamily: t.font.family.sans, fontVariantNumeric: 'tabular-nums' }}>
                {codigoPreview}
              </span>
              <span style={{
                fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
                padding: '2px 8px', borderRadius: t.radius.full,
                background: classe === 'sintetica' ? t.color.feedback.info.bg : t.color.brand[50],
                color:      classe === 'sintetica' ? t.color.feedback.info.text : t.color.brand[600],
                fontFamily: t.font.family.sans,
              }}>
                {CLASSE_LABEL[classe]}
              </span>
            </div>

            {/* Linha 1: Condição | Descrição | Ativo | Apontamento */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
              <FormSelect
                label="Condição Normal"
                required
                options={CONDICAO_OPTS}
                value={form.condicao}
                onChange={e => set('condicao', e.target.value as CondicaoCC | '')}
                error={errors.condicao}
              />
              <FormField
                label="Descrição"
                required
                placeholder="Ex.: Administração da Sede"
                value={form.descricao}
                error={errors.descricao}
                onChange={e => set('descricao', e.target.value)}
              />
              <FormSelect
                label="Ativo"
                required
                options={ATIVO_OPTS}
                value={form.ativo}
                onChange={e => set('ativo', e.target.value as 'sim' | 'nao')}
              />
              <FormSelect
                label="Apontamento"
                required
                options={ATIVO_OPTS}
                value={form.apontamento}
                onChange={e => set('apontamento', e.target.value as 'sim' | 'nao')}
              />
            </div>

            {/* Linha 2: Tipo (full width) */}
            <FormSelect
              label="Tipo"
              required
              options={TIPO_OPTS}
              value={form.tipo}
              onChange={e => set('tipo', e.target.value as TipoCC)}
            />

            {/* Linha 3: Antecessor (full width) */}
            <FormSelect
              label="Antecessor"
              options={antecessorOpts}
              value={form.antecessorId === null ? '' : String(form.antecessorId)}
              onChange={e => set('antecessorId', e.target.value === '' ? null : Number(e.target.value))}
            />

            {/* Seção: Categorias */}
            <CategoryTreeField
              tree={CATEGORIAS_FINANCEIRAS_TREE}
              selected={form.categorias}
              onChange={cats => set('categorias', cats)}
            />

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
