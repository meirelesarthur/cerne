/**
 * DatePicker & DateRangePicker
 * Hand-rolled — sem dependências externas de calendário.
 * Formatos: exibição PT-BR (DD/MM/AAAA) · props/value sempre ISO 'YYYY-MM-DD'.
 * Dois temas: light e GBMode via useTheme().
 */

import React, { useState, useRef, useEffect, useId, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Tooltip } from './Tooltip'

// ─── Utilitários de data ──────────────────────────────────────────────────────

const DAYS_PT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

/** Formata ISO → DD/MM/AAAA para exibição. */
function isoToDisplay(iso: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/** ISO local 'YYYY-MM-DD' de um objeto Date (sem conversão de timezone). */
function dateToIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

/** Hoje em ISO local. */
function todayIso(): string {
  return dateToIso(new Date())
}

/** Número de dias no mês. */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** Dia da semana do 1º do mês (0=Dom). */
function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

/** Compara duas strings ISO. Retorna negativo, 0 ou positivo. */
function cmpIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface DatePickerProps {
  label?: string
  required?: boolean
  error?: string
  hint?: string
  value: string | null
  onChange: (iso: string | null) => void
  min?: string
  max?: string
  placeholder?: string
  disabled?: boolean
}

export interface DateRangePickerProps {
  label?: string
  required?: boolean
  error?: string
  hint?: string
  value: { start: string | null; end: string | null }
  onChange: (range: { start: string | null; end: string | null }) => void
  min?: string
  max?: string
  disabled?: boolean
}

// ─── Sub-componente: grade de calendário ──────────────────────────────────────

interface CalendarGridProps {
  year: number
  month: number
  selectedStart?: string | null
  selectedEnd?: string | null
  today: string
  min?: string
  max?: string
  onSelectDay: (iso: string) => void
  hoveredDay?: string | null
  onHoverDay?: (iso: string | null) => void
}

function CalendarGrid({
  year, month, selectedStart, selectedEnd, today, min, max,
  onSelectDay, hoveredDay, onHoverDay,
}: CalendarGridProps) {
  const { colors, isGbMode } = useTheme()
  const totalDays = daysInMonth(year, month)
  const startWeekday = firstDayOfMonth(year, month)

  // Preenche dias anteriores ao mês com null e posteriores idem
  const cells: Array<number | null> = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  // Preencher até 42 células (6 semanas)
  while (cells.length < 42) cells.push(null)

  const rangeStart = selectedStart ?? null
  const rangeEnd   = selectedEnd   ?? null

  return (
    <div>
      {/* Cabeçalho de dias da semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: t.space[1] }}>
        {DAYS_PT.map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center',
              fontSize: t.font.size.xs,
              fontWeight: t.font.weight.semibold,
              color: colors.fg.subtle,
              fontFamily: t.font.family.sans,
              paddingBottom: t.space[1],
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grade 7×6 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={idx} />
          }

          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday     = iso === today
          const isStart     = iso === rangeStart
          const isEnd       = iso === rangeEnd
          const isSelected  = isStart || isEnd || iso === selectedStart

          // Highlight de intervalo (range)
          const effectiveEnd = hoveredDay && rangeStart && !rangeEnd
            ? (cmpIso(hoveredDay, rangeStart) >= 0 ? hoveredDay : rangeStart)
            : rangeEnd

          const inRange = rangeStart && effectiveEnd
            ? cmpIso(iso, rangeStart) > 0 && cmpIso(iso, effectiveEnd) < 0
            : false

          const isDisabled =
            (min ? cmpIso(iso, min) < 0 : false) ||
            (max ? cmpIso(iso, max) > 0 : false)

          // Cores dinâmicas
          let bg = 'transparent'
          let textColor = isDisabled ? colors.fg.subtle : colors.fg.default
          let borderRadius = t.radius.md

          if (isSelected) {
            bg = t.color.brand[600]
            textColor = '#ffffff'
          } else if (inRange) {
            bg = isGbMode ? t.color.state.row.selectedGb : t.color.brand[50]
            textColor = isGbMode ? t.color.gb.accent : t.color.brand[700]
          }

          const fullLabel = new Date(year, month, day)
            .toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

          return (
            <button
              key={idx}
              type="button"
              aria-label={fullLabel}
              aria-pressed={isSelected}
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelectDay(iso)}
              onMouseEnter={() => onHoverDay?.(iso)}
              onMouseLeave={() => onHoverDay?.(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: t.size.calendarCell,
                width: '100%',
                border: isToday && !isSelected ? `1.5px solid ${t.color.brand[500]}` : '1.5px solid transparent',
                borderRadius,
                background: bg,
                color: textColor,
                fontSize: t.font.size.sm,
                fontFamily: t.font.family.sans,
                fontWeight: isToday ? t.font.weight.semibold : t.font.weight.normal,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.4 : 1,
                transition: `background ${t.transition.fast}, color ${t.transition.fast}`,
                outline: 'none',
              }}
              className="gb-focusable"
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Sub-componente: popover de calendário ────────────────────────────────────

interface CalendarPopoverProps {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
  children: React.ReactNode
}

function CalendarPopover({ year, month, onPrev, onNext, children }: CalendarPopoverProps) {
  const { colors } = useTheme()

  return (
    <div
      role="dialog"
      aria-label="Calendário"
      style={{
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: 0,
        zIndex: t.zIndex.dropdown,
        background: colors.bg.surface,
        border: `1px solid ${colors.border.default}`,
        borderRadius: t.radius.lg,
        boxShadow: t.shadow.md,
        padding: t.space[3],
        minWidth: 280,
        userSelect: 'none',
      }}
    >
      {/* Cabeçalho mês/ano + nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: t.space[3],
      }}>
        <button
          type="button"
          aria-label="Mês anterior"
          onClick={onPrev}
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: colors.fg.subtle, padding: 4, borderRadius: t.radius.md,
            transition: `color ${t.transition.fast}`,
          }}
          className="gb-focusable"
        >
          <ChevronLeft size={16} />
        </button>

        <span style={{
          fontSize: t.font.size.base,
          fontWeight: t.font.weight.semibold,
          color: colors.fg.default,
          fontFamily: t.font.family.sans,
        }}>
          {MONTHS_PT[month]} {year}
        </span>

        <button
          type="button"
          aria-label="Próximo mês"
          onClick={onNext}
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: colors.fg.subtle, padding: 4, borderRadius: t.radius.md,
            transition: `color ${t.transition.fast}`,
          }}
          className="gb-focusable"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {children}
    </div>
  )
}

// ─── Sub-componente: trigger (campo) ─────────────────────────────────────────

interface TriggerFieldProps {
  id: string
  displayValue: string
  placeholder: string
  open: boolean
  disabled?: boolean
  isError: boolean
  borderColor: string
  onClick: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

function TriggerField({ id, displayValue, placeholder, open, disabled, isError, borderColor, onClick, onKeyDown }: TriggerFieldProps) {
  const { colors } = useTheme()
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <button
      ref={triggerRef}
      id={id}
      type="button"
      role="combobox"
      aria-haspopup="dialog"
      aria-expanded={open}
      disabled={disabled}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="gb-focusable"
      style={{
        width: '100%',
        height: t.size.control,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: t.space[2],
        paddingLeft: t.space[2] + t.space[1] / 2,
        paddingRight: t.space[2] + t.space[1] / 2,
        border: `1.5px solid ${open ? colors.accent.default : borderColor}`,
        borderRadius: t.radius.base,
        background: disabled ? t.color.state.disabled.bg : isError ? t.color.feedback.error.bg : colors.bg.input,
        color: displayValue ? colors.fg.default : colors.fg.subtle,
        fontSize: t.font.size.base,
        fontFamily: t.font.family.sans,
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        boxShadow: open ? t.glow.brand : 'none',
        transition: [
          `border-color ${t.transition.base}`,
          `box-shadow ${t.transition.base}`,
          `background ${t.transition.smooth}`,
        ].join(', '),
        outline: 'none',
      }}
    >
      <span style={{
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: displayValue ? colors.fg.default : colors.fg.subtle,
      }}>
        {displayValue || placeholder}
      </span>
      <Calendar
        size={15}
        color={open ? colors.accent.default : colors.fg.subtle}
        aria-hidden="true"
        style={{ flexShrink: 0, transition: `color ${t.transition.base}` }}
      />
    </button>
  )
}

// ─── Sub-componente: label wrapper ────────────────────────────────────────────

interface FieldLabelProps {
  htmlFor: string
  label?: string
  required?: boolean
  hint?: string
  colors: ReturnType<typeof useTheme>['colors']
}

function FieldLabel({ htmlFor, label, required, hint, colors }: FieldLabelProps) {
  if (!label) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginBottom: t.space[1] + 2 }}>
      <label
        htmlFor={htmlFor}
        style={{
          fontSize: t.font.size.sm,
          fontWeight: t.font.weight.medium,
          color: colors.fg.default,
          fontFamily: t.font.family.sans,
          cursor: 'pointer',
        }}
      >
        {label}
      </label>
      {required && (
        <span style={{ color: t.color.feedback.error.text, fontSize: t.font.size.sm, lineHeight: 1 }}>*</span>
      )}
      {hint && (
        <Tooltip label={hint}>
          <span style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
            <HelpCircle size={12} color={t.color.neutral[400]} />
          </span>
        </Tooltip>
      )}
    </div>
  )
}

// ─── DatePicker ───────────────────────────────────────────────────────────────

export function DatePicker({
  label, required, error, hint,
  value, onChange,
  min, max,
  placeholder = 'Selecionar data',
  disabled = false,
}: DatePickerProps) {
  const { colors } = useTheme()
  const id = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const today = todayIso()

  // Estado do popover
  const [open, setOpen] = useState(false)

  // Navegar no calendário
  const initDate = value ? new Date(value + 'T00:00:00') : new Date()
  const [viewYear, setViewYear]   = useState(initDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initDate.getMonth())

  // Sincroniza mês/ano ao mudar value externamente
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00')
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
  }, [value])

  // Fecha ao clicar fora
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const prevMonth = useCallback(() => {
    setViewMonth(m => { if (m === 0) { setViewYear(y => y - 1); return 11 } return m - 1 })
  }, [])
  const nextMonth = useCallback(() => {
    setViewMonth(m => { if (m === 11) { setViewYear(y => y + 1); return 0 } return m + 1 })
  }, [])

  const handleSelect = (iso: string) => {
    onChange(iso)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o) }
  }

  const isError = !!error
  const borderColor = isError ? t.color.feedback.error.text : colors.border.default

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
      <FieldLabel htmlFor={id} label={label} required={required} hint={hint} colors={colors} />

      <div ref={containerRef} style={{ position: 'relative' }}>
        <TriggerField
          id={id}
          displayValue={isoToDisplay(value)}
          placeholder={placeholder}
          open={open}
          disabled={disabled}
          isError={isError}
          borderColor={borderColor}
          onClick={() => !disabled && setOpen(o => !o)}
          onKeyDown={handleKeyDown}
        />

        {open && !disabled && (
          <CalendarPopover
            year={viewYear}
            month={viewMonth}
            onPrev={prevMonth}
            onNext={nextMonth}
          >
            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              selectedStart={value}
              today={today}
              min={min}
              max={max}
              onSelectDay={handleSelect}
            />
          </CalendarPopover>
        )}
      </div>

      {isError && error && (
        <span
          role="alert"
          aria-live="polite"
          style={{
            fontSize: t.font.size.xs,
            color: t.color.feedback.error.text,
            fontFamily: t.font.family.sans,
          }}
        >
          {error}
        </span>
      )}
    </div>
  )
}

// ─── DateRangePicker ──────────────────────────────────────────────────────────

export function DateRangePicker({
  label, required, error, hint,
  value, onChange,
  min, max,
  disabled = false,
}: DateRangePickerProps) {
  const { colors } = useTheme()
  const id = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const today = todayIso()

  const [open, setOpen] = useState(false)
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)

  // Estado interno de seleção: primeiro clique = start, segundo = end
  const [pendingStart, setPendingStart] = useState<string | null>(value.start)

  const initDate = value.start ? new Date(value.start + 'T00:00:00') : new Date()
  const [viewYear, setViewYear]   = useState(initDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initDate.getMonth())

  // Sincroniza quando value muda externamente
  useEffect(() => {
    if (value.start) {
      const d = new Date(value.start + 'T00:00:00')
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
    setPendingStart(value.start)
  }, [value.start])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setHoveredDay(null)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const prevMonth = useCallback(() => {
    setViewMonth(m => { if (m === 0) { setViewYear(y => y - 1); return 11 } return m - 1 })
  }, [])
  const nextMonth = useCallback(() => {
    setViewMonth(m => { if (m === 11) { setViewYear(y => y + 1); return 0 } return m + 1 })
  }, [])

  const handleSelect = (iso: string) => {
    // Se não há pendingStart ou já há range completo, inicia nova seleção
    if (!pendingStart || value.end) {
      setPendingStart(iso)
      onChange({ start: iso, end: null })
      return
    }

    // Há pendingStart sem end — define o end (garantindo start ≤ end)
    const [s, e] = cmpIso(iso, pendingStart) >= 0
      ? [pendingStart, iso]
      : [iso, pendingStart]

    onChange({ start: s, end: e })
    setPendingStart(null)
    setOpen(false)
    setHoveredDay(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); setHoveredDay(null) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o) }
  }

  // Exibe no trigger
  const displayValue = (() => {
    if (value.start && value.end) return `${isoToDisplay(value.start)} – ${isoToDisplay(value.end)}`
    if (value.start) return `${isoToDisplay(value.start)} – …`
    return ''
  })()

  const isError = !!error
  const borderColor = isError ? t.color.feedback.error.text : colors.border.default

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
      <FieldLabel htmlFor={id} label={label} required={required} hint={hint} colors={colors} />

      <div ref={containerRef} style={{ position: 'relative' }}>
        <TriggerField
          id={id}
          displayValue={displayValue}
          placeholder="Selecionar período"
          open={open}
          disabled={disabled}
          isError={isError}
          borderColor={borderColor}
          onClick={() => !disabled && setOpen(o => !o)}
          onKeyDown={handleKeyDown}
        />

        {open && !disabled && (
          <CalendarPopover
            year={viewYear}
            month={viewMonth}
            onPrev={prevMonth}
            onNext={nextMonth}
          >
            {/* Instrução contextual */}
            <div style={{
              fontSize: t.font.size.xs,
              color: colors.fg.subtle,
              fontFamily: t.font.family.sans,
              marginBottom: t.space[2],
              textAlign: 'center',
            }}>
              {!value.start || value.end
                ? 'Clique para definir a data inicial'
                : 'Clique para definir a data final'}
            </div>

            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              selectedStart={value.start}
              selectedEnd={value.end}
              today={today}
              min={min}
              max={max}
              onSelectDay={handleSelect}
              hoveredDay={hoveredDay}
              onHoverDay={setHoveredDay}
            />
          </CalendarPopover>
        )}
      </div>

      {isError && error && (
        <span
          role="alert"
          aria-live="polite"
          style={{
            fontSize: t.font.size.xs,
            color: t.color.feedback.error.text,
            fontFamily: t.font.family.sans,
          }}
        >
          {error}
        </span>
      )}
    </div>
  )
}
