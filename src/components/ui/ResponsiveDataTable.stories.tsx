import type { Meta, StoryObj } from '@storybook/react-vite'
import { ResponsiveDataTable } from './ResponsiveDataTable'
import { Badge } from './Badge'
import { type Column } from './DataTable'
import { t } from '../../design/tokens'

interface Fazenda {
  id: string
  nome: string
  municipio: string
  estado: string
  area: string
  status: 'Ativa' | 'Inativa'
}

const columns: Column<Fazenda>[] = [
  { key: 'nome', label: 'Fazenda', render: (r) => r.nome },
  { key: 'municipio', label: 'Município', render: (r) => `${r.municipio} / ${r.estado}` },
  { key: 'area', label: 'Área', align: 'right', render: (r) => r.area },
  {
    key: 'status',
    label: 'Status',
    align: 'center',
    render: (r) => <Badge label={r.status} variant={r.status === 'Ativa' ? 'success' : 'neutral'} />,
  },
]

const mockData: Fazenda[] = [
  { id: '1', nome: 'Fazenda São João', municipio: 'Sorriso', estado: 'MT', area: '1.240 ha', status: 'Ativa' },
  { id: '2', nome: 'Fazenda Paraíso', municipio: 'Lucas do Rio Verde', estado: 'MT', area: '860 ha', status: 'Ativa' },
  { id: '3', nome: 'Fazenda Nova Esperança', municipio: 'Campo Verde', estado: 'MT', area: '530 ha', status: 'Inativa' },
]

const renderCard = (row: Fazenda) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1], fontFamily: t.font.family.sans }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <strong style={{ fontSize: t.font.size.sm }}>{row.nome}</strong>
      <Badge label={row.status} variant={row.status === 'Ativa' ? 'success' : 'neutral'} />
    </div>
    <span style={{ fontSize: t.font.size.xs, color: t.color.neutral[500] }}>
      {row.municipio} / {row.estado} · {row.area}
    </span>
  </div>
)

const meta: Meta<typeof ResponsiveDataTable> = {
  title: 'GB CERNE/ResponsiveDataTable',
  component: ResponsiveDataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tabela no desktop e cartões equivalentes abaixo de 768px. Redimensione o viewport do preview para ver a troca de layout.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ResponsiveDataTable<Fazenda>>

export const ComDados: Story = {
  name: 'Com dados',
  args: {
    columns,
    data: mockData,
    keyField: 'id',
    renderCard,
  },
}

export const Loading: Story = {
  args: {
    columns,
    data: [],
    keyField: 'id',
    renderCard,
    loading: true,
  },
}

export const Vazio: Story = {
  name: 'Vazio',
  args: {
    columns,
    data: [],
    keyField: 'id',
    renderCard,
    emptyMessage: 'Nenhuma fazenda encontrada.',
  },
}
