// Uso único: extrai os contornos de "ERNE" em Outfit SemiBold para embutir
// em gen-logos.mjs — no lockup horizontal a marca (aperture C) é o "C" da
// palavra. Requer: npm i --no-save opentype.js + TTF no %TEMP%.
// Posiciona glifo a glifo (charToGlyph) para evitar o shaper GSUB da opentype.js.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import opentype from 'opentype.js'

const ttf = readFileSync(join(process.env.TEMP, 'Outfit-SemiBold.ttf'))
const font = opentype.parse(ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength))

const upem = font.unitsPerEm
const capHeight = font.tables.os2.sCapHeight ?? font.charToGlyph('C').getMetrics().yMax
console.log('unitsPerEm:', upem, '| capHeight(units):', capHeight)

// Marca: outer edge y 24.5–215.5 (R 92 + stroke 3.5, centro 120).
// Letras com overshoot óptico de ~4px por lado: cap 183, baseline 211.5.
const targetCap = 183
const fontSize = targetCap * (upem / capHeight)
const scale = fontSize / upem
const baseline = 211.5
// Ponta sólida direita da marca (cantos dos gomos na boca) ≈ x=199.
// Gap marca→E ≈ 26px = mesmo ritmo dos vãos internos de ERNE (E→R = 26).
const startX = 209
const letterSpacingPx = 0 // natural — palavra única

let x = startX
const paths = []
const chars = [...'ERNE']
for (let i = 0; i < chars.length; i++) {
  const glyph = font.charToGlyph(chars[i])
  paths.push(glyph.getPath(x, baseline, fontSize))
  let advance = glyph.advanceWidth * scale
  if (i < chars.length - 1) {
    const kern = font.getKerningValue(glyph, font.charToGlyph(chars[i + 1])) * scale
    advance += kern + letterSpacingPx
  }
  x += advance
}

const full = new opentype.Path()
for (const p of paths) full.commands.push(...p.commands)
const bb = full.getBoundingBox()
console.log('fontSize:', fontSize.toFixed(2))
console.log('bbox:', JSON.stringify({ x1: +bb.x1.toFixed(1), y1: +bb.y1.toFixed(1), x2: +bb.x2.toFixed(1), y2: +bb.y2.toFixed(1) }))
console.log('PATH_DATA:')
console.log(full.toPathData(2))
