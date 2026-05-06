import React, { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Eye, X } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge } from '../../../components/ui/Badge'
import { FormField } from '../../../components/ui/FormField'
import { FormSelect } from '../../../components/ui/FormSelect'
import { mockFazendas } from './fazendas.mock'
import type { FazendaRow } from './fazendas.types'
import type { Column } from '../../../components/ui/DataTable'

interface FazendasListaProps {
  onNew: () => void
  onView: (id: string) => void
  onEdit: (id: string) => void
}

const tipoOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: 'Agrícola', label: 'Agrícola' },
  { value: 'Pecuário', label: 'Pecuário' },
  { value: 'Misto', label: 'Misto' },
  { value: 'Silvicultura', label: 'Silvicultura' },
  { value: 'Piscicultura', label: 'Piscicultura' },
]

const ativoOptions = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Ativo' },
  { value: 'false', label: 'Inativo' },
]

export default function FazendasLista({ onNew, onView, onEdit }: FazendasListaProps) {
  const [filters, setFilters] = useState({ nome: '', tipoExploracao: '', ativo: '' })
  const [data] = useState<FazendaRow[]>(mockFazendas)

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const matchNome = !filters.nome || row.nome.toLowerCase().includes(filters.nome.toLowerCase())
      const matchTipo = !filters.tipoExploracao || row.tipoExploracao === filters.tipoExploracao
      const matchAtivo =
        filters.ativo === '' ||
        (filters.ativo === 'true' ? row.ativo : !row.ativo)
      return matchNome && matchTipo && matchAtivo
    })
  }, [data, filters])

  const hasFilters = filters.nome || filters.tipoExploracao || filters.ativo !== ''

  const clearFilters = () => setFilters({ nome: '', tipoExploracao: '', ativo: '' })

  const columns: Column<FazendaRow>[] = [
    {
      key: 'nome',
      label: 'Nome',
      render: (row) => (
        <span style={{ fontWeight: 500 }}>{row.nome}</span>
      ),
    },
    {
      key: 'cpfCnpj',
      label: 'CPF / CNPJ',
      render: (row) => (
        <span style={{ color: '#616161', fontSize: 12 }}>{row.cpfCnpj}</span>
      ),
    },
    {
      key: 'cidadeUf',
      label: 'Cidade / UF',
      render: (row) => (
        <span style={{ color: '#616161' }}>
          {row.cidade} — {row.uf}
        </span>
      ),
    },
    {
      key: 'tipoExploracao',
      label: 'Tipo Exploração',
      render: (row) => row.tipoExploracao,
    },
    {
      key: 'areaTotal',
      label: 'Área Total',
      align: 'right',
      render: (row) => (
        <span>
          {row.areaTotal.toLocaleString('pt-BR')} ha
        </span>
      ),
    },
    {
      key: 'ativo',
      label: 'Status',
      align: 'center',
      render: (row) => (
        <Badge label={row.ativo ? 'Ativo' : 'Inativo'} variant={row.ativo ? 'success' : 'neutral'} />
      ),
    },
    {
      key: 'acoes',
      label: 'Ações',
      align: 'center',
      width: 80,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <button
            type="button"
            onClick={() => onView(row.id)}
            title="Visualizar"
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#616161',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(row.id)}
            title="Editar"
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#616161',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            title="Excluir"
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#dc2626',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div
      style={{
        padding: '24px 28px',
        fontFamily: "'Outfit', sans-serif",
        boxSizing: 'border-box',
      }}
    >
      <PageHeader
        title="Fazendas"
        count={filtered.length}
        actions={
          <button
            type="button"
            onClick={onNew}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#059669',
              border: 'none',
              borderRadius: 8,
              padding: '0 16px',
              height: 36,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            Nova Fazenda
          </button>
        }
      />

      {/* Filter Bar */}
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: 16,
          marginBottom: 8,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 12,
        }}
      >
        <div style={{ flex: 2 }}>
          <FormField
            label="Nome"
            value={filters.nome}
            onChange={(e) => setFilters((f) => ({ ...f, nome: e.target.value }))}
            placeholder="Buscar por nome..."
          />
        </div>

        <div style={{ flex: 1 }}>
          <FormSelect
            label="Tipo de Exploração"
            options={tipoOptions}
            value={filters.tipoExploracao}
            onChange={(e) => setFilters((f) => ({ ...f, tipoExploracao: e.target.value }))}
          />
        </div>

        <div style={{ flex: 1 }}>
          <FormSelect
            label="Status"
            options={ativoOptions}
            value={filters.ativo}
            onChange={(e) => setFilters((f) => ({ ...f, ativo: e.target.value }))}
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'white',
              border: '1.5px solid #e5e5e5',
              borderRadius: 8,
              padding: '0 12px',
              height: 38,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "'Outfit', sans-serif",
              color: '#616161',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={12} />
            Limpar
          </button>
        )}
      </div>

      {/* Data Table */}
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <DataTable<FazendaRow>
          columns={columns}
          data={filtered}
          keyField="id"
          emptyMessage="Nenhuma fazenda encontrada com os filtros aplicados."
        />
      </div>
    </div>
  )
}
