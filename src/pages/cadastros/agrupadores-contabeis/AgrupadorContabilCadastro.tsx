import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard } from '../../../components/ui/PageCard'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { Button } from '../../../components/ui/Button'
import { FormField } from '../../../components/ui/FormField'
import { FormSelect } from '../../../components/ui/FormSelect'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { t } from '../../../design/tokens'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import {
  gerarCodigo, antecessorLabel, getAllDescendantAgrupadorIds, ATIVO_OPTS,
  type AgrupadorContabil,
} from './agrupadoresContabeis.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface AgrupadorContabilCadastroProps {
  initialData?:     AgrupadorContabil
  allItems:         AgrupadorContabil[]
  defaultParentId?: number | null
  onBack:           () => void
  onSave:           (item: AgrupadorContabil) => void
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormData {
  nome:         string
  ativo:        'sim' | 'nao'
  antecessorId: number | null
  codigo:       string | null // override manual do código; null = usa a sugestão automática
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AgrupadorContabilCadastro({
  initialData, allItems, defaultParentId = null, onBack, onSave,
}: AgrupadorContabilCadastroProps) {
  const isEdit = !!initialData

  const [form, setForm] = useState<FormData>(() =>
    initialData
      ? {
          nome:         initialData.nome,
          ativo:        initialData.ativo,
          antecessorId: initialData.antecessorId,
          codigo:       initialData.codigo,
        }
      : {
          nome:         '',
          ativo:        'sim',
          antecessorId: defaultParentId,
          codigo:       null,
        }
  )

  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const { toasts, show, dismiss }   = useToast()
  const guard = useUnsavedChangesGuard(onBack)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    guard.setIsDirty(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n })
  }

  // Ids a excluir da lista de antecessores: o próprio item (em edição) e seus
  // descendentes — evita ciclo na hierarquia (mesmo padrão de Plano de Contas /
  // Centro de Custo, ver getAllDescendantAgrupadorIds).
  const excludedIds = new Set<number>(
    initialData ? [initialData.id, ...getAllDescendantAgrupadorIds(allItems, initialData.id)] : []
  )

  const antecessorOpts = [
    { value: '', label: 'Nenhum (Agrupador Raiz)' },
    ...allItems
      .filter((item) => !excludedIds.has(item.id))
      .map((item) => ({ value: String(item.id), label: antecessorLabel(item) })),
  ]

  const codigoSugerido = gerarCodigo(
    form.antecessorId,
    initialData ? allItems.filter((item) => item.id !== initialData.id) : allItems
  )
  const codigoValue = form.codigo ?? codigoSugerido

  // ── Validação ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.nome.trim()) errs.nome = 'Nome é obrigatório.'
    if (!codigoValue.trim()) errs.codigo = 'Código é obrigatório.'
    else if (allItems.some((item) => item.id !== initialData?.id && item.codigo.trim() === codigoValue.trim())) {
      errs.codigo = 'Já existe um agrupador com este código.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Salvar ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (submitting) return
    if (!validate()) return
    const item: AgrupadorContabil = {
      id:           initialData?.id ?? 0,
      codigo:       codigoValue.trim(),
      nome:         form.nome.trim(),
      ativo:        form.ativo,
      antecessorId: form.antecessorId,
    }
    setSubmitting(true)
    setTimeout(() => {
      onSave(item)
      show(isEdit
        ? 'Agrupador atualizado com sucesso.'
        : (form.antecessorId !== null ? 'Descendente criado com sucesso.' : 'Agrupador criado com sucesso.'))
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
              {isEdit ? 'Salvar alterações' : 'Cadastrar Agrupador'}
            </Button>
          </>
        }
      >

          {/* Header */}
          <FormPageHeader
            title={isEdit ? 'Editar Agrupador Contábil' : 'Novo Agrupador Contábil'}
            subtitle={isEdit ? `${initialData!.codigo} — ${initialData!.nome}` : 'Crie um agrupador contábil e, se necessário, selecione um antecessor.'}
            onBack={guard.guardedBack}
            paddingTop={t.space[4]}
          />

          {/* Campos do formulário */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: t.space[6] }}>

            {/* Linha 1: Código | Nome */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
              <FormField
                label="Código"
                required
                hint="Sugerido automaticamente a partir do antecessor — pode ser editado."
                placeholder={codigoSugerido}
                value={codigoValue}
                error={errors.codigo}
                onChange={(event) => set('codigo', event.target.value)}
              />
              <FormField
                label="Nome"
                required
                maxLength={60}
                value={form.nome}
                error={errors.nome}
                onChange={(event) => set('nome', event.target.value)}
              />
            </div>

            {/* Linha 2: Antecessor | Ativo */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              <FormSelect
                label="Antecessor"
                hint="Define a posição do agrupador na hierarquia. Não é possível selecionar o próprio agrupador ou um descendente."
                options={antecessorOpts}
                value={form.antecessorId === null ? '' : String(form.antecessorId)}
                onChange={(event) => set('antecessorId', event.target.value === '' ? null : Number(event.target.value))}
              />
              <FormSelect
                label="Ativo"
                required
                options={ATIVO_OPTS}
                value={form.ativo}
                onChange={(event) => set('ativo', event.target.value as 'sim' | 'nao')}
              />
            </div>

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
