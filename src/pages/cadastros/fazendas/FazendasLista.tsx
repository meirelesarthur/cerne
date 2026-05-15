import React, { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, SlidersHorizontal, X } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { PageContainer } from '../../../components/ui/PageContainer'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { FilterDrawer } from '../../../components/ui/FilterDrawer'
import { Badge } from '../../../components/ui/Badge'
import { FormField } from '../../../components/ui/FormField'
import { FormSelect } from '../../../components/ui/FormSelect'
import { t } from '../../../design/tokens'
import { useTheme } from '../../../context/ThemeContext'
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
  const { colors } = useTheme()
  const [filters, setFilters] = useState({ nome: '', tipoExploracao: '', ativo: '' })
  const [data] = useState<FazendaRow[]>(mockFazendas)
  const [drawerOpen, setDrawerOpen] = useState(false)

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

  const activeFilterCount = [filters.nome, filters.tipoExploracao, filters.ativo].filter(Boolean).length
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
        <span style={{ color: colors.textSecondary, fontSize: 12 }}>{row.cpfCnpj}</span>
      ),
    },
    {
      key: 'cidadeUf',
      label: 'Cidade / UF',
      render: (row) => (
        <span style={{ color: colors.textSecondary }}>
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
        <span>{row.areaTotal.toLocaleString('pt-BR')} ha</span>
      ),
    },
    {
      key: 'ativo',
      label: 'Status',
      align: 'center',
      sortable: false,
      render: (row) => (
        <Badge label={row.ativo ? 'Ativo' : 'Inativo'} variant={row.ativo ? 'success' : 'neutral'} />
      ),
    },
    {
      key: 'acoes',
      label: 'Ações',
      align: 'center',
      sortable: false,
      width: 72,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.space[1] / 2 }}>
          <Button variant="ghost" size="sm" style={{ width: 28, height: 28, padding: 0 }} onClick={(e) => { e.stopPropagation(); onEdit(row.id) }} title="Editar">
            <Pencil size={14} />
          </Button>
          <Button variant="destructive" size="sm" style={{ width: 28, height: 28, padding: 0, border: 'none' }} onClick={(e) => e.stopPropagation()} title="Excluir">
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Fazendas"
        count={filtered.length}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 32,
                background: activeFilterCount > 0 ? colors.brandBg : colors.surfaceBg,
                border: `1px solid ${activeFilterCount > 0 ? colors.brand : colors.border}`,
                borderRadius: 6,
                padding: '0 12px',
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "'Outfit', sans-serif",
                color: activeFilterCount > 0 ? colors.brand : colors.textSecondary,
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = activeFilterCount > 0 ? colors.brandBg : colors.surfaceSubtle }}
              onMouseLeave={(e) => { e.currentTarget.style.background = activeFilterCount > 0 ? colors.brandBg : colors.surfaceBg }}
            >
              <SlidersHorizontal size={12} />
              Filtros
              {activeFilterCount > 0 && (
                <span style={{ background: colors.brand, color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 9999 }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={onNew}>
              Nova Fazenda
            </Button>
          </div>
        }
      />

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          {filters.nome && (
            <FilterChip
              label={`Nome: ${filters.nome}`}
              onRemove={() => setFilters((f) => ({ ...f, nome: '' }))}
            />
          )}
          {filters.tipoExploracao && (
            <FilterChip
              label={`Tipo: ${filters.tipoExploracao}`}
              onRemove={() => setFilters((f) => ({ ...f, tipoExploracao: '' }))}
            />
          )}
          {filters.ativo && (
            <FilterChip
              label={filters.ativo === 'true' ? 'Ativo' : 'Inativo'}
              onRemove={() => setFilters((f) => ({ ...f, ativo: '' }))}
            />
          )}
          {activeFilterCount > 1 && (
            <button
              type="button"
              onClick={clearFilters}
              style={{ background: 'none', border: 'none', fontSize: 12, color: colors.textMuted, cursor: 'pointer', padding: '0 4px', fontFamily: "'Outfit', sans-serif" }}
            >
              Limpar tudo
            </button>
          )}
        </div>
      )}

      {/* Data Table */}
      <DataTable<FazendaRow>
        columns={columns}
        data={filtered}
        keyField="id"
        emptyMessage="Nenhuma fazenda encontrada com os filtros aplicados."
        onRowClick={(row) => onView(row.id)}
      />

      {/* Filter Drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clearFilters}
        title="Filtrar Fazendas"
        activeCount={activeFilterCount}
      >
        <div>
          <FormField
            label="Nome"
            value={filters.nome}
            onChange={(e) => setFilters((f) => ({ ...f, nome: e.target.value }))}
            placeholder="Buscar por nome..."
          />
        </div>
        <div>
          <FormSelect
            label="Tipo de Exploração"
            options={tipoOptions}
            value={filters.tipoExploracao}
            onChange={(e) => setFilters((f) => ({ ...f, tipoExploracao: e.target.value }))}
          />
        </div>
        <div>
          <FormSelect
            label="Status"
            options={ativoOptions}
            value={filters.ativo}
            onChange={(e) => setFilters((f) => ({ ...f, ativo: e.target.value }))}
          />
        </div>
      </FilterDrawer>
    </PageContainer>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const { colors } = useTheme()
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: t.space[1],
        height: 32,
        background: colors.brandBg,
        border: `1px solid ${colors.brand}`,
        borderRadius: t.radius.md,
        padding: `0 ${t.space[2]}px 0 ${t.space[2] + t.space[1] / 2}px`,
        fontSize: t.font.size.sm,
        color: colors.brand,
        fontFamily: t.font.family.sans,
        fontWeight: t.font.weight.medium,
      }}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        style={{
          background: 'none', border: 'none',
          cursor: 'pointer', color: colors.brand,
          display: 'flex', alignItems: 'center',
          padding: 0,
        }}
      >
        <X size={11} />
      </button>
    </div>
  )
}
