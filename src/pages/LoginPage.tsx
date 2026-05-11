import React, { useState } from 'react'

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email] = useState('admin@gbcerne.com.br')
  const [password] = useState('agro@2025')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        fontFamily: "'Outfit', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Left panel — form */}
      <div
        style={{
          width: '42%',
          minWidth: 380,
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 56px',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div
          style={{
            position: 'absolute',
            top: 32,
            left: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: '#059669',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M12 2v20M3 7l9 5 9-5" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#171717',
              letterSpacing: '-0.3px',
            }}
          >
            GB CERNE
          </span>
        </div>

        {/* Form container */}
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: '#171717',
              margin: '0 0 32px',
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
            }}
          >
            Bem-vindo ao GB CERNE!
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
              readOnly
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
                readOnly
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

      {/* Right panel — plantation image */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/*
          Substitua o background abaixo por:
          background: `url('/sua-imagem-plantacao.jpg') center/cover no-repeat`
        */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 25%, #047857 55%, #059669 80%, #10b981 100%)',
          }}
        />

        {/* Overlay texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(ellipse at 30% 60%, rgba(16,185,129,0.35) 0%, transparent 60%),
                              radial-gradient(ellipse at 75% 30%, rgba(4,120,87,0.4) 0%, transparent 55%)`,
          }}
        />

        {/* Centered label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: 'white',
                margin: 0,
                letterSpacing: '-0.5px',
                textShadow: '0 2px 12px rgba(0,0,0,0.25)',
              }}
            >
              GB CERNE
            </p>
            <p
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.7)',
                margin: '6px 0 0',
                fontWeight: 400,
                letterSpacing: '0.5px',
              }}
            >
              Gestão Agrícola Inteligente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
