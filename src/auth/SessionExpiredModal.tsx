import React from 'react'
import { LogIn } from 'lucide-react'
import { t } from '../design/tokens'
import { useTheme } from '../context/ThemeContext'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { useSession } from './SessionContext'

// ─── Componente ──────────────────────────────────────────────────────────────

/**
 * Modal de sessão expirada.
 *
 * Exibe-se automaticamente quando `useSession().expired` é `true`.
 * Não pode ser fechado pelo overlay nem pelo ESC — o usuário é obrigado a
 * clicar em "Entrar novamente", garantindo que não permaneça em estado
 * inconsistente de autenticação.
 *
 * Conecte `SessionProvider.onRelogin` ao seu fluxo de re-autenticação
 * (ex.: redirecionar para `/login`, abrir formulário inline, etc.).
 *
 * @example
 * // Em App.tsx ou no root da aplicação — renderize como irmão do conteúdo,
 * // fora de qualquer PageCard ou layout, para que o zIndex do overlay funcione:
 *
 * <SessionProvider onRelogin={() => navigate('/login')}>
 *   <AppLayout />
 *   <SessionExpiredModal />
 * </SessionProvider>
 */
export function SessionExpiredModal() {
  const { colors }      = useTheme()
  const { expired, clear } = useSession()

  return (
    <Modal
      open={expired}
      onClose={() => {/* bloqueado intencionalmente — ver closeOnOverlay=false */}}
      closeOnOverlay={false}
      size="sm"
      title="Sessão expirada"
      footer={
        <Button
          variant="primary"
          icon={<LogIn size={15} />}
          onClick={clear}
        >
          Entrar novamente
        </Button>
      }
    >
      {/* aria-live="polite" garante que leitores de tela anunciem a mensagem
          mesmo quando o modal aparece sem foco inicial neste nó. */}
      <p
        aria-live="polite"
        style={{
          margin:     0,
          fontSize:   t.font.size.base,
          lineHeight: t.font.lineHeight.relaxed,
          color:      colors.textSecondary,
          fontFamily: t.font.family.sans,
        }}
      >
        Sua sessão expirou por inatividade.
        <br />
        Entre novamente para continuar de onde parou.
      </p>
    </Modal>
  )
}
