import React, { useRef, useState, useCallback, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { t } from '../../../design/tokens'
import { useTheme } from '../../../context/ThemeContext'
import {
  WEEK_COLORS, COLOR_CYCLE, MONTH_NAMES,
  isCurrentWeek,
  type Week, type WeekColor,
} from './safras.types'

// ─── Agrupamento de semanas ────────────────────────────────────────────────────

type WeekEntry = { week: Week; idx: number }
type MonthGroup = { month: number; weeks: WeekEntry[] }
type YearGroup  = { year: number; months: MonthGroup[] }

function groupWeeks(weeks: Week[]): YearGroup[] {
  const result: YearGroup[] = []
  weeks.forEach((week, idx) => {
    let yg = result.find(g => g.year === week.year)
    if (!yg) { yg = { year: week.year, months: [] }; result.push(yg) }
    let mg = yg.months.find(m => m.month === week.month)
    if (!mg) { mg = { month: week.month, weeks: [] }; yg.months.push(mg) }
    mg.weeks.push({ week, idx })
  })
  return result
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipState {
  visible: boolean
  x: number
  y: number
  week: Week | null
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface WeekCanvasProps {
  weeks: Week[]
  desc?: string
  iniLabel?: string
  fimLabel?: string
  editable?: boolean
  onWeeksChange?: (weeks: Week[]) => void
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function WeekCanvas({
  weeks,
  desc,
  iniLabel,
  fimLabel,
  editable = false,
  onWeeksChange,
}: WeekCanvasProps) {
  const { colors } = useTheme()
  const isPainting = useRef(false)
  const [selectedColor, setSelectedColor] = useState<WeekColor>('amarelo')
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, week: null })

  useEffect(() => {
    const up = () => { isPainting.current = false }
    window.addEventListener('mouseup', up)
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchend', up)
    }
  }, [])

  const paint = useCallback((idx: number) => {
    if (!onWeeksChange) return
    onWeeksChange(weeks.map((w, i) => i === idx ? { ...w, color: selectedColor } : w))
  }, [weeks, selectedColor, onWeeksChange])

  const resetCycle = () => {
    if (!onWeeksChange) return
    onWeeksChange(weeks.map((w, i) => ({ ...w, color: COLOR_CYCLE[i % 9] })))
  }

  const grouped = groupWeeks(weeks)

  // Distribuição de cores
  const dist: Partial<Record<WeekColor, number>> = {}
  weeks.forEach(w => { dist[w.color] = (dist[w.color] ?? 0) + 1 })

  // Marcadores de mês na strip de visão geral
  const monthMarkers: { label: string; pct: number }[] = []
  let lastMonth = -1
  weeks.forEach((w, i) => {
    if (w.month !== lastMonth) {
      monthMarkers.push({ label: MONTH_NAMES[w.month], pct: (i / weeks.length) * 100 })
      lastMonth = w.month
    }
  })

  if (weeks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: colors.textMuted, fontFamily: t.font.family.sans, fontSize: t.font.size.base }}>
        Nenhuma semana gerada. Verifique as datas de início e fim.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: t.font.family.sans }}>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          {desc && (
            <span style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.semibold, color: colors.textPrimary }}>
              {desc}
            </span>
          )}
          {iniLabel && fimLabel && (
            <span style={{ fontSize: t.font.size.sm, color: colors.textMuted }}>
              {iniLabel} — {fimLabel} · {weeks.length} semanas
            </span>
          )}
        </div>
        {editable && (
          <button
            type="button"
            onClick={resetCycle}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'none',
              border: `1px solid ${colors.border}`,
              borderRadius: t.radius.default,
              padding: '5px 12px',
              fontSize: t.font.size.sm,
              color: colors.textSecondary,
              cursor: 'pointer',
              fontFamily: t.font.family.sans,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = colors.surfaceSubtle }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
          >
            <RotateCcw size={12} />
            Reiniciar ciclo
          </button>
        )}
      </div>

      {/* ── Visão geral (strip) ──────────────────────────────────────────── */}
      <div>
        <div style={{ fontSize: t.font.size.xs, color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: t.font.weight.medium }}>
          Visão geral — como aparecerá nos relatórios e calendários
        </div>
        <div style={{ height: 28 }}>
          <div style={{ display: 'flex', height: 24, borderRadius: t.radius.default, overflow: 'hidden' }}>
            {weeks.map((w, i) => {
              const def = WEEK_COLORS[w.color]
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    background: def.bg,
                    transform: hoveredIdx === i ? 'scaleY(1.25)' : 'scaleY(1)',
                    transformOrigin: 'center',
                    transition: 'transform 0.1s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    setHoveredIdx(i)
                    setTooltip({ visible: true, x: e.clientX + 14, y: e.clientY - 52, week: w })
                  }}
                  onMouseMove={e => {
                    setTooltip(prev => ({ ...prev, x: e.clientX + 14, y: e.clientY - 52 }))
                  }}
                  onMouseLeave={() => {
                    setHoveredIdx(null)
                    setTooltip(prev => ({ ...prev, visible: false }))
                  }}
                />
              )
            })}
          </div>
          {/* Rótulos de mês */}
          <div style={{ position: 'relative', height: 14, marginTop: 4 }}>
            {monthMarkers.map((m, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  left: `${m.pct}%`,
                  fontSize: 9,
                  color: colors.textMuted,
                  whiteSpace: 'nowrap',
                  transform: 'translateX(-50%)',
                  fontFamily: t.font.family.sans,
                  letterSpacing: '0.03em',
                }}
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Paleta (somente edit) ─────────────────────────────────────────── */}
      {editable && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', padding: '10px 14px', background: colors.surfaceSubtle, borderRadius: t.radius.lg }}>
          <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontWeight: t.font.weight.semibold, marginRight: 4, whiteSpace: 'nowrap' }}>
            Pintar com:
          </span>
          {(Object.keys(WEEK_COLORS) as WeekColor[]).map(key => {
            const def = WEEK_COLORS[key]
            const active = selectedColor === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedColor(key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px',
                  background: def.bg,
                  color: def.text,
                  border: `2px solid ${active ? (def.text === '#ffffff' ? 'rgba(255,255,255,0.6)' : '#1e293b') : def.border}`,
                  borderRadius: t.radius.full,
                  fontSize: t.font.size.xs,
                  fontWeight: active ? t.font.weight.semibold : t.font.weight.medium,
                  cursor: 'pointer',
                  transform: active ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: active ? t.shadow.md : 'none',
                  transition: 'transform 0.1s, box-shadow 0.1s, border-color 0.1s',
                  fontFamily: t.font.family.sans,
                  outline: 'none',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: def.text === '#ffffff' ? 'rgba(255,255,255,0.7)' : def.text, flexShrink: 0 }} />
                {def.label}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Grade de tiles ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {grouped.map(yg => (
          <div key={yg.year}>
            {grouped.length > 1 && (
              <div style={{
                fontSize: t.font.size.sm,
                fontWeight: t.font.weight.semibold,
                color: colors.textPrimary,
                padding: '10px 0 6px',
                borderBottom: `1px solid ${colors.border}`,
                marginBottom: 10,
              }}>
                {yg.year}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {yg.months.map(mg => (
                <div key={mg.month} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 36,
                    flexShrink: 0,
                    fontSize: t.font.size.xs,
                    fontWeight: t.font.weight.semibold,
                    color: colors.textMuted,
                    textAlign: 'right',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    paddingTop: 26,
                  }}>
                    {MONTH_NAMES[mg.month]}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1 }}>
                    {mg.weeks.map(({ week, idx }) => {
                      const def = WEEK_COLORS[week.color]
                      const isCurrent = isCurrentWeek(week)
                      const isHov = hoveredIdx === idx

                      return (
                        <div
                          key={idx}
                          style={{
                            width: 80,
                            height: 72,
                            borderRadius: 10,
                            background: def.bg,
                            border: `2px solid ${isCurrent ? '#16a34a' : def.border}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 3,
                            cursor: editable ? 'crosshair' : 'default',
                            position: 'relative',
                            transform: isHov && !isPainting.current ? 'translateY(-3px) scale(1.04)' : 'none',
                            boxShadow: isHov ? t.shadow.md : 'none',
                            transition: 'transform 0.12s, box-shadow 0.12s',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                          }}
                          onMouseDown={editable ? () => {
                            isPainting.current = true
                            paint(idx)
                          } : undefined}
                          onMouseEnter={e => {
                            setHoveredIdx(idx)
                            setTooltip({ visible: true, x: e.clientX + 14, y: e.clientY - 52, week })
                            if (editable && isPainting.current) paint(idx)
                          }}
                          onMouseMove={e => {
                            setTooltip(prev => ({ ...prev, x: e.clientX + 14, y: e.clientY - 52 }))
                          }}
                          onMouseLeave={() => {
                            setHoveredIdx(null)
                            setTooltip(prev => ({ ...prev, visible: false }))
                          }}
                        >
                          {isCurrent && (
                            <div style={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              background: '#16a34a',
                              boxShadow: '0 0 0 2px rgba(22,163,74,0.25)',
                            }} />
                          )}
                          <span style={{
                            fontSize: 13,
                            fontWeight: t.font.weight.bold,
                            color: def.text,
                            fontFamily: t.font.family.sans,
                            lineHeight: 1,
                          }}>
                            S{String(week.num).padStart(2, '0')}
                          </span>
                          <span style={{
                            fontSize: 9,
                            color: def.text,
                            opacity: 0.75,
                            textAlign: 'center',
                            lineHeight: 1.5,
                            fontFamily: t.font.family.sans,
                          }}>
                            {week.start.slice(0, 5)}<br />{week.end.slice(0, 5)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Distribuição ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        paddingTop: 12,
        borderTop: `1px solid ${colors.borderSubtle}`,
      }}>
        <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontWeight: t.font.weight.medium }}>
          Distribuição:
        </span>
        {(Object.keys(WEEK_COLORS) as WeekColor[])
          .filter(k => (dist[k] ?? 0) > 0)
          .map(k => {
            const def = WEEK_COLORS[k]
            return (
              <span
                key={k}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '2px 9px',
                  background: def.bg,
                  color: def.text,
                  border: `1px solid ${def.border}`,
                  borderRadius: t.radius.full,
                  fontSize: t.font.size.xs,
                  fontWeight: t.font.weight.medium,
                  fontFamily: t.font.family.sans,
                }}
              >
                {def.label}: {dist[k]} sem.
              </span>
            )
          })}
      </div>

      {/* ── Tooltip global ────────────────────────────────────────────────── */}
      {tooltip.visible && tooltip.week && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            background: '#0f172a',
            color: 'white',
            padding: '7px 11px',
            borderRadius: 10,
            fontSize: t.font.size.xs,
            fontFamily: t.font.family.sans,
            pointerEvents: 'none',
            zIndex: t.zIndex.toast,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: t.font.weight.semibold, marginBottom: 1 }}>
            Semana {tooltip.week.num} · {WEEK_COLORS[tooltip.week.color].label}
          </div>
          <div style={{ opacity: 0.75 }}>
            {tooltip.week.start} — {tooltip.week.end}
          </div>
        </div>
      )}
    </div>
  )
}
