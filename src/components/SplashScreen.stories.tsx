import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SplashScreen } from './SplashScreen'

const meta: Meta<typeof SplashScreen> = {
  title: 'GB CERNE/SplashScreen',
  component: SplashScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Tela de carregamento exibida após o login bem-sucedido. Fundo verde-noite (#081a12), anéis orbitais animados, hexágono com triângulo e wordmark CERNE em destaque (42 px / 800w). Duração total: 3 s com fade-out suave. CSS keyframes puros, sem dependências.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SplashScreen>

export const Default: Story = {
  args: {
    onDone: () => console.log('Splash concluído'),
  },
}

export const Replay: Story = {
  render: () => {
    const [key, setKey] = useState(0)
    return (
      <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
        <SplashScreen key={key} onDone={() => {}} />
        <button
          onClick={() => setKey((k) => k + 1)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 99999,
            padding: '8px 18px',
            background: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(5,150,105,0.35)',
          }}
        >
          ↺ Replay
        </button>
      </div>
    )
  },
}
