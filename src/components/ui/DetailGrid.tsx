import type { ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { IconButton } from './IconButton'

export interface DetailItem {
  label: string
  value: ReactNode
  copyValue?: string
  sensitive?: boolean
}

interface ReadOnlyFieldProps extends DetailItem {}

export function ReadOnlyField({ label, value, copyValue, sensitive = false }: ReadOnlyFieldProps) {
  const { colors } = useTheme()
  const [copied, setCopied] = useState(false)
  const visibleValue = sensitive && typeof value === 'string' ? '••••••••••••' : value

  const copy = async () => {
    if (!copyValue) return
    await navigator.clipboard.writeText(copyValue)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      style={{
        minWidth: 0,
        padding: `${t.space[3]}px ${t.space[4]}px`,
        border: `1px solid ${colors.border.subtle}`,
        borderRadius: t.radius.base,
        background: colors.bg.subtle,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.space[2] }}>
        <span style={{ fontFamily: t.font.family.sans, fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.fg.subtle, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
        {copyValue && (
          <IconButton
            icon={copied ? <Check size={t.icon.xs} /> : <Copy size={t.icon.xs} />}
            aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
            size="xs"
            variant="ghost"
            onClick={copy}
          />
        )}
      </div>
      <div style={{ marginTop: t.space[1], fontFamily: t.font.family.sans, fontSize: t.font.size.base, color: colors.fg.default, overflowWrap: 'anywhere' }}>
        {visibleValue || '—'}
      </div>
    </div>
  )
}

interface DetailGridProps {
  items: DetailItem[]
  columns?: 1 | 2 | 3
}

export function DetailGrid({ items, columns = 2 }: DetailGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: t.space[3],
      }}
    >
      {items.map((item) => <ReadOnlyField key={item.label} {...item} />)}
    </div>
  )
}
