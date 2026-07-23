import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

export type SupportedLanguage = 'pt-BR' | 'en' | 'es'

interface LanguageSwitcherProps {
  value: SupportedLanguage
  onChange: (language: SupportedLanguage) => void
}

const LANGUAGES: { value: SupportedLanguage; shortLabel: string; label: string }[] = [
  { value: 'pt-BR', shortLabel: 'PT', label: 'Português do Brasil' },
  { value: 'en', shortLabel: 'EN', label: 'English' },
  { value: 'es', shortLabel: 'ES', label: 'Español' },
]

/** Seletor compacto de idioma para superfícies públicas e standalone. */
export function LanguageSwitcher({ value, onChange }: LanguageSwitcherProps) {
  const { colors } = useTheme()
  return (
    <div
      role="group"
      aria-label="Selecionar idioma"
      style={{
        display: 'inline-flex',
        padding: t.space[1],
        gap: t.space[1],
        border: `1px solid ${colors.border.default}`,
        borderRadius: t.radius.lg,
        background: colors.bg.surface,
      }}
    >
      {LANGUAGES.map((language) => {
        const selected = value === language.value
        return (
          <button
            key={language.value}
            type="button"
            className="gb-focusable"
            aria-label={language.label}
            aria-pressed={selected}
            onClick={() => onChange(language.value)}
            style={{
              minWidth: t.size.control,
              height: t.size.btn.sm,
              padding: `0 ${t.space[2]}px`,
              border: 0,
              borderRadius: t.radius.base,
              background: selected ? colors.accent.subtle : 'transparent',
              color: selected ? colors.accent.default : colors.fg.subtle,
              fontFamily: t.font.family.sans,
              fontSize: t.font.size.xs,
              fontWeight: t.font.weight.semibold,
              cursor: 'pointer',
              transition: `background ${t.transition.fast}, color ${t.transition.fast}`,
            }}
          >
            {language.shortLabel}
          </button>
        )
      })}
    </div>
  )
}
