import type { Meta, StoryObj } from '@storybook/react-vite'
import { Divider } from './Divider'

const meta: Meta<typeof Divider> = {
  title: 'GB CERNE/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Separador horizontal com label central opcional. Implementado com dois `div flex:1` flanqueando o texto — resolve o bug do `lgn-divider` original onde o texto ocupava toda a linha. Acessível via `role="separator"`.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360, padding: 24, background: '#fafaf9', borderRadius: 10, border: '1px solid #e5e7eb' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Divider>

export const SemLabel: Story = {
  args: {},
}

export const ComLabel: Story = {
  args: { label: 'ou acesse com' },
}

export const NoContexto: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button style={{ padding: '10px 16px', background: '#059669', color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        Acessar plataforma
      </button>
      <Divider label="ou acesse com" />
      <button style={{ padding: '10px 16px', background: 'white', color: '#404040', border: '1.5px solid #e5e5e5', borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <svg viewBox="0 0 18 18" fill="none" width={16} height={16}>
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Entrar com Google
      </button>
    </div>
  ),
}
