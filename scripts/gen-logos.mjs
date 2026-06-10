// Gera os 4 SVGs da marca CERNE a partir dos tokens do projeto.
// Uso: node scripts/gen-logos.mjs
//
// Lockup estilo "monograma + wordmark" (ref.: [M] Magnific):
//   • Quadrado arredondado preenchido com o verde brand (brand[600]).
//   • "C" branco centralizado dentro do quadrado (o monograma da marca).
//   • Wordmark "CERNE" em Outfit SemiBold (contornos), à direita do quadrado.
//
// Os contornos de glifo ("C" do monograma e "CERNE" do wordmark) foram
// extraídos uma única vez de Outfit-SemiBold (upem 1000, cap 703) já
// posicionados no canvas de 240px de altura — ver scripts/_build-lockup.mjs.
// Mantê-los embutidos deixa este gerador independente da fonte/opentype.js.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets')

// ---- tokens (src/design/tokens.ts) ------------------------------------
const BRAND = '#059669'   // brand[600] — verde principal
const INK   = '#111827'   // texto escuro (tema claro)
const WHITE = '#ffffff'

// ---- monograma: quadrado arredondado + "C" branco --------------------
// Box centralizado no canvas 240×240; "C" branco já centrado em (120,120).
const BOX = { x: 16, y: 16, size: 208, r: 52 }
const C_PATH = 'M128.06 180.76Q115.13 180.76 104.05 176.15Q92.98 171.53 84.67 163.22Q76.36 154.91 71.91 143.83Q67.46 132.76 67.46 120Q67.46 107.24 71.91 96.17Q76.36 85.09 84.67 76.86Q92.98 68.64 103.97 63.94Q114.96 59.24 128.06 59.24Q142.16 59.24 152.90 63.85Q163.64 68.47 171.87 76.53L156.42 91.97Q151.56 86.60 144.51 83.58Q137.46 80.55 128.06 80.55Q119.83 80.55 113.03 83.32Q106.24 86.09 101.20 91.38Q96.17 96.67 93.48 103.97Q90.79 111.27 90.79 120Q90.79 128.90 93.48 136.11Q96.17 143.33 101.20 148.62Q106.24 153.91 113.03 156.76Q119.83 159.61 128.06 159.61Q137.96 159.61 145.09 156.59Q152.23 153.57 157.10 148.03L172.54 163.47Q164.31 171.70 153.40 176.23Q142.49 180.76 128.06 180.76'

// ---- wordmark "CERNE" (Outfit SemiBold, cap 132, baseline ~186) -------
const WORDMARK_PATH = 'M342.73 187.97Q328.27 187.97 315.88 182.81Q303.49 177.64 294.19 168.35Q284.90 159.06 279.92 146.66Q274.95 134.27 274.95 120Q274.95 105.73 279.92 93.34Q284.90 80.94 294.19 71.74Q303.49 62.54 315.79 57.29Q328.09 52.03 342.73 52.03Q358.50 52.03 370.52 57.19Q382.54 62.36 391.74 71.37L374.46 88.64Q369.02 82.63 361.13 79.25Q353.25 75.87 342.73 75.87Q333.53 75.87 325.93 78.97Q318.32 82.07 312.69 87.99Q307.06 93.90 304.05 102.07Q301.05 110.24 301.05 120Q301.05 129.95 304.05 138.03Q307.06 146.10 312.69 152.01Q318.32 157.93 325.93 161.12Q333.53 164.31 342.73 164.31Q353.81 164.31 361.79 160.93Q369.77 157.55 375.21 151.36L392.49 168.63Q383.29 177.83 371.08 182.90Q358.88 187.97 342.73 187.97M435.86 186.09L410.33 186.09L410.33 54.09L435.86 54.09L435.86 186.09M502.15 186.09L429.10 186.09L429.10 163.56L502.15 163.56L502.15 186.09M495.57 129.58L429.10 129.58L429.10 107.80L495.57 107.80L495.57 129.58M501.21 76.63L429.10 76.63L429.10 54.09L501.21 54.09L501.21 76.63M574.62 130.89L542.14 130.89L542.14 110.99L572.75 110.99Q582.13 110.99 587.30 106.20Q592.46 101.41 592.46 92.96Q592.46 85.26 587.30 80.10Q582.13 74.94 572.75 74.94L542.14 74.94L542.14 54.09L575 54.09Q587.77 54.09 597.44 59.07Q607.11 64.05 612.46 72.68Q617.81 81.32 617.81 92.59Q617.81 104.23 612.46 112.77Q607.11 121.31 597.34 126.10Q587.58 130.89 574.62 130.89M548.90 186.09L523.36 186.09L523.36 54.09L548.90 54.09L548.90 186.09M626.45 186.09L595.47 186.09L551.90 129.01L575.37 121.69L626.45 186.09M666.44 186.09L640.90 186.09L640.90 54.09L658.74 54.09L666.44 79.63L666.44 186.09M737.04 155.49L732.16 186.09L653.86 84.70L658.74 54.09L737.04 155.49M750.56 186.09L732.16 186.09L724.84 161.31L724.84 54.09L750.56 54.09L750.56 186.09M802.95 186.09L777.41 186.09L777.41 54.09L802.95 54.09L802.95 186.09M869.23 186.09L796.19 186.09L796.19 163.56L869.23 163.56L869.23 186.09M862.66 129.58L796.19 129.58L796.19 107.80L862.66 107.80L862.66 129.58M868.29 76.63L796.19 76.63L796.19 54.09L868.29 54.09'

const FULL_VW = 897 // box + "CERNE" + respiro à direita

// ---- montagem ---------------------------------------------------------
const box = `<rect x="${BOX.x}" y="${BOX.y}" width="${BOX.size}" height="${BOX.size}" rx="${BOX.r}" ry="${BOX.r}" fill="${BRAND}"/>\n`
const monogram = box + `<path d="${C_PATH}" fill="${WHITE}"/>\n`

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
