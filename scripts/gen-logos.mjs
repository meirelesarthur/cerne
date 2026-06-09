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

// ---- wordmark CERNE (Outfit ExtraBold 800, convertido em outlines) -----
// Gerado por scripts/extract-wordmark.mjs: cap height 120, baseline 180,
// início x=300, letter-spacing 0.08em, kerning da fonte aplicado.
const WORDMARK_PATH = 'M368.89 181.86Q355.18 181.86 343.50 177.21Q331.82 172.55 323.10 164.17Q314.39 155.80 309.56 144.46Q304.74 133.12 304.74 119.92Q304.74 106.54 309.56 95.29Q314.39 84.03 323.10 75.74Q331.82 67.45 343.41 62.71Q355.01 57.97 368.55 57.97Q382.76 57.97 394.10 62.45Q405.44 66.94 414.08 74.89L393.77 95.20Q389.53 90.47 383.27 87.76Q377.01 85.05 368.55 85.05Q361.27 85.05 355.26 87.42Q349.25 89.79 344.85 94.44Q340.45 99.10 338 105.53Q335.54 111.96 335.54 119.92Q335.54 127.87 338 134.30Q340.45 140.73 344.85 145.39Q349.25 150.04 355.26 152.50Q361.27 154.95 368.55 154.95Q377.01 154.95 383.44 152.33Q389.87 149.70 394.44 144.80L414.75 165.11Q405.95 173.06 394.87 177.46Q383.78 181.86 368.89 181.86M530.35 180L441.33 180L441.33 60L529.34 60L529.34 85.56L471.62 85.56L471.62 106.38L524.26 106.38L524.26 131.26L471.62 131.26L471.62 154.44L530.35 154.44L530.35 180M591.28 180L560.99 180L560.99 60L612.10 60Q624.29 60 633.51 64.57Q642.74 69.14 647.98 77.09Q653.23 85.05 653.23 95.71Q653.23 106.38 647.90 114.41Q642.57 122.45 633.09 126.85Q629.03 128.89 624.29 129.90L661.02 180L625.98 180L593.15 131.42L591.28 131.42L591.28 180M607.87 82.51L591.28 82.51L591.28 109.76L607.87 109.76Q615.32 109.76 619.29 106.12Q623.27 102.48 623.27 96.22Q623.27 90.13 619.29 86.32Q615.32 82.51 607.87 82.51M714.67 180L684.37 180L684.37 60L705.53 60L759.35 128.21L759.35 60L789.65 60L789.65 180L767.14 180L714.67 113.31L714.67 180M913.54 180L824.51 180L824.51 60L912.52 60L912.52 85.56L854.81 85.56L854.81 106.38L907.45 106.38L907.45 131.26L854.81 131.26L854.81 154.44L913.54 154.44Z'

function wordmark(color) {
  return `<path d="${WORDMARK_PATH}" fill="${color}"/>\n`
}

// ---- montagem ----------------------------------------------------------
const svg = (w, h, vw, vh, body) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 ${vw} ${vh}" fill="none" xmlns="http://www.w3.org/2000/svg">\n${body}</svg>\n`

const FULL_W = 940 // mark 0–240 + gap + CERNE (até x≈913.5) + respiro
const files = {
  'Logo.svg':           svg(125, 32, FULL_W, 240, markPaths(LIGHT_STOPS) + wordmark('#111827')),
  'Logo-white.svg':     svg(125, 32, FULL_W, 240, markPaths(DARK_STOPS) + wordmark('#ffffff')),
  'logo-min.svg':       svg(32, 32, 240, 240, markPaths(LIGHT_STOPS)),
  'logo-min-white.svg': svg(32, 32, 240, 240, markPaths(DARK_STOPS)),
}

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(ASSETS, name), content)
  console.log(`gravado: src/assets/${name}`)
}
