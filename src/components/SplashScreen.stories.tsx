import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SplashScreen } from './SplashScreen'

const meta: Meta<typeof SplashScreen> = {
  title: 'UI/SplashScreen',
  component: SplashScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Tela de boas-vindas exibida após o login. Animação CSS pura: logo entra com spring (cubic-bezier), tagline sobe com fade, tela faz fade-out em 2,8 s e chama `onDone`.',
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
    const [key, setKey] = React.useState(0)
    return (
      <div style={{ position: 'relative' }}>
        <SplashScreen key={key} onDone={() => {}} />
        <button
          onClick={() => setKey((k) => k + 1)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 99999,
            padding: '8px 16px',
            background: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ↺ Replay
        </button>
      </div>
    )
  },
}
