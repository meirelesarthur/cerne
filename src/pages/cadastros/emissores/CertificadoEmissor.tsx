import { useState } from 'react'
import { ArrowLeft, Save, ShieldAlert, ShieldCheck } from 'lucide-react'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { Button }        from '../../../components/ui/Button'
import { FormField }     from '../../../components/ui/FormField'
import { FileUpload, type UploadedFile } from '../../../components/ui/FileUpload'
import { t }             from '../../../design/tokens'
import { useTheme }      from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { certificadoStatus, fmtISOtoDMY, type Emissor, type CertificadoInfo } from './emissores.types'

interface CertificadoEmissorProps {
  emissor: Emissor
  today:   string
  onBack:  () => void
  onSave:  (certificado: CertificadoInfo) => void
}

export default function CertificadoEmissor({ emissor, today, onBack, onSave }: CertificadoEmissorProps) {
  const { colors } = useTheme()
  const { toasts, show, dismiss } = useToast()

  const [files, setFiles] = useState<UploadedFile[]>([])
  const [senha, setSenha] = useState('')
  const [senhaError, setSenhaError] = useState('')
  const [preview, setPreview] = useState<CertificadoInfo | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const status = emissor.certificado ? certificadoStatus(emissor.certificado, today) : 'ausente'
  const naoPodeLer = status === 'expirado' || status === 'ausente'

  const handleFilesAdded = (added: File[]) => {
    const file = added[0]
    setFiles([{ id: 'cert', name: file.name, size: file.size, status: 'done' }])
    // Mock: sem parsing real de X.509 no cliente — simula extração de CN/CNPJ/validade
    // a partir dos dados já cadastrados do emissor, para o usuário confirmar antes de salvar.
    const validade = new Date(today)
    validade.setFullYear(validade.getFullYear() + 1)
    setPreview({
      titular: emissor.razaoSocial.toUpperCase(),
      documento: emissor.cpfCnpj,
      validade: validade.toISOString().slice(0, 10),
      arquivoNome: file.name,
    })
  }

  const handleRemove = () => {
    setFiles([])
    setPreview(null)
  }

  const handleSave = () => {
    if (!preview) return
    if (!senha.trim()) { setSenhaError('Senha é obrigatória.'); return }
    setSubmitting(true)
    setTimeout(() => {
      onSave(preview)
      show('Certificado configurado com sucesso!')
      setSubmitting(false)
    }, 800)
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={onBack} icon={<ArrowLeft size={14} />} disabled={submitting}>
              Voltar
            </Button>
            <Button variant="primary" onClick={handleSave} icon={<Save size={14} />} loading={submitting} disabled={submitting || !preview}>
              Salvar Certificado
            </Button>
          </>
        }
      >
        <FormPageHeader
          title={`Certificado — ${emissor.razaoSocial}`}
          subtitle="Configure o certificado digital A1 (.pfx/.p12) usado para assinar os documentos fiscais"
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: t.space[6] }}>

          {emissor.certificado && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '14px 16px', borderRadius: t.radius.lg,
              background: naoPodeLer ? t.color.feedback.error.bg : t.color.feedback.success.bg,
              border: `1px solid ${naoPodeLer ? t.color.feedback.error.border : t.color.feedback.success.border}`,
            }}>
              {naoPodeLer
                ? <ShieldAlert size={18} color={t.color.feedback.error.text} style={{ flexShrink: 0, marginTop: 2 }} />
                : <ShieldCheck size={18} color={t.color.feedback.success.text} style={{ flexShrink: 0, marginTop: 2 }} />}
              <div>
                <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: naoPodeLer ? t.color.feedback.error.text : t.color.feedback.success.text, fontFamily: t.font.family.sans }}>
                  {naoPodeLer ? 'Certificado atual não pode ser validado' : 'Certificado atual válido'}
                </div>
                <div style={{ fontSize: t.font.size.xs, color: colors.fg.muted, fontFamily: t.font.family.sans, marginTop: 2 }}>
                  {emissor.certificado.titular} · {emissor.certificado.documento} · válido até {fmtISOtoDMY(emissor.certificado.validade)}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.subtle, fontFamily: t.font.family.sans, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Configurar Novo Certificado
            </span>

            <FileUpload
              label="Arquivo (.pfx/.p12)"
              accept=".pfx,.p12"
              files={files}
              onFilesAdded={handleFilesAdded}
              onRemove={handleRemove}
            />

            <div style={{ maxWidth: 320 }}>
              <FormField
                label="Senha"
                required
                type="password"
                allowPasswordManager
                value={senha}
                error={senhaError}
                onChange={e => { setSenha(e.target.value); setSenhaError('') }}
              />
            </div>
          </div>

          {preview && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 8,
              padding: '14px 16px', borderRadius: t.radius.lg,
              background: t.color.feedback.info.bg, border: `1px solid ${t.color.feedback.info.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} color={t.color.feedback.info.text} />
                <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: t.color.feedback.info.text, fontFamily: t.font.family.sans }}>
                  Confirme os dados antes de salvar
                </span>
              </div>
              <div style={{ fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans }}>
                <div><strong>Titular (CN):</strong> {preview.titular}</div>
                <div><strong>CNPJ/CPF associado:</strong> {preview.documento}</div>
                <div><strong>Validade:</strong> {fmtISOtoDMY(preview.validade)}</div>
              </div>
            </div>
          )}

        </div>
      </PageCard>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
