// Gera os 4 SVGs da marca CERNE (aperture C) a partir dos tokens do projeto.
// Uso: node scripts/gen-logos.mjs
// Rampa estritamente de src/design/tokens.ts: brand 700 → 600 → 500 → 400.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets')

// ---- cor -------------------------------------------------------------
const hex2rgb = h => [0, 2, 4].map(i => parseInt(h.slice(1).slice(i, i + 2), 16))
const rgb2hex = r => '#' + r.map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
function ramp(stops, t) {
  t = Math.max(0, Math.min(1, t))
  const seg = (stops.length - 1) * t
  const i = Math.min(Math.floor(seg), stops.length - 2)
  const f = seg - i
  const a = hex2rgb(stops[i]), b = hex2rgb(stops[i + 1])
  return rgb2hex(a.map((v, k) => v + (b[k] - v) * f))
}

// tokens.ts → brand[700], brand[600], brand[500], brand[400]
const LIGHT_STOPS = ['#047857', '#059669', '#22c55e', '#4ade80']
// GBMode (fundo escuro) → brand[500], brand[400], brand[300]
const DARK_STOPS = ['#22c55e', '#4ade80', '#86efac']

// ---- geometria do mark ------------------------------------------------
// Canvas 240×240 · 10 gomos · boca do C às 3h (68°) · vão constante ~4px
const MARK = { cx: 120, cy: 120, R: 92, r: 46, mouthHalf: 34, n: 10, stroke: 7, halfGap: 5.5 }

const pt = (cx, cy, r, deg) => {
  const rad = deg * Math.PI / 180
  return [(cx + r * Math.sin(rad)).toFixed(2), (cy - r * Math.cos(rad)).toFixed(2)]
}
const offDeg = (halfGap, r) => Math.asin(halfGap / r) * 180 / Math.PI

function wedgePath({ cx, cy, r, R }, a0, a1, halfGap) {
  const oR = offDeg(halfGap, R), oI = offDeg(halfGap, r)
  const p0 = pt(cx, cy, R, a0 + oR), p1 = pt(cx, cy, R, a1 - oR)
  const p2 = pt(cx, cy, r, a1 - oI), p3 = pt(cx, cy, r, a0 + oI)
  return `M ${p0[0]} ${p0[1]} A ${R} ${R} 0 0 1 ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} A ${r} ${r} 0 0 0 ${p3[0]} ${p3[1]} Z`
}

function markPaths(stops, dx = 0) {
  const { mouthHalf, n, stroke, halfGap } = MARK
  const start = 90 + mouthHalf, slot = (360 - 2 * mouthHalf) / n
  const m = dx ? { ...MARK, cx: MARK.cx + dx } : MARK
  let out = ''
  for (let i = 0; i < n; i++) {
    const c = ramp(stops, 1 - i / (n - 1))
    out += `<path d="${wedgePath(m, start + i * slot, start + (i + 1) * slot, halfGap)}" fill="${c}" stroke="${c}" stroke-width="${stroke}" stroke-linejoin="round"/>\n`
  }
  return out
}

// ---- wordmark ERNE (Outfit ExtraBold 800, convertido em outlines) ------
// No lockup horizontal a marca é o "C" da palavra CERNE. Gerado por
// scripts/extract-wordmark.mjs: cap height 183 (overshoot óptico de 4px
// vs. a marca, que vai de y 24.5 a 215.5), baseline 211.5, gap marca→E
// de 26px (mesmo ritmo do vão E→R da fonte), kerning aplicado.
const WORDMARK_PATH = 'M361.03 211.50L225.26 211.50L225.26 28.50L359.48 28.50L359.48 67.47L271.46 67.47L271.46 99.22L351.73 99.22L351.73 137.16L271.46 137.16L271.46 172.53L361.03 172.53L361.03 211.50M433.30 211.50L387.10 211.50L387.10 28.50L465.05 28.50Q483.63 28.50 497.70 35.47Q511.76 42.44 519.76 54.57Q527.77 66.70 527.77 82.96Q527.77 99.22 519.64 111.48Q511.50 123.74 497.05 130.45Q490.86 133.55 483.63 135.10L539.64 211.50L486.21 211.50L436.14 137.42L433.30 137.42L433.30 211.50M458.59 62.83L433.30 62.83L433.30 104.38L458.59 104.38Q469.95 104.38 476.01 98.83Q482.08 93.29 482.08 83.74Q482.08 74.44 476.01 68.64Q469.95 62.83 458.59 62.83M600.81 211.50L554.61 211.50L554.61 28.50L586.87 28.50L668.95 132.52L668.95 28.50L715.15 28.50L715.15 211.50L680.83 211.50L600.81 109.80L600.81 211.50M883.44 211.50L747.68 211.50L747.68 28.50L881.89 28.50L881.89 67.47L793.88 67.47L793.88 99.22L874.15 99.22L874.15 137.16L793.88 137.16L793.88 172.53L883.44 172.53'

function wordmark(color) {
  return `<path d="${WORDMARK_PATH}" fill="${color}"/>\n`
}

// ---- montagem ----------------------------------------------------------
const svg = (w, h, vw, vh, body) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 ${vw} ${vh}" fill="none" xmlns="http://www.w3.org/2000/svg">\n${body}</svg>\n`

const FULL_W = 910 // marca (C) 0–215 + ERNE (até x≈883.4) + respiro
const files = {
  'Logo.svg':           svg(121, 32, FULL_W, 240, markPaths(LIGHT_STOPS) + wordmark('#111827')),
  'Logo-white.svg':     svg(121, 32, FULL_W, 240, markPaths(DARK_STOPS) + wordmark('#ffffff')),
  'logo-min.svg':       svg(32, 32, 240, 240, markPaths(LIGHT_STOPS)),
  'logo-min-white.svg': svg(32, 32, 240, 240, markPaths(DARK_STOPS)),
}

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(ASSETS, name), content)
  console.log(`gravado: src/assets/${name}`)
}
