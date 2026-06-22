import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, ArrowRight, Hash, type LucideIcon } from 'lucide-react'
import { menuModules } from '../data/menuData'
import { useTheme } from '../context/ThemeContext'

interface SearchItem {
  id: string
  label: string
  moduleLabel: string
  moduleIcon: LucideIcon
  groupLabel?: string
  path: string
}

function buildIndex(): SearchItem[] {
  const items: SearchItem[] = []
  for (const mod of menuModules) {
    if (mod.flatItems) {
      for (const item of mod.flatItems) {
        items.push({ id: item.id, label: item.label, moduleLabel: mod.label, moduleIcon: mod.icon, path: item.path })
      }
    }
    if (mod.groups) {
      for (const group of mod.groups) {
        for (const item of group.items) {
          items.push({ id: item.id, label: item.label, moduleLabel: mod.label, moduleIcon: mod.icon, groupLabel: group.label, path: item.path })
        }
      }
    }
  }
  return items
}

const INDEX = buildIndex()

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: '#d1fae5', color: '#059669', borderRadius: 2, padding: '0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

interface SearchBarProps {
  onNavigate?: (path: string) => void
}

export default function SearchBar({ onNavigate }: SearchBarProps) {
  const { colors, isGbMode } = useTheme()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const results = query.trim().length > 0
    ? INDEX.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.moduleLabel.toLowerCase().includes(query.toLowerCase()) ||
        (item.groupLabel?.toLowerCase().includes(query.toLowerCase()) ?? false)
      ).slice(0, 8)
    : []

  const handleSelect = useCallback((item: SearchItem) => {
    setQuery('')
    setOpen(false)
    onNavigate?.(item.path)
  }, [onNavigate])

  useEffect(() => { setActiveIdx(0) }, [query])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[activeIdx]) handleSelect(results[activeIdx])
  }

  const isOpen = open && results.length > 0

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: 560 }}>
      {/* Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: colors.bg.surface,
          border: open ? `1.5px solid ${colors.accent.default}` : `1.5px solid ${colors.border.default}`,
          borderRadius: isOpen ? '12px 12px 0 0' : 12,
          padding: '0 16px',
          height: 48,
          boxShadow: open ? `0 0 0 3px ${colors.accent.subtle}` : colors.shadow,
          transition: 'border-color 0.15s, box-shadow 0.15s, background 0.2s',
          cursor: 'text',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        <Search size={16} color={open ? '#059669' : '#9ca3af'} style={{ flexShrink: 0, transition: 'color 0.15s' }} />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar funcionalidades, módulos e mais..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 14,
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 400,
            color: colors.fg.default,
            lineHeight: 1,
          }}
        />
        <kbd
          style={{
            fontSize: 11,
            background: colors.bg.subtle,
            border: `1px solid ${colors.border.default}`,
            borderRadius: 6,
            padding: '2px 7px',
            color: colors.fg.subtle,
            fontFamily: "'Outfit', sans-serif",
            whiteSpace: 'nowrap',
            flexShrink: 0,
            lineHeight: 1.6,
          }}
        >
          Ctrl K
        </kbd>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: colors.bg.surface,
            border: `1.5px solid ${colors.accent.default}`,
            borderTop: `1px solid ${colors.border.subtle}`,
            borderRadius: '0 0 12px 12px',
            boxShadow: isGbMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {results.map((item, i) => {
            const Icon = item.moduleIcon
            const isActive = i === activeIdx
            return (
              <div
                key={item.id}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => handleSelect(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '0 16px',
                  height: 48,
                  cursor: 'pointer',
                  background: isActive ? colors.accent.subtle : 'transparent',
                  borderBottom: i < results.length - 1 ? `1px solid ${colors.border.subtle}` : 'none',
                  transition: 'background 0.1s',
                }}
              >
                {/* Module icon */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: isActive ? (isGbMode ? 'rgba(16,185,129,0.18)' : '#d1fae5') : colors.bg.subtle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background 0.1s',
                  }}
                >
                  <Icon size={13} color={isActive ? colors.accent.default : colors.fg.muted} strokeWidth={1.8} />
                </div>

                {/* Text — single line with separator */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: colors.fg.default,
                      fontFamily: "'Outfit', sans-serif",
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {highlight(item.label, query)}
                  </span>

                  <span style={{ color: colors.border.default, fontSize: 12, lineHeight: 1, flexShrink: 0 }}>·</span>

                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 11,
                      color: colors.fg.subtle,
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 400,
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    <Hash size={9} strokeWidth={2} />
                    {item.moduleLabel}
                    {item.groupLabel && (
                      <>
                        <span style={{ color: colors.border.default }}>›</span>
                        {item.groupLabel}
                      </>
                    )}
                  </span>
                </div>

                {/* Arrow */}
                <ArrowRight
                  size={13}
                  color={isActive ? colors.accent.default : colors.border.default}
                  style={{ flexShrink: 0, transition: 'color 0.1s' }}
                />
              </div>
            )
          })}

          {/* Footer */}
          <div
            style={{
              padding: '6px 16px',
              background: colors.bg.subtle,
              borderTop: `1px solid ${colors.border.subtle}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {[['↑↓', 'navegar'], ['Enter', 'selecionar'], ['Esc', 'fechar']].map(([key, label]) => (
              <span
                key={key}
                style={{
                  fontSize: 10,
                  color: colors.fg.subtle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: "'Outfit', sans-serif",
                  lineHeight: 1,
                }}
              >
                <kbd
                  style={{
                    background: colors.bg.surface,
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: 4,
                    padding: '2px 5px',
                    fontSize: 10,
                    color: colors.fg.muted,
                    lineHeight: 1.4,
                  }}
                >
                  {key}
                </kbd>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {open && query.trim().length > 0 && results.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: colors.bg.surface,
            border: `1.5px solid ${colors.accent.default}`,
            borderTop: `1px solid ${colors.border.subtle}`,
            borderRadius: '0 0 12px 12px',
            boxShadow: isGbMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 100,
            padding: '18px 16px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 13, color: colors.fg.subtle, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
            Nenhum resultado para{' '}
            <strong style={{ color: colors.fg.muted }}>"{query}"</strong>
          </div>
        </div>
      )}
    </div>
  )
}
