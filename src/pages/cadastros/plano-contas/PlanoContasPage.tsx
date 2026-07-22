import { useState } from 'react'
import PlanoContasLista   from './PlanoContasLista'
import PlanoContaCadastro from './PlanoContaCadastro'
import { mockPlanoContas } from './planoContas.mock'
import type { Conta } from './planoContas.types'

type View = 'list' | 'form'

export default function PlanoContasPage() {
  const [view,       setView]       = useState<View>('list')
  const [contas,     setContas]     = useState<Conta[]>(mockPlanoContas)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [presetAntecessorId, setPresetAntecessorId] = useState<number | null>(null)

  const selected = contas.find(c => c.id === selectedId) ?? null

  const handleSave = (conta: Conta) => {
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

  const handleToggleAtivo = (id: number) => {
    setContas(prev => prev.map(c => c.id === id ? { ...c, ativo: c.ativo === 'sim' ? 'nao' : 'sim' } : c))
  }

  const handleCreateDescendant = (parentId: number) => {
    setSelectedId(null)
    setPresetAntecessorId(parentId)
    setView('form')
  }

  if (view === 'form') {
    return (
      <PlanoContaCadastro
        key={`${selectedId ?? 'new'}-${presetAntecessorId ?? ''}`}
        initialData={selected ?? undefined}
        allContas={contas}
        presetAntecessorId={selected ? undefined : presetAntecessorId ?? undefined}
        onBack={() => { setPresetAntecessorId(null); setView('list') }}
        onSave={(conta) => { setPresetAntecessorId(null); handleSave(conta) }}
        onCreateDescendant={selected?.classe === 'sintetica' ? () => handleCreateDescendant(selected.id) : undefined}
      />
    )
  }

  return (
    <PlanoContasLista
      contas={contas}
      onNew={() => { setSelectedId(null); setPresetAntecessorId(null); setView('form') }}
      onEdit={(id) => { setSelectedId(id); setPresetAntecessorId(null); setView('form') }}
      onCreateDescendant={handleCreateDescendant}
      onDelete={handleDelete}
      onToggleAtivo={handleToggleAtivo}
    />
  )
}
