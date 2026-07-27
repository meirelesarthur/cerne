import { useState } from 'react'
import { Download, Trash2, Upload } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { CrudPattern } from '../../../components/ui/CrudPattern'
import { FeedbackBanner } from '../../../components/ui/FeedbackBanner'
import { ImportDialog } from '../../../components/ui/ImportDialog'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { TypedConfirmDialog } from '../../../components/ui/TypedConfirmDialog'
import { downloadAnimaisModelo, parseAnimaisCsv, type Animal } from './animais.io'

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
        description="Baixe o modelo, preencha e envie a planilha para cadastrar ou atualizar o rebanho."
        accept=".csv"
        onDownloadTemplate={() => { downloadAnimaisModelo(animals); show('Modelo de importação baixado.', 'info') }}
        onImport={(file) => new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = parseAnimaisCsv(String(reader.result ?? ''), animals)
            if (result.erros.length > 0) {
              resolve(result.erros)
              return
            }
            setAnimals(result.animais)
            const partes = [
              result.criados > 0 ? `${result.criados} animal${result.criados === 1 ? '' : 'is'} cadastrado${result.criados === 1 ? '' : 's'}` : null,
              result.atualizados > 0 ? `${result.atualizados} atualizado${result.atualizados === 1 ? '' : 's'}` : null,
            ].filter(Boolean)
            show(partes.length > 0 ? `Importação concluída: ${partes.join(' e ')}.` : 'Importação concluída — nenhuma alteração.', 'success')
            resolve([])
          }
          reader.onerror = () => resolve([{ message: 'Não foi possível ler o arquivo — tente novamente.' }])
          reader.readAsText(file, 'utf-8')
        })}
      >
        <FeedbackBanner
          variant="info"
          title="Como funciona a importação"
          description="Animais com identificação já cadastrada são atualizados; identificações novas são adicionadas. Nenhum animal existente é removido — use “Excluir tudo…” ou a exclusão individual para isso."
        />
      </ImportDialog>

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
