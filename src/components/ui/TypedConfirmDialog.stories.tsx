import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { TypedConfirmDialog } from './TypedConfirmDialog'

const meta = {
  title: 'GB CERNE/TypedConfirmDialog',
  component: TypedConfirmDialog,
} satisfies Meta<typeof TypedConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const ExclusaoEmMassa: Story = {
  args: { open: false, title: 'Excluir todos os animais?', message: 'Todos os registros filtrados serão removidos.', onCancel: () => undefined, onConfirm: () => undefined },
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>Excluir tudo</Button>
        <TypedConfirmDialog open={open} onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)} title="Excluir todos os animais?" message="Todos os registros filtrados serão removidos." />
      </>
    )
  },
}
