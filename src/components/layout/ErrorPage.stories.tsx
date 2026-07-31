import type { Meta, StoryObj } from '@storybook/react-vite'
import { ErrorPage } from './ErrorPage'

const meta = {
  title: 'GB CERNE/Layout/ErrorPage',
  component: ErrorPage,
  parameters: { layout: 'fullscreen' },
  args: {
    onBack: () => undefined,
    onHome: () => undefined,
    onRetry: () => undefined,
  },
} satisfies Meta<typeof ErrorPage>

export default meta
type Story = StoryObj<typeof meta>

const RETORNO_404 = `{
  "timestamp": "2026-07-31T14:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "O cliente com o ID 999 não foi encontrado.",
  "path": "/api/v1/clientes/999"
}`

/** Variação simples — sem retorno do servidor para exibir. */
export const Simples: Story = {
  args: { status: '404' },
}

/** Variação com retorno — corpo devolvido pelo servidor em bloco copiável. */
export const ComRetorno: Story = {
  args: { status: '404', payload: RETORNO_404 },
}

/** Qualquer status HTTP reaproveita o mesmo padrão; a descrição vem de `errorDescriptions`. */
export const ErroDeServidor: Story = {
  args: {
    status: '500',
    payload: `{
  "timestamp": "2026-07-31T14:31:12Z",
  "status": 500,
  "error": "Internal Server Error",
  "trace": "org.springframework.dao.DataIntegrityViolationException: could not execute statement",
  "path": "/api/v1/safras"
}`,
  },
}

/** Sem permissão — só a ação de voltar ao início faz sentido. */
export const SemPermissao: Story = {
  args: { status: '403', advice: null, onRetry: undefined },
}

/** Indisponibilidade não-HTTP (apelido de status). */
export const Offline: Story = {
  args: { status: 'Offline', onHome: undefined },
}
