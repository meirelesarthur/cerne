import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormField } from './FormField'
import { FormSelect } from './FormSelect'
import { DetailGrid } from './DetailGrid'
import { ReportWorkspace } from './ReportWorkspace'

interface ExampleRow {
  id: string
  product: string
  quantity: number
}

const rows: ExampleRow[] = [
  { id: '1', product: 'Milho em grão', quantity: 1240 },
  { id: '2', product: 'Farelo de soja', quantity: 860 },
]

const meta = {
  title: 'GB CERNE/ReportWorkspace',
  component: ReportWorkspace<ExampleRow>,
} satisfies Meta<typeof ReportWorkspace<ExampleRow>>

export default meta
type Story = StoryObj<typeof meta>

export const ComPrevia: Story = {
  args: {
    title: 'Estoque Consolidado',
    description: 'Posição atual por armazém e produto.',
    filters: (
      <>
        <FormSelect label="Armazém" value="all" options={[{ value: 'all', label: 'Todos' }]} />
        <FormField label="Pesquisar por nome" placeholder="Produto" />
      </>
    ),
    columns: [
      { key: 'product', label: 'Produto', render: (row) => row.product },
      { key: 'quantity', label: 'Quantidade', align: 'right', render: (row) => row.quantity.toLocaleString('pt-BR') },
    ],
    data: rows,
    keyField: 'id',
    hasPreview: true,
    renderCard: (row) => <DetailGrid columns={1} items={[
      { label: 'Produto', value: row.product },
      { label: 'Quantidade', value: row.quantity.toLocaleString('pt-BR') },
    ]} />,
    onPreview: () => undefined,
    onExport: () => undefined,
  },
}
