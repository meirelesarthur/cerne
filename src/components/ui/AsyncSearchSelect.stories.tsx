import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AsyncSearchSelect } from './AsyncSearchSelect'
import type { SearchSelectOption } from './SearchSelect'

const OPTIONS: SearchSelectOption[] = [
  { id: '1', code: '001', label: 'Banco do Brasil' },
  { id: '2', code: '104', label: 'Caixa Econômica Federal' },
  { id: '3', code: '341', label: 'Itaú Unibanco' },
  { id: '4', code: '748', label: 'Sicredi' },
]

const loadOptions = async (query: string, signal: AbortSignal) => {
  await new Promise((resolve, reject) => {
    const timer = window.setTimeout(resolve, 450)
    signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Abortado', 'AbortError')) })
  })
  return OPTIONS.filter((option) => `${option.code} ${option.label}`.toLowerCase().includes(query.toLowerCase()))
}

const meta = {
  title: 'GB CERNE/AsyncSearchSelect',
  component: AsyncSearchSelect,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AsyncSearchSelect>

export default meta
type Story = StoryObj<typeof meta>

export const BuscaRemota: Story = {
  args: { loadOptions, onSelect: () => undefined },
  render: () => {
    const [selected, setSelected] = useState<SearchSelectOption | null>(null)
    return (
      <div style={{ width: 360 }}>
        <AsyncSearchSelect
          label="Banco"
          required
          selectedId={selected?.id}
          selectedOption={selected}
          onSelect={setSelected}
          onClear={() => setSelected(null)}
          loadOptions={loadOptions}
        />
      </div>
    )
  },
}
