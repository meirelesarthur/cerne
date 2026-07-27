import type { CrudEntity } from '../../../components/ui/CrudPattern'
import type { ImportValidationIssue } from '../../../components/ui/ImportDialog'

// ─── Tipo base ──────────────────────────────────────────────────────────────────

export type Animal = CrudEntity & {
  tag: string
  category: string
  batch: string
  status: string
}

export const ANIMAL_STATUS_OPTS = ['Ativo', 'Em manejo', 'Vendido', 'Óbito'] as const

// ─── CSV — colunas e (des)serialização ──────────────────────────────────────────

const CSV_HEADERS = ['Identificação', 'Categoria', 'Lote', 'Status']

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
  return normalized.split('\n').filter((l) => l.trim().length > 0).map(parseCsvLine)
}

const SAMPLE_ROWS: string[][] = [
  ['BR-2048', 'Novilha', 'Recria 2026', 'Ativo'],
  ['BR-2051', 'Vaca', 'Matrizes', 'Ativo'],
  ['BR-2060', 'Garrote', 'Engorda 04', 'Em manejo'],
]

function animalToRow(animal: Animal): string[] {
  return [animal.tag, animal.category, animal.batch, animal.status]
}

/** Gera a planilha (CSV) — preenchida com o rebanho atual, ou com um modelo de exemplo se nada estiver cadastrado. */
export function buildAnimaisCsv(animais: Animal[]): string {
  const rows = animais.length > 0 ? animais.map(animalToRow) : SAMPLE_ROWS
  const lines = [CSV_HEADERS.join(','), ...rows.map((r) => r.map(escapeCsvField).join(','))]
  return lines.join('\r\n')
}

export function downloadAnimaisModelo(animais: Animal[]): void {
  const csv = buildAnimaisCsv(animais)
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = animais.length > 0 ? 'rebanho.csv' : 'modelo-rebanho.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── CSV → Animal[] — importação com validação por linha ───────────────────────

export interface AnimaisImportResult {
  animais: Animal[]
  criados: number
  atualizados: number
  /** Não vazio ⇒ importação abortada, `animais` é igual ao array recebido (sem alterações). */
  erros: ImportValidationIssue[]
}

const STATUS_BY_NORMALIZED = new Map(ANIMAL_STATUS_OPTS.map((label) => [normalize(label), label]))

/**
 * Faz o parsing da planilha e valida cada linha. Registros com a mesma
 * identificação já cadastrada são atualizados; identificações novas são
 * adicionadas. Nenhum registro existente é removido — para excluir animais,
 * use a ação "Excluir tudo…" ou a exclusão individual na listagem.
 */
export function parseAnimaisCsv(text: string, existing: Animal[]): AnimaisImportResult {
  const abort = (erros: ImportValidationIssue[]): AnimaisImportResult => ({ animais: existing, criados: 0, atualizados: 0, erros })

  const rows = parseCsv(text)
  if (rows.length === 0) return abort([{ message: 'Arquivo vazio.' }])

  const header = rows[0].map(normalize)
  const col = (name: string) => header.indexOf(normalize(name))
  const iTag = col('Identificação')
  const iCategory = col('Categoria')
  const iBatch = col('Lote')
  const iStatus = col('Status')

  if (iTag < 0 || iCategory < 0 || iBatch < 0 || iStatus < 0) {
    return abort([{ message: 'Cabeçalho inválido — as colunas Identificação, Categoria, Lote e Status são obrigatórias.' }])
  }

  interface Raw { tag: string; category: string; batch: string; status: string }

  const erros: ImportValidationIssue[] = []
  const parsed: Raw[] = []

  rows.slice(1).forEach((row, i) => {
    const linha = i + 2

    const tag = row[iTag]?.trim() ?? ''
    if (!tag) { erros.push({ line: linha, message: 'identificação é obrigatória.' }); return }
    if (tag.length > 30) { erros.push({ line: linha, message: `identificação "${tag}" excede 30 caracteres.` }); return }

    const category = row[iCategory]?.trim() ?? ''
    if (!category) { erros.push({ line: linha, message: `identificação "${tag}": categoria é obrigatória.` }); return }

    const batch = row[iBatch]?.trim() ?? ''
    if (!batch) { erros.push({ line: linha, message: `identificação "${tag}": lote é obrigatório.` }); return }

    const statusRaw = row[iStatus]?.trim() ?? ''
    const status = STATUS_BY_NORMALIZED.get(normalize(statusRaw))
    if (!status) {
      erros.push({ line: linha, message: `identificação "${tag}": status "${statusRaw}" inválido — use ${ANIMAL_STATUS_OPTS.join(', ')}.` })
      return
    }

    parsed.push({ tag, category, batch, status })
  })

  const seen = new Set<string>()
  const duplicados = new Set<string>()
  parsed.forEach((r) => {
    const key = normalize(r.tag)
    if (seen.has(key)) duplicados.add(r.tag)
    seen.add(key)
  })
  duplicados.forEach((tag) => erros.push({ message: `identificação "${tag}" duplicada na planilha.` }))

  if (erros.length > 0) return abort(erros)

  const existingByTag = new Map(existing.map((a) => [normalize(a.tag), a]))
  let criados = 0
  let atualizados = 0
  const seenTags = new Set<string>()
  const merged: Animal[] = parsed.map((r) => {
    const key = normalize(r.tag)
    seenTags.add(key)
    const prev = existingByTag.get(key)
    if (prev) atualizados++; else criados++
    return {
      id: prev?.id ?? crypto.randomUUID(),
      tag: r.tag,
      category: r.category,
      batch: r.batch,
      status: r.status,
    }
  })

  const unchanged = existing.filter((a) => !seenTags.has(normalize(a.tag)))

  return { animais: [...merged, ...unchanged], criados, atualizados, erros: [] }
}
