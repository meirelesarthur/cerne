import { useState } from 'react'
import PerfisAcessoLista from './PerfisAcessoLista'
import PerfilAcessoCadastro from './PerfilAcessoCadastro'
import { MOCK_PERFIS, type PerfilAcesso } from './perfisAcesso.types'

type View = 'list' | 'form'

export default function PerfisAcessoPage() {
  const [view, setView] = useState<View>('list')
  const [perfis, setPerfis] = useState<PerfilAcesso[]>(MOCK_PERFIS)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = perfis.find((p) => p.id === selectedId) ?? null

  const handleSave = (perfil: PerfilAcesso) => {
    setPerfis((prev) => {
      const idx = prev.findIndex((p) => p.id === perfil.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = perfil
        return next
      }
      const nextId = String(Math.max(0, ...prev.map((p) => Number(p.id) || 0)) + 1)
      return [...prev, { ...perfil, id: nextId }]
    })
    setView('list')
  }

  const handleDelete = (id: string) => {
    setPerfis((prev) => prev.filter((p) => p.id !== id))
  }

  if (view === 'form') {
    return (
      <PerfilAcessoCadastro
        initialData={selected ?? undefined}
        allPerfis={perfis}
        onBack={() => setView('list')}
        onSave={handleSave}
      />
    )
  }

  return (
    <PerfisAcessoLista
      perfis={perfis}
      onNew={() => {
        setSelectedId(null)
        setView('form')
      }}
      onEdit={(id) => {
        setSelectedId(id)
        setView('form')
      }}
      onDelete={handleDelete}
    />
  )
}
