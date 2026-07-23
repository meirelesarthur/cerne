import { useEffect, useMemo, useState } from 'react'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { SearchSelect, type SearchSelectOption } from './SearchSelect'

export interface AsyncSearchSelectProps {
  label?: string
  required?: boolean
  hint?: string
  disabled?: boolean
  placeholder?: string
  selectedId?: string | null
  selectedOption?: SearchSelectOption | null
  onSelect: (option: SearchSelectOption) => void
  onClear?: () => void
  loadOptions: (query: string, signal: AbortSignal) => Promise<SearchSelectOption[]>
  minimumInputLength?: number
  debounceMs?: number
  error?: string
  emptyText?: string
}

/**
 * Combobox assíncrono do kit. Centraliza debounce, cancelamento de request,
 * estados de carregamento/erro e preservação da opção selecionada.
 */
export function AsyncSearchSelect({
  label,
  required,
  hint,
  disabled,
  placeholder = 'Digite para buscar...',
  selectedId,
  selectedOption,
  onSelect,
  onClear,
  loadOptions,
  minimumInputLength = 2,
  debounceMs = 300,
  error,
  emptyText = 'Nenhum resultado encontrado.',
}: AsyncSearchSelectProps) {
  const [query, setQuery] = useState(selectedOption?.label ?? '')
  const [options, setOptions] = useState<SearchSelectOption[]>(selectedOption ? [selectedOption] : [])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const debouncedQuery = useDebouncedValue(query.trim(), debounceMs)

  useEffect(() => {
    if (selectedOption && selectedOption.id === selectedId) {
      setQuery(selectedOption.label)
      setOptions((current) => current.some((option) => option.id === selectedOption.id)
        ? current
        : [selectedOption, ...current])
    }
  }, [selectedId, selectedOption])

  useEffect(() => {
    if (debouncedQuery.length < minimumInputLength) {
      setLoading(false)
      setLoadError(null)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setLoadError(null)

    loadOptions(debouncedQuery, controller.signal)
      .then((loaded) => {
        if (!controller.signal.aborted) setOptions(loaded)
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        setOptions([])
        setLoadError(reason instanceof Error ? reason.message : 'Não foi possível carregar as opções.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [debouncedQuery, loadOptions, minimumInputLength])

  const feedback = useMemo(() => {
    if (loading) return 'Buscando opções…'
    if (loadError) return `${loadError} Tente novamente.`
    if (query.trim().length < minimumInputLength) {
      return `Digite pelo menos ${minimumInputLength} caracteres.`
    }
    return emptyText
  }, [emptyText, loadError, loading, minimumInputLength, query])

  return (
    <SearchSelect
      label={label}
      required={required}
      hint={hint}
      disabled={disabled}
      placeholder={placeholder}
      query={query}
      onQueryChange={setQuery}
      options={options}
      selectedId={selectedId}
      onSelect={(option) => {
        setQuery(option.label)
        onSelect(option)
      }}
      onClear={onClear ? () => { setQuery(''); setOptions([]); onClear() } : undefined}
      error={error ?? (loadError || undefined)}
      emptyText={feedback}
    />
  )
}
