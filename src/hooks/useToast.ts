import { useState, useCallback } from 'react'
import { t } from '../design/tokens'

export type ToastType = 'success' | 'info' | 'error' | 'neutral'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

export const TOAST_BG: Record<ToastType, string> = {
  success: '#14532d',
  info:    '#1d4ed8',
  error:   t.color.error.solid,
  neutral: '#374151',
}

export const TOAST_DURATION = 3500

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(item => item.id !== id)), TOAST_DURATION)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(item => item.id !== id))
  }, [])

  return { toasts, show, dismiss }
}
