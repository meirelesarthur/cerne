import { Pencil } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormSection } from '../../../components/ui/FormSection'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { t } from '../../../design/tokens'
import type { IntegrationRecord } from './IntegracaoDominioPage'

interface IntegracaoDominioDetalheProps {
  record: IntegrationRecord
  onBack: () => void
  onEdit: () => void
}

export default function IntegracaoDominioDetalhe({ record, onBack, onEdit }: IntegracaoDominioDetalheProps) {
  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={onBack}>Voltar</Button>
            <Button variant="primary" icon={<Pencil size={14} />} onClick={onEdit}>Editar</Button>
          </>
        }
      >
        <FormPageHeader
          title="Detalhes da Integração"
          subtitle={`${record.issuer.label} — ${record.accountant.label}`}
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        <FormSection title="Dados da integração" divider={false}>
          <DetailGrid
            columns={2}
            responsive
            items={[
              { label: 'Emissor', value: record.issuer.label },
              { label: 'Contador', value: record.accountant.label },
              { label: 'Token', value: record.token, sensitive: true },
              { label: 'Status', value: <Badge label={record.enabled ? 'Ativa' : 'Inativa'} variant={record.enabled ? 'success' : 'neutral'} /> },
              { label: 'Última sincronização', value: record.lastSync },
            ]}
          />
        </FormSection>
      </PageCard>
    </PageContainer>
  )
}
