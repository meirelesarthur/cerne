import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { Check, Copy, HelpCircle } from 'lucide-react'
import { Tooltip } from './Tooltip'
import { IconButton } from './IconButton'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { applyMask, maskInputMode, type MaskType } from './masks'
import type { BaseFieldProps } from './fieldTypes'

interface FormFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'rows' | 'size'>, BaseFieldProps {
  /** Altura do controle: 'md' = t.size.control (40, padrão) · 'lg' = t.size.controlLg (44) */
  size?: 'md' | 'lg'
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
  /**
   * 'view' troca o controle editável pela variação "Visualização" (Figma
   * node 54220-2): rótulo + valor empilhados sobre fundo cinza, com ação de
   * copiar revelada no hover/foco. Usar em todo campo somente-leitura de
   * telas de detalhe — nunca estilizar um input/textarea `readOnly` à mão.
   */
  variant?: 'default' | 'view'
  /**
   * Só em `variant="view"` + `multiline`: altura máxima (px) do valor antes de
   * rolar internamente — o rótulo e o botão de copiar ficam fixos. Use para
   * corpos longos (JSON de retorno, stacktrace). Default: cresce sem limite.
   */
  viewMaxHeight?: number
}

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(function FormField({
  label,
  required,
  error,
  hint,
  iconLeft,
  iconRight,
  status,
  size = 'md',
  multiline = false,
  rows = 4,
  mask,
  allowPasswordManager = false,
  variant = 'default',
  viewMaxHeight,
  style,
  ...inputProps
}, ref) {
  const { colors, isGbMode } = useTheme()

  if (variant === 'view') {
    const rawValue = inputProps.value ?? inputProps.defaultValue
    const value = rawValue == null ? '' : String(rawValue)
    return <ViewField label={label} value={value} multiline={multiline} size={size} maxHeight={viewMaxHeight} />
  }

  const controlHeight = size === 'lg' ? t.size.controlLg : t.size.control

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

  const isDisabled = !!inputProps.disabled
  const isReadOnly = !!inputProps.readOnly && !isDisabled
  const isError = !!error || status === 'err'
  const isOk = !isError && status === 'ok'
  const borderColor = isError
    ? t.color.feedback.error.text
    : isOk
    ? t.color.feedback.success.text
    : isDisabled
    ? t.color.state.disabled.border
    : isReadOnly
    ? t.color.state.readonly.border
    : colors.border.default
  const stateText = isGbMode ? colors.fg.subtle : isDisabled
    ? t.color.state.disabled.text
    : t.color.state.readonly.text
  const stateBackground = isGbMode ? colors.bg.subtle : isDisabled
    ? t.color.state.disabled.bg
    : t.color.state.readonly.bg

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
      {(label || required || hint) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginBottom: 2 }}>
          {label && (
            <span
              style={{
                fontSize: t.font.size.sm,
                fontWeight: t.font.weight.medium,
                color: colors.fg.default,
                fontFamily: t.font.family.sans,
                transition: 'color 0.2s',
              }}
            >
              {label}
            </span>
          )}
          {required && (
            <span style={{ color: t.color.feedback.error.text, fontSize: t.font.size.sm, lineHeight: t.font.lineHeight.tight }}>*</span>
          )}
          {hint && (
            <Tooltip label={hint}>
              <span style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
                <HelpCircle size={t.icon.xs} color={t.color.neutral[400]} />
              </span>
            </Tooltip>
          )}
        </div>
      )}

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
            borderRadius: t.radius.base,
            fontSize: t.font.size.md,
            fontFamily: t.font.family.sans,
            color: isDisabled
              ? stateText
              : isReadOnly
              ? stateText
              : colors.fg.default,
            background: isError
              ? t.color.feedback.error.bg
              : isDisabled
              ? stateBackground
              : isReadOnly
              ? stateBackground
              : colors.bg.input,
            cursor: isDisabled ? 'not-allowed' : undefined,
            outline: 'none',
            boxSizing: 'border-box',
            transition: `border-color ${t.transition.base}, background ${t.transition.smooth}`,
          }
          const focusHandlers = {
            onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              e.currentTarget.style.borderColor = isError ? t.color.feedback.error.text : colors.accent.default
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
                  minHeight: controlHeight,
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
                height: controlHeight,
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
            color: t.color.feedback.error.text,
            fontFamily: t.font.family.sans,
          }}
        >
          {error}
        </span>
      )}
    </div>
  )
})

export interface ViewFieldProps {
  label?: string
  /** Conteúdo exibido — string/number para o caso comum, ou um ReactNode (ex.: `<Badge>`) para status/booleanos. */
  value: React.ReactNode
  /**
   * Texto copiado pelo botão de copiar. Default: o próprio `value` quando é
   * string/number. Obrigatório quando `value` é um ReactNode (ex.: `<Badge>`)
   * — sem ele, nenhum botão de copiar é exibido para esse campo.
   */
  copyValue?: string
  /** Mascara o valor exibido (••••••••) sem afetar o que é copiado — dados sensíveis (ex.: chave de API). */
  sensitive?: boolean
  multiline?: boolean
  size?: 'md' | 'lg'
  /**
   * Só com `multiline`: altura máxima (px) do valor antes de rolar internamente.
   * Rótulo e botão de copiar permanecem fixos — só o conteúdo rola.
   */
  maxHeight?: number
}

// Variação "Visualização" do FormField (Figma node 54220-2): substitui o
// <input>/<textarea> editável por um bloco somente-leitura — nunca deve
// parecer editável (sem caret, sem foco de texto). O botão de copiar usa
// apenas `opacity` (não `visibility`) para revelar no hover: `visibility:
// hidden` remove o botão da ordem de tabulação do teclado, quebrando o
// requisito de foco por teclado — ver `.gb-view-field-copy` em index.css.
export function ViewField({ label, value, copyValue, sensitive = false, multiline = false, size = 'md', maxHeight }: ViewFieldProps) {
  const { colors } = useTheme()
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)
  const hasValue = value !== undefined && value !== null && value !== ''
  const resolvedCopyValue = copyValue ?? (typeof value === 'string' || typeof value === 'number' ? String(value) : undefined)
  const displayValue = sensitive && hasValue ? '••••••••••••' : value

  // O valor entra no rótulo do botão só quando é curto e de uma linha ("Copiar
  // cpf 123.456.789-00"). Corpos longos (JSON de retorno, stacktrace) seriam
  // lidos por inteiro pelo leitor de tela — nesses casos, só o rótulo do campo.
  const isTerseValue =
    !!resolvedCopyValue && resolvedCopyValue.length <= 40 && !resolvedCopyValue.includes('\n')
  const copyButtonLabel = label
    ? `Copiar ${label.toLowerCase()}${isTerseValue ? ` ${resolvedCopyValue}` : ''}`
    : isTerseValue
    ? `Copiar ${resolvedCopyValue}`
    : 'Copiar valor'

  // Folga à direita que o texto precisa deixar livre para não passar sob o botão
  // de copiar: padding do bloco + largura do IconButton `xs` + respiro.
  const copyClearance = t.space[4] + t.size.iconBtn.sm + t.space[1]

  // Com `maxHeight`, quem rola é o próprio valor — e ele vai até a borda do
  // conteúdo, para a barra nascer na extremidade direita do bloco, DEPOIS do
  // ícone de copiar (que fica antes dela, no topo direito). Por isso a folga do
  // ícone sai do contêiner e passa para cada filho: se ficasse no contêiner, a
  // barra apareceria à esquerda do ícone.
  const scrolls = multiline && !!maxHeight

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  const announce = (ok: boolean) => {
    setCopied(ok)
    setCopyFailed(!ok)
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => { setCopied(false); setCopyFailed(false) }, 1500)
  }

  const copy = async () => {
    if (!resolvedCopyValue) return
    try {
      await navigator.clipboard.writeText(resolvedCopyValue)
      announce(true)
    } catch {
      // Permissão de clipboard negada (política do navegador/iframe) — sem
      // isso o clique falha em silêncio e o usuário nunca sabe que não copiou.
      announce(false)
    }
  }

  return (
    <div
      className="gb-view-field"
      style={{
        position: 'relative',
        width: '100%',
        // Altura travada em 56px (nunca cresce): rótulo (12px lh) + gap (4px) +
        // valor (16px lh) = 32px, exatamente o espaço livre após os 12px de
        // padding vertical (topo+base). Rótulo é truncado com ellipsis abaixo
        // para nunca quebrar em 2 linhas e estourar essa conta.
        height: multiline ? undefined : t.space[14],
        minHeight: multiline ? (size === 'lg' ? t.size.controlLg : t.size.control) : undefined,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: multiline ? 'flex-start' : 'center',
        background: colors.bg.subtle,
        border: `1px solid ${colors.border.subtle}`,
        borderRadius: t.radius.base,
        padding: `${t.space[3]}px ${t.space[4]}px`,
        cursor: 'default',
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: t.space[1],
          paddingRight: resolvedCopyValue && !scrolls ? copyClearance : 0,
        }}
      >
        {label && (
          <span
            title={label}
            style={{
              fontFamily: t.font.family.sans,
              fontSize: t.font.size.xs,
              fontWeight: t.font.weight.semibold,
              lineHeight: '12px',
              letterSpacing: '0.04em',
              color: colors.fg.subtle,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              paddingRight: resolvedCopyValue && scrolls ? copyClearance : 0,
            }}
          >
            {label}
          </span>
        )}
        <span
          style={{
            fontFamily: t.font.family.sans,
            fontSize: t.font.size.base,
            fontWeight: t.font.weight.normal,
            // Uma linha: 16px travados — é essa conta que fecha a altura fixa de
            // 56px do bloco. Multilinha: entrelinha de parágrafo, porque 16px em
            // fonte de 14px comprime o texto E deixa a tinta da última linha
            // vazar ~1px além da caixa, fazendo nascer barra de rolagem em
            // conteúdo que cabe inteiro.
            lineHeight: multiline ? t.font.lineHeight.normal : '16px',
            color: colors.fg.default,
            cursor: 'default',
            ...(multiline
              ? {
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  ...(scrolls
                    ? {
                        display: 'block',
                        maxHeight,
                        overflowY: 'auto',
                        overscrollBehavior: 'contain',
                        paddingRight: resolvedCopyValue ? copyClearance : 0,
                      }
                    : null),
                }
              : { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }),
          }}
        >
          {hasValue ? displayValue : '—'}
        </span>
      </div>

      {resolvedCopyValue && (
        <span
          className="gb-view-field-copy"
          style={{
            position: 'absolute',
            // Quando o valor rola, o ícone recua a largura da barra para ficar
            // imediatamente antes dela — nunca por cima.
            right: scrolls ? t.space[4] + t.size.scrollbar : t.space[4],
            top: multiline ? t.space[3] : '50%',
            transform: multiline ? undefined : 'translateY(-50%)',
          }}
        >
          <IconButton
            size="xs"
            variant="ghost"
            icon={copied ? <Check size={t.icon.sm} /> : <Copy size={t.icon.sm} />}
            aria-label={copyButtonLabel}
            onClick={copy}
          />
        </span>
      )}

      <span aria-live="polite" className="sr-only">
        {copied ? 'Valor copiado' : copyFailed ? 'Não foi possível copiar o valor' : ''}
      </span>
    </div>
  )
}
