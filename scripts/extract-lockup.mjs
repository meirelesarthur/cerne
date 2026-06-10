// Uso único: extrai os contornos do wordmark "CERNE" em Outfit SemiBold para
// embutir em gen-logos.mjs — posicionado à direita do quadrado do monograma.
// (O monograma é a marca espiral branca, embutida diretamente em gen-logos.mjs.)
//
// Requer: npm i --no-save opentype.js + Outfit-SemiBold.ttf em %TEMP%.
// (TTF estático peso 600 — obtido via gstatic; o variável vem em Thin/100.)
// Posiciona glifo a glifo (charToGlyph) para evitar o shaper GSUB da opentype.js.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import opentype from 'opentype.js'

const ttf = readFileSync(join(process.env.TEMP, 'Outfit-SemiBold.ttf'))
const font = opentype.parse(ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength))
const upem = font.unitsPerEm                 // 1000
const capH = font.tables.os2.sCapHeight      // 703

const H   = 240
const BOX = { x: 16, y: 16, size: 208, r: 52 }

// Caminho de uma string em cap-height alvo, alinhado a uma baseline.
function glyphPath(str, capTarget, x, baseline) {
  const fontSize = capTarget * (upem / capH)
  const scale = fontSize / upem
  let cx = x
  const full = new opentype.Path()
  const chars = [...str]
  for (let i = 0; i < chars.length; i++) {
    const g = font.charToGlyph(chars[i])
    full.commands.push(...g.getPath(cx, baseline, fontSize).commands)
    let adv = g.advanceWidth * scale
    if (i < chars.length - 1) adv += font.getKerningValue(g, font.charToGlyph(chars[i + 1])) * scale
    cx += adv
  }
  return full
}

// Wordmark "CERNE": início após o quadrado, centrado verticalmente no canvas.
const WM_CAP = 132, GAP = 44
const wmStartX = BOX.x + BOX.size + GAP
const wmProbe = glyphPath('CERNE', WM_CAP, wmStartX, 0)
const wb = wmProbe.getBoundingBox()
const wmBaseline = H / 2 + (wb.y2 - wb.y1) / 2 - wb.y2
const WM = glyphPath('CERNE', WM_CAP, wmStartX, wmBaseline)
const VW = Math.round(WM.getBoundingBox().x2 + 28)

console.log('// viewBox horizontal: 0 0', VW, H, '| box', JSON.stringify(BOX))
console.log('\nWORDMARK_PATH:\n' + WM.toPathData(2))
