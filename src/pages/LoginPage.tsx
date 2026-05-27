// PROTÓTIPO — este componente não está em uso (App.tsx usa Login.tsx).
// Remova este arquivo antes de qualquer deploy em ambiente de produção ou homologação.
import React, { useState, useRef, useEffect, useCallback } from 'react'
import t from '../design/tokens'
import logoFull from '../assets/Logo.svg'
const CDN = 'https://pub-0f1e695318f140f895ccdb13696c1c62.r2.dev'
const vid0 = `${CDN}/agricultura.mp4`
const vid1 = `${CDN}/apicultura.mp4`
const vid2 = `${CDN}/avicultura.mp4`
const vid3 = `${CDN}/ovicultura.mp4`
const vid4 = `${CDN}/Psicultura.mp4`

const VIDEOS = [vid0, vid1, vid2, vid3, vid4]

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // ── video cycling ──────────────────────────────────────────────────────────
  const [vidIdx, setVidIdx] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const advanceVideo = useCallback(() => {
    setFadeIn(false)
    setTimeout(() => {
      setVidIdx((i) => (i + 1) % VIDEOS.length)
      setFadeIn(true)
    }, 600)
  }, [])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.src = VIDEOS[vidIdx]
    el.load()
    el.play().catch(() => {})
  }, [vidIdx])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        fontFamily: t.font.family.sans,
        background: t.color.neutral[150],
        padding: t.space[3],
        boxSizing: 'border-box',
        gap: t.space[3],
      }}
    >
      {/* Left panel — form */}
      <div
        style={{
          width: '42%',
          minWidth: 380,
          maxWidth: 520,
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 56px',
          boxSizing: 'border-box',
          borderRadius: t.radius['2xl'],
        }}
      >
        {/* Form container */}
        <div style={{ width: '100%', maxWidth: 360 }}>
          {/* Logo centralizada */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: t.space[6] }}>
            <img src={logoFull} alt="GB CERNE" style={{ height: 32 }} />
          </div>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: '#171717',
              margin: `0 0 ${t.space[8]}px`,
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              textAlign: 'center',
            }}
          >
            Bem vindo ao Cerne
          </h1>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: '#404040',
                marginBottom: 6,
              }}
            >
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                height: 42,
                border: '1px solid #e5e5e5',
                borderRadius: 8,
                padding: '0 14px',
                fontSize: 14,
                color: '#171717',
                background: '#fafafa',
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: "'Outfit', sans-serif",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#404040',
                }}
              >
                Senha
              </label>
              <span
                style={{
                  fontSize: 13,
                  color: '#059669',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Esqueci a senha
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  height: 42,
                  border: '1px solid #e5e5e5',
                  borderRadius: 8,
                  padding: '0 40px 0 14px',
                  fontSize: 14,
                  color: '#171717',
                  background: '#fafafa',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: "'Outfit', sans-serif",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Login button */}
          <button
            type="button"
            onClick={onLogin}
            style={{
              width: '100%',
              height: 44,
              background: '#171717',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              marginTop: 24,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#059669' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#171717' }}
          >
            Entrar
          </button>

          <p
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: '#9ca3af',
              marginTop: 20,
            }}
          >
            Não tem uma conta?{' '}
            <span style={{ color: '#059669', fontWeight: 500, cursor: 'pointer' }}>
              Fale conosco
            </span>
          </p>
        </div>
      </div>

      {/* Right panel — video reel */}
      <div
        style={{
          flex: 'none',
          width: 'calc(58% * 0.7)',
          alignSelf: 'stretch',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 16,
          background: '#051008',
        }}
      >
        {/* Video */}
        <video
          ref={videoRef}
          muted
          playsInline
          onEnded={advanceVideo}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: fadeIn ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />

        {/* Green overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(ellipse at 30% 60%, rgba(16,185,129,0.3) 0%, transparent 60%),
                              radial-gradient(ellipse at 75% 30%, rgba(4,120,87,0.35) 0%, transparent 55%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Dots indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 6,
          }}
        >
          {VIDEOS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setVidIdx(i); setFadeIn(true) }}
              style={{
                width: i === vidIdx ? 20 : 6,
                height: 6,
                borderRadius: 3,
                border: 'none',
                background: i === vidIdx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
