/**
 * Guarda da Lei 1 para ícones.
 *
 * Só `src/design/icons.ts` pode importar uma biblioteca de ícones. Qualquer
 * outro arquivo que importe direto quebra a fonte única: a troca de família
 * deixa de ser uma edição e volta a ser uma varredura por 130+ arquivos.
 *
 * Roda no `npm run build`. Para checar isoladamente: `npm run check:icons`.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

/** Bibliotecas de ícone: nenhuma pode ser importada fora do registry. */
const LIBS = [
  '@hugeicons/core-free-icons',
  '@hugeicons/react',
  '@phosphor-icons/react',
  'iconoir-react',
  'lucide-react',
  'react-icons',
]

/** Únicos arquivos autorizados a conhecer a biblioteca. */
const ALLOWED = ['src/design/icons.ts', 'src/components/ui/Icon.tsx']

const SRC = 'src'
const importRe = new RegExp(`from\\s+['"](${LIBS.map((l) => l.replace(/[/@-]/g, '\\$&')).join('|')})['"]`)

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return walk(full)
    return /\.(ts|tsx)$/.test(entry) ? [full] : []
  })
}

const offenders = walk(SRC)
  .map((f) => relative('.', f).split(sep).join('/'))
  .filter((f) => !ALLOWED.includes(f))
  .flatMap((f) => {
    const hits = readFileSync(f, 'utf8')
      .split('\n')
      .map((line, i) => ({ line: line.trim(), n: i + 1 }))
      .filter(({ line }) => importRe.test(line))
    return hits.map(({ line, n }) => `${f}:${n}\n    ${line}`)
  })

if (offenders.length > 0) {
  console.error(
    `\n✗  ${offenders.length} import${offenders.length > 1 ? 's' : ''} direto de biblioteca de ícone fora do registry:\n`
  )
  console.error(offenders.map((o) => '  ' + o).join('\n\n'))
  console.error(
    `\n   Ícone em tela vem de \`<Icon name="…">\` (src/components/ui/Icon.tsx).`,
    `\n   Falta um papel? Adicione em ${ALLOWED[0]} — é o único lugar que importa a família.\n`
  )
  process.exit(1)
}

console.log(`✓  nenhum import direto de biblioteca de ícone fora de ${ALLOWED.join(' e ')}`)
