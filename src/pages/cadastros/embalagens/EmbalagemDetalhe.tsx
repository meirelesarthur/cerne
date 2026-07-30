import { Pencil } from 'lucide-react'
import { Button }         from '../../../components/ui/Button'
import { DetailGrid }     from '../../../components/ui/DetailGrid'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormSection }    from '../../../components/ui/FormSection'
import { PageCard }       from '../../../components/ui/PageCard'
import { PageContainer }  from '../../../components/ui/PageContainer'
import { t }              from '../../../design/tokens'
import { UNIDADE_OPTS, type Embalagem } from './embalagens.types'

interface Props {
  embalagem: Embalagem
  onBack:    () => void
  onEdit:    () => void
}

export default function EmbalagemDetalhe({ embalagem, onBack, onEdit }: Props) {
  const unidadeLabel = UNIDADE_OPTS.find(o => o.value === embalagem.unidade)?.label ?? embalagem.unidade

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
          title={`Embalagem — ${embalagem.descricao}`}
          subtitle="Consulte os dados da embalagem."
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        <FormSection title="Dados da embalagem" divider={false}>
          <DetailGrid
            columns={2}
            responsive
            items={[
              { label: 'Descrição', value: embalagem.descricao },
              { label: 'Quantidade', value: embalagem.quantidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) },
              { label: 'Unidade de Medida', value: unidadeLabel },
            ]}
          />
        </FormSection>
      </PageCard>
    </PageContainer>
  )
}
