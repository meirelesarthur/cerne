import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormSelect } from './FormSelect'

const estadoOptions = [
  { value: '', label: 'Selecione...' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'PR', label: 'Paraná' },
]

const meta: Meta<typeof FormSelect> = {
  title: 'GB CERNE/FormSelect',
  component: FormSelect,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 320, fontFamily: "'Outfit', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FormSelect>

export const Default: Story = {
  args: {
    label: 'Estado',
    options: estadoOptions,
  },
}

export const Required: Story = {
  args: {
    label: 'Estado',
    required: true,
    options: estadoOptions,
  },
}

export const WithHint: Story = {
  args: {
    label: 'Safra',
    required: true,
    hint: 'Selecione a safra de referência para este lançamento',
    options: [
      { value: '', label: 'Selecione...' },
      { value: '2024_25', label: '2024/25' },
      { value: '2023_24', label: '2023/24' },
    ],
  },
}

export const WithError: Story = {
  args: {
    label: 'Tipo de Solo',
    error: 'Campo obrigatório',
    options: [{ value: '', label: 'Selecione...' }],
  },
}
