import type { ReactNode } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface AuthCardProps {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

/** Superfície central de autenticação, cadastro e recuperação de acesso. */
export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  const { colors, isGbMode } = useTheme()
  return (
    <section
      aria-labelledby="auth-card-title"
      style={{
        width: '100%',
        maxWidth: t.layout.formMaxWidth,
        padding: t.space[6],
        border: `1px solid ${colors.border.subtle}`,
        borderRadius: t.radius.xl,
        background: colors.bg.surface,
        boxShadow: isGbMode ? t.shadow.cardDark : t.shadow.card,
      }}
    >
      <header style={{ marginBottom: t.space[6] }}>
        <h1
          id="auth-card-title"
          style={{
            margin: 0,
            color: colors.fg.default,
            fontFamily: t.font.family.sans,
            fontSize: t.font.size['2xl'],
            fontWeight: t.font.weight.bold,
            lineHeight: t.font.lineHeight.tight,
          }}
        >
          {title}
        </h1>
        {description && (
          <p style={{ margin: `${t.space[2]}px 0 0`, color: colors.fg.subtle, fontFamily: t.font.family.sans, fontSize: t.font.size.sm }}>
            {description}
          </p>
        )}
      </header>
      {children}
      {footer && (
        <footer style={{ marginTop: t.space[6], paddingTop: t.space[4], borderTop: `1px solid ${colors.border.subtle}` }}>
          {footer}
        </footer>
      )}
    </section>
  )
}
