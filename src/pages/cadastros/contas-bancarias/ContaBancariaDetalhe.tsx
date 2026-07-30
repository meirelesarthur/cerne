import { ArrowLeft, Pencil } from 'lucide-react'
import { Badge }          from '../../../components/ui/Badge'
import { Button }         from '../../../components/ui/Button'
import { DetailGrid }     from '../../../components/ui/DetailGrid'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormSection }    from '../../../components/ui/FormSection'
import { PageCard }       from '../../../components/ui/PageCard'
import { PageContainer }  from '../../../components/ui/PageContainer'
import { t }              from '../../../design/tokens'
import { mockPessoas }  from '../pessoas/pessoas.mock'
import { mockFazendas } from '../fazendas/fazendas.mock'
import {
  TIPO_CONTA_LABEL, TIPO_BOLETO_OPTS,
  bancoLabel, contaInvestimentoLabel, formatCurrencyBRL,
  type ContaBancaria,
} from './contasBancarias.types'

interface Props {
  conta:     ContaBancaria
  allContas: ContaBancaria[]
  onBack:    () => void
  onEdit:    () => void
}

function proprietariosLabel(ids: number[]): string {
  if (ids.length === 0) return 'Nenhum proprietário vinculado.'
  const nomes = ids.map(id => mockPessoas.find(p => p.id === id)?.name ?? String(id))
  return nomes.join(', ')
}

function fazendasLabel(ids: string[]): string {
  if (ids.length === 0) return 'Nenhuma fazenda vinculada.'
  const nomes = ids.map(id => mockFazendas.find(f => f.id === id)?.nome ?? id)
  return nomes.join(', ')
}

export default function ContaBancariaDetalhe({ conta, allContas, onBack, onEdit }: Props) {
  const contaInvestimento = conta.contaInvestimentoVinculadaId !== null
    ? allContas.find(c => c.id === conta.contaInvestimentoVinculadaId)
    : null
  const contaInvestimentoValue = contaInvestimento ? contaInvestimentoLabel(contaInvestimento) : 'Nenhuma'

  const tipoBoletoLabel = TIPO_BOLETO_OPTS.find(o => o.value === conta.tipoBoleto)?.label ?? '—'

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={onBack} icon={<ArrowLeft size={14} />}>Voltar</Button>
            <Button variant="primary" onClick={onEdit} icon={<Pencil size={14} />}>Editar</Button>
          </>
        }
      >
        <FormPageHeader
          title="Visualizar Conta Bancária"
          subtitle={`${conta.sigla} — ${conta.descricao}`}
          onBack={onBack}
          paddingTop={t.space[4]}
          actions={
            <Badge label={conta.ativo === 'sim' ? 'Ativo' : 'Inativo'} variant={conta.ativo === 'sim' ? 'success' : 'neutral'} />
          }
        />

        <FormSection title="Informações Gerais" divider={false}>
          <DetailGrid
            columns={3}
            responsive
            items={[
              { label: 'Banco', value: bancoLabel(conta.banco) },
              { label: 'Agência', value: conta.agencia },
              { label: 'Conta', value: conta.conta },
              { label: 'Tipo', value: conta.tipo ? TIPO_CONTA_LABEL[conta.tipo] : '' },
              { label: 'Sigla', value: conta.sigla },
              { label: 'Usa no Livro Caixa', value: <Badge label={conta.usaNoLivroCaixa === 'sim' ? 'Sim' : 'Não'} variant={conta.usaNoLivroCaixa === 'sim' ? 'success' : 'neutral'} /> },
              { label: 'Ativo', value: <Badge label={conta.ativo === 'sim' ? 'Sim' : 'Não'} variant={conta.ativo === 'sim' ? 'success' : 'neutral'} /> },
              { label: 'Descrição', value: conta.descricao },
              { label: 'Limite', value: formatCurrencyBRL(conta.limite) },
              { label: 'Conta Investimento Vinculada', value: contaInvestimentoValue },
              { label: 'Saldo Atual', value: formatCurrencyBRL(conta.saldo) },
            ]}
          />
        </FormSection>

        <FormSection title="Emissão de Boleto" divider={false}>
          <DetailGrid
            columns={3}
            responsive
            items={[
              { label: 'Emite Boleto', value: <Badge label={conta.emiteBoleto === 'sim' ? 'Sim' : 'Não'} variant={conta.emiteBoleto === 'sim' ? 'success' : 'neutral'} /> },
              ...(conta.emiteBoleto === 'sim' ? [
                { label: 'Carteira', value: conta.carteira },
                { label: 'Convênio / Cód. Beneficiário', value: conta.convenioCodBeneficiario },
                { label: 'Tipo do Boleto', value: tipoBoletoLabel },
              ] : []),
            ]}
          />
          {conta.emiteBoleto === 'sim' && (
            <div style={{ marginTop: t.space[4] }}>
              <DetailGrid columns={1} items={[{ label: 'Proprietários', value: proprietariosLabel(conta.proprietarios) }]} />
            </div>
          )}
        </FormSection>

        <FormSection title="Fazendas Vinculadas" divider={false}>
          <DetailGrid columns={1} items={[{ label: 'Propriedades', value: fazendasLabel(conta.fazendasVinculadas) }]} />
        </FormSection>
      </PageCard>
    </PageContainer>
  )
}
