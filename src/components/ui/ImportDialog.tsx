import { type ReactNode, useEffect, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { Button } from './Button'
import { FeedbackBanner } from './FeedbackBanner'
import { FileUpload, type UploadedFile } from './FileUpload'
import { Modal } from './Modal'
import { t } from '../../design/tokens'

export interface ImportValidationIssue {
  line?: number
  message: string
}

interface ImportDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  accept: string
  maxSizeMb?: number
  templateLabel?: string
  onDownloadTemplate?: () => void
  onImport: (file: File) => Promise<ImportValidationIssue[] | void>
  children?: ReactNode
}

/** Fluxo padrão modelo → seleção → validação → importação. */
export function ImportDialog({
  open,
  onClose,
  title = 'Importar arquivo',
  description = 'Use o modelo para garantir que as colunas estejam no formato esperado.',
  accept,
  maxSizeMb = 10,
  templateLabel = 'Baixar modelo',
  onDownloadTemplate,
  onImport,
  children,
}: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [issues, setIssues] = useState<ImportValidationIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) {
      setFile(null)
      setIssues([])
      setLoading(false)
      setDone(false)
    }
  }, [open])

  const displayedFiles: UploadedFile[] = file ? [{ id: 'selected', name: file.name, size: file.size, status: done ? 'done' : issues.length ? 'error' : 'idle' }] : []

  const submit = async () => {
    if (!file) return
    setLoading(true)
    setIssues([])
    setDone(false)
    try {
      const result = await onImport(file)
      const validationIssues = result ?? []
      setIssues(validationIssues)
      setDone(validationIssues.length === 0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={description}
      size="lg"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
          <Button icon={<Upload size={16} />} loading={loading} disabled={!file || done} onClick={submit}>Importar arquivo</Button>
        </>
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4] }}>
        {onDownloadTemplate && (
          <div><Button variant="ghost" icon={<Download size={16} />} onClick={onDownloadTemplate}>{templateLabel}</Button></div>
        )}
        {children}
        <FileUpload
          label="Arquivo para importação"
          hint={`Formatos aceitos: ${accept}`}
          accept={accept}
          maxSizeMb={maxSizeMb}
          files={displayedFiles}
          disabled={loading}
          onFilesAdded={(files) => { setFile(files[0] ?? null); setIssues([]); setDone(false) }}
          onRemove={() => { setFile(null); setIssues([]); setDone(false) }}
        />
        {done && <FeedbackBanner variant="success" title="Arquivo validado e importado" description="Os dados já estão disponíveis na listagem." />}
        {issues.length > 0 && (
          <FeedbackBanner
            variant="error"
            title={`${issues.length} inconsistência${issues.length === 1 ? '' : 's'} encontrada${issues.length === 1 ? '' : 's'}`}
            description={(
              <ul>
                {issues.slice(0, 5).map((issue, index) => <li key={`${issue.line ?? 'file'}-${index}`}>{issue.line ? `Linha ${issue.line}: ` : ''}{issue.message}</li>)}
              </ul>
            )}
          />
        )}
      </div>
    </Modal>
  )
}
