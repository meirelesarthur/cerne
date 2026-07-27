import { useEffect, useMemo, useRef, useState } from 'react'
import { Boxes, ClipboardCheck, PackageCheck, ReceiptText, Save, ShieldCheck } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { FormField } from '../../../components/ui/FormField'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormSection } from '../../../components/ui/FormSection'
import { FormSelect } from '../../../components/ui/FormSelect'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { StepFooter } from '../../../components/ui/StepFooter'
import { StepHeader } from '../../../components/ui/StepHeader'
import { Stepper } from '../../../components/ui/Stepper'
import { ToggleField } from '../../../components/ui/ToggleField'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { focusFirstError } from '../../../hooks/focusFirstError'
import { t } from '../../../design/tokens'
import {
  CAT_FINANCEIRA_OPTS,
  CATEGORIAS,
  CLASSES,
  GRUPOS,
  NCM_OPTS,
  TIPO_PRODUTO_LABEL,
  TIPO_PRODUTO_OPTS,
  UNIDADE_PRODUTO_OPTS,
  VARIEDADES,
  type Produto,
  type TipoProduto,
  type UnidadeProduto,
} from './produtos.types'

interface Props {
  initialData?: Produto
  onBack: () => void
  onSave: (produto: Produto) => void
}

type StepId = 1 | 2 | 3

const STEPS = [
  { id: 1, label: 'Identificação' },
  { id: 2, label: 'Estoque e unidades' },
  { id: 3, label: 'Financeiro e operação' },
]

const required = (value: unknown) => (!value && value !== 0 ? 'Campo obrigatório.' : undefined)

function validateDescricao(value: string): string | undefined {
  const normalized = value.trim()
  if (!normalized) return 'Informe a descrição do produto.'
  if (normalized.length < 2) return 'A descrição deve ter ao menos 2 caracteres.'
  if (normalized.length > 120) return 'A descrição deve ter no máximo 120 caracteres.'
}

function parseNumber(value: string): number | '' {
  if (!value.trim()) return ''
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : ''
}

export default function ProdutoForm({ initialData, onBack, onSave }: Props) {
  const isEdit = Boolean(initialData)
  const [currentStep, setCurrentStep] = useState<StepId>(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>(isEdit ? [1, 2, 3] : [])

  const [descricao, setDescricao] = useState(initialData?.descricao ?? '')
  const [ncm, setNcm] = useState(initialData?.ncm ?? '')
  const [tipo, setTipo] = useState<TipoProduto | ''>(initialData?.tipo ?? '')
  const [grupoId, setGrupoId] = useState<number | ''>(initialData?.grupoId ?? '')
  const [categoriaId, setCategoriaId] = useState<number | ''>(initialData?.categoriaId ?? '')
  const [classeId, setClasseId] = useState<number | ''>(initialData?.classeId ?? '')
  const [variedadeId, setVariedadeId] = useState<number | ''>(initialData?.variedadeId ?? '')
  const [unidadePrimaria, setUnidadePrimaria] = useState<UnidadeProduto | ''>(initialData?.unidadePrimaria ?? '')
  const [unidadeSecundaria, setUnidadeSecundaria] = useState<UnidadeProduto | ''>(initialData?.unidadeSecundaria ?? '')
  const [fatorConversao, setFatorConversao] = useState(initialData?.fatorConversao?.toString() ?? '')
  const [controlaEstoque, setControlaEstoque] = useState(initialData?.controlaEstoque ?? true)
  const [estoqueMinimo, setEstoqueMinimo] = useState(initialData?.estoqueMinimo?.toString() ?? '')
  const [controlaLote, setControlaLote] = useState(initialData?.controlaLote ?? false)
  const [controlaQualidade, setControlaQualidade] = useState(initialData?.controlaQualidade ?? false)
  const [valorReferencia, setValorReferencia] = useState(initialData?.valorReferencia?.toString() ?? '')
  const [catFinanceiraId, setCatFinanceiraId] = useState(initialData?.catFinanceiraId ?? '')
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true)
  const [apontamento, setApontamento] = useState(initialData?.apontamento ?? false)
  const [adicionaInventario, setAdicionaInventario] = useState(initialData?.adicionaInventario ?? true)
  const [emitirNFe, setEmitirNFe] = useState(initialData?.emitirNFe ?? false)
  const [principioAtivo, setPrincipioAtivo] = useState(initialData?.principioAtivo ?? '')
  const [touched, setTouched] = useState({
    descricao: false,
    ncm: false,
    tipo: false,
    grupoId: false,
    categoriaId: false,
    classeId: false,
    unidadePrimaria: false,
    catFinanceiraId: false,
  })
  const [submitting, setSubmitting] = useState(false)

  const guard = useUnsavedChangesGuard(onBack)
  const formFingerprint = JSON.stringify([
    descricao, ncm, tipo, grupoId, categoriaId, classeId, variedadeId,
    unidadePrimaria, unidadeSecundaria, fatorConversao, controlaEstoque,
    estoqueMinimo, controlaLote, controlaQualidade, valorReferencia,
    catFinanceiraId, ativo, apontamento, adicionaInventario, emitirNFe,
    principioAtivo,
  ])
  const initialFingerprint = useRef(formFingerprint)

  useEffect(() => {
    guard.setIsDirty(formFingerprint !== initialFingerprint.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formFingerprint])

  const categoriaOptions = useMemo(
    () => grupoId ? CATEGORIAS.filter(item => item.grupoId === Number(grupoId)) : [],
    [grupoId],
  )
  const classeOptions = useMemo(
    () => categoriaId ? CLASSES.filter(item => item.categoriaId === Number(categoriaId)) : [],
    [categoriaId],
  )
  const variedadeOptions = useMemo(
    () => classeId ? VARIEDADES.filter(item => item.classeId === Number(classeId)) : [],
    [classeId],
  )

  const errors = {
    descricao: touched.descricao ? validateDescricao(descricao) : undefined,
    ncm: touched.ncm ? required(ncm) : undefined,
    tipo: touched.tipo ? required(tipo) : undefined,
    grupoId: touched.grupoId ? required(grupoId) : undefined,
    categoriaId: touched.categoriaId ? required(categoriaId) : undefined,
    classeId: touched.classeId ? required(classeId) : undefined,
    unidadePrimaria: touched.unidadePrimaria ? required(unidadePrimaria) : undefined,
    catFinanceiraId: touched.catFinanceiraId ? required(catFinanceiraId) : undefined,
  }

  const isStepValid = (step: StepId) => {
    if (step === 1) {
      return !validateDescricao(descricao) && !!ncm && !!tipo && !!grupoId && !!categoriaId && !!classeId
    }
    if (step === 2) return !!unidadePrimaria
    return !!catFinanceiraId
  }

  const touchStep = (step: StepId) => {
    if (step === 1) {
      setTouched(previous => ({
        ...previous,
        descricao: true,
        ncm: true,
        tipo: true,
        grupoId: true,
        categoriaId: true,
        classeId: true,
      }))
    } else if (step === 2) {
      setTouched(previous => ({ ...previous, unidadePrimaria: true }))
    } else {
      setTouched(previous => ({ ...previous, catFinanceiraId: true }))
    }
  }

  const goToFirstInvalidStep = () => {
    const invalidStep = ([1, 2, 3] as StepId[]).find(step => !isStepValid(step))
    if (!invalidStep) return false
    touchStep(invalidStep)
    setCurrentStep(invalidStep)
    focusFirstError()
    return true
  }

  const handleNext = () => {
    touchStep(currentStep)
    if (!isStepValid(currentStep)) {
      focusFirstError()
      return
    }

    if (currentStep < 3) {
      setCompletedSteps(previous => Array.from(new Set([...previous, currentStep])))
      setCurrentStep((currentStep + 1) as StepId)
      return
    }

    if (goToFirstInvalidStep()) return

    setSubmitting(true)
    onSave({
      id: initialData?.id ?? 0,
      codigo: initialData?.codigo ?? '',
      descricao: descricao.trim(),
      ncm,
      unidadePrimaria: unidadePrimaria as UnidadeProduto,
      unidadeSecundaria: unidadeSecundaria || '',
      fatorConversao: parseNumber(fatorConversao),
      grupoId: Number(grupoId),
      categoriaId: Number(categoriaId),
      classeId: Number(classeId),
      variedadeId: variedadeId ? Number(variedadeId) : '',
      controlaEstoque,
      estoqueMinimo: parseNumber(estoqueMinimo),
      controlaLote,
      controlaQualidade,
      precoMedio: initialData?.precoMedio ?? 0,
      valorReferencia: parseNumber(valorReferencia),
      catFinanceiraId,
      tipo: tipo as TipoProduto,
      ativo,
      apontamento,
      principioAtivo: principioAtivo.trim(),
      adicionaInventario,
      emitirNFe,
      dtUltCompra: initialData?.dtUltCompra ?? '',
    })
  }

  const handleBack = () => {
    if (currentStep === 1) guard.guardedBack()
    else setCurrentStep((currentStep - 1) as StepId)
  }

  const handleGrupo = (value: string) => {
    setGrupoId(value ? Number(value) : '')
    setCategoriaId('')
    setClasseId('')
    setVariedadeId('')
    setTouched(previous => ({ ...previous, grupoId: true }))
  }

  const handleCategoria = (value: string) => {
    setCategoriaId(value ? Number(value) : '')
    setClasseId('')
    setVariedadeId('')
    setTouched(previous => ({ ...previous, categoriaId: true }))
  }

  const handleClasse = (value: string) => {
    setClasseId(value ? Number(value) : '')
    setVariedadeId('')
    setTouched(previous => ({ ...previous, classeId: true }))
  }

  const unitOptions = [{ value: '', label: 'Selecione...' }, ...UNIDADE_PRODUTO_OPTS]
  const priceDisplay = initialData?.precoMedio
    ? initialData.precoMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'Ainda não calculado'
  const lastPurchaseDisplay = initialData?.dtUltCompra
    ? initialData.dtUltCompra.split('-').reverse().join('/')
    : 'Sem compras registradas'

  return (
    <PageContainer style={{ paddingBottom: t.space[0] }}>
      <PageCard
        header={
          <>
            <FormPageHeader
              title={isEdit ? 'Editar Produto' : 'Novo Produto'}
              subtitle={isEdit
                ? `${initialData?.codigo} — ${initialData?.descricao}`
                : 'Cadastre as informações essenciais em 3 etapas.'}
              onBack={guard.guardedBack}
              compact
              actions={
                isEdit ? (
                  <>
                    <Badge label={TIPO_PRODUTO_LABEL[initialData!.tipo]} variant="info" />
                    <Badge label={ativo ? 'Ativo' : 'Inativo'} variant={ativo ? 'success' : 'neutral'} />
                  </>
                ) : undefined
              }
            />
            <Stepper
              steps={STEPS}
              current={currentStep}
              completed={completedSteps}
              onStepClick={step => setCurrentStep(step as StepId)}
            />
          </>
        }
        footerBare
        footer={
          <StepFooter
            currentStep={currentStep}
            totalSteps={STEPS.length}
            onBack={handleBack}
            onNext={handleNext}
            backLabel={currentStep === 1 ? 'Cancelar' : 'Voltar'}
            backDisabled={false}
            nextLabel={currentStep === 1
              ? 'Ir para estoque'
              : currentStep === 2
                ? 'Ir para financeiro'
                : 'Salvar Produto'}
            nextLoading={submitting}
          />
        }
      >
        {currentStep === 1 && (
          <>
            <StepHeader
              title="Identificação do produto"
              subtitle="Defina os dados fiscais e a classificação do produto."
            />
            <FormSection title="Dados essenciais" subtitle="Informações usadas para localizar e reconhecer o produto." columns={2} responsive>
              <FormField
                label="Código"
                value={initialData?.codigo ?? 'Gerado ao salvar'}
                readOnly
                name="codigo"
              />
              <FormSelect
                label="Tipo"
                required
                value={tipo}
                onChange={event => {
                  setTipo(event.target.value as TipoProduto | '')
                  setTouched(previous => ({ ...previous, tipo: true }))
                }}
                onBlur={() => setTouched(previous => ({ ...previous, tipo: true }))}
                options={[{ value: '', label: 'Selecione...' }, ...TIPO_PRODUTO_OPTS]}
                error={errors.tipo}
                disabled={submitting}
                name="tipo"
              />
              <FormField
                label="Descrição"
                required
                placeholder="Ex.: HERBICIDA GLIFOSATO 480 G/L"
                value={descricao}
                onChange={event => setDescricao(event.target.value)}
                onBlur={() => setTouched(previous => ({ ...previous, descricao: true }))}
                error={errors.descricao}
                status={errors.descricao ? 'err' : touched.descricao && !validateDescricao(descricao) ? 'ok' : 'idle'}
                disabled={submitting}
                name="descricao"
              />
              <FormSelect
                label="NCM"
                required
                value={ncm}
                onChange={event => {
                  setNcm(event.target.value)
                  setTouched(previous => ({ ...previous, ncm: true }))
                }}
                onBlur={() => setTouched(previous => ({ ...previous, ncm: true }))}
                options={[{ value: '', label: 'Selecione o NCM...' }, ...NCM_OPTS]}
                error={errors.ncm}
                disabled={submitting}
                name="ncm"
              />
            </FormSection>
            <FormSection title="Classificação" subtitle="A sequência grupo, categoria e classe organiza buscas e relatórios." columns={2} responsive>
              <FormSelect
                label="Grupo"
                required
                value={String(grupoId)}
                onChange={event => handleGrupo(event.target.value)}
                onBlur={() => setTouched(previous => ({ ...previous, grupoId: true }))}
                options={[{ value: '', label: 'Selecione...' }, ...GRUPOS.map(item => ({ value: String(item.id), label: item.nome }))]}
                error={errors.grupoId}
                disabled={submitting}
                name="grupo"
              />
              <FormSelect
                label="Categoria"
                required
                value={String(categoriaId)}
                onChange={event => handleCategoria(event.target.value)}
                onBlur={() => setTouched(previous => ({ ...previous, categoriaId: true }))}
                options={[
                  { value: '', label: grupoId ? 'Selecione...' : 'Selecione um grupo primeiro' },
                  ...categoriaOptions.map(item => ({ value: String(item.id), label: item.nome })),
                ]}
                error={errors.categoriaId}
                disabled={submitting || !grupoId}
                name="categoria"
              />
              <FormSelect
                label="Classe"
                required
                value={String(classeId)}
                onChange={event => handleClasse(event.target.value)}
                onBlur={() => setTouched(previous => ({ ...previous, classeId: true }))}
                options={[
                  { value: '', label: categoriaId ? 'Selecione...' : 'Selecione uma categoria primeiro' },
                  ...classeOptions.map(item => ({ value: String(item.id), label: item.nome })),
                ]}
                error={errors.classeId}
                disabled={submitting || !categoriaId}
                name="classe"
              />
              <FormSelect
                label="Variedade"
                hint="Opcional"
                value={String(variedadeId)}
                onChange={event => setVariedadeId(event.target.value ? Number(event.target.value) : '')}
                options={[
                  { value: '', label: variedadeOptions.length ? 'Nenhuma' : 'Não se aplica' },
                  ...variedadeOptions.map(item => ({ value: String(item.id), label: item.nome })),
                ]}
                disabled={submitting || !variedadeOptions.length}
                name="variedade"
              />
            </FormSection>
          </>
        )}

        {currentStep === 2 && (
          <>
            <StepHeader
              title="Estoque e unidades"
              subtitle="Configure como o produto é medido, convertido e controlado."
            />
            <FormSection title="Unidades de medida" subtitle="A unidade primária será usada em movimentações e saldos." columns={3} responsive>
              <FormSelect
                label="Unidade primária"
                required
                value={unidadePrimaria}
                onChange={event => {
                  setUnidadePrimaria(event.target.value as UnidadeProduto | '')
                  setTouched(previous => ({ ...previous, unidadePrimaria: true }))
                }}
                onBlur={() => setTouched(previous => ({ ...previous, unidadePrimaria: true }))}
                options={unitOptions}
                error={errors.unidadePrimaria}
                disabled={submitting}
                name="unidadePrimaria"
              />
              <FormSelect
                label="Unidade secundária"
                hint="Opcional"
                value={unidadeSecundaria}
                onChange={event => {
                  setUnidadeSecundaria(event.target.value as UnidadeProduto | '')
                  if (!event.target.value) setFatorConversao('')
                }}
                options={unitOptions}
                disabled={submitting}
                name="unidadeSecundaria"
              />
              <FormField
                label="Fator de conversão"
                hint="Quantidade na unidade primária"
                placeholder="0"
                value={fatorConversao}
                onChange={event => setFatorConversao(event.target.value)}
                disabled={submitting || !unidadeSecundaria}
                inputMode="decimal"
                name="fatorConversao"
              />
            </FormSection>
            <FormSection title="Controle de estoque" subtitle="Ative somente os controles necessários para este produto." columns={2} responsive>
              <ToggleField
                checked={controlaEstoque}
                onChange={setControlaEstoque}
                label="Controla estoque"
                description="Acompanha entradas, saídas e saldo disponível."
                disabled={submitting}
                icon={<Boxes size={t.icon.md} />}
              />
              <FormField
                label="Estoque mínimo"
                hint="Quantidade que dispara o alerta"
                placeholder="0"
                value={estoqueMinimo}
                onChange={event => setEstoqueMinimo(event.target.value)}
                disabled={submitting || !controlaEstoque}
                inputMode="decimal"
                name="estoqueMinimo"
              />
              <ToggleField
                checked={controlaLote}
                onChange={setControlaLote}
                label="Controla lote"
                description="Rastreia lotes nas entradas e saídas."
                disabled={submitting}
                icon={<PackageCheck size={t.icon.md} />}
              />
              <ToggleField
                checked={controlaQualidade}
                onChange={setControlaQualidade}
                label="Controla qualidade"
                description="Exige análise antes de liberar o uso."
                disabled={submitting}
                icon={<ShieldCheck size={t.icon.md} />}
              />
            </FormSection>
          </>
        )}

        {currentStep === 3 && (
          <>
            <StepHeader
              title="Financeiro e operação"
              subtitle="Conclua o cadastro com preços, integrações e regras de uso."
            />
            <FormSection title="Preços e financeiro" subtitle="Vincule o produto à classificação financeira utilizada nos lançamentos." columns={3} responsive>
              <FormField label="Preço médio" value={priceDisplay} readOnly name="precoMedio" />
              <FormField
                label="Valor de referência"
                hint="Preço base de compra"
                placeholder="0,00"
                value={valorReferencia}
                onChange={event => setValorReferencia(event.target.value)}
                disabled={submitting}
                inputMode="decimal"
                name="valorReferencia"
              />
              <FormSelect
                label="Categoria financeira"
                required
                value={catFinanceiraId}
                onChange={event => {
                  setCatFinanceiraId(event.target.value)
                  setTouched(previous => ({ ...previous, catFinanceiraId: true }))
                }}
                onBlur={() => setTouched(previous => ({ ...previous, catFinanceiraId: true }))}
                options={[{ value: '', label: 'Selecione...' }, ...CAT_FINANCEIRA_OPTS]}
                error={errors.catFinanceiraId}
                disabled={submitting}
                name="categoriaFinanceira"
              />
            </FormSection>
            <FormSection title="Disponibilidade e integrações" subtitle="Defina onde o produto poderá ser utilizado no sistema." columns={2} responsive>
              <ToggleField
                checked={ativo}
                onChange={setAtivo}
                label="Produto ativo"
                description={ativo ? 'Disponível para uso no sistema.' : 'Indisponível para novos lançamentos.'}
                disabled={submitting}
                icon={<ClipboardCheck size={t.icon.md} />}
              />
              <ToggleField
                checked={apontamento}
                onChange={setApontamento}
                label="Apontamento agrícola"
                description="Permite usar o produto em apontamentos."
                disabled={submitting}
                icon={<ReceiptText size={t.icon.md} />}
              />
              <ToggleField
                checked={adicionaInventario}
                onChange={setAdicionaInventario}
                label="Adicionar ao inventário"
                description="Inclui o produto no inventário de ativos."
                disabled={submitting}
                icon={<Boxes size={t.icon.md} />}
              />
              <ToggleField
                checked={emitirNFe}
                onChange={setEmitirNFe}
                label="Emitir NFe"
                description="Habilita a emissão de nota fiscal na saída."
                disabled={submitting}
                icon={<ReceiptText size={t.icon.md} />}
              />
            </FormSection>
            <FormSection title="Informações adicionais" columns={2} responsive>
              <FormField
                label="Princípio ativo"
                hint="Aplicável a defensivos agrícolas"
                placeholder="Ex.: Glifosato"
                value={principioAtivo}
                onChange={event => setPrincipioAtivo(event.target.value)}
                disabled={submitting}
                name="principioAtivo"
              />
              <FormField label="Última compra" value={lastPurchaseDisplay} readOnly name="ultimaCompra" />
            </FormSection>
          </>
        )}
      </PageCard>

      <ConfirmDialog
        open={guard.showExitModal}
        title="Alterações não salvas"
        message="Você tem alterações não salvas. Deseja sair sem salvar?"
        tone="destructive"
        confirmLabel="Sair sem salvar"
        cancelLabel="Ficar"
        onConfirm={guard.confirmExit}
        onCancel={guard.cancelExit}
      />
    </PageContainer>
  )
}
