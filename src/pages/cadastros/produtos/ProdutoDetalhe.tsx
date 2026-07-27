import { useState } from 'react'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormSection } from '../../../components/ui/FormSection'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { StepHeader } from '../../../components/ui/StepHeader'
import { Stepper } from '../../../components/ui/Stepper'
import { t } from '../../../design/tokens'
import {
  CAT_FINANCEIRA_OPTS,
  CATEGORIAS,
  CLASSES,
  GRUPOS,
  NCM_OPTS,
  TIPO_PRODUTO_LABEL,
  UNIDADE_PRODUTO_OPTS,
  VARIEDADES,
  type Produto,
} from './produtos.types'

interface Props {
  produto: Produto
  onBack: () => void
  onEdit: () => void
}

type StepId = 1 | 2 | 3

const STEPS = [
  { id: 1, label: 'Identificação' },
  { id: 2, label: 'Estoque e unidades' },
  { id: 3, label: 'Financeiro e operação' },
]

const textById = <T extends { id: number; nome: string }>(items: T[], id: number | '') =>
  items.find(item => item.id === id)?.nome ?? 'Não informado'

const optionLabel = (options: { value: string; label: string }[], value: string) =>
  options.find(option => option.value === value)?.label ?? 'Não informado'

const yesNo = (value: boolean) => (
  <Badge label={value ? 'Sim' : 'Não'} variant={value ? 'success' : 'neutral'} />
)

const currency = (value: number | '') => value === ''
  ? 'Não informado'
  : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function ProdutoDetalhe({ produto, onBack, onEdit }: Props) {
  const [currentStep, setCurrentStep] = useState<StepId>(1)
  const ncmLabel = optionLabel(NCM_OPTS, produto.ncm)
  const primaryUnit = optionLabel(UNIDADE_PRODUTO_OPTS, produto.unidadePrimaria)
  const secondaryUnit = produto.unidadeSecundaria
    ? optionLabel(UNIDADE_PRODUTO_OPTS, produto.unidadeSecundaria)
    : 'Não utilizada'

  return (
    <PageContainer style={{ paddingBottom: t.space[0] }}>
      <PageCard
        header={
          <>
            <FormPageHeader
              title={produto.descricao}
              subtitle={`Produto ${produto.codigo} · ${textById(GRUPOS, produto.grupoId)}`}
              onBack={onBack}
              closeLabel="Voltar aos produtos"
              compact
              actions={
                <>
                  <Badge label={TIPO_PRODUTO_LABEL[produto.tipo]} variant="info" />
                  <Badge label={produto.ativo ? 'Ativo' : 'Inativo'} variant={produto.ativo ? 'success' : 'neutral'} />
                  <Button variant="primary" size="sm" icon={<Pencil size={t.icon.xs} />} onClick={onEdit}>
                    Editar
                  </Button>
                </>
              }
            />
            <Stepper
              steps={STEPS}
              current={currentStep}
              completed={[1, 2, 3]}
              onStepClick={step => setCurrentStep(step as StepId)}
            />
          </>
        }
        footer={
          <>
            <Button variant="secondary" icon={<ArrowLeft size={t.icon.xs} />} onClick={onBack}>
              Voltar aos produtos
            </Button>
            <Button variant="primary" icon={<Pencil size={t.icon.xs} />} onClick={onEdit}>
              Editar Produto
            </Button>
          </>
        }
      >
        {currentStep === 1 && (
          <>
            <StepHeader
              title="Identificação do produto"
              subtitle="Dados fiscais e classificação do produto."
            />
            <FormSection title="Dados essenciais">
              <DetailGrid
                columns={3}
                responsive
                items={[
                  { label: 'Código', value: produto.codigo, copyValue: produto.codigo },
                  { label: 'Tipo', value: TIPO_PRODUTO_LABEL[produto.tipo] },
                  { label: 'Status', value: <Badge label={produto.ativo ? 'Ativo' : 'Inativo'} variant={produto.ativo ? 'success' : 'neutral'} /> },
                  { label: 'Descrição', value: produto.descricao },
                  { label: 'NCM', value: ncmLabel },
                ]}
              />
            </FormSection>
            <FormSection title="Classificação">
              <DetailGrid
                columns={2}
                responsive
                items={[
                  { label: 'Grupo', value: textById(GRUPOS, produto.grupoId) },
                  { label: 'Categoria', value: textById(CATEGORIAS, produto.categoriaId) },
                  { label: 'Classe', value: textById(CLASSES, produto.classeId) },
                  { label: 'Variedade', value: textById(VARIEDADES, produto.variedadeId) },
                ]}
              />
            </FormSection>
          </>
        )}

        {currentStep === 2 && (
          <>
            <StepHeader
              title="Estoque e unidades"
              subtitle="Medição, conversão e controles operacionais."
            />
            <FormSection title="Unidades de medida">
              <DetailGrid
                columns={3}
                responsive
                items={[
                  { label: 'Unidade primária', value: primaryUnit },
                  { label: 'Unidade secundária', value: secondaryUnit },
                  { label: 'Fator de conversão', value: produto.fatorConversao || 'Não utilizado' },
                ]}
              />
            </FormSection>
            <FormSection title="Controle de estoque">
              <DetailGrid
                columns={2}
                responsive
                items={[
                  { label: 'Controla estoque', value: yesNo(produto.controlaEstoque) },
                  { label: 'Estoque mínimo', value: produto.estoqueMinimo || 'Não definido' },
                  { label: 'Controla lote', value: yesNo(produto.controlaLote) },
                  { label: 'Controla qualidade', value: yesNo(produto.controlaQualidade) },
                ]}
              />
            </FormSection>
          </>
        )}

        {currentStep === 3 && (
          <>
            <StepHeader
              title="Financeiro e operação"
              subtitle="Preços, integrações e informações complementares."
            />
            <FormSection title="Preços e financeiro">
              <DetailGrid
                columns={3}
                responsive
                items={[
                  { label: 'Preço médio', value: currency(produto.precoMedio) },
                  { label: 'Valor de referência', value: currency(produto.valorReferencia) },
                  { label: 'Categoria financeira', value: optionLabel(CAT_FINANCEIRA_OPTS, produto.catFinanceiraId) },
                ]}
              />
            </FormSection>
            <FormSection title="Disponibilidade e integrações">
              <DetailGrid
                columns={2}
                responsive
                items={[
                  { label: 'Apontamento agrícola', value: yesNo(produto.apontamento) },
                  { label: 'Adicionar ao inventário', value: yesNo(produto.adicionaInventario) },
                  { label: 'Emitir NFe', value: yesNo(produto.emitirNFe) },
                  { label: 'Produto ativo', value: yesNo(produto.ativo) },
                ]}
              />
            </FormSection>
            <FormSection title="Informações adicionais">
              <DetailGrid
                columns={2}
                responsive
                items={[
                  { label: 'Princípio ativo', value: produto.principioAtivo || 'Não informado' },
                  { label: 'Última compra', value: produto.dtUltCompra ? produto.dtUltCompra.split('-').reverse().join('/') : 'Sem compras registradas' },
                ]}
              />
            </FormSection>
          </>
        )}
      </PageCard>
    </PageContainer>
  )
}
