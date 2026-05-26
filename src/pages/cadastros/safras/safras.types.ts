// ─── Tipos base ───────────────────────────────────────────────────────────────

export type WeekColor =
  | 'amarelo' | 'azul-claro' | 'azul-escuro' | 'azul-marinho'
  | 'branco' | 'marrom' | 'palha' | 'preto' | 'rosa'

export type Mes =
  | 'jan' | 'fev' | 'mar' | 'abr' | 'mai' | 'jun'
  | 'jul' | 'ago' | 'set' | 'out' | 'nov' | 'dez'

export interface Week {
  num: number
  color: WeekColor
  start: string   // DD/MM/YYYY
  end: string     // DD/MM/YYYY
  year: number
  month: number   // 0-11
}

export interface Safra {
  id: number
  desc: string
  ini: string     // YYYY-MM-DD
  fim: string     // YYYY-MM-DD
  ativo: 'sim' | 'nao'
  reb: 'individual' | 'coletivo' | 'nenhum'
  evo: 'habilitado' | 'desabilitado'
  s1: Mes
  s2: Mes
  weeks: Week[]
}

// ─── Cores de semanas ─────────────────────────────────────────────────────────

export interface ColorDef {
  bg: string
  text: string
  label: string
  border: string
}

export const WEEK_COLORS: Record<WeekColor, ColorDef> = {
  'amarelo':      { bg: '#fef08a', text: '#713f12', label: 'Amarelo',      border: '#fde047' },
  'azul-claro':   { bg: '#bae6fd', text: '#0c4a6e', label: 'Azul claro',   border: '#7dd3fc' },
  'azul-escuro':  { bg: '#1e3a5f', text: '#ffffff', label: 'Azul escuro',  border: '#2d5a8e' },
  'azul-marinho': { bg: '#0c1a3e', text: '#ffffff', label: 'Azul marinho', border: '#1a3060' },
  'branco':       { bg: '#f8fafc', text: '#334155', label: 'Branco',       border: '#e2e8f0' },
  'marrom':       { bg: '#92400e', text: '#ffffff', label: 'Marrom',       border: '#b45309' },
  'palha':        { bg: '#fef3c7', text: '#78350f', label: 'Palha',        border: '#fde68a' },
  'preto':        { bg: '#0f172a', text: '#ffffff', label: 'Preto',        border: '#1e293b' },
  'rosa':         { bg: '#fce7f3', text: '#831843', label: 'Rosa',         border: '#f9a8d4' },
}

export const COLOR_CYCLE: WeekColor[] = [
  'amarelo', 'azul-claro', 'azul-escuro', 'azul-marinho', 'branco',
  'marrom', 'palha', 'preto', 'rosa',
]

// ─── Nomes de mês ─────────────────────────────────────────────────────────────

export const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
export const MONTH_FULL  = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export const MES_OPTS: { value: Mes; label: string }[] = [
  { value: 'jan', label: 'Janeiro' },
  { value: 'fev', label: 'Fevereiro' },
  { value: 'mar', label: 'Março' },
  { value: 'abr', label: 'Abril' },
  { value: 'mai', label: 'Maio' },
  { value: 'jun', label: 'Junho' },
  { value: 'jul', label: 'Julho' },
  { value: 'ago', label: 'Agosto' },
  { value: 'set', label: 'Setembro' },
  { value: 'out', label: 'Outubro' },
  { value: 'nov', label: 'Novembro' },
  { value: 'dez', label: 'Dezembro' },
]

// ─── Algoritmo de geração de semanas ──────────────────────────────────────────

function isoWeekNum(d: Date): number {
  const u = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  u.setUTCDate(u.getUTCDate() + 4 - (u.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(u.getUTCFullYear(), 0, 1))
  return Math.ceil((((u.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function fmtDate(d: Date): string {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function generateWeeks(ini: string, fim: string, existing?: Week[]): Week[] {
  if (!ini || !fim) return []
  const iniDate = new Date(ini + 'T00:00:00')
  const fimDate = new Date(fim + 'T00:00:00')
  if (isNaN(iniDate.getTime()) || isNaN(fimDate.getTime()) || fimDate <= iniDate) return []

  const dow = iniDate.getDay()
  const offset = dow === 0 ? 6 : dow - 1
  const cursor = new Date(iniDate)
  cursor.setDate(cursor.getDate() - offset)

  const weeks: Week[] = []
  let i = 0
  while (cursor <= fimDate) {
    const end = new Date(cursor)
    end.setDate(end.getDate() + 6)
    const num = isoWeekNum(cursor)
    const year = cursor.getFullYear()
    const prev = existing?.find(w => w.num === num && w.year === year)
    weeks.push({
      num,
      color: prev?.color ?? COLOR_CYCLE[i % 9],
      start: fmtDate(new Date(cursor)),
      end:   fmtDate(end),
      year,
      month: cursor.getMonth(),
    })
    cursor.setDate(cursor.getDate() + 7)
    i++
  }
  return weeks
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isCurrentWeek(week: Week): boolean {
  const today = new Date()
  const [sd, sm, sy] = week.start.split('/').map(Number)
  const [ed, em, ey] = week.end.split('/').map(Number)
  const start = new Date(sy, sm - 1, sd)
  const end   = new Date(ey, em - 1, ed)
  return today >= start && today <= end
}

export function fmtYMDtoDMY(date: string): string {
  if (!date) return ''
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y}`
}
