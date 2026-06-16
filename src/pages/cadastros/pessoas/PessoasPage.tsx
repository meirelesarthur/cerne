import { useState } from 'react'
import PessoasLista from './PessoasLista'
import PessoaForm   from './PessoaForm'
import { mockPessoas } from './pessoas.mock'
import type { Pessoa } from './pessoas.types'

type View = 'list' | 'form' | 'view'

export default function PessoasPage() {
  const [view,       setView]       = useState<View>('list')
  const [pessoas,    setPessoas]    = useState<Pessoa[]>(mockPessoas)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selected = pessoas.find((p) => p.id === selectedId) ?? null

  const handleSave = (p: Pessoa) => {
    setPessoas((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = p
        return next
      }
      const nextId = Math.max(0, ...prev.map((x) => x.id)) + 1
      return [...prev, { ...p, id: nextId }]
    })
    setView('list')
  }

  const handleDelete = (id: number) => {
    setPessoas((prev) => prev.filter((p) => p.id !== id))
  }

  if (view === 'form' || view === 'view') {
    return (
      <PessoaForm
        initialData={selected ?? undefined}
        readOnly={view === 'view'}
        onBack={() => setView('list')}
        onSave={handleSave}
      />
    )
  }

  return (
    <PessoasLista
      pessoas={pessoas}
      onNew={() => { setSelectedId(null); setView('form') }}
      onEdit={(id) => { setSelectedId(id); setView('form') }}
      onView={(id) => { setSelectedId(id); setView('view') }}
      onDelete={handleDelete}
    />
  )
}
