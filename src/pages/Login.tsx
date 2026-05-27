import { useState, useRef, useEffect, useCallback } from 'react'
import { FormField } from '../components/ui/FormField'
import { Checkbox } from '../components/ui/Checkbox'
import { Divider } from '../components/ui/Divider'
import { SSOButton } from '../components/ui/SSOButton'
import { ProgressBar } from '../components/ui/ProgressBar'
import type { ProgressState } from '../components/ui/ProgressBar'
import { t } from '../design/tokens'
const CDN = 'https://pub-0f1e695318f140f895ccdb13696c1c62.r2.dev'
const vid0 = `${CDN}/agricultura.mp4`
const vid1 = `${CDN}/apicultura.mp4`
const vid2 = `${CDN}/avicultura.mp4`
const vid3 = `${CDN}/ovicultura.mp4`
const vid4 = `${CDN}/Psicultura.mp4`
import './Login.css'

// ─── Constantes ────────────────────────────────────────────────────────────

const SLIDES = [
  {
    src: vid0,
    eyebrow: 'Gestão rural inteligente',
    h1a: 'Sua fazenda,',
    h1em: 'gerenciada',
    h1b: 'com precisão.',
    desc: 'Do campo ao escritório, controle produção, custos, colheita e equipes em uma plataforma pensada para o agronegócio brasileiro.',
  },
  {
    src: vid1,
    eyebrow: 'Apicultura de precisão',
    h1a: 'Produção de mel',
    h1em: 'monitorada',
    h1b: 'em tempo real.',
    desc: 'Gerencie colmeias, floradas e extração com rastreabilidade completa do campo até a embalagem.',
  },
  {
    src: vid2,
    eyebrow: 'Avicultura integrada',
    h1a: 'Lotes e aves',
    h1em: 'controlados',
    h1b: 'sem esforço.',
    desc: 'Ciclos de produção, conversão alimentar e sanidade animal integrados em um único painel.',
  },
  {
    src: vid3,
    eyebrow: 'Ovinocultura moderna',
    h1a: 'Rebanho',
    h1em: 'acompanhado',
    h1b: 'do nascimento ao abate.',
    desc: 'Rastreie cada animal, controle peso, vacinação e genealogia com registros precisos e auditáveis.',
  },
  {
    src: vid4,
    eyebrow: 'Piscicultura eficiente',
    h1a: 'Tanques e safras',
    h1em: 'gerenciados',
    h1b: 'com inteligência.',
    desc: 'Controle qualidade da água, biometria e despesca com análises automáticas e alertas em tempo real.',
  },
]

const STATS = [
  { value: '2.400+', label: 'Fazendas ativas' },
  { value: 'R$ 4,2B', label: 'Em produção gerenciada' },
  { value: '99,7%', label: 'Uptime SLA garantido' },
]

const MAX_ATTEMPTS = 5
const LS_REMEMBER = 'cerne_remember'
const LS_EMAIL    = 'cerne_email'

// ─── Component ─────────────────────────────────────────────────────────────

export default function Login({ onLogin }: { onLogin: () => void }) {
  // ── Slide state ──────────────────────────────────────────────────────────
  const [slideIdx, setSlideIdx]     = useState(0)
  const [textVisible, setTextVisible] = useState(true)
  const videoRef  = useRef<HTMLVideoElement>(null)
  const timerRef  = useRef<ReturnType<typeof setInterval>>()

  // Detecta prefers-reduced-motion uma vez na montagem
  const prefersReduced = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  // ── Form state ───────────────────────────────────────────────────────────
  const emailRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState<string>(
    () => localStorage.getItem(LS_EMAIL) ?? ''
  )
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [remember, setRemember] = useState<boolean>(
    () => localStorage.getItem(LS_REMEMBER) === '1'
  )

  // Pré-valida se há email salvo
  const [emailStatus, setEmailStatus] = useState<'idle' | 'ok' | 'err'>(
    () => (localStorage.getItem(LS_EMAIL) ? 'ok' : 'idle')
  )
  const [passErr,   setPassErr]   = useState(false)
  const [passShake, setPassShake] = useState(false)

  // ── Auth state ───────────────────────────────────────────────────────────
  const [progressState, setProgressState] = useState<ProgressState>('idle')
  const [globalErr,     setGlobalErr]     = useState(false)
  const [attempts,      setAttempts]      = useState(0)

  // ── Forgot password state ────────────────────────────────────────────────
  const [forgotOpen,    setForgotOpen]    = useState(false)
  const [forgotEmail,   setForgotEmail]   = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent,    setForgotSent]    = useState(false)

  const isBlocked = attempts >= MAX_ATTEMPTS

  // ── Auto-focus email (somente se não há email salvo) ─────────────────────
  useEffect(() => {
    if (!localStorage.getItem(LS_EMAIL)) {
      const timer = setTimeout(() => emailRef.current?.focus(), 80)
      return () => clearTimeout(timer)
    }
  }, [])

  // ── Slide timer (desativado com reduced-motion) ───────────────────────────
  const goTo = useCallback((i: number) => {
    if (!prefersReduced.current) setTextVisible(false)
    const delay = prefersReduced.current ? 0 : 400
    setTimeout(() => {
      setSlideIdx(i)
      setTextVisible(true)
      if (videoRef.current && !prefersReduced.current) {
        videoRef.current.src = SLIDES[i].src
        videoRef.current.load()
        videoRef.current.play().catch(() => {})
      }
    }, delay)
  }, [])

  useEffect(() => {
    if (prefersReduced.current) return
    timerRef.current = setInterval(() => {
      setSlideIdx(prev => {
        const next = (prev + 1) % SLIDES.length
        goTo(next)
        return prev
      })
    }, 8000)
    return () => clearInterval(timerRef.current)
  }, [goTo])

  const slide = SLIDES[slideIdx]

  // ── Helpers ──────────────────────────────────────────────────────────────
  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const triggerShake = () => {
    setPassShake(true)
    setTimeout(() => setPassShake(false), 400)
  }

  // ── Handlers — form principal ─────────────────────────────────────────────
  const handleEmailBlur = () => {
    if (!email) return
    setEmailStatus(validateEmail(email) ? 'ok' : 'err')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isBlocked || progressState === 'loading' || progressState === 'success') return

    let valid = true
    if (!email || !validateEmail(email)) { setEmailStatus('err'); valid = false }
    if (!password)                        { setPassErr(true); triggerShake(); valid = false }
    if (!valid) return

    setProgressState('loading')
    setGlobalErr(false)

    // Simulação de autenticação — substituir pelo serviço real
    await new Promise(resolve => setTimeout(resolve, 1500))
    const authOk = true // ← integrar com authService.login(email, password)

    if (authOk) {
      if (remember) {
        localStorage.setItem(LS_REMEMBER, '1')
        localStorage.setItem(LS_EMAIL, email)
      } else {
        localStorage.removeItem(LS_REMEMBER)
        localStorage.removeItem(LS_EMAIL)
      }
      setProgressState('success')
      setTimeout(() => onLogin(), 700)
    } else {
      const next = attempts + 1
      setAttempts(next)
      setProgressState('error')
      setGlobalErr(true)
      setPassword('')
      triggerShake()
      setTimeout(() => {
        setProgressState('idle')
        emailRef.current?.focus()
      }, 800)
    }
  }

  // ── Handlers — forgot password ────────────────────────────────────────────
  const openForgot = () => {
    setForgotEmail(email)
    setForgotSent(false)
    setForgotOpen(true)
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail || !validateEmail(forgotEmail)) return
    setForgotLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1200))
    setForgotLoading(false)
    setForgotSent(true)
  }

  // ── Login contextual ───────────────────────────────────────────────────────
  // Extrai um "nome de exibição" do email salvo (ex: "joao.silva@..." → "joao")
  const savedEmail    = localStorage.getItem(LS_EMAIL)
  const displayName   = savedEmail
    ? savedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="lgn-root">

        {/* ══ LEFT PANEL ══════════════════════════════════════════════════ */}
        <div className="lgn-left">

          {/* Vídeo de fundo */}
          <div className="lgn-video-wrap">
            {!prefersReduced.current && (
              <video
                ref={videoRef}
                className="lgn-video lgn-video--on"
                src={slide.src}
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            <div className="lgn-video-overlay" />
            <div className="lgn-video-lines" aria-hidden="true">
              <svg viewBox="0 0 600 800" fill="none" preserveAspectRatio="xMidYMid slice">
                <path d="M-50 200 Q150 100 300 250 T600 200" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none"/>
                <path d="M-50 380 Q200 280 350 420 T700 360" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none"/>
                <path d="M100 -50 Q200 160 150 360 T200 760" stroke="rgba(34,197,94,0.10)" strokeWidth="1" fill="none"/>
                <circle cx="480" cy="160" r="130" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none"/>
                <circle cx="480" cy="160" r="85"  stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none"/>
                <circle cx="480" cy="160" r="42"  stroke="rgba(34,197,94,0.06)"   strokeWidth="1" fill="none"/>
              </svg>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="lgn-left-content">

            {/* Logo */}
            <div className="lgn-logo">
              <div className="lgn-logo-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L4 8v8l8 5 8-5V8L12 3z" fill="rgba(255,255,255,.9)"/>
                  <path d="M12 8v8M8 10l4-2 4 2" stroke="rgba(20,83,45,.6)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="lgn-logo-text">CERNE</span>
            </div>

            {/* Slide copy */}
            <div
              className={`lgn-slide-copy${textVisible ? ' lgn-slide-copy--in' : ' lgn-slide-copy--out'}`}
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="lgn-eyebrow">{slide.eyebrow}</div>
              <h1 className="lgn-h1">
                {slide.h1a}<br />
                <em>{slide.h1em}</em><br />
                {slide.h1b}
              </h1>
              <p className="lgn-desc">{slide.desc}</p>
            </div>

            {/* Dots */}
            <div className="lgn-dots" role="tablist" aria-label="Slides de produto">
              {SLIDES.map((s, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === slideIdx}
                  aria-label={s.eyebrow}
                  className={`lgn-dot${i === slideIdx ? ' lgn-dot--active' : ''}`}
                  onClick={() => {
                    clearInterval(timerRef.current)
                    goTo(i)
                  }}
                />
              ))}
            </div>

            {/* Stats */}
            <div className="lgn-stats" aria-label="Números do CERNE">
              {STATS.map(s => (
                <div key={s.label}>
                  <div className="lgn-stat-num">{s.value}</div>
                  <div className="lgn-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ══ RIGHT PANEL ═════════════════════════════════════════════════ */}
        <div className="lgn-right">

          {/* Barra de progresso de autenticação */}
          <ProgressBar state={progressState} />

          <div className="lgn-form-wrap">

            {/* Status do sistema */}
            <div className="lgn-system-status" aria-label="Status dos sistemas">
              <span className="lgn-system-status-dot" aria-hidden="true" />
              <span>Todos os sistemas operacionais</span>
            </div>

            {/* Alerta de erro global — sempre renderizado, visível via CSS */}
            <div
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              className={`lgn-alert${globalErr ? ' lgn-alert--visible' : ''}`}
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div>
                <strong>Credenciais inválidas</strong>
                {isBlocked ? (
                  <span>
                    Conta bloqueada temporariamente.{' '}
                    <button type="button" className="lgn-alert-link" onClick={openForgot}>
                      Recuperar acesso
                    </button>
                  </span>
                ) : attempts > 0 ? (
                  <span>
                    Tentativa {attempts} de {MAX_ATTEMPTS}.{' '}
                    {MAX_ATTEMPTS - attempts} restante{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} antes do bloqueio.
                  </span>
                ) : (
                  <span>Verifique seu e-mail e senha.</span>
                )}
              </div>
            </div>

            {/* Cabeçalho do form */}
            <div className="lgn-form-header">
              <h2 className="lgn-form-title">
                {displayName ? `Bem-vindo de volta` : 'Entrar na sua conta'}
              </h2>
              <p className="lgn-form-sub">
                Novo no CERNE?{' '}
                <a href="#solicitar" onClick={e => e.preventDefault()}>
                  Solicitar acesso
                </a>
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Campo e-mail */}
              <div className="lgn-field-wrap">
                <FormField
                  ref={emailRef}
                  label="E-mail corporativo"
                  type="email"
                  id="login-email"
                  placeholder="voce@suafazenda.com.br"
                  value={email}
                  autoComplete="email"
                  disabled={isBlocked}
                  onChange={e => { setEmail(e.target.value); setEmailStatus('idle') }}
                  onBlur={handleEmailBlur}
                  onFocus={() => setEmailStatus('idle')}
                  status={emailStatus}
                  error={emailStatus === 'err' ? 'Insira um e-mail válido' : undefined}
                  style={{ height: t.space[12], borderRadius: t.radius.xl }}
                  iconLeft={
                    <svg viewBox="0 0 16 16" fill="none" width={16} height={16} aria-hidden="true">
                      <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M1 5.5l7 4.5 7-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  }
                  iconRight={emailStatus === 'ok' ? (
                    <span
                      style={{ color: t.color.success.text, display: 'flex', alignItems: 'center' }}
                      aria-label="E-mail válido"
                    >
                      <svg viewBox="0 0 16 16" fill="none" width={16} height={16} aria-hidden="true">
                        <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  ) : undefined}
                />
              </div>

              {/* Campo senha */}
              <div className={`lgn-field-wrap${passShake ? ' lgn-field--shake' : ''}`}>
                <FormField
                  label="Senha"
                  type={showPw ? 'text' : 'password'}
                  id="login-password"
                  placeholder="••••••••••"
                  value={password}
                  autoComplete="current-password"
                  disabled={isBlocked}
                  onChange={e => { setPassword(e.target.value); setPassErr(false) }}
                  onFocus={() => setPassErr(false)}
                  status={passErr ? 'err' : 'idle'}
                  error={passErr ? 'Insira sua senha' : undefined}
                  style={{ height: t.space[12], borderRadius: t.radius.xl }}
                  iconLeft={
                    <svg viewBox="0 0 16 16" fill="none" width={16} height={16} aria-hidden="true">
                      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M5 7V5.5a3 3 0 016 0V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  }
                  iconRight={
                    <button
                      type="button"
                      aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
                      aria-pressed={showPw}
                      onClick={() => setShowPw(v => !v)}
                      className="lgn-pw-toggle"
                    >
                      {showPw ? (
                        <svg viewBox="0 0 16 16" fill="none" width={16} height={16} aria-hidden="true">
                          <path d="M2 2l12 12M6.5 6.7a2 2 0 002.8 2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                          <path d="M4 4.6C2.7 5.5 1.7 6.7 1 8c1.5 3 4 5 7 5 1.3 0 2.6-.4 3.7-1.1M12.5 11.5C13.5 10.6 14.4 9.4 15 8c-1.5-3-4-5-7-5-.8 0-1.7.2-2.5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 16 16" fill="none" width={16} height={16} aria-hidden="true">
                          <ellipse cx="8" cy="8" rx="7" ry="4.5" stroke="currentColor" strokeWidth="1.4"/>
                          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
                        </svg>
                      )}
                    </button>
                  }
                />
              </div>

              {/* Manter conectado + Esqueci a senha */}
              <div className="lgn-row">
                <Checkbox
                  label="Manter conectado"
                  checked={remember}
                  onChange={setRemember}
                  disabled={isBlocked}
                />
                <button
                  type="button"
                  className="lgn-forgot"
                  onClick={openForgot}
                >
                  Esqueci a senha
                </button>
              </div>

              {/* Botão de submit */}
              <button
                type="submit"
                className={`lgn-btn${progressState === 'success' ? ' lgn-btn--success' : ''}`}
                disabled={progressState === 'loading' || progressState === 'success' || isBlocked}
                aria-busy={progressState === 'loading'}
              >
                {progressState === 'loading' ? (
                  <span className="lgn-spinner" aria-hidden="true" />
                ) : progressState === 'success' ? (
                  <>
                    <svg viewBox="0 0 20 20" fill="none" width={18} height={18} aria-hidden="true">
                      <path d="M4 10l5 5 7-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Acesso autorizado
                  </>
                ) : isBlocked ? (
                  'Conta bloqueada'
                ) : (
                  'Acessar plataforma'
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="lgn-divider-wrap">
              <Divider label="ou acesse com" />
            </div>

            {/* SSO Google */}
            <SSOButton
              provider="google"
              onClick={() => { /* integrar com Google OAuth */ }}
            />

            {/* Trust badges */}
            <div className="lgn-trust" aria-label="Certificações de segurança">
              <div className="lgn-trust-item">
                <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1L2 3.5v4c0 3 2.5 5 5 6 2.5-1 5-3 5-6v-4L7 1z" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                SSL 256-bit
              </div>
              <div className="lgn-trust-item">
                <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="1" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M4 4V3a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                LGPD Conforme
              </div>
              <div className="lgn-trust-item">
                <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M7 4.5v3l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                99,7% uptime
              </div>
            </div>

            <p className="lgn-legal">
              Ao acessar, você concorda com os{' '}
              <a href="#">Termos de Uso</a> e{' '}
              <a href="#">Política de Privacidade</a> do CERNE.
            </p>

          </div>
        </div>
      </div>

      {/* ══ MODAL — Esqueci a senha ══════════════════════════════════════════ */}
      {forgotOpen && (
        <div
          className="lgn-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-title"
          onClick={e => { if (e.target === e.currentTarget) setForgotOpen(false) }}
        >
          <div className="lgn-modal">

            <button
              type="button"
              className="lgn-modal-close"
              aria-label="Fechar modal"
              onClick={() => setForgotOpen(false)}
            >
              <svg viewBox="0 0 16 16" fill="none" width={16} height={16} aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {!forgotSent ? (
              <>
                <h3 id="forgot-title" className="lgn-modal-title">Recuperar acesso</h3>
                <p className="lgn-modal-sub">
                  Informe seu e-mail corporativo. Enviaremos um link para redefinir sua senha.
                </p>

                <form onSubmit={handleForgotSubmit} noValidate>
                  <FormField
                    label="E-mail corporativo"
                    type="email"
                    placeholder="voce@suafazenda.com.br"
                    value={forgotEmail}
                    autoComplete="email"
                    onChange={e => setForgotEmail(e.target.value)}
                    style={{ height: t.space[12], borderRadius: t.radius.xl }}
                    iconLeft={
                      <svg viewBox="0 0 16 16" fill="none" width={16} height={16} aria-hidden="true">
                        <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M1 5.5l7 4.5 7-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    }
                  />

                  <button
                    type="submit"
                    className="lgn-btn lgn-btn--modal"
                    disabled={forgotLoading || !forgotEmail}
                    aria-busy={forgotLoading}
                    style={{ marginTop: t.space[5] }}
                  >
                    {forgotLoading
                      ? <span className="lgn-spinner" aria-hidden="true" />
                      : 'Enviar link de recuperação'}
                  </button>
                </form>

                <button type="button" className="lgn-modal-back" onClick={() => setForgotOpen(false)}>
                  ← Voltar ao login
                </button>
              </>
            ) : (
              <>
                <div className="lgn-modal-success-icon" aria-hidden="true">
                  <svg viewBox="0 0 56 56" fill="none">
                    <circle cx="28" cy="28" r="28" fill="rgba(5,150,105,.10)"/>
                    <path d="M16 28l9 9 15-15" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 id="forgot-title" className="lgn-modal-title">Link enviado!</h3>
                <p className="lgn-modal-sub">
                  Enviamos as instruções de recuperação para{' '}
                  <strong>{forgotEmail}</strong>.{' '}
                  Verifique sua caixa de entrada e a pasta de spam.
                </p>
                <button type="button" className="lgn-modal-back" onClick={() => setForgotOpen(false)}>
                  ← Voltar ao login
                </button>
              </>
            )}

          </div>
        </div>
      )}
    </>
  )
}
