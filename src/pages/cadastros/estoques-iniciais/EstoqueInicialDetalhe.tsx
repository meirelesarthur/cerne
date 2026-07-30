import { Pencil } from 'lucide-react'
import { Button }         from '../../../components/ui/Button'
import { DetailGrid }     from '../../../components/ui/DetailGrid'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormSection }    from '../../../components/ui/FormSection'
import { PageCard }       from '../../../components/ui/PageCard'
import { PageContainer }  from '../../../components/ui/PageContainer'
import { t }              from '../../../design/tokens'
import type { EstoqueInicial } from './estoques-iniciais.types'

interface Props {
  registro: EstoqueInicial
  onBack:   () => void
  onEdit:   () => void
}

const currency = (v: number, digits = 2) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
const qtd      = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
const dmy      = (iso: string) => iso ? iso.split('-').reverse().join('/') : 'Não informado'

export default function EstoqueInicialDetalhe({ registro, onBack, onEdit }: Props) {
  const hasLote = Boolean(registro.loteFornecedor || registro.dtValidade)

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
          title="Visualizar Saldo Inicial"
          subtitle={`${registro.produtoCodigo} — ${registro.produtoDescricao}`}
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        <FormSection title="Identificação" divider={false}>
          <DetailGrid
            columns={2}
            responsive
            items={[
              { label: 'Produto', value: `${registro.produtoCodigo} — ${registro.produtoDescricao}` },
              { label: 'Unidade de Medida', value: registro.unidade },
              { label: 'Armazém', value: registro.armazemDescricao },
              { label: 'Data do Movimento', value: dmy(registro.dtMovimento) },
            ]}
          />
        </FormSection>

        <FormSection title="Quantidades & Valores" divider={false}>
          <DetailGrid
            columns={2}
            responsive
            items={[
              { label: 'Qtde. Total', value: qtd(registro.qtdeTotal) },
              { label: 'Vl. Unitário', value: currency(registro.vlUnitario, 4) },
              { label: 'Valor Total', value: currency(registro.valorTotal) },
              { label: 'Custo Médio Unitário', value: currency(registro.custoMedioUnit, 4) },
            ]}
          />
        </FormSection>

        {hasLote && (
          <FormSection title="Informações Adicionais" divider={false}>
            <DetailGrid
              columns={2}
              responsive
              items={[
                { label: 'Lote Fornecedor', value: registro.loteFornecedor || 'Não informado' },
                { label: 'Data de Validade', value: dmy(registro.dtValidade) },
              ]}
            />
          </FormSection>
        )}
      </PageCard>
    </PageContainer>
  )
}
