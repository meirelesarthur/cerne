import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyState } from './EmptyState'
import { ThemeProvider } from '../../context/ThemeContext'

const meta: Meta<typeof EmptyState> = {
  title: 'GB CERNE/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Estado vazio orientado à ação. Variantes: `empty` (lista vazia), `search` (busca sem resultado) e `error` (falha de carga, com botão "Tentar novamente" via `onRetry`). Usa o `Button` do kit para as ações e expõe `role="alert"`/`aria-live` no erro.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['empty', 'search', 'error'] },
  },
}

export default meta
type Story = StoryObj<typeof EmptyState>

export const Vazio: Story = {
  args: {
    variant: 'empty',
    description: 'Cadastre a primeira fazenda para começar.',
    action: { label: 'Cadastrar fazenda', onClick: () => {} },
  },
}

export const BuscaSemResultado: Story = {
  args: {
    variant: 'search',
    description: 'Tente outros termos ou limpe os filtros aplicados.',
    action: { label: 'Limpar filtros', onClick: () => {} },
  },
}

export const Erro: Story = {
  args: {
    variant: 'error',
    description: 'Verifique sua conexão e tente novamente.',
    onRetry: () => {},
  },
}

export const ErroComAcaoAlternativa: Story = {
  args: {
    variant: 'error',
    description: 'Não foi possível carregar as safras.',
    onRetry: () => {},
    action: { label: 'Voltar ao início', onClick: () => {} },
  },
}

export const ErroCarregando: Story = {
  args: {
    variant: 'error',
    description: 'Recarregando os dados…',
    onRetry: () => {},
    retrying: true,
  },
}

export const SemAcao: Story = {
  args: { variant: 'empty' },
}

export const GBMode: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultMode="gbMode">
        <div style={{ background: '#051008', padding: 32, borderRadius: 12, minWidth: 360 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  args: {
    variant: 'error',
    description: 'Verifique sua conexão e tente novamente.',
    onRetry: () => {},
  },
}
