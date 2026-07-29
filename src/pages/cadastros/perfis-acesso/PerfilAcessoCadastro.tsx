import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard } from '../../../components/ui/PageCard'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { Button } from '../../../components/ui/Button'
import { FormField } from '../../../components/ui/FormField'
import { FormSection } from '../../../components/ui/FormSection'
import { ToggleSwitch } from '../../../components/ui/ToggleSwitch'
import { PermissionMatrixField } from '../../../components/ui/PermissionMatrixField'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { focusFirstError } from '../../../hooks/focusFirstError'
import { t } from '../../../design/tokens'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { ALL_LEAF_IDS, PERMISSION_CATALOG } from '../../../data/permissionsCatalog'
import type { PerfilAcesso } from './perfisAcesso.types'

interface PerfilAcessoCadastroProps {
  initialData?: PerfilAcesso
  allPerfis: PerfilAcesso[]
  onBack: () => void
  onSave: (perfil: PerfilAcesso) => void
}

interface FormData {
  nome: string
  descricao: string
  visivelAoUsuario: boolean
  permissoes: string[]
}

export default function PerfilAcessoCadastro({ initialData, allPerfis, onBack, onSave }: PerfilAcessoCadastroProps) {
  const isEdit = !!initialData

  const [form, setForm] = useState<FormData>(() =>
    initialData
      ? {
          nome: initialData.nome,
          descricao: initialData.descricao ?? '',
          visivelAoUsuario: initialData.visivelAoUsuario,
          // Sanitização defensiva contra drift entre o catálogo atual e permissões salvas.
          permissoes: initialData.permissoes.filter((id) => ALL_LEAF_IDS.has(id)),
        }
      : {
          nome: '',
          descricao: '',
          visivelAoUsuario: true,
          permissoes: [],
        },
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const { toasts, show, dismiss } = useToast()
  const guard = useUnsavedChangesGuard(onBack)
  // Compara contra o valor inicial capturado (não conta invocações do efeito)
  // — resistente ao double-invoke de efeitos do React StrictMode em dev, que
  // faria uma flag do tipo "isFirstRender" virar falso positivo de "sujo".
  const initialFormRef = useRef(form)

  useEffect(() => {
    if (form !== initialFormRef.current) {
      guard.setIsDirty(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateNome = (nome: string): string | undefined => {
    const v = nome.trim()
    if (!v) return 'Nome é obrigatório.'
    if (v.length < 3) return 'Mínimo 3 caracteres.'
    const duplicate = allPerfis.some(
      (p) => p.id !== (initialData?.id ?? '') && p.nome.trim().toLowerCase() === v.toLowerCase(),
    )
    if (duplicate) return 'Já existe um perfil com esse nome.'
  }

  const handleSave = () => {
    if (submitting) return
    const nomeError = validateNome(form.nome)
    if (nomeError) {
      setErrors({ nome: nomeError })
      focusFirstError()
      show('Há campos pendentes — verifique os destaques em vermelho.', 'error')
      return
    }

    const perfil: PerfilAcesso = {
      id: initialData?.id ?? '',
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      visivelAoUsuario: form.visivelAoUsuario,
      permissoes: form.permissoes,
      usuariosVinculados: initialData?.usuariosVinculados ?? 0,
    }

    setSubmitting(true)
    setTimeout(() => {
      onSave(perfil)
      show(isEdit ? 'Perfil atualizado com sucesso!' : 'Perfil cadastrado com sucesso!')
      setSubmitting(false)
    }, 800)
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={guard.guardedBack} icon={<ArrowLeft size={14} />} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave} icon={<Save size={14} />} loading={submitting} disabled={submitting}>
              Salvar
            </Button>
          </>
        }
      >
        <FormPageHeader
          title={isEdit ? `Editar Perfil — ${initialData!.nome}` : 'Novo Perfil'}
          subtitle={isEdit ? 'Atualize os dados e permissões do perfil' : 'Defina os dados e as permissões do novo perfil'}
          onBack={guard.guardedBack}
          paddingTop={t.space[4]}
        />

        <FormSection title="Dados do perfil" columns={2} responsive>
          <FormField
            label="Nome"
            required
            maxLength={70}
            placeholder="Ex.: Agri_Advanced"
            value={form.nome}
            onChange={(e) => set('nome', e.target.value)}
            error={errors.nome}
            disabled={submitting}
          />
          <FormField
            label="Descrição"
            placeholder="Ex.: Agricultura Advanced"
            value={form.descricao}
            onChange={(e) => set('descricao', e.target.value)}
            disabled={submitting}
          />
          <ToggleSwitch
            checked={form.visivelAoUsuario}
            onChange={(v) => set('visivelAoUsuario', v)}
            label="Visível ao usuário"
            disabled={submitting}
          />
        </FormSection>

        <FormSection
          title="Permissões"
          subtitle="Selecione as permissões do perfil. Um quadrado verde com traço indica que apenas parte daquele módulo está selecionada."
          divider={false}
        >
          <PermissionMatrixField tree={PERMISSION_CATALOG} selected={form.permissoes} onChange={(perms) => set('permissoes', perms)} />
        </FormSection>
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
