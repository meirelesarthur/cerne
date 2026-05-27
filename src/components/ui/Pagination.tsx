import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PaginationProps {
  /** Página atual, base 1 */
  page: number
  /** Total de itens (antes de paginar) */
  totalItems: number
  /** Itens por página */
  pageSize: number
  onPageChange: (page: number) => void
  /** Quando fornecido, exibe o seletor de linhas por página */
  onPageSizeChange?: (size: number) => void
  /** Opções do seletor. Padrão: [10, 25, 50] */
  pageSizeOptions?: number[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Gera a sequência de páginas com elipses.
 *  Ex: [1, '…', 4, 5, 6, '…', 20] */
function pageSequence(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const delta = 1 // vizinhos da página atual
  const range: (number | '…')[] = []
  const rangeSet = new Set<number>()

  const add = (n: number) => { if (n >= 1 && n <= total) rangeSet.add(n) }

  add(1)
  add(total)
  for (let i = current - delta; i <= current + delta; i++) add(i)

  const sorted = Array.from(rangeSet).sort((a, b) => a - b)

  for (let i = 0; i < sorted.length; i++) {
    range.push(sorted[i])
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      range.push('…')
    }
  }

  return range
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function PageBtn({
  children,
  active = false,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  const { colors } = useTheme()

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      style={{
        minWidth: 32,
        height: 32,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 6px',
        border: `1px solid ${active ? colors.brand : colors.border}`,
        borderRadius: t.radius.DEFAULT,
        background: active ? colors.brandBg : 'transparent',
        color: active
          ? colors.brand
          : disabled
            ? colors.textMuted
            : colors.textSecondary,
        fontSize: t.font.size.sm,
        fontFamily: t.font.family.sans,
        fontWeight: active ? t.font.weight.semibold : t.font.weight.normal,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'background 0.12s, border-color 0.12s, color 0.12s',
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        if (!disabled && !active) {
          e.currentTarget.style.background = colors.surfaceSubtle
        }
      }}
      onMouseLeave={e => {
        if (!disabled && !active) {
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      {children}
    </button>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function Pagination({
  page,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}: PaginationProps) {
  const { colors } = useTheme()
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  if (totalItems === 0) return null

  const from = (page - 1) * pageSize + 1
  const to   = Math.min(page * pageSize, totalItems)
  const seq  = pageSequence(page, totalPages)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: t.space[3],
        marginTop: t.space[3],
        flexWrap: 'wrap',
      }}
    >
      {/* Seletor de linhas por página */}
      {onPageSizeChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          <span
            style={{
              fontSize: t.font.size.xs,
              color: colors.textMuted,
              fontFamily: t.font.family.sans,
              whiteSpace: 'nowrap',
            }}
          >
            Linhas:
          </span>
          <select
            value={pageSize}
            onChange={e => {
              onPageSizeChange(Number(e.target.value))
              onPageChange(1)
            }}
            style={{
              height: 28,
              border: `1px solid ${colors.border}`,
              borderRadius: t.radius.DEFAULT,
              padding: '0 8px',
              fontSize: t.font.size.xs,
              fontFamily: t.font.family.sans,
              color: colors.textPrimary,
              background: colors.inputBg,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {pageSizeOptions.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}

      {/* Texto de intervalo */}
      <span
        style={{
          fontSize: t.font.size.xs,
          color: colors.textMuted,
          fontFamily: t.font.family.sans,
          whiteSpace: 'nowrap',
        }}
      >
        {from}–{to} de {totalItems}
      </span>

      {/* Controles de página — empurrados para a direita */}
      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: t.space[1],
        }}
      >
        {/* Anterior */}
        <PageBtn
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft size={13} />
        </PageBtn>

        {/* Números com elipses */}
        {seq.map((item, idx) =>
          item === '…' ? (
            <span
              key={`ellipsis-${idx}`}
              style={{
                width: 32,
                height: 32,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: t.font.size.sm,
                color: colors.textMuted,
                fontFamily: t.font.family.sans,
                userSelect: 'none',
              }}
            >
              …
            </span>
          ) : (
            <PageBtn
              key={item}
              active={item === page}
              onClick={() => onPageChange(item)}
            >
              {item}
            </PageBtn>
          )
        )}

        {/* Próximo */}
        <PageBtn
          disabled={page === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          <ChevronRight size={13} />
        </PageBtn>
      </div>
    </div>
  )
}
