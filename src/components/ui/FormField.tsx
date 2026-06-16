import React, { forwardRef } from 'react'
import { HelpCircle } from 'lucide-react'
import { Tooltip } from './Tooltip'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { applyMask, maskInputMode, type MaskType } from './masks'

interface FormFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'rows'> {
  label: string
  required?: boolean
  error?: string
  hint?: string
  /** Ícone posicionado à esquerda do input */
  iconLeft?: React.ReactNode
  /** Ícone ou botão posicionado à direita do input */
  iconRight?: React.ReactNode
  /** Estado visual: 'ok' = borda verde, 'err' = borda vermelha */
  status?: 'idle' | 'ok' | 'err'
  /** Renderiza um <textarea> multi-linha em vez de <input> */
  multiline?: boolean
  /** Número de linhas visíveis quando multiline (default 4) */
  rows?: number
  /** Máscara de formatação (cpf, cnpj, phone, cep, currency) ou função custom */
  mask?: MaskType | ((raw: string) => string)
  /**
   * Permite que gerenciadores de senha (1Password, LastPass, Bitwarden,
   * Dashlane…) ofereçam preenchimento neste campo. Default `false`: campos de
   * dados não-credenciais são marcados para serem ignorados por esses
   * gerenciadores, evitando o ícone/popup de preenchimento sobre nome, CPF,
   * endereço, etc. Campos `type="password"` nunca são suprimidos (o gerenciador
   * funciona normalmente). Habilite em telas de login/credenciais.
   */
  allowPasswordManager?: boolean
}

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(function FormField({
  label,
  required,
  error,
  hint,
  iconLeft,
  iconRight,
  status,
  multiline = false,
  rows = 4,
  mask,
  allowPasswordManager = false,
  style,
  ...inputProps
}, ref) {
  const { colors } = useTheme()

  // Atributos que sinalizam aos gerenciadores de senha para ignorar o campo.
  // Aplicados a campos não-credenciais (todos exceto type="password") quando
  // `allowPasswordManager` é falso — evita o popup de preenchimento de senha
  // sobre nome, documento, endereço, etc.
  const suppressPM = !allowPasswordManager && inputProps.type !== 'password'
  const pmAttrs = suppressPM
    ? {
        'data-1p-ignore': 'true',
        'data-lpignore': 'true',
        'data-bwignore': 'true',
        'data-form-type': 'other',
      }
    : {}

  // Aplica a máscara no onChange e ajusta inputMode quando for máscara nomeada.
  const maskedOnChange: React.ChangeEventHandler<HTMLInputElement> | undefined = mask
    ? (e) => {
        e.currentTarget.value = applyMask(e.currentTarget.value, mask)
        inputProps.onChange?.(e)
      }
    : inputProps.onChange
  const maskInputModeValue =
    mask && typeof mask === 'string' ? maskInputMode[mask] : inputProps.inputMode

  const isError = !!error || status === 'err'
  const isOk = !isError && status === 'ok'
  const borderColor = isError
    ? t.color.error.text
    : isOk
    ? t.color.success.text
    : colors.border

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginBottom: 2 }}>
        <span
          style={{
            fontSize: t.font.size.sm,
            fontWeight: t.font.weight.medium,
            color: colors.textPrimary,
            fontFamily: t.font.family.sans,
            transition: 'color 0.2s',
          }}
        >
          {label}
        </span>
        {required && (
          <span style={{ color: t.color.error.text, fontSize: t.font.size.sm, lineHeight: 1 }}>*</span>
        )}
        {hint && (
          <Tooltip label={hint}>
            <span style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
              <HelpCircle size={12} color={t.color.neutral[400]} />
            </span>
          </Tooltip>
        )}
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: multiline ? 'flex-start' : 'center' }}>
        {iconLeft && !multiline && (
          <span
            style={{
              position: 'absolute',
              left: 14,
              display: 'flex',
              alignItems: 'center',
              color: t.color.neutral[400],
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {iconLeft}
          </span>
        )}

        {(() => {
          const sharedStyle: React.CSSProperties = {
            width: '100%',
            border: `1.5px solid ${borderColor}`,
            borderRadius: t.radius.DEFAULT,
            fontSize: t.font.size.base,
            fontFamily: t.font.family.sans,
            color: colors.textPrimary,
            background: isError ? t.color.error.bg : colors.inputBg,
            outline: 'none',
            boxSizing: 'border-box',
            transition: `border-color ${t.transition.DEFAULT}, background ${t.transition.smooth}`,
          }
          const focusHandlers = {
            onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              e.currentTarget.style.borderColor = isError ? t.color.error.text : colors.brand
              e.currentTarget.style.boxShadow = isError ? t.glow.error : t.glow.brand
              ;(inputProps.onFocus as React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>)?.(e)
            },
            onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              e.currentTarget.style.borderColor = borderColor
              e.currentTarget.style.boxShadow = 'none'
              ;(inputProps.onBlur as React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>)?.(e)
            },
          }
          const a11y = {
            'aria-invalid': isError || undefined,
            className: ['gb-focusable', inputProps.className].filter(Boolean).join(' '),
            ...pmAttrs,
          }

          if (multiline) {
            const { className: _c, ...rest } = inputProps
            return (
              <textarea
                ref={ref as React.Ref<HTMLTextAreaElement>}
                rows={rows}
                {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                {...a11y}
                style={{
                  ...sharedStyle,
                  padding: `${t.space[2]}px ${t.space[2] + t.space[1] / 2}px`,
                  resize: 'vertical',
                  minHeight: t.size.control,
                  lineHeight: t.font.lineHeight.normal,
                  ...style,
                }}
                onFocus={focusHandlers.onFocus}
                onBlur={focusHandlers.onBlur}
              />
            )
          }

          const { className: _c, ...rest } = inputProps
          return (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              {...rest}
              {...a11y}
              inputMode={maskInputModeValue}
              onChange={maskedOnChange}
              style={{
                ...sharedStyle,
                height: t.size.control,
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: iconLeft ? 44 : t.space[2] + t.space[1] / 2,
                paddingRight: iconRight ? 46 : t.space[2] + t.space[1] / 2,
                ...style,
              }}
              onFocus={focusHandlers.onFocus}
              onBlur={focusHandlers.onBlur}
            />
          )
        })()}

        {iconRight && !multiline && (
          <span
            style={{
              position: 'absolute',
              right: 12,
              display: 'flex',
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            {iconRight}
          </span>
        )}
      </div>

      {isError && error && (
        <span
          role="alert"
          aria-live="polite"
          style={{
            fontSize: t.font.size.xs,
            color: t.color.error.text,
            fontFamily: t.font.family.sans,
          }}
        >
          {error}
        </span>
      )}
    </div>
  )
})
