import { useState, useEffect, useRef } from 'react'
import { Save } from 'lucide-react'
import { PageContainer }  from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { Button }         from '../../../components/ui/Button'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormField }     from '../../../components/ui/FormField'
import { FormSelect }    from '../../../components/ui/FormSelect'
import { ToggleSwitch }  from '../../../components/ui/ToggleSwitch'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { t }             from '../../../design/tokens'
import { useTheme }      from '../../../context/ThemeContext'
import {
  TIPO_ARMAZEM_OPTS, generateNextSigla,
  type Armazem, type TipoArmazem,
} from './armazens.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialData?:      Armazem
  existingArmazens:  Armazem[]
  onBack:  () => void
  onSave:  (a: Armazem) => void
}

// ─── Validação ────────────────────────────────────────────────────────────────

function validateSigla(v: string, existingArmazens: Armazem[], editId?: number): string | undefined {
  const s = v.trim().toUpperCase()
  if (!s) return 'Sigla é obrigatória.'
  if (s.length < 2) return 'Mínimo 2 caracteres.'
  if (s.length > 10) return 'Máximo 10 caracteres.'
  const duplicate = existingArmazens.find(a => a.sigla.toUpperCase() === s && a.id !== (editId ?? -1))
  if (duplicate) return `Sigla "${s}" já está em uso.`
}

function validateDescricao(v: string): string | undefined {
  const s = v.trim()
  if (!s) return 'Descrição é obrigatória.'
  if (s.length < 2) return 'Mínimo 2 caracteres.'
  if (s.length > 80) return 'Máximo 80 caracteres.'
}

function validateTipo(v: string): string | undefined {
  if (!v) return 'Selecione o tipo de armazém.'
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ArmazemForm({ initialData, existingArmazens, onBack, onSave }: Props) {
  const { colors } = useTheme()
  const isEdit = Boolean(initialData)

  const [sigla,      setSigla]      = useState(initialData?.sigla ?? generateNextSigla(existingArmazens))
  const [descricao,  setDescricao]  = useState(initialData?.descricao ?? '')
  const [tipo,       setTipo]       = useState<TipoArmazem | ''>(initialData?.tipo ?? '')
  const [ativo,      setAtivo]      = useState(initialData?.ativo ?? true)
  const [touched,    setTouched]    = useState({ sigla: false, descricao: false, tipo: false })
  const [submitting, setSubmitting] = useState(false)

  const guard = useUnsavedChangesGuard(onBack)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    guard.setIsDirty(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sigla, descricao, tipo, ativo])

  const errSigla     = touched.sigla     ? validateSigla(sigla, existingArmazens, initialData?.id)  : undefined
  const errDescricao = touched.descricao ? validateDescricao(descricao) : undefined
  const errTipo      = touched.tipo      ? validateTipo(tipo)           : undefined

  const isValid =
    !validateSigla(sigla, existingArmazens, initialData?.id) &&
    !validateDescricao(descricao) &&
    !validateTipo(tipo)

  const handleSubmit = () => {
    setTouched({ sigla: true, descricao: true, tipo: true })
    if (!isValid) return

    setSubmitting(true)
    const payload: Armazem = {
      id:        initialData?.id ?? 0,
      sigla:     sigla.trim().toUpperCase(),
      descricao: descricao.trim(),
      tipo:      tipo as TipoArmazem,
      ativo,
    }
    setTimeout(() => {
      onSave(payload)
      setSubmitting(false)
    }, 150)
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={guard.guardedBack} disabled={submitting}>Cancelar</Button>
            <Button variant="primary" icon={<Save size={13} />} onClick={handleSubmit} loading={submitting} disabled={!isValid || submitting}>
              Salvar Armazém
            </Button>
          </>
        }
      >

        {/* Header */}
        <FormPageHeader
          title={isEdit ? 'Editar Armazém' : 'Novo Armazém'}
          subtitle={isEdit ? `Editando: ${initialData!.sigla} — ${initialData!.descricao}` : 'Preencha os campos abaixo para cadastrar.'}
          onBack={guard.guardedBack}
          paddingTop={t.space[4]}
        />

        {/* Campos */}
        <div style={{ maxWidth: 600 }}>

          {/* Sigla + Tipo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: t.space[4], marginBottom: t.space[5] }}>
            <FormField
              label="Sigla"
              required
              placeholder="Ex: AZM01"
              value={sigla}
              onChange={e => setSigla(e.target.value.toUpperCase())}
              onBlur={() => setTouched(p => ({ ...p, sigla: true }))}
              error={errSigla}
              status={errSigla ? 'err' : touched.sigla && !validateSigla(sigla, existingArmazens, initialData?.id) ? 'ok' : 'idle'}
              disabled={submitting}
            />
            <FormSelect
              label="Tipo"
              required
              value={tipo}
              onChange={e => {
                setTipo(e.target.value as TipoArmazem | '')
                setTouched(p => ({ ...p, tipo: true }))
              }}
              onBlur={() => setTouched(p => ({ ...p, tipo: true }))}
              options={[{ value: '', label: 'Selecione...' }, ...TIPO_ARMAZEM_OPTS]}
              error={errTipo}
              disabled={submitting}
            />
          </div>

          {/* Descrição */}
          <div style={{ marginBottom: t.space[5] }}>
            <FormField
              label="Descrição"
              required
              placeholder="Ex: Armazém Principal de Insumos"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              onBlur={() => setTouched(p => ({ ...p, descricao: true }))}
              error={errDescricao}
              status={errDescricao ? 'err' : touched.descricao && !validateDescricao(descricao) ? 'ok' : 'idle'}
              disabled={submitting}
            />
          </div>

          {/* Ativo */}
          <div style={{ marginBottom: t.space[6], display: 'flex', alignItems: 'center', gap: t.space[3], padding: `${t.space[3]}px ${t.space[4]}px`, background: colors.bg.subtle, borderRadius: t.radius.base, border: `1px solid ${colors.border.default}` }}>
            <ToggleSwitch checked={ativo} onChange={setAtivo} disabled={submitting} />
            <div>
              <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.fg.default, fontFamily: t.font.family.sans }}>
                Armazém ativo
              </div>
              <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
                {ativo ? 'Disponível para movimentações de estoque.' : 'Indisponível para novas movimentações.'}
              </div>
            </div>
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
    </PageContainer>
  )
}
