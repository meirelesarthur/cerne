import { useState, useMemo, useEffect } from 'react'
import { Icon } from './Icon'
import { useFarm } from '../../context/FarmContext'
import { SearchSelect, type SearchSelectOption } from './SearchSelect'
import { t } from '../../design/tokens'

export function FarmSwitcher() {
  const { currentFarm, farms, setCurrentFarm } = useFarm()
  const [query, setQuery] = useState(currentFarm?.name ?? '')

  useEffect(() => {
    setQuery(currentFarm?.name ?? '')
  }, [currentFarm])

  const options: SearchSelectOption[] = useMemo(
    () => farms.map((farm) => ({
      id: farm.id,
      label: farm.name,
      subtitle: farm.code,
      icon: <Icon name="building" size={15} />,
    })),
    [farms],
  )

  const handleSelect = (option: SearchSelectOption) => {
    const farm = farms.find((f) => f.id === option.id)
    if (farm) setCurrentFarm(farm)
  }

  return (
    <div style={{ width: t.size.farmSwitcher }}>
      <SearchSelect
        placeholder="Selecionar fazenda..."
        query={query}
        onQueryChange={setQuery}
        options={options}
        selectedId={currentFarm?.id ?? null}
        onSelect={handleSelect}
        onClear={() => setQuery(currentFarm?.name ?? '')}
        maxVisible={10}
        dense
      />
    </div>
  )
}
