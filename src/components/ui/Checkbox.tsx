import { useId, useRef, useEffect } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface CheckboxProps {
  /** Rótulo visível. Quando ausente, informe `aria-label` para acessibilidade. */
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  /** Estado parcial (ex.: "selecionar todos" com seleção mista). */
  indeterminate?: boolean
  disabled?: boolean
  'aria-label'?: string
}

export function Checkbox({
  label,
  checked,
  onChange,
  indeterminate = false,
  disabled,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const { colors } = useTheme()

  // `indeterminate` só existe no DOM, não como atributo JSX
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate && !checked
  }, [indeterminate, checked])

  const filled = checked || indeterminate

  return (
    <label
      htmlFor={id}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: label ? t.space[2] : 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{ position: 'relative', width: t.size.checkbox, height: t.size.checkbox, flexShrink: 0 }}>
        {/* Input nativo visualmente oculto mas totalmente acessível */}
        <input
          id={id}
          ref={inputRef}
          type="checkbox"
          className="gb-focus-input"
          checked={checked}
          disabled={disabled}
          aria-label={!label ? ariaLabel : undefined}
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
          className="gb-focus-target"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            border: filled
              ? `1.5px solid ${t.color.brand[600]}`
              : `1.5px solid ${colors.border.default}`,
            borderRadius: t.radius.sm,
            background: filled ? t.color.brand[600] : colors.bg.input,
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
          {indeterminate && !checked && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2.5 5h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </span>

      {label && (
        <span
          style={{
            fontSize: t.font.size.base,
            fontFamily: t.font.family.sans,
            color: colors.fg.default,
            lineHeight: 1,
          }}
        >
          {label}
        </span>
      )}
    </label>
  )
}
