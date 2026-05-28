import { useState, useCallback } from 'react'
import EmbalagemLista    from './EmbalagemLista'
import EmbalagemCadastro from './EmbalagemCadastro'
import { mockEmbalagens }            from './embalagens.mock'
import { useToast, ToastContainer }  from '../../../components/ui/Toast'
import type { Embalagem }            from './embalagens.types'

type View = 'list' | 'form'

export default function EmbalagensPage() {
  const [view,       setView]       = useState<View>('list')
  const [embalagens, setEmbalagens] = useState<Embalagem[]>(mockEmbalagens)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { toasts, show, dismiss }   = useToast()

  const selected = embalagens.find(e => e.id === selectedId) ?? null

  const handleSave = useCallback((emb: Embalagem) => {
    const isNew = emb.id === 0
    setEmbalagens(prev => {
      if (isNew) {
        const nextId = Math.max(0, ...prev.map(e => e.id)) + 1
        return [...prev, { ...emb, id: nextId }]
      }
      return prev.map(e => e.id === emb.id ? emb : e)
    })
    show(isNew ? 'Embalagem criada com sucesso.' : 'Embalagem atualizada com sucesso.')
    setView('list')
  }, [show])

  const handleDelete = useCallback((id: number) => {
    setEmbalagens(prev => prev.filter(e => e.id !== id))
  }, [])

  if (view === 'form') {
    return (
      <EmbalagemCadastro
        initialData={selected ?? undefined}
        onBack={() => setView('list')}
        onSave={handleSave}
      />
    )
  }

  return (
    <>
      <EmbalagemLista
        embalagens={embalagens}
        onNew={() => { setSelectedId(null); setView('form') }}
        onEdit={id => { setSelectedId(id); setView('form') }}
        onDelete={handleDelete}
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
