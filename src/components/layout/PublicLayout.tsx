import type { ReactNode } from 'react'
import logoLight from '../../assets/Logo.svg'
import logoDark from '../../assets/Logo-white.svg'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { LanguageSwitcher, type SupportedLanguage } from './LanguageSwitcher'

interface PublicLayoutProps {
  children: ReactNode
  language: SupportedLanguage
  onLanguageChange: (language: SupportedLanguage) => void
  visual?: ReactNode
  productLabel?: string
}

/** Shell sem chrome autenticado para login, reset, cadastro e páginas públicas. */
export function PublicLayout({ children, language, onLanguageChange, visual, productLabel = 'Gestão rural integrada' }: PublicLayoutProps) {
  const { colors, isGbMode } = useTheme()
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: visual ? undefined : '1fr',
        background: colors.bg.canvas,
        color: colors.fg.default,
        fontFamily: t.font.family.sans,
      }}
      className={visual ? 'lg:grid-cols-2' : undefined}
    >
      {visual && (
        <aside className="hidden lg:flex" style={{ minWidth: 0, background: t.color.brand[800] }}>
          {visual}
        </aside>
      )}
      <section style={{ minWidth: 0, display: 'flex', flexDirection: 'column', padding: t.space[6] }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.space[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[3] }}>
            <img src={isGbMode ? logoDark : logoLight} alt="GB CERNE" style={{ display: 'block', height: t.size.control, width: 'auto' }} />
            <span className="hidden sm:inline" style={{ color: colors.fg.subtle, fontSize: t.font.size.sm }}>
              {productLabel}
            </span>
          </div>
          <LanguageSwitcher value={language} onChange={onLanguageChange} />
        </header>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: `${t.space[8]}px 0` }}>
          {children}
        </div>
      </section>
    </main>
  )
}
