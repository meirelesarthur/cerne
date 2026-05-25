import { useState, useRef, useEffect, useCallback } from 'react'
import vid0 from '../assets/agricultura.mp4'
import vid1 from '../assets/apicultura.mp4'
import vid2 from '../assets/avicultura.mp4'
import vid3 from '../assets/ovicultura.mp4'
import vid4 from '../assets/Psicultura.mp4'
import './Login.css'

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
  { value: 'R$ 4,2B', label: 'Gerenciados' },
  { value: '98,7%', label: 'Uptime SLA' },
]

// ─── Component ─────────────────────────────────────────────────────────────
export default function Login({ onLogin }: { onLogin: () => void }) {
  const [slideIdx, setSlideIdx] = useState(0)
  const [textVisible, setTextVisible] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'ok' | 'err'>('idle')
  const [passErr, setPassErr] = useState(false)
  const [loading, setLoading] = useState(false)
  const [globalErr, setGlobalErr] = useState(false)

  const goTo = useCallback((i: number) => {
    setTextVisible(false)
    setTimeout(() => {
      setSlideIdx(i)
      setTextVisible(true)
      if (videoRef.current) {
        videoRef.current.src = SLIDES[i].src
        videoRef.current.load()
        videoRef.current.play().catch(() => {})
      }
    }, 500)
  }, [])

  useEffect(() => {
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

  const handleEmailBlur = () => {
    if (!email) return
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    setEmailStatus(ok ? 'ok' : 'err')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let valid = true
    if (!email || emailStatus === 'err') { setEmailStatus('err'); valid = false }
    if (!password) { setPassErr(true); valid = false }
    if (!valid) return

    setLoading(true)
    setGlobalErr(false)
    setTimeout(() => {
      setLoading(false)
      onLogin()
    }, 1500)
  }

  return (
    <div className="lgn-root">
      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div className="lgn-left">
        {/* Video background */}
        <div className="lgn-video-wrap">
          <video
            ref={videoRef}
            className="lgn-video lgn-video--on"
            src={slide.src}
            poster={slide.poster}
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="lgn-video-overlay" />
          <div className="lgn-video-lines">
            <svg viewBox="0 0 600 800" fill="none" preserveAspectRatio="xMidYMid slice">
              <path d="M-50 200 Q150 100 300 250 T600 200" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none"/>
              <path d="M-50 380 Q200 280 350 420 T700 360" stroke="rgba(255,255,255,0.07)" strokeWidth="1" fill="none"/>
              <path d="M100 -50 Q200 160 150 360 T200 760" stroke="rgba(34,197,94,0.12)" strokeWidth="1" fill="none"/>
              <circle cx="480" cy="160" r="130" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none"/>
              <circle cx="480" cy="160" r="85" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none"/>
              <circle cx="480" cy="160" r="42" stroke="rgba(34,197,94,0.07)" strokeWidth="1" fill="none"/>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="lgn-left-content">
          {/* Logo */}
          <div className="lgn-logo">
            <div className="lgn-logo-mark">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3L4 8v8l8 5 8-5V8L12 3z" fill="rgba(255,255,255,.9)"/>
                <path d="M12 8v8M8 10l4-2 4 2" stroke="rgba(20,83,45,.6)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="lgn-logo-text">AGRO365</span>
            <span className="lgn-logo-badge">Cerne</span>
          </div>

          {/* Slide copy */}
          <div className={`lgn-slide-copy${textVisible ? ' lgn-slide-copy--in' : ' lgn-slide-copy--out'}`}>
            <div className="lgn-eyebrow">{slide.eyebrow}</div>
            <h1 className="lgn-h1">
              {slide.h1a}<br />
              <em>{slide.h1em}</em><br />
              {slide.h1b}
            </h1>
            <p className="lgn-desc">{slide.desc}</p>
          </div>

          {/* Dots */}
          <div className="lgn-dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`lgn-dot${i === slideIdx ? ' lgn-dot--active' : ''}`}
                onClick={() => {
                  clearInterval(timerRef.current)
                  goTo(i)
                }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Stats */}
          <div className="lgn-stats">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="lgn-stat-num">{s.value}</div>
                <div className="lgn-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <div className="lgn-right">
        {loading && (
          <div className="lgn-progress">
            <div className="lgn-progress-fill" />
          </div>
        )}

        <div className="lgn-form-wrap">
          {globalErr && (
            <div className="lgn-alert">
              <svg viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div>
                <strong>Credenciais inválidas</strong>
                Verifique seu e-mail e senha. Após 5 tentativas, sua conta será bloqueada.
              </div>
            </div>
          )}

          <div className="lgn-form-header">
            <h2 className="lgn-form-title">Entrar na sua conta</h2>
            <p className="lgn-form-sub">Novo no AGRO365? <a href="#">Solicitar acesso</a></p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className={`lgn-field${emailStatus === 'ok' ? ' lgn-field--ok' : emailStatus === 'err' ? ' lgn-field--err' : ''}`}>
              <label className="lgn-label">E-mail corporativo</label>
              <div className="lgn-input-wrap">
                <span className="lgn-input-icon">
                  <svg viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M1 5.5l7 4.5 7-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  type="email"
                  className="lgn-input"
                  placeholder="voce@suafazenda.com.br"
                  value={email}
                  autoComplete="email"
                  onChange={e => { setEmail(e.target.value); setEmailStatus('idle') }}
                  onBlur={handleEmailBlur}
                  onFocus={() => setEmailStatus('idle')}
                />
                {emailStatus === 'ok' && (
                  <span className="lgn-check">
                    <svg viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </div>
              {emailStatus === 'err' && (
                <div className="lgn-err-msg">Insira um e-mail válido</div>
              )}
            </div>

            {/* Password */}
            <div className={`lgn-field${passErr ? ' lgn-field--err' : ''}`}>
              <label className="lgn-label">Senha</label>
              <div className="lgn-input-wrap">
                <span className="lgn-input-icon">
                  <svg viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M5 7V5.5a3 3 0 016 0V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="lgn-input"
                  placeholder="••••••••••"
                  value={password}
                  autoComplete="current-password"
                  onChange={e => { setPassword(e.target.value); setPassErr(false) }}
                  onFocus={() => setPassErr(false)}
                />
                <button
                  type="button"
                  className="lgn-pw-toggle"
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                >
                  {showPw ? (
                    <svg viewBox="0 0 16 16" fill="none">
                      <path d="M2 2l12 12M6.5 6.7a2 2 0 002.8 2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      <path d="M4 4.6C2.7 5.5 1.7 6.7 1 8c1.5 3 4 5 7 5 1.3 0 2.6-.4 3.7-1.1M12.5 11.5C13.5 10.6 14.4 9.4 15 8c-1.5-3-4-5-7-5-.8 0-1.7.2-2.5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" fill="none">
                      <ellipse cx="8" cy="8" rx="7" ry="4.5" stroke="currentColor" strokeWidth="1.4"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                  )}
                </button>
              </div>
              {passErr && <div className="lgn-err-msg">Insira sua senha</div>}
            </div>

            {/* Remember + forgot */}
            <div className="lgn-row">
              <label className="lgn-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <span className="lgn-checkbox-box">
                  {remember && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                Manter conectado
              </label>
              <a href="#" className="lgn-forgot">Esqueci a senha</a>
            </div>

            {/* Submit */}
            <button type="submit" className="lgn-btn" disabled={loading}>
              {loading ? <span className="lgn-spinner" /> : 'Acessar plataforma'}
            </button>
          </form>

          {/* Divider */}
          <div className="lgn-divider">
            <span /><span style={{ whiteSpace: 'nowrap' }}>ou acesse com</span><span />
          </div>

          {/* SSO */}
          <button type="button" className="lgn-sso">
            <svg viewBox="0 0 18 18" fill="none">
              <rect x="1" y="1" width="7.5" height="7.5" fill="#F25022"/>
              <rect x="9.5" y="1" width="7.5" height="7.5" fill="#7FBA00"/>
              <rect x="1" y="9.5" width="7.5" height="7.5" fill="#00A4EF"/>
              <rect x="9.5" y="9.5" width="7.5" height="7.5" fill="#FFB900"/>
            </svg>
            Entrar com Microsoft 365
          </button>

          {/* Trust */}
          <div className="lgn-trust">
            <div className="lgn-trust-item">
              <svg viewBox="0 0 14 14" fill="none">
                <path d="M7 1L2 3.5v4c0 3 2.5 5 5 6 2.5-1 5-3 5-6v-4L7 1z" stroke="currentColor" strokeWidth="1.3" fill="none"/>
                <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              SSL 256-bit
            </div>
            <div className="lgn-trust-item">
              <svg viewBox="0 0 14 14" fill="none">
                <rect x="1" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M4 4V3a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              LGPD Conforme
            </div>
            <div className="lgn-trust-item">
              <svg viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M7 4.5v3l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              99,7% uptime
            </div>
          </div>

          <p className="lgn-legal">
            Ao acessar, você concorda com os{' '}
            <a href="#">Termos de Uso</a> e{' '}
            <a href="#">Política de Privacidade</a> do AGRO365.
          </p>
        </div>
      </div>
    </div>
  )
}
