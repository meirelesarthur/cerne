import { Icon } from '../../../components/ui/Icon'
import { Badge }          from '../../../components/ui/Badge'
import { Button }         from '../../../components/ui/Button'
import { DetailGrid }     from '../../../components/ui/DetailGrid'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormSection }    from '../../../components/ui/FormSection'
import { PageCard }       from '../../../components/ui/PageCard'
import { PageContainer }  from '../../../components/ui/PageContainer'
import { t }              from '../../../design/tokens'
import { CATEGORIAS_FINANCEIRAS_TREE } from '../../../data/categoriasFinanceiras'
import {
  classeOf, CLASSE_LABEL, antecessorLabel,
  CONDICAO_OPTS, TIPO_OPTS,
  type CentroCusto,
} from './centrosCusto.types'

interface Props {
  centro:  CentroCusto
  centros: CentroCusto[]
  onBack:  () => void
  onEdit:  () => void
}

function categoriaLabels(selected: string[]): string {
  if (selected.length === 0) return 'Nenhuma categoria vinculada'
  const all = CATEGORIAS_FINANCEIRAS_TREE.flatMap(g => g.children)
  return selected
    .map(id => all.find(c => c.id === id)?.label ?? id)
    .join(', ')
}

export default function CentroCustoDetalhe({ centro, centros, onBack, onEdit }: Props) {
  const classe = classeOf(centro.antecessorId)
  const antecessor = centro.antecessorId !== null
    ? centros.find(c => c.id === centro.antecessorId)
    : null

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
          title="Visualizar Centro de Custo"
          subtitle={`${centro.codigo} — ${centro.descricao}`}
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        <FormSection title="Dados do centro de custo" divider={false}>
          <DetailGrid
            columns={2}
            responsive
            items={[
              { label: 'Código', value: centro.codigo, copyValue: centro.codigo },
              { label: 'Classe', value: <Badge label={CLASSE_LABEL[classe]} variant={classe === 'sintetica' ? 'info' : 'success'} /> },
              { label: 'Descrição', value: centro.descricao },
              { label: 'Condição Normal', value: CONDICAO_OPTS.find(o => o.value === centro.condicao)?.label ?? centro.condicao },
              { label: 'Tipo', value: TIPO_OPTS.find(o => o.value === centro.tipo)?.label ?? centro.tipo },
              { label: 'Antecessor', value: antecessor ? antecessorLabel(antecessor) : 'Nenhum (Centro Raiz)' },
              { label: 'Status', value: <Badge label={centro.ativo === 'sim' ? 'Ativo' : 'Inativo'} variant={centro.ativo === 'sim' ? 'success' : 'neutral'} /> },
              { label: 'Apontamento', value: <Badge label={centro.apontamento === 'sim' ? 'Sim' : 'Não'} variant={centro.apontamento === 'sim' ? 'success' : 'neutral'} /> },
            ]}
          />
        </FormSection>

        <FormSection title="Categorias Financeiras" divider={false}>
          <DetailGrid columns={1} items={[{ label: 'Vinculadas', value: categoriaLabels(centro.categorias) }]} />
        </FormSection>
      </PageCard>
    </PageContainer>
  )
}
