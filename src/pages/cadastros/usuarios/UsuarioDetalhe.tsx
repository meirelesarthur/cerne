import { Pencil } from 'lucide-react'
import { Button }         from '../../../components/ui/Button'
import { DetailGrid }     from '../../../components/ui/DetailGrid'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormSection }    from '../../../components/ui/FormSection'
import { PageCard }       from '../../../components/ui/PageCard'
import { PageContainer }  from '../../../components/ui/PageContainer'
import { t }              from '../../../design/tokens'
import { detailItems, type UserRecord } from './usuarios.types'

interface UsuarioDetalheProps {
  user:   UserRecord
  onBack: () => void
  onEdit: () => void
}

export default function UsuarioDetalhe({ user, onBack, onEdit }: UsuarioDetalheProps) {
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
          title="Detalhes do Usuário"
          subtitle={`${user.name} — ${user.email}`}
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        <FormSection title="Dados do usuário" divider={false}>
          <DetailGrid columns={2} responsive items={detailItems(user)} />
        </FormSection>
      </PageCard>
    </PageContainer>
  )
}
