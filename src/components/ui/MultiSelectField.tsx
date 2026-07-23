import { useMemo, useState } from 'react'
import { t } from '../../design/tokens'
import { SearchSelect, type SearchSelectOption } from './SearchSelect'
import { Tag } from './Tag'

interface MultiSelectFieldProps {
  label: string
  options: SearchSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  placeholder?: string
  emptyText?: string
}

/** Multiselect pesquisável com chips removíveis e contrato controlado. */
export function MultiSelectField({
  label,
  options,
  value,
  onChange,
  required,
  disabled,
  error,
  hint,
  placeholder = 'Buscar e adicionar…',
  emptyText = 'Todas as opções já foram selecionadas.',
}: MultiSelectFieldProps) {
  const [query, setQuery] = useState('')
  const selected = useMemo(() => options.filter((option) => value.includes(option.id)), [options, value])
  const available = useMemo(() => options.filter((option) => !value.includes(option.id)), [options, value])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
      <SearchSelect
        label={label}
        required={required}
        hint={hint}
        disabled={disabled}
        placeholder={placeholder}
        query={query}
        onQueryChange={setQuery}
        options={available}
        onSelect={(option) => { onChange([...value, option.id]); setQuery('') }}
        error={error}
        emptyText={emptyText}
      />
      {selected.length > 0 && (
        <div aria-label={`${label} selecionados`} style={{ display: 'flex', flexWrap: 'wrap', gap: t.space[2] }}>
          {selected.map((option) => (
            <Tag
              key={option.id}
              label={option.label}
              variant="brand"
              onRemove={disabled ? undefined : () => onChange(value.filter((id) => id !== option.id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
