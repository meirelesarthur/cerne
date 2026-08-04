import { useState } from 'react'
import AgrupadoresContabeisLista from './AgrupadoresContabeisLista'
import AgrupadorContabilCadastro from './AgrupadorContabilCadastro'
import type { AgrupadorContabil } from './agrupadoresContabeis.types'

const INITIAL_ITEMS: AgrupadorContabil[] = [
  { id: 1, codigo: '1',     nome: 'Ativo',                       ativo: 'sim', antecessorId: null },
  { id: 2, codigo: '1.1',   nome: 'Ativo circulante',            ativo: 'sim', antecessorId: 1 },
  { id: 3, codigo: '1.1.1', nome: 'Disponibilidades',            ativo: 'sim', antecessorId: 2 },
  { id: 4, codigo: '1.1.2', nome: 'Contas a receber',            ativo: 'sim', antecessorId: 2 },
  { id: 5, codigo: '2',     nome: 'Passivo',                     ativo: 'sim', antecessorId: null },
  { id: 6, codigo: '2.1',   nome: 'Obrigações de curto prazo',   ativo: 'sim', antecessorId: 5 },
]

type View = 'list' | 'form'

export default function AgrupadoresContabeisPage() {
  const [view,            setView]            = useState<View>('list')
  const [items,           setItems]           = useState<AgrupadorContabil[]>(INITIAL_ITEMS)
  const [editing,         setEditing]         = useState<AgrupadorContabil | null>(null)
  const [defaultParentId, setDefaultParentId] = useState<number | null>(null)

  const handleSave = (item: AgrupadorContabil) => {
    setItems((prev) => {
      const idx = prev.findIndex((current) => current.id === item.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = item
        return next
      }
      const nextId = Math.max(0, ...prev.map((current) => current.id)) + 1
      return [...prev, { ...item, id: nextId }]
    })
    setView('list')
  }

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  if (view === 'form') {
    return (
      <AgrupadorContabilCadastro
        initialData={editing ?? undefined}
        allItems={items}
        defaultParentId={defaultParentId}
        onBack={() => setView('list')}
        onSave={handleSave}
      />
    )
  }

  return (
    <AgrupadoresContabeisLista
      items={items}
      onNew={(parentId) => { setEditing(null); setDefaultParentId(parentId); setView('form') }}
      onEdit={(item) => { setEditing(item); setDefaultParentId(null); setView('form') }}
      onDelete={handleDelete}
    />
  )
}
