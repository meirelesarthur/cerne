/**
 * Eixo de valor dos gráficos SVG do kit.
 *
 * Reúne o que os quatro gráficos (Bar, GroupedBar, StackedBar, Line) precisam
 * para um eixo legível: topo e rótulos em degraus redondos, formato pt-BR e o
 * espaço que o texto do eixo realmente ocupa — medido, não estimado.
 */

/** Degraus de mantissa considerados "redondos" para o passo do eixo. */
const NICE_STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 10]

/** Corta o ruído de ponto flutuante da aritmética de passos. */
const clean = (value: number): number => Number(value.toFixed(10))

// ─── Medição de texto ──────────────────────────────────────────────────────────

/** Contexto de canvas reaproveitado entre chamadas (medir é barato, criar não). */
let measureCtx: CanvasRenderingContext2D | null | undefined

function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (measureCtx !== undefined) return measureCtx
  measureCtx = typeof document === 'undefined'
    ? null
    : document.createElement('canvas').getContext('2d')
  return measureCtx
}

/**
 * Largura em px que um rótulo ocupa na tipografia do sistema.
 *
 * Mede de fato no canvas — a estimativa por número de caracteres errava em
 * acentos, reticências e dígitos estreitos, e o rótulo de eixo saía sobreposto.
 * Sem `document` (SSR/teste) cai numa aproximação.
 */
export function measureLabelWidth(label: string, fontSize: number): number {
  const ctx = getMeasureCtx()
  if (!ctx) return label.length * fontSize * 0.62

  ctx.font = `${fontSize}px 'Outfit', sans-serif`
  return ctx.measureText(label).width
}

/** Largura do rótulo mais largo da lista. */
export function widestLabel(labels: string[], fontSize: number): number {
  return labels.reduce((acc, label) => Math.max(acc, measureLabelWidth(label, fontSize)), 0)
}

// ─── Escala do eixo de valor ───────────────────────────────────────────────────

/**
 * Topo do eixo para gráficos que começam em zero (barra/coluna/empilhada).
 *
 * Arredonda o PASSO (não o topo) para o degrau redondo mais próximo e devolve
 * `passo × intervalos` — assim todo rótulo do eixo é múltiplo do passo. Para
 * máximo 85 em 3 intervalos: passo 30 → topo 90 → rótulos 0/30/60/90, em vez de
 * 0/28,3/56,7/85.
 *
 * @param max       maior valor da série (0 ou negativo devolve 1, evitando eixo degenerado)
 * @param intervals quantidade de intervalos entre 0 e o topo (default 3 → 4 rótulos)
 */
export function niceAxisMax(max: number, intervals = 3): number {
  if (!Number.isFinite(max) || max <= 0) return 1

  const rawStep = max / intervals
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const step = (NICE_STEPS.find((s) => s * magnitude >= rawStep) ?? 10) * magnitude

  return clean(step * intervals)
}

/**
 * Rótulos de eixo arredondados cobrindo `min`..`max` — para gráficos cujo eixo
 * não começa em zero (linha/área). Todo tick é múltiplo de um passo redondo, e o
 * último cobre o maior valor da série.
 *
 * @param count quantidade de rótulos desejada (o retorno pode ter 1–2 a mais
 *              quando o passo redondo não fecha exatamente na faixa do dado)
 */
export function niceAxisTicks(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1]

  let lo = min
  let hi = max
  if (hi === lo) {
    // Série plana: abre uma faixa em volta do valor para o eixo não degenerar.
    const pad = hi === 0 ? 1 : Math.abs(hi) * 0.1
    lo = hi - pad
    hi = hi + pad
  }

  const intervals = Math.max(count - 1, 1)
  const rawStep = (hi - lo) / intervals
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const step = (NICE_STEPS.find((s) => s * magnitude >= rawStep) ?? 10) * magnitude

  const start = Math.floor(lo / step) * step
  const ticks = Array.from({ length: intervals + 1 }, (_, i) => clean(start + step * i))
  while (ticks[ticks.length - 1] < hi) ticks.push(clean(ticks[ticks.length - 1] + step))

  return ticks
}

/**
 * Rótulo de valor do eixo em pt-BR: inteiro sem casas, fração com no máximo uma
 * casa. Formato padrão dos gráficos quando a tela não passa `yFormat`.
 */
export function formatAxisValue(value: number): string {
  const rounded = Math.abs(value) < 1 && value !== 0
    ? Number(value.toFixed(2))
    : Number(value.toFixed(1))

  return rounded.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

// ─── Espaço dos rótulos ────────────────────────────────────────────────────────

/**
 * Espaço horizontal que os rótulos do eixo Y precisam.
 *
 * Com padding fixo, rótulo longo era cortado — "R$ 1,0M" virava "$ 1,0M".
 *
 * @param labels   rótulos já formatados do eixo
 * @param fontSize tamanho de fonte do rótulo em px (token)
 * @param min      piso do padding
 * @param max      teto do padding (impede a área de plotagem de colapsar)
 */
export function axisLabelPad(labels: string[], fontSize: number, min = 40, max = 220): number {
  const needed = widestLabel(labels, fontSize) + 10
  return Math.round(Math.min(Math.max(needed, min), max))
}

/**
 * De quantos em quantos rótulos do eixo X desenhar, para que eles nunca se
 * sobreponham. Série de 30 dias em card estreito mostrava os 30 rótulos colados;
 * com o passo, mostra só os que cabem.
 *
 * @param labels rótulos do eixo
 * @param chartW largura útil da área de plotagem
 */
export function axisLabelStep(labels: string[], chartW: number, fontSize: number): number {
  if (labels.length <= 1 || chartW <= 0) return 1

  const labelW = widestLabel(labels, fontSize) + 8
  const fits = Math.max(1, Math.floor(chartW / labelW))

  return Math.max(1, Math.ceil(labels.length / fits))
}

/**
 * Encurta o rótulo ao que cabe em `maxWidth`, com reticências. Usado nos eixos
 * de categoria, onde afinar (mostrar de N em N) esconderia uma categoria inteira
 * — "Armazém A/B/C/D" precisa aparecer, ainda que abreviado.
 */
export function truncateAxisLabel(label: string, maxWidth: number, fontSize: number): string {
  if (maxWidth <= 0) return ''
  if (measureLabelWidth(label, fontSize) <= maxWidth) return label

  const ellipsis = '…'
  const room = maxWidth - measureLabelWidth(ellipsis, fontSize)
  if (room <= 0) return ellipsis

  let cut = label
  while (cut.length > 1 && measureLabelWidth(cut, fontSize) > room) {
    cut = cut.slice(0, -1)
  }

  return `${cut.trimEnd()}${ellipsis}`
}
