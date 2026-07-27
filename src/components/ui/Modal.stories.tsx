import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Modal } from './Modal'
import { Button } from './Button'
import { FormField } from './FormField'
import { t } from '../../design/tokens'

const meta: Meta<typeof Modal> = {
  title: 'GB CERNE/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Modal>

export const Padrao: Story = {
  name: 'Padrão (md)',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir modal</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Nova safra"
          subtitle="Preencha os dados básicos da safra"
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="primary" onClick={() => setOpen(false)}>Salvar safra</Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
            <FormField label="Nome da safra" placeholder="Ex.: Safra 24/25" />
            <FormField label="Área plantada (ha)" placeholder="Ex.: 1.240" inputMode="numeric" />
          </div>
        </Modal>
      </>
    )
  },
}

export const Pequeno: Story = {
  name: 'Pequeno (sm)',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>Abrir modal pequeno</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          size="sm"
          title="Confirmar operação"
          footer={<Button variant="primary" onClick={() => setOpen(false)}>Entendi</Button>}
        >
          <p style={{ margin: 0, fontSize: t.font.size.sm, color: t.color.neutral[600], fontFamily: t.font.family.sans }}>
            A produção desta fazenda foi sincronizada com sucesso.
          </p>
        </Modal>
      </>
    )
  },
}

export const Grande: Story = {
  name: 'Grande (lg), sem fechar no overlay',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>Abrir modal grande</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          size="lg"
          title="Detalhes da fazenda"
          subtitle="Fazenda São João — Sorriso, MT"
          closeOnOverlay={false}
          footer={<Button variant="secondary" onClick={() => setOpen(false)}>Fechar</Button>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
            {Array.from({ length: 8 }, (_, i) => (
              <p key={i} style={{ margin: 0, fontSize: t.font.size.sm, color: t.color.neutral[600], fontFamily: t.font.family.sans }}>
                Linha de conteúdo detalhado {i + 1} — clicar fora do modal não fecha; use "Fechar".
              </p>
            ))}
          </div>
        </Modal>
      </>
    )
  },
}

export const SemRodape: Story = {
  name: 'Sem rodapé',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="ghost" onClick={() => setOpen(true)}>Ver aviso</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Sincronização em andamento">
          <p style={{ margin: 0, fontSize: t.font.size.sm, color: t.color.neutral[600], fontFamily: t.font.family.sans }}>
            Os dados desta safra estão sendo processados. Você pode fechar esta janela — a
            operação continua em segundo plano.
          </p>
        </Modal>
      </>
    )
  },
}
