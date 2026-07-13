/**
 * Exporta src/design/tokens.ts → tokens/tokens.json (W3C DTCG)
 *
 * Estrutura de saída (3 camadas + componente), espelhando a arquitetura de
 * tokens.ts e o padrão Tokens Studio (sets + $themes):
 *
 *   core      → primitivos (rampas) + fundação não-cor (font/space/size/…)
 *   semantic  → papéis theme-agnostic (feedback/accent/state/overlay/gb)  → alias p/ core
 *   light     → papéis de tela no tema claro (fg/bg/border/accent/nav/shadow) → alias p/ core
 *   gbMode    → papéis de tela no tema escuro
 *   component → tokens de componente (dashboardTile/login)
 *
 * Saída consumida por:
 *   1. Tokens Studio (plugin Figma) → sincroniza com Figma Variables (Modes Light/GBMode)
 *   2. Supernova → importa as Variables do Figma como data source
 *
 * Rodar:  npx tsx scripts/export-tokens-dtcg.ts   ou   npm run tokens:export
 *
 * Direção do fluxo (imutável — Lei 5):
 *   tokens.ts → tokens.json → Figma Variables → Supernova
 *   Figma/Supernova NUNCA definem tokens — apenas consomem.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as t from '../src/design/tokens.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Tipos DTCG ──────────────────────────────────────────────────────────────

type DTCGLeaf = { $value: unknown; $type: string; $description?: string }
type DTCGNode = DTCGLeaf | { [key: string]: DTCGNode }

// ─── Helpers ─────────────────────────────────────────────────────────────────

const px = (n: number) => `${n}px`

/** Converte recursivamente objeto de strings para tokens de cor DTCG (valor literal) */
function colorGroup(obj: Record<string, unknown>): Record<string, DTCGNode> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (typeof v === 'string') return [k, { $value: v, $type: 'color' }]
      if (typeof v === 'object' && v !== null)
        return [k, colorGroup(v as Record<string, unknown>)]
      return [k, { $value: v, $type: 'color' }]
    })
  )
}

/** Converte objeto de numbers para tokens de dimensão (px) — suporta objetos aninhados */
function dimensionGroup(obj: Record<string, unknown>): Record<string, DTCGNode> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (typeof v === 'number') return [k, { $value: px(v), $type: 'dimension' }]
      if (Array.isArray(v))
        return [k, Object.fromEntries(v.map((val: unknown, i: number) => [`${i + 1}`, { $value: px(val as number), $type: 'dimension' }]))]
      if (typeof v === 'object' && v !== null)
        return [k, dimensionGroup(v as Record<string, unknown>)]
      return [k, { $value: v, $type: 'dimension' }]
    })
  )
}

// ─── Referência de alias (camada semântica → primitivos) ───────────────────────
// As camadas semantic/light/gbMode/component referenciam os primitivos por alias
// DTCG (`{core.color.brand.600}`) quando o valor casa com uma rampa primitiva —
// é o que faz o Tokens Studio cascatear edições da rampa para os papéis.

/** Mapa reverso hex → caminho de alias do primitivo (`{core.color.<hue>.<step>}`) */
function buildColorRefMap(prim: Record<string, Record<string, string>>): Record<string, string> {
  const map: Record<string, string> = {}
  for (const [hue, ramp] of Object.entries(prim))
    for (const [step, hex] of Object.entries(ramp)) {
      const key = hex.toLowerCase()
      if (!(key in map)) map[key] = `{core.color.${hue}.${step}}`
    }
  return map
}

const REF = buildColorRefMap(t.primitive as unknown as Record<string, Record<string, string>>)

/** Substitui um valor de cor por alias do primitivo, se houver correspondência exata */
const colorRef = (v: string): string => REF[v.toLowerCase()] ?? v

/** Como colorGroup, mas aliando para os primitivos quando possível */
function colorGroupRef(obj: Record<string, unknown>): Record<string, DTCGNode> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (typeof v === 'string') return [k, { $value: colorRef(v), $type: 'color' }]
      if (typeof v === 'object' && v !== null)
        return [k, colorGroupRef(v as Record<string, unknown>)]
      return [k, { $value: v, $type: 'color' }]
    })
  )
}

/** Parseia shorthand CSS de borda para o tipo `border` composto do DTCG */
function parseBorder(css: string): DTCGLeaf {
  const m = css.match(/^(\S+)\s+(\S+)\s+(.+)$/)
  if (!m) return { $value: css, $type: 'border' }
  return { $value: { color: m[3], width: m[1], style: m[2] }, $type: 'border' }
}

// ─── Parsers de tipos compostos DTCG ──────────────────────────────────────────
// O DTCG rejeita strings CSS cruas para cubicBezier/duration/shadow/transition.

/** "150ms" | "0.1s" → { value: <ms>, unit: "ms" } (DTCG duration) */
function parseDuration(css: string): { value: number; unit: 'ms' } {
  const m = css.trim().match(/^([\d.]+)(ms|s)$/)
  if (!m) return { value: 0, unit: 'ms' }
  const n = parseFloat(m[1])
  return { value: m[2] === 's' ? n * 1000 : n, unit: 'ms' }
}

const durationToken = (css: string): DTCGLeaf => ({ $value: parseDuration(css), $type: 'duration' })

const EASING_KEYWORDS: Record<string, number[]> = {
  ease:          [0.25, 0.1, 0.25, 1],
  linear:        [0, 0, 1, 1],
  'ease-in':     [0.42, 0, 1, 1],
  'ease-out':    [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
}

/** "cubic-bezier(a,b,c,d)" | "ease" → [a,b,c,d] (DTCG cubicBezier) */
function parseBezier(css: string): number[] {
  const trimmed = css.trim()
  if (EASING_KEYWORDS[trimmed]) return EASING_KEYWORDS[trimmed]
  const m = trimmed.match(/cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/)
  return m ? [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4])] : EASING_KEYWORDS.ease
}

const cubicBezierToken = (css: string): DTCGLeaf => ({ $value: parseBezier(css), $type: 'cubicBezier' })

/** "0.15s ease" | "0.25s cubic-bezier(...)" → DTCG transition object */
function parseTransition(css: string): DTCGLeaf {
  const m = css.trim().match(/^([\d.]+(?:ms|s))\s+(.+)$/)
  if (!m) return { $value: css, $type: 'transition' }
  return {
    $value: {
      duration: parseDuration(m[1]),
      delay: { value: 0, unit: 'ms' },
      timingFunction: parseBezier(m[2]),
    },
    $type: 'transition',
  }
}

/** Parseia uma camada de sombra "0 1px 2px rgba(...)" em objeto DTCG */
function parseShadowLayer(layer: string) {
  const colorMatch = layer.match(/(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})/)
  const color = colorMatch ? colorMatch[1] : '#000000'
  const lengths = layer.replace(color, '').trim().split(/\s+/).filter(Boolean)
  const [offsetX = '0', offsetY = '0', blur = '0', spread = '0'] = lengths
  return { color, offsetX, offsetY, blur, spread }
}

/** "0 1px 2px rgba(...)" (1+ camadas) → DTCG shadow (objeto ou array de objetos) */
function parseShadow(css: string): DTCGLeaf {
  const layers = css.match(/(?:[^,(]|\([^)]*\))+/g)?.map(s => s.trim()).filter(Boolean) ?? [css]
  const parsed = layers.map(parseShadowLayer)
  return { $value: parsed.length === 1 ? parsed[0] : parsed, $type: 'shadow' }
}

// ─── Camadas ────────────────────────────────────────────────────────────────

/** Set semântico theme-aware (light/gbMode): papéis de tela, aliando primitivos */
function paletteSet(p: typeof t.themePalette.light): Record<string, DTCGNode> {
  return {
    fg:     colorGroupRef(p.fg),
    bg:     colorGroupRef(p.bg),
    border: colorGroupRef(p.border),
    accent: colorGroupRef(p.accent),
    nav:    colorGroupRef(p.nav),
    shadow: parseShadow(p.shadow),
  }
}

// ── core: primitivos + fundação não-cor ──────────────────────────────────────
const core: Record<string, DTCGNode> = {
  color: colorGroup(t.primitive as unknown as Record<string, unknown>),

  font: {
    family: { sans: { $value: "'Outfit', sans-serif", $type: 'fontFamily' } },
    size: Object.fromEntries(
      Object.entries(t.font.size).map(([k, v]) => [k, { $value: px(v), $type: 'dimension' }])
    ),
    weight: Object.fromEntries(
      Object.entries(t.font.weight).map(([k, v]) => [k, { $value: v, $type: 'fontWeight' }])
    ),
    lineHeight: Object.fromEntries(
      Object.entries(t.font.lineHeight).map(([k, v]) => [k, { $value: v, $type: 'number' }])
    ),
  },

  space: Object.fromEntries(
    Object.entries(t.space).map(([k, v]) => [k, { $value: px(v), $type: 'dimension' }])
  ),

  size: dimensionGroup(t.size as unknown as Record<string, unknown>),

  // DTCG não tem tipo "borderRadius" — raios são "dimension".
  radius: Object.fromEntries(
    Object.entries(t.radius).map(([k, v]) => [k, { $value: px(v), $type: 'dimension' }])
  ),

  shadow: Object.fromEntries(
    Object.entries(t.shadow).map(([k, v]) => [k, parseShadow(v)])
  ),

  border: Object.fromEntries(
    Object.entries(t.border).map(([k, v]) => [k, parseBorder(v)])
  ),

  zIndex: Object.fromEntries(
    Object.entries(t.zIndex).map(([k, v]) => [k, { $value: v, $type: 'number' }])
  ),

  transition: Object.fromEntries(
    Object.entries(t.transition).map(([k, v]) => [k, parseTransition(v)])
  ),

  animation: {
    duration: Object.fromEntries(
      Object.entries(t.animation.duration).map(([k, v]) => [k, durationToken(v)])
    ),
    easing: Object.fromEntries(
      Object.entries(t.animation.easing).map(([k, v]) => [k, cubicBezierToken(v)])
    ),
  },

  delay: {
    loadingShow: durationToken(`${t.delay.loadingShow}ms`),
    loadingMin:  durationToken(`${t.delay.loadingMin}ms`),
  },

  glow: Object.fromEntries(
    Object.entries(t.glow).map(([k, v]) => [k, parseShadow(v)])
  ),

  breakpoint: dimensionGroup(t.breakpoint as unknown as Record<string, unknown>),

  layout: dimensionGroup(t.layout as unknown as Record<string, unknown>),

  chart: {
    revenue: { $value: t.chart.revenue, $type: 'color' },
    expense: { $value: t.chart.expense, $type: 'color' },
    series: Object.fromEntries(
      (t.chart.series as string[]).map((v, i) => [`${i + 1}`, { $value: v, $type: 'color' }])
    ),
    grid:      { $value: t.chart.grid,      $type: 'color' },
    gridGb:    { $value: t.chart.gridGb,    $type: 'color' },
    surface:   { $value: t.chart.surface,   $type: 'color' },
    surfaceGb: { $value: t.chart.surfaceGb, $type: 'color' },
  },
}

// ── semantic: papéis theme-agnostic (alias → core) ───────────────────────────
const semantic: Record<string, DTCGNode> = {
  color: colorGroupRef({
    feedback: t.color.feedback,
    accent:   t.color.accent,
    state:    t.color.state,
    overlay:  t.color.overlay,
    gb:       t.color.gb,
  } as unknown as Record<string, unknown>),
}

// ─── Montagem final (sets + $themes Tokens Studio) ─────────────────────────────

const output: Record<string, unknown> = {
  core,
  semantic,
  light:     paletteSet(t.themePalette.light),
  gbMode:    paletteSet(t.themePalette.gbMode),
  component: colorGroupRef(t.component as unknown as Record<string, unknown>),

  $themes: [
    {
      id: 'light',
      name: 'Light',
      selectedTokenSets: { core: 'source', semantic: 'enabled', light: 'enabled', gbMode: 'disabled', component: 'enabled' },
    },
    {
      id: 'gbMode',
      name: 'GBMode',
      selectedTokenSets: { core: 'source', semantic: 'enabled', light: 'disabled', gbMode: 'enabled', component: 'enabled' },
    },
  ],
  $metadata: {
    tokenSetOrder: ['core', 'semantic', 'light', 'gbMode', 'component'],
  },
}

// ─── Escrita do arquivo ───────────────────────────────────────────────────────

const outDir  = resolve(__dirname, '../tokens')
const outFile = resolve(outDir, 'tokens.json')

mkdirSync(outDir, { recursive: true })
writeFileSync(outFile, JSON.stringify(output, null, 2), 'utf-8')

const setCount  = ['core', 'semantic', 'light', 'gbMode', 'component'].length
const leafCount = JSON.stringify(output).match(/"\$value"/g)?.length ?? 0

console.log(`✓  tokens/tokens.json gerado`)
console.log(`   ${setCount} sets (core · semantic · light · gbMode · component) · ${leafCount} tokens`)
console.log(`   → Próximo passo: abrir Tokens Studio no Figma e sincronizar com este arquivo`)
