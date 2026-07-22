import { useState } from 'react'
import EmissoresLista      from './EmissoresLista'
import EmissorCadastro     from './EmissorCadastro'
import CertificadoEmissor  from './CertificadoEmissor'
import { mockEmissores, MOCK_TODAY } from './emissores.mock'
import type { Emissor, CertificadoInfo } from './emissores.types'

type View = 'list' | 'form' | 'certificado'

export default function EmissoresPage() {
  const [view,       setView]       = useState<View>('list')
  const [emissores,  setEmissores]  = useState<Emissor[]>(mockEmissores)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selected = emissores.find(e => e.id === selectedId) ?? null

  const handleSave = (emissor: Emissor) => {
    setEmissores(prev => {
      const idx = prev.findIndex(e => e.id === emissor.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = emissor
        return next
      }
      const nextId = Math.max(0, ...prev.map(e => e.id)) + 1
      return [...prev, { ...emissor, id: nextId }]
    })
    setView('list')
  }

  const handleSaveCertificado = (certificado: CertificadoInfo) => {
    setEmissores(prev => prev.map(e => e.id === selectedId ? { ...e, certificado } : e))
    setView('list')
  }

  const handleDelete = (id: number) => {
    setEmissores(prev => prev.filter(e => e.id !== id))
  }

  if (view === 'form') {
    return (
      <EmissorCadastro
        initialData={selected ?? undefined}
        onBack={() => setView('list')}
        onSave={handleSave}
      />
    )
  }

  if (view === 'certificado' && selected) {
    return (
      <CertificadoEmissor
        emissor={selected}
        today={MOCK_TODAY}
        onBack={() => setView('list')}
        onSave={handleSaveCertificado}
      />
    )
  }

  return (
    <EmissoresLista
      emissores={emissores}
      today={MOCK_TODAY}
      onNew={() => { setSelectedId(null); setView('form') }}
      onEdit={(id) => { setSelectedId(id); setView('form') }}
      onCertificado={(id) => { setSelectedId(id); setView('certificado') }}
      onDelete={handleDelete}
    />
  )
}
