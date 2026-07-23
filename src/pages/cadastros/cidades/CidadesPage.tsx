import { CrudPattern, type CrudEntity } from '../../../components/ui/CrudPattern'

type City = CrudEntity & {
  name: string
  state: string
  ibgeCode: string
}

const CITIES: City[] = [
  { id: '5103403', name: 'Cuiabá', state: 'Mato Grosso', ibgeCode: '5103403' },
  { id: '5107602', name: 'Rondonópolis', state: 'Mato Grosso', ibgeCode: '5107602' },
  { id: '5002704', name: 'Campo Grande', state: 'Mato Grosso do Sul', ibgeCode: '5002704' },
  { id: '5208707', name: 'Goiânia', state: 'Goiás', ibgeCode: '5208707' },
  { id: '4106902', name: 'Curitiba', state: 'Paraná', ibgeCode: '4106902' },
]

export default function CidadesPage() {
  return (
    <CrudPattern
      title="Cidades"
      singular="Cidade"
      description="Consulta de municípios e estados utilizados nos cadastros."
      records={CITIES}
      columns={[
        { key: 'name', label: 'Cidade' },
        { key: 'state', label: 'Estado / Província' },
        { key: 'ibgeCode', label: 'Código IBGE', width: 180 },
      ]}
      permissions={{ view: true, create: false, edit: false, delete: false }}
      readOnly
    />
  )
}
