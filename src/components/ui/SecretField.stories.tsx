import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SecretField } from './SecretField'

const meta = {
  title: 'GB CERNE/SecretField',
  component: SecretField,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SecretField>

export default meta
type Story = StoryObj<typeof meta>

export const TokenDeIntegracao: Story = {
  args: { label: 'Token de integração', value: '', onChange: () => undefined },
  render: () => {
    const [value, setValue] = useState('gb_live_8x92k39a')
    return <div style={{ width: 360 }}><SecretField label="Token de integração" value={value} onChange={setValue} required /></div>
  },
}
