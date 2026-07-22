import { useState } from 'react'
import ContasBancariasLista   from './ContasBancariasLista'
import ContaBancariaCadastro  from './ContaBancariaCadastro'
import { mockContasBancarias } from './contasBancarias.mock'
import type { ContaBancaria } from './contasBancarias.types'

type View = 'list' | 'form' | 'view'

export default function ContasBancariasPage() {
  const [view,       setView]       = useState<View>('list')
  const [contas,     setContas]     = useState<ContaBancaria[]>(mockContasBancarias)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selected = contas.find(c => c.id === selectedId) ?? null

  const handleSave = (conta: ContaBancaria) => {
    setContas(prev => {
      const idx = prev.findIndex(c => c.id === conta.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = conta
        return next
      }
      const nextId = Math.max(0, ...prev.map(c => c.id)) + 1
      return [...prev, { ...conta, id: nextId }]
    })
    setView('list')
  }

  const handleDelete = (id: number) => {
    setContas(prev => prev.filter(c => c.id !== id))
  }

  if (view === 'form' || view === 'view') {
    return (
      <ContaBancariaCadastro
        initialData={selected ?? undefined}
        allContas={contas}
        onBack={() => setView('list')}
        onSave={handleSave}
        readOnly={view === 'view'}
      />
    )
  }

  return (
    <ContasBancariasLista
      contas={contas}
      onNew={() => { setSelectedId(null); setView('form') }}
      onView={(id) => { setSelectedId(id); setView('view') }}
      onEdit={(id) => { setSelectedId(id); setView('form') }}
      onDelete={handleDelete}
    />
  )
}
