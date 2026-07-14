import React, { useState } from 'react'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { StepFooter } from '../../../components/ui/StepFooter'
import { Stepper } from '../../../components/ui/Stepper'
import { t } from '../../../design/tokens'
import { Step1Identificacao } from './steps/Step1Identificacao'
import { Step2Documentacao } from './steps/Step2Documentacao'
import { Step3Mapa } from './steps/Step3Mapa'
import { Step4Endereco } from './steps/Step4Endereco'
import { Step4Financeiro } from './steps/Step4Financeiro'
import { Step5Configuracoes } from './steps/Step5Configuracoes'
import { emptyFazendaForm, detalheToForm } from './fazendas.types'
import type { FazendaFormData, FazendaDetalheData } from './fazendas.types'
import { useToast, ToastContainer } from '../../../components/ui/Toast'

interface FazendaCadastroProps {
  onBack: () => void
  /** Fazenda existente — quando presente, o formulário abre em modo edição com os dados carregados. */
  fazenda?: FazendaDetalheData
}

const STEPS = [
  { id: 1, label: 'Demarcação' },
  { id: 2, label: 'Endereço' },
  { id: 3, label: 'Identificação' },
  { id: 4, label: 'Documentação' },
  { id: 5, label: 'Financeiro' },
  { id: 6, label: 'Configurações' },
]

function validateStep(step: number, data: FazendaFormData): Record<string, string> {
  const errors: Record<string, string> = {}

  // Step 1 (Demarcação) is optional — user can advance without drawing

  if (step === 2) {
    if (!data.pais) errors.pais = 'País é obrigatório'
    if (!data.cep) errors.cep = 'CEP é obrigatório'
    if (!data.cidade) errors.cidade = 'Cidade é obrigatória'
    if (!data.endereco) errors.endereco = 'Endereço é obrigatório'
    if (!data.bairro) errors.bairro = 'Bairro é obrigatório'
  }

  if (step === 3) {
    if (!data.nome || data.nome.trim().length < 3) {
      errors.nome = 'Nome deve ter pelo menos 3 caracteres'
    }
    const telefonedigits = data.telefone.replace(/\D/g, '')
    if (!data.telefone || telefonedigits.length < 10) {
      errors.telefone = 'Telefone deve ter pelo menos 10 dígitos'
    }
  }

  if (step === 4) {
    if (!data.tipoExploracao) {
      errors.tipoExploracao = 'Selecione o tipo de exploração'
    }
  }

  if (step === 5) {
    if (!data.areaTotal) errors.areaTotal = 'Área total é obrigatória'
    if (!data.valorHa) errors.valorHa = 'Valor por hectare é obrigatório'
    if (!data.taxaRemuneracao) errors.taxaRemuneracao = 'Taxa de remuneração é obrigatória'
  }

  return errors
}

export default function FazendaCadastro({ onBack, fazenda }: FazendaCadastroProps) {
  const isEdit = fazenda !== undefined
  const [currentStep, setCurrentStep] = useState(1)
  // Em edição, todos os steps já são navegáveis (dados existentes)
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    isEdit ? STEPS.map((s) => s.id) : []
  )
  const [formData, setFormData] = useState<FazendaFormData>(
    () => (fazenda ? detalheToForm(fazenda) : emptyFazendaForm)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toasts, show, dismiss } = useToast()

  const handleChange = (field: keyof FazendaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field as string]
        return next
      })
    }
  }

  const handleBoolChange = (field: keyof FazendaFormData, value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCentrosCustoChange = (ids: string[]) => {
    setFormData((prev) => ({ ...prev, centrosCusto: ids }))
  }

  const handleNext = () => {
    const stepErrors = validateStep(currentStep, formData)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep])
    }
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    } else {
      show(isEdit ? 'Fazenda atualizada com sucesso!' : 'Fazenda cadastrada com sucesso!', 'success', 3000)
      setTimeout(onBack, 3200)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setErrors({})
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (id: number) => {
    if (completedSteps.includes(id)) {
      setErrors({})
      setCurrentStep(id)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step3Mapa data={formData} errors={errors} onChange={handleChange} />
      case 2:
        return <Step4Endereco data={formData} errors={errors} onChange={handleChange} />
      case 3:
        return <Step1Identificacao data={formData} errors={errors} onChange={handleChange} />
      case 4:
        return <Step2Documentacao data={formData} errors={errors} onChange={handleChange} />
      case 5:
        return (
          <Step4Financeiro
            data={formData}
            errors={errors}
            onChange={handleChange}
            onBoolChange={handleBoolChange}
          />
        )
      case 6:
        return (
          <Step5Configuracoes
            data={formData}
            errors={errors}
            onChange={handleChange}
            onCentrosCustoChange={handleCentrosCustoChange}
          />
        )
      default:
        return null
    }
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      <PageCard
        footer={
          <StepFooter
            currentStep={currentStep}
            totalSteps={6}
            onBack={handleBack}
            onNext={handleNext}
          />
        }
        footerBare
      >
        <FormPageHeader
          title={isEdit ? 'Editar Fazenda' : 'Nova Fazenda'}
          subtitle={isEdit ? `Atualize os dados de ${fazenda.nome}` : 'Preencha os dados da fazenda'}
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        <Stepper
          steps={STEPS}
          current={currentStep}
          completed={completedSteps}
          onStepClick={handleStepClick}
        />

        {/* Conteúdo do step */}
        <div style={{ padding: '40px 24px 80px' }}>
          {renderStep()}
        </div>
      </PageCard>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
