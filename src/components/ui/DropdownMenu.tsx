import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
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

interface MenuPos {
  top: number
  left?: number
  right?: number
}

/**
 * Menu de ações contextual ancorado a um botão gatilho. Gerencia seu próprio
 * estado aberto/fechado, fecha com ESC, clique fora, scroll e ao escolher um
 * item. Substitui os DropdownItem/MoreVertical reimplementados nas listagens.
 *
 * O menu é renderizado via portal em `document.body` (posicionado por
 * coordenadas do gatilho) para escapar de qualquer ancestral com
 * `overflow: hidden` — ex.: o wrapper arredondado do `DataTable`.
 */
export function DropdownMenu({
  items,
  align       = 'right',
  ariaLabel   = 'Abrir menu de ações',
  triggerIcon,
}: DropdownMenuProps) {
  const { colors, isGbMode } = useTheme()
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const computePosition = useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect) return
    setMenuPos(
      align === 'right'
        ? { top: rect.bottom + 4, right: window.innerWidth - rect.right }
        : { top: rect.bottom + 4, left: rect.left }
    )
  }, [align])

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
    // Fecha ao rolar (tabela, drawer, página) — evita menu desalinhado do gatilho.
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

  // Move o foco para o primeiro item do menu ao abrir (padrão ARIA APG para role="menu").
  useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(() => {
      const first = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')
      first?.focus()
    })
    return () => cancelAnimationFrame(raf)
  }, [open])

  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const menuItems = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    )
    if (menuItems.length === 0) return
    const currentIndex = menuItems.indexOf(document.activeElement as HTMLElement)

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        const next = menuItems[(currentIndex + 1 + menuItems.length) % menuItems.length]
        next.focus()
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        const prev = menuItems[(currentIndex - 1 + menuItems.length) % menuItems.length]
        prev.focus()
        break
      }
      case 'Home': {
        e.preventDefault()
        menuItems[0].focus()
        break
      }
      case 'End': {
        e.preventDefault()
        menuItems[menuItems.length - 1].focus()
        break
      }
    }
  }

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        className="gb-focusable"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggleOpen}
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

      {open && menuPos && createPortal(
        <div
          ref={menuRef}
          role="menu"
          onKeyDown={onMenuKeyDown}
          style={{
            position:     'fixed',
            top:          menuPos.top,
            left:         menuPos.left,
            right:        menuPos.right,
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
        </div>,
        document.body
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
      className="gb-focusable"
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
