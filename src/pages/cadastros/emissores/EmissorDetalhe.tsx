import { Icon } from '../../../components/ui/Icon'
import { Badge }          from '../../../components/ui/Badge'
import { Button }         from '../../../components/ui/Button'
import { DetailGrid }     from '../../../components/ui/DetailGrid'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormSection }    from '../../../components/ui/FormSection'
import { PageCard }       from '../../../components/ui/PageCard'
import { PageContainer }  from '../../../components/ui/PageContainer'
import { t }              from '../../../design/tokens'
import { mockFazendas }   from '../fazendas/fazendas.mock'
import { AMBIENTE_OPTS, REGIME_OPTS, type Emissor } from './emissores.types'

interface Props {
  emissor: Emissor
  onBack:  () => void
  onEdit:  () => void
}

export default function EmissorDetalhe({ emissor, onBack, onEdit }: Props) {
  const fazendasLabel = emissor.fazendas.length === 0
    ? 'Nenhuma fazenda vinculada'
    : emissor.fazendas
        .map(id => mockFazendas.find(f => f.id === id)?.nome)
        .filter(Boolean)
        .join(', ')

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
          title="Visualizar Emissor"
          subtitle={`${emissor.cpfCnpj} — ${emissor.razaoSocial}`}
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        <FormSection title="Informações Gerais" divider={false}>
          <DetailGrid
            columns={3}
            responsive
            items={[
              { label: 'CPF/CNPJ', value: emissor.cpfCnpj, copyValue: emissor.cpfCnpj },
              { label: 'Razão Social', value: emissor.razaoSocial },
              { label: 'Nome Fantasia', value: emissor.nomeFantasia },
              { label: 'E-mail', value: emissor.email },
              { label: 'Status', value: <Badge label={emissor.ativo === 'sim' ? 'Ativo' : 'Inativo'} variant={emissor.ativo === 'sim' ? 'success' : 'neutral'} /> },
            ]}
          />
        </FormSection>

        <FormSection title="Endereço" divider={false}>
          <DetailGrid
            columns={3}
            responsive
            items={[
              { label: 'CEP', value: emissor.cep },
              { label: 'Rua', value: emissor.rua },
              { label: 'Número', value: emissor.numero },
              { label: 'Bairro', value: emissor.bairro },
              { label: 'Cidade', value: emissor.cidade },
            ]}
          />
        </FormSection>

        <FormSection title="Configuração de Numeração Fiscal" divider={false}>
          <DetailGrid
            columns={3}
            responsive
            items={[
              { label: 'Emite NFe', value: <Badge label={emissor.emiteNfe === 'sim' ? 'Sim' : 'Não'} variant={emissor.emiteNfe === 'sim' ? 'success' : 'neutral'} /> },
              ...(emissor.emiteNfe === 'sim'
                ? [
                    { label: 'Série NFe', value: emissor.numeroSerieNfe },
                    { label: 'Série CTe', value: emissor.numeroSerieCte },
                    { label: 'Série MDFe', value: emissor.numeroSerieMdfe },
                    { label: 'Ambiente', value: AMBIENTE_OPTS.find(o => o.value === emissor.ambiente)?.label ?? emissor.ambiente },
                    { label: 'Regime', value: REGIME_OPTS.find(o => o.value === emissor.regime)?.label ?? emissor.regime },
                  ]
                : []),
            ]}
          />
        </FormSection>

        <FormSection title="Fazendas Vinculadas" divider={false}>
          <DetailGrid columns={1} items={[{ label: 'Propriedades', value: fazendasLabel }]} />
        </FormSection>

        <FormSection title="Inscrições Estaduais" divider={false}>
          <DetailGrid
            columns={1}
            items={[{
              label: 'Inscrições',
              value: emissor.inscricoesEstaduais.length === 0
                ? 'Nenhuma inscrição cadastrada'
                : emissor.inscricoesEstaduais.map(ie => `${ie.uf}: ${ie.isento ? 'Isento' : ie.numero}`).join(', '),
            }]}
          />
        </FormSection>
      </PageCard>
    </PageContainer>
  )
}
