// ─── Motor de interpretação da Visão Geral ────────────────────────────────────
// Camada 1 (fatos) + Camada 2 (redação por templates condicionais).
// Funções puras: recebem os mesmos dados que alimentam os charts e devolvem a
// "Carta de Interpretação" estruturada. Nenhum número é inventado — todo valor
// citado vem do dataset. Quando houver backend de IA, a Camada 2 pode ser
// substituída por redação via LLM a partir dos MESMOS fatos, sem tocar na UI.

export interface MonthlyPoint {
  month: string
  receitas: number
  despesas: number
}

export interface ResultadoGrupo {
  label: string
  receitas: number
  despesas: number
}

export interface AgingBucket {
  label: string
  receber: number
  pagar: number
}

export interface CropFact {
  crop: string
  ha: number
  realizada: number
  aRealizar: number
  margemHa: number
  custoMedio: number
  precoMedio: number
  unidPreco: string
}

export interface OverviewDataset {
  monthly: MonthlyPoint[]
  resultado: ResultadoGrupo[]
  saldoTotal: number
  aReceber: number
  aPagar: number
  aging: AgingBucket[]
  crops: CropFact[]
  cashflow12m: { month: string; net: number }[]
}

export interface CartaSection {
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface GlossaryEntry {
  term: string
  def: string
}

export interface Carta {
  title: string
  scope: string
  sections: CartaSection[]
  glossary: GlossaryEntry[]
}

// ─── Formatação ───────────────────────────────────────────────────────────────

export function fmtCompact(v: number): string {
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000) return `${sign}R$ ${(abs / 1_000).toFixed(1).replace('.', ',')}K`
  return `${sign}R$ ${abs.toFixed(0)}`
}

const fpct = (v: number) => `${v.toFixed(1).replace('.', ',')}%`
const fx = (v: number) => `${v.toFixed(1).replace('.', ',')}×`

// ─── Fatos derivados ──────────────────────────────────────────────────────────

interface MonthlyFacts {
  n: number
  pico: MonthlyPoint
  negativos: MonthlyPoint[]
  margemH1: number
  margemH2: number
  deltaPct: number | null
  caudaRatio: number | null
}

function monthlyFacts(monthly: MonthlyPoint[]): MonthlyFacts {
  const n = monthly.length
  const pico = monthly.reduce((a, b) => (b.receitas > a.receitas ? b : a), monthly[0])
  const negativos = monthly.filter(m => m.despesas > m.receitas)

  const margens = monthly.map(m => m.receitas - m.despesas)
  const h = Math.floor(n / 2)
  const media = (arr: number[]) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0)
  const margemH1 = media(margens.slice(0, h))
  const margemH2 = media(margens.slice(-h))
  const deltaPct = margemH1 !== 0 ? ((margemH2 - margemH1) / Math.abs(margemH1)) * 100 : null

  const recs = monthly.map(m => m.receitas).filter(v => v > 0)
  const caudaRatio = recs.length >= 2 ? Math.max(...recs) / Math.min(...recs) : null

  return { n, pico, negativos, margemH1, margemH2, deltaPct, caudaRatio }
}

// ─── Insight de destaque (hero) ───────────────────────────────────────────────

export function headlineInsight(data: OverviewDataset): { text: string; strong: string; tail: string; up: boolean } {
  const mf = monthlyFacts(data.monthly)
  if (mf.deltaPct != null && Math.abs(mf.deltaPct) >= 15) {
    const up = mf.deltaPct > 0
    return {
      text: 'A margem mensal média ',
      strong: `${up ? 'subiu' : 'caiu'} ${fpct(Math.abs(mf.deltaPct))}`,
      tail: ` entre a primeira e a segunda metade do período (${fmtCompact(mf.margemH1 * 1000)} → ${fmtCompact(mf.margemH2 * 1000)}).`,
      up,
    }
  }
  const saldoPrev = data.aReceber - data.aPagar
  if (saldoPrev < 0) {
    return {
      text: 'O fluxo previsto está ',
      strong: `${fmtCompact(saldoPrev)} negativo`,
      tail: ' — as contas a pagar em aberto superam as a receber; antecipe recebíveis ou escalone pagamentos.',
      up: false,
    }
  }
  return {
    text: 'A margem mensal média ficou ',
    strong: 'estável',
    tail: ` entre as duas metades do período (${fmtCompact(mf.margemH1 * 1000)} → ${fmtCompact(mf.margemH2 * 1000)}) — sem tendência clara.`,
    up: true,
  }
}

// ─── Carta de Interpretação ───────────────────────────────────────────────────

export function buildOverviewCarta(data: OverviewDataset): Carta {
  const mf = monthlyFacts(data.monthly)
  const saldoPrev = data.aReceber - data.aPagar
  const totalReceber = data.aging.reduce((s, b) => s + b.receber, 0)
  const vencido30 = data.aging[data.aging.length - 1]
  const atrasado = data.resultado.find(r => r.label === 'Atrasado')

  const cropsAtivas = data.crops.filter(c => c.realizada + c.aRealizar > 0)
  const topMargem = cropsAtivas.length ? cropsAtivas.reduce((a, b) => (b.margemHa > a.margemHa ? b : a)) : null
  const apertada = cropsAtivas.length
    ? cropsAtivas.reduce((a, b) => (b.precoMedio - b.custoMedio) / Math.max(1, b.custoMedio) < (a.precoMedio - a.custoMedio) / Math.max(1, a.custoMedio) ? b : a)
    : null

  const cum: number[] = []
  data.cashflow12m.reduce((acc, m) => { const v = acc + m.net; cum.push(v); return v }, 0)
  const minCumIdx = cum.indexOf(Math.min(...cum))
  const mesVale = data.cashflow12m[minCumIdx]

  // 1 — Receitas × despesas mensais
  const s1: string[] = []
  s1.push(
    `O período cobre ${mf.n} meses, com pico de receita em ${mf.pico.month} (${fmtCompact(mf.pico.receitas * 1000)}` +
    (mf.caudaRatio && mf.caudaRatio >= 5
      ? `) — a distância entre o melhor e o pior mês é de ${fx(mf.caudaRatio)}, típica de receita concentrada em janelas de comercialização. Planeje o caixa pelos meses fracos, não pela média.`
      : `) e distribuição relativamente uniforme entre os meses.`)
  )
  s1.push(
    mf.negativos.length
      ? `Em ${mf.negativos.length} de ${mf.n} meses as despesas superaram as receitas (${mf.negativos.map(m => m.month).join(', ')}). Isso não é necessariamente problema no agro — custeio antecede colheita — mas exige que a sobra dos meses fortes cubra os vales.`
      : `Em todos os meses a receita cobriu a despesa — não há vales de caixa no realizado.`
  )
  if (mf.deltaPct != null) {
    s1.push(
      mf.deltaPct <= -15
        ? `Comparando as duas metades do período, a margem mensal média caiu de ${fmtCompact(mf.margemH1 * 1000)} para ${fmtCompact(mf.margemH2 * 1000)} (${fpct(mf.deltaPct)}) — piora que pede investigação: preço, custo ou mix.`
        : mf.deltaPct >= 15
          ? `Comparando as duas metades do período, a margem mensal média subiu de ${fmtCompact(mf.margemH1 * 1000)} para ${fmtCompact(mf.margemH2 * 1000)} (+${fpct(mf.deltaPct)}) — ganho a confirmar nos próximos meses.`
          : `Entre as duas metades do período a margem mensal média variou pouco (${fmtCompact(mf.margemH1 * 1000)} → ${fmtCompact(mf.margemH2 * 1000)}) — comportamento estável.`
    )
  }

  // 2 — Resultado operacional e fluxo previsto
  const s2: string[] = []
  s2.push(
    `O saldo operacional total do período é ${fmtCompact(data.saldoTotal)}. ` +
    (atrasado
      ? `O componente atrasado carrega ${fmtCompact(atrasado.receitas)} em receitas ainda não recebidas contra ${fmtCompact(atrasado.despesas)} em despesas vencidas — saldo de ${fmtCompact(atrasado.receitas - atrasado.despesas)} que depende de cobrança ativa para se realizar.`
      : '')
  )
  s2.push(
    saldoPrev < 0
      ? `A previsão de curto prazo é deficitária: ${fmtCompact(data.aPagar)} a pagar contra ${fmtCompact(data.aReceber)} a receber (saldo ${fmtCompact(saldoPrev)}). O tamanho do buraco (${fpct(Math.abs(saldoPrev) / Math.max(1, data.aPagar) * 100)} do total a pagar) define a urgência da ação.`
      : `A previsão de curto prazo é superavitária: ${fmtCompact(data.aReceber)} a receber contra ${fmtCompact(data.aPagar)} a pagar (saldo ${fmtCompact(saldoPrev)}).`
  )
  if (vencido30 && (vencido30.receber > 0 || vencido30.pagar > 0)) {
    s2.push(
      `No aging, ${fmtCompact(vencido30.receber)} a receber e ${fmtCompact(vencido30.pagar)} a pagar já passaram de 30 dias. Título vencido há mais de 30 dias raramente se resolve sozinho: cada um merece dono e próxima ação nominal${totalReceber > 0 ? ` (os +30d são ${fpct((vencido30.receber / totalReceber) * 100)} do contas a receber em aberto)` : ''}.`
    )
  }
  if (mesVale && cum[minCumIdx] < 0) {
    s2.push(`Na projeção acumulada de 12 meses, o caixa atinge o ponto mais baixo em ${mesVale.month} (${fmtCompact(cum[minCumIdx] * 1000)} acumulado) — é para essa janela que linhas de crédito ou antecipações devem estar contratadas com antecedência.`)
  }

  // 3 — Culturas
  const s3: string[] = []
  if (topMargem) {
    s3.push(`Entre as culturas ativas, ${topMargem.crop} entrega a maior margem por hectare (R$ ${topMargem.margemHa.toLocaleString('pt-BR')}/ha).`)
  }
  if (apertada) {
    const folga = ((apertada.precoMedio - apertada.custoMedio) / Math.max(1, apertada.custoMedio)) * 100
    s3.push(
      folga < 15
        ? `Atenção ao breakeven de ${apertada.crop}: preço médio de ${apertada.precoMedio} ${apertada.unidPreco} contra custo de ${apertada.custoMedio} ${apertada.unidPreco} — folga de apenas ${fpct(folga)}. Uma oscilação de preço dessa ordem zera a margem da cultura.`
        : `A cultura com menor folga sobre o custo é ${apertada.crop} (${fpct(folga)} entre custo de ${apertada.custoMedio} e preço de ${apertada.precoMedio} ${apertada.unidPreco}) — ainda confortável, mas é o primeiro ponto a apertar se o mercado virar.`
    )
  }
  const semProducao = data.crops.filter(c => c.realizada + c.aRealizar === 0)
  if (semProducao.length) {
    s3.push(`${semProducao.map(c => c.crop).join(', ')} ocupa${semProducao.length > 1 ? 'm' : ''} ${semProducao.reduce((s, c) => s + c.ha, 0).toLocaleString('pt-BR')} ha sem produção comercial no período — área que só aparece no custo. Decisão consciente (reserva, pousio) ou oportunidade parada?`)
  }

  // 4 — Leitura cruzada
  const s4: string[] = []
  s4.push(
    `Os quadros medem populações diferentes — e é no cruzamento que a leitura ganha valor. O realizado mensal olha para trás; o aging e a previsão olham para frente. ` +
    (saldoPrev < 0 && data.saldoTotal >= 0
      ? `Hoje eles divergem: o período fechou positivo (${fmtCompact(data.saldoTotal)}), mas o curto prazo projeta déficit (${fmtCompact(saldoPrev)}). Resultado bom no acumulado não paga boleto do mês que vem — a régua de gestão imediata é o fluxo, não o resultado.`
      : `Hoje eles apontam na mesma direção, o que simplifica a gestão: a prioridade é sustentar o padrão.`)
  )
  if (atrasado && atrasado.receitas > Math.abs(saldoPrev)) {
    s4.push(`Repare: só as receitas atrasadas (${fmtCompact(atrasado.receitas)}) são maiores que o déficit previsto (${fmtCompact(Math.abs(saldoPrev))}). O caixa do curto prazo pode ser resolvido com cobrança, antes de qualquer crédito novo.`)
  }

  // 5 — Conclusão
  const alertas: string[] = []
  if (saldoPrev < 0) alertas.push(`fluxo de curto prazo deficitário em ${fmtCompact(Math.abs(saldoPrev))}`)
  if (vencido30 && vencido30.receber > 0) alertas.push(`${fmtCompact(vencido30.receber)} a receber vencidos há +30 dias`)
  if (mf.deltaPct != null && mf.deltaPct <= -15) alertas.push(`margem mensal em queda de ${fpct(Math.abs(mf.deltaPct))}`)
  const s5 = [
    alertas.length
      ? `Os dados sugerem pontos de atenção: ${alertas.join('; ')}. Nenhum deles é alarmante isoladamente — juntos, pedem gestão ativa do caixa nas próximas semanas.`
      : `O quadro geral é de equilíbrio: margem estável, fluxo previsto positivo e aging sob controle. O ponto de gestão não é sobrevivência, e sim otimização — margem por hectare e previsibilidade de preço.`,
  ]

  // 6 — Sugestões
  const s6: string[] = []
  if (vencido30 && vencido30.receber > 0) s6.push(`Instituir revisão semanal nominal dos títulos a receber vencidos há mais de 30 dias (${fmtCompact(vencido30.receber)} hoje), com dono e próxima ação definidos.`)
  if (saldoPrev < 0) s6.push(`Cobrir o déficit previsto de ${fmtCompact(Math.abs(saldoPrev))} priorizando cobrança dos atrasados antes de contratar crédito.`)
  if (apertada) s6.push(`Monitorar o breakeven de ${apertada.crop} semanalmente: travar preço (barter, mercado futuro) quando a folga sobre o custo estiver confortável.`)
  if (mesVale && cum[minCumIdx] < 0) s6.push(`Negociar linhas de crédito para a janela de ${mesVale.month} com antecedência — crédito contratado no aperto custa mais caro.`)
  s6.push(`Adotar a comparação entre metades do período como indicador-guia: margem média de ${fmtCompact(mf.margemH1 * 1000)} → ${fmtCompact(mf.margemH2 * 1000)}.`)

  // 7 — Provocações
  const s7: string[] = [
    `O equilíbrio atual depende do preço das commodities ou sobreviveria a uma queda de 15% no preço médio?`,
    mf.pico ? `Se a janela de comercialização de ${mf.pico.month} não se repetir na próxima safra, qual é o plano B de receita?` : '',
    semProducao.length ? `As áreas sem produção comercial são estratégia ou inércia — quem decidiu, e quando essa decisão será revisitada?` : `A concentração de receita em poucas culturas é uma escolha de foco ou uma exposição não gerenciada?`,
  ].filter(Boolean)

  return {
    title: 'Visão Geral',
    scope: 'Período completo · todas as culturas e talhões da fazenda selecionada',
    sections: [
      { title: 'Leitura individual — Receitas × despesas mensais', paragraphs: s1 },
      { title: 'Leitura individual — Resultado operacional e fluxo previsto', paragraphs: s2 },
      { title: 'Leitura individual — Culturas e breakeven', paragraphs: s3 },
      { title: 'Leitura cruzada', paragraphs: s4 },
      { title: 'Conclusão', paragraphs: s5 },
      { title: 'Sugestões', bullets: s6 },
      { title: 'Provocações para a discussão', bullets: s7 },
    ],
    glossary: [
      { term: 'Margem mensal', def: 'receitas menos despesas do mês; a média das metades do período revela tendência sem o ruído de meses isolados.' },
      { term: 'Aging', def: 'distribuição dos títulos em aberto por tempo decorrido; título +30 dias raramente se resolve sem ação ativa.' },
      { term: 'Breakeven', def: 'ponto em que o preço de venda cobre exatamente o custo médio de produção; a folga entre eles é a proteção contra oscilação de mercado.' },
      { term: 'Fluxo previsto', def: 'contas a receber menos contas a pagar em aberto; olha para frente, ao contrário do resultado realizado.' },
      { term: 'Projeção acumulada', def: 'soma corrente dos saldos mensais futuros; o ponto mais baixo da curva define a necessidade máxima de capital de giro.' },
    ],
  }
}
