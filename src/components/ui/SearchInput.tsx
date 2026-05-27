import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface SearchInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = 'Buscar...' }: SearchInputProps) {
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        height: 34,
        border: `1.5px solid ${focused ? t.color.brand[600] : colors.border}`,
        borderRadius: t.radius.DEFAULT,
        padding: '0 10px',
        background: colors.surfaceBg,
        transition: 'border-color 0.15s',
        minWidth: 220,
      }}
    >
      <Search
        size={13}
        color={focused ? t.color.brand[600] : colors.textMuted}
        style={{ flexShrink: 0, transition: 'color 0.15s' }}
      />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          outline: 'none',
          fontSize: t.font.size.sm,
          color: colors.textPrimary,
          fontFamily: t.font.family.sans,
          minWidth: 0,
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            color: colors.textMuted,
          }}
        >
          <X size={11} />
        </button>
      )}
    </div>
  )
}
