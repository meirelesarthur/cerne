import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Prende o foco do teclado dentro de um container enquanto `active` for true.
 * - Foca o primeiro elemento focável (ou o próprio container) ao abrir.
 * - Tab / Shift+Tab ciclam apenas entre os elementos internos.
 * - Restaura o foco ao elemento anterior quando fecha.
 *
 * Uso: `const ref = useFocusTrap<HTMLDivElement>(open)` e aplique `ref` no container.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )

    // Foca o primeiro elemento focável; senão, o próprio container.
    const first = focusables()[0]
    ;(first ?? node).focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      const activeEl = document.activeElement as HTMLElement

      if (e.shiftKey) {
        if (activeEl === firstEl || !node.contains(activeEl)) {
          e.preventDefault()
          lastEl.focus()
        }
      } else {
        if (activeEl === lastEl || !node.contains(activeEl)) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }

    node.addEventListener('keydown', handleKeyDown)
    return () => {
      node.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [active])

  return ref
}
