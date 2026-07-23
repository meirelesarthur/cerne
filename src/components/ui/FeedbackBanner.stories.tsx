import type { Meta, StoryObj } from '@storybook/react-vite'
import { FeedbackBanner } from './FeedbackBanner'

const meta = {
  title: 'GB CERNE/FeedbackBanner',
  component: FeedbackBanner,
} satisfies Meta<typeof FeedbackBanner>

export default meta
type Story = StoryObj<typeof meta>

export const ErroRecuperavel: Story = {
  args: {
    variant: 'error',
    title: 'Não foi possível testar a conexão',
    description: 'Confira o token e tente novamente.',
    action: { label: 'Tentar novamente', onClick: () => undefined },
  },
}
