import { t } from '../../design/tokens'

type SSOProvider = 'google' | 'microsoft'

interface SSOButtonProps {
  provider: SSOProvider
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
}

const PROVIDER_CONFIG: Record<SSOProvider, { label: string; icon: React.ReactNode }> = {
  google: {
    label: 'Entrar com Google',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" width={18} height={18} aria-hidden="true">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
        <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
    ),
  },
  microsoft: {
    label: 'Entrar com Microsoft',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" width={18} height={18} aria-hidden="true">
        <rect x="0" y="0" width="8.5" height="8.5" fill="#F25022"/>
        <rect x="9.5" y="0" width="8.5" height="8.5" fill="#7FBA00"/>
        <rect x="0" y="9.5" width="8.5" height="8.5" fill="#00A4EF"/>
        <rect x="9.5" y="9.5" width="8.5" height="8.5" fill="#FFB900"/>
      </svg>
    ),
  },
}

export function SSOButton({ provider, onClick, loading, disabled }: SSOButtonProps) {
  const { label, icon } = PROVIDER_CONFIG[provider]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      style={{
        width: '100%',
        height: 46,
        border: `1.5px solid ${t.color.neutral[200]}`,
        background: t.color.neutral[0],
        borderRadius: t.radius.xl,
        fontSize: t.font.size.md,
        fontWeight: t.font.weight.medium,
        fontFamily: t.font.family.sans,
        color: t.color.neutral[700],
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.space[2] + 2,
        opacity: disabled ? 0.5 : 1,
        transition: `border-color ${t.animation.duration.fast} ${t.animation.easing.standard},
                     background ${t.animation.duration.fast} ${t.animation.easing.standard},
                     box-shadow ${t.animation.duration.normal} ${t.animation.easing.standard}`,
      }}
      onMouseEnter={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.borderColor = t.color.neutral[300]
          e.currentTarget.style.background = t.color.neutral[50]
          e.currentTarget.style.boxShadow = t.shadow.sm
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = t.color.neutral[200]
        e.currentTarget.style.background = t.color.neutral[0]
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {loading ? (
        <span
          aria-hidden="true"
          style={{
            width: 18,
            height: 18,
            border: `2px solid ${t.color.neutral[200]}`,
            borderTopColor: t.color.neutral[500],
            borderRadius: '50%',
            animation: 'sso-spin 0.7s linear infinite',
          }}
        />
      ) : icon}
      {label}
    </button>
  )
}
