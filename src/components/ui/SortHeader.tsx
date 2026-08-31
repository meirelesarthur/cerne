import { Icon } from './Icon'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

type SortDir = 'asc' | 'desc'

interface SortHeaderProps {
  /** Texto da coluna. */
  label: string
  /** Identificador desta coluna. */
  field: string
  /** Coluna atualmente ordenada. */
  activeField: string
  /** Direção atual da ordenação. */
  direction: SortDir
  /** Disparado ao clicar — alterna direção se já ativa. */
  onSort: (field: string) => void
  align?: 'left' | 'center' | 'right'
}

/**
 * Cabeçalho de coluna ordenável para tabelas montadas em grid (listas que não
 * usam `DataTable`). Nenhuma listagem do catálogo usa hoje — todas migraram
 * para `DataTable` (que expõe ordenação controlada via `sortColumn`/
 * `sortDirection`/`onSortChange`). Mantido para casos futuros de grid manual.
 */
export function SortHeader({
  label,
  field,
  activeField,
  direction,
  onSort,
  align = 'left',
}: SortHeaderProps) {
  const { colors } = useTheme()
  const isActive = activeField === field

  return (
    <button
      type="button"
      className="gb-focusable"
      onClick={() => onSort(field)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: t.space[1],
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        margin: 0,
        fontSize: t.font.size.sm,
        fontWeight: t.font.weight.semibold,
        color: isActive ? colors.fg.default : colors.fg.subtle,
        fontFamily: t.font.family.sans,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
        transition: `color ${t.transition.base}`,
      }}
    >
      {label}
      <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }} aria-hidden="true">
        <Icon name="chevron-up"   size={t.icon.xs} style={{ opacity: isActive && direction === 'asc'  ? 1 : 0.3 }} />
        <Icon name="chevron-down" size={t.icon.xs} style={{ opacity: isActive && direction === 'desc' ? 1 : 0.3 }} />
      </span>
    </button>
  )
}
