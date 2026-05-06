import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormField } from './FormField'

const meta: Meta<typeof FormField> = {
  title: 'UI/FormField',
  component: FormField,
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
type Story = StoryObj<typeof FormField>

export const Default: Story = {
  args: {
    label: 'Nome',
    placeholder: 'Digite o nome',
  },
}

export const Required: Story = {
  args: {
    label: 'E-mail',
    placeholder: 'exemplo@email.com',
    required: true,
  },
}

export const WithHint: Story = {
  args: {
    label: 'CNPJ',
    placeholder: '00.000.000/0001-00',
    required: true,
    hint: 'Cadastro Nacional da Pessoa Jurídica',
  },
}

export const WithError: Story = {
  args: {
    label: 'Área (ha)',
    value: 'abc',
    error: 'Informe um número válido',
    required: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Código',
    value: 'FAZ-001',
    disabled: true,
  },
}
