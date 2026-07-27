import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pencil, Trash2, Eye, Download } from 'lucide-react'
import { IconButton } from './IconButton'

const meta: Meta<typeof IconButton> = {
  title: 'GB CERNE/IconButton',
  component: IconButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md'] },
    variant: { control: 'select', options: ['ghost', 'outline', 'subtle'] },
  },
}

export default meta
type Story = StoryObj<typeof IconButton>

// ─── Padrão ─────────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    icon: <Pencil />,
    'aria-label': 'Editar',
    tooltip: 'Editar',
  },
}

// ─── Variantes ──────────────────────────────────────────────────────────────────

export const Variantes: Story = {
  name: 'Variantes (ghost, outline, subtle)',
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <IconButton icon={<Eye />} aria-label="Visualizar" variant="ghost" tooltip="Ghost" />
      <IconButton icon={<Eye />} aria-label="Visualizar" variant="outline" tooltip="Outline" />
      <IconButton icon={<Eye />} aria-label="Visualizar" variant="subtle" tooltip="Subtle" />
    </div>
  ),
}

// ─── Tamanhos ───────────────────────────────────────────────────────────────────

export const Tamanhos: Story = {
  name: 'Tamanhos (xs, sm, md)',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <IconButton icon={<Download />} aria-label="Exportar" size="xs" tooltip="xs" />
      <IconButton icon={<Download />} aria-label="Exportar" size="sm" tooltip="sm" />
      <IconButton icon={<Download />} aria-label="Exportar" size="md" tooltip="md" />
    </div>
  ),
}

// ─── Ações de linha (uso real em tabela) ────────────────────────────────────────

export const AcoesDeLinha: Story = {
  name: 'Ações de linha (padrão de tabela)',
  render: () => (
    <div style={{ display: 'flex', gap: 6 }}>
      <IconButton icon={<Eye />} aria-label="Visualizar fazenda" tooltip="Visualizar" />
      <IconButton icon={<Pencil />} aria-label="Editar fazenda" tooltip="Editar" />
      <IconButton icon={<Trash2 />} aria-label="Excluir fazenda" tooltip="Excluir" danger />
    </div>
  ),
}

// ─── Desabilitado ───────────────────────────────────────────────────────────────

export const Desabilitado: Story = {
  args: {
    icon: <Trash2 />,
    'aria-label': 'Excluir',
    disabled: true,
    danger: true,
  },
}
