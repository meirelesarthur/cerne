import { useEffect, useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import OverviewPanel from './pages/dashboards/OverviewPanel'
import Login from './pages/Login'
import { SplashScreen } from './components/SplashScreen'
import { ErrorPage } from './components/layout/ErrorPage'
import { ThemeProvider } from './context/ThemeContext'
import { PermissionProvider, SessionProvider, SessionExpiredModal } from './auth'
import { ToastProvider } from './components/ui/Toast'

// Sessão simulada (sem backend real ainda) persistida em localStorage para
// sobreviver a reloads durante o desenvolvimento — expiração bem longa
// (30 dias) só para não expirar em meio a uma sessão de testes.
const SESSION_STORAGE_KEY = 'gbcerne.session.expiresAt'
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000

function hasValidStoredSession(): boolean {
  const expiresAt = Number(localStorage.getItem(SESSION_STORAGE_KEY))
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

function storeSession(): void {
  localStorage.setItem(SESSION_STORAGE_KEY, String(Date.now() + SESSION_DURATION_MS))
}

function clearStoredSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

// ─── Rotas de erro ───────────────────────────────────────────────────────────
// Telas de erro são standalone: substituem o chassi inteiro (como o Login), por
// isso são resolvidas aqui, antes de sessão/AppLayout. A variação da ErrorPage
// vem da presença de `payload` — sem ele, a simples; com ele, a de retorno.
// Rota nova = uma entrada neste mapa.

const ERROR_ROUTES: Record<string, { status: string; payload?: string }> = {
  '/404': { status: '404' },
  '/505': {
    status: '505',
    // Corpo de exemplo enquanto não há backend real — em produção vem da
    // resposta HTTP que originou o erro.
    payload: `{
  "timestamp": "2026-07-31T14:30:00Z",
  "status": 505,
  "error": "HTTP Version Not Supported",
  "message": "O servidor não suporta a versão do protocolo usada na requisição.",
  "path": "/api/v1/safras"
}`,
  },
}

/** Mantém a rota de erro atual sincronizada com voltar/avançar do navegador. */
function useErrorRoute() {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  const goHome = () => {
    window.history.pushState({}, '', '/')
    setPathname('/')
  }

  return { route: ERROR_ROUTES[pathname], goHome }
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(hasValidStoredSession)
  const [splashing, setSplashing] = useState(false)
  const { route: errorRoute, goHome } = useErrorRoute()

  const handleLogout = () => {
    clearStoredSession()
    setLoggedIn(false)
  }

  return (
    <ThemeProvider>
      {errorRoute ? (
        <ErrorPage
          status={errorRoute.status}
          payload={errorRoute.payload}
          onHome={goHome}
          onRetry={() => window.location.reload()}
          // Aba aberta direto na URL de erro não tem para onde voltar — sem
          // histórico o botão sairia sem efeito, então nem aparece.
          onBack={window.history.length > 1 ? () => window.history.back() : undefined}
        />
      ) : splashing ? (
        <SplashScreen onDone={() => { storeSession(); setSplashing(false); setLoggedIn(true) }} />
      ) : !loggedIn ? (
        <Login onLogin={() => setSplashing(true)} />
      ) : (
        // Área autenticada: papel padrão 'admin' (substituir pelo papel real do
        // usuário quando houver auth). SessionProvider expõe expire()/triggerSessionExpire
        // para a futura camada HTTP chamar em respostas 401.
        <ToastProvider>
          <PermissionProvider>
            <SessionProvider onRelogin={handleLogout}>
              <AppLayout onLogout={handleLogout}>
                <OverviewPanel />
              </AppLayout>
              <SessionExpiredModal />
            </SessionProvider>
          </PermissionProvider>
        </ToastProvider>
      )}
    </ThemeProvider>
  )
}
