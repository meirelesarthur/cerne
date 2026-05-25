import React from 'react'
import type { Preview, Decorator } from '@storybook/react-vite'
import '../src/index.css'
import { cerneTheme } from './theme'
import { ThemeProvider } from '../src/context/ThemeContext'
import type { ThemeMode } from '../src/context/ThemeContext'

// ─── Decorator ────────────────────────────────────────────────────────────────
// Wraps every story in ThemeProvider. The `key` forces a remount when mode
// changes so the initial state resets correctly.

const withTheme: Decorator = (Story, context) => {
  const mode: ThemeMode = context.globals.theme === 'gbMode' ? 'gbMode' : 'light'

  const bg = mode === 'gbMode' ? '#051008' : '#f5f5f5'

  return React.createElement(
    ThemeProvider,
    { key: mode, defaultMode: mode },
    React.createElement(
      'div',
      {
        style: {
          background: bg,
          minHeight: '100vh',
          padding: 24,
          transition: 'background 0.2s',
        },
        'data-theme': mode,
      },
      React.createElement(Story, context.args),
    ),
  )
}

// ─── Preview config ───────────────────────────────────────────────────────────

const preview: Preview = {
  decorators: [withTheme],

  globals: {
    theme: 'light',
  },

  globalTypes: {
    theme: {
      description: 'Tema da interface',
      toolbar: {
        title: 'Tema',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'gbMode', title: 'GB Mode', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },

  parameters: {
    docs: {
      theme: cerneTheme,
    },
    backgrounds: {
      disable: true, // backgrounds handled by the decorator
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
}

export default preview
