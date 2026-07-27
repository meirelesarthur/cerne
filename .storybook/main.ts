import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.stories.@(ts|tsx)',
    '../src/components/**/*.mdx',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook',
    '@storybook/addon-mcp'
  ],
  framework: '@storybook/react-vite',
}

export default config
