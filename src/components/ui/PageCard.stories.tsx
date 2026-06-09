import type { Meta, StoryObj } from '@storybook/react-vite'
import { PageCard } from './PageCard'
import { PageHeader } from './PageHeader'
import { FormPageHeader } from './FormPageHeader'
import { Button } from './Button'
import { t } from '../../design/tokens'

const meta: Meta<typeof PageCard> = {
  title: 'GB CERNE/PageCard',
  component: PageCard,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PageCard>

const Filler = ({ rows = 30 }: { rows?: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        style={{
          padding: `${t.space[3]}px ${t.space[4]}px`,
          background: 'rgba(0,0,0,0.03)',
          borderRadius: t.radius.md,
          fontFamily: t.font.family.sans,
          fontSize: t.font.size.sm,
        }}
      >
        Linha de conteúdo {i + 1}
      </div>
    ))}
  </div>
)

/** Listagem — todo o conteúdo rola dentro do card; a página não rola. */
export const Listagem: Story = {
  render: () => (
    <div style={{ padding: t.space[6], height: '100vh', boxSizing: 'border-box' }}>
      <PageCard>
        <PageHeader title="Registros" count={42} />
        <Filler />
      </PageCard>
    </div>
  ),
}

/** Cadastro — corpo rolável + rodapé de ações fixo na base. */
export const ComRodape: Story = {
  render: () => (
    <div style={{ padding: t.space[6], height: '100vh', boxSizing: 'border-box' }}>
      <PageCard
        footer={
          <>
            <Button variant="secondary">Cancelar</Button>
            <Button variant="primary">Salvar</Button>
          </>
        }
      >
        <FormPageHeader
          title="Novo registro"
          subtitle="Preencha os campos abaixo"
          onBack={() => {}}
          paddingTop={t.space[4]}
        />
        <Filler />
      </PageCard>
    </div>
  ),
}
