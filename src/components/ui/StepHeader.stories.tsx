import type { Meta, StoryObj } from '@storybook/react-vite'
import { StepHeader } from './StepHeader'

const meta: Meta<typeof StepHeader> = {
  title: 'UI/StepHeader',
  component: StepHeader,
  parameters: { layout: 'padded', backgrounds: { default: 'white' } },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof StepHeader>

export const Default: Story = {
  args: {
    title: 'Identificação',
    subtitle: 'Informe os dados básicos da propriedade rural',
  },
}

export const Localizacao: Story = {
  args: {
    title: 'Localização',
    subtitle: 'Informe o endereço e coordenadas geográficas da fazenda',
  },
}

export const Documentacao: Story = {
  args: {
    title: 'Documentação',
    subtitle: 'Anexe os documentos necessários para o cadastro',
  },
}

export const Revisao: Story = {
  args: {
    title: 'Revisão',
    subtitle: 'Confira todas as informações antes de salvar',
  },
}
