import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageHeader } from '../../../components/ui/PageHeader'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { TreeView, type TreeNode } from '../../../components/ui/TreeView'
import {
  classeOf, CLASSE_LABEL,
  type AgrupadorContabil,
} from './agrupadoresContabeis.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface AgrupadoresContabeisListaProps {
  items:    AgrupadorContabil[]
  onNew:    (parentId: number | null) => void
  onEdit:   (item: AgrupadorContabil) => void
  onDelete: (id: number) => void
}

// ─── Árvore ───────────────────────────────────────────────────────────────────

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

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AgrupadoresContabeisLista({
  items, onNew, onEdit, onDelete,
}: AgrupadoresContabeisListaProps) {
  const [deleteTarget, setDeleteTarget] = useState<TreeNode | null>(null)
  const { toasts, show, dismiss } = useToast()

  const nodes = buildTree(items)

  const openEditorFor = (node: TreeNode) => {
    const item = items.find((current) => String(current.id) === node.id)
    if (item) onEdit(item)
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader
          title="Agrupadores Contábeis"
          description="Organize a estrutura contábil em níveis sintéticos e analíticos."
          actions={<Button icon={<Plus size={16} />} onClick={() => onNew(null)}>Novo Agrupador</Button>}
        />
        <TreeView
          nodes={nodes}
          maxDepth={4}
          onAddChild={(node) => onNew(Number(node.id))}
          onEdit={openEditorFor}
          onDelete={setDeleteTarget}
          onSelect={(node) => show(`${node.label} selecionado.`, 'info')}
        />
      </PageCard>

      {/* ── ConfirmDialog: Excluir ───────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          onDelete(Number(deleteTarget.id))
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
