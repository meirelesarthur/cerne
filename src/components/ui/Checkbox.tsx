import { useId } from 'react'
import { t } from '../../design/tokens'

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Checkbox({ label, checked, onChange, disabled }: CheckboxProps) {
  const id = useId()

  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: t.space[2],
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{ position: 'relative', width: 18, height: 18, flexShrink: 0 }}>
        {/* Input nativo visualmente oculto mas totalmente acessível */}
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={e => onChange(e.target.checked)}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            width: '100%',
            height: '100%',
            margin: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
            zIndex: 1,
          }}
        />
        {/* Visual custom — aria-hidden pois o nativo já é semântico */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            border: checked
              ? `1.5px solid ${t.color.brand[600]}`
              : `1.5px solid ${t.color.neutral[300]}`,
            borderRadius: t.radius.sm,
            background: checked ? t.color.brand[600] : t.color.neutral[0],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `background ${t.animation.duration.fast} ${t.animation.easing.standard},
                         border-color ${t.animation.duration.fast} ${t.animation.easing.standard}`,
          }}
        >
          {checked && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M2 5l2.5 2.5L8 3"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>

      <span
        style={{
          fontSize: t.font.size.base,
          fontFamily: t.font.family.sans,
          color: t.color.neutral[600],
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </label>
  )
}
