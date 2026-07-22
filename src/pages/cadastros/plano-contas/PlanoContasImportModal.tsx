import { useState } from 'react'
import { Download, Upload, AlertTriangle } from 'lucide-react'
import { Modal }      from '../../../components/ui/Modal'
import { Button }     from '../../../components/ui/Button'
import { FileUpload, type UploadedFile } from '../../../components/ui/FileUpload'
import { t }          from '../../../design/tokens'
import { useTheme }   from '../../../context/ThemeContext'
import { downloadPlanoContasModelo, parsePlanoContasCsv, type ImportResult } from './planoContas.io'
import type { Conta } from './planoContas.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlanoContasImportModalProps {
  open:     boolean
  contas:   Conta[]
  onClose:  () => void
  onImport: (result: ImportResult) => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function PlanoContasImportModal({ open, contas, onClose, onImport }: PlanoContasImportModalProps) {
  const { colors } = useTheme()
  const [downloaded, setDownloaded] = useState(false)
  const [files, setFiles]         = useState<UploadedFile[]>([])
  const [rawFile, setRawFile]     = useState<File | null>(null)
  const [erros, setErros]         = useState<string[]>([])
  const [processing, setProcessing] = useState(false)

  const reset = () => {
    setDownloaded(false)
    setFiles([])
    setRawFile(null)
    setErros([])
    setProcessing(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleDownload = () => {
    downloadPlanoContasModelo(contas)
    setDownloaded(true)
  }

  const handleFilesAdded = (added: File[]) => {
    const file = added[0]
    setRawFile(file)
    setFiles([{ id: 'planilha', name: file.name, size: file.size, status: 'done' }])
    setErros([])
  }

  const handleRemoveFile = () => {
    setRawFile(null)
    setFiles([])
    setErros([])
  }

  const handleImportSubmit = () => {
    if (!rawFile) return
    setProcessing(true)
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      const result = parsePlanoContasCsv(text, contas)
      setProcessing(false)
      if (result.erros.length > 0) {
        setErros(result.erros)
        return
      }
      onImport(result)
      reset()
      onClose()
    }
    reader.onerror = () => {
      setProcessing(false)
      setErros(['Não foi possível ler o arquivo — tente novamente.'])
    }
    reader.readAsText(rawFile, 'utf-8')
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="lg"
      title="Importar Plano de Contas"
      subtitle="Baixe o modelo, preencha e envie a planilha para sincronizar o plano de contas."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={handleClose} disabled={processing}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Upload size={14} />}
            onClick={handleImportSubmit}
            loading={processing}
            disabled={!rawFile || processing}
          >
            Importar
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4] }}>

        {/* ── Download do modelo ───────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.space[3] }}>
          <p style={{ margin: 0, fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans, lineHeight: t.font.lineHeight.relaxed }}>
            {contas.length > 0
              ? 'Baixe a planilha com as contas atualmente cadastradas para usar como base.'
              : 'Ainda não há contas cadastradas. Baixe a planilha modelo para começar.'}
          </p>
          <Button variant="secondary" size="md" icon={<Download size={14} />} onClick={handleDownload} style={{ flexShrink: 0 }}>
            Download
          </Button>
        </div>
        {downloaded && (
          <p style={{ margin: 0, marginTop: -t.space[2], fontSize: t.font.size.xs, color: t.color.feedback.success.text, fontFamily: t.font.family.sans }}>
            Planilha baixada.
          </p>
        )}

        {/* ── Instruções de preenchimento ──────────────────────────────── */}
        <p style={{ margin: 0, fontSize: t.font.size.sm, color: colors.fg.default, fontFamily: t.font.family.sans, lineHeight: t.font.lineHeight.relaxed }}>
          As colunas <strong style={{ color: t.color.feedback.error.text }}>Código, Descrição, Condição e Classe</strong>{' '}
          são obrigatórias em cada linha. Para vincular uma conta a uma conta-pai, preencha a coluna{' '}
          <strong>Código Pai</strong> com o código já usado em outra linha da planilha.
        </p>

        {/* ── Aviso de sincronização destrutiva ────────────────────────── */}
        <div style={{
          background:   t.color.feedback.warning.bg,
          border:       `1px solid ${t.color.feedback.warning.border}`,
          borderRadius: t.radius.lg,
          padding:      t.space[4],
          display:      'flex',
          alignItems:   'flex-start',
          gap:          t.space[3],
        }}>
          <AlertTriangle size={18} color={t.color.feedback.warning.text} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: t.color.feedback.warning.text, fontFamily: t.font.family.sans, marginBottom: 4 }}>
              Esta importação substitui todo o plano de contas.
            </div>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.muted, fontFamily: t.font.family.sans, lineHeight: t.font.lineHeight.relaxed }}>
              Qualquer conta cadastrada que não estiver presente na planilha enviada será excluída do sistema. Para manter uma conta existente, ela deve permanecer na planilha.
            </div>
          </div>
        </div>

        {/* ── Upload ────────────────────────────────────────────────────── */}
        <FileUpload
          label="Planilha preenchida"
          hint="Envie o arquivo .csv exportado ou preenchido a partir do modelo."
          accept=".csv"
          files={files}
          onFilesAdded={handleFilesAdded}
          onRemove={handleRemoveFile}
          disabled={processing}
        />

        {erros.length > 0 && (
          <div style={{
            background:   t.color.feedback.error.bg,
            border:       `1px solid ${t.color.feedback.error.border}`,
            borderRadius: t.radius.lg,
            padding:      t.space[4],
            display:      'flex',
            flexDirection: 'column',
            gap:          t.space[2],
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
              <AlertTriangle size={16} color={t.color.feedback.error.text} />
              <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: t.color.feedback.error.text, fontFamily: t.font.family.sans }}>
                Não foi possível importar — corrija e envie novamente
              </span>
            </div>
            <ul style={{ margin: 0, padding: `0 0 0 ${t.space[5]}px`, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {erros.map((e, i) => (
                <li key={i} style={{ fontSize: t.font.size.xs, color: colors.fg.muted, fontFamily: t.font.family.sans }}>{e}</li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </Modal>
  )
}
