import { useState } from 'react'
import EstoquesIniciaisLista from './EstoquesIniciaisLista'
import EstoqueInicialForm   from './EstoqueInicialForm'
import { mockEstoquesIniciais } from './estoques-iniciais.mock'
import type { EstoqueInicial } from './estoques-iniciais.types'
import { useToast, ToastContainer } from '../../../components/ui/Toast'

type View = 'list' | 'form'

export default function EstoquesIniciaisPage() {
  const [registros, setRegistros] = useState<EstoqueInicial[]>(mockEstoquesIniciais)
  const [view,      setView]      = useState<View>('list')
  const [editId,    setEditId]    = useState<number | null>(null)
  const { toasts, show, dismiss } = useToast()

  const handleNew = () => { setEditId(null); setView('form') }
  const handleEdit = (id: number) => { setEditId(id); setView('form') }
  const handleDelete = (id: number) => {
    setRegistros(prev => prev.filter(r => r.id !== id))
  }
  const handleSave = (data: Omit<EstoqueInicial, 'id'>, replaceId?: number) => {
    const targetId = replaceId ?? editId
    const isNew = targetId === null
    if (targetId !== null) {
      setRegistros(prev => prev.map(r => r.id === targetId ? { ...data, id: targetId } : r))
    } else {
      const newId = Math.max(...registros.map(r => r.id), 0) + 1
      setRegistros(prev => [...prev, { ...data, id: newId }])
    }
    setView('list')
    show(
      replaceId !== undefined
        ? 'Saldo inicial substituído com sucesso.'
        : isNew ? 'Saldo inicial cadastrado com sucesso.' : 'Saldo inicial atualizado com sucesso.'
    )
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
    <>
      <EstoquesIniciaisLista
        registros={registros}
        onNew={handleNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
