import {
  CLASSE_LABEL, CONDICAO_LABEL, TIPO_LABEL,
  type Conta, type ClassePC, type CondicaoPC, type TipoPC,
} from './planoContas.types'

// ─── Ordenação hierárquica ──────────────────────────────────────────────────────
// Compara códigos segmento a segmento como números ("1.1.10" > "1.1.2"), não
// como string — comparação lexicográfica ordenaria "1.1.10" antes de "1.1.2".

export function compareCodigo(a: string, b: string): number {
  const as = a.split('.').map(Number)
  const bs = b.split('.').map(Number)
  const len = Math.max(as.length, bs.length)
  for (let i = 0; i < len; i++) {
    const diff = (as[i] ?? 0) - (bs[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

// ─── Relatório (impressão) ──────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function buildPlanoContasReportHtml(contas: Conta[]): string {
  const sorted = [...contas].sort((a, b) => compareCodigo(a.codigo, b.codigo))
  const rows = sorted.map(c => {
    const isSintetica = c.classe === 'sintetica'
    const rowStyle = isSintetica ? 'color:#b91c1c;font-weight:700;' : 'color:#111827;font-weight:400;'
    return `<tr style="${rowStyle}">
      <td>${escapeHtml(c.codigo)}</td>
      <td>${CLASSE_LABEL[c.classe]}</td>
      <td>${CONDICAO_LABEL[c.condicao]}</td>
      <td>${escapeHtml(c.descricao)}</td>
    </tr>`
  }).join('')

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Relatório — Plano de Contas</title>
<style>
  @page { size: A4; margin: 18mm 14mm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111827; margin: 0; }
  h1 { font-size: 16px; margin: 0 0 4px; }
  p.meta { font-size: 10px; color: #6b7280; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #6b7280; border-bottom: 1.5px solid #111827; padding: 6px 8px; }
  td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; }
  th:nth-child(1), td:nth-child(1) { width: 90px; }
  th:nth-child(2), td:nth-child(2) { width: 90px; }
  th:nth-child(3), td:nth-child(3) { width: 90px; }
</style>
</head>
<body>
  <h1>Plano de Contas</h1>
  <p class="meta">${sorted.length} conta${sorted.length === 1 ? '' : 's'}</p>
  <table>
    <thead><tr><th>Código</th><th>Classe</th><th>Condição</th><th>Descrição</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`
}

/** Abre o relatório em nova aba e dispara a impressão nativa do navegador. Retorna `false` se o pop-up foi bloqueado. */
export function openPlanoContasReport(contas: Conta[]): boolean {
  const win = window.open('', '_blank')
  if (!win) return false
  win.document.open()
  win.document.write(buildPlanoContasReportHtml(contas))
  win.document.close()
  win.focus()
  win.setTimeout(() => win.print(), 300)
  return true
}

// ─── CSV — colunas e (des)serialização ──────────────────────────────────────────

const CSV_HEADERS = ['Código', 'Descrição', 'Condição', 'Classe', 'Ativo', 'Tipo', 'Código Pai', 'Categorias']

const DIACRITICS_RE = new RegExp('[̀-ͯ]', 'g')

function normalize(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '')
}

function escapeCsvField(value: string): string {
  if (/[",;\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++ } else inQuotes = false
      } else cur += ch
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === ',') { out.push(cur); cur = '' }
      else cur += ch
    }
  }
  out.push(cur)
  return out
}

function parseCsv(text: string): string[][] {
  const normalized = text.replace(/^﻿/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  return normalized.split('\n').filter(l => l.trim().length > 0).map(parseCsvLine)
}

const SAMPLE_ROWS: string[][] = [
  ['1',      'Receitas',                 'Crédito', 'Sintética', 'Sim', '',     '',    ''],
  ['1.1',    'Receitas da Agricultura',  'Crédito', 'Sintética', 'Sim', '',     '1',   ''],
  ['1.1.01', 'Grãos e Cereais',           'Crédito', 'Analítica', 'Sim', '',     '1.1', ''],
  ['2',      'Despesas',                 'Débito',  'Sintética', 'Sim', '',     '',    ''],
  ['2.1.01', 'Insumos Agrícolas',         'Débito',  'Analítica', 'Sim', 'OPEX', '2',   ''],
]

function contaToRow(conta: Conta, all: Conta[]): string[] {
  const pai = conta.antecessorId !== null ? all.find(c => c.id === conta.antecessorId) : undefined
  return [
    conta.codigo,
    conta.descricao,
    CONDICAO_LABEL[conta.condicao],
    CLASSE_LABEL[conta.classe],
    conta.ativo === 'sim' ? 'Sim' : 'Não',
    conta.tipo ? TIPO_LABEL[conta.tipo] : '',
    pai?.codigo ?? '',
    conta.categorias.join(';'),
  ]
}

/** Gera a planilha (CSV) — preenchida com as contas vigentes, ou com um modelo de exemplo se nada estiver cadastrado. */
export function buildPlanoContasCsv(contas: Conta[]): string {
  const rows = contas.length > 0 ? contas.map(c => contaToRow(c, contas)) : SAMPLE_ROWS
  const lines = [CSV_HEADERS.join(','), ...rows.map(r => r.map(escapeCsvField).join(','))]
  return lines.join('\r\n')
}

export function downloadPlanoContasModelo(contas: Conta[]): void {
  const csv = buildPlanoContasCsv(contas)
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = contas.length > 0 ? 'plano-de-contas.csv' : 'modelo-plano-de-contas.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── CSV → Conta[] — sincronização completa (importação destrutiva) ─────────────

const CLASSE_BY_LABEL: Record<string, ClassePC> = { sintetica: 'sintetica', analitica: 'analitica' }
const CONDICAO_BY_LABEL: Record<string, CondicaoPC> = { debito: 'debito', credito: 'credito', ambos: 'ambos' }
const TIPO_BY_LABEL: Record<string, TipoPC | ''> = { capex: 'capex', opex: 'opex', '': '' }

export interface ImportResult {
  contas:      Conta[]
  criadas:     number
  atualizadas: number
  excluidas:   number
  /** Não vazio ⇒ importação abortada, `contas` é igual ao array recebido (sem alterações). */
  erros:       string[]
}

export function parsePlanoContasCsv(text: string, existing: Conta[]): ImportResult {
  const abort = (erros: string[]): ImportResult => ({ contas: existing, criadas: 0, atualizadas: 0, excluidas: 0, erros })

  const rows = parseCsv(text)
  if (rows.length === 0) return abort(['Arquivo vazio.'])

  const header = rows[0].map(normalize)
  const col = (name: string) => header.indexOf(normalize(name))
  const iCodigo = col('Código'), iDescricao = col('Descrição'), iCondicao = col('Condição'), iClasse = col('Classe')
  const iAtivo = col('Ativo'), iTipo = col('Tipo'), iPai = col('Código Pai'), iCategorias = col('Categorias')

  if (iCodigo < 0 || iDescricao < 0 || iCondicao < 0 || iClasse < 0) {
    return abort(['Cabeçalho inválido — as colunas Código, Descrição, Condição e Classe são obrigatórias.'])
  }

  interface Raw {
    codigo: string; descricao: string; condicao: CondicaoPC; classe: ClassePC
    ativo: 'sim' | 'nao'; tipo: TipoPC | ''; paiCodigo: string; categorias: string[]
  }

  const erros: string[] = []
  const parsed: Raw[] = []

  rows.slice(1).forEach((row, i) => {
    const linha = i + 2
    const codigo = row[iCodigo]?.trim() ?? ''
    if (!codigo) { erros.push(`Linha ${linha}: código vazio.`); return }

    const descricao = row[iDescricao]?.trim() ?? ''
    if (!descricao) { erros.push(`Linha ${linha} (${codigo}): descrição é obrigatória.`); return }

    const condicao = CONDICAO_BY_LABEL[normalize(row[iCondicao] ?? '')]
    if (!condicao) { erros.push(`Linha ${linha} (${codigo}): condição "${row[iCondicao] ?? ''}" inválida — use Débito, Crédito ou Ambos.`); return }

    const classe = CLASSE_BY_LABEL[normalize(row[iClasse] ?? '')]
    if (!classe) { erros.push(`Linha ${linha} (${codigo}): classe "${row[iClasse] ?? ''}" inválida — use Sintética ou Analítica.`); return }

    const ativoRaw = normalize(iAtivo >= 0 ? (row[iAtivo] ?? 'sim') : 'sim')
    const ativo: 'sim' | 'nao' = ativoRaw === 'nao' ? 'nao' : 'sim'

    const tipoKey = normalize(iTipo >= 0 ? (row[iTipo] ?? '') : '')
    const tipo = tipoKey in TIPO_BY_LABEL ? TIPO_BY_LABEL[tipoKey] : undefined
    if (tipo === undefined) { erros.push(`Linha ${linha} (${codigo}): tipo "${row[iTipo] ?? ''}" inválido — use CAPEX, OPEX ou deixe em branco.`); return }

    const paiCodigo = iPai >= 0 ? (row[iPai]?.trim() ?? '') : ''
    const categorias = iCategorias >= 0 ? (row[iCategorias] ?? '').split(';').map(s => s.trim()).filter(Boolean) : []

    parsed.push({ codigo, descricao, condicao, classe, ativo, tipo, paiCodigo, categorias })
  })

  const seen = new Set<string>()
  const duplicados = new Set<string>()
  parsed.forEach(r => { if (seen.has(r.codigo)) duplicados.add(r.codigo); seen.add(r.codigo) })
  duplicados.forEach(c => erros.push(`Código "${c}" duplicado na planilha.`))

  parsed.forEach(r => {
    if (r.paiCodigo && !parsed.some(p => p.codigo === r.paiCodigo)) {
      erros.push(`Conta "${r.codigo}": código pai "${r.paiCodigo}" não encontrado na planilha.`)
    }
  })

  if (erros.length > 0) return abort(erros)

  // Reaproveita o id das contas já cadastradas (chave = código); linhas novas ganham id sequencial.
  const existingByCodigo = new Map(existing.map(c => [c.codigo, c]))
  let nextId = Math.max(0, ...existing.map(c => c.id)) + 1
  const codigoToId = new Map<string, number>()
  parsed.forEach(r => {
    const prev = existingByCodigo.get(r.codigo)
    codigoToId.set(r.codigo, prev ? prev.id : nextId++)
  })

  let criadas = 0
  let atualizadas = 0
  const novasContas: Conta[] = parsed.map(r => {
    const prev = existingByCodigo.get(r.codigo)
    if (prev) atualizadas++; else criadas++
    return {
      id:             codigoToId.get(r.codigo)!,
      codigo:         r.codigo,
      descricao:      r.descricao,
      condicao:       r.condicao,
      classe:         r.classe,
      ativo:          r.ativo,
      tipo:           r.tipo,
      antecessorId:   r.paiCodigo ? codigoToId.get(r.paiCodigo)! : null,
      categorias:     r.categorias,
      dataCriacao:    prev?.dataCriacao ?? new Date().toISOString().slice(0, 10),
      usuarioCriacao: prev?.usuarioCriacao ?? 'Importação',
    }
  })

  const excluidas = existing.filter(c => !parsed.some(r => r.codigo === c.codigo)).length

  return { contas: novasContas, criadas, atualizadas, excluidas, erros: [] }
}
