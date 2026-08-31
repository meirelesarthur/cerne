import { useMemo, useState } from 'react'
import { FilterSelect } from '../components/ui/FilterSelect'

/**
 * Foco de série dentro de um card de gráfico.
 *
 * Devolve as séries que devem ir ao gráfico e o seletor pronto para o slot
 * `action` do `DashboardCard`. Com "Todas as séries" o gráfico fica como está;
 * ao escolher uma, ela ocupa o gráfico inteiro — que é o ponto: comparar é uma
 * leitura, olhar uma série de perto é outra, e o eixo se reescala para a série
 * escolhida.
 *
 * Serve para bloco de VÁRIAS SÉRIES sobre o mesmo eixo (meses, semanas, horas,
 * setores). Em composição de item único — barra por categoria, donut — focar um
 * item deixaria uma barra/fatia sozinha: ali o valor do gráfico é justamente a
 * comparação entre as partes, e o recorte de um item se faz pelo filtro da tela,
 * que reflete em todos os blocos.
 *
 * O foco é estado de leitura, não filtro de dado: fica local, fora da URL.
 *
 * ```tsx
 * const rebanho = useSeriesFocus(rebanhoSeries)
 * <DashboardCard title="Evolução do rebanho" action={rebanho.selector}>
 *   <LineChart series={rebanho.series} labels={labels} />
 * </DashboardCard>
 * ```
 */
export function useSeriesFocus<T extends { name: string }>(
  series: T[],
  /** Rótulo da opção que mostra tudo. Default `Todas as séries`. */
  allLabel = 'Todas as séries',
): { series: T[]; selector: React.ReactNode; focused: string | null } {
  const [focus, setFocus] = useState(ALL)

  const visible = useMemo(
    () => (focus === ALL ? series : series.filter((serie) => serie.name === focus)),
    [focus, series],
  )

  // Uma série só não tem o que focar — o seletor não aparece.
  const selector = series.length < 2 ? null : (
    <FilterSelect
      ariaLabel="Focar uma série do gráfico"
      options={[
        { value: ALL, label: allLabel },
        ...series.map((serie) => ({ value: serie.name, label: serie.name })),
      ]}
      value={focus}
      onChange={setFocus}
    />
  )

  return {
    // Filtro que não casa (série saiu do recorte) cai de volta para tudo, em
    // vez de deixar o card vazio.
    series: visible.length ? visible : series,
    selector,
    focused: focus === ALL ? null : focus,
  }
}

const ALL = '__todas__'
