import { Sparkles } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Modal } from './Modal'
import type { Carta } from '../../insights/overviewInsights'

interface InterpretationLetterProps {
  open:    boolean
  onClose: () => void
  carta:   Carta
  /** Nome da base/fonte exibido no cabeçalho e rodapé (ex.: nome da fazenda). */
  fonte?:  string
}

/**
 * Carta de Interpretação — leitura técnica assistida dos dados de um dashboard.
 * Renderiza a estrutura editorial fixa produzida pelo motor de insights
 * (`src/insights/*`): leituras individuais, leitura cruzada, conclusão,
 * sugestões, provocações e glossário, com os disclaimers de governança.
 */
export function InterpretationLetter({ open, onClose, carta, fonte }: InterpretationLetterProps) {
  const { colors } = useTheme()

  const geradaEm = new Date().toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const noteStyle = (accent: string): React.CSSProperties => ({
    fontSize:     t.font.size.xs,
    color:        colors.fg.muted,
    fontFamily:   t.font.family.sans,
    lineHeight:   t.font.lineHeight.normal,
    background:   colors.bg.subtle,
    borderLeft:   `3px solid ${accent}`,
    borderRadius: t.radius.md,
    padding:      `${t.space[2]}px ${t.space[3]}px`,
    marginBottom: t.space[2],
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Carta de interpretação — ${carta.title}`}
      subtitle="Leitura técnica assistida por IA · dados gerais do painel"
    >
      {/* Metadados */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[2],
        marginBottom: t.space[4],
      }}>
        {[
          ['Escopo', carta.scope],
          ['Fonte', fonte ?? 'Base em uso no painel'],
          ['Gerada em', geradaEm],
          ['Seções', `${carta.sections.length} + glossário`],
        ].map(([label, value]) => (
          <div key={label} style={{ fontFamily: t.font.family.sans }}>
            <div style={{ fontSize: t.font.size['3xs'], color: colors.fg.subtle, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            <div style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.medium, color: colors.fg.default }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Disclaimers de governança */}
      <div style={noteStyle(t.color.feedback.info.solid)}>
        <strong style={{ color: colors.fg.default }}>Leitura técnica gerada automaticamente.</strong>{' '}
        Este documento é um artefato analítico de apoio à decisão: oferece interpretações e hipóteses a
        partir dos números, mas não substitui a leitura, o julgamento e a interpretação do leitor.
        Trate as conclusões como ponto de partida, não como veredicto.
      </div>
      <div style={{ ...noteStyle(t.color.feedback.warning.solid), marginBottom: t.space[4] }}>
        <strong style={{ color: colors.fg.default }}>Escopo fixo.</strong>{' '}
        Esta carta interpreta o período completo do painel; alterar filtros de visualização não altera
        este conteúdo. Ao atualizar os dados da base, uma nova carta é gerada automaticamente.
      </div>

      {/* Seções numeradas */}
      {carta.sections.map((sec, i) => (
        <div key={sec.title} style={{ marginBottom: t.space[4], fontFamily: t.font.family.sans }}>
          <div style={{
            fontSize: t.font.size.sm, fontWeight: t.font.weight.bold, color: colors.fg.default,
            paddingBottom: t.space[1], borderBottom: `1px solid ${colors.border.subtle}`, marginBottom: t.space[2],
          }}>
            {i + 1}. {sec.title}
          </div>
          {sec.paragraphs?.map((p, j) => (
            <p key={j} style={{
              fontSize: t.font.size.sm, color: colors.fg.muted, lineHeight: t.font.lineHeight.relaxed,
              margin: `0 0 ${t.space[2]}px`,
            }}>
              {p}
            </p>
          ))}
          {sec.bullets && (
            <ul style={{ margin: 0, paddingLeft: t.space[5] }}>
              {sec.bullets.map((b, j) => (
                <li key={j} style={{
                  fontSize: t.font.size.sm, color: colors.fg.muted, lineHeight: t.font.lineHeight.relaxed,
                  marginBottom: t.space[1],
                }}>
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {/* Glossário */}
      <div style={{ fontFamily: t.font.family.sans, marginBottom: t.space[3] }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: t.space[1],
          fontSize: t.font.size.sm, fontWeight: t.font.weight.bold, color: colors.fg.default,
          paddingBottom: t.space[1], borderBottom: `1px solid ${colors.border.subtle}`, marginBottom: t.space[2],
        }}>
          <Sparkles size={13} color={colors.accent.default as string} aria-hidden="true" />
          Conceitos e definições
        </div>
        {carta.glossary.map(g => (
          <p key={g.term} style={{ fontSize: t.font.size.xs, color: colors.fg.muted, lineHeight: t.font.lineHeight.relaxed, margin: `0 0 ${t.space[1]}px` }}>
            <strong style={{ color: colors.fg.default }}>{g.term}</strong> — {g.def}
          </p>
        ))}
      </div>

      {/* Rodapé */}
      <div style={{
        fontSize: t.font.size['3xs'], color: colors.fg.subtle, fontFamily: t.font.family.sans,
        paddingTop: t.space[2], borderTop: `1px solid ${colors.border.subtle}`, lineHeight: t.font.lineHeight.normal,
      }}>
        Carta gerada automaticamente pelo GB CERNE a partir da base em uso · leitura técnica assistida —
        não substitui a análise humana · escopo: dados gerais do painel, independente de filtros.
      </div>
    </Modal>
  )
}
