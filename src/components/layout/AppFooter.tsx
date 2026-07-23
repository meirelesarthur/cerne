import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface AppFooterProps {
  product?: string
  version?: string
}

/** Rodapé discreto para shells, páginas standalone e saídas institucionais. */
export function AppFooter({ product = 'GB CERNE', version }: AppFooterProps) {
  const { colors } = useTheme()
  return (
    <footer
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: t.space[2],
        padding: `${t.space[3]}px ${t.space[6]}px`,
        borderTop: `1px solid ${colors.border.subtle}`,
        color: colors.fg.subtle,
        background: colors.bg.surface,
        fontFamily: t.font.family.sans,
        fontSize: t.font.size.xs,
      }}
    >
      <span>{product}</span>
      {version && <span>Versão {version}</span>}
    </footer>
  )
}
