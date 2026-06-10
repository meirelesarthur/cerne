// Gera os 4 SVGs da marca CERNE a partir dos tokens do projeto.
// Uso: node scripts/gen-logos.mjs
//
// Lockup estilo "monograma + wordmark" (ref.: [M] Magnific):
//   • Quadrado arredondado preenchido com o verde brand (brand[600]).
//   • Marca espiral (aperture C) em branco, centralizada dentro do quadrado.
//   • Wordmark "CERNE" em Outfit SemiBold (contornos), à direita do quadrado.
//
// Os contornos do wordmark "CERNE" foram extraídos uma única vez de
// Outfit-SemiBold (upem 1000, cap 703) já posicionados no canvas de 240px de
// altura — ver scripts/extract-lockup.mjs. Mantê-los embutidos deixa este
// gerador independente da fonte/opentype.js.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets')

// ---- tokens (src/design/tokens.ts) ------------------------------------
const BRAND = '#059669'   // brand[600] — verde principal
const INK   = '#111827'   // texto escuro (tema claro)
const WHITE = '#ffffff'

// ---- monograma: quadrado arredondado + marca espiral branca ----------
// Box centralizado no canvas 240×240. A marca (aperture C) entra em branco
// (knockout): os vãos entre os 10 gomos revelam o verde do box, formando a
// abertura do "C". A espiral nativa ocupa o canvas 240 (centro 120, R 92);
// é reduzida e recentrada via <g transform> para respirar dentro do box.
const BOX = { x: 16, y: 16, size: 208, r: 52 }
const SPIRAL_SCALE = 0.66 // raio externo ~61px → respiro confortável no box 208
const SPIRAL_WEDGES = [
  'M 193.06 175.91 A 92 92 0 0 1 166.32 199.49 L 145.50 158.28 A 46 46 0 0 0 154.79 150.10 Z',
  'M 156.50 204.45 A 92 92 0 0 1 121.65 211.99 L 123.58 165.86 A 46 46 0 0 0 135.68 163.24 Z',
  'M 110.66 211.52 A 92 92 0 0 1 76.56 201.10 L 100.75 161.78 A 46 46 0 0 0 112.59 165.40 Z',
  'M 67.20 195.34 A 92 92 0 0 1 42.52 169.60 L 82.82 147.08 A 46 46 0 0 0 91.39 156.02 Z',
  'M 37.15 160.00 A 92 92 0 0 1 28.16 125.50 L 74.33 125.50 A 46 46 0 0 0 77.45 137.48 Z',
  'M 28.16 114.50 A 92 92 0 0 1 37.15 80.00 L 77.45 102.52 A 46 46 0 0 0 74.33 114.50 Z',
  'M 42.52 70.40 A 92 92 0 0 1 67.20 44.66 L 91.39 83.98 A 46 46 0 0 0 82.82 92.92 Z',
  'M 76.56 38.90 A 92 92 0 0 1 110.66 28.48 L 112.59 74.60 A 46 46 0 0 0 100.75 78.22 Z',
  'M 121.65 28.01 A 92 92 0 0 1 156.50 35.55 L 135.68 76.76 A 46 46 0 0 0 123.58 74.14 Z',
  'M 166.32 40.51 A 92 92 0 0 1 193.06 64.09 L 154.79 89.90 A 46 46 0 0 0 145.50 81.72 Z',
]

// ---- wordmark "CERNE" (Outfit SemiBold, cap 132, baseline ~186) -------
const WORDMARK_PATH = 'M342.73 187.97Q328.27 187.97 315.88 182.81Q303.49 177.64 294.19 168.35Q284.90 159.06 279.92 146.66Q274.95 134.27 274.95 120Q274.95 105.73 279.92 93.34Q284.90 80.94 294.19 71.74Q303.49 62.54 315.79 57.29Q328.09 52.03 342.73 52.03Q358.50 52.03 370.52 57.19Q382.54 62.36 391.74 71.37L374.46 88.64Q369.02 82.63 361.13 79.25Q353.25 75.87 342.73 75.87Q333.53 75.87 325.93 78.97Q318.32 82.07 312.69 87.99Q307.06 93.90 304.05 102.07Q301.05 110.24 301.05 120Q301.05 129.95 304.05 138.03Q307.06 146.10 312.69 152.01Q318.32 157.93 325.93 161.12Q333.53 164.31 342.73 164.31Q353.81 164.31 361.79 160.93Q369.77 157.55 375.21 151.36L392.49 168.63Q383.29 177.83 371.08 182.90Q358.88 187.97 342.73 187.97M435.86 186.09L410.33 186.09L410.33 54.09L435.86 54.09L435.86 186.09M502.15 186.09L429.10 186.09L429.10 163.56L502.15 163.56L502.15 186.09M495.57 129.58L429.10 129.58L429.10 107.80L495.57 107.80L495.57 129.58M501.21 76.63L429.10 76.63L429.10 54.09L501.21 54.09L501.21 76.63M574.62 130.89L542.14 130.89L542.14 110.99L572.75 110.99Q582.13 110.99 587.30 106.20Q592.46 101.41 592.46 92.96Q592.46 85.26 587.30 80.10Q582.13 74.94 572.75 74.94L542.14 74.94L542.14 54.09L575 54.09Q587.77 54.09 597.44 59.07Q607.11 64.05 612.46 72.68Q617.81 81.32 617.81 92.59Q617.81 104.23 612.46 112.77Q607.11 121.31 597.34 126.10Q587.58 130.89 574.62 130.89M548.90 186.09L523.36 186.09L523.36 54.09L548.90 54.09L548.90 186.09M626.45 186.09L595.47 186.09L551.90 129.01L575.37 121.69L626.45 186.09M666.44 186.09L640.90 186.09L640.90 54.09L658.74 54.09L666.44 79.63L666.44 186.09M737.04 155.49L732.16 186.09L653.86 84.70L658.74 54.09L737.04 155.49M750.56 186.09L732.16 186.09L724.84 161.31L724.84 54.09L750.56 54.09L750.56 186.09M802.95 186.09L777.41 186.09L777.41 54.09L802.95 54.09L802.95 186.09M869.23 186.09L796.19 186.09L796.19 163.56L869.23 163.56L869.23 186.09M862.66 129.58L796.19 129.58L796.19 107.80L862.66 107.80L862.66 129.58M868.29 76.63L796.19 76.63L796.19 54.09L868.29 54.09'

const FULL_VW = 897 // box + "CERNE" + respiro à direita

// ---- montagem ---------------------------------------------------------
const box = `<rect x="${BOX.x}" y="${BOX.y}" width="${BOX.size}" height="${BOX.size}" rx="${BOX.r}" ry="${BOX.r}" fill="${BRAND}"/>\n`
// Espiral branca reduzida e recentrada no box (transform sobre o centro 120,120).
const spiral =
  `<g transform="translate(120 120) scale(${SPIRAL_SCALE}) translate(-120 -120)">\n` +
  SPIRAL_WEDGES.map(d =>
    `<path d="${d}" fill="${WHITE}" stroke="${WHITE}" stroke-width="7" stroke-linejoin="round"/>`
  ).join('\n') +
  `\n</g>\n`
const monogram = box + spiral

const svg = (w, h, vw, vh, body) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 ${vw} ${vh}" fill="none" xmlns="http://www.w3.org/2000/svg">\n${body}</svg>\n`

const wordmark = color => `<path d="${WORDMARK_PATH}" fill="${color}"/>\n`

const files = {
  // Horizontal: monograma + wordmark. width = 32 * (897/240) ≈ 120.
  'Logo.svg':           svg(120, 32, FULL_VW, 240, monogram + wordmark(INK)),
  'Logo-white.svg':     svg(120, 32, FULL_VW, 240, monogram + wordmark(WHITE)),
  // Ícone (sidebar recolhida): apenas o monograma quadrado.
  'logo-min.svg':       svg(32, 32, 240, 240, monogram),
  'logo-min-white.svg': svg(32, 32, 240, 240, monogram),
}

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(ASSETS, name), content)
  console.log(`gravado: src/assets/${name}`)
}
