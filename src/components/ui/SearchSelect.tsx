import React, { useRef, useState, useEffect, useId, useCallback } from 'react'
import { Search, X, ChevronDown, HelpCircle } from 'lucide-react'
import { Tooltip } from './Tooltip'
import { IconButton } from './IconButton'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

export interface SearchSelectOption {
  id:    string
  label: string
  /** Código/identificador secundário exibido à esquerda do rótulo. */
  code?: string
}

interface SearchSelectAction {
  label:   string
  icon?:   React.ReactNode
  onClick: () => void
}

interface SearchSelectProps {
  label?:        string
  required?:     boolean
  /** Dica exibida em tooltip ao lado do rótulo. */
  hint?:         string
  /** Bloqueia a interação (não abre o dropdown, não permite limpar). */
  disabled?:     boolean
  placeholder?:  string
  /** Texto de busca (controlado). */
  query:         string
  onQueryChange: (q: string) => void
  /** Lista completa de opções — a filtragem por `query` é interna. */
  options:       SearchSelectOption[]
  selectedId?:   string | null
  onSelect:      (option: SearchSelectOption) => void
  onClear?:      () => void
  error?:        string
  /** Ação à direita do rótulo (ex.: "Novo Produto"). */
  headerAction?: SearchSelectAction
  /** Ação fixa no rodapé do dropdown (ex.: "Novo Produto"). */
  footerAction?: SearchSelectAction
  /** Máximo de opções exibidas no dropdown (default 8). */
  maxVisible?:   number
  emptyText?:    string
}

/**
 * Combobox de busca com seleção — input de pesquisa + dropdown de resultados
 * filtrados, com realce do selecionado, contagem, ação opcional no rodapé e
 * fechamento por clique externo. Substitui os comboboxes montados à mão nas
 * telas (Lei 1 / Regra A): o `DropdownMenu` é menu de ações, não de busca.
 */
export function SearchSelect({
  label,
  required,
  hint,
  disabled,
  placeholder = 'Buscar...',
  query,
  onQueryChange,
  options,
  selectedId,
  onSelect,
  onClear,
  error,
  headerAction,
  footerAction,
  maxVisible = 8,
  emptyText = 'Nenhum resultado encontrado.',
}: SearchSelectProps) {
  const { colors } = useTheme()
  const id = useId()
  const listboxId = `${id}-listbox`
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)

  // Fecha ao clicar fora
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  // Reset active index when dropdown closes or filtered list changes
  useEffect(() => {
    if (!open) setActiveIndex(-1)
  }, [open])

  const q = query.trim().toLowerCase()
  const filtered = q
    ? options.filter(o => o.label.toLowerCase().includes(q) || (o.code?.toLowerCase().includes(q) ?? false))
    : options

  const visibleOptions = filtered.slice(0, maxVisible)

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setOpen(true)
        e.preventDefault()
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => Math.min(prev + 1, visibleOptions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < visibleOptions.length) {
        onSelect(visibleOptions[activeIndex])
        setOpen(false)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }, [open, activeIndex, visibleOptions, onSelect])

  return (
    <div>
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[1] + 2 }}>
          <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: t.space[1], fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.fg.default, fontFamily: t.font.family.sans }}>
            <span>{label}{required && <span style={{ color: t.color.feedback.error.text }}> *</span>}</span>
            {hint && (
              <Tooltip label={hint}>
                <span style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
                  <HelpCircle size={12} color={t.color.neutral[400]} />
                </span>
              </Tooltip>
            )}
          </label>
          {headerAction && (
            <button
              type="button"
              onClick={headerAction.onClick}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: t.font.size.xs, color: colors.accent.default, fontFamily: t.font.family.sans, fontWeight: t.font.weight.semibold, display: 'flex', alignItems: 'center', gap: 3 }}
            >
              {headerAction.icon}{headerAction.label}
            </button>
          )}
        </div>
      )}

      <div ref={containerRef} style={{ position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: t.space[1] + 3,
          height: t.size.control,
          border: `1.5px solid ${error ? t.color.feedback.error.text : open ? t.color.brand[600] : colors.border.default}`,
          borderRadius: t.radius.base,
          padding: `0 ${t.space[2] + 2}px`,
          background: disabled ? t.color.state.disabled.bg : colors.bg.surface,
          opacity: disabled ? 0.7 : 1,
          cursor: disabled ? 'not-allowed' : undefined,
          transition: `border-color ${t.transition.base}`,
        }}>
          <Search size={13} color={open ? t.color.brand[600] : colors.fg.subtle} style={{ flexShrink: 0 }} aria-hidden="true" />
          <input
            id={id}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
            placeholder={placeholder}
            value={query}
            disabled={disabled}
            onChange={e => { onQueryChange(e.target.value); setOpen(true); setActiveIndex(-1) }}
            onFocus={() => !disabled && setOpen(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            data-1p-ignore="true"
            data-lpignore="true"
            data-bwignore="true"
            data-form-type="other"
            spellCheck={false}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: t.font.size.md, color: colors.fg.default, fontFamily: t.font.family.sans, minWidth: 0 }}
          />
          {query && onClear && !disabled && (
            <IconButton
              icon={<X size={11} />}
              aria-label="Limpar seleção"
              onClick={() => { onClear(); setOpen(false) }}
              size="xs"
            />
          )}
          <ChevronDown size={12} color={colors.fg.subtle} aria-hidden="true" />
        </div>

        {open && (
          <div
            id={listboxId}
            role="listbox"
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: t.zIndex.dropdown,
              background: colors.bg.surface,
              border: `1px solid ${colors.border.default}`,
              borderRadius: t.radius.lg,
              boxShadow: t.shadow.md,
              maxHeight: 280,
              overflowY: 'auto',
              marginTop: 2,
            }}>
            <div style={{ padding: `${t.space[2]}px ${t.space[3]}px ${t.space[1] + 2}px`, fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans, borderBottom: `1px solid ${colors.border.subtle}` }}>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </div>

            {filtered.length === 0 && (
              <div style={{ padding: `${t.space[3]}px`, fontSize: t.font.size.sm, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
                {emptyText}
              </div>
            )}

            {visibleOptions.map((opt, idx) => (
              <OptionRow
                key={opt.id}
                optionId={`${listboxId}-opt-${idx}`}
                option={opt}
                isSelected={selectedId === opt.id}
                isActive={activeIndex === idx}
                onSelect={() => { onSelect(opt); setOpen(false) }}
                colors={colors}
              />
            ))}

            {footerAction && (
              <div style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
                <button
                  type="button"
                  onClick={() => { setOpen(false); footerAction.onClick() }}
                  style={{ width: '100%', padding: `${t.space[2] + 2}px ${t.space[3]}px`, background: 'none', border: 'none', cursor: 'pointer', fontSize: t.font.size.sm, color: colors.accent.default, fontFamily: t.font.family.sans, fontWeight: t.font.weight.bold, textAlign: 'left', display: 'flex', alignItems: 'center', gap: t.space[1] + 2 }}
                >
                  {footerAction.icon}{footerAction.label}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <span style={{ fontSize: t.font.size.xs, color: t.color.feedback.error.text, fontFamily: t.font.family.sans, marginTop: t.space[1], display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
}

function OptionRow({ option, optionId, isSelected, isActive, onSelect, colors }: {
  option:     SearchSelectOption
  optionId:   string
  isSelected: boolean
  isActive:   boolean
  onSelect:   () => void
  colors:     ReturnType<typeof useTheme>['colors']
}) {
  const [hov, setHov] = useState(false)
  const highlighted = isActive || hov
  return (
    <button
      id={optionId}
      type="button"
      className="gb-focusable"
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%',
        padding: `${t.space[2]}px ${t.space[3]}px`,
        background: isSelected ? colors.accent.subtle : highlighted ? colors.bg.subtle : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: t.space[2],
        transition: `background ${t.transition.fast}`,
        outline: isActive ? `2px solid ${colors.accent.default}` : 'none',
        outlineOffset: -2,
      }}
    >
      {option.code && (
        <span style={{ fontSize: t.font.size.xs, color: colors.accent.default, fontWeight: t.font.weight.semibold, fontFamily: t.font.family.sans, minWidth: 52 }}>
          {option.code}
        </span>
      )}
      <span style={{ fontSize: t.font.size.sm, color: colors.fg.default, fontFamily: t.font.family.sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {option.label}
      </span>
    </button>
  )
}
