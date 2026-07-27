import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ToastContainer, useToast, type ToastItem } from './Toast'
import { Button } from './Button'
import { t } from '../../design/tokens'

const meta: Meta<typeof ToastContainer> = {
  title: 'GB CERNE/Toast',
  component: ToastContainer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '`ToastContainer` renderiza a pilha de notificações produzidas pelo hook `useToast`. Toasts de erro exigem dismiss manual (não fecham automaticamente); os demais fecham após a duração informada, pausando no hover/foco.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ToastContainer>

/** Pilha estática — sucesso, erro, aviso e informação lado a lado. */
export const Variantes: Story = {
  render: () => {
    const toasts: ToastItem[] = [
      { id: 1, type: 'success', message: 'Safra salva com sucesso' },
      { id: 2, type: 'error', message: 'Erro ao salvar: verifique sua conexão e tente novamente' },
      { id: 3, type: 'warning', message: 'Estoque abaixo do mínimo recomendado' },
      { id: 4, type: 'info', message: 'Sincronização concluída' },
    ]
    return (
      <div style={{ position: 'relative', width: 400, height: 260 }}>
        <ToastContainer toasts={toasts} onDismiss={() => {}} />
      </div>
    )
  },
}

/** Toast com ação (ex.: "Desfazer") — mostra a barra de progresso do auto-close. */
export const ComAcao: Story = {
  name: 'Com ação (Desfazer)',
  render: () => {
    const toasts: ToastItem[] = [
      {
        id: 1,
        type: 'success',
        message: 'Fazenda excluída',
        action: { label: 'Desfazer', onClick: () => {} },
      },
    ]
    return (
      <div style={{ position: 'relative', width: 320, height: 120 }}>
        <ToastContainer toasts={toasts} onDismiss={() => {}} />
      </div>
    )
  },
}

/** Demonstração interativa via `useToast` — cada botão dispara uma variante. */
export const Interativo: Story = {
  name: 'Interativo (via useToast)',
  render: () => {
    const { toasts, show, dismiss } = useToast()
    const [count, setCount] = useState(0)
    return (
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: t.space[2], width: 280 }}>
        <Button variant="primary" onClick={() => show('Safra salva com sucesso', 'success')}>Disparar sucesso</Button>
        <Button variant="destructive" onClick={() => show('Erro ao salvar: verifique sua conexão e tente novamente', 'error')}>Disparar erro</Button>
        <Button variant="secondary" onClick={() => show('Estoque abaixo do mínimo recomendado', 'warning')}>Disparar aviso</Button>
        <Button
          variant="ghost"
          onClick={() => { setCount((c) => c + 1); show(`Item ${count + 1} removido`, { type: 'info', action: { label: 'Desfazer', onClick: () => {} } }) }}
        >
          Disparar com ação
        </Button>
        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </div>
    )
  },
}
