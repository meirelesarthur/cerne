// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pencil, Eye } from 'lucide-react'
import { DataTable, type Column } from './DataTable'
import { Badge } from './Badge'

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
    render: (r) => (
      <Badge label={r.status} variant={r.status === 'Ativa' ? 'success' : 'neutral'} />
    ),
  },
  {
    key: 'actions',
    label: '',
    width: 80,
    align: 'center',
    render: () => (
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        <Eye size={14} color="#9ca3af" style={{ cursor: 'pointer' }} />
        <Pencil size={14} color="#9ca3af" style={{ cursor: 'pointer' }} />
      </div>
    ),
  },
]

const mockData: Fazenda[] = [
  { id: '1', nome: 'Fazenda São João', municipio: 'Sorriso', estado: 'MT', area: '1.240 ha', status: 'Ativa' },
  { id: '2', nome: 'Fazenda Paraíso', municipio: 'Lucas do Rio Verde', estado: 'MT', area: '860 ha', status: 'Ativa' },
  { id: '3', nome: 'Fazenda Nova Esperança', municipio: 'Campo Verde', estado: 'MT', area: '530 ha', status: 'Inativa' },
]

const meta: Meta<typeof DataTable> = {
  title: 'UI/DataTable',
  component: DataTable,
  parameters: { layout: 'padded', backgrounds: { default: 'white' } },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ fontFamily: "'Outfit', sans-serif", borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof DataTable>

export const WithData: Story = {
  args: {
    columns,
    data: mockData,
    keyField: 'id',
  },
}

export const Loading: Story = {
  args: {
    columns,
    data: [],
    keyField: 'id',
    loading: true,
  },
}

export const Empty: Story = {
  args: {
    columns,
    data: [],
    keyField: 'id',
    emptyMessage: 'Nenhuma fazenda encontrada.',
  },
}
