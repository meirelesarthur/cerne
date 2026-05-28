import { useState, useCallback } from 'react'
import ProdutosLista from './ProdutosLista'
import ProdutoForm   from './ProdutoForm'
import { mockProdutos }              from './produtos.mock'
import { useToast, ToastContainer }  from '../../../components/ui/Toast'
import type { Produto }              from './produtos.types'

type View = 'list' | 'form'

export default function ProdutosPage() {
  const [view,       setView]       = useState<View>('list')
  const [produtos,   setProdutos]   = useState<Produto[]>(mockProdutos)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { toasts, show, dismiss }   = useToast()

  const selected = produtos.find(p => p.id === selectedId) ?? null

  const handleSave = useCallback((prod: Produto) => {
    const isNew = prod.id === 0
    setProdutos(prev => {
      if (isNew) {
        const nextId    = Math.max(0, ...prev.map(p => p.id)) + 1
        const maxCodigo = prev.map(p => parseInt(p.codigo, 10)).filter(n => !isNaN(n))
        const nextCodigo = String(Math.max(0, ...maxCodigo) + 1).padStart(5, '0')
        return [...prev, { ...prod, id: nextId, codigo: nextCodigo }]
      }
      return prev.map(p => p.id === prod.id ? prod : p)
    })
    show(isNew ? 'Produto criado com sucesso.' : 'Produto atualizado com sucesso.')
    setView('list')
  }, [show])

  const handleDelete = useCallback((id: number) => {
    setProdutos(prev => prev.filter(p => p.id !== id))
  }, [])

  const handleBulkActivate = useCallback((ids: number[]) => {
    const set = new Set(ids)
    setProdutos(prev => prev.map(p => set.has(p.id) ? { ...p, ativo: true } : p))
  }, [])

  const handleBulkDeactivate = useCallback((ids: number[]) => {
    const set = new Set(ids)
    setProdutos(prev => prev.map(p => set.has(p.id) ? { ...p, ativo: false } : p))
  }, [])

  const handleBulkDelete = useCallback((ids: number[]) => {
    const set = new Set(ids)
    setProdutos(prev => prev.filter(p => !set.has(p.id)))
  }, [])

  if (view === 'form') {
    return (
      <ProdutoForm
        initialData={selected ?? undefined}
        onBack={() => setView('list')}
        onSave={handleSave}
      />
    )
  }

  return (
    <>
      <ProdutosLista
        produtos={produtos}
        onNew={() => { setSelectedId(null); setView('form') }}
        onEdit={id => { setSelectedId(id); setView('form') }}
        onDelete={handleDelete}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkDelete={handleBulkDelete}
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
