import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ToggleSwitch } from './ToggleSwitch'
import { t } from '../../design/tokens'

const meta: Meta<typeof ToggleSwitch> = {
  title: 'GB CERNE/ToggleSwitch',
  component: ToggleSwitch,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ToggleSwitch>

export const Ligado: Story = {
  name: 'Ligado',
  render: () => {
    const [checked, setChecked] = useState(true)
    return <ToggleSwitch checked={checked} onChange={setChecked} label="Fazenda ativa" />
  },
}

export const Desligado: Story = {
  name: 'Desligado',
  render: () => {
    const [checked, setChecked] = useState(false)
    return <ToggleSwitch checked={checked} onChange={setChecked} label="Notificações por e-mail" />
  },
}

export const SemRotulo: Story = {
  name: 'Sem rótulo',
  render: () => {
    const [checked, setChecked] = useState(false)
    return <ToggleSwitch checked={checked} onChange={setChecked} />
  },
}

export const Desabilitado: Story = {
  name: 'Desabilitado',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
      <ToggleSwitch checked={true} onChange={() => {}} label="Sincronização automática" disabled />
      <ToggleSwitch checked={false} onChange={() => {}} label="Relatório semanal" disabled />
    </div>
  ),
}
