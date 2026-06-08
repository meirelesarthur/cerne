import React, { useRef, useState, useEffect, useId } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

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

  const q = query.trim().toLowerCase()
  const filtered = q
    ? options.filter(o => o.label.toLowerCase().includes(q) || (o.code?.toLowerCase().includes(q) ?? false))
    : options

  return (
    <div>
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[1] + 2 }}>
          <label htmlFor={id} style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.textPrimary, fontFamily: t.font.family.sans }}>
            {label}{required && <span style={{ color: t.color.error.text }}> *</span>}
          </label>
          {headerAction && (
            <button
              type="button"
              onClick={headerAction.onClick}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: t.font.size.xs, color: colors.brand, fontFamily: t.font.family.sans, fontWeight: t.font.weight.semibold, display: 'flex', alignItems: 'center', gap: 3 }}
            >
              {headerAction.icon}{headerAction.label}
            </button>
          )}
        </div>
      )}

      <div ref={containerRef} style={{ position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: t.space[1] + 3,
          height: t.size.control - 2,
          border: `1.5px solid ${error ? t.color.error.text : open ? t.color.brand[600] : colors.border}`,
          borderRadius: t.radius.DEFAULT,
          padding: `0 ${t.space[2] + 2}px`,
          background: colors.surfaceBg,
          transition: `border-color ${t.transition.DEFAULT}`,
        }}>
          <Search size={13} color={open ? t.color.brand[600] : colors.textMuted} style={{ flexShrink: 0 }} aria-hidden="true" />
          <input
            id={id}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={e => { onQueryChange(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            autoComplete="off"
            spellCheck={false}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: t.font.size.sm, color: colors.textPrimary, fontFamily: t.font.family.sans, minWidth: 0 }}
          />
          {query && onClear && (
            <button
              type="button"
              aria-label="Limpar seleção"
              onClick={() => { onClear(); setOpen(false) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: colors.textMuted }}
            >
              <X size={11} />
            </button>
          )}
          <ChevronDown size={12} color={colors.textMuted} aria-hidden="true" />
        </div>

        {open && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: t.zIndex.dropdown,
            background: colors.surfaceBg,
            border: `1px solid ${colors.border}`,
            borderRadius: t.radius.lg,
            boxShadow: t.shadow.md,
            maxHeight: 280,
            overflowY: 'auto',
            marginTop: 2,
          }}>
            <div style={{ padding: `${t.space[2]}px ${t.space[3]}px ${t.space[1] + 2}px`, fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans, borderBottom: `1px solid ${colors.borderSubtle}` }}>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </div>

            {filtered.length === 0 && (
              <div style={{ padding: `${t.space[3]}px`, fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans }}>
                {emptyText}
              </div>
            )}

            {filtered.slice(0, maxVisible).map(opt => (
              <OptionRow
                key={opt.id}
                option={opt}
                isSelected={selectedId === opt.id}
                onSelect={() => { onSelect(opt); setOpen(false) }}
                colors={colors}
              />
            ))}

            {footerAction && (
              <div style={{ borderTop: `1px solid ${colors.borderSubtle}` }}>
                <button
                  type="button"
                  onClick={() => { setOpen(false); footerAction.onClick() }}
                  style={{ width: '100%', padding: `${t.space[2] + 2}px ${t.space[3]}px`, background: 'none', border: 'none', cursor: 'pointer', fontSize: t.font.size.sm, color: colors.brand, fontFamily: t.font.family.sans, fontWeight: t.font.weight.bold, textAlign: 'left', display: 'flex', alignItems: 'center', gap: t.space[1] + 2 }}
                >
                  {footerAction.icon}{footerAction.label}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <span style={{ fontSize: t.font.size.xs, color: t.color.error.text, fontFamily: t.font.family.sans, marginTop: t.space[1], display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
}

function OptionRow({ option, isSelected, onSelect, colors }: {
  option:     SearchSelectOption
  isSelected: boolean
  onSelect:   () => void
  colors:     ReturnType<typeof useTheme>['colors']
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%',
        padding: `${t.space[2]}px ${t.space[3]}px`,
        background: isSelected ? colors.brandBg : hov ? colors.surfaceSubtle : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: t.space[2],
        transition: `background ${t.transition.fast}`,
      }}
    >
      {option.code && (
        <span style={{ fontSize: t.font.size.xs, color: colors.brand, fontWeight: t.font.weight.semibold, fontFamily: t.font.family.sans, minWidth: 52 }}>
          {option.code}
        </span>
      )}
      <span style={{ fontSize: t.font.size.sm, color: colors.textPrimary, fontFamily: t.font.family.sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {option.label}
      </span>
    </button>
  )
}
