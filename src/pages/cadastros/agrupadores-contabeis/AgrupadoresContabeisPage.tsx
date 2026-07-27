import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { FormField } from '../../../components/ui/FormField'
import { FormSection } from '../../../components/ui/FormSection'
import { FormSelect } from '../../../components/ui/FormSelect'
import { Modal } from '../../../components/ui/Modal'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageHeader } from '../../../components/ui/PageHeader'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { TreeView, type TreeNode } from '../../../components/ui/TreeView'
import {
  gerarCodigo, antecessorLabel, getAllDescendantAgrupadorIds, classeOf, CLASSE_LABEL, ATIVO_OPTS,
  type AgrupadorContabil,
} from './agrupadoresContabeis.types'

const INITIAL_ITEMS: AgrupadorContabil[] = [
  { id: 1, codigo: '1',     nome: 'Ativo',                       ativo: 'sim', antecessorId: null },
  { id: 2, codigo: '1.1',   nome: 'Ativo circulante',            ativo: 'sim', antecessorId: 1 },
  { id: 3, codigo: '1.1.1', nome: 'Disponibilidades',            ativo: 'sim', antecessorId: 2 },
  { id: 4, codigo: '1.1.2', nome: 'Contas a receber',            ativo: 'sim', antecessorId: 2 },
  { id: 5, codigo: '2',     nome: 'Passivo',                     ativo: 'sim', antecessorId: null },
  { id: 6, codigo: '2.1',   nome: 'Obrigações de curto prazo',   ativo: 'sim', antecessorId: 5 },
]

function buildTree(items: AgrupadorContabil[], parentId: number | null = null): TreeNode[] {
  return items
    .filter((item) => item.antecessorId === parentId)
    .map((item) => ({
      id: String(item.id),
      label: `${item.codigo} · ${item.nome}`,
      description: `${CLASSE_LABEL[classeOf(item.id, items)]} · ${item.ativo === 'sim' ? 'Ativo' : 'Inativo'}`,
      children: buildTree(items, item.id),
    }))
}

interface FormData {
  nome:         string
  ativo:        'sim' | 'nao'
  antecessorId: number | null
}

export default function AgrupadoresContabeisPage() {
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [editing, setEditing] = useState<AgrupadorContabil | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TreeNode | null>(null)
  const [form, setForm] = useState<FormData>({ nome: '', ativo: 'sim', antecessorId: null })
  const [codigoManual, setCodigoManual] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toasts, show, dismiss } = useToast()

  const isEdit = editing !== null

  // Ids a excluir da lista de antecessores: o próprio item (em edição) e seus
  // descendentes — evita ciclo na hierarquia (mesmo padrão de Plano de Contas /
  // Centro de Custo, ver getAllDescendantAgrupadorIds).
  const excludedIds = new Set<number>(
    editing ? [editing.id, ...getAllDescendantAgrupadorIds(items, editing.id)] : []
  )

  const antecessorOpts = [
    { value: '', label: 'Nenhum (Agrupador Raiz)' },
    ...items.filter((item) => !excludedIds.has(item.id)).map((item) => ({ value: String(item.id), label: antecessorLabel(item) })),
  ]

  const codigoSugerido = gerarCodigo(form.antecessorId, editing ? items.filter((item) => item.id !== editing.id) : items)
  const codigoValue = codigoManual ?? codigoSugerido

  const openEditor = (parentId: number | null) => {
    setEditing(null)
    setForm({ nome: '', ativo: 'sim', antecessorId: parentId })
    setCodigoManual(null)
    setErrors({})
    setEditorOpen(true)
  }

  const openEditorFor = (node: TreeNode) => {
    const item = items.find((current) => String(current.id) === node.id)
    if (!item) return
    setEditing(item)
    setForm({ nome: item.nome, ativo: item.ativo, antecessorId: item.antecessorId })
    setCodigoManual(item.codigo)
    setErrors({})
    setEditorOpen(true)
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.nome.trim()) errs.nome = 'Nome é obrigatório.'
    if (!codigoValue.trim()) errs.codigo = 'Código é obrigatório.'
    else if (items.some((item) => item.id !== editing?.id && item.codigo.trim() === codigoValue.trim())) {
      errs.codigo = 'Já existe um agrupador com este código.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const save = () => {
    if (!validate()) return
    if (editing) {
      setItems((current) => current.map((item) => item.id === editing.id
        ? { ...item, nome: form.nome.trim(), ativo: form.ativo, antecessorId: form.antecessorId, codigo: codigoValue.trim() }
        : item))
      show('Agrupador atualizado com sucesso.')
    } else {
      const nextId = Math.max(0, ...items.map((item) => item.id)) + 1
      setItems((current) => [...current, {
        id: nextId, codigo: codigoValue.trim(), nome: form.nome.trim(), ativo: form.ativo, antecessorId: form.antecessorId,
      }])
      show(form.antecessorId !== null ? 'Descendente criado com sucesso.' : 'Agrupador criado com sucesso.')
    }
    setEditorOpen(false)
  }

  const nodes = buildTree(items)

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader title="Agrupadores Contábeis" description="Organize a estrutura contábil em níveis sintéticos e analíticos." actions={<Button icon={<Plus size={16} />} onClick={() => openEditor(null)}>Novo Agrupador</Button>} />
        <TreeView
          nodes={nodes}
          maxDepth={4}
          onAddChild={(node) => openEditor(Number(node.id))}
          onEdit={openEditorFor}
          onDelete={setDeleteTarget}
          onSelect={(node) => show(`${node.label} selecionado.`, 'info')}
        />
      </PageCard>

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={isEdit ? 'Editar Agrupador' : 'Novo Agrupador'}
        subtitle={isEdit ? 'Atualize os dados do agrupador contábil.' : 'Crie um agrupador contábil e, se necessário, selecione um antecessor.'}
        size="lg"
        footer={<><Button variant="secondary" onClick={() => setEditorOpen(false)}>Cancelar</Button><Button disabled={!form.nome.trim()} onClick={save}>Salvar Agrupador</Button></>}
      >
        <FormSection title="Informações gerais" columns={2}>
          <FormField
            label="Código"
            required
            hint="Sugerido automaticamente a partir do antecessor — pode ser editado."
            placeholder={codigoSugerido}
            value={codigoValue}
            error={errors.codigo}
            onChange={(event) => setCodigoManual(event.target.value)}
          />
          <FormField label="Nome" required maxLength={60} value={form.nome} error={errors.nome} onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))} />
          <FormSelect
            label="Antecessor"
            hint="Define a posição do agrupador na hierarquia. Não é possível selecionar o próprio agrupador ou um descendente."
            options={antecessorOpts}
            value={form.antecessorId === null ? '' : String(form.antecessorId)}
            onChange={(event) => setForm((prev) => ({ ...prev, antecessorId: event.target.value === '' ? null : Number(event.target.value) }))}
          />
          <FormSelect label="Ativo" required options={ATIVO_OPTS} value={form.ativo} onChange={(event) => setForm((prev) => ({ ...prev, ativo: event.target.value as 'sim' | 'nao' }))} />
        </FormSection>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          setItems((current) => current.filter((item) => item.id !== Number(deleteTarget.id)))
          setDeleteTarget(null)
          show('Agrupador excluído com sucesso.')
        }}
        title="Excluir agrupador contábil?"
        message="Somente agrupadores sem descendentes podem ser excluídos."
        confirmLabel="Excluir Agrupador"
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
