import { useState } from 'react'
import type { SearchSelectOption } from '../../../components/ui/SearchSelect'
import IntegracaoDominioCadastro from './IntegracaoDominioCadastro'
import IntegracaoDominioDetalhe from './IntegracaoDominioDetalhe'
import IntegracaoDominioLista from './IntegracaoDominioLista'

export interface IntegrationRecord {
  id: string
  issuer: SearchSelectOption
  accountant: SearchSelectOption
  token: string
  enabled: boolean
  lastSync: string
  status: 'connected' | 'attention'
}

export const ISSUERS: SearchSelectOption[] = [
  { id: 'issuer-1', code: '12.345.678/0001-90', label: 'Fazenda Boa Esperança Ltda.' },
  { id: 'issuer-2', code: '98.765.432/0001-10', label: 'Agropecuária Horizonte S.A.' },
]
export const ACCOUNTANTS: SearchSelectOption[] = [
  { id: 'accountant-1', code: 'CRC-MT 008142', label: 'Contábil Cerrado' },
  { id: 'accountant-2', code: 'CRC-GO 015221', label: 'Domínio Rural Contabilidade' },
]

export function createLoader(options: SearchSelectOption[]) {
  return async (query: string, signal: AbortSignal) => {
    await new Promise((resolve, reject) => {
      const timer = window.setTimeout(resolve, 350)
      signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Abortado', 'AbortError')) })
    })
    return options.filter((option) => `${option.code} ${option.label}`.toLowerCase().includes(query.toLowerCase()))
  }
}

export const loadIssuers = createLoader(ISSUERS)
export const loadAccountants = createLoader(ACCOUNTANTS)

const INITIAL: IntegrationRecord[] = [
  { id: 'integration-1', issuer: ISSUERS[0], accountant: ACCOUNTANTS[0], token: 'gb_dom_live_7m39x21', enabled: true, lastSync: 'Hoje, 08:42', status: 'connected' },
]

type View = 'list' | 'form' | 'view'

export default function IntegracaoDominioPage() {
  const [records, setRecords] = useState<IntegrationRecord[]>(INITIAL)
  const [view, setView] = useState<View>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = records.find((record) => record.id === selectedId) ?? null

  const handleSave = (record: IntegrationRecord) => {
    setRecords((current) => {
      const idx = current.findIndex((item) => item.id === record.id)
      if (idx >= 0) {
        const next = [...current]
        next[idx] = record
        return next
      }
      return [record, ...current]
    })
    setView('list')
  }

  if (view === 'form') {
    return (
      <IntegracaoDominioCadastro
        initialData={selected ?? undefined}
        onBack={() => setView('list')}
        onSave={handleSave}
      />
    )
  }

  if (view === 'view' && selected) {
    return (
      <IntegracaoDominioDetalhe
        record={selected}
        onBack={() => setView('list')}
        onEdit={() => setView('form')}
      />
    )
  }

  return (
    <IntegracaoDominioLista
      records={records}
      onNew={() => { setSelectedId(null); setView('form') }}
      onView={(id) => { setSelectedId(id); setView('view') }}
      onEdit={(id) => { setSelectedId(id); setView('form') }}
    />
  )
}
