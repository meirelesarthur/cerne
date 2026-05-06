import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormSection } from './FormSection'
import { FormField } from './FormField'
import { FormSelect } from './FormSelect'

const meta: Meta<typeof FormSection> = {
  title: 'UI/FormSection',
  component: FormSection,
  parameters: { layout: 'padded', backgrounds: { default: 'white' } },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560, fontFamily: "'Outfit', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FormSection>

export const Default: Story = {
  args: {
    title: 'Identificação',
    children: (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FormField label="Nome da Fazenda" required placeholder="Ex: Fazenda São João" />
        <FormField label="Área Total (ha)" required placeholder="Ex: 1240" />
      </div>
    ),
  },
}

export const WithSubtitle: Story = {
  args: {
    title: 'Localização',
    subtitle: 'Endereço e coordenadas geográficas da propriedade',
    children: (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FormField label="Município" required placeholder="Ex: Sorriso" />
        <FormSelect
          label="Estado"
          required
          options={[
            { value: '', label: 'Selecione...' },
            { value: 'MT', label: 'Mato Grosso' },
            { value: 'GO', label: 'Goiás' },
          ]}
        />
      </div>
    ),
  },
}
