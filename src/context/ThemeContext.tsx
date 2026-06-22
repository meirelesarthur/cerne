import React, { createContext, useContext, useState, useEffect } from 'react'
import { themePalette, type ThemePalette } from '../design/tokens'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'gbMode'

/**
 * Papéis semânticos de tela (theme-aware). A definição canônica das paletas vive
 * em `src/design/tokens.ts` (`themePalette`) — este contexto apenas seleciona o
 * set ativo. Estrutura estilo Primer/DTCG: fg/bg/border/accent/nav/shadow.
 */
export type ThemeColors = ThemePalette

// ─── Paletas (fonte única: tokens.ts) ──────────────────────────────────────────

export const palettes: Record<ThemeMode, ThemeColors> = themePalette

// ─── Context ─────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  mode: ThemeMode
  colors: ThemeColors
  toggle: () => void
  isGbMode: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  colors: palettes.light,
  toggle: () => {},
  isGbMode: false,
})

export function ThemeProvider({ children, defaultMode = 'light' }: { children: React.ReactNode; defaultMode?: ThemeMode }) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode)
  const toggle = () => setMode((m) => (m === 'light' ? 'gbMode' : 'light'))
  const colors = palettes[mode]

  useEffect(() => {
    document.body.setAttribute('data-theme', mode)
    // Alinha scrollbars e controles nativos do OS ao tema ativo (UI Guide).
    document.documentElement.style.colorScheme = mode === 'gbMode' ? 'dark' : 'light'
    return () => {
      document.body.removeAttribute('data-theme')
      document.documentElement.style.colorScheme = ''
    }
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
