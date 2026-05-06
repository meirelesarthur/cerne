import { useState } from 'react'
import FazendasLista from './FazendasLista'
import FazendaCadastro from './FazendaCadastro'
import FazendaDetalhe from './FazendaDetalhe'

type View = 'list' | 'detail' | 'form'

export default function FazendasPage() {
  const [view, setView] = useState<View>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (view === 'detail') {
    return (
      <FazendaDetalhe
        onBack={() => setView('list')}
        onEdit={() => setView('form')}
      />
    )
  }

  if (view === 'form') {
    return <FazendaCadastro onBack={() => setView(selectedId ? 'detail' : 'list')} />
  }

  return (
    <FazendasLista
      onNew={() => { setSelectedId(null); setView('form') }}
      onView={(id) => { setSelectedId(id); setView('detail') }}
      onEdit={(id) => { setSelectedId(id); setView('form') }}
    />
  )
}
