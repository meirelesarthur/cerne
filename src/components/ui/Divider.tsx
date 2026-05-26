import { t } from '../../design/tokens'

interface DividerProps {
  label?: string
}

export function Divider({ label }: DividerProps) {
  return (
    <div
      role="separator"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: t.space[3],
      }}
    >
      <div
        aria-hidden="true"
        style={{ flex: 1, height: 1, background: t.color.neutral[200] }}
      />
      {label && (
        <span
          style={{
            fontSize: t.font.size.xs,
            fontFamily: t.font.family.sans,
            color: t.color.neutral[400],
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {label}
        </span>
      )}
      <div
        aria-hidden="true"
        style={{ flex: 1, height: 1, background: t.color.neutral[200] }}
      />
    </div>
  )
}
