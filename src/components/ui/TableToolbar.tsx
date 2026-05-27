import React, { useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

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
        height: 38,
        border: `1.5px solid ${focused ? t.color.brand[600] : colors.border}`,
        borderRadius: t.radius.DEFAULT,
        padding: `0 ${t.space[2] + 2}px`,
        background: colors.surfaceBg,
        transition: `border-color ${t.transition.DEFAULT}`,
        minWidth: 220,
      }}
    >
      <Search
        size={13}
        color={focused ? t.color.brand[600] : colors.textMuted}
        style={{ flexShrink: 0, transition: `color ${t.transition.DEFAULT}` }}
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
          fontSize: t.font.size.sm, color: colors.textPrimary,
          fontFamily: t.font.family.sans, minWidth: 0,
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, display: 'flex', alignItems: 'center',
            color: colors.textMuted,
          }}
        >
          <X size={11} />
        </button>
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
        height: 38,
        background: colors.brandBg,
        border: `1.5px solid ${colors.brand}`,
        borderRadius: t.radius.DEFAULT,
        padding: `0 ${t.space[2]}px 0 ${t.space[2] + 2}px`,
        fontSize: t.font.size.sm,
        color: colors.brand,
        fontFamily: t.font.family.sans,
        fontWeight: t.font.weight.medium,
      }}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: colors.brand, display: 'flex', alignItems: 'center', padding: 0,
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
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: t.space[1] + 2, // 6px
        height: 38,
        background: active    ? colors.brandBg
          : hovered ? colors.surfaceSubtle : colors.surfaceBg,
        border: `1.5px solid ${active ? colors.brand : colors.border}`,
        borderRadius: t.radius.DEFAULT,
        padding: `0 ${t.space[3] + 2}px`, // 14px
        fontSize: t.font.size.base,
        fontWeight: t.font.weight.medium,
        fontFamily: t.font.family.sans,
        color: active ? colors.brand : colors.textSecondary,
        cursor: 'pointer',
        transition: `background ${t.transition.DEFAULT}, border-color ${t.transition.DEFAULT}, color ${t.transition.DEFAULT}`,
      }}
    >
      <SlidersHorizontal size={13} />
      {label}
      {active && (
        <span
          style={{
            background: colors.brand, color: 'white',
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
