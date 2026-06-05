import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormPageHeader } from './FormPageHeader'

const meta: Meta<typeof FormPageHeader> = {
  title: 'GB CERNE/FormPageHeader',
  component: FormPageHeader,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof FormPageHeader>

export const NewRecord: Story = {
  args: {
    title: 'Novo Produto',
    subtitle: 'Preencha os campos abaixo para cadastrar.',
    onBack: () => {},
  },
}

export const EditRecord: Story = {
  args: {
    title: 'Editar Produto',
    subtitle: 'Editando: PRD-001 — Soja em grão',
    onBack: () => {},
  },
}
