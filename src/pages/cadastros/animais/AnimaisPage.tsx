import { useState } from 'react'
import { Download, Trash2, Upload } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { CrudPattern, type CrudEntity } from '../../../components/ui/CrudPattern'
import { ImportDialog } from '../../../components/ui/ImportDialog'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { TypedConfirmDialog } from '../../../components/ui/TypedConfirmDialog'

type Animal = CrudEntity & {
  tag: string
  category: string
  batch: string
  status: string
}

const INITIAL_ANIMALS: Animal[] = [
  { id: 'animal-1', tag: 'BR-2048', category: 'Novilha', batch: 'Recria 2026', status: 'Ativo' },
  { id: 'animal-2', tag: 'BR-2051', category: 'Vaca', batch: 'Matrizes', status: 'Ativo' },
  { id: 'animal-3', tag: 'BR-2060', category: 'Garrote', batch: 'Engorda 04', status: 'Em manejo' },
]

export default function AnimaisPage() {
  const [animals, setAnimals] = useState(INITIAL_ANIMALS)
  const [importOpen, setImportOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { toasts, show, dismiss } = useToast()

  return (
    <>
      <CrudPattern
        title="Animais"
        singular="Animal"
        description="Rebanho, lotes e situação operacional dos animais."
        records={animals}
        onRecordsChange={setAnimals}
        columns={[
          { key: 'tag', label: 'Identificação', width: 180 },
          { key: 'category', label: 'Categoria' },
          { key: 'batch', label: 'Lote' },
          { key: 'status', label: 'Status' },
        ]}
        fields={[
          { key: 'tag', label: 'Identificação', required: true, maxLength: 30 },
          { key: 'category', label: 'Categoria', required: true },
          { key: 'batch', label: 'Lote', required: true },
          { key: 'status', label: 'Status', required: true },
        ]}
        headerActions={(
          <>
            <Button variant="ghost" icon={<Upload size={16} />} onClick={() => setImportOpen(true)}>Importar</Button>
            <Button variant="secondary" icon={<Download size={16} />} onClick={() => show('Exportação XLS preparada com sucesso.')}>Exportar</Button>
            <Button variant="destructive" icon={<Trash2 size={16} />} onClick={() => setDeleteOpen(true)}>Excluir tudo…</Button>
          </>
        )}
      />

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Importar animais"
        accept=".xlsx,.xls"
        onDownloadTemplate={() => show('Modelo de importação baixado.', 'info')}
        onImport={async (file) => {
          await new Promise((resolve) => window.setTimeout(resolve, 500))
          if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
            return [{ message: 'Use uma planilha Excel no formato XLSX ou XLS.' }]
          }
          setAnimals((current) => [{ id: crypto.randomUUID(), tag: 'IMPORTADO', category: 'A revisar', batch: 'Sem lote', status: 'Pendente' }, ...current])
          return []
        }}
      />

      <TypedConfirmDialog
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => { setAnimals([]); setDeleteOpen(false); show('Todos os animais foram excluídos.', 'warning') }}
        title="Excluir todos os animais?"
        message="Todos os registros do rebanho atual serão removidos. Exporte uma cópia antes de continuar."
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
