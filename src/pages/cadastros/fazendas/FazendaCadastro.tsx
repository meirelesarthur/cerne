import React, { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Stepper } from '../../../components/ui/Stepper'
import { Step1Identificacao } from './steps/Step1Identificacao'
import { Step2Documentacao } from './steps/Step2Documentacao'
import { Step3Localizacao } from './steps/Step3Localizacao'
import { Step4Financeiro } from './steps/Step4Financeiro'
import { Step5Configuracoes } from './steps/Step5Configuracoes'
import { emptyFazendaForm } from './fazendas.types'
import type { FazendaFormData } from './fazendas.types'

interface FazendaCadastroProps {
  onBack: () => void
}

const STEPS = [
  { id: 1, label: 'Identificação' },
  { id: 2, label: 'Documentação' },
  { id: 3, label: 'Localização' },
  { id: 4, label: 'Financeiro' },
  { id: 5, label: 'Configurações' },
]

function validateStep(step: number, data: FazendaFormData): Record<string, string> {
  const errors: Record<string, string> = {}

  if (step === 1) {
    if (!data.nome || data.nome.trim().length < 3) {
      errors.nome = 'Nome deve ter pelo menos 3 caracteres'
    }
    const telefonedigits = data.telefone.replace(/\D/g, '')
    if (!data.telefone || telefonedigits.length < 10) {
      errors.telefone = 'Telefone deve ter pelo menos 10 dígitos'
    }
  }

  if (step === 2) {
    if (!data.tipoExploracao) {
      errors.tipoExploracao = 'Selecione o tipo de exploração'
    }
  }

  if (step === 3) {
    if (!data.pais) errors.pais = 'País é obrigatório'
    if (!data.cep) errors.cep = 'CEP é obrigatório'
    if (!data.cidade) errors.cidade = 'Cidade é obrigatória'
    if (!data.endereco) errors.endereco = 'Endereço é obrigatório'
    if (!data.bairro) errors.bairro = 'Bairro é obrigatório'
  }

  if (step === 4) {
    if (!data.areaTotal) errors.areaTotal = 'Área total é obrigatória'
    if (!data.valorHa) errors.valorHa = 'Valor por hectare é obrigatório'
    if (!data.taxaRemuneracao) errors.taxaRemuneracao = 'Taxa de remuneração é obrigatória'
  }

  return errors
}

export default function FazendaCadastro({ onBack }: FazendaCadastroProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [formData, setFormData] = useState<FazendaFormData>(emptyFazendaForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
        onBack()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess, onBack])

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
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowSuccess(true)
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
        return <Step1Identificacao data={formData} errors={errors} onChange={handleChange} />
      case 2:
        return <Step2Documentacao data={formData} errors={errors} onChange={handleChange} />
      case 3:
        return <Step3Localizacao data={formData} errors={errors} onChange={handleChange} />
      case 4:
        return (
          <Step4Financeiro
            data={formData}
            errors={errors}
            onChange={handleChange}
            onBoolChange={handleBoolChange}
          />
        )
      case 5:
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: "'Outfit', sans-serif",
        padding: '24px 28px 0 28px',
        boxSizing: 'border-box',
      }}
    >
      {/* Success Toast */}
      {showSuccess && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: '#059669',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Outfit', sans-serif",
            boxShadow: '0 4px 16px rgba(5,150,105,0.3)',
          }}
        >
          Fazenda cadastrada com sucesso!
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Nova Fazenda"
        description="Preencha os dados para cadastrar uma nova fazenda"
        actions={
          <button
            type="button"
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'white',
              border: '1.5px solid #e5e5e5',
              borderRadius: 8,
              padding: '0 14px',
              height: 36,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'Outfit', sans-serif",
              color: '#1a1a1a',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} />
            Voltar
          </button>
        }
      />

      {/* Stepper */}
      <Stepper
        steps={STEPS}
        current={currentStep}
        completed={completedSteps}
        onStepClick={handleStepClick}
      />

      {/* Step Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: 'white',
          borderRadius: 12,
          padding: 24,
          marginTop: 8,
          boxSizing: 'border-box',
        }}
      >
        {renderStep()}
      </div>

      {/* Footer */}
      <div
        style={{
          flexShrink: 0,
          borderTop: '1px solid #f0f0f0',
          padding: '12px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: '#9ca3af',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Etapa {currentStep} de 5
        </span>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 36,
              padding: '0 16px',
              background: 'white',
              border: '1.5px solid #e5e5e5',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'Outfit', sans-serif",
              color: currentStep === 1 ? '#d1d5db' : '#1a1a1a',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 1 ? 0.6 : 1,
            }}
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={handleNext}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 36,
              padding: '0 20px',
              background: '#059669',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {currentStep === 5 ? 'Salvar' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  )
}
