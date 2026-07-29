import { useEffect, useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Heading } from '../components/ui/Heading'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { SearchSelect } from '../components/ui/SearchSelect'
import { SecretField } from '../components/ui/SecretField'
import { useToast, ToastContainer } from '../components/ui/Toast'
import { useTheme } from '../context/ThemeContext'
import { useFarm } from '../context/FarmContext'
import { useUserProfile } from '../context/UserProfileContext'
import { CIDADES, cidadeLabel, maskNif } from './cadastros/pessoas/pessoas.types'
import { focusFirstError } from '../hooks/focusFirstError'
import { t } from '../design/tokens'

// ─── Grade local (2 colunas responsivas) ───────────────────────────────────────
// Escopo desta página apenas — o helper equivalente em pessoas/steps/parts.tsx
// é privado daquela feature.
const grid2: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
  gap: t.space[4],
}

const MAX_PHOTO_MB = 5
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ─── Validações — Dados pessoais ───────────────────────────────────────────────

function validateNome(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'Campo obrigatório.'
  if (v.length < 3) return 'Mínimo 3 caracteres.'
  if (v.length > 70) return 'Máximo 70 caracteres.'
}

function validateTelefone(value: string): string | undefined {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 'Campo obrigatório.'
  if (digits.length < 10 || digits.length > 11) return 'Informe DDD + número (10 ou 11 dígitos).'
}

function validateEndereco(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'Campo obrigatório.'
  if (v.length > 255) return 'Máximo 255 caracteres.'
}

// ─── Validações — Segurança ─────────────────────────────────────────────────────

function validateNovaSenha(nova: string, atual: string): string | undefined {
  if (!nova) return 'Campo obrigatório.'
  if (nova.length < 8) return 'Mínimo 8 caracteres.'
  if (!/[A-Z]/.test(nova) || !/[a-z]/.test(nova) || !/\d/.test(nova)) {
    return 'Use ao menos 1 maiúscula, 1 minúscula e 1 número.'
  }
  if (atual && nova === atual) return 'A nova senha deve ser diferente da atual.'
}

function validateConfirmacao(confirmacao: string, nova: string): string | undefined {
  if (!confirmacao) return 'Campo obrigatório.'
  if (confirmacao !== nova) return 'As senhas não coincidem.'
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PerfilUsuario() {
  const { colors } = useTheme()
  const { currentFarm } = useFarm()
  const { profile, updateProfile } = useUserProfile()
  const { toasts, show, dismiss } = useToast()

  // ── Foto ──────────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | undefined>()

  // Libera a URL de objeto ao trocar de preview ou desmontar — evita vazamento de memória.
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview) }, [photoPreview])

  const handlePickPhoto = () => fileInputRef.current?.click()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite reselecionar o mesmo arquivo depois de um erro
    if (!file) return
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError('Envie um arquivo JPG, PNG ou WebP.')
      show('Formato de imagem não suportado.', 'error')
      return
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setPhotoError(`A imagem deve ter até ${MAX_PHOTO_MB} MB.`)
      show('Imagem maior que o limite permitido.', 'error')
      return
    }
    setPhotoError(undefined)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleRemovePhotoSelection = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoError(undefined)
  }

  const avatarSrc = photoPreview ?? profile.photoUrl ?? undefined
  const avatarAriaLabel = avatarSrc ? `Foto de perfil de ${profile.name}` : 'Usuário sem foto de perfil'

  // ── Dados pessoais (rascunho local, só vira canônico ao salvar) ────────────
  const [nome, setNome]           = useState(profile.name)
  const [telefone, setTelefone]   = useState(profile.phone)
  const [cityId, setCityId]       = useState(profile.cityId)
  const [cityQuery, setCityQuery] = useState(() => cidadeLabel(profile.cityId))
  const [endereco, setEndereco]   = useState(profile.address)
  const [touchedPessoal, setTouchedPessoal] = useState({ nome: false, telefone: false, cityId: false, endereco: false })
  const [savingPessoal, setSavingPessoal]   = useState(false)

  const pessoalDirty =
    nome !== profile.name ||
    telefone !== profile.phone ||
    cityId !== profile.cityId ||
    endereco !== profile.address ||
    photoFile !== null

  const pessoalErrors = {
    nome:     touchedPessoal.nome     ? validateNome(nome)         : undefined,
    telefone: touchedPessoal.telefone ? validateTelefone(telefone) : undefined,
    cityId:   touchedPessoal.cityId && !cityId ? 'Selecione uma cidade.' : undefined,
    endereco: touchedPessoal.endereco ? validateEndereco(endereco) : undefined,
  }

  const cityOptions = CIDADES.map((c) => ({ id: c.value, label: c.label }))

  const handleDiscardPessoal = () => {
    setNome(profile.name)
    setTelefone(profile.phone)
    setCityId(profile.cityId)
    setCityQuery(cidadeLabel(profile.cityId))
    setEndereco(profile.address)
    handleRemovePhotoSelection()
    setTouchedPessoal({ nome: false, telefone: false, cityId: false, endereco: false })
  }

  const handleSubmitPessoal = (e: React.FormEvent) => {
    e.preventDefault()
    setTouchedPessoal({ nome: true, telefone: true, cityId: true, endereco: true })
    const errors = {
      nome:     validateNome(nome),
      telefone: validateTelefone(telefone),
      cityId:   !cityId ? 'Selecione uma cidade.' : undefined,
      endereco: validateEndereco(endereco),
    }
    if (Object.values(errors).some(Boolean)) {
      focusFirstError()
      show('Há campos pendentes — verifique os destaques em vermelho.', 'error')
      return
    }

    setSavingPessoal(true)
    // Simulação de persistência — substituir pela chamada real (PATCH /api/v1/me).
    setTimeout(() => {
      updateProfile({
        name:    nome.trim(),
        phone:   telefone,
        cityId,
        address: endereco.trim(),
        ...(photoFile ? { photoUrl: photoPreview } : {}),
      })
      setSavingPessoal(false)
      setPhotoFile(null)
      setPhotoPreview(null)
      setTouchedPessoal({ nome: false, telefone: false, cityId: false, endereco: false })
      show('Perfil atualizado com sucesso.')
    }, 600)
  }

  // ── Segurança (senha) ──────────────────────────────────────────────────────
  const [senhaAtual, setSenhaAtual]           = useState('')
  const [novaSenha, setNovaSenha]             = useState('')
  const [confirmarSenha, setConfirmarSenha]   = useState('')
  const [touchedSenha, setTouchedSenha]       = useState({ atual: false, nova: false, confirmacao: false })
  const [savingSenha, setSavingSenha]         = useState(false)

  const senhaDirty = !!(senhaAtual || novaSenha || confirmarSenha)

  const senhaErrors = {
    atual:       touchedSenha.atual ? (senhaAtual ? undefined : 'Campo obrigatório.') : undefined,
    nova:        touchedSenha.nova ? validateNovaSenha(novaSenha, senhaAtual) : undefined,
    confirmacao: touchedSenha.confirmacao ? validateConfirmacao(confirmarSenha, novaSenha) : undefined,
  }

  const handleSubmitSenha = (e: React.FormEvent) => {
    e.preventDefault()
    setTouchedSenha({ atual: true, nova: true, confirmacao: true })
    const errors = {
      atual:       senhaAtual ? undefined : 'Campo obrigatório.',
      nova:        validateNovaSenha(novaSenha, senhaAtual),
      confirmacao: validateConfirmacao(confirmarSenha, novaSenha),
    }
    if (Object.values(errors).some(Boolean)) {
      focusFirstError()
      show('Há campos pendentes — verifique os destaques em vermelho.', 'error')
      return
    }

    setSavingSenha(true)
    // Simulação de persistência — substituir pela chamada real (PUT /api/v1/me/password).
    setTimeout(() => {
      setSavingSenha(false)
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
      setTouchedSenha({ atual: false, nova: false, confirmacao: false })
      show('Senha alterada com sucesso.')
    }, 600)
  }

  // ── Alterações não salvas ao sair da página (fechar aba/recarregar) ────────
  const hasUnsavedChanges = pessoalDirty || senhaDirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedChanges])

  return (
    <div
      style={{
        padding: `${t.space[6]}px`,
        maxWidth: 720,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: t.space[5],
      }}
    >
      <PageHeader
        title="Meu perfil"
        description="Gerencie seus dados pessoais e a segurança da sua conta."
      />

      {/* ── Resumo da conta ────────────────────────────────────────────────── */}
      <Card shadow="sm">
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[4], flexWrap: 'wrap' }}>
          <Avatar name={profile.name} src={avatarSrc} size="lg" ariaLabel={avatarAriaLabel} />
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.semibold, color: colors.fg.default, fontFamily: t.font.family.sans }}>
              {profile.name}
            </div>
            <div style={{ fontSize: t.font.size.sm, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
              {profile.email}
            </div>
          </div>
          <div style={{ display: 'flex', gap: t.space[2], flexWrap: 'wrap' }}>
            {profile.roles.map((r) => <Badge key={r.id} label={r.label} variant="info" />)}
            {currentFarm && <Badge label={currentFarm.name} variant="success" />}
          </div>
        </div>
      </Card>

      {/* ── Card Dados pessoais ────────────────────────────────────────────── */}
      <Card>
        <form onSubmit={handleSubmitPessoal} noValidate style={{ display: 'flex', flexDirection: 'column', gap: t.space[5] }}>
          <Heading level={2} size="lg" weight="semibold">Dados pessoais</Heading>

          {/* Foto */}
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[4] }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar name={profile.name} src={avatarSrc} size="xl" ariaLabel={avatarAriaLabel} />
              <button
                type="button"
                onClick={handlePickPhoto}
                className="gb-focusable"
                aria-label="Alterar foto de perfil"
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 26,
                  height: 26,
                  borderRadius: t.radius.full,
                  border: `2px solid ${colors.bg.surface}`,
                  background: colors.accent.default,
                  color: t.color.neutral[0],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <Camera size={12} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_PHOTO_TYPES.join(',')}
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
              <div style={{ display: 'flex', gap: t.space[2] }}>
                <Button type="button" variant="secondary" size="sm" onClick={handlePickPhoto} disabled={savingPessoal}>
                  Alterar foto
                </Button>
                {photoFile && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleRemovePhotoSelection} disabled={savingPessoal}>
                    Remover seleção
                  </Button>
                )}
              </div>
              <span
                role={photoError ? 'alert' : undefined}
                aria-live="polite"
                style={{
                  fontSize: t.font.size.xs,
                  color: photoError ? t.color.feedback.error.text : colors.fg.subtle,
                  fontFamily: t.font.family.sans,
                }}
              >
                {photoError ?? `JPG, PNG ou WebP — até ${MAX_PHOTO_MB} MB.`}
              </span>
            </div>
          </div>

          <div style={grid2}>
            <FormField
              label="Nome completo" required maxLength={70}
              value={nome} onChange={(e) => setNome(e.target.value)}
              onBlur={() => setTouchedPessoal((p) => ({ ...p, nome: true }))}
              error={pessoalErrors.nome} disabled={savingPessoal}
            />
            <FormField
              label="Telefone" required mask="phone" type="tel" placeholder="(00) 00000-0000"
              value={telefone} autoComplete="tel"
              onChange={(e) => setTelefone(e.target.value)}
              onBlur={() => setTouchedPessoal((p) => ({ ...p, telefone: true }))}
              error={pessoalErrors.telefone} disabled={savingPessoal}
            />
          </div>

          <div style={grid2}>
            <FormField
              label="CPF / CNPJ" value={maskNif(profile.nif)} readOnly
              hint="Alteração de documento é feita pelo administrador."
            />
            <FormField
              label="E-mail" value={profile.email} readOnly type="email"
              hint="Alteração de e-mail exige um fluxo próprio de verificação."
            />
          </div>

          <SearchSelect
            label="Cidade" required placeholder="Busque por nome ou UF…"
            query={cityQuery}
            onQueryChange={(v) => { setCityQuery(v); setCityId('') }}
            onBlur={() => setTouchedPessoal((p) => ({ ...p, cityId: true }))}
            options={cityOptions}
            selectedId={cityId || null}
            onSelect={(opt) => {
              setCityId(opt.id)
              setCityQuery(opt.label)
              setTouchedPessoal((p) => ({ ...p, cityId: true }))
            }}
            onClear={() => {
              setCityId('')
              setCityQuery('')
              setTouchedPessoal((p) => ({ ...p, cityId: true }))
            }}
            error={pessoalErrors.cityId}
            disabled={savingPessoal}
          />

          <FormField
            label="Endereço" required maxLength={255}
            value={endereco} onChange={(e) => setEndereco(e.target.value)}
            onBlur={() => setTouchedPessoal((p) => ({ ...p, endereco: true }))}
            error={pessoalErrors.endereco} disabled={savingPessoal}
          />

          <div style={{ display: 'flex', gap: t.space[2], justifyContent: 'flex-end', paddingTop: t.space[3], borderTop: `1px solid ${colors.border.subtle}` }}>
            <Button type="button" variant="ghost" onClick={handleDiscardPessoal} disabled={!pessoalDirty || savingPessoal}>
              Descartar alterações
            </Button>
            <Button type="submit" variant="primary" loading={savingPessoal} disabled={!pessoalDirty}>
              Salvar alterações
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Card Segurança ─────────────────────────────────────────────────── */}
      <Card>
        <form onSubmit={handleSubmitSenha} noValidate style={{ display: 'flex', flexDirection: 'column', gap: t.space[4] }}>
          <Heading level={2} size="lg" weight="semibold">Segurança</Heading>

          <SecretField
            label="Senha atual" required autoComplete="current-password"
            value={senhaAtual}
            onChange={(v) => setSenhaAtual(v)}
            error={senhaErrors.atual}
          />
          <SecretField
            label="Nova senha" required autoComplete="new-password"
            hint="Mínimo 8 caracteres, com maiúscula, minúscula e número."
            value={novaSenha}
            onChange={(v) => setNovaSenha(v)}
            error={senhaErrors.nova}
          />
          <SecretField
            label="Confirmar nova senha" required autoComplete="new-password"
            value={confirmarSenha}
            onChange={(v) => setConfirmarSenha(v)}
            error={senhaErrors.confirmacao}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: t.space[3], borderTop: `1px solid ${colors.border.subtle}` }}>
            <Button type="submit" variant="primary" loading={savingSenha} disabled={!senhaDirty}>
              Alterar senha
            </Button>
          </div>
        </form>
      </Card>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
