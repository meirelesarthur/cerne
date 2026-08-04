import { useState } from 'react'
import UsuariosLista   from './UsuariosLista'
import UsuarioCadastro from './UsuarioCadastro'
import UsuarioDetalhe  from './UsuarioDetalhe'
import { INITIAL_USERS, type UserRecord } from './usuarios.types'

type View = 'list' | 'form' | 'view'

export default function UsuariosPage() {
  const [view,       setView]       = useState<View>('list')
  const [users,      setUsers]      = useState<UserRecord[]>(INITIAL_USERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = users.find(u => u.id === selectedId) ?? null

  const handleSave = (user: UserRecord) => {
    setUsers(prev => {
      const idx = prev.findIndex(u => u.id === user.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = user
        return next
      }
      return [{ ...user, id: crypto.randomUUID() }, ...prev]
    })
    setView('list')
  }

  if (view === 'form') {
    return (
      <UsuarioCadastro
        initialData={selected ?? undefined}
        onBack={() => setView('list')}
        onSave={handleSave}
      />
    )
  }

  if (view === 'view' && selected) {
    return (
      <UsuarioDetalhe
        user={selected}
        onBack={() => setView('list')}
        onEdit={() => setView('form')}
      />
    )
  }

  return (
    <UsuariosLista
      users={users}
      onNew={() => { setSelectedId(null); setView('form') }}
      onView={(id) => { setSelectedId(id); setView('view') }}
      onEdit={(id) => { setSelectedId(id); setView('form') }}
    />
  )
}
