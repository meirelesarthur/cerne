import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Outfit', sans-serif" },
        body: { value: "'Outfit', sans-serif" },
        mono: { value: "'Fira Code', monospace" },
      },
      colors: {
        emerald: {
          50: { value: '#ecfdf5' },
          100: { value: '#d1fae5' },
          200: { value: '#a7f3d0' },
          300: { value: '#6ee7b7' },
          400: { value: '#34d399' },
          500: { value: '#10b981' },
          600: { value: '#059669' },
          700: { value: '#047857' },
          800: { value: '#065f46' },
          900: { value: '#064e3b' },
          950: { value: '#022c22' },
        },
        gray: {
          50: { value: '#fafafa' },
          100: { value: '#f5f5f5' },
          200: { value: '#e5e5e5' },
          300: { value: '#d4d4d4' },
          400: { value: '#a3a3a3' },
          500: { value: '#737373' },
          600: { value: '#525252' },
          700: { value: '#404040' },
          800: { value: '#262626' },
          900: { value: '#171717' },
        },
      },
      radii: {
        panel: { value: '16px' },
        item: { value: '8px' },
        badge: { value: '9999px' },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.emerald.600}' },
          contrast: { value: 'white' },
          fg: { value: '{colors.emerald.600}' },
          muted: { value: '{colors.emerald.50}' },
          subtle: { value: '{colors.emerald.100}' },
          emphasized: { value: '{colors.emerald.200}' },
          focusRing: { value: '{colors.emerald.500}' },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
