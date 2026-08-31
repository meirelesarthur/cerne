import { Icon } from '../../../components/ui/Icon'
import { Badge }          from '../../../components/ui/Badge'
import { Button }         from '../../../components/ui/Button'
import { DetailGrid }     from '../../../components/ui/DetailGrid'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormSection }    from '../../../components/ui/FormSection'
import { PageCard }       from '../../../components/ui/PageCard'
import { PageContainer }  from '../../../components/ui/PageContainer'
import { t }              from '../../../design/tokens'
import { TIPO_ARMAZEM_OPTS, type Armazem } from './armazens.types'

interface Props {
  armazem: Armazem
  onBack:  () => void
  onEdit:  () => void
}

export default function ArmazemDetalhe({ armazem, onBack, onEdit }: Props) {
  const tipoLabel = TIPO_ARMAZEM_OPTS.find(o => o.value === armazem.tipo)?.label ?? armazem.tipo

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={onBack}>Voltar</Button>
            <Button variant="primary" icon={<Icon name="edit" size={14} />} onClick={onEdit}>Editar</Button>
          </>
        }
      >
        <FormPageHeader
          title="Visualizar Armazém"
          subtitle={`${armazem.sigla} — ${armazem.descricao}`}
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        <FormSection title="Dados do armazém" divider={false}>
          <DetailGrid
            columns={2}
            responsive
            items={[
              { label: 'Sigla', value: armazem.sigla, copyValue: armazem.sigla },
              { label: 'Tipo', value: tipoLabel },
              { label: 'Descrição', value: armazem.descricao },
              { label: 'Status', value: <Badge label={armazem.ativo ? 'Ativo' : 'Inativo'} variant={armazem.ativo ? 'success' : 'neutral'} /> },
            ]}
          />
        </FormSection>
      </PageCard>
    </PageContainer>
  )
}
