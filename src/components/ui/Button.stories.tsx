import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon } from './Icon'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'GB CERNE/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Button>

// ─── Variants ────────────────────────────────────────────────────────────────

export const Primary: Story = {
  args: { variant: 'primary', children: 'Salvar' },
}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Cancelar' },
}

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Excluir' },
}

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ver mais' },
}

// ─── Sizes ───────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <Button size="sm">Pequeno</Button>
      <Button size="md">Médio</Button>
      <Button size="lg">Grande</Button>
    </div>
  ),
}

// ─── Com ícone ────────────────────────────────────────────────────────────────

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <Button variant="primary" icon={<Icon name="add" size={15} />}>Nova Fazenda</Button>
      <Button variant="secondary" icon={<Icon name="download" size={15} />}>Exportar</Button>
      <Button variant="destructive" icon={<Icon name="delete" size={15} />}>Excluir</Button>
      <Button variant="ghost" icon={<Icon name="arrow-right" size={15} />}>Ver todos</Button>
    </div>
  ),
}

// ─── Estados ─────────────────────────────────────────────────────────────────

export const Loading: Story = {
  args: { variant: 'primary', loading: true, children: 'Salvando' },
}

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true, children: 'Indisponível' },
}

// ─── Todas as variantes ───────────────────────────────────────────────────────

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['primary', 'secondary', 'destructive', 'ghost'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Button variant={variant} size="sm">Sm</Button>
          <Button variant={variant} size="md">Md</Button>
          <Button variant={variant} size="lg">Lg</Button>
          <Button variant={variant} icon={<Icon name="add" size={14} />}>Com ícone</Button>
          <Button variant={variant} disabled>Disabled</Button>
        </div>
      ))}
    </div>
  ),
}
