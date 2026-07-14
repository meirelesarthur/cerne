import { useState } from 'react'
import CentrosCustoLista   from './CentrosCustoLista'
import CentroCustoCadastro from './CentroCustoCadastro'
import { mockCentrosCusto } from './centrosCusto.mock'
import { getAllDescendantCentroIds, type CentroCusto } from './centrosCusto.types'

type View = 'list' | 'form'

export default function CentrosCustoPage() {
  const [view,       setView]       = useState<View>('list')
  const [centros,    setCentros]    = useState<CentroCusto[]>(mockCentrosCusto)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selected = centros.find(c => c.id === selectedId) ?? null

  const handleSave = (cc: CentroCusto) => {
    setCentros(prev => {
      const idx = prev.findIndex(c => c.id === cc.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = cc
        return next
      }
      const nextId = Math.max(0, ...prev.map(c => c.id)) + 1
      return [...prev, { ...cc, id: nextId }]
    })
    setView('list')
  }

  const handleDelete = (id: number) => {
    setCentros(prev => {
      const toRemove = new Set([id, ...getAllDescendantCentroIds(prev, id)])
      return prev.filter(c => !toRemove.has(c.id))
    })
  }

  if (view === 'form') {
    return (
      <CentroCustoCadastro
        initialData={selected ?? undefined}
        allCentros={centros}
        onBack={() => setView('list')}
        onSave={handleSave}
      />
    )
  }

  return (
    <CentrosCustoLista
      centros={centros}
      onNew={() => { setSelectedId(null); setView('form') }}
      onEdit={(id) => { setSelectedId(id); setView('form') }}
      onDelete={handleDelete}
    />
  )
}
