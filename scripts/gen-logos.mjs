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

// ---- wordmark CERNE (monolinha geométrica) -----------------------------
// Cap height 120 (y 60→180, terminais com inset 11 p/ round caps de stroke 22)
const SW = 22 // stroke do wordmark
function letterC(xc) {
  const r = 49, a = 35 * Math.PI / 180
  const sx = (xc + r * Math.cos(a)).toFixed(2), sy = (120 - r * Math.sin(a)).toFixed(2)
  const ey = (120 + r * Math.sin(a)).toFixed(2)
  return `M ${sx} ${sy} A ${r} ${r} 0 1 0 ${sx} ${ey}`
}
const letterE = x => `M ${x} 71 V 169 M ${x} 71 H ${x + 51} M ${x} 120 H ${x + 45} M ${x} 169 H ${x + 51}`
const letterR = x => `M ${x} 169 V 71 H ${x + 30} A 24.5 24.5 0 0 1 ${x + 30} 120 H ${x} M ${x + 32} 120 L ${x + 51} 169`
const letterN = x => `M ${x} 169 V 71 L ${x + 51} 169 V 71`

function wordmark(color) {
  const d = [letterC(356), letterE(454), letterR(554), letterN(654), letterE(754)].join(' ')
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round"/>\n`
}

// ---- montagem ----------------------------------------------------------
const svg = (w, h, vw, vh, body) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 ${vw} ${vh}" fill="none" xmlns="http://www.w3.org/2000/svg">\n${body}</svg>\n`

const FULL_W = 840 // mark 0–240 + gap + CERNE (até x≈816) + respiro
const files = {
  'Logo.svg':           svg(112, 32, FULL_W, 240, markPaths(LIGHT_STOPS) + wordmark('#111827')),
  'Logo-white.svg':     svg(112, 32, FULL_W, 240, markPaths(DARK_STOPS) + wordmark('#ffffff')),
  'logo-min.svg':       svg(32, 32, 240, 240, markPaths(LIGHT_STOPS)),
  'logo-min-white.svg': svg(32, 32, 240, 240, markPaths(DARK_STOPS)),
}

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(ASSETS, name), content)
  console.log(`gravado: src/assets/${name}`)
}
