import React, { createContext, useContext, useState, useEffect } from 'react'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'gbMode'

export interface ThemeColors {
  // Layout
  pageBg:        string
  outerCardBg:   string
  sidebarBg:     string
  // Surfaces
  surfaceBg:     string
  surfaceSubtle: string
  inputBg:       string
  // Borders
  border:        string
  borderSubtle:  string
  // Text
  textPrimary:   string
  textSecondary: string
  textMuted:     string
  // Nav
  navText:       string
  navTextActive: string
  navTextMuted:  string
  navItemActive: string
  navItemHover:  string
  navDivider:    string
  // Brand
  brand:         string
  brandHover:    string
  brandBg:       string
  // Misc
  shadow:        string
}

// ─── Paletas ─────────────────────────────────────────────────────────────────

const light: ThemeColors = {
  pageBg:        '#f5f5f5',
  outerCardBg:   '#fafafa',
  sidebarBg:     '#ffffff',
  surfaceBg:     '#ffffff',
  surfaceSubtle: '#f5f5f5',
  inputBg:       '#fafafa',
  border:        '#e5e7eb',
  borderSubtle:  '#f0f0f0',
  textPrimary:   '#171717',
  textSecondary: '#404040',
  textMuted:     '#9ca3af',
  navText:       '#525252',
  navTextActive: '#171717',
  navTextMuted:  '#9ca3af',
  navItemActive: '#f0fdf4',
  navItemHover:  'rgba(0,0,0,0.04)',
  navDivider:    '#f0f0f0',
  brand:         '#059669',
  brandHover:    '#047857',
  brandBg:       '#f0fdf4',
  shadow:        '0 1px 4px rgba(0,0,0,0.06)',
}

/** Extraído do Figma: https://figma.com/design/S8qJ9G8mbenqZ0Zcq3XnrE — node 53941:3849 */
const gbMode: ThemeColors = {
  pageBg:        '#051008',
  outerCardBg:   '#081a12',
  sidebarBg:     '#081a12',
  surfaceBg:     '#0e2a1d',
  surfaceSubtle: '#0b1e14',
  inputBg:       '#132f22',
  border:        '#1c3f2c',
  borderSubtle:  'rgba(28,63,44,0.5)',
  textPrimary:   '#e2f0e8',
  textSecondary: '#7da893',
  textMuted:     'rgba(216,237,226,0.4)',
  navText:       'rgba(216,237,226,0.55)',
  navTextActive: '#d8ede2',
  navTextMuted:  'rgba(216,237,226,0.3)',
  navItemActive: '#0b1e14',
  navItemHover:  'rgba(255,255,255,0.04)',
  navDivider:    'rgba(28,63,44,0.8)',
  brand:         '#10b981',
  brandHover:    '#059669',
  brandBg:       'rgba(16,185,129,0.12)',
  shadow:        '0 1px 4px rgba(0,0,0,0.3)',
}

export const palettes: Record<ThemeMode, ThemeColors> = { light, gbMode }

// ─── Context ─────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  mode: ThemeMode
  colors: ThemeColors
  toggle: () => void
  isGbMode: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  colors: light,
  toggle: () => {},
  isGbMode: false,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light')
  const toggle = () => setMode((m) => (m === 'light' ? 'gbMode' : 'light'))
  const colors = palettes[mode]

  useEffect(() => {
    document.body.setAttribute('data-theme', mode)
    return () => { document.body.removeAttribute('data-theme') }
  }, [mode])

  return (
    <ThemeContext.Provider value={{ mode, colors, toggle, isGbMode: mode === 'gbMode' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
