import { FormField } from './FormField'

export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function parseCurrency(value: string): number {
  const digits = value.replace(/\D/g, '')
  return digits ? Number(digits) / 100 : 0
}

interface CurrencyFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  required?: boolean
  error?: string
  hint?: string
  disabled?: boolean
  readOnly?: boolean
  name?: string
}

export function CurrencyField({ label, value, onChange, required, error, hint, disabled, readOnly, name }: CurrencyFieldProps) {
  return (
    <FormField
      label={label}
      value={formatCurrency(value)}
      onChange={(event) => onChange(parseCurrency(event.target.value))}
      mask="currency"
      inputMode="numeric"
      required={required}
      error={error}
      hint={hint}
      disabled={disabled}
      readOnly={readOnly}
      name={name}
      spellCheck={false}
    />
  )
}

interface PercentFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  error?: string
}

export function PercentField({ label, value, onChange, disabled, error }: PercentFieldProps) {
  return (
    <FormField
      label={label}
      value={Number.isFinite(value) ? value.toFixed(2).replace('.', ',') : '0,00'}
      onChange={(event) => {
        const normalized = event.target.value.replace(/[^\d,.-]/g, '').replace(',', '.')
        onChange(Math.max(0, Math.min(100, Number(normalized) || 0)))
      }}
      inputMode="decimal"
      iconRight={<span aria-hidden="true">%</span>}
      disabled={disabled}
      error={error}
    />
  )
}
