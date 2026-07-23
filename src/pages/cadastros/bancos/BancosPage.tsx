import { useState } from 'react'
import { CrudPattern, type CrudEntity } from '../../../components/ui/CrudPattern'

type Bank = CrudEntity & {
  code: string
  name: string
}

const INITIAL_BANKS: Bank[] = [
  { id: 'bank-001', code: '001', name: 'Banco do Brasil' },
  { id: 'bank-104', code: '104', name: 'Caixa Econômica Federal' },
  { id: 'bank-237', code: '237', name: 'Banco Bradesco' },
  { id: 'bank-341', code: '341', name: 'Itaú Unibanco' },
  { id: 'bank-748', code: '748', name: 'Sicredi' },
]

export default function BancosPage() {
  const [banks, setBanks] = useState(INITIAL_BANKS)
  return (
    <CrudPattern
      title="Bancos"
      singular="Banco"
      description="Instituições financeiras disponíveis para contas e movimentações."
      records={banks}
      onRecordsChange={setBanks}
      columns={[
        { key: 'code', label: 'Código', width: 180 },
        { key: 'name', label: 'Nome' },
      ]}
      fields={[
        { key: 'code', label: 'Código', required: true, maxLength: 100, placeholder: 'Ex.: 001' },
        { key: 'name', label: 'Nome', required: true, maxLength: 100, placeholder: 'Nome da instituição' },
      ]}
      permissions={{ view: true, create: true, edit: true, delete: true }}
    />
  )
}
