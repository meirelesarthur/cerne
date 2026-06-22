import { useId } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  label?: string
  name: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  hint?: string
  /** Layout das opções. Padrão: 'vertical'. */
  orientation?: 'vertical' | 'horizontal'
  /** Desabilita todas as opções do grupo. */
  disabled?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
  error,
  hint,
  orientation = 'vertical',
  disabled = false,
}: RadioGroupProps) {
  const labelId = useId()
  const errorId = useId()
  const { colors } = useTheme()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
      {/* ── Label do grupo ─────────────────────────────────────────────────── */}
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginBottom: 2 }}>
          <span
            id={labelId}
            style={{
              fontSize: t.font.size.sm,
              fontWeight: t.font.weight.medium,
              color: colors.fg.default,
              fontFamily: t.font.family.sans,
              transition: `color ${t.transition.smooth}`,
            }}
          >
            {label}
          </span>
          {required && (
            <span
              aria-hidden="true"
              style={{ color: t.color.feedback.error.text, fontSize: t.font.size.sm, lineHeight: 1 }}
            >
              *
            </span>
          )}
          {hint && (
            <span
              style={{
                fontSize: t.font.size.xs,
                color: colors.fg.subtle,
                fontFamily: t.font.family.sans,
              }}
            >
              {hint}
            </span>
          )}
        </div>
      )}

      {/* ── Grupo de opções ────────────────────────────────────────────────── */}
      <div
        role="radiogroup"
        aria-labelledby={label ? labelId : undefined}
        aria-label={!label ? name : undefined}
        aria-required={required || undefined}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? errorId : undefined}
        style={{
          display: 'flex',
          flexDirection: orientation === 'horizontal' ? 'row' : 'column',
          flexWrap: orientation === 'horizontal' ? 'wrap' : undefined,
          gap: orientation === 'horizontal' ? `${t.space[1]}px ${t.space[4]}px` : t.space[2],
        }}
      >
        {options.map((opt) => (
          <RadioOption
            key={opt.value}
            opt={opt}
            name={name}
            groupValue={value}
            onChange={onChange}
            groupDisabled={disabled}
            hasError={!!error}
            colors={colors}
          />
        ))}
      </div>

      {/* ── Mensagem de erro ───────────────────────────────────────────────── */}
      {error && (
        <span
          id={errorId}
          role="alert"
          aria-live="polite"
          style={{
            fontSize: t.font.size.xs,
            color: t.color.feedback.error.text,
            fontFamily: t.font.family.sans,
          }}
        >
          {error}
        </span>
      )}
    </div>
  )
}

// ─── RadioOption (internal) ───────────────────────────────────────────────────

interface RadioOptionProps {
  opt: RadioOption
  name: string
  groupValue: string
  onChange: (value: string) => void
  groupDisabled: boolean
  hasError: boolean
  colors: ReturnType<typeof useTheme>['colors']
}

function RadioOption({
  opt,
  name,
  groupValue,
  onChange,
  groupDisabled,
  hasError,
  colors,
}: RadioOptionProps) {
  const inputId = useId()
  const isDisabled = groupDisabled || opt.disabled
  const isSelected = groupValue === opt.value

  // Cor do anel/borda do círculo visual
  const ringColor = hasError
    ? t.color.feedback.error.text
    : isSelected
    ? t.color.brand[600]
    : colors.border.default

  return (
    <label
      htmlFor={inputId}
      style={{
        display: 'inline-flex',
        alignItems: 'flex-start',
        gap: t.space[2],
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      {/* ── Círculo visual + input nativo ────────────────────────────────── */}
      <span
        style={{
          position: 'relative',
          width: 18,
          height: 18,
          flexShrink: 0,
          // Alinha verticalmente com a primeira linha do label (line-height ≈ 1)
          marginTop: 1,
        }}
      >
        {/* Input nativo — visualmente oculto, totalmente acessível */}
        <input
          id={inputId}
          type="radio"
          name={name}
          value={opt.value}
          checked={isSelected}
          disabled={isDisabled}
          className="gb-focus-input"
          onChange={() => onChange(opt.value)}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            width: '100%',
            height: '100%',
            margin: 0,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            zIndex: 1,
          }}
        />

        {/* Círculo visual — aria-hidden porque o nativo já é semântico */}
        <span
          className="gb-focus-target"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            border: `1.5px solid ${ringColor}`,
            borderRadius: t.radius.full,
            background: colors.bg.input,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: [
              `border-color ${t.animation.duration.fast} ${t.animation.easing.standard}`,
              `background ${t.animation.duration.fast} ${t.animation.easing.standard}`,
            ].join(', '),
          }}
        >
          {/* Dot interno — visível apenas quando selecionado */}
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: t.radius.full,
              background: isSelected ? t.color.brand[600] : 'transparent',
              transition: [
                `background ${t.animation.duration.fast} ${t.animation.easing.standard}`,
                `transform ${t.animation.duration.fast} ${t.animation.easing.spring}`,
              ].join(', '),
              transform: isSelected ? 'scale(1)' : 'scale(0)',
            }}
          />
        </span>
      </span>

      {/* ── Texto: label + description ────────────────────────────────────── */}
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: t.space[0],
        }}
      >
        <span
          style={{
            fontSize: t.font.size.base,
            fontFamily: t.font.family.sans,
            fontWeight: t.font.weight.normal,
            color: colors.fg.default,
            lineHeight: t.font.lineHeight.tight,
            transition: `color ${t.transition.smooth}`,
          }}
        >
          {opt.label}
        </span>

        {opt.description && (
          <span
            style={{
              fontSize: t.font.size.xs,
              fontFamily: t.font.family.sans,
              color: colors.fg.subtle,
              lineHeight: t.font.lineHeight.normal,
            }}
          >
            {opt.description}
          </span>
        )}
      </span>
    </label>
  )
}
