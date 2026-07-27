import type { Meta, StoryObj } from '@storybook/react-vite'
import { CollapsibleSection } from './CollapsibleSection'
import { FormField } from './FormField'
import { FormSelect } from './FormSelect'

const meta: Meta<typeof CollapsibleSection> = {
  title: 'GB CERNE/CollapsibleSection',
  component: CollapsibleSection,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 420, fontFamily: "'Outfit', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CollapsibleSection>

const SampleFields = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <FormField label="Nome da fazenda" placeholder="Ex: Fazenda São João" />
    <FormSelect
      label="Estado"
      value="MT"
      onChange={() => {}}
      options={[
        { value: 'MT', label: 'Mato Grosso' },
        { value: 'GO', label: 'Goiás' },
      ]}
    />
    <FormField label="Área total (ha)" placeholder="Ex: 1.240" />
  </div>
)

// ─── Recolhida (padrão) ─────────────────────────────────────────────────────────

export const Recolhida: Story = {
  render: () => (
    <CollapsibleSection title="Dados Gerais" fieldCount={3}>
      <SampleFields />
    </CollapsibleSection>
  ),
}

// ─── Aberta por padrão ──────────────────────────────────────────────────────────

export const AbertaPorPadrao: Story = {
  name: 'Aberta por padrão',
  render: () => (
    <CollapsibleSection title="Dados Gerais" fieldCount={3} defaultOpen>
      <SampleFields />
    </CollapsibleSection>
  ),
}

// ─── Múltiplas seções ───────────────────────────────────────────────────────────

export const MultiplasSecoes: Story = {
  name: 'Múltiplas seções (formulário denso)',
  render: () => (
    <div>
      <CollapsibleSection title="Dados Gerais" fieldCount={3} defaultOpen>
        <SampleFields />
      </CollapsibleSection>
      <CollapsibleSection title="Endereço" fieldCount={2}>
        <SampleFields />
      </CollapsibleSection>
      <CollapsibleSection title="Documentação" fieldCount={4}>
        <SampleFields />
      </CollapsibleSection>
    </div>
  ),
}

// ─── Sem contagem de campos ─────────────────────────────────────────────────────

export const SemContagem: Story = {
  name: 'Sem contagem de campos',
  render: () => (
    <CollapsibleSection title="Observações">
      <SampleFields />
    </CollapsibleSection>
  ),
}
