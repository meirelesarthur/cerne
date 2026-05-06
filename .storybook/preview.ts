import type { Preview } from '@storybook/react-vite'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light-gray',
      values: [
        { name: 'white', value: '#ffffff' },
        { name: 'light-gray', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
      ],
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
