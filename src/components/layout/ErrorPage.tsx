import type { ReactNode } from 'react'
import { CircleAlert, Home } from 'lucide-react'
import { Button } from '../ui/Button'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface ErrorPageProps {
  status: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryAction?: ReactNode
}

/** Estado de erro standalone para 403, 404, 500 e indisponibilidade. */
export function ErrorPage({ status, title, description, actionLabel = 'Voltar ao início', onAction, secondaryAction }: ErrorPageProps) {
  const { colors } = useTheme()
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: t.space[6],
        background: colors.bg.canvas,
        fontFamily: t.font.family.sans,
      }}
    >
      <section style={{ width: '100%', maxWidth: t.layout.formMaxWidth, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: t.space[4], borderRadius: t.radius.full, background: colors.accent.subtle, color: colors.accent.default }}>
          <CircleAlert size={t.icon.xl} aria-hidden="true" />
        </div>
        <div style={{ marginTop: t.space[4], color: colors.accent.default, fontSize: t.font.size.sm, fontWeight: t.font.weight.bold, letterSpacing: '0.08em' }}>
          ERRO {status}
        </div>
        <h1 style={{ margin: `${t.space[2]}px 0 0`, color: colors.fg.default, fontSize: t.font.size['3xl'], fontWeight: t.font.weight.bold, lineHeight: t.font.lineHeight.tight }}>
          {title}
        </h1>
        <p style={{ margin: `${t.space[3]}px auto 0`, color: colors.fg.subtle, fontSize: t.font.size.base, lineHeight: t.font.lineHeight.relaxed }}>
          {description}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: t.space[3], marginTop: t.space[6] }}>
          {onAction && <Button icon={<Home size={t.icon.sm} />} onClick={onAction}>{actionLabel}</Button>}
          {secondaryAction}
        </div>
      </section>
    </main>
  )
}
