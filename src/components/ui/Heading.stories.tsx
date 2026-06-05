import type { Meta, StoryObj } from '@storybook/react-vite'
import { Heading } from './Heading'

const meta: Meta<typeof Heading> = {
  title: 'GB CERNE/Heading',
  component: Heading,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Heading>

export const Default: Story = {
  args: { level: 1, size: '3xl', children: 'Bom dia, vamos começar!' },
}

export const SectionTitle: Story = {
  args: { level: 3, size: 'base', weight: 'semibold', children: 'Minhas Fazendas' },
}

export const Scale: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Heading level={1} size="4xl">Título 4xl</Heading>
      <Heading level={2} size="2xl">Título 2xl</Heading>
      <Heading level={3} size="lg" weight="semibold">Título lg</Heading>
      <Heading level={4} size="base" weight="medium" tone="muted">Título base muted</Heading>
    </div>
  ),
}
