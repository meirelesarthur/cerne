import { useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage'
import { ThemeProvider } from './context/ThemeContext'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  return (
    <ThemeProvider>
      {!loggedIn ? (
        <LoginPage onLogin={() => setLoggedIn(true)} />
      ) : (
        <AppLayout>
          <Dashboard />
        </AppLayout>
      )}
    </ThemeProvider>
  )
}
