import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConfirmDialog } from './ConfirmDialog'
import { Button } from './Button'

const meta: Meta<typeof ConfirmDialog> = {
  title: 'GB CERNE/ConfirmDialog',
  component: ConfirmDialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConfirmDialog>

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>Excluir safra…</Button>
        <ConfirmDialog
          open={open}
          onCancel={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          title="Excluir safra?"
          message="Esta ação não pode ser desfeita. A safra e seus dados associados serão removidos permanentemente."
          confirmLabel="Excluir"
          tone="destructive"
        />
      </>
    )
  },
}

export const DefaultTone: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Confirmar ação</Button>
        <ConfirmDialog
          open={open}
          onCancel={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          title="Publicar alterações?"
          message="As alterações ficarão visíveis para todos os produtores imediatamente."
          confirmLabel="Publicar"
          tone="default"
        />
      </>
    )
  },
}
