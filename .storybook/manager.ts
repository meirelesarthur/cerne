import { addons } from 'storybook/manager-api'
import { cerneTheme } from './theme'

addons.setConfig({
  theme: cerneTheme,
  sidebar: {
    showRoots: true,
  },
})
