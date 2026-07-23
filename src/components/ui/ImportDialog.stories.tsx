import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { ImportDialog } from './ImportDialog'

const meta = {
  title: 'GB CERNE/ImportDialog',
  component: ImportDialog,
} satisfies Meta<typeof ImportDialog>

export default meta
type Story = StoryObj<typeof meta>

export const PlanilhaComValidacao: Story = {
  args: { open: false, onClose: () => undefined, accept: '.xlsx', onImport: async () => undefined },
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Importar animais</Button>
        <ImportDialog
          open={open}
          onClose={() => setOpen(false)}
          accept=".xlsx,.xls"
          onDownloadTemplate={() => undefined}
          onImport={async () => [{ line: 8, message: 'Brinco já cadastrado.' }]}
        />
      </>
    )
  },
}
