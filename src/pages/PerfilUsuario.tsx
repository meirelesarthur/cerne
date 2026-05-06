import { useState } from 'react'
import { ChevronDown, Pencil } from 'lucide-react'

// ─── primitives ──────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 18, fontWeight: 400, color: '#1a1a1a', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>
      {children}
    </div>
  )
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>
      {children}
    </div>
  )
}

function Muted({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, color: '#616161', fontFamily: "'Outfit', sans-serif", margin: 0, lineHeight: 1.5 }}>
      {children}
    </p>
  )
}

function Section({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div
      style={{
        borderBottom: last ? 'none' : '1px solid rgba(16,16,16,0.1)',
        paddingBottom: last ? 32 : 28,
        marginBottom: last ? 0 : 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {children}
    </div>
  )
}

function InputField({
  label,
  value,
  type = 'text',
  editable = true,
  width,
}: {
  label: string
  value: string
  type?: string
  editable?: boolean
  width?: number | string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: width ?? 320 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', fontFamily: "'Outfit', sans-serif" }}>
        {label}
      </div>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          defaultValue={value}
          style={{
            width: '100%',
            height: 40,
            padding: '0 36px 0 13px',
            border: '1px solid rgba(16,16,16,0.15)',
            borderRadius: 8,
            fontSize: 14,
            color: '#1a1a1a',
            background: 'white',
            fontFamily: "'Outfit', sans-serif",
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#059669' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(16,16,16,0.15)' }}
        />
        {editable && (
          <div
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
            }}
          >
            <Pencil size={13} />
          </div>
        )}
      </div>
    </div>
  )
}

function SelectField({ label, value, options, width }: { label: string; value: string; options: string[]; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', fontFamily: "'Outfit', sans-serif" }}>
        {label}
      </div>
      <div style={{ position: 'relative', width: width }}>
        <select
          defaultValue={value}
          style={{
            appearance: 'none',
            width: '100%',
            height: 40,
            padding: '0 40px 0 13px',
            border: '1px solid rgba(16,16,16,0.1)',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: '#1a1a1a',
            background: 'white',
            fontFamily: "'Outfit', sans-serif",
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeft: '1px solid rgba(16,16,16,0.05)',
            pointerEvents: 'none',
          }}
        >
          <ChevronDown size={15} color="#9ca3af" />
        </div>
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 40,
        height: 20,
        borderRadius: 9999,
        background: checked ? '#059669' : 'rgba(115,115,115,0.2)',
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.2s',
        boxShadow: '0 0 2px rgba(18,18,18,0.08), 0 2px 2px rgba(18,18,18,0.04)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 22 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fafafa',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}
      />
    </div>
  )
}

function ActionButton({ children, variant = 'outline', onClick }: { children: React.ReactNode; variant?: 'outline' | 'danger'; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 32,
        padding: '0 17px',
        border: `1px solid ${variant === 'danger' ? 'rgba(220,38,38,0.3)' : 'rgba(16,16,16,0.2)'}`,
        borderRadius: 8,
        background: 'white',
        fontSize: 12,
        fontWeight: 500,
        color: variant === 'danger' ? '#dc2626' : '#1a1a1a',
        fontFamily: "'Outfit', sans-serif",
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
        transition: 'background 0.12s',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = variant === 'danger' ? '#fee2e2' : '#f5f5f5' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
    >
      {children}
    </button>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function PerfilUsuario() {
  const [twoFactor, setTwoFactor] = useState(false)
  const [newsletter, setNewsletter] = useState(true)

  return (
    <div
      style={{
        padding: '28px 32px',
        maxWidth: 800,
        fontFamily: "'Outfit', sans-serif",
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ fontSize: 18, fontWeight: 400, color: '#1a1a1a', margin: '0 0 28px' }}>
        Perfil
      </h1>

      {/* ── Avatar ── */}
      <Section>
        <SectionTitle>Avatar</SectionTitle>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669, #34d399)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 22,
            fontWeight: 700,
            cursor: 'pointer',
            position: 'relative',
            flexShrink: 0,
          }}
          title="Alterar avatar"
        >
          SV
        </div>
      </Section>

      {/* ── Dados pessoais ── */}
      <Section>
        <SectionTitle>Dados pessoais</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <InputField label="Nome completo" value="Silvio Ventura Abreu" />
          <InputField label="Usuário" value="silvioventura" />
          <InputField label="E-mail" value="ventura.silvio@greenbelt-ti.com" editable={false} width="100%" />
        </div>
      </Section>

      {/* ── Preferências do sistema ── */}
      <Section>
        <SectionTitle>Preferências do sistema</SectionTitle>
        <div style={{ display: 'flex', gap: 16, maxWidth: 620 }}>
          <SelectField label="Idioma" value="Português (BR)" options={['Português (BR)', 'English', 'Español']} />
          <SelectField label="Tema" value="Claro" options={['Claro', 'Escuro', 'Sistema']} />
        </div>
        <div style={{ display: 'flex', gap: 16, maxWidth: 620 }}>
          <SelectField label="Fazenda padrão" value="Fazenda Santa Luzia" options={['Fazenda Santa Luzia', 'Fazenda Bela Vista', 'Fazenda Cerrado Verde']} />
          <SelectField label="Safra padrão" value="Safra 2024/25" options={['Safra 2024/25', 'Safra 2025/26']} />
        </div>
      </Section>

      {/* ── Segurança ── */}
      <Section>
        <SectionTitle>Segurança</SectionTitle>

        {/* Senha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SubTitle>Senha</SubTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Muted>
              <strong style={{ fontWeight: 600 }}>Atualize sua senha</strong> pelo botão abaixo. Você será redirecionado para uma nova página e deverá seguir as instruções.
            </Muted>
            <ActionButton>Alterar senha</ActionButton>
          </div>
        </div>

        {/* 2FA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <SubTitle>Autenticação em dois fatores</SubTitle>
              <Muted>
                Ative a autenticação em dois fatores para adicionar uma camada extra de segurança ao seu acesso.
                Ao entrar, enviaremos um código de 6 dígitos para o seu e-mail para verificar sua identidade.
              </Muted>
            </div>
            <Toggle checked={twoFactor} onChange={() => setTwoFactor((v) => !v)} />
          </div>
        </div>
      </Section>

      {/* ── Contas conectadas ── */}
      <Section>
        <SectionTitle>Contas conectadas</SectionTitle>
        <Muted>Gerencie as contas de terceiros conectadas ao seu perfil para login simplificado.</Muted>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 0',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {/* Google G icon */}
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.32 8.7c0-.567-.051-1.11-.146-1.633H8.5v3.09h4.395a3.754 3.754 0 0 1-1.628 2.465v2.05h2.635C15.453 13.327 16.32 11.187 16.32 8.7z" fill="#4285F4"/>
            <path d="M8.5 16.5c2.205 0 4.053-.73 5.402-1.978l-2.635-2.05c-.73.49-1.664.78-2.767.78-2.128 0-3.93-1.437-4.574-3.368H1.198v2.117A8.003 8.003 0 0 0 8.5 16.5z" fill="#34A853"/>
            <path d="M3.926 9.884A4.807 4.807 0 0 1 3.675 8.5c0-.48.082-.947.251-1.384V4.999H1.198A8.003 8.003 0 0 0 .5 8.5c0 1.29.31 2.51.698 3.501l2.728-2.117z" fill="#FBBC05"/>
            <path d="M8.5 3.748c1.198 0 2.273.412 3.12 1.22l2.337-2.337C12.549 1.282 10.705.5 8.5.5A8.003 8.003 0 0 0 1.198 4.999L3.926 7.116C4.57 5.185 6.372 3.748 8.5 3.748z" fill="#EA4335"/>
          </svg>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', fontFamily: "'Outfit', sans-serif", width: 60 }}>Google</span>
          <span style={{ flex: 1, fontSize: 14, color: '#616161', fontFamily: "'Outfit', sans-serif" }}>Conectado</span>
          <ActionButton>Desconectar</ActionButton>
        </div>
      </Section>

      {/* ── Notificações ── */}
      <Section>
        <SectionTitle>Notificações</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SubTitle>Newsletter</SubTitle>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <Muted>Receba newsletters, promoções e novidades do AGRO365.</Muted>
            <Toggle checked={newsletter} onChange={() => setNewsletter((v) => !v)} />
          </div>
        </div>
      </Section>

      {/* ── Sessões e dispositivos ── */}
      <Section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SectionTitle>Sessões e dispositivos</SectionTitle>
          <span
            style={{
              background: '#ececec',
              borderRadius: 9999,
              padding: '2px 10px',
              fontSize: 12,
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: "'Outfit', sans-serif",
              marginTop: -16,
            }}
          >
            1/3 dispositivos
          </span>
        </div>
        <Muted>Por motivos de segurança, cada conta é limitada a três dispositivos conectados.</Muted>

        <div style={{ width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid #e3e3e3' }}>
          {/* header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr auto',
              background: '#fafafa',
              borderBottom: '1px solid #e3e3e3',
            }}
          >
            {['Sistema', 'Navegador', 'Localização', 'Última sessão', ''].map((h) => (
              <div
                key={h}
                style={{
                  padding: '11px 16px',
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#353535',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {h}
              </div>
            ))}
          </div>
          {/* row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr auto', alignItems: 'center' }}>
            <div style={{ padding: '16px', fontSize: 12, fontWeight: 500, color: '#1a1a1a', fontFamily: "'Outfit', sans-serif" }}>
              Windows 11
            </div>
            <div style={{ padding: '16px', fontSize: 12, color: '#616161', fontFamily: "'Outfit', sans-serif" }}>
              Chrome 145
            </div>
            <div style={{ padding: '16px', fontSize: 12, color: '#616161', fontFamily: "'Outfit', sans-serif" }}>
              179.82.68.233
            </div>
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#616161', fontFamily: "'Outfit', sans-serif" }}>Este dispositivo</span>
            </div>
            <div style={{ padding: '16px', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Excluir conta ── */}
      <Section last>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ActionButton variant="danger">Excluir conta</ActionButton>
          <p style={{ fontSize: 12, color: '#424242', fontFamily: "'Outfit', sans-serif", margin: 0, lineHeight: 1.5 }}>
            <strong>Nota:</strong> como você possui um plano ativo, não é possível excluir sua conta diretamente.
            Entre em contato com{' '}
            <span style={{ color: '#059669', fontWeight: 500 }}>suporte@greenbelt-ti.com</span>{' '}
            para obter assistência.
          </p>
        </div>
      </Section>
    </div>
  )
}
