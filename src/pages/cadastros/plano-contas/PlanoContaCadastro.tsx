import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Save, GitBranchPlus } from 'lucide-react'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { Button }        from '../../../components/ui/Button'
import { FormField }     from '../../../components/ui/FormField'
import { FormSelect }    from '../../../components/ui/FormSelect'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { focusFirstError } from '../../../hooks/focusFirstError'
import { t }             from '../../../design/tokens'
import { useTheme }      from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import {
  gerarCodigo, antecessorLabel, getAllDescendantContaIds,
  CONDICAO_OPTS, CLASSE_OPTS, TIPO_OPTS, ATIVO_OPTS,
  type Conta, type CondicaoPC, type ClassePC, type TipoPC,
} from './planoContas.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlanoContaCadastroProps {
  initialData?: Conta
  allContas:    Conta[]
  /** Pré-preenche o Antecessor ao criar uma conta via "Criar Descendente". Ignorado em edição. */
  presetAntecessorId?: number
  onBack:       () => void
  onSave:       (conta: Conta) => void
  /** Exibido apenas em edição — abre uma nova conta com este registro já selecionado como Antecessor. */
  onCreateDescendant?: () => void
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormData {
  descricao:    string
  condicao:     CondicaoPC | ''
  classe:       ClassePC | ''
  ativo:        'sim' | 'nao'
  tipo:         TipoPC | ''
  antecessorId: number | null
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PlanoContaCadastro({
  initialData, allContas, presetAntecessorId, onBack, onSave, onCreateDescendant,
}: PlanoContaCadastroProps) {
  const { colors } = useTheme()
  const isEdit     = !!initialData

  const [form, setForm] = useState<FormData>(() =>
    initialData
      ? {
          descricao:    initialData.descricao,
          condicao:     initialData.condicao,
          classe:       initialData.classe,
          ativo:        initialData.ativo,
          tipo:         initialData.tipo,
          antecessorId: initialData.antecessorId,
        }
      : {
          descricao:    '',
          condicao:     '',
          classe:       '',
          ativo:        'sim',
          tipo:         '',
          antecessorId: presetAntecessorId ?? null,
        }
  )

  // Código: pré-sugerido pelo sistema com base no antecessor, mas editável —
  // uma vez que o usuário digite, a sugestão automática para de sobrescrever.
  const [codigoManual, setCodigoManual] = useState<string | null>(initialData?.codigo ?? null)
  const codigoSugerido = gerarCodigo(form.antecessorId, allContas)
  const codigoValue = codigoManual ?? codigoSugerido

  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmInativar, setConfirmInativar] = useState(false)
  const { toasts, show, dismiss } = useToast()
  const guard = useUnsavedChangesGuard(onBack)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    guard.setIsDirty(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, codigoManual])

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  // Ids a excluir da lista de antecessores: o próprio item (em edição) e seus
  // descendentes (evita ciclo na hierarquia).
  const excludedIds = new Set<number>(
    initialData ? [initialData.id, ...getAllDescendantContaIds(allContas, initialData.id)] : []
  )

  const sinteticasDisponiveis = allContas.filter(
    c => c.classe === 'sintetica' && c.ativo === 'sim' && !excludedIds.has(c.id)
  )

  // Regra 4.1: o campo só é habilitado quando já existe ao menos uma conta
  // Sintética ativa cadastrada (para Analíticas, é praticamente obrigatório
  // na prática; para Sintéticas de nível superior, opcional — ver hint).
  const antecessorHabilitado = sinteticasDisponiveis.length > 0

  const antecessorOpts = [
    { value: '', label: 'Nenhum (Conta Raiz)' },
    ...sinteticasDisponiveis.map(c => ({ value: String(c.id), label: antecessorLabel(c) })),
  ]

  const descendentes = initialData ? getAllDescendantContaIds(allContas, initialData.id) : []

  // ── Validação ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!codigoValue.trim())    errs.codigo    = 'Código é obrigatório.'
    else {
      const duplicado = allContas.some(c => c.id !== initialData?.id && c.codigo.trim() === codigoValue.trim())
      if (duplicado) errs.codigo = 'Já existe uma conta com este código.'
    }
    if (!form.descricao.trim()) errs.descricao = 'Descrição é obrigatória.'
    if (!form.condicao)         errs.condicao  = 'Selecione uma condição.'
    if (!form.classe)           errs.classe    = 'Selecione uma classe.'
    if (isEdit && initialData!.classe === 'sintetica' && form.classe === 'analitica' && descendentes.length > 0) {
      errs.classe = `Não é possível converter para Analítica: esta conta possui ${descendentes.length} conta(s) vinculada(s).`
    }
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      show(`Corrija os campos destacados: ${Object.values(errs)[0]}`, 'error')
      focusFirstError()
      return false
    }
    return true
  }

  const buildConta = (): Conta => ({
    id:             initialData?.id ?? 0,
    codigo:         codigoValue.trim(),
    descricao:      form.descricao.trim(),
    condicao:       form.condicao as CondicaoPC,
    classe:         form.classe as ClassePC,
    ativo:          form.ativo,
    tipo:           form.tipo,
    antecessorId:   form.antecessorId,
    dataCriacao:    initialData?.dataCriacao ?? new Date().toISOString().slice(0, 10),
    usuarioCriacao: initialData?.usuarioCriacao ?? 'Silvio Ventura',
  })

  const doSave = () => {
    setSubmitting(true)
    setTimeout(() => {
      onSave(buildConta())
      show(isEdit ? 'Conta atualizada com sucesso!' : 'Conta cadastrada com sucesso!')
      setSubmitting(false)
    }, 800)
  }

  // ── Salvar ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (submitting) return
    if (!validate()) return

    // Avisa antes de inativar uma conta que ainda possui contas vinculadas —
    // elas continuam ativas, mas deixam de ter um agrupador ativo.
    if (isEdit && initialData!.ativo === 'sim' && form.ativo === 'nao' && descendentes.length > 0) {
      setConfirmInativar(true)
      return
    }

    doSave()
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={guard.guardedBack} icon={<ArrowLeft size={14} />} disabled={submitting}>
              Voltar
            </Button>
            {onCreateDescendant && (
              <Button variant="secondary" onClick={onCreateDescendant} icon={<GitBranchPlus size={14} />} disabled={submitting}>
                Criar Descendente
              </Button>
            )}
            <Button variant="primary" onClick={handleSave} icon={<Save size={14} />} loading={submitting} disabled={submitting}>
              {isEdit ? 'Salvar alterações' : 'Salvar'}
            </Button>
          </>
        }
      >

          <FormPageHeader
            title={isEdit ? `Editar — ${initialData!.descricao}` : 'Nova Conta'}
            subtitle={isEdit ? 'Atualize os dados da conta contábil' : 'Preencha os dados para criar uma conta no plano'}
            onBack={guard.guardedBack}
            paddingTop={t.space[4]}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: t.space[6] }}>

            {/* Linha 1: Código | Descrição */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16 }}>
              <FormField
                label="Código"
                required
                hint="Sugerido automaticamente a partir do antecessor — pode ser editado."
                placeholder={codigoSugerido}
                value={codigoValue}
                error={errors.codigo}
                onChange={e => setCodigoManual(e.target.value)}
              />
              <FormField
                label="Descrição"
                required
                placeholder="Ex.: Insumos Agrícolas"
                value={form.descricao}
                error={errors.descricao}
                onChange={e => set('descricao', e.target.value)}
              />
            </div>

            {/* Linha 2: Condição | Classe | Ativo | Tipo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
              <FormSelect
                label="Condição"
                required
                options={CONDICAO_OPTS}
                value={form.condicao}
                error={errors.condicao}
                onChange={e => set('condicao', e.target.value as CondicaoPC | '')}
              />
              <FormSelect
                label="Classe"
                required
                options={CLASSE_OPTS}
                value={form.classe}
                error={errors.classe}
                onChange={e => set('classe', e.target.value as ClassePC | '')}
              />
              <FormSelect
                label="Ativo"
                required
                options={ATIVO_OPTS}
                value={form.ativo}
                onChange={e => set('ativo', e.target.value as 'sim' | 'nao')}
              />
              <FormSelect
                label="Tipo"
                options={TIPO_OPTS}
                value={form.tipo}
                onChange={e => set('tipo', e.target.value as TipoPC | '')}
              />
            </div>

            {/* Linha 3: Antecessor */}
            <FormSelect
              label="Antecessor"
              hint="Disponível quando já existe ao menos uma conta Sintética ativa cadastrada. Normalmente usado por contas Analíticas para se encaixarem na árvore."
              options={antecessorOpts}
              value={form.antecessorId === null ? '' : String(form.antecessorId)}
              onChange={e => set('antecessorId', e.target.value === '' ? null : Number(e.target.value))}
              disabled={!antecessorHabilitado}
            />

            {isEdit && (
              <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
                Criado em {initialData!.dataCriacao} por {initialData!.usuarioCriacao}.
              </div>
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

      <ConfirmDialog
        open={confirmInativar}
        tone="default"
        title="Inativar conta com contas vinculadas?"
        message={`Esta conta possui ${descendentes.length} conta(s) vinculada(s). Elas permanecerão ativas, mas esta conta deixará de aceitar novos vínculos. Deseja continuar?`}
        confirmLabel="Inativar e salvar"
        onConfirm={() => { setConfirmInativar(false); doSave() }}
        onCancel={() => setConfirmInativar(false)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
