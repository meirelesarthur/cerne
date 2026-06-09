/**
 * GB CERNE Design Tokens
 * Nomenclatura inspirada no Tailwind CSS, adaptada para o contexto agrícola.
 * Toda decisão visual do sistema deve referenciar este arquivo.
 */

// ─── Cores ─────────────────────────────────────────────────────────────────

export const color = {
  /** Verde primário — identidade GB CERNE */
  brand: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#059669', // principal
    700: '#047857', // hover
    800: '#065f46',
    900: '#064e3b',
  },

  /** Escala de neutros (cinzas e pretos) */
  neutral: {
    0:   '#ffffff',
    50:  '#fafafa',
    100: '#f5f5f5',
    150: '#f3f4f6',
    200: '#e5e7eb',
    250: '#e5e5e5',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#616161',
    700: '#404040',
    800: '#1a1a1a',
    900: '#111827',
    950: '#171717',
  },

  /** Notificação — âmbar (substitui valores hardcoded #f59e0b) */
  notification: '#f59e0b',

  /** Overlays de modais e drawers (fundos escurecidos atrás de dialogs) */
  overlay: {
    modal:  'rgba(0,0,0,0.45)',
    drawer: 'rgba(0,0,0,0.18)',
  },

  /** Acentos exclusivos do GBMode (tema escuro) — evita hex solto nos charts */
  gbAccent:  '#4ade80',              // = brand[400], texto/destaque sobre fundo escuro
  gbSurface: 'rgba(14,42,29,0.55)',  // superfície translúcida de cards no GBMode

  /** Semânticos */
  success: {
    bg:     '#f0fdf4',
    border: '#bbf7d0',
    text:   '#059669',
    solid:  '#059669',
  },
  error: {
    bg:     '#fee2e2',
    border: '#fca5a5',
    text:   '#dc2626',
    solid:  '#dc2626',
  },
  warning: {
    bg:     '#fffbeb',
    border: '#fde68a',
    text:   '#d97706',
    solid:  '#f59e0b',
  },
  info: {
    bg:     '#eff6ff',
    border: '#bfdbfe',
    text:   '#2563eb',
    solid:  '#3b82f6',
  },

  /** Acentos auxiliares para Badge/Tag (variantes não-semânticas) */
  purple: {
    bg:   '#f5f3ff',
    text: '#7c3aed',
  },
  cyan: {
    bg:   '#ecfeff',
    text: '#0891b2',
  },
}

// ─── Tipografia ─────────────────────────────────────────────────────────────

export const font = {
  family: {
    sans: "'Outfit', sans-serif",
  },

  /** Em pixels — equivalentes Tailwind: xs=11 sm=12 base=13 md=14 lg=15 xl=16 */
  size: {
    xs:   11,
    sm:   12,
    base: 13,
    md:   14,
    lg:   15,
    xl:   16,
    '2xl': 22,
    '3xl': 26,
    '4xl': 32,
  },

  weight: {
    normal:    400,
    medium:    500,
    semibold:  600,
    bold:      700,
    extrabold: 800,
  },

  lineHeight: {
    tight:  1.2,
    snug:   1.35,
    normal: 1.5,
    relaxed: 1.625,
  },
}

// ─── Espaçamento ─────────────────────────────────────────────────────────────
// Base 4px — idêntico ao Tailwind (space[1]=4px, space[2]=8px...)

export const space = {
  0:  0,
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  7:  28,
  8:  32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
}

// ─── Tamanhos de controle ───────────────────────────────────────────────────
// Alturas/larguras reutilizadas de controles interativos. Centraliza os px
// antes soltos em FormField, Button, ToggleSwitch, IconButton, etc.

export const size = {
  /** Altura de inputs/selects/botões padrão */
  control:   38,
  controlSm: 30,
  controlLg: 46,
  /** Botões apenas-ícone (sm/md/lg) */
  iconBtn: {
    sm: 24,
    md: 30,
    lg: 36,
  },
  /** Switch (track + thumb) */
  toggle: {
    track: 40,
    thumb: 18,
  },
  /** Botões de paginação (quadrados) */
  pageBtn: 32,
  /** Altura fixa da linha de dados das tabelas (não cresce com quebra de texto) */
  tableRow: 48,
  /** Largura do FilterDrawer lateral */
  drawer:  320,
  /** Largura dos botões do StepFooter */
  stepBtn: 180,
}

// ─── Border radius ────────────────────────────────────────────────────────────

export const radius = {
  sm:      4,
  md:      6,
  DEFAULT: 8,   // inputs, botões
  lg:      10,  // tabelas com borda
  xl:      12,  // cards de formulário
  '2xl':   16,  // container principal
  '3xl':   20,  // modais grandes
  '4xl':   24,  // containers expandidos
  modal:   20,  // alias semântico para modais
  full:    9999,
}

// ─── Sombras ─────────────────────────────────────────────────────────────────

export const shadow = {
  sm:      '0 1px 2px rgba(0,0,0,0.05)',
  DEFAULT: '0 1px 4px rgba(0,0,0,0.08)',
  md:      '0 4px 12px rgba(0,0,0,0.08)',
  lg:      '0 8px 24px rgba(0,0,0,0.10)',
  brand:   '0 4px 16px rgba(5,150,105,0.25)',
  overlay: '0 24px 64px rgba(0,0,0,0.14)', // sombra para modais/overlays
  modal:   '0 8px 40px rgba(0,0,0,0.12)',  // sombra focada para dialogs

  /** Cards de dashboard — estado idle e hover (light + GBMode) */
  card:        '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardHover:   '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
  cardDark:    '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
  cardDarkHover: '0 8px 28px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)',
}

// ─── Bordas ───────────────────────────────────────────────────────────────────

export const border = {
  DEFAULT: `1px solid ${color.neutral[200]}`,
  medium:  `1.5px solid ${color.neutral[250]}`,
  brand:   `1px solid ${color.brand[200]}`,
  error:   `1.5px solid ${color.error.solid}`,
}

// ─── Z-index ──────────────────────────────────────────────────────────────────

export const zIndex = {
  base:    1,
  dropdown: 100,
  overlay: 200,
  drawer:  201,
  toast:   9999,
}

// ─── Transições ───────────────────────────────────────────────────────────────

export const transition = {
  fast:    '0.1s ease',
  DEFAULT: '0.15s ease',
  smooth:  '0.2s ease',
  drawer:  '0.25s cubic-bezier(0.4, 0, 0.2, 1)',
}

// ─── Animações ───────────────────────────────────────────────────────────────

export const animation = {
  duration: {
    fast:   '150ms',
    normal: '200ms',
    slow:   '300ms',
    slower: '400ms',
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut:  'cubic-bezier(0, 0, 0.2, 1)',
    easeIn:   'cubic-bezier(0.4, 0, 1, 1)',
    spring:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
}

// ─── Glow / Focus rings ───────────────────────────────────────────────────────

export const glow = {
  brand:   '0 0 0 3px rgba(5,150,105, 0.12)',
  brandLg: '0 8px 32px rgba(5,150,105, 0.28)',
  error:   '0 0 0 3px rgba(220,38,38, 0.10)',
}

// ─── Tema da tela de login ────────────────────────────────────────────────────

export const loginTheme = {
  leftBg:     '#081a12',         // Verde muito escuro — substitui marrom #1c1917
  rightBg:    '#fafaf9',         // Warm white — substitui branco frio #ffffff
  accentGlow: 'rgba(5,150,105, 0.05)',
}

// ─── Tokens para tiles de dashboard ──────────────────────────────────────────
// Backgrounds escuros exclusivos da visualização de scoreboards no OverviewPanel

export const dashboard = {
  tileRevenue:    '#1b4332',  // verde escuro — receitas
  tileExpense:    '#7f1d1d',  // vermelho escuro — despesas
  tileFinance:    '#1e3a5f',  // azul escuro — análise financeira
  tileProduction: '#14532d',  // verde escuro alt — produção
  tileDark:       '#1c1917',  // quase-preto — produtividade / neutro
}

// ─── Tokens para séries de gráficos ──────────────────────────────────────────

export const chart = {
  revenue: '#3b82f6',  // azul — receitas (equivale a color.info.solid)
  expense: '#ef4444',  // vermelho vivo — despesas
}

// ─── Layout ───────────────────────────────────────────────────────────────────
// Constantes do chassi da aplicação (AppLayout). Centralizadas para evitar
// números mágicos espalhados nas telas.

export const layout = {
  /**
   * Altura total consumida pelo chassi acima/abaixo da área de conteúdo:
   * padding do root (8+8) + padding do card externo (8+8) + Topbar (48) + gap (8) = 88.
   * Use `calc(100vh - ${t.layout.contentOffset}px)` para um card que preenche
   * exatamente a altura da navegação secundária (sub-menu).
   */
  contentOffset: 88,
}

// ─── Atalho global ────────────────────────────────────────────────────────────
// Importe `t` para acesso rápido: t.color.brand[600], t.space[4], t.font.size.base

export const t = { color, font, space, size, radius, shadow, border, zIndex, transition, animation, glow, login: loginTheme, dashboard, chart, layout }
export default t
