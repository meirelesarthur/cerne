import { useState, useCallback, useEffect } from 'react'
import ArmazensLista from './ArmazensLista'
import ArmazemForm   from './ArmazemForm'
import { mockArmazens } from './armazens.mock'
import { t }            from '../../../design/tokens'
import type { Armazem } from './armazens.types'

type View = 'list' | 'form'

export default function ArmazensPage() {
  const [view,       setView]      = useState<View>('list')
  const [armazens,   setArmazens]  = useState<Armazem[]>(mockArmazens)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [toast,      setToast]     = useState<string | null>(null)

  const selected = armazens.find(a => a.id === selectedId) ?? null

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(id)
  }, [toast])

  const handleSave = useCallback((arm: Armazem) => {
    const isNew = arm.id === 0
    setArmazens(prev => {
      if (isNew) {
        const nextId = Math.max(0, ...prev.map(a => a.id)) + 1
        return [...prev, { ...arm, id: nextId }]
      }
      return prev.map(a => a.id === arm.id ? arm : a)
    })
    setToast(isNew ? 'Armazém criado com sucesso.' : 'Armazém atualizado com sucesso.')
    setView('list')
  }, [])

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
      {toast && (
        <div style={{ position: 'fixed', top: 72, right: 24, background: '#14532d', color: 'white', padding: '11px 18px', borderRadius: t.radius.lg, fontSize: t.font.size.base, fontWeight: t.font.weight.medium, fontFamily: t.font.family.sans, boxShadow: t.shadow.lg, zIndex: t.zIndex.toast, animation: 'toastIn 0.22s ease' }}>
          {toast}
        </div>
      )}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(16px) } to { opacity:1; transform:translateX(0) } }`}</style>
    </>
  )
}
