import { useState, useCallback } from 'react'
import ArmazensLista from './ArmazensLista'
import ArmazemForm   from './ArmazemForm'
import { mockArmazens }              from './armazens.mock'
import { useToast, ToastContainer }  from '../../../components/ui/Toast'
import type { Armazem }              from './armazens.types'

type View = 'list' | 'form'

export default function ArmazensPage() {
  const [view,       setView]       = useState<View>('list')
  const [armazens,   setArmazens]   = useState<Armazem[]>(mockArmazens)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { toasts, show, dismiss }   = useToast()

  const selected = armazens.find(a => a.id === selectedId) ?? null

  const handleSave = useCallback((arm: Armazem) => {
    const isNew = arm.id === 0
    setArmazens(prev => {
      if (isNew) {
        const nextId = Math.max(0, ...prev.map(a => a.id)) + 1
        return [...prev, { ...arm, id: nextId }]
      }
      return prev.map(a => a.id === arm.id ? arm : a)
    })
    show(isNew ? 'Armazém criado com sucesso.' : 'Armazém atualizado com sucesso.')
    setView('list')
  }, [show])

  const handleDelete = useCallback((id: number) => {
    setArmazens(prev => prev.filter(a => a.id !== id))
  }, [])

  if (view === 'form') {
    return (
      <ArmazemForm
        initialData={selected ?? undefined}
        existingArmazens={armazens}
        onBack={() => setView('list')}
        onSave={handleSave}
      />
    )
  }

  return (
    <>
      <ArmazensLista
        armazens={armazens}
        onNew={() => { setSelectedId(null); setView('form') }}
        onEdit={id => { setSelectedId(id); setView('form') }}
        onDelete={handleDelete}
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
