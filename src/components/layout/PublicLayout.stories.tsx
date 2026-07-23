import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../ui/Button'
import { FeedbackBanner } from '../ui/FeedbackBanner'
import { FormField } from '../ui/FormField'
import { SecretField } from '../ui/SecretField'
import { AuthCard } from './AuthCard'
import { PublicLayout } from './PublicLayout'
import type { SupportedLanguage } from './LanguageSwitcher'
import { t } from '../../design/tokens'

const meta = {
  title: 'GB CERNE/Layout/PublicLayout',
  component: PublicLayout,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PublicLayout>

export default meta
type Story = StoryObj<typeof meta>

function LoginExample() {
  const [language, setLanguage] = useState<SupportedLanguage>('pt-BR')
  return (
    <PublicLayout language={language} onLanguageChange={setLanguage}>
      <AuthCard title="Acesse sua conta" description="Use suas credenciais para continuar.">
        <form style={{ display: 'grid', gap: t.space[4] }}>
          <FeedbackBanner variant="info" title="Ambiente de demonstração" description="Os campos abaixo apresentam o contrato público reutilizável." />
          <FormField label="E-mail" type="email" autoFocus placeholder="nome@empresa.com.br" />
          <SecretField label="Senha" value="" onChange={() => undefined} />
          <Button type="submit" block>Entrar</Button>
        </form>
      </AuthCard>
    </PublicLayout>
  )
}

export const Autenticacao: Story = {
  args: {
    children: null,
    language: 'pt-BR',
    onLanguageChange: () => undefined,
  },
  render: () => <LoginExample />,
}
