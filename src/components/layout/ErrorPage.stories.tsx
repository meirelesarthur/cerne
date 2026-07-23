import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../ui/Button'
import { ErrorPage } from './ErrorPage'

const meta = {
  title: 'GB CERNE/Layout/ErrorPage',
  component: ErrorPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ErrorPage>

export default meta
type Story = StoryObj<typeof meta>

export const NaoEncontrado: Story = {
  args: {
    status: '404',
    title: 'Página não encontrada',
    description: 'O endereço pode ter mudado ou você não tem acesso a esta funcionalidade.',
    onAction: () => undefined,
    secondaryAction: <Button variant="secondary">Falar com o suporte</Button>,
  },
}
