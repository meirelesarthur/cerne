import React, { createContext, useContext, useState, useCallback } from 'react'

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface SessionState {
  /** `true` quando a sessão expirou e o modal deve ser exibido. */
  expired: boolean
  /** Motivo da expiração (ex.: 'inatividade', '401 /api/safras'). Apenas informativo. */
  reason: string | undefined
}

interface SessionContextValue extends SessionState {
  /**
   * Marca a sessão como expirada.
   * Chamado pela camada HTTP ao receber 401, ou por um timer de inatividade.
   */
  expire(reason?: string): void
  /**
   * Limpa o estado de expiração.
   * Chamado pelo botão "Entrar novamente" — reabre o formulário de login.
   */
  clear(): void
}

// ─── Singleton para uso fora de componentes React ────────────────────────────
//
// Camadas que não vivem na árvore React (interceptores fetch/axios, websockets,
// workers) precisam disparar `expire()` sem acesso ao hook.
// Solução: um registrador de módulo que armazena a referência à função e a
// expõe via `setSessionExpireHandler` / `triggerSessionExpire`.
//
// Exemplo de uso em um interceptor fetch:
//
//   import { triggerSessionExpire } from '@/auth'
//
//   async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
//     const res = await fetch(input, init)
//     if (res.status === 401) {
//       triggerSessionExpire(`401 ${typeof input === 'string' ? input : input.url}`)
//     }
//     return res
//   }

let _expireHandler: ((reason?: string) => void) | null = null

/**
 * Registra o handler de expiração exposto pelo `SessionProvider`.
 * Chamado internamente pelo provider — não chamar manualmente.
 */
export function setSessionExpireHandler(fn: (reason?: string) => void): void {
  _expireHandler = fn
}

/**
 * Dispara a expiração de sessão de fora da árvore React.
 * Seguro chamar mesmo antes do provider montar (não-op nesse caso).
 */
export function triggerSessionExpire(reason?: string): void {
  _expireHandler?.(reason)
}

// ─── Contexto ────────────────────────────────────────────────────────────────

const SessionContext = createContext<SessionContextValue>({
  expired: false,
  reason:  undefined,
  expire:  () => {},
  clear:   () => {},
})

// ─── Provider ────────────────────────────────────────────────────────────────

interface SessionProviderProps {
  children: React.ReactNode
  /**
   * Callback chamado após `clear()`.
   * Use para redirecionar ao login, limpar o estado global, etc.
   */
  onRelogin?: () => void
}

export function SessionProvider({ children, onRelogin }: SessionProviderProps) {
  const [state, setState] = useState<SessionState>({ expired: false, reason: undefined })

  const expire = useCallback((reason?: string) => {
    setState({ expired: true, reason })
  }, [])

  const clear = useCallback(() => {
    setState({ expired: false, reason: undefined })
    onRelogin?.()
  }, [onRelogin])

  // Registra o handler para uso fora da árvore React (interceptores HTTP, etc.)
  React.useEffect(() => {
    setSessionExpireHandler(expire)
    return () => { setSessionExpireHandler(() => {}) }
  }, [expire])

  return (
    <SessionContext.Provider value={{ ...state, expire, clear }}>
      {children}
    </SessionContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Hook de acesso ao contexto de sessão.
 *
 * @example
 * const { expired, expire, clear } = useSession()
 */
export function useSession(): SessionContextValue {
  return useContext(SessionContext)
}
