import type { Carta, CartaSection } from './overviewInsights'
import { fmtCompact } from './overviewInsights'

/**
 * Motor de leitura genérico dos dashboards.
 *
 * O Painel Geral tem um motor artesanal (`buildOverviewCarta`), escrito para os
 * blocos dele. Este aqui é o caso geral: recebe os MESMOS dados que alimentam os
 * gráficos da tela e devolve a mesma estrutura de `Carta`, para renderizar no
 * `InterpretationLetter`.
 *
 * Toda frase sai de um número presente na tela — tendência, pico, vale,
 * concentração, dispersão entre séries. Nada é inventado nem estimado: é a
 * leitura que um analista faria olhando os mesmos gráficos, e é o lugar onde a
 * análise assistida por IA entra na v2 (mesma entrada, mesma saída, texto mais
 * rico).
 */

// ─── Entrada ───────────────────────────────────────────────────────────────────

export interface ReadingSeries {
  name: string
  data: number[]
}

export interface ReadingBlock {
  /** Título do bloco como aparece no dashboard — ancora a leitura na tela. */
  block: string
  /**
   * `timeline`: o eixo é tempo (mês, semana, dia) — lê tendência, pico e vale.
   * `composition`: o eixo é categoria — lê participação, concentração e cauda.
   */
  kind: 'timeline' | 'composition'
  labels: string[]
  series: ReadingSeries[]
  /** Unidade sufixada nos valores (`kg`, `dias`, `%`, `@`). */
  unit?: string
  /** Valores em reais — formata compacto (R$ 1,2M). Ignora `unit`. */
  currency?: boolean
  /** Fator para o valor real quando a série está em escala (ex.: 1000 para "R$ mil"). */
  scale?: number
  /**
   * Em composição, concentrar num item é risco? Default `true` (gasto por
   * categoria, receita por comprador). Em composição de ESTADO — status de
   * frota, ocupação de curral — concentrar no estado bom é o objetivo, e a
   * leitura de dependência sairia errada ("87% operacional" não é risco).
   */
  concentrationRisk?: boolean
}

export interface ReadingKpi {
  label: string
  value: string
  trend?: string | null
  /** `false` = variação desfavorável (o `Trend` desce). */
  up?: boolean
}

export interface DashboardReadingInput {
  /** Nome do dashboard. */
  title: string
  /** Recorte lido (período, fazenda, filtro aplicado). */
  scope: string
  kpis?: ReadingKpi[]
  blocks: ReadingBlock[]
  /** Fatos que a tela conhece e o motor não deduz (limite crítico, meta, regra). */
  notes?: string[]
}

// ─── Formatação ────────────────────────────────────────────────────────────────

const pct = (v: number) => `${Math.abs(v).toFixed(1).replace('.', ',')}%`
const num = (v: number) =>
  Math.abs(v) >= 1000 || Number.isInteger(v)
    ? Math.round(v).toLocaleString('pt-BR')
    : v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function fmt(value: number, block: ReadingBlock): string {
  const real = value * (block.scale ?? 1)
  if (block.currency) return fmtCompact(real)
  return block.unit ? `${num(real)} ${block.unit}` : num(real)
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

// ─── Fatos de uma série temporal ───────────────────────────────────────────────

interface SeriesFacts {
  name: string
  first: number
  last: number
  deltaPct: number | null
  peakIdx: number
  valleyIdx: number
  h1: number
  h2: number
  halvesPct: number | null
}

function seriesFacts(series: ReadingSeries): SeriesFacts | null {
  const data = series.data.filter((v) => Number.isFinite(v))
  if (data.length < 2) return null

  const first = data[0]
  const last = data[data.length - 1]
  const half = Math.floor(data.length / 2)
  const h1 = sum(data.slice(0, half)) / Math.max(half, 1)
  const h2 = sum(data.slice(half)) / Math.max(data.length - half, 1)

  return {
    name: series.name,
    first,
    last,
    deltaPct: first !== 0 ? ((last - first) / Math.abs(first)) * 100 : null,
    peakIdx: data.indexOf(Math.max(...data)),
    valleyIdx: data.indexOf(Math.min(...data)),
    h1,
    h2,
    halvesPct: h1 !== 0 ? ((h2 - h1) / Math.abs(h1)) * 100 : null,
  }
}

function readTimeline(block: ReadingBlock): CartaSection {
  const paragraphs: string[] = []
  const facts = block.series.map(seriesFacts).filter((f): f is SeriesFacts => f !== null)

  if (!facts.length) {
    return { title: block.block, paragraphs: ['Sem pontos suficientes no recorte para ler tendência.'] }
  }

  const label = (i: number) => block.labels[i] ?? `ponto ${i + 1}`

  for (const f of facts) {
    const trecho: string[] = []

    if (f.deltaPct == null) {
      trecho.push(`${f.name} parte de zero e chega a ${fmt(f.last, block)} no fim do recorte.`)
    } else if (Math.abs(f.deltaPct) < 5) {
      trecho.push(
        `${f.name} fecha o recorte praticamente no mesmo nível em que começou ` +
        `(${fmt(f.first, block)} → ${fmt(f.last, block)}): série estável.`
      )
    } else {
      trecho.push(
        `${f.name} ${f.deltaPct > 0 ? 'sobe' : 'cai'} ${pct(f.deltaPct)} no recorte ` +
        `(${fmt(f.first, block)} → ${fmt(f.last, block)}).`
      )
    }

    if (f.peakIdx !== f.valleyIdx) {
      trecho.push(
        `Pico em ${label(f.peakIdx)} (${fmt(Math.max(...block.series.find(s => s.name === f.name)!.data), block)}) ` +
        `e mínimo em ${label(f.valleyIdx)} (${fmt(Math.min(...block.series.find(s => s.name === f.name)!.data), block)}).`
      )
    }

    if (f.halvesPct != null && Math.abs(f.halvesPct) >= 10) {
      trecho.push(
        `Entre as duas metades do período a média ${f.halvesPct > 0 ? 'subiu' : 'recuou'} ${pct(f.halvesPct)} ` +
        `(${fmt(f.h1, block)} → ${fmt(f.h2, block)}) — movimento consistente, não ponto isolado.`
      )
    }

    paragraphs.push(trecho.join(' '))
  }

  if (facts.length > 1) {
    const comDelta = facts.filter((f) => f.deltaPct != null)
    if (comDelta.length > 1) {
      const maior = comDelta.reduce((a, b) => (b.deltaPct! > a.deltaPct! ? b : a))
      const menor = comDelta.reduce((a, b) => (b.deltaPct! < a.deltaPct! ? b : a))
      if (maior.name !== menor.name) {
        // "mais perde" só quando a série de fato cai; se todas sobem, a menor
        // delas é a que "menos avança" — dizer que perde seria falso.
        const opostas = maior.deltaPct! > 0 && menor.deltaPct! < 0
        paragraphs.push(
          `Comparando as séries: ${maior.name} é a que mais avança (${pct(maior.deltaPct!)}) e ` +
          `${menor.name} a que ${menor.deltaPct! < 0 ? 'mais perde' : 'menos avança'} (${pct(menor.deltaPct!)}). ` +
          (opostas
            ? 'As duas andam em direções opostas, então o total esconde o movimento — vale abrir uma por vez no seletor do card.'
            : 'Vale abrir uma série por vez no seletor do card para ver o ritmo de cada uma sem a soma por cima.')
        )
      }
    }
  }

  return { title: block.block, paragraphs }
}

function readComposition(block: ReadingBlock): CartaSection {
  const paragraphs: string[] = []
  const serie = block.series[0]
  if (!serie) return { title: block.block, paragraphs: ['Sem dados no recorte.'] }

  const itens = block.labels
    .map((label, i) => ({ label, value: serie.data[i] ?? 0 }))
    .filter((it) => Number.isFinite(it.value))
    .sort((a, b) => b.value - a.value)

  const total = sum(itens.map((it) => it.value))
  if (!itens.length || total <= 0) {
    return { title: block.block, paragraphs: ['Sem dados no recorte.'] }
  }

  const lider = itens[0]
  const share = (lider.value / total) * 100
  paragraphs.push(
    `${itens.length} itens somam ${fmt(total, block)}. ` +
    `${lider.label} lidera com ${fmt(lider.value, block)} (${pct(share)} do total)` +
    (itens.length > 1 ? `, contra ${fmt(itens[itens.length - 1].value, block)} do menor (${itens[itens.length - 1].label}).` : '.')
  )

  // Composição de estado (status, ocupação): a distribuição É o indicador, e
  // concentrar no estado bom é o objetivo — sem leitura de risco nem de cauda.
  if (block.concentrationRisk === false) {
    const resto = itens.slice(1)
    if (resto.length) {
      paragraphs.push(
        `Os demais estados somam ${fmt(sum(resto.map((it) => it.value)), block)} ` +
        `(${pct(100 - share)}): ${resto.map((it) => `${it.label} ${fmt(it.value, block)}`).join(' · ')}.`
      )
    }
    return { title: block.block, paragraphs }
  }

  if (itens.length > 2) {
    const top2 = ((itens[0].value + itens[1].value) / total) * 100
    paragraphs.push(
      `Os dois maiores (${itens[0].label} e ${itens[1].label}) concentram ${pct(top2)} do total. ` +
      (top2 >= 60
        ? 'Concentração alta: o resultado do bloco é decidido por eles, e qualquer variação neles move o total inteiro.'
        : 'Distribuição relativamente equilibrada — nenhum item isolado decide o total.')
    )
  }

  const cauda = itens.filter((it) => (it.value / total) * 100 < 5)
  if (cauda.length >= 2) {
    paragraphs.push(
      `${cauda.length} itens ficam abaixo de 5% cada (${cauda.map((c) => c.label).join(', ')}). ` +
      'Cauda longa costuma valer mais agrupada do que analisada item a item.'
    )
  }

  if (share >= 40) {
    paragraphs.push(
      `Atenção à dependência: com ${pct(share)} em um único item, o bloco tem risco de concentração — ` +
      'se esse item oscilar, não há quem compense no curto prazo.'
    )
  }

  return { title: block.block, paragraphs }
}

// ─── Carta ─────────────────────────────────────────────────────────────────────

export function buildDashboardReading(input: DashboardReadingInput): Carta {
  const sections: CartaSection[] = []

  // 1 — Indicadores de topo: o que está desfavorável aparece primeiro.
  const kpis = input.kpis ?? []
  if (kpis.length) {
    const desfavoraveis = kpis.filter((k) => k.up === false)
    const favoraveis = kpis.filter((k) => k.up !== false && k.trend)

    const paragraphs: string[] = []
    paragraphs.push(
      `Os indicadores de topo do recorte: ${kpis.map((k) => `${k.label} em ${k.value}`).join(' · ')}.`
    )
    if (desfavoraveis.length) {
      paragraphs.push(
        `${desfavoraveis.length === 1 ? 'Um indicador está' : `${desfavoraveis.length} indicadores estão`} ` +
        `em variação desfavorável: ${desfavoraveis.map((k) => `${k.label} (${k.trend})`).join(', ')}. ` +
        'É por aí que a leitura dos blocos abaixo deve começar.'
      )
    } else if (favoraveis.length) {
      paragraphs.push('Nenhum indicador de topo está em variação desfavorável no recorte.')
    }
    sections.push({ title: 'Indicadores de topo', paragraphs })
  }

  // 2 — Uma seção por bloco, na ordem em que aparecem na tela.
  for (const block of input.blocks) {
    sections.push(block.kind === 'timeline' ? readTimeline(block) : readComposition(block))
  }

  // 3 — O que a tela sabe e o motor não deduz.
  if (input.notes?.length) {
    sections.push({ title: 'Regras do recorte', bullets: input.notes })
  }

  // 4 — Encaminhamento: transforma o que foi lido em próxima ação.
  const bullets: string[] = []
  const kpiRuim = kpis.find((k) => k.up === false)
  if (kpiRuim) {
    bullets.push(`Abrir o bloco que sustenta "${kpiRuim.label}" e confirmar se a queda é de um item só ou do conjunto.`)
  }
  for (const block of input.blocks) {
    if (block.kind === 'composition' && block.series[0]) {
      const serie = block.series[0]
      const total = sum(serie.data)
      const maxIdx = serie.data.indexOf(Math.max(...serie.data))
      if (block.concentrationRisk !== false && total > 0 && (serie.data[maxIdx] / total) >= 0.4) {
        bullets.push(
          `Em "${block.block}", checar se a concentração em ${block.labels[maxIdx]} é decisão ou acomodação.`
        )
      }
    }
    if (block.kind === 'timeline' && block.series.length > 1) {
      bullets.push(`Em "${block.block}", isolar cada série no seletor do card antes de concluir sobre o total.`)
    }
  }
  bullets.push('Comparar este recorte com o período anterior antes de tratar qualquer movimento como tendência.')
  sections.push({ title: 'O que checar em seguida', bullets })

  return {
    title: `Leitura do dashboard ${input.title}`,
    scope: input.scope,
    sections,
    glossary: [
      { term: 'Recorte', def: 'Conjunto de dados que os filtros da tela estão mostrando no momento da leitura.' },
      { term: 'Tendência', def: 'Comparação entre a média da primeira e da segunda metade do período — menos sensível a ponto isolado que início contra fim.' },
      { term: 'Pico e mínimo', def: 'Maior e menor valor da série no recorte, com o rótulo do eixo em que ocorrem.' },
      { term: 'Concentração', def: 'Participação dos maiores itens no total. Acima de 40% em um item, o bloco depende dele.' },
      { term: 'Cauda', def: 'Itens com menos de 5% do total cada — costumam valer agrupados.' },
    ],
  }
}
