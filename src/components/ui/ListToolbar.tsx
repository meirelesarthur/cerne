import { type ReactNode } from 'react'
import { t } from '../../design/tokens'
import { Button } from './Button'
import { TableSearchInput, FilterChip, FilterButton } from './TableToolbar'

export interface ListToolbarChip {
  label:    string
  onRemove: () => void
}

interface ListToolbarProps {
  search:            string
  onSearch:          (v: string) => void
  searchPlaceholder?: string
  /** Chips de filtro ativos — entradas falsy são ignoradas (uso condicional direto). */
  chips?:            (ListToolbarChip | '' | false | null | undefined)[]
  /** "Limpar tudo" — exibido quando há mais de um chip ativo. */
  onClearAll?:       () => void
  /** Quando informado, renderiza o FilterButton à direita da busca. */
  onOpenFilter?:     () => void
  filterCount?:      number
  /** Conteúdo extra à direita da linha de busca (ex.: ViewToggle). */
  actions?:          ReactNode
}

/**
 * Toolbar padrão de listagens: busca + ações na primeira linha; chips de
 * filtro ativos na linha de baixo. Fonte única do layout — não montar inline.
 */
export function ListToolbar({
  search,
  onSearch,
  searchPlaceholder,
  chips,
  onClearAll,
  onOpenFilter,
  filterCount = 0,
  actions,
}: ListToolbarProps) {
  const visibleChips = (chips ?? []).filter(Boolean) as ListToolbarChip[]

  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        gap:           t.space[3],
        marginBottom:  t.space[3],
      }}
    >
      {/* Linha 1 — busca + ações */}
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] + 2, flexWrap: 'wrap' }}>
        <TableSearchInput value={search} onChange={onSearch} placeholder={searchPlaceholder} />
        <div style={{ flex: 1 }} />
        {onOpenFilter && (
          <FilterButton active={filterCount > 0} count={filterCount} onClick={onOpenFilter} />
        )}
        {actions}
      </div>

      {/* Linha 2 — chips de filtro ativos */}
      {visibleChips.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], flexWrap: 'wrap' }}>
          {visibleChips.map((chip, i) => (
            <FilterChip key={i} label={chip.label} onRemove={chip.onRemove} />
          ))}
          {onClearAll && visibleChips.length > 1 && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Limpar tudo
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
