/**
 * Máscaras de formatação para campos de texto (FormField mask=...).
 * Cada função recebe o valor cru digitado e devolve o valor formatado.
 * O `inputMode` recomendado acompanha cada máscara para o teclado mobile correto.
 */

export type MaskType = 'cpf' | 'cnpj' | 'cpfCnpj' | 'phone' | 'cep' | 'currency'

const onlyDigits = (v: string) => v.replace(/\D/g, '')

export const masks: Record<MaskType, (raw: string) => string> = {
  cpf: (raw) =>
    onlyDigits(raw)
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2'),

  cnpj: (raw) =>
    onlyDigits(raw)
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2'),

  cpfCnpj: (raw) => {
    const d = onlyDigits(raw)
    return d.length <= 11 ? masks.cpf(raw) : masks.cnpj(raw)
  },

  phone: (raw) => {
    const d = onlyDigits(raw).slice(0, 11)
    if (d.length <= 10) {
      return d
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d{1,4})$/, '$1-$2')
    }
    return d
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
  },

  cep: (raw) =>
    onlyDigits(raw)
      .slice(0, 8)
      .replace(/(\d{5})(\d{1,3})$/, '$1-$2'),

  currency: (raw) => {
    const d = onlyDigits(raw)
    if (!d) return ''
    const cents = (parseInt(d, 10) / 100).toFixed(2)
    const [int, dec] = cents.split('.')
    const intGrouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `R$ ${intGrouped},${dec}`
  },
}

type InputMode = 'numeric' | 'tel' | 'text' | 'decimal'

/** inputMode recomendado por máscara — para teclado mobile correto. */
export const maskInputMode: Record<MaskType, InputMode> = {
  cpf: 'numeric',
  cnpj: 'numeric',
  cpfCnpj: 'numeric',
  phone: 'tel',
  cep: 'numeric',
  currency: 'numeric',
}

/** Aplica uma máscara nomeada ou função custom. */
export function applyMask(value: string, mask: MaskType | ((raw: string) => string)): string {
  return typeof mask === 'function' ? mask(value) : masks[mask](value)
}
