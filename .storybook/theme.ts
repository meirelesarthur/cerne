import { create } from 'storybook/theming/create'

export const cerneTheme = create({
  base: 'light',

  // Brand
  brandTitle: 'Cerne · Design System',
  brandUrl: 'https://github.com/meirelesarthur/cerne',
  brandTarget: '_blank',

  // Colors
  colorPrimary: '#059669',
  colorSecondary: '#059669',

  // UI
  appBg: '#f5f5f5',
  appContentBg: '#ffffff',
  appPreviewBg: '#f5f5f5',
  appBorderColor: '#e5e5e5',
  appBorderRadius: 10,

  // Text
  textColor: '#1a1a1a',
  textMutedColor: '#737373',
  textInverseColor: '#ffffff',

  // Toolbar
  barTextColor: '#737373',
  barHoverColor: '#059669',
  barSelectedColor: '#059669',
  barBg: '#ffffff',

  // Inputs
  inputBg: '#ffffff',
  inputBorder: '#e5e5e5',
  inputTextColor: '#1a1a1a',
  inputBorderRadius: 6,

  // Font
  fontBase: '"Outfit", system-ui, sans-serif',
  fontCode: '"JetBrains Mono", "Fira Code", monospace',
})
