import { useState } from 'react'
import { Filter } from 'lucide-react'
import { t } from '../../design/tokens'
import { Button } from './Button'
import { FilterDrawer } from './FilterDrawer'
import { FormSelect } from './FormSelect'

// ─── DashboardFilters ──────────────────────────────────────────────────────────
// Filtro de dashboard: um botão "Filtros" no cabeçalho que abre o
// `FilterDrawer` lateral — o mesmo padrão das listagens e da Pluviometria.
//
// Substitui a fileira de `FilterSelect` soltos no cabeçalho, que crescia com o
// número de filtros (três selects já ocupavam metade da linha do título) e não
// mostrava quantos estavam ativos.
//
// O estado continua na tela (normalmente em `useUrlFilter`, para deep-link);
// aqui só entram os campos e o valor default de cada um, que é o que define
// "filtro ativo" e o que o "Limpar" restaura.

export interface DashboardFilterField {
  /** Rótulo do campo no drawer. */
  label: string
  /** Valor atual — em geral vindo de `useUrlFilter`. */
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  /** Valor default: conta como "sem filtro" e é o alvo do botão Limpar. */
  defaultValue: string
}

interface DashboardFiltersProps {
  fields: DashboardFilterField[]
  /** Título do drawer. Default `Filtros`. */
  title?: string
}

export function DashboardFilters({ fields, title = 'Filtros' }: DashboardFiltersProps) {
  const [open, setOpen] = useState(false)

  const activeCount = fields.filter((field) => field.value !== field.defaultValue).length

  const handleClear = () => {
    fields.forEach((field) => {
      if (field.value !== field.defaultValue) field.onChange(field.defaultValue)
    })
  }

  return (
    <>
      <Button
        icon={<Filter size={t.icon.xs} />}
        size="md"
        onClick={() => setOpen(true)}
      >
        {activeCount > 0 ? `Filtros (${activeCount})` : 'Filtros'}
      </Button>

      <FilterDrawer
        open={open}
        onClose={() => setOpen(false)}
        onClear={handleClear}
        title={title}
        activeCount={activeCount}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4] }}>
          {fields.map((field) => (
            <FormSelect
              key={field.label}
              label={field.label}
              options={field.options}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
            />
          ))}
        </div>
      </FilterDrawer>
    </>
  )
}
