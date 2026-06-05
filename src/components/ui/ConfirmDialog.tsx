import { AlertTriangle, Info } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Modal } from './Modal'
import { Button } from './Button'

type ConfirmTone = 'destructive' | 'default'

interface ConfirmDialogProps {
  open:          boolean
  onConfirm:     () => void
  onCancel:      () => void
  title:         string
  message?:      string
  tone?:         ConfirmTone
  confirmLabel?: string
  cancelLabel?:  string
  loading?:      boolean
}

/**
 * Diálogo de confirmação para ações destrutivas ou que exigem consentimento
 * explícito. Compõe sobre o `Modal` e usa `Button` variant `destructive`.
 * Substitui os modais de exclusão recriados inline nas telas de listagem.
 */
export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  tone         = 'destructive',
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  loading      = false,
}: ConfirmDialogProps) {
  const { colors } = useTheme()
  const isDestructive = tone === 'destructive'
  const accent = isDestructive ? t.color.error : t.color.info
  const Icon = isDestructive ? AlertTriangle : Info

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      closeOnOverlay={!loading}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: t.space[3], alignItems: 'flex-start' }}>
        <div
          aria-hidden="true"
          style={{
            flexShrink:     0,
            width:          t.space[10],
            height:         t.space[10],
            borderRadius:   t.radius.full,
            background:     accent.bg,
            color:          accent.solid,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h2
            style={{
              margin:     0,
              fontSize:   t.font.size.md,
              fontWeight: t.font.weight.semibold,
              color:      colors.textPrimary,
              fontFamily: t.font.family.sans,
              lineHeight: t.font.lineHeight.snug,
            }}
          >
            {title}
          </h2>
          {message && (
            <p
              style={{
                margin:     `${t.space[2]}px 0 0`,
                fontSize:   t.font.size.base,
                color:      colors.textMuted,
                fontFamily: t.font.family.sans,
                lineHeight: t.font.lineHeight.normal,
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}
