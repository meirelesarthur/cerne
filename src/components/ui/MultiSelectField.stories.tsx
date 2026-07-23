import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MultiSelectField } from './MultiSelectField'

const meta = {
  title: 'GB CERNE/MultiSelectField',
  component: MultiSelectField,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MultiSelectField>

export default meta
type Story = StoryObj<typeof meta>

export const PerfisDeAcesso: Story = {
  args: { label: 'Perfis', options: [], value: [], onChange: () => undefined },
  render: () => {
    const [value, setValue] = useState(['manager'])
    return (
      <div style={{ width: 420 }}>
        <MultiSelectField
          label="Perfis de acesso"
          required
          value={value}
          onChange={setValue}
          options={[
            { id: 'manager', label: 'Gestor' },
            { id: 'financial', label: 'Financeiro' },
            { id: 'livestock', label: 'Pecuária' },
          ]}
        />
      </div>
    )
  },
}
