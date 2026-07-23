import { useState } from 'react'
import { Map, Rows3 } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { EntityBoard, type BoardEntity, type BoardGroup } from '../../../components/ui/EntityBoard'
import { FeedbackBanner } from '../../../components/ui/FeedbackBanner'
import { FilterSelect } from '../../../components/ui/FilterSelect'
import { MapView } from '../../../components/ui/MapView'
import { Modal } from '../../../components/ui/Modal'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Tabs } from '../../../components/ui/Tabs'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { t } from '../../../design/tokens'

const INITIAL_GROUPS: BoardGroup[] = [
  {
    id: 'sector-a', label: 'Setor A', description: 'Pátio Norte · 3 currais', items: [
      { id: 'corral-a1', label: 'Curral A-01', description: 'Lote Engorda 04', occupancy: 82, capacity: 100 },
      { id: 'corral-a2', label: 'Curral A-02', description: 'Lote Recria 12', occupancy: 96, capacity: 100 },
      { id: 'corral-a3', label: 'Curral A-03', description: 'Lote Engorda 08', occupancy: 118, capacity: 100 },
    ],
  },
  {
    id: 'sector-b', label: 'Setor B', description: 'Pátio Norte · 2 currais', items: [
      { id: 'corral-b1', label: 'Curral B-01', description: 'Lote Adaptação 02', occupancy: 54, capacity: 80 },
      { id: 'corral-b2', label: 'Curral B-02', description: 'Disponível', occupancy: 0, capacity: 80 },
    ],
  },
  { id: 'sector-c', label: 'Setor C', description: 'Pátio Norte · expansão', items: [] },
]

const FEEDLOT_GEOJSON = JSON.stringify({
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: { name: 'Pátio Norte' },
    geometry: { type: 'Polygon', coordinates: [[[-56.124, -15.612], [-56.118, -15.612], [-56.117, -15.618], [-56.125, -15.619], [-56.124, -15.612]]] },
  }],
})

export default function MapaConfinamentoPage() {
  const [view, setView] = useState('board')
  const [yard, setYard] = useState('north')
  const [groups, setGroups] = useState(INITIAL_GROUPS)
  const [selected, setSelected] = useState<BoardEntity | null>(null)
  const { toasts, show, dismiss } = useToast()

  const move = (entityId: string, sourceGroupId: string, targetGroupId: string) => {
    const entity = groups.find((group) => group.id === sourceGroupId)?.items.find((item) => item.id === entityId)
    if (!entity) return
    setGroups((current) => current.map((group) => group.id === sourceGroupId
      ? { ...group, items: group.items.filter((item) => item.id !== entityId) }
      : group.id === targetGroupId
        ? { ...group, items: [...group.items, entity] }
        : group))
    show(`${entity.label} movido para ${groups.find((group) => group.id === targetGroupId)?.label}.`)
  }

  const totalOccupancy = groups.flatMap((group) => group.items).reduce((total, item) => total + (item.occupancy ?? 0), 0)
  const totalCapacity = groups.flatMap((group) => group.items).reduce((total, item) => total + (item.capacity ?? 0), 0)

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader
          title="Mapa de Confinamento"
          description="Pátios, setores, currais e capacidade operacional."
          actions={<FilterSelect ariaLabel="Selecionar pátio" prefix="Pátio:" value={yard} onChange={setYard} options={[{ value: 'north', label: 'Norte' }, { value: 'south', label: 'Sul' }]} />}
        />
        <Tabs items={[{ id: 'board', label: 'Estrutura', icon: <Rows3 size={15} /> }, { id: 'map', label: 'Mapa e polígonos', icon: <Map size={15} /> }]} activeId={view} onChange={setView} syncParam="feedlotView" />
        <div style={{ marginTop: t.space[4] }}>
          <FeedbackBanner
            variant={totalOccupancy > totalCapacity ? 'warning' : 'info'}
            title={`${totalOccupancy} de ${totalCapacity} animais alocados`}
            description="Currais acima da capacidade aparecem destacados. Arraste um card ou use seu menu de ações para movê-lo."
          />
        </div>
        <div style={{ marginTop: t.space[5] }}>
          {view === 'board' ? (
            <EntityBoard groups={yard === 'north' ? groups : []} onMove={move} onSelect={setSelected} emptyText="O Pátio Sul ainda não possui setores cadastrados." />
          ) : (
            <MapView geoJSON={FEEDLOT_GEOJSON} height={520} />
          )}
        </div>
      </PageCard>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.label} subtitle="Capacidade e lote atualmente alocado." size="sm" footer={<Badge label={selected && (selected.occupancy ?? 0) > (selected.capacity ?? 0) ? 'Acima da capacidade' : 'Capacidade regular'} variant={selected && (selected.occupancy ?? 0) > (selected.capacity ?? 0) ? 'danger' : 'success'} />}>
        {selected && <DetailGrid columns={1} items={[
          { label: 'Lote', value: selected.description },
          { label: 'Ocupação', value: `${selected.occupancy ?? 0} animais` },
          { label: 'Capacidade', value: `${selected.capacity ?? 0} animais` },
        ]} />}
      </Modal>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
