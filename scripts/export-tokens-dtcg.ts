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

/** Parseia shorthand CSS de borda para o tipo `border` do DTCG */
function parseBorder(css: string): DTCGLeaf {
  const m = css.match(/^(\S+)\s+(\S+)\s+(.+)$/)
  if (!m) return { $value: css, $type: 'border' }
  return {
    $value: { width: m[1], style: m[2], color: m[3] },
    $type: 'border',
  }
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
  radius: Object.fromEntries(
    Object.entries(t.radius).map(([k, v]) =>
      k === 'full'
        ? [k, { $value: '9999px', $type: 'borderRadius' }]
        : [k, { $value: px(v), $type: 'borderRadius' }]
    )
  ),

  // ── Sombras ────────────────────────────────────────────────────────────────
  shadow: Object.fromEntries(
    Object.entries(t.shadow).map(([k, v]) => [k, { $value: v, $type: 'shadow' }])
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
    Object.entries(t.transition).map(([k, v]) => [k, { $value: v, $type: 'transition' }])
  ),

  // ── Animações ──────────────────────────────────────────────────────────────
  animation: {
    duration: Object.fromEntries(
      Object.entries(t.animation.duration).map(([k, v]) => [k, { $value: v, $type: 'duration' }])
    ),
    easing: Object.fromEntries(
      Object.entries(t.animation.easing).map(([k, v]) => [k, { $value: v, $type: 'cubicBezier' }])
    ),
  },

  // ── Delays de loading ──────────────────────────────────────────────────────
  delay: {
    loadingShow: { $value: `${t.delay.loadingShow}ms`, $type: 'duration' },
    loadingMin:  { $value: `${t.delay.loadingMin}ms`,  $type: 'duration' },
  },

  // ── Focus rings / Glow ─────────────────────────────────────────────────────
  glow: Object.fromEntries(
    Object.entries(t.glow).map(([k, v]) => [k, { $value: v, $type: 'shadow' }])
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
