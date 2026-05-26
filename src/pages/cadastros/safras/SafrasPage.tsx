import { useState } from 'react'
import SafrasLista from './SafrasLista'
import SafraCadastro from './SafraCadastro'
import SafraDetalhe from './SafraDetalhe'
import { mockSafras } from './safras.mock'
import type { Safra } from './safras.types'

type View = 'list' | 'detail' | 'form'

export default function SafrasPage() {
  const [view, setView]           = useState<View>('list')
  const [safras, setSafras]       = useState<Safra[]>(mockSafras)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selected = safras.find(s => s.id === selectedId) ?? null

  const handleSave = (safra: Safra) => {
    setSafras(prev => {
      const exists = prev.find(s => s.id === safra.id)
      if (exists) return prev.map(s => s.id === safra.id ? safra : s)
      return [...prev, { ...safra, id: Date.now() }]
    })
    setView('list')
  }

  const handleDelete = (id: number) => {
    setSafras(prev => prev.filter(s => s.id !== id))
  }

  if (view === 'detail' && selected) {
    return (
      <SafraDetalhe
        safra={selected}
        onBack={() => setView('list')}
        onEdit={() => setView('form')}
      />
    )
  }

  if (view === 'form') {
    return (
      <SafraCadastro
        initialData={selected ?? undefined}
        onBack={() => setView(selectedId !== null ? 'detail' : 'list')}
        onSave={handleSave}
      />
    )
  }

  return (
    <SafrasLista
      safras={safras}
      onNew={() => { setSelectedId(null); setView('form') }}
      onView={id => { setSelectedId(id); setView('detail') }}
      onEdit={id => { setSelectedId(id); setView('form') }}
      onDelete={handleDelete}
    />
  )
}
