import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon } from './Icon'
import { Tooltip } from './Tooltip'

const meta: Meta<typeof Tooltip> = {
  title: 'GB CERNE/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  args: {
    label: 'Cadastro Nacional da Pessoa Jurídica',
  },
  render: (args) => (
    <Tooltip {...args}>
      <span style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
        <Icon name="help" size={16} color="#9ca3af" />
      </span>
    </Tooltip>
  ),
}

export const WithInfoIcon: Story = {
  args: {
    label: 'Esta informação é obrigatória para emissão de NF-e',
  },
  render: (args) => (
    <Tooltip {...args}>
      <span style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
        <Icon name="info" size={16} color="#2563eb" />
      </span>
    </Tooltip>
  ),
}

export const WithAlertIcon: Story = {
  args: {
    label: 'Atenção: área não pode ser alterada após cadastro',
  },
  render: (args) => (
    <Tooltip {...args}>
      <span style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
        <Icon name="alert" size={16} color="#d97706" />
      </span>
    </Tooltip>
  ),
}

export const WithText: Story = {
  args: {
    label: 'Clique para ver detalhes da fazenda',
  },
  render: (args) => (
    <Tooltip {...args}>
      <span
        style={{
          fontSize: 13,
          color: '#059669',
          fontFamily: "'Outfit', sans-serif",
          textDecoration: 'underline',
          cursor: 'pointer',
        }}
      >
        Fazenda São João
      </span>
    </Tooltip>
  ),
}
