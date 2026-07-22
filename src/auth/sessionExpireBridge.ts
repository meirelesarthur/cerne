// ─── Singleton para uso fora de componentes React ────────────────────────────
//
// Camadas que não vivem na árvore React (interceptores fetch/axios, websockets,
// workers) precisam disparar a expiração de sessão sem acesso ao hook useSession.
// Solução: um registrador de módulo que armazena a referência à função e a
// expõe via `setSessionExpireHandler` / `triggerSessionExpire`.
//
// Isolado em arquivo próprio (sem exportar nenhum componente/hook React aqui):
// misturar isso com o componente `SessionProvider` no mesmo arquivo quebra o
// Fast Refresh do Vite — toda edição em um arquivo que exporta componente +
// função solta força um remount da árvore em vez de um hot-update seguro.
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
