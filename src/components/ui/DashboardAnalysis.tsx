import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { t } from '../../design/tokens'
import { Button } from './Button'
import { InterpretationLetter } from './InterpretationLetter'
import { buildDashboardReading } from '../../insights/dashboardReading'
import type { DashboardReadingInput } from '../../insights/dashboardReading'
import type { Carta } from '../../insights/overviewInsights'

// ─── DashboardAnalysis ─────────────────────────────────────────────────────────
// Botão "Análise" do cabeçalho do dashboard: abre a carta de interpretação —
// a leitura do que os gráficos da tela estão mostrando.
//
// A carta sai do motor de leitura (`src/insights/*`) alimentado pelos MESMOS
// dados dos gráficos: tendência, pico, vale, concentração e dispersão entre
// séries. Nenhuma frase é inventada.
//
// É também o ponto de extensão da análise assistida por IA: a entrada
// (`DashboardReadingInput`) e a saída (`Carta`) já são o contrato; trocar o
// motor determinístico por um modelo não muda nem a tela nem este componente.

type DashboardAnalysisProps = {
  /** Recorte lido, exibido no cabeçalho e no rodapé da carta. */
  fonte?: string
} & (
  | {
      /** Dados dos blocos da tela — o motor monta a carta. */
      input: DashboardReadingInput
      carta?: never
    }
  | {
      /** Carta pronta, para telas com motor próprio (ex.: Painel Geral). */
      carta: Carta
      input?: never
    }
)

export function DashboardAnalysis({ input, carta, fonte }: DashboardAnalysisProps) {
  const [open, setOpen] = useState(false)

  // A carta é recalculada quando o recorte muda (filtro da tela), porque a
  // leitura precisa falar dos dados que estão na tela agora.
  const letter = useMemo(
    () => carta ?? buildDashboardReading(input as DashboardReadingInput),
    [carta, input],
  )

  return (
    <>
      <Button
        variant="secondary"
        size="md"
        icon={<Sparkles size={t.icon.xs} />}
        onClick={() => setOpen(true)}
        title="Leitura assistida do que os gráficos estão mostrando"
      >
        Análise
      </Button>

      <InterpretationLetter
        open={open}
        onClose={() => setOpen(false)}
        carta={letter}
        fonte={fonte}
        // A carta do motor genérico é montada com as séries já filtradas, então
        // ela acompanha o recorte; a de motor próprio (Painel Geral) é fixa.
        filterAware={input !== undefined}
      />
    </>
  )
}
