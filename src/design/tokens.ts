/**
 * GB CERNE Design Tokens
 *
 * Arquitetura semântica em 3 camadas (padrão W3C DTCG / GitHub Primer):
 *   1. PRIMITIVOS   — rampas cruas, sem papel (brand, neutral, red, amber, blue).
 *   2. SEMÂNTICO    — papéis que referenciam primitivos:
 *        • theme-agnostic (`color.feedback`, `color.accent`, `color.state`, `color.overlay`, `color.gb`)
 *        • theme-aware    (`themePalette.light` / `themePalette.gbMode` → consumidos pelo ThemeContext)
 *   3. FUNDAÇÃO/COMPONENTE — escalas não-cor (font, space, size, radius…) e tokens de componente.
 *
 * Fonte única do sistema: toda decisão visual referencia este arquivo (via `t.*`
 * ou `useTheme().colors`). Exportação para o ecossistema de design segue o padrão
 * W3C DTCG — ver `scripts/export-tokens-dtcg.ts` (Lei 5).
 */

// ═══════════════════════════════════════════════════════════════════════════
// CAMADA 1 — PRIMITIVOS (theme-agnostic)
// Rampas cruas. Não carregam papel/semântica; são a base que o restante alia.
// ═══════════════════════════════════════════════════════════════════════════

export const primitive = {
  /** Verde primário — identidade GB CERNE (600 principal · 700 hover) */
  brand: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#059669',
    700: '#047857',
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

  /** Vermelho — base do feedback negativo (600 = texto/sólido de erro) */
  red: {
    50:  '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  /** Âmbar — base de warning e notificação (500 = sólido · 600 = texto) */
  amber: {
    50:  '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  /** Azul — base de informação (500 = sólido · 600 = texto) */
  blue: {
    50:  '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// CAMADA 2a — SEMÂNTICO theme-agnostic (papéis que não dependem do tema)
// Aliam primitivos. Consumidos via `t.color.<grupo>` — sem hook de tema.
// ═══════════════════════════════════════════════════════════════════════════

/** Feedback de estado (success/error/warning/info) + aviso pontual */
const feedback = {
  success: {
    bg:     primitive.brand[50],
    border: primitive.brand[200],
    /** brand[700] — brand[600] media 3.60:1 contra bg (reprovado AA); 700 = 5.24:1 */
    text:   primitive.brand[700],
    solid:  primitive.brand[600],
  },
  error: {
    bg:     primitive.red[100],
    border: primitive.red[300],
    /** red[700] — red[600] media 3.95:1 contra bg (reprovado AA); 700 = 5.30:1 */
    text:   primitive.red[700],
    solid:  primitive.red[600],
  },
  warning: {
    bg:     primitive.amber[50],
    border: primitive.amber[200],
    /** amber[700] — amber[600] media 3.07:1 contra bg (reprovado AA); 700 = 4.84:1 */
    text:   primitive.amber[700],
    solid:  primitive.amber[500],
  },
  info: {
    bg:     primitive.blue[50],
    border: primitive.blue[200],
    text:   primitive.blue[600],
    solid:  primitive.blue[500],
  },
  /** Cor pontual de notificação/alerta (badge "novo", ponto de aviso) */
  notice: primitive.amber[500],
}

/** Acentos auxiliares para Badge/Tag (variantes não-semânticas) */
const accent = {
  purple: { bg: '#f5f3ff', text: '#7c3aed' },
  /** #0e7490 (cyan-700) — #0891b2 media 3.54:1 contra bg (reprovado AA); 700 = 5.15:1 */
  cyan:   { bg: '#ecfeff', text: '#0e7490' },
}

/** Estados de controle e de linha de tabela */
const state = {
  /** Desabilitado — superfície apagada, texto/borda suaves */
  disabled: {
    bg:     primitive.neutral[100],
    text:   primitive.neutral[400],
    border: primitive.neutral[200],
  },
  /** Somente-leitura (read-only) — superfície sutil, texto legível */
  readonly: {
    bg:     primitive.neutral[50],
    text:   primitive.neutral[700],
    border: primitive.neutral[200],
  },
  /** Linhas de tabela (hover/selecionada/zebra) — light + GBMode */
  row: {
    hover:       primitive.neutral[100],            // light
    hoverGb:     'rgba(255,255,255,0.03)',          // GBMode
    selected:    primitive.brand[50],               // light
    selectedGb:  'rgba(16,185,129,0.06)',           // GBMode
    striped:     primitive.neutral[50],             // light
    stripedGb:   'rgba(255,255,255,0.015)',         // GBMode
  },
}

/** Fundos escurecidos atrás de dialogs/drawers */
const overlay = {
  modal:  'rgba(0,0,0,0.45)',
  drawer: 'rgba(0,0,0,0.18)',
}

/** Acentos exclusivos do GBMode (tema escuro) — ver FIGMA_NAMING `color/gb/*` */
const gb = {
  accent:  '#4ade80',              // verde claro de destaque (= brand[400])
  surface: 'rgba(14,42,29,0.55)',  // superfície translúcida de cards no GBMode
}

// ─── Superfície pública de cor ─────────────────────────────────────────────
// Expõe primitivos + grupos semânticos theme-agnostic. Os papéis theme-aware
// (fg/bg/border/accent de tela) ficam em `themePalette`, consumidos via useTheme.

export const color = {
  // primitivos
  brand:   primitive.brand,
  neutral: primitive.neutral,
  red:     primitive.red,
  amber:   primitive.amber,
  blue:    primitive.blue,
  // semânticos theme-agnostic
  feedback,
  accent,
  state,
  overlay,
  gb,
}

// ═══════════════════════════════════════════════════════════════════════════
// CAMADA 2b — SEMÂNTICO theme-aware (papéis de tela, resolvidos por tema)
// Sets light / gbMode consumidos pelo ThemeContext. Nomes estilo Primer/DTCG:
//   fg     → texto         bg     → superfícies      border → linhas
//   accent → marca/ação    nav    → navegação        shadow → sombra base
// ═══════════════════════════════════════════════════════════════════════════

export interface ThemePalette {
  fg:     { default: string; muted: string; subtle: string; onAccent: string }
  bg:     { canvas: string; outer: string; surface: string; subtle: string; input: string; sidebar: string }
  border: { default: string; subtle: string }
  accent: { default: string; hover: string; subtle: string }
  nav: {
    text: string; textActive: string; textMuted: string
    itemActive: string; itemHover: string; divider: string
  }
  shadow: string
}

const lightPalette: ThemePalette = {
  fg: {
    default:  primitive.neutral[950],   // #171717
    muted:    primitive.neutral[700],   // #404040
    subtle:   primitive.neutral[500],   // #6b7280
    onAccent: primitive.neutral[0],     // #ffffff
  },
  bg: {
    canvas:  '#f0f0f0',
    outer:   primitive.neutral[50],     // #fafafa
    surface: primitive.neutral[0],      // #ffffff
    subtle:  primitive.neutral[100],    // #f5f5f5
    input:   primitive.neutral[50],     // #fafafa
    sidebar: primitive.neutral[0],      // #ffffff
  },
  border: {
    default: primitive.neutral[200],    // #e5e7eb
    subtle:  '#f0f0f0',
  },
  accent: {
    default: primitive.brand[600],      // #059669
    hover:   primitive.brand[700],      // #047857
    subtle:  primitive.brand[50],       // #f0fdf4
  },
  nav: {
    text:       '#525252',
    textActive: primitive.neutral[950], // #171717
    textMuted:  primitive.neutral[500], // #6b7280
    itemActive: primitive.brand[50],    // #f0fdf4
    itemHover:  'rgba(0,0,0,0.04)',
    divider:    '#f0f0f0',
  },
  shadow: '0 1px 4px rgba(0,0,0,0.06)',
}

/** Extraído do Figma: https://figma.com/design/S8qJ9G8mbenqZ0Zcq3XnrE — node 53941:3849 */
const gbModePalette: ThemePalette = {
  fg: {
    default:  '#e2f0e8',
    muted:    '#7da893',
    subtle:   'rgba(216,237,226,0.6)',
    onAccent: primitive.neutral[0],     // #ffffff
  },
  bg: {
    canvas:  '#051008',
    outer:   '#081a12',
    surface: '#0e2a1d',
    subtle:  '#0b1e14',
    input:   '#132f22',
    sidebar: '#081a12',
  },
  border: {
    default: '#1c3f2c',
    subtle:  'rgba(28,63,44,0.5)',
  },
  accent: {
    default: '#10b981',
    hover:   primitive.brand[600],      // #059669
    subtle:  'rgba(16,185,129,0.12)',
  },
  nav: {
    text:       'rgba(216,237,226,0.55)',
    textActive: '#d8ede2',
    textMuted:  'rgba(216,237,226,0.45)',
    itemActive: '#0b1e14',
    itemHover:  'rgba(255,255,255,0.04)',
    divider:    'rgba(28,63,44,0.8)',
  },
  shadow: '0 1px 4px rgba(0,0,0,0.3)',
}

export const themePalette = { light: lightPalette, gbMode: gbModePalette }

// ═══════════════════════════════════════════════════════════════════════════
// CAMADA 3 — FUNDAÇÃO (theme-agnostic, não-cor)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Tipografia ─────────────────────────────────────────────────────────────

export const font = {
  family: {
    sans: "'Outfit', sans-serif",
  },

  /** Em pixels. Escala calibrada para legibilidade (público idoso / baixa acuidade):
   *  corpo padrão `base = 16px` (mínimo WCAG). Texto de interface nunca abaixo de
   *  `xs (13px)`; `2xs`/`3xs` (12/11px) são PISO DE CANVAS — uso restrito a rótulos
   *  densos de gráfico/SVG, jamais em labels, valores, badges ou navegação. */
  size: {
    '3xs': 11,
    '2xs': 12,
    xs:   13,
    sm:   14,
    base: 16,
    md:   18,
    lg:   20,
    xl:   24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 44,
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
  9:  36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
}

// ─── Tamanhos de controle ───────────────────────────────────────────────────
// Alturas/larguras reutilizadas de controles interativos.

export const size = {
  /** Altura de inputs/selects padrão — alinhada ao botão md (t.size.btn.md) */
  control:   40,
  controlSm: 36,
  controlLg: 44,
  /** Alturas dos botões (sm/md/lg) — md é o padrão do sistema */
  btn: {
    sm: 36,
    md: 40,
    lg: 44,
  },
  /** Botões apenas-ícone (sm/md/lg) */
  iconBtn: {
    sm: 28,
    md: 34,
    lg: 40,
  },
  /** Switch (track: largura · trackHeight: altura · thumb) */
  toggle: {
    track: 44,
    trackHeight: 24,
    thumb: 20,
  },
  /** Caixa do Checkbox (quadrada) */
  checkbox: 20,
  /** Célula de dia do calendário (DatePicker) */
  calendarCell: 36,
  /** Botões de paginação (quadrados) */
  pageBtn: 36,
  /** Altura fixa da linha de dados das tabelas (não cresce com quebra de texto) */
  tableRow: 48,
  /** Largura do FilterDrawer lateral */
  drawer:  340,
  /** Largura mínima dos botões do StepFooter (usar como minWidth — o rótulo cresce o botão) */
  stepBtn: 200,
}

// ─── Ícones ─────────────────────────────────────────────────────────────────
// Escala de ícone atrelada ao texto adjacente — evita ícone desproporcional ao
// lado do rótulo. Regra: use `icon.sm` junto de texto `sm/base`, `icon.md` com
// `md`, etc. Nunca escolher tamanho de ícone ad-hoc na página.

export const icon = {
  xs: 14,  // ao lado de texto xs/sm — ações de linha densas
  sm: 16,  // padrão — botões, inputs, itens de menu
  md: 18,  // títulos de seção, ícones-chip
  lg: 22,  // cabeçalhos, destaque
  xl: 28,  // estados vazios, ilustração leve
}

// ─── Border radius ────────────────────────────────────────────────────────────

export const radius = {
  sm:    4,
  md:    6,
  base:  8,   // inputs, botões (raio padrão do sistema)
  lg:    10,  // tabelas com borda
  xl:    12,  // cards de formulário
  '2xl': 16,  // container principal
  '3xl': 20,  // modais grandes
  '4xl': 24,  // containers expandidos
  modal: 20,  // alias semântico para modais
  full:  9999,
}

// ─── Sombras ─────────────────────────────────────────────────────────────────

export const shadow = {
  sm:      '0 1px 2px rgba(0,0,0,0.05)',
  base:    '0 1px 4px rgba(0,0,0,0.08)',
  md:      '0 4px 12px rgba(0,0,0,0.08)',
  lg:      '0 8px 24px rgba(0,0,0,0.10)',
  brand:   '0 4px 16px rgba(5,150,105,0.25)',
  overlay: '0 24px 64px rgba(0,0,0,0.14)', // sombra para modais/overlays
  modal:   '0 8px 40px rgba(0,0,0,0.12)',  // sombra focada para dialogs

  /** Cards de dashboard — estado idle e hover (light + GBMode) */
  card:          '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardHover:     '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
  cardDark:      '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
  cardDarkHover: '0 8px 28px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)',

  /** Realce de marca de gráfico (barra/fatia/ponto) — usar via `drop-shadow(...)` */
  chartMark:     '0 2px 4px rgba(0,0,0,0.12)',
}

// ─── Bordas ───────────────────────────────────────────────────────────────────

export const border = {
  base:   `1px solid ${primitive.neutral[200]}`,
  medium: `1.5px solid ${primitive.neutral[250]}`,
  brand:  `1px solid ${primitive.brand[200]}`,
  error:  `1.5px solid ${primitive.red[600]}`,
}

// ─── Z-index ──────────────────────────────────────────────────────────────────

export const zIndex = {
  base:     1,
  dropdown: 100,
  overlay:  200,
  drawer:   201,
  toast:    9999,
}

// ─── Transições ───────────────────────────────────────────────────────────────

export const transition = {
  fast:   '0.1s ease',
  base:   '0.15s ease',
  smooth: '0.2s ease',
  drawer: '0.25s cubic-bezier(0.4, 0, 0.2, 1)',
}

// ─── Animações ───────────────────────────────────────────────────────────────

export const animation = {
  duration: {
    faster: '120ms',
    fast:   '150ms',
    normal: '200ms',
    slow:   '300ms',
    slower: '400ms',
  },
  easing: {
    standard:  'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut:   'cubic-bezier(0, 0, 0.2, 1)',
    easeIn:    'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring:    'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
}

// ─── Delays de loading ─────────────────────────────────────────────────────────
// Atrasar a exibição do loading evita flash; manter um tempo mínimo evita flicker.

export const delay = {
  /** Espera antes de exibir o indicador de loading (evita flash) */
  loadingShow: 225,  // ms — meio da faixa 150–300
  /** Tempo mínimo que o loading permanece visível (evita flicker) */
  loadingMin:  400,  // ms — meio da faixa 300–500
}

// ─── Glow / Focus rings ───────────────────────────────────────────────────────

export const glow = {
  brand:   '0 0 0 3px rgba(5,150,105, 0.12)',
  brandLg: '0 8px 32px rgba(5,150,105, 0.28)',
  error:   '0 0 0 3px rgba(220,38,38, 0.10)',
}

// ─── Breakpoints ───────────────────────────────────────────────────────────────

export const breakpoint = {
  xs: 360,   // menor alvo de teste
  sm: 768,   // limite do ViewportGuard / tablet
  md: 1024,
  lg: 1280,  // laptop de referência
  xl: 1920,  // wide de referência
}

// ─── Layout ───────────────────────────────────────────────────────────────────
// Constantes do chassi da aplicação (AppLayout).

export const layout = {
  /**
   * Altura total consumida pelo chassi acima/abaixo da área de conteúdo:
   * padding do root (8+8) + padding do card externo (8+8) + Topbar (48) + gap (8) = 88.
   */
  contentOffset: 88,
  /**
   * Distância do topo da viewport até o topo da área de conteúdo / navegação secundária.
   */
  contentTop: 72,
  /** Folga externa do chassi (root pad 8 + card pad 8 = 16). */
  gutter: 16,
}

// ─── Gráficos ──────────────────────────────────────────────────────────────────

export const chart = {
  revenue: '#3b82f6',  // azul — receitas (= feedback.info.solid)
  expense: '#ef4444',  // vermelho vivo — despesas
  /** Paleta categórica para múltiplas séries (até 8) — ordem estável */
  series: [
    '#059669',  // 1 — brand
    '#3b82f6',  // 2 — azul
    '#f59e0b',  // 3 — âmbar
    '#7c3aed',  // 4 — roxo
    '#ef4444',  // 5 — vermelho
    '#0891b2',  // 6 — ciano
    '#d97706',  // 7 — laranja
    '#65a30d',  // 8 — verde-limão
  ],
  /** Linhas de grade / eixos dos gráficos */
  grid:   'rgba(0,0,0,0.06)',
  gridGb: 'rgba(255,255,255,0.06)',
  /** Superfície sob a marca do gráfico (rótulo/traço sobre a barra) — light + GBMode */
  surface:   '#ffffff',
  surfaceGb: '#0b1e14',
}

// ─── Tokens de componente (camada 3 — "theme" da referência DTCG) ──────────────

export const component = {
  /** Backgrounds escuros dos tiles de scoreboard no OverviewPanel */
  dashboardTile: {
    revenue:    '#1b4332',  // verde escuro — receitas
    expense:    '#7f1d1d',  // vermelho escuro — despesas
    finance:    '#1e3a5f',  // azul escuro — análise financeira
    production: '#14532d',  // verde escuro alt — produção
    dark:       '#1c1917',  // quase-preto — produtividade / neutro
  },
  /** Tela de login (split-screen) */
  login: {
    leftBg:     '#081a12',         // verde muito escuro
    rightBg:    '#fafaf9',         // warm white
    accentGlow: 'rgba(5,150,105, 0.05)',
  },
}

// ─── Atalho global ────────────────────────────────────────────────────────────
// Importe `t` para acesso rápido: t.color.brand[600], t.space[4], t.font.size.base

export const t = {
  color, font, space, size, icon, radius, shadow, border, transition,
  zIndex, animation, delay, glow,
  breakpoint, layout, chart, component, themePalette,
}
export default t
