import React from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
type HeadingSize = keyof typeof t.font.size
type HeadingWeight = keyof typeof t.font.weight
type HeadingTone = 'primary' | 'secondary' | 'muted'

interface HeadingProps {
  /** Nível semântico do título (h1–h6) */
  level?:        HeadingLevel
  /** Tamanho de fonte tokenizado (independe do nível semântico) */
  size?:         HeadingSize
  weight?:       HeadingWeight
  tone?:         HeadingTone
  align?:        'left' | 'center' | 'right'
  letterSpacing?: string
  style?:        React.CSSProperties
  children:      React.ReactNode
}

/**
 * Título semântico (h1–h6) tokenizado e theme-aware. Substitui os
 * `<h1>`–`<h6>` crus usados diretamente em páginas (Lei 1), nos casos em
 * que `PageHeader`/`FormPageHeader` não se aplicam (títulos de boas-vindas,
 * títulos internos de seção/card, etc.).
 */
export function Heading({
  level         = 2,
  size          = 'xl',
  weight        = 'bold',
  tone          = 'primary',
  align,
  letterSpacing,
  style,
  children,
}: HeadingProps) {
  const { colors } = useTheme()
  const Tag = `h${level}` as React.ElementType
  const color =
    tone === 'muted' ? colors.textMuted
    : tone === 'secondary' ? colors.textSecondary
    : colors.textPrimary

  return (
    <Tag
      style={{
        margin:     0,
        fontSize:   t.font.size[size],
        fontWeight: t.font.weight[weight],
        fontFamily: t.font.family.sans,
        color,
        textAlign:  align,
        letterSpacing,
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}
