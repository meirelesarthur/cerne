import { useState } from 'react'
import FazendasLista from './FazendasLista'
import FazendaCadastro from './FazendaCadastro'
import FazendaDetalhe from './FazendaDetalhe'
import { getFazendaDetalhe } from './fazendas.mock'

type View = 'list' | 'detail' | 'form'

export default function FazendasPage() {
  const [view, setView] = useState<View>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Fazenda selecionada — resolvida a cada render a partir do id (mock; trocar por fetch)
  const selected = selectedId ? getFazendaDetalhe(selectedId) : undefined

  if (view === 'detail' && selected) {
    return (
      <FazendaDetalhe
        fazenda={selected}
        onBack={() => setView('list')}
        onEdit={() => setView('form')}
      />
    )
  }

  if (view === 'form') {
    return (
      <FazendaCadastro
        fazenda={selected}
        onBack={() => setView(selected ? 'detail' : 'list')}
      />
    )
  }

  return (
    <FazendasLista
      onNew={() => { setSelectedId(null); setView('form') }}
      onView={(id) => { setSelectedId(id); setView('detail') }}
      onEdit={(id) => { setSelectedId(id); setView('form') }}
    />
  )
}
