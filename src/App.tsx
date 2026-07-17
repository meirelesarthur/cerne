import { useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import OverviewPanel from './pages/dashboards/OverviewPanel'
import Login from './pages/Login'
import { SplashScreen } from './components/SplashScreen'
import { ThemeProvider } from './context/ThemeContext'
import { PermissionProvider, SessionProvider, SessionExpiredModal } from './auth'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [splashing, setSplashing] = useState(false)

  return (
    <ThemeProvider>
      {splashing ? (
        <SplashScreen onDone={() => { setSplashing(false); setLoggedIn(true) }} />
      ) : !loggedIn ? (
        <Login onLogin={() => setSplashing(true)} />
      ) : (
        // Área autenticada: papel padrão 'admin' (substituir pelo papel real do
        // usuário quando houver auth). SessionProvider expõe expire()/triggerSessionExpire
        // para a futura camada HTTP chamar em respostas 401.
        <PermissionProvider>
          <SessionProvider onRelogin={() => setLoggedIn(false)}>
            <AppLayout onLogout={() => setLoggedIn(false)}>
              <OverviewPanel />
            </AppLayout>
            <SessionExpiredModal />
          </SessionProvider>
        </PermissionProvider>
      )}
    </ThemeProvider>
  )
}
