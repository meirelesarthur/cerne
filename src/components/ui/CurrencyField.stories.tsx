import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CurrencyField } from './CurrencyField'

const meta = {
  title: 'GB CERNE/CurrencyField',
  component: CurrencyField,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CurrencyField>

export default meta
type Story = StoryObj<typeof meta>

export const ValorMonetario: Story = {
  args: { label: 'Valor', value: 0, onChange: () => undefined },
  render: () => {
    const [value, setValue] = useState(18450.75)
    return <div style={{ width: 320 }}><CurrencyField label="Valor da baixa" value={value} onChange={setValue} required /></div>
  },
}
