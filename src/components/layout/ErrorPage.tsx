import type { ReactNode } from 'react'
import { ChevronLeft, Home, RotateCw } from 'lucide-react'
import logoLight from '../../assets/Logo.svg'
import logoDark from '../../assets/Logo-white.svg'
import cowIllustration from '../../assets/404-cow.png'
import { Button } from '../ui/Button'
import { FormField } from '../ui/FormField'
import { Heading } from '../ui/Heading'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

/**
 * Primeira linha da descrição por status. Chave = status HTTP (ou apelido, como
 * `offline`). Fonte única da copy de erro — a tela que dispara o erro passa só o
 * status; sem mapeamento, cai em `FALLBACK_DESCRIPTION`.
 */
export const errorDescriptions: Record<string, string> = {
  '400': 'A solicitação enviada não pôde ser interpretada.',
  '401': 'Sua sessão expirou. Entre novamente para continuar.',
  '403': 'Você não tem permissão para acessar este recurso.',
  '404': 'Não encontramos o que buscava aqui.',
  '408': 'A operação demorou mais que o esperado.',
  '409': 'Este registro foi alterado por outra pessoa enquanto você editava.',
  '422': 'Alguns dados enviados não passaram na validação.',
  '429': 'Você fez muitas tentativas em pouco tempo.',
  '500': 'Algo falhou no servidor ao processar sua solicitação.',
  '502': 'Não conseguimos falar com o servidor.',
  '503': 'O serviço está temporariamente indisponível.',
  '504': 'O servidor demorou demais para responder.',
  '505': 'O servidor não suporta a versão do protocolo usada na requisição.',
  offline: 'Você parece estar sem conexão com a internet.',
}

const FALLBACK_DESCRIPTION = 'Não conseguimos concluir esta operação.'
const DEFAULT_TITLE = 'Algo não saiu como o esperado…'
const DEFAULT_ADVICE = 'Por favor, tente novamente em alguns instantes.'

interface ErrorPageProps {
  /** Código exibido em destaque — status HTTP ou apelido (`offline`). */
  status: string | number
  /** Título principal. Default: "Algo não saiu como o esperado…". */
  title?: string
  /** 1ª linha da descrição. Default: mensagem de `errorDescriptions[status]`. */
  description?: string
  /** 2ª linha da descrição. `null` remove a linha. */
  advice?: string | null
  /**
   * Corpo retornado pelo servidor (JSON, stacktrace, mensagem crua). Presente →
   * a página usa a variação "com retorno", exibindo o bloco copiável; ausente →
   * variação simples. Nunca formatar/estilizar esse bloco na tela chamadora.
   */
  payload?: string
  /** Rótulo do bloco de retorno. Default: "Retorno". */
  payloadLabel?: string
  /** Ação primária de recuperação (botão à direita). Sem ela, o botão não aparece. */
  onRetry?: () => void
  retryLabel?: string
  /** Volta para a tela inicial (botão à esquerda). Sem ela, o botão não aparece. */
  onHome?: () => void
  homeLabel?: string
  /** Ação "Voltar" do topo. Sem ela, o botão não aparece. */
  onBack?: () => void
  backLabel?: string
  /** Ilustração da coluna direita. Default: a vaca do GB CERNE. */
  illustration?: ReactNode
}

/**
 * Tela de erro standalone (fora do chassi autenticado) para qualquer status HTTP
 * e indisponibilidades — 400, 401, 403, 404, 5xx, offline. Duas variações, dadas
 * pela presença de `payload`:
 *
 *  • **simples** — status + título + descrição + ações;
 *  • **com retorno** — acrescenta o corpo devolvido pelo servidor em bloco
 *    copiável (`FormField variant="view" multiline`).
 *
 * A coluna de conteúdo é limitada a `t.layout.errorMaxWidth` (metade da área
 * útil, 540px): texto, bloco de retorno e o par de botões — cada botão com
 * metade dessa largura — compartilham exatamente a mesma medida.
 */
export function ErrorPage({
  status,
  title = DEFAULT_TITLE,
  description,
  advice = DEFAULT_ADVICE,
  payload,
  payloadLabel = 'Retorno',
  onRetry,
  retryLabel = 'Tentar novamente',
  onHome,
  homeLabel = 'Voltar ao início',
  onBack,
  backLabel = 'Voltar',
  illustration,
}: ErrorPageProps) {
  const { colors, isGbMode } = useTheme()
  const statusKey = String(status)
  // Busca em minúsculas: o apelido exibido pode vir capitalizado ("Offline")
  // enquanto a chave do mapa permanece normalizada.
  const resolvedDescription =
    description ?? errorDescriptions[statusKey.toLowerCase()] ?? FALLBACK_DESCRIPTION

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100dvh',
        boxSizing: 'border-box',
        padding: t.space[2],
        gap: t.space[2],
        background: colors.bg.canvas,
        color: colors.fg.default,
        fontFamily: t.font.family.sans,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: t.space[4],
          flexShrink: 0,
          height: t.layout.topbarHeight,
          padding: `0 ${t.space[4]}px`,
        }}
      >
        <img
          src={isGbMode ? logoDark : logoLight}
          alt="GB CERNE"
          style={{ display: 'block', height: t.space[7], width: 'auto' }}
        />
        {onBack && (
          <Button variant="ghost" icon={<ChevronLeft size={t.icon.sm} />} onClick={onBack}>
            {backLabel}
          </Button>
        )}
      </header>

      <div
        className="lg:grid-cols-2"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          // Uma coluna por padrão; `lg:grid-cols-2` (≥1024px) abre a coluna da
          // ilustração — por isso `gridTemplateColumns` NÃO pode vir inline aqui
          // (style inline venceria a classe e travaria o layout em 1 coluna).
          display: 'grid',
          alignItems: 'center',
          gap: t.space[8],
          // Recuo lateral elástico: 40px em desktop, encolhendo até 16px em
          // 360px — mantém a coluna de 540px respirando sem estourar a tela.
          padding: `${t.space[8]}px clamp(${t.space[4]}px, 4vw, ${t.space[10]}px)`,
          boxSizing: 'border-box',
          background: colors.bg.surface,
          borderRadius: t.radius['2xl'],
          boxShadow: isGbMode ? t.shadow.cardDark : t.shadow.card,
        }}
      >
        <section
          style={{
            minWidth: 0,
            width: '100%',
            maxWidth: t.layout.errorMaxWidth,
            marginInline: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: t.space[6],
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
            <Heading level={1} size="6xl" weight="extrabold" letterSpacing="-0.02em">
              {statusKey}
            </Heading>
            <Heading level={2} size="4xl" weight="normal" letterSpacing="-0.01em" style={{ lineHeight: t.font.lineHeight.tight }}>
              {title}
            </Heading>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
            <p style={{ margin: 0, fontSize: t.font.size.md, lineHeight: t.font.lineHeight.relaxed, color: colors.fg.muted }}>
              {resolvedDescription}
            </p>
            {advice && (
              <p style={{ margin: 0, fontSize: t.font.size.md, lineHeight: t.font.lineHeight.relaxed, color: colors.fg.muted }}>
                {advice}
              </p>
            )}
          </div>

          {payload && (
            <FormField
              variant="view"
              multiline
              label={payloadLabel}
              value={payload}
              viewMaxHeight={t.size.viewFieldMax}
            />
          )}

          {(onHome || onRetry) && (
            <div
              style={{
                display: 'grid',
                // Duas colunas iguais — cada botão com metade de
                // `t.layout.errorMaxWidth` menos o gap (540 − 16) / 2 = 262.
                // `auto-fill` preserva a trilha vazia quando só há uma ação (o
                // botão continua com metade da largura) e empilha em coluna
                // única quando a metade fica menor que `t.size.stepBtn`.
                gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${t.size.stepBtn}px), 1fr))`,
                gap: t.space[4],
              }}
            >
              {onHome && (
                <Button variant="secondary" block blockAlign="center" icon={<Home size={t.icon.sm} />} onClick={onHome}>
                  {homeLabel}
                </Button>
              )}
              {onRetry && (
                <Button block blockAlign="center" icon={<RotateCw size={t.icon.sm} />} onClick={onRetry}>
                  {retryLabel}
                </Button>
              )}
            </div>
          )}
        </section>

        <div
          className="hidden lg:flex"
          aria-hidden="true"
          style={{ minWidth: 0, alignItems: 'center', justifyContent: 'center' }}
        >
          {illustration ?? (
            // A arte tem fundo claro opaco (sem canal alfa): em light ela se
            // funde à superfície branca; no GBMode fica um painel claro — daí o
            // raio e a borda, para ler como ilustração emoldurada, não recorte
            // quebrado. Uma versão com fundo transparente dispensa a borda.
            <img
              src={cowIllustration}
              alt=""
              style={{
                display: 'block',
                width: '100%',
                maxWidth: t.layout.errorIllustrationMax,
                height: 'auto',
                maxHeight: '60vh',
                objectFit: 'contain',
                borderRadius: t.radius['2xl'],
                border: isGbMode ? `1px solid ${colors.border.default}` : undefined,
              }}
            />
          )}
        </div>
      </div>
    </main>
  )
}
