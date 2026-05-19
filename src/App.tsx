import { useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage'
import { SplashScreen } from './components/SplashScreen'
import { ThemeProvider } from './context/ThemeContext'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [splashing, setSplashing] = useState(false)

  return (
    <ThemeProvider>
      {splashing ? (
        <SplashScreen onDone={() => { setSplashing(false); setLoggedIn(true) }} />
      ) : !loggedIn ? (
        <LoginPage onLogin={() => setSplashing(true)} />
      ) : (
        <AppLayout>
          <Dashboard />
        </AppLayout>
      )}
    </ThemeProvider>
  )
}
