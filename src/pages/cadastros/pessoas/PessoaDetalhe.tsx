import { useState, useMemo } from 'react'
import { Pencil } from 'lucide-react'
import { Button }         from '../../../components/ui/Button'
import { PageContainer }  from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { Tabs }           from '../../../components/ui/Tabs'
import { t }              from '../../../design/tokens'
import { ROLES, ROLE_LABEL, type Pessoa, type RoleKey } from './pessoas.types'
import { StepDadosBasicos } from './steps/StepDadosBasicos'
import { StepEndereco }     from './steps/StepEndereco'
import { StepProprietario } from './steps/StepProprietario'
import { StepFuncionario }  from './steps/StepFuncionario'
import { StepFornecedor }   from './steps/StepFornecedor'
import { StepCliente }      from './steps/StepCliente'
import { StepUsuario }      from './steps/StepUsuario'

type TabKey = 'basico' | 'endereco' | RoleKey

const TAB_LABEL: Record<TabKey, string> = {
  basico:      'Dados Básicos',
  endereco:    'Endereço',
  proprietary: ROLE_LABEL.proprietary,
  employee:    ROLE_LABEL.employee,
  provider:    ROLE_LABEL.provider,
  client:      ROLE_LABEL.client,
  user:        ROLE_LABEL.user,
}

/** Abas dinâmicas: fixas (Dados Básicos, Endereço) + uma por papel ativo. */
function computeTabs(p: Pessoa): TabKey[] {
  return ['basico', 'endereco', ...ROLES.filter((r) => p[r.key].enabled).map((r) => r.key)]
}

interface Props {
  pessoa: Pessoa
  onBack: () => void
  onEdit: () => void
}

// Visualização é somente-leitura — os steps recebem `disabled` e updaters vazios.
const noop = (..._args: unknown[]) => {}

export default function PessoaDetalhe({ pessoa, onBack, onEdit }: Props) {
  const tabs = useMemo(() => computeTabs(pessoa), [pessoa])
  const [activeTab, setActiveTab] = useState<TabKey>('basico')

  const stepProps = { form: pessoa, errors: {}, set: noop, setRole: noop, disabled: true }

  const renderTab = () => {
    switch (activeTab) {
      case 'basico':      return <StepDadosBasicos {...stepProps} onToggleRole={noop} />
      case 'endereco':    return <StepEndereco {...stepProps} />
      case 'proprietary': return <StepProprietario {...stepProps} />
      case 'employee':    return <StepFuncionario {...stepProps} />
      case 'provider':    return <StepFornecedor {...stepProps} />
      case 'client':      return <StepCliente {...stepProps} />
      case 'user':        return <StepUsuario {...stepProps} isEdit />
      default:            return null
    }
  }

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
          title="Detalhes da Pessoa"
          subtitle={`${pessoa.name} — ${pessoa.nickname}`}
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        <Tabs
          items={tabs.map((k) => ({ id: k, label: TAB_LABEL[k] }))}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as TabKey)}
          label="Seções da pessoa"
          variant="outline"
        />

        <div style={{ padding: '32px 24px 64px' }}>
          {renderTab()}
        </div>
      </PageCard>
    </PageContainer>
  )
}
