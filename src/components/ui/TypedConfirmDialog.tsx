import { useEffect, useState } from 'react'
import { t } from '../../design/tokens'
import { Button } from './Button'
import { FeedbackBanner } from './FeedbackBanner'
import { FormField } from './FormField'
import { Modal } from './Modal'

interface TypedConfirmDialogProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmationText?: string
  confirmLabel?: string
  loading?: boolean
}

/** Confirmação reforçada para ações destrutivas em massa. */
export function TypedConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  message,
  confirmationText = 'APAGAR',
  confirmLabel = 'Excluir definitivamente',
  loading = false,
}: TypedConfirmDialogProps) {
  const [value, setValue] = useState('')
  useEffect(() => { if (!open) setValue('') }, [open])
  const matches = value.trim() === confirmationText
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      closeOnOverlay={!loading}
      footer={(
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={!matches} loading={loading}>{confirmLabel}</Button>
        </>
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4] }}>
        <FeedbackBanner variant="warning" title="Esta ação não pode ser desfeita" description={message} />
        <FormField
          label={`Digite ${confirmationText} para confirmar`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          error={value.length > 0 && !matches ? `Digite exatamente ${confirmationText}.` : undefined}
        />
      </div>
    </Modal>
  )
}
