import { useState, useCallback, useEffect } from 'react'
import EmbalagemLista    from './EmbalagemLista'
import EmbalagemCadastro from './EmbalagemCadastro'
import { mockEmbalagens } from './embalagens.mock'
import { t }              from '../../../design/tokens'
import type { Embalagem } from './embalagens.types'

type View = 'list' | 'form'

export default function EmbalagensPage() {
  const [view,        setView]       = useState<View>('list')
  const [embalagens,  setEmbalagens] = useState<Embalagem[]>(mockEmbalagens)
  const [selectedId,  setSelectedId] = useState<number | null>(null)
  const [toast,       setToast]      = useState<string | null>(null)

  const selected = embalagens.find(e => e.id === selectedId) ?? null

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(id)
  }, [toast])

  const handleSave = useCallback((emb: Embalagem) => {
    const isNew = emb.id === 0
    setEmbalagens(prev => {
      if (isNew) {
        const nextId = Math.max(0, ...prev.map(e => e.id)) + 1
        return [...prev, { ...emb, id: nextId }]
      }
      return prev.map(e => e.id === emb.id ? emb : e)
    })
    setToast(isNew ? 'Embalagem criada com sucesso.' : 'Embalagem atualizada com sucesso.')
    setView('list')
  }, [])

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
      {toast && (
        <div style={{
          position: 'fixed', top: 72, right: 24,
          background: '#14532d', color: 'white',
          padding: '11px 18px', borderRadius: t.radius.lg,
          fontSize: t.font.size.base, fontWeight: t.font.weight.medium,
          fontFamily: t.font.family.sans, boxShadow: t.shadow.lg,
          zIndex: t.zIndex.toast,
          animation: 'toastIn 0.22s ease',
        }}>
          {toast}
        </div>
      )}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(16px) } to { opacity:1; transform:translateX(0) } }`}</style>
    </>
  )
}
