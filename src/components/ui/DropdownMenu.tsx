import React, { useEffect, useRef, useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

export interface DropdownMenuItem {
  id:       string
  label:    string
  icon?:    React.ReactNode
  onClick:  () => void
  danger?:  boolean
  divider?: boolean
}

interface DropdownMenuProps {
  items:      DropdownMenuItem[]
  align?:     'left' | 'right'
  ariaLabel?: string
  /** Botão gatilho customizado; default = botão MoreVertical */
  triggerIcon?: React.ReactNode
}

/**
 * Menu de ações contextual ancorado a um botão gatilho. Gerencia seu próprio
 * estado aberto/fechado, fecha com ESC, clique fora e ao escolher um item.
 * Substitui os DropdownItem/MoreVertical reimplementados nas listagens.
 */
export function DropdownMenu({
  items,
  align       = 'right',
  ariaLabel   = 'Abrir menu de ações',
  triggerIcon,
}: DropdownMenuProps) {
  const { colors, isGbMode } = useTheme()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          width:          t.size.pageBtn,
          height:         t.size.pageBtn,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     open ? colors.accent.subtle : 'transparent',
          border:         `1px solid ${open ? colors.accent.default : 'transparent'}`,
          borderRadius:   t.radius.base,
          cursor:         'pointer',
          color:          open ? colors.accent.default : colors.fg.muted,
          transition:     `background ${t.transition.fast}, border-color ${t.transition.fast}`,
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.background = colors.bg.subtle
            e.currentTarget.style.borderColor = colors.border.default
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'transparent'
          }
        }}
      >
        {triggerIcon ?? <MoreVertical size={15} />}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position:     'absolute',
            top:          'calc(100% + 4px)',
            [align]:      0,
            background:   colors.bg.surface,
            border:       `1px solid ${colors.border.default}`,
            borderRadius: t.radius.lg,
            boxShadow:    isGbMode ? t.shadow.cardDarkHover : t.shadow.lg,
            zIndex:       t.zIndex.dropdown,
            minWidth:     150,
            overflow:     'hidden',
          }}
        >
          {items.map((item, i) => (
            <React.Fragment key={item.id}>
              {item.divider && i > 0 && (
                <div style={{ height: 1, background: colors.border.subtle }} />
              )}
              <DropdownRow
                item={item}
                colors={colors}
                onSelect={() => { setOpen(false); item.onClick() }}
              />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

function DropdownRow({
  item, colors, onSelect,
}: {
  item:     DropdownMenuItem
  colors:   ReturnType<typeof useTheme>['colors']
  onSelect: () => void
}) {
  const [hov, setHov] = useState(false)
  const { danger } = item
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        t.space[2],
        width:      '100%',
        padding:    `${t.space[2] + 1}px ${t.space[3] + 2}px`,
        border:     'none',
        cursor:     'pointer',
        background:  hov
          ? (danger ? t.color.feedback.error.bg : colors.bg.subtle)
          : 'transparent',
        color: danger
          ? (hov ? t.color.feedback.error.text : colors.fg.muted)
          : (hov ? colors.fg.default : colors.fg.muted),
        fontSize:   t.font.size.sm,
        fontFamily: t.font.family.sans,
        fontWeight: t.font.weight.medium,
        transition: `background ${t.transition.fast}, color ${t.transition.fast}`,
        textAlign:  'left',
      }}
    >
      {item.icon}
      {item.label}
    </button>
  )
}
