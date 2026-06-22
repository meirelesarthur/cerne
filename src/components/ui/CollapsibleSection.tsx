import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface CollapsibleSectionProps {
  title:        string
  fieldCount?:  number
  defaultOpen?: boolean
  children:     React.ReactNode
}

export function CollapsibleSection({
  title, fieldCount, defaultOpen = false, children,
}: CollapsibleSectionProps) {
  const { colors } = useTheme()
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{
      border: `1px solid ${colors.border.default}`,
      borderRadius: t.radius.lg,
      overflow: 'hidden',
      marginBottom: t.space[3],
    }}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: `${t.space[3]}px ${t.space[4]}px`,
          background: open ? colors.bg.subtle : colors.bg.surface,
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.15s',
          borderBottom: open ? `1px solid ${colors.border.default}` : 'none',
        }}
        onMouseEnter={e => {
          if (!open) (e.currentTarget as HTMLButtonElement).style.background = colors.bg.subtle
        }}
        onMouseLeave={e => {
          if (!open) (e.currentTarget as HTMLButtonElement).style.background = colors.bg.surface
        }}
      >
        <ChevronRight
          size={13}
          color={colors.fg.subtle}
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.15s ease',
          }}
        />
        <span style={{
          flex: 1,
          textAlign: 'left',
          fontSize: t.font.size.xs,
          fontWeight: t.font.weight.bold,
          color: colors.fg.default,
          fontFamily: t.font.family.sans,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {title}
        </span>
        {!open && fieldCount !== undefined && (
          <span style={{
            fontSize: t.font.size.xs,
            color: colors.fg.subtle,
            fontFamily: t.font.family.sans,
            fontWeight: t.font.weight.normal,
          }}>
            {fieldCount} {fieldCount === 1 ? 'campo' : 'campos'}
          </span>
        )}
      </button>

      {/* Body */}
      {open && (
        <div style={{ padding: `${t.space[5]}px ${t.space[5]}px` }}>
          {children}
        </div>
      )}
    </div>
  )
}
