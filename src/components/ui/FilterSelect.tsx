import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

export interface FilterOption {
  value: string
  label: string
}

interface FilterSelectProps {
  /** Opções disponíveis. Inclua a opção "todos" explicitamente quando aplicável. */
  options: FilterOption[]
  /** Valor selecionado (controlado). */
  value: string
  onChange: (value: string) => void
  /** Rótulo acessível do filtro (ex.: "Filtrar por período"). */
  ariaLabel: string
  /** Prefixo exibido antes do valor selecionado (ex.: "Período:"). */
  prefix?: string
}

/**
 * Seletor de filtro para toolbars de dashboard: botão rotulado com o valor
 * atual + menu de opções em portal. Fecha com ESC, clique fora e scroll.
 * Substitui os botões de filtro decorativos (sem onClick) dos dashboards.
 */
export function FilterSelect({ options, value, onChange, ariaLabel, prefix }: FilterSelectProps) {
  const { colors, isGbMode } = useTheme()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  const computePosition = useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect) return
    setPos({ top: rect.bottom + 4, left: rect.left })
  }, [])

  const toggleOpen = () => {
    if (!open) computePosition()
    setOpen((o) => !o)
  }

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        rootRef.current && !rootRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onScroll = () => setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open])

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        className="gb-focusable"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggleOpen}
        style={{
          display:        'inline-flex',
          alignItems:     'center',
          gap:            t.space[1],
          height:         t.size.controlSm,
          padding:        `0 ${t.space[3]}px`,
          background:     open ? colors.accent.subtle : colors.bg.surface,
          border:         `1px solid ${open ? colors.accent.default : colors.border.default}`,
          borderRadius:   t.radius.base,
          cursor:         'pointer',
          color:          open ? colors.accent.default : colors.fg.muted,
          fontSize:       t.font.size.xs,
          fontWeight:     t.font.weight.medium,
          fontFamily:     t.font.family.sans,
          whiteSpace:     'nowrap',
          transition:     `background ${t.transition.fast}, border-color ${t.transition.fast}, color ${t.transition.fast}`,
        }}
      >
        {prefix && <span style={{ color: colors.fg.subtle }}>{prefix}</span>}
        {selected?.label ?? value}
        <ChevronDown size={11} aria-hidden="true" />
      </button>

      {open && pos && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label={ariaLabel}
          style={{
            position:     'fixed',
            top:          pos.top,
            left:         pos.left,
            background:   colors.bg.surface,
            border:       `1px solid ${colors.border.default}`,
            borderRadius: t.radius.lg,
            boxShadow:    isGbMode ? t.shadow.cardDarkHover : t.shadow.lg,
            zIndex:       t.zIndex.dropdown,
            minWidth:     170,
            overflow:     'hidden',
            padding:      `${t.space[1]}px 0`,
          }}
        >
          {options.map((opt) => {
            const active = opt.value === value
            return (
              <FilterOptionRow
                key={opt.value}
                label={opt.label}
                active={active}
                colors={colors}
                onSelect={() => { setOpen(false); if (!active) onChange(opt.value) }}
              />
            )
          })}
        </div>,
        document.body
      )}
    </div>
  )
}

function FilterOptionRow({
  label, active, colors, onSelect,
}: {
  label:    string
  active:   boolean
  colors:   ReturnType<typeof useTheme>['colors']
  onSelect: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap:        t.space[2],
        width:      '100%',
        padding:    `${t.space[2]}px ${t.space[3]}px`,
        border:     'none',
        cursor:     'pointer',
        background: hov ? colors.bg.subtle : 'transparent',
        color:      active ? colors.accent.default : (hov ? colors.fg.default : colors.fg.muted),
        fontSize:   t.font.size.sm,
        fontFamily: t.font.family.sans,
        fontWeight: active ? t.font.weight.semibold : t.font.weight.medium,
        transition: `background ${t.transition.fast}, color ${t.transition.fast}`,
        textAlign:  'left',
      }}
    >
      {label}
      {active && <Check size={13} aria-hidden="true" />}
    </button>
  )
}
