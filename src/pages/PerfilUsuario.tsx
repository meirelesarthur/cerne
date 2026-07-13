import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { FormField } from '../components/ui/FormField'
import { FormSelect } from '../components/ui/FormSelect'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Heading } from '../components/ui/Heading'
import { ToggleSwitch } from '../components/ui/ToggleSwitch'
import { t } from '../design/tokens'

// ─── primitives ──────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Heading level={2} size="lg" weight="normal" style={{ marginBottom: t.space[4] }}>
      {children}
    </Heading>
  )
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <Heading level={3} size="md" weight="medium" style={{ marginBottom: t.space[1] }}>
      {children}
    </Heading>
  )
}

function Muted({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: t.font.size.md, color: t.color.neutral[600], fontFamily: t.font.family.sans, margin: 0, lineHeight: 1.5 }}>
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

// ─── main component ───────────────────────────────────────────────────────────

export default function PerfilUsuario() {
  const [twoFactor, setTwoFactor] = useState(false)
  const [newsletter, setNewsletter] = useState(true)

  return (
    <div
      style={{
        padding: '28px 32px',
        maxWidth: 800,
        fontFamily: t.font.family.sans,
        boxSizing: 'border-box',
      }}
    >
      <Heading level={1} size="xl" weight="normal" style={{ marginBottom: t.space[7] }}>
        Perfil
      </Heading>

      {/* ── Avatar ── */}
      <Section>
        <SectionTitle>Avatar</SectionTitle>
        <div title="Alterar avatar" style={{ cursor: 'pointer', display: 'inline-flex' }}>
          <Avatar name="Silvio Ventura" size="xl" />
        </div>
      </Section>

      {/* ── Dados pessoais ── */}
      <Section>
        <SectionTitle>Dados pessoais</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 320 }}>
            <FormField
              label="Nome completo"
              defaultValue="Silvio Ventura Abreu"
              iconRight={<Pencil size={13} color={t.color.neutral[400]} />}
            />
          </div>
          <div style={{ width: 320 }}>
            <FormField
              label="Usuário"
              defaultValue="silvioventura"
              iconRight={<Pencil size={13} color={t.color.neutral[400]} />}
            />
          </div>
          <div style={{ width: '100%' }}>
            <FormField
              label="E-mail"
              defaultValue="ventura.silvio@greenbelt-ti.com"
              readOnly
            />
          </div>
        </div>
      </Section>

      {/* ── Preferências do sistema ── */}
      <Section>
        <SectionTitle>Preferências do sistema</SectionTitle>
        <div style={{ display: 'flex', gap: 16, maxWidth: 620 }}>
          <div style={{ flex: 1 }}>
            <FormSelect
              label="Idioma"
              defaultValue="Português (BR)"
              options={[
                { value: 'Português (BR)', label: 'Português (BR)' },
                { value: 'English', label: 'English' },
                { value: 'Español', label: 'Español' },
              ]}
            />
          </div>
          <div style={{ flex: 1 }}>
            <FormSelect
              label="Tema"
              defaultValue="Claro"
              options={[
                { value: 'Claro', label: 'Claro' },
                { value: 'Escuro', label: 'Escuro' },
                { value: 'Sistema', label: 'Sistema' },
              ]}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, maxWidth: 620 }}>
          <div style={{ flex: 1 }}>
            <FormSelect
              label="Fazenda padrão"
              defaultValue="Fazenda Santa Luzia"
              options={[
                { value: 'Fazenda Santa Luzia', label: 'Fazenda Santa Luzia' },
                { value: 'Fazenda Bela Vista', label: 'Fazenda Bela Vista' },
                { value: 'Fazenda Cerrado Verde', label: 'Fazenda Cerrado Verde' },
              ]}
            />
          </div>
          <div style={{ flex: 1 }}>
            <FormSelect
              label="Safra padrão"
              defaultValue="Safra 2024/25"
              options={[
                { value: 'Safra 2024/25', label: 'Safra 2024/25' },
                { value: 'Safra 2025/26', label: 'Safra 2025/26' },
              ]}
            />
          </div>
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
            <Button variant="secondary" size="sm">Alterar senha</Button>
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
            <ToggleSwitch checked={twoFactor} onChange={setTwoFactor} />
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
            borderBottom: `1px solid ${t.color.neutral[200]}`,
          }}
        >
          {/* Google G icon */}
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.32 8.7c0-.567-.051-1.11-.146-1.633H8.5v3.09h4.395a3.754 3.754 0 0 1-1.628 2.465v2.05h2.635C15.453 13.327 16.32 11.187 16.32 8.7z" fill="#4285F4"/>
            <path d="M8.5 16.5c2.205 0 4.053-.73 5.402-1.978l-2.635-2.05c-.73.49-1.664.78-2.767.78-2.128 0-3.93-1.437-4.574-3.368H1.198v2.117A8.003 8.003 0 0 0 8.5 16.5z" fill="#34A853"/>
            <path d="M3.926 9.884A4.807 4.807 0 0 1 3.675 8.5c0-.48.082-.947.251-1.384V4.999H1.198A8.003 8.003 0 0 0 .5 8.5c0 1.29.31 2.51.698 3.501l2.728-2.117z" fill="#FBBC05"/>
            <path d="M8.5 3.748c1.198 0 2.273.412 3.12 1.22l2.337-2.337C12.549 1.282 10.705.5 8.5.5A8.003 8.003 0 0 0 1.198 4.999L3.926 7.116C4.57 5.185 6.372 3.748 8.5 3.748z" fill="#EA4335"/>
          </svg>
          <span style={{ fontSize: t.font.size.lg, fontWeight: 700, color: t.color.neutral[800], fontFamily: t.font.family.sans, width: 60 }}>Google</span>
          <span style={{ flex: 1, fontSize: t.font.size.md, color: t.color.neutral[600], fontFamily: t.font.family.sans }}>Conectado</span>
          <Button variant="secondary" size="sm">Desconectar</Button>
        </div>
      </Section>

      {/* ── Notificações ── */}
      <Section>
        <SectionTitle>Notificações</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SubTitle>Newsletter</SubTitle>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <Muted>Receba newsletters, promoções e novidades do GB CERNE.</Muted>
            <ToggleSwitch checked={newsletter} onChange={setNewsletter} />
          </div>
        </div>
      </Section>

      {/* ── Sessões e dispositivos ── */}
      <Section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SectionTitle>Sessões e dispositivos</SectionTitle>
          <span
            style={{
              background: t.color.neutral[200],
              borderRadius: t.radius.full,
              padding: '2px 10px',
              fontSize: t.font.size.sm,
              fontWeight: 500,
              color: t.color.neutral[800],
              fontFamily: t.font.family.sans,
              marginTop: -16,
            }}
          >
            1/3 dispositivos
          </span>
        </div>
        <Muted>Por motivos de segurança, cada conta é limitada a três dispositivos conectados.</Muted>

        <div style={{ width: '100%', borderRadius: t.radius.base, overflow: 'hidden', border: `1px solid ${t.color.neutral[200]}` }}>
          {/* header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr auto',
              background: t.color.neutral[50],
              borderBottom: `1px solid ${t.color.neutral[200]}`,
            }}
          >
            {['Sistema', 'Navegador', 'Localização', 'Última sessão', ''].map((h) => (
              <div
                key={h}
                style={{
                  padding: '11px 16px',
                  fontSize: t.font.size.sm,
                  fontWeight: 500,
                  color: t.color.neutral[700],
                  fontFamily: t.font.family.sans,
                }}
              >
                {h}
              </div>
            ))}
          </div>
          {/* row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr auto', alignItems: 'center' }}>
            <div style={{ padding: '16px', fontSize: t.font.size.sm, fontWeight: 500, color: t.color.neutral[800], fontFamily: t.font.family.sans }}>
              Windows 11
            </div>
            <div style={{ padding: '16px', fontSize: t.font.size.sm, color: t.color.neutral[600], fontFamily: t.font.family.sans }}>
              Chrome 145
            </div>
            <div style={{ padding: '16px', fontSize: t.font.size.sm, color: t.color.neutral[600], fontFamily: t.font.family.sans }}>
              179.82.68.233
            </div>
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.color.brand[600], flexShrink: 0 }} />
              <span style={{ fontSize: t.font.size.sm, color: t.color.neutral[600], fontFamily: t.font.family.sans }}>Este dispositivo</span>
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
          <div style={{ width: 'fit-content' }}>
            <Button variant="destructive" size="sm">Excluir conta</Button>
          </div>
          <p style={{ fontSize: t.font.size.sm, color: t.color.neutral[700], fontFamily: t.font.family.sans, margin: 0, lineHeight: 1.5 }}>
            <strong>Nota:</strong> como você possui um plano ativo, não é possível excluir sua conta diretamente.
            Entre em contato com{' '}
            <span style={{ color: t.color.brand[600], fontWeight: 500 }}>suporte@greenbelt-ti.com</span>{' '}
            para obter assistência.
          </p>
        </div>
      </Section>
    </div>
  )
}
