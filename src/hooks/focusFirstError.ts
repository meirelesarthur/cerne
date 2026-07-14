/**
 * Rola e foca o primeiro campo marcado como inválido (`aria-invalid="true"`)
 * após uma validação de formulário. Chamar logo após `setErrors(...)`.
 */
export function focusFirstError(): void {
  requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>('[aria-invalid="true"]')
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el?.focus()
  })
}
