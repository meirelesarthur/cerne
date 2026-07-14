import { Fragment } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

interface BreadcrumbProps {
  items:  BreadcrumbItem[]
  label?: string
}

/**
 * Trilha de navegação acessível. Itens com `href`/`onClick` viram links
 * navegáveis; o último item é sempre o atual (não clicável).
 * Substitui o breadcrumb inline da Topbar.
 */
export function Breadcrumb({ items, label = 'Trilha de navegação' }: BreadcrumbProps) {
  const { colors } = useTheme()

  return (
    <nav
      aria-label={label}
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        t.space[3],
        fontFamily: t.font.family.sans,
        fontSize:   t.font.size.sm,
      }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        const interactive = !isLast && (item.href || item.onClick)
        return (
          <Fragment key={`${item.label}-${i}`}>
            {i > 0 && (
              <span style={{ color: colors.fg.subtle, flexShrink: 0 }} aria-hidden="true">/</span>
            )}
            {interactive ? (
              <a
                href={item.href ?? '#'}
                onClick={(e) => {
                  if (item.onClick) { e.preventDefault(); item.onClick() }
                }}
                style={{
                  color:          colors.fg.muted,
                  textDecoration: 'none',
                  fontWeight:     t.font.weight.normal,
                  transition:     `color ${t.transition.base}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.accent.default }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.fg.muted }}
              >
                {item.label}
              </a>
            ) : (
              <span
                aria-current={isLast ? 'page' : undefined}
                style={{
                  color:      isLast ? colors.fg.default : colors.fg.muted,
                  fontWeight: t.font.weight.normal,
                }}
              >
                {item.label}
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
