import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from './Card'
import { Heading } from './Heading'
import { Badge } from './Badge'
import { t } from '../../design/tokens'

const meta: Meta<typeof Card> = {
  title: 'GB CERNE/Card',
  component: Card,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 320, fontFamily: "'Outfit', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    shadow: { control: 'select', options: ['sm', 'DEFAULT', 'md', 'lg', 'none'] },
    radius: { control: 'select', options: ['md', 'lg', 'xl', '2xl'] },
  },
}

export default meta
type Story = StoryObj<typeof Card>

const SampleContent = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
    <Heading level={4} size="sm">Fazenda São João</Heading>
    <span style={{ fontSize: t.font.size.sm, color: t.color.neutral[500] }}>
      Sorriso, MT · 1.240 ha
    </span>
    <Badge label="Ativa" variant="success" />
  </div>
)

// ─── Padrão ─────────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Card>
      <SampleContent />
    </Card>
  ),
}

// ─── Sem borda ──────────────────────────────────────────────────────────────────

export const SemBorda: Story = {
  name: 'Sem borda',
  render: () => (
    <Card border={false} shadow="md">
      <SampleContent />
    </Card>
  ),
}

// ─── Sombra elevada ─────────────────────────────────────────────────────────────

export const SombraElevada: Story = {
  name: 'Sombra elevada',
  render: () => (
    <Card shadow="lg" radius="2xl">
      <SampleContent />
    </Card>
  ),
}

// ─── Clicável ───────────────────────────────────────────────────────────────────

export const Clicavel: Story = {
  name: 'Clicável (ação de navegação)',
  render: () => (
    <Card onClick={() => alert('Abrir detalhes da fazenda')}>
      <SampleContent />
    </Card>
  ),
}

// ─── Padding customizado ────────────────────────────────────────────────────────

export const PaddingCustomizado: Story = {
  name: 'Padding customizado',
  render: () => (
    <Card padding={t.space[3]} shadow="sm">
      <SampleContent />
    </Card>
  ),
}
