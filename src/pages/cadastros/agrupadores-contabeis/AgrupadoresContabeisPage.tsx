import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { FormField } from '../../../components/ui/FormField'
import { FormSection } from '../../../components/ui/FormSection'
import { FormSelect } from '../../../components/ui/FormSelect'
import { Modal } from '../../../components/ui/Modal'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageHeader } from '../../../components/ui/PageHeader'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { TreeView, type TreeNode } from '../../../components/ui/TreeView'

const INITIAL_TREE: TreeNode[] = [
  {
    id: '1', label: '1 · Ativo', description: 'Sintético · Ativo', children: [
      {
        id: '1.1', label: '1.1 · Ativo circulante', description: 'Sintético · Ativo', children: [
          { id: '1.1.1', label: '1.1.1 · Disponibilidades', description: 'Analítico · Ativo' },
          { id: '1.1.2', label: '1.1.2 · Contas a receber', description: 'Analítico · Ativo' },
        ],
      },
    ],
  },
  {
    id: '2', label: '2 · Passivo', description: 'Sintético · Ativo', children: [
      { id: '2.1', label: '2.1 · Obrigações de curto prazo', description: 'Analítico · Ativo' },
    ],
  },
]

function appendChild(nodes: TreeNode[], parentId: string | null, child: TreeNode): TreeNode[] {
  if (parentId === null) return [...nodes, child]
  return nodes.map((node) => node.id === parentId
    ? { ...node, children: [...(node.children ?? []), child] }
    : { ...node, children: node.children ? appendChild(node.children, parentId, child) : undefined })
}

function removeNode(nodes: TreeNode[], id: string): TreeNode[] {
  return nodes.filter((node) => node.id !== id).map((node) => ({ ...node, children: node.children ? removeNode(node.children, id) : undefined }))
}

export default function AgrupadoresContabeisPage() {
  const [nodes, setNodes] = useState(INITIAL_TREE)
  const [parent, setParent] = useState<TreeNode | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TreeNode | null>(null)
  const [name, setName] = useState('')
  const [order, setOrder] = useState('1')
  const [enabled, setEnabled] = useState('yes')
  const { toasts, show, dismiss } = useToast()

  const openEditor = (parentNode: TreeNode | null) => {
    setParent(parentNode)
    setName('')
    setOrder('1')
    setEnabled('yes')
    setEditorOpen(true)
  }

  const save = () => {
    if (!name.trim()) return
    const prefix = parent?.id ? `${parent.id}.${(parent.children?.length ?? 0) + 1}` : String(nodes.length + 1)
    setNodes((current) => appendChild(current, parent?.id ?? null, { id: prefix, label: `${prefix} · ${name.trim()}`, description: `Analítico · ${enabled === 'yes' ? 'Ativo' : 'Inativo'}` }))
    setEditorOpen(false)
    show(parent ? 'Descendente criado com sucesso.' : 'Agrupador criado com sucesso.')
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader title="Agrupadores Contábeis" description="Organize a estrutura contábil em níveis sintéticos e analíticos." actions={<Button icon={<Plus size={16} />} onClick={() => openEditor(null)}>Novo Agrupador</Button>} />
        <TreeView
          nodes={nodes}
          maxDepth={4}
          onAddChild={(node) => openEditor(node)}
          onDelete={setDeleteTarget}
          onSelect={(node) => show(`${node.label} selecionado.`, 'info')}
        />
      </PageCard>

      <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title={parent ? 'Criar Descendente' : 'Novo Agrupador'} subtitle={parent ? `O novo nível ficará abaixo de ${parent.label}.` : 'Crie um agrupador no primeiro nível.'} size="lg" footer={<><Button variant="secondary" onClick={() => setEditorOpen(false)}>Cancelar</Button><Button disabled={!name.trim()} onClick={save}>Salvar Agrupador</Button></>}>
        {parent && <DetailGrid items={[{ label: 'Antecessor', value: parent.label }]} columns={1} />}
        <FormSection title="Informações gerais" columns={2}>
          <FormField label="Nome" required maxLength={60} value={name} onChange={(event) => setName(event.target.value)} />
          <FormField label="Ordem" type="number" required min={1} value={order} onChange={(event) => setOrder(event.target.value)} />
          <FormSelect label="Ativo" required value={enabled} onChange={(event) => setEnabled(event.target.value)} options={[{ value: 'yes', label: 'Sim' }, { value: 'no', label: 'Não' }]} />
        </FormSection>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          setNodes((current) => removeNode(current, deleteTarget.id))
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
