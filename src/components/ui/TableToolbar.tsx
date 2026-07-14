import React, { useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { IconButton } from './IconButton'

// ─── TableSearchInput ─────────────────────────────────────────────────────────

export function TableSearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
}: {
  value:       string
  onChange:    (v: string) => void
  placeholder?: string
}) {
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: t.space[2],
        height: t.size.control,
        border: `1.5px solid ${focused ? t.color.brand[600] : colors.border.default}`,
        borderRadius: t.radius.base,
        padding: `0 ${t.space[2] + 2}px`,
        background: colors.bg.surface,
        transition: `border-color ${t.transition.base}`,
        minWidth: 220,
      }}
    >
      <Search
        size={13}
        color={focused ? t.color.brand[600] : colors.fg.subtle}
        style={{ flexShrink: 0, transition: `color ${t.transition.base}` }}
      />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, border: 'none', background: 'transparent', outline: 'none',
          fontSize: t.font.size.md, color: colors.fg.default,
          fontFamily: t.font.family.sans, minWidth: 0,
        }}
      />
      {value && (
        <IconButton
          icon={<X size={11} />}
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          size="xs"
        />
      )}
    </div>
  )
}

// ─── FilterChip ───────────────────────────────────────────────────────────────

export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const { colors } = useTheme()
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: t.space[1],
        height: t.size.control,
        background: colors.accent.subtle,
        border: `1.5px solid ${colors.accent.default}`,
        borderRadius: t.radius.base,
        padding: `0 ${t.space[2]}px 0 ${t.space[2] + 2}px`,
        fontSize: t.font.size.sm,
        color: colors.accent.default,
        fontFamily: t.font.family.sans,
        fontWeight: t.font.weight.medium,
      }}
    >
      {label}
      <button
        type="button"
        className="gb-focusable"
        onClick={onRemove}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: colors.accent.default, display: 'flex', alignItems: 'center', padding: 0,
        }}
      >
        <X size={11} />
      </button>
    </div>
  )
}

// ─── FilterButton ─────────────────────────────────────────────────────────────

export function FilterButton({
  active,
  count,
  onClick,
  label = 'Filtros',
}: {
  active:  boolean
  count:   number
  onClick: () => void
  label?:  string
}) {
  const { colors } = useTheme()
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      className="gb-focusable"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: t.space[1] + 2, // 6px
        height: t.size.control,
        background: active    ? colors.accent.subtle
          : hovered ? colors.bg.subtle : colors.bg.surface,
        border: `1.5px solid ${active ? colors.accent.default : colors.border.default}`,
        borderRadius: t.radius.base,
        padding: `0 ${t.space[3] + 2}px`, // 14px
        fontSize: t.font.size.base,
        fontWeight: t.font.weight.medium,
        fontFamily: t.font.family.sans,
        color: active ? colors.accent.default : colors.fg.muted,
        cursor: 'pointer',
        transition: `background ${t.transition.base}, border-color ${t.transition.base}, color ${t.transition.base}`,
      }}
    >
      <SlidersHorizontal size={13} />
      {label}
      {active && (
        <span
          style={{
            background: colors.accent.default, color: 'white',
            fontSize: 10, fontWeight: 700,
            padding: '1px 6px', borderRadius: 9999,
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}
