import { Fragment } from 'react'
import { ChevronRight } from 'lucide-react'
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
        gap:        t.space[1] / 2,
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
              <ChevronRight size={13} style={{ color: colors.border, flexShrink: 0 }} aria-hidden="true" />
            )}
            {interactive ? (
              <a
                href={item.href ?? '#'}
                onClick={(e) => {
                  if (item.onClick) { e.preventDefault(); item.onClick() }
                }}
                style={{
                  color:          colors.textSecondary,
                  textDecoration: 'none',
                  fontWeight:     t.font.weight.normal,
                  transition:     `color ${t.transition.DEFAULT}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.brand }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.textSecondary }}
              >
                {item.label}
              </a>
            ) : (
              <span
                aria-current={isLast ? 'page' : undefined}
                style={{
                  color:      isLast ? colors.textPrimary : colors.textSecondary,
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
