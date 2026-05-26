import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SSOButton } from './SSOButton'

const meta: Meta<typeof SSOButton> = {
  title: 'UI/SSOButton',
  component: SSOButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Botão de autenticação SSO para provedores Google e Microsoft. Largura 100%, altura 46 px. Suporta estados `loading` (spinner) e `disabled`. SVG dos logos inline — sem dependência de imagem externa.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    provider: { control: 'select', options: ['google', 'microsoft'] },
    loading:  { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SSOButton>

// ─── Providers ───────────────────────────────────────────────────────────────

export const Google: Story = {
  args: { provider: 'google' },
}

export const Microsoft: Story = {
  args: { provider: 'microsoft' },
}

// ─── Estados ─────────────────────────────────────────────────────────────────

export const Loading: Story = {
  args: { provider: 'google', loading: true },
}

export const Disabled: Story = {
  args: { provider: 'google', disabled: true },
}

// ─── Ambos os providers ───────────────────────────────────────────────────────

export const AmbosPorvedores: Story = {
  render: () => (
    <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SSOButton provider="google"    onClick={() => {}} />
      <SSOButton provider="microsoft" onClick={() => {}} />
    </div>
  ),
}

// ─── Simulação de loading ─────────────────────────────────────────────────────

export const SimulacaoLogin: Story = {
  render: () => {
    const [loading, setLoading] = useState(false)
    const [provider, setProvider] = useState<'google' | 'microsoft' | null>(null)

    const handleClick = (p: 'google' | 'microsoft') => {
      setProvider(p)
      setLoading(true)
      setTimeout(() => { setLoading(false); setProvider(null) }, 2000)
    }

    return (
      <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SSOButton
          provider="google"
          loading={loading && provider === 'google'}
          disabled={loading && provider !== 'google'}
          onClick={() => handleClick('google')}
        />
        <SSOButton
          provider="microsoft"
          loading={loading && provider === 'microsoft'}
          disabled={loading && provider !== 'microsoft'}
          onClick={() => handleClick('microsoft')}
        />
      </div>
    )
  },
}
