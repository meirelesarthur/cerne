import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface PaginationProps {
  page:                number
  total:               number
  pageSize:            number
  onPageChange:        (page: number) => void
  onPageSizeChange?:   (size: number) => void
  pageSizeOptions?:    number[]
  showPageSizeSelector?: boolean
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50]
const MAX_VISIBLE_PAGES         = 5

function buildPageRange(current: number, totalPages: number): (number | '...')[] {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const half   = Math.floor(MAX_VISIBLE_PAGES / 2)
  let start    = Math.max(1, current - half)
  const end    = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1)

  if (end - start < MAX_VISIBLE_PAGES - 1) {
    start = Math.max(1, end - MAX_VISIBLE_PAGES + 1)
  }

  const pages: (number | '...')[] = []

  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('...')
  }

  for (let i = start; i <= end; i++) pages.push(i)

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('...')
    pages.push(totalPages)
  }

  return pages
}

export function Pagination({
  page,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions    = DEFAULT_PAGE_SIZE_OPTIONS,
  showPageSizeSelector = false,
}: PaginationProps) {
  const { colors } = useTheme()

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from       = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to         = Math.min(page * pageSize, total)
  const pages      = buildPageRange(page, totalPages)

  const btnBase: React.CSSProperties = {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          t.size.pageBtn,
    height:         t.size.pageBtn,
    borderRadius:   t.radius.md,
    border:         `1px solid ${colors.border}`,
    background:     colors.surfaceBg,
    cursor:         'pointer',
    fontFamily:     t.font.family.sans,
    fontSize:       t.font.size.sm,
    fontWeight:     t.font.weight.medium,
    color:          colors.textSecondary,
    transition:     `background ${t.transition.fast}, color ${t.transition.fast}, border-color ${t.transition.fast}`,
    userSelect:     'none',
  }

  const btnActive: React.CSSProperties = {
    ...btnBase,
    background:  t.color.brand[600],
    color:       t.color.neutral[0],
    border:      `1px solid ${t.color.brand[600]}`,
    cursor:      'default',
  }

  const btnDisabled: React.CSSProperties = {
    ...btnBase,
    opacity:  0.4,
    cursor:   'not-allowed',
  }

  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        flexWrap:       'wrap',
        gap:            t.space[3],
      }}
    >
      {/* Info de registros */}
      <span
        style={{
          fontSize:   t.font.size.sm,
          color:      colors.textMuted,
          fontFamily: t.font.family.sans,
          whiteSpace: 'nowrap',
        }}
      >
        {total === 0
          ? 'Nenhum registro'
          : `Exibindo ${from}–${to} de ${total} registros`}
      </span>

      {/* Controles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
        {/* Seletor de linhas por página */}
        {showPageSizeSelector && onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
            <span style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans }}>
              Linhas:
            </span>
            <select
              value={pageSize}
              onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1) }}
              style={{
                height:       t.size.pageBtn,
                padding:      `0 ${t.space[2]}px`,
                border:       `1px solid ${colors.border}`,
                borderRadius: t.radius.md,
                background:   colors.surfaceBg,
                color:        colors.textPrimary,
                fontSize:     t.font.size.sm,
                fontFamily:   t.font.family.sans,
                cursor:       'pointer',
                outline:      'none',
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}

        {/* Botões de página */}
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
          {/* Previous */}
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => page > 1 && onPageChange(page - 1)}
            aria-label="Página anterior"
            style={page <= 1 ? btnDisabled : btnBase}
            onMouseEnter={(e) => {
              if (page > 1) e.currentTarget.style.background = colors.surfaceSubtle
            }}
            onMouseLeave={(e) => {
              if (page > 1) e.currentTarget.style.background = colors.surfaceBg
            }}
          >
            <ChevronLeft size={14} />
          </button>

          {/* Page numbers */}
          {pages.map((p, idx) =>
            p === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  width:          t.size.pageBtn,
                  display:        'inline-flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       t.font.size.sm,
                  color:          colors.textMuted,
                  fontFamily:     t.font.family.sans,
                  userSelect:     'none',
                }}
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => p !== page && onPageChange(p)}
                aria-label={`Página ${p}`}
                aria-current={p === page ? 'page' : undefined}
                style={p === page ? btnActive : btnBase}
                onMouseEnter={(e) => {
                  if (p !== page) e.currentTarget.style.background = colors.surfaceSubtle
                }}
                onMouseLeave={(e) => {
                  if (p !== page) e.currentTarget.style.background = colors.surfaceBg
                }}
              >
                {p}
              </button>
            )
          )}

          {/* Next */}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => page < totalPages && onPageChange(page + 1)}
            aria-label="Próxima página"
            style={page >= totalPages ? btnDisabled : btnBase}
            onMouseEnter={(e) => {
              if (page < totalPages) e.currentTarget.style.background = colors.surfaceSubtle
            }}
            onMouseLeave={(e) => {
              if (page < totalPages) e.currentTarget.style.background = colors.surfaceBg
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
