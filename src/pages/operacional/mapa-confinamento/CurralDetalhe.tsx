import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { type BoardEntity } from '../../../components/ui/EntityBoard'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { t } from '../../../design/tokens'

interface Props {
  entity: BoardEntity
  onBack: () => void
}

export default function CurralDetalhe({ entity, onBack }: Props) {
  const overCapacity = (entity.occupancy ?? 0) > (entity.capacity ?? 0)

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={<Button variant="secondary" onClick={onBack}>Voltar</Button>}
      >
        <FormPageHeader
          title={entity.label}
          subtitle="Capacidade e lote atualmente alocado."
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        <DetailGrid
          columns={1}
          items={[
            { label: 'Lote', value: entity.description },
            { label: 'Ocupação', value: `${entity.occupancy ?? 0} animais` },
            { label: 'Capacidade', value: `${entity.capacity ?? 0} animais` },
            { label: 'Status', value: <Badge label={overCapacity ? 'Acima da capacidade' : 'Capacidade regular'} variant={overCapacity ? 'danger' : 'success'} /> },
          ]}
        />
      </PageCard>
    </PageContainer>
  )
}
