import { useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import OverviewPanel from './pages/dashboards/OverviewPanel'
import Login from './pages/Login'
import { SplashScreen } from './components/SplashScreen'
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

export default function App() {
  const [loggedIn, setLoggedIn] = useState(hasValidStoredSession)
  const [splashing, setSplashing] = useState(false)

  const handleLogout = () => {
    clearStoredSession()
    setLoggedIn(false)
  }

  return (
    <ThemeProvider>
      {splashing ? (
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
