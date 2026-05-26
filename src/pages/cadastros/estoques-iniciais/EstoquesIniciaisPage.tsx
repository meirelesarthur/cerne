import { useState } from 'react'
import EstoquesIniciaisLista from './EstoquesIniciaisLista'
import EstoqueInicialForm   from './EstoqueInicialForm'
import { mockEstoquesIniciais } from './estoques-iniciais.mock'
import type { EstoqueInicial } from './estoques-iniciais.types'

type View = 'list' | 'form'

export default function EstoquesIniciaisPage() {
  const [registros, setRegistros] = useState<EstoqueInicial[]>(mockEstoquesIniciais)
  const [view,      setView]      = useState<View>('list')
  const [editId,    setEditId]    = useState<number | null>(null)

  const handleNew = () => { setEditId(null); setView('form') }
  const handleEdit = (id: number) => { setEditId(id); setView('form') }
  const handleDelete = (id: number) => {
    setRegistros(prev => prev.filter(r => r.id !== id))
  }
  const handleSave = (data: Omit<EstoqueInicial, 'id'>) => {
    if (editId !== null) {
      setRegistros(prev => prev.map(r => r.id === editId ? { ...data, id: editId } : r))
    } else {
      const newId = Math.max(...registros.map(r => r.id), 0) + 1
      setRegistros(prev => [...prev, { ...data, id: newId }])
    }
    setView('list')
  }
  const handleBack = () => setView('list')

  const editData = editId !== null ? registros.find(r => r.id === editId) : undefined

  if (view === 'form') {
    return (
      <EstoqueInicialForm
        initialData={editData}
        registros={registros}
        onBack={handleBack}
        onSave={handleSave}
      />
    )
  }

  return (
    <EstoquesIniciaisLista
      registros={registros}
      onNew={handleNew}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}
