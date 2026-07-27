import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'
import { SearchSelect, type SearchSelectOption } from './SearchSelect'

const meta: Meta<typeof SearchSelect> = {
  title: 'GB CERNE/SearchSelect',
  component: SearchSelect,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SearchSelect>

const PRODUTOS: SearchSelectOption[] = [
  { id: '1', code: '001', label: 'Soja em grão' },
  { id: '2', code: '002', label: 'Milho em grão' },
  { id: '3', code: '003', label: 'Algodão em pluma' },
  { id: '4', code: '004', label: 'Trigo em grão' },
  { id: '5', code: '005', label: 'Fertilizante NPK 08-28-16' },
]

const NCM_OPTIONS: SearchSelectOption[] = [
  { id: '27101259', code: '27101259', label: 'Óleo Diesel' },
  { id: '31021000', code: '31021000', label: 'Ureia' },
  { id: '38089390', code: '38089390', label: 'Herbicidas' },
]

export const Padrao: Story = {
  name: 'Padrão',
  render: () => {
    const [query, setQuery] = useState('')
    const [selectedId, setSelectedId] = useState<string | null>(null)
    return (
      <div style={{ width: 360 }}>
        <SearchSelect
          label="Produto"
          required
          hint="Busque por código ou descrição"
          query={query}
          onQueryChange={setQuery}
          options={PRODUTOS}
          selectedId={selectedId}
          onSelect={(o) => { setSelectedId(o.id); setQuery(o.label) }}
          onClear={() => { setSelectedId(null); setQuery('') }}
        />
      </div>
    )
  },
}

export const ComAcaoDeRodape: Story = {
  name: 'Com ação de rodapé',
  render: () => {
    const [query, setQuery] = useState('')
    const [selectedId, setSelectedId] = useState<string | null>(null)
    return (
      <div style={{ width: 360 }}>
        <SearchSelect
          label="Produto"
          query={query}
          onQueryChange={setQuery}
          options={PRODUTOS}
          selectedId={selectedId}
          onSelect={(o) => { setSelectedId(o.id); setQuery(o.label) }}
          onClear={() => { setSelectedId(null); setQuery('') }}
          footerAction={{ label: 'Novo Produto', icon: <Plus size={12} />, onClick: () => {} }}
        />
      </div>
    )
  },
}

export const ComAcaoNoCabecalho: Story = {
  name: 'Com ação no cabeçalho',
  render: () => {
    const [query, setQuery] = useState('')
    return (
      <div style={{ width: 360 }}>
        <SearchSelect
          label="Produto"
          query={query}
          onQueryChange={setQuery}
          options={PRODUTOS}
          onSelect={() => {}}
          headerAction={{ label: 'Novo Produto', icon: <Plus size={12} />, onClick: () => {} }}
        />
      </div>
    )
  },
}

export const ComErro: Story = {
  name: 'Com erro',
  render: () => {
    const [query, setQuery] = useState('xyz')
    return (
      <div style={{ width: 360 }}>
        <SearchSelect
          label="Produto"
          required
          query={query}
          onQueryChange={setQuery}
          options={PRODUTOS}
          onSelect={() => {}}
          error="Selecione um produto válido"
        />
      </div>
    )
  },
}

export const BuscaPorCodigoOuDescricao: Story = {
  name: 'Busca por código ou descrição',
  render: () => {
    const [query, setQuery] = useState('')
    const [selectedId, setSelectedId] = useState<string | null>(null)
    return (
      <div style={{ width: 360 }}>
        <SearchSelect
          label="NCM"
          required
          name="ncm"
          query={query}
          onQueryChange={(value) => { setQuery(value); setSelectedId(null) }}
          options={NCM_OPTIONS}
          selectedId={selectedId}
          onSelect={(option) => {
            setSelectedId(option.id)
            setQuery(`${option.code} — ${option.label}`)
          }}
          onClear={() => { setSelectedId(null); setQuery('') }}
          placeholder="Buscar NCM por código ou descrição..."
        />
      </div>
    )
  },
}

export const Desabilitado: Story = {
  name: 'Desabilitado',
  render: () => (
    <div style={{ width: 360 }}>
      <SearchSelect
        label="Produto"
        query="Soja em grão"
        onQueryChange={() => {}}
        options={PRODUTOS}
        selectedId="1"
        onSelect={() => {}}
        disabled
      />
    </div>
  ),
}
