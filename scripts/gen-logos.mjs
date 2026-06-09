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

// ---- wordmark ERNE (Outfit SemiBold 600, convertido em outlines) -------
// No lockup horizontal a marca é o "C" da palavra CERNE. Gerado por
// scripts/extract-wordmark.mjs: cap height 183 (overshoot óptico de 4px
// vs. a marca, que vai de y 24.5 a 215.5), baseline 211.5, gap marca→E
// de ~28px (mesmo ritmo do vão E→R da fonte), kerning aplicado.
const WORDMARK_PATH = 'M355.04 211.50L227.74 211.50L227.74 28.50L353.73 28.50L353.73 59.74L263.15 59.74L263.15 102.95L345.92 102.95L345.92 133.15L263.15 133.15L263.15 180.26L355.04 180.26L355.04 211.50M419.85 211.50L384.45 211.50L384.45 28.50L456.04 28.50Q473.74 28.50 487.14 35.40Q500.55 42.30 507.97 54.27Q515.39 66.25 515.39 81.86Q515.39 98 507.97 109.85Q500.55 121.69 487.01 128.20Q477.64 132.89 466.19 134.45L527.36 211.50L484.41 211.50L426.10 134.97L419.85 134.97L419.85 211.50M452.91 57.39L419.85 57.39L419.85 107.37L452.91 107.37Q465.93 107.37 473.09 100.74Q480.25 94.10 480.25 82.38Q480.25 71.71 473.09 64.55Q465.93 57.39 452.91 57.39M582.81 211.50L547.41 211.50L547.41 28.50L572.14 28.50L663.77 147.20L663.77 28.50L699.43 28.50L699.43 211.50L673.92 211.50L582.81 93.58L582.81 211.50M863.95 211.50L736.65 211.50L736.65 28.50L862.65 28.50L862.65 59.74L772.06 59.74L772.06 102.95L854.84 102.95L854.84 133.15L772.06 133.15L772.06 180.26L863.95 180.26'

function wordmark(color) {
  return `<path d="${WORDMARK_PATH}" fill="${color}"/>\n`
}

// ---- montagem ----------------------------------------------------------
const svg = (w, h, vw, vh, body) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 ${vw} ${vh}" fill="none" xmlns="http://www.w3.org/2000/svg">\n${body}</svg>\n`

const FULL_W = 890 // marca (C) 0–215 + ERNE (até x≈864) + respiro
const files = {
  'Logo.svg':           svg(119, 32, FULL_W, 240, markPaths(LIGHT_STOPS) + wordmark('#111827')),
  'Logo-white.svg':     svg(119, 32, FULL_W, 240, markPaths(DARK_STOPS) + wordmark('#ffffff')),
  'logo-min.svg':       svg(32, 32, 240, 240, markPaths(LIGHT_STOPS)),
  'logo-min-white.svg': svg(32, 32, 240, 240, markPaths(DARK_STOPS)),
}

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(ASSETS, name), content)
  console.log(`gravado: src/assets/${name}`)
}
