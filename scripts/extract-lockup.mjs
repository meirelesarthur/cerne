// Uso único: extrai os contornos do lockup CERNE em Outfit SemiBold para
// embutir em gen-logos.mjs — gera o "C" do monograma (centrado no quadrado
// 240×240) e o wordmark "CERNE" posicionado à direita do quadrado.
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
const boxCx = BOX.x + BOX.size / 2
const boxCy = BOX.y + BOX.size / 2

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

// Centra um path (pela bbox real) num ponto.
function centerAt(str, capTarget, cx, cy) {
  const probe = glyphPath(str, capTarget, 0, 0)
  const b = probe.getBoundingBox()
  const x = cx - (b.x2 - b.x1) / 2 - b.x1
  const baseline = cy + (b.y2 - b.y1) / 2 - b.y2
  return glyphPath(str, capTarget, x, baseline)
}

// "C" branco centralizado no quadrado.
const C = centerAt('C', 118, boxCx, boxCy)

// Wordmark "CERNE": início após o quadrado, centrado verticalmente no canvas.
const WM_CAP = 132, GAP = 44
const wmStartX = BOX.x + BOX.size + GAP
const wmProbe = glyphPath('CERNE', WM_CAP, wmStartX, 0)
const wb = wmProbe.getBoundingBox()
const wmBaseline = H / 2 + (wb.y2 - wb.y1) / 2 - wb.y2
const WM = glyphPath('CERNE', WM_CAP, wmStartX, wmBaseline)
const VW = Math.round(WM.getBoundingBox().x2 + 28)

console.log('// viewBox horizontal: 0 0', VW, H, '| box', JSON.stringify(BOX))
console.log('\nC_PATH:\n' + C.toPathData(2))
console.log('\nWORDMARK_PATH:\n' + WM.toPathData(2))
