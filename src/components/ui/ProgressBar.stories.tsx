import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProgressBar } from './ProgressBar'
import type { ProgressState } from './ProgressBar'

const meta: Meta<typeof ProgressBar> = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Barra de progresso de 3 px fixada no topo do painel direito do Login. Quatro estados: `idle` (invisível), `loading` (indeterminado), `success` (completo verde) e `error` (vermelho). Respeita `prefers-reduced-motion`.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'loading', 'success', 'error'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: 60, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fafaf9' }}>
        <Story />
        <span style={{ position: 'absolute', top: 20, left: 16, fontSize: 12, color: '#6b7280', fontFamily: "'Outfit', sans-serif" }}>
          ← barra aparece no topo
        </span>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ProgressBar>

export const Idle: Story = {
  args: { state: 'idle' },
}

export const Loading: Story = {
  args: { state: 'loading' },
}

export const Success: Story = {
  args: { state: 'success' },
}

export const Error: Story = {
  args: { state: 'error' },
}

// ─── Simulação interativa do fluxo completo ───────────────────────────────────

export const FluxoCompleto: Story = {
  render: () => {
    const [state, setState] = useState<ProgressState>('idle')

    const simular = (result: 'success' | 'error') => {
      setState('loading')
      setTimeout(() => {
        setState(result)
        setTimeout(() => setState('idle'), 900)
      }, 1800)
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ position: 'relative', height: 56, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fafaf9' }}>
          <ProgressBar state={state} />
          <span style={{ position: 'absolute', top: 18, left: 16, fontSize: 12, color: '#6b7280', fontFamily: "'Outfit', sans-serif" }}>
            Estado atual: <strong style={{ color: '#1a1a1a' }}>{state}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => simular('success')}
            disabled={state === 'loading'}
            style={{ padding: '6px 14px', background: '#059669', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontFamily: "'Outfit', sans-serif", cursor: 'pointer', opacity: state === 'loading' ? 0.5 : 1 }}
          >
            Simular sucesso
          </button>
          <button
            onClick={() => simular('error')}
            disabled={state === 'loading'}
            style={{ padding: '6px 14px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontFamily: "'Outfit', sans-serif", cursor: 'pointer', opacity: state === 'loading' ? 0.5 : 1 }}
          >
            Simular erro
          </button>
        </div>
      </div>
    )
  },
}
