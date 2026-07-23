import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { FormField } from './FormField'
import { IconButton } from './IconButton'

interface SecretFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  hint?: string
  name?: string
  placeholder?: string
  readOnly?: boolean
  autoComplete?: string
}

/** Campo para senha/token com revelação intencional e sem exposição padrão. */
export function SecretField({
  label,
  value,
  onChange,
  required,
  error,
  hint,
  name,
  placeholder,
  readOnly,
  autoComplete = 'off',
}: SecretFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      hint={hint}
      name={name}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      autoComplete={autoComplete}
      allowPasswordManager={autoComplete !== 'off'}
      spellCheck={false}
      iconRight={(
        <IconButton
          icon={visible ? <EyeOff size={16} /> : <Eye size={16} />}
          aria-label={visible ? `Ocultar ${label}` : `Mostrar ${label}`}
          size="xs"
          variant="ghost"
          onClick={() => setVisible((current) => !current)}
        />
      )}
    />
  )
}
