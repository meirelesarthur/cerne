import { useState, useMemo } from 'react'
import { useFarm } from '../../context/FarmContext'
import { SearchSelect, type SearchSelectOption } from './SearchSelect'

export function FarmSwitcher() {
  const { currentFarm, farms, setCurrentFarm } = useFarm()
  const [query, setQuery] = useState('')

  const options: SearchSelectOption[] = useMemo(
    () => farms.map((farm) => ({
      id: farm.id,
      label: farm.name,
      code: farm.code,
    })),
    [farms],
  )

  const handleSelect = (option: SearchSelectOption) => {
    const farm = farms.find((f) => f.id === option.id)
    if (farm) setCurrentFarm(farm)
  }

  return (
    <div style={{ width: 200 }}>
      <SearchSelect
        placeholder="Selecionar fazenda..."
        query={query}
        onQueryChange={setQuery}
        options={options}
        selectedId={currentFarm?.id ?? null}
        onSelect={handleSelect}
        onClear={() => setQuery('')}
        maxVisible={6}
      />
    </div>
  )
}
