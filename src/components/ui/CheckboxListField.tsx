import { useState } from 'react'
import { Search } from 'lucide-react'
import { Checkbox } from './Checkbox'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

export interface CheckboxListItem {
  id:    string
  label: string
}

interface CheckboxListFieldProps {
  label:          string
  items:          CheckboxListItem[]
  selectedIds:    string[]
  onChange:       (ids: string[]) => void
  hint?:          string
  searchPlaceholder?: string
  /** Esconde a busca quando a lista é curta (default: mostra a partir de 6 itens). */
  minItemsForSearch?: number
}

/**
 * Lista de checkboxes com busca e contador "Nº de registros selecionados" —
 * padrão para multi-seleções de cadastros relacionados (ex.: Fazendas
 * Vinculadas, Proprietários). Fonte única para não recriar essa combinação
 * em cada formulário que precisar dela.
 */
export function CheckboxListField({
  label,
  items,
  selectedIds,
  onChange,
  hint,
  searchPlaceholder = 'Buscar...',
  minItemsForSearch = 6,
}: CheckboxListFieldProps) {
  const { colors } = useTheme()
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const filtered = q ? items.filter(i => i.label.toLowerCase().includes(q)) : items

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(s => s !== id) : [...selectedIds, id])
  }

  const allSelected = items.length > 0 && items.every(i => selectedIds.includes(i.id))
  const toggleAll = () => onChange(allSelected ? [] : items.map(i => i.id))

  return (
    <div style={{
      border: `1px solid ${colors.border.default}`,
      borderRadius: t.radius.xl,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: `1px solid ${colors.border.default}`,
        background: colors.bg.subtle,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.space[2],
      }}>
        <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default, fontFamily: t.font.family.sans }}>
          {label}
          <span style={{
            marginLeft: 8,
            fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
            padding: '1px 7px', borderRadius: t.radius.full,
            background: colors.accent.subtle, color: colors.accent.default,
          }}>
            {selectedIds.length} registro{selectedIds.length !== 1 ? 's' : ''} selecionado{selectedIds.length !== 1 ? 's' : ''}
          </span>
        </span>
        {items.length > 0 && (
          <button
            type="button"
            className="gb-focusable"
            onClick={toggleAll}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold,
              color: colors.accent.default, fontFamily: t.font.family.sans,
              flexShrink: 0,
            }}
          >
            {allSelected ? 'Desmarcar todos' : 'Marcar todos'}
          </button>
        )}
      </div>

      {items.length >= minItemsForSearch && (
        <div style={{ padding: '10px 18px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            border: `1px solid ${colors.border.default}`, borderRadius: t.radius.base,
            padding: '0 10px', height: t.size.controlSm,
          }}>
            <Search size={13} color={colors.fg.subtle} aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: t.font.size.sm, color: colors.fg.default, fontFamily: t.font.family.sans }}
            />
          </div>
        </div>
      )}

      <div style={{ padding: '10px 18px 14px', display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 260, overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <span style={{ fontSize: t.font.size.sm, color: colors.fg.subtle, fontFamily: t.font.family.sans, padding: '6px 0' }}>
            Nenhum item encontrado.
          </span>
        )}
        {filtered.map(item => (
          <div
            key={item.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 6px',
              borderRadius: t.radius.base,
              cursor: 'pointer',
              transition: `background ${t.animation.duration.faster}`,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = colors.bg.subtle }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            onClick={() => toggle(item.id)}
          >
            <Checkbox
              checked={selectedIds.includes(item.id)}
              onChange={() => toggle(item.id)}
              aria-label={item.label}
            />
            <span style={{ fontSize: t.font.size.sm, color: colors.fg.default, fontFamily: t.font.family.sans }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {hint && (
        <div style={{ padding: '0 18px 12px', fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
          {hint}
        </div>
      )}
    </div>
  )
}
