import { useState, useCallback, useEffect } from 'react'
import ProdutosLista from './ProdutosLista'
import ProdutoForm   from './ProdutoForm'
import { mockProdutos } from './produtos.mock'
import { t }            from '../../../design/tokens'
import type { Produto } from './produtos.types'

type View = 'list' | 'form'

export default function ProdutosPage() {
  const [view,       setView]       = useState<View>('list')
  const [produtos,   setProdutos]   = useState<Produto[]>(mockProdutos)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [toast,      setToast]      = useState<string | null>(null)

  const selected = produtos.find(p => p.id === selectedId) ?? null

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(id)
  }, [toast])

  const handleSave = useCallback((prod: Produto) => {
    const isNew = prod.id === 0
    setProdutos(prev => {
      if (isNew) {
        const nextId   = Math.max(0, ...prev.map(p => p.id)) + 1
        const maxCodigo = prev.map(p => parseInt(p.codigo, 10)).filter(n => !isNaN(n))
        const nextCodigo = String(Math.max(0, ...maxCodigo) + 1).padStart(5, '0')
        return [...prev, { ...prod, id: nextId, codigo: nextCodigo }]
      }
      return prev.map(p => p.id === prod.id ? prod : p)
    })
    setToast(isNew ? 'Produto criado com sucesso.' : 'Produto atualizado com sucesso.')
    setView('list')
  }, [])

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
      {toast && (
        <div style={{ position: 'fixed', top: 72, right: 24, background: '#14532d', color: 'white', padding: '11px 18px', borderRadius: t.radius.lg, fontSize: t.font.size.base, fontWeight: t.font.weight.medium, fontFamily: t.font.family.sans, boxShadow: t.shadow.lg, zIndex: t.zIndex.toast, animation: 'toastIn 0.22s ease' }}>
          {toast}
        </div>
      )}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(16px) } to { opacity:1; transform:translateX(0) } }`}</style>
    </>
  )
}
