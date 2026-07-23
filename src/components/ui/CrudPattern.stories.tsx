import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CrudPattern, type CrudEntity } from './CrudPattern'

interface Bank extends CrudEntity {
  id: string
  code: string
  name: string
}

const meta = {
  title: 'GB CERNE/CrudPattern',
  component: CrudPattern,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CrudPattern>

export default meta
type Story = StoryObj<typeof meta>

export const Bancos: Story = {
  args: { title: 'Bancos', singular: 'Banco', records: [], columns: [] },
  render: () => {
    const [records, setRecords] = useState<Bank[]>([
      { id: '1', code: '001', name: 'Banco do Brasil' },
      { id: '2', code: '104', name: 'Caixa Econômica Federal' },
    ])
    return (
      <CrudPattern
        title="Bancos"
        singular="Banco"
        description="Instituições financeiras disponíveis nos cadastros."
        records={records}
        onRecordsChange={setRecords}
        columns={[{ key: 'code', label: 'Código', width: 160 }, { key: 'name', label: 'Nome' }]}
        fields={[{ key: 'code', label: 'Código', required: true, maxLength: 100 }, { key: 'name', label: 'Nome', required: true, maxLength: 100 }]}
      />
    )
  },
}
