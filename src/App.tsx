import { useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

export default function App() {
  const [authenticated, setAuthenticated] = useState(false)

  if (!authenticated) {
    return <Login onLogin={() => setAuthenticated(true)} />
  }

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  )
}
