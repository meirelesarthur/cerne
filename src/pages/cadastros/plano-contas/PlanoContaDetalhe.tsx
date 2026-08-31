import { Icon } from '../../../components/ui/Icon'
import { Badge }          from '../../../components/ui/Badge'
import { Button }         from '../../../components/ui/Button'
import { DetailGrid }     from '../../../components/ui/DetailGrid'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormSection }    from '../../../components/ui/FormSection'
import { PageCard }       from '../../../components/ui/PageCard'
import { PageContainer }  from '../../../components/ui/PageContainer'
import { t }              from '../../../design/tokens'
import { useTheme }       from '../../../context/ThemeContext'
import { CATEGORIAS_FINANCEIRAS_TREE } from '../../../data/categoriasFinanceiras'
import {
  antecessorLabel, CONDICAO_OPTS, CLASSE_OPTS, TIPO_OPTS,
  type Conta,
} from './planoContas.types'

interface Props {
  conta:  Conta
  contas: Conta[]
  onBack: () => void
  onEdit: () => void
}

function categoriaLabels(selected: string[]): string {
  if (selected.length === 0) return 'Nenhuma categoria vinculada'
  const all = CATEGORIAS_FINANCEIRAS_TREE.flatMap(g => g.children)
  return selected.map(id => all.find(c => c.id === id)?.label ?? id).join(', ')
}

export default function PlanoContaDetalhe({ conta, contas, onBack, onEdit }: Props) {
  const { colors } = useTheme()
  const antecessor = conta.antecessorId !== null
    ? contas.find(c => c.id === conta.antecessorId)
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
          title="Visualizar Conta"
          subtitle={`${conta.codigo} — ${conta.descricao}`}
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        <FormSection title="Dados da conta" divider={false}>
          <DetailGrid
            columns={2}
            responsive
            items={[
              { label: 'Código', value: conta.codigo, copyValue: conta.codigo },
              { label: 'Classe', value: CLASSE_OPTS.find(o => o.value === conta.classe)?.label ?? conta.classe },
              { label: 'Descrição', value: conta.descricao },
              { label: 'Condição', value: CONDICAO_OPTS.find(o => o.value === conta.condicao)?.label ?? conta.condicao },
              { label: 'Tipo', value: conta.tipo ? (TIPO_OPTS.find(o => o.value === conta.tipo)?.label ?? conta.tipo) : 'Não informado' },
              { label: 'Antecessor', value: antecessor ? antecessorLabel(antecessor) : 'Nenhum (Conta Raiz)' },
              { label: 'Status', value: <Badge label={conta.ativo === 'sim' ? 'Ativo' : 'Inativo'} variant={conta.ativo === 'sim' ? 'success' : 'neutral'} /> },
            ]}
          />
        </FormSection>

        <FormSection title="Categorias Financeiras" divider={false}>
          <DetailGrid columns={1} items={[{ label: 'Vinculadas', value: categoriaLabels(conta.categorias) }]} />
        </FormSection>

        <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
          Criado em {conta.dataCriacao} por {conta.usuarioCriacao}.
        </div>
      </PageCard>
    </PageContainer>
  )
}
