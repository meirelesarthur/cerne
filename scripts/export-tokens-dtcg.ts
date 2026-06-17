/**
 * Exporta src/design/tokens.ts → tokens/tokens.json (W3C DTCG)
 *
 * Saída consumida por:
 *   1. Tokens Studio (plugin Figma) → sincroniza com Figma Variables
 *   2. Supernova → importa as Variables do Figma como data source
 *
 * Rodar:  npx tsx scripts/export-tokens-dtcg.ts
 *         ou:  npm run tokens:export
 *
 * Direção do fluxo (imutável):
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

/** Converte recursivamente objeto de strings para tokens de cor DTCG */
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

/** Parseia shorthand CSS de borda para o tipo `border` composto do DTCG */
function parseBorder(css: string): DTCGLeaf {
  const m = css.match(/^(\S+)\s+(\S+)\s+(.+)$/)
  if (!m) return { $value: css, $type: 'border' }
  // DTCG border: { color, width, style }
  return {
    $value: { color: m[3], width: m[1], style: m[2] },
    $type: 'border',
  }
}

// ─── Parsers de tipos compostos DTCG ──────────────────────────────────────────
// O DTCG rejeita strings CSS cruas para cubicBezier/duration/shadow/transition:
// cubicBezier exige array de 4 números; duration exige { value, unit };
// shadow/transition exigem objetos. Sem isso, Tokens Studio recusa o arquivo.

/** "150ms" | "0.1s" → { value: <ms>, unit: "ms" } (DTCG duration) */
function parseDuration(css: string): { value: number; unit: 'ms' } {
  const m = css.trim().match(/^([\d.]+)(ms|s)$/)
  if (!m) return { value: 0, unit: 'ms' }
  const n = parseFloat(m[1])
  return { value: m[2] === 's' ? n * 1000 : n, unit: 'ms' }
}

const durationToken = (css: string): DTCGLeaf => ({ $value: parseDuration(css), $type: 'duration' })

/** Mapeamento das palavras-chave de easing CSS para curvas de Bézier */
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
  // separa camadas em vírgulas de nível superior (preservando as de dentro do rgba)
  const layers = css.match(/(?:[^,(]|\([^)]*\))+/g)?.map(s => s.trim()).filter(Boolean) ?? [css]
  const parsed = layers.map(parseShadowLayer)
  return { $value: parsed.length === 1 ? parsed[0] : parsed, $type: 'shadow' }
}

// ─── Mapeamento completo ──────────────────────────────────────────────────────

const output: Record<string, DTCGNode> = {

  // ── Cores ──────────────────────────────────────────────────────────────────
  color: colorGroup(t.color as unknown as Record<string, unknown>),

  // ── Tipografia ─────────────────────────────────────────────────────────────
  font: {
    family: {
      sans: { $value: "'Outfit', sans-serif", $type: 'fontFamily' },
    },
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

  // ── Espaçamento ────────────────────────────────────────────────────────────
  space: Object.fromEntries(
    Object.entries(t.space).map(([k, v]) => [k, { $value: px(v), $type: 'dimension' }])
  ),

  // ── Tamanhos de controle ───────────────────────────────────────────────────
  size: dimensionGroup(t.size as unknown as Record<string, unknown>),

  // ── Border radius ──────────────────────────────────────────────────────────
  // DTCG não tem tipo "borderRadius" — raios são "dimension".
  radius: Object.fromEntries(
    Object.entries(t.radius).map(([k, v]) => [k, { $value: px(v), $type: 'dimension' }])
  ),

  // ── Sombras ────────────────────────────────────────────────────────────────
  shadow: Object.fromEntries(
    Object.entries(t.shadow).map(([k, v]) => [k, parseShadow(v)])
  ),

  // ── Bordas ─────────────────────────────────────────────────────────────────
  border: Object.fromEntries(
    Object.entries(t.border).map(([k, v]) => [k, parseBorder(v)])
  ),

  // ── Z-index ────────────────────────────────────────────────────────────────
  zIndex: Object.fromEntries(
    Object.entries(t.zIndex).map(([k, v]) => [k, { $value: v, $type: 'number' }])
  ),

  // ── Transições ─────────────────────────────────────────────────────────────
  transition: Object.fromEntries(
    Object.entries(t.transition).map(([k, v]) => [k, parseTransition(v)])
  ),

  // ── Animações ──────────────────────────────────────────────────────────────
  animation: {
    duration: Object.fromEntries(
      Object.entries(t.animation.duration).map(([k, v]) => [k, durationToken(v)])
    ),
    easing: Object.fromEntries(
      Object.entries(t.animation.easing).map(([k, v]) => [k, cubicBezierToken(v)])
    ),
  },

  // ── Delays de loading ──────────────────────────────────────────────────────
  delay: {
    loadingShow: durationToken(`${t.delay.loadingShow}ms`),
    loadingMin:  durationToken(`${t.delay.loadingMin}ms`),
  },

  // ── Focus rings / Glow ─────────────────────────────────────────────────────
  glow: Object.fromEntries(
    Object.entries(t.glow).map(([k, v]) => [k, parseShadow(v)])
  ),

  // ── Tema login ─────────────────────────────────────────────────────────────
  loginTheme: {
    leftBg:     { $value: t.loginTheme.leftBg,     $type: 'color' },
    rightBg:    { $value: t.loginTheme.rightBg,    $type: 'color' },
    accentGlow: { $value: t.loginTheme.accentGlow, $type: 'color' },
  },

  // ── Dashboard tiles ────────────────────────────────────────────────────────
  dashboard: colorGroup(t.dashboard as unknown as Record<string, unknown>),

  // ── Gráficos ───────────────────────────────────────────────────────────────
  chart: {
    revenue: { $value: t.chart.revenue, $type: 'color' },
    expense: { $value: t.chart.expense, $type: 'color' },
    series: Object.fromEntries(
      (t.chart.series as string[]).map((v, i) => [`${i + 1}`, { $value: v, $type: 'color' }])
    ),
  },
}

// ─── Escrita do arquivo ───────────────────────────────────────────────────────

const outDir  = resolve(__dirname, '../tokens')
const outFile = resolve(outDir, 'tokens.json')

mkdirSync(outDir, { recursive: true })
writeFileSync(outFile, JSON.stringify(output, null, 2), 'utf-8')

const groupCount = Object.keys(output).length
const leafCount  = JSON.stringify(output).match(/"\$value"/g)?.length ?? 0

console.log(`✓  tokens/tokens.json gerado`)
console.log(`   ${groupCount} grupos · ${leafCount} tokens`)
console.log(`   → Próximo passo: abrir Tokens Studio no Figma e sincronizar com este arquivo`)
