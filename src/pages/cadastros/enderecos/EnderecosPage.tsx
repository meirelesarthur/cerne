import { useState, useCallback } from 'react'
import EnderecosList from './EnderecosList'
import EnderecoForm  from './EnderecoForm'
import { mockEnderecos }             from './enderecos.mock'
import { getAllDescendantIds }        from './enderecos.types'
import { useToast, ToastContainer }  from '../../../components/ui/Toast'
import type { Endereco }             from './enderecos.types'

type View =
  | { type: 'list' }
  | { type: 'create-root' }
  | { type: 'create-child'; parentId: number }
  | { type: 'edit'; id: number }

export default function EnderecosPage() {
  const [view,      setView]      = useState<View>({ type: 'list' })
  const [enderecos, setEnderecos] = useState<Endereco[]>(mockEnderecos)
  const { toasts, show, dismiss } = useToast()

  const handleSave = useCallback((e: Endereco) => {
    const isNew = e.id === 0
    setEnderecos(prev => {
      if (isNew) {
        const nextId = Math.max(0, ...prev.map(x => x.id)) + 1
        return [...prev, { ...e, id: nextId }]
      }
      return prev.map(x => x.id === e.id ? e : x)
    })
    show(isNew
      ? `${e.tipo === 'setor' ? 'Setor' : 'Endereçamento'} criado com sucesso.`
      : 'Endereçamento atualizado com sucesso.',
    )
    setView({ type: 'list' })
  }, [show])

  const handleDelete = useCallback((id: number) => {
    setEnderecos(prev => {
      const toRemove = new Set([id, ...getAllDescendantIds(prev, id)])
      return prev.filter(e => !toRemove.has(e.id))
    })
  }, [])

  if (view.type === 'create-root') {
    return (
      <EnderecoForm
        mode="create-root"
        onBack={() => setView({ type: 'list' })}
        onSave={handleSave}
      />
    )
  }

  if (view.type === 'create-child') {
    const parent = enderecos.find(e => e.id === view.parentId)
    if (!parent) { setView({ type: 'list' }); return null }
    return (
      <EnderecoForm
        mode="create-child"
        parentNode={parent}
        onBack={() => setView({ type: 'list' })}
        onSave={handleSave}
      />
    )
  }

  if (view.type === 'edit') {
    const item = enderecos.find(e => e.id === view.id)
    if (!item) { setView({ type: 'list' }); return null }
    return (
      <EnderecoForm
        mode="edit"
        initialData={item}
        onBack={() => setView({ type: 'list' })}
        onSave={handleSave}
      />
    )
  }

  return (
    <>
      <EnderecosList
        enderecos={enderecos}
        onAddRoot={() => setView({ type: 'create-root' })}
        onAddChild={parentId => setView({ type: 'create-child', parentId })}
        onEdit={id => setView({ type: 'edit', id })}
        onDelete={handleDelete}
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
