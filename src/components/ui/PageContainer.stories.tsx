import type { Meta, StoryObj } from '@storybook/react-vite'
import { PageContainer } from './PageContainer'
import { PageCard } from './PageCard'
import { PageHeader } from './PageHeader'
import { t } from '../../design/tokens'

const meta: Meta<typeof PageContainer> = {
  title: 'GB CERNE/PageContainer',
  component: PageContainer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Wrapper padrão de página: não aplica recuo lateral (o `PageCard`/`Card` interno encosta na área útil) e mantém apenas o respiro inferior — telas com `PageCard` sobrescrevem com `paddingBottom: 0`.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PageContainer>

const Filler = () => (
  <div
    style={{
      padding: `${t.space[3]}px ${t.space[4]}px`,
      background: 'rgba(0,0,0,0.03)',
      borderRadius: t.radius.md,
      fontFamily: t.font.family.sans,
      fontSize: t.font.size.sm,
    }}
  >
    Conteúdo da página
  </div>
)

/** Padding inferior padrão — para páginas que rolam a própria altura (sem `PageCard`). */
export const PaddingPadrao: Story = {
  name: 'Padding padrão',
  render: () => (
    <div style={{ padding: t.space[6], background: '#f5f5f5' }}>
      <PageContainer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
          <Filler />
          <Filler />
          <Filler />
        </div>
      </PageContainer>
    </div>
  ),
}

/** `paddingBottom: 0` — usado quando o conteúdo é um `PageCard` que já controla seu próprio scroll interno. */
export const ComPageCard: Story = {
  name: 'Com PageCard (paddingBottom: 0)',
  render: () => (
    <div style={{ padding: t.space[6], height: '100vh', boxSizing: 'border-box', background: '#f5f5f5' }}>
      <PageContainer style={{ paddingBottom: 0, height: '100%' }}>
        <PageCard>
          <PageHeader title="Fazendas" count={12} />
          <Filler />
        </PageCard>
      </PageContainer>
    </div>
  ),
}
