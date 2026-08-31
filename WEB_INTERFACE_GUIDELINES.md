# CERNE — Web Interface Guidelines

> Documento vivo de padrões de interface para o painel GB CERNE.
> Fonte única de referência visual do projeto — o `CLAUDE.md` aponta para este arquivo.
> Combina as Leis e Regras internas do projeto com boas práticas de design system.
> Toda geração de código (humana ou por IA) deve seguir estas regras. Em caso de dúvida, releia a Lei ou Regra correspondente antes de inventar um padrão novo.

---

## Índice

1. [As Cinco Leis do Projeto](#1-as-cinco-leis-do-projeto)
2. [Padrões de Implementação (Modelo Canônico)](#2-padrões-de-implementação-modelo-canônico)
3. [Sistema de Tokens](#3-sistema-de-tokens)
4. [Catálogo de Componentes](#4-catálogo-de-componentes)
5. [Tipografia e Conteúdo](#5-tipografia-e-conteúdo)
6. [Layout e Responsividade](#6-layout-e-responsividade)
7. [Interações e Acessibilidade](#7-interações-e-acessibilidade)
8. [Formulários](#8-formulários)
9. [Animações e Transições](#9-animações-e-transições)
10. [Estados da UI](#10-estados-da-ui)
11. [Temas — Light e GBMode](#11-temas--light-e-gbmode)
12. [Performance](#12-performance)
13. [Copy e Mensagens de Interface](#13-copy-e-mensagens-de-interface)
14. [Governança e Commits](#14-governança-e-commits)

---

## 1. As Cinco Leis do Projeto

Invioláveis. Aplicam-se a toda geração de código, revisão de PR e modificação de componente neste projeto.

### Lei 1 — Component-First

Todo elemento visível na tela é um componente de `src/components/ui/`. Vale em qualquer contexto — listagem, formulário, modal, dashboard — sem exceção.

**Proibido usar diretamente em páginas:** `<button>`, `<input>`, `<select>`, `<table>`, `<thead>`, `<tr>`, `<td>`, `<h1>`–`<h6>`.

- Ao criar uma tela nova: apenas **importar e chamar** componentes existentes.
- Componente necessário não existe no catálogo → criá-lo em `src/components/ui/` **antes** de usá-lo na tela.
- Catálogo completo → [Seção 4](#4-catálogo-de-componentes).

### Lei 2 — Fonte Única de Verdade (Propagação Global)

Alterações em `src/components/ui/` refletem automaticamente em todas as telas — esse é o objetivo.

**Proibido em páginas/telas:**
- Sobrescrever estilos com `style={}` inline sobre um componente existente.
- Duplicar lógica que o componente já oferece via prop (ex.: spinner manual quando `Button` tem `loading`).
- Clonar/reimplementar um componente UI dentro de uma página.

Extensão de comportamento = **prop nova no componente do kit**, com default que preserva o comportamento atual — nunca patch local. Exemplo aplicado: `StepFooter` ganhou `backDisabled?` para permitir "Cancelar" habilitado na 1ª etapa, sem quebrar telas que dependiam do default.

### Lei 3 — Fonte & Tokenização Acima de Tudo

**Tipografia:** única fonte permitida é **Outfit**. Não usar `font-montserrat`, fontes do sistema ou qualquer alternativa como valor de apresentação.

**Tokens:** todo valor de design (cor, espaço, raio, sombra, tamanho de fonte, peso) vem de `src/design/tokens.ts` via `t.*`.

```ts
// Correto
color: t.color.brand[600]
fontSize: t.font.size.sm
padding: t.space[4]

// Violação — hardcoded fora do arquivo de tokens
color: '#059669'
fontSize: '0.875rem'
padding: '16px'
```

Valores hardcoded fora de `src/design/tokens.ts` são violação de política.

> **Risco conhecido:** `tailwind.config.ts` (raiz do repo) **não importa** `src/design/tokens.ts` — define sua própria paleta `emerald` e seus próprios `borderRadius`/`boxShadow` como literais soltos, que coincidem parcialmente com `tokens.ts` mas já divergem em alguns stops (ex.: `emerald[400]` ≠ `primitive.brand[400]`). `tokens.ts` é a fonte única declarada (Lei 3/5) — tratar qualquer uso de classe Tailwind de cor/sombra/raio como suspeito até confirmar que bate com `t.*`; preferir sempre a prop/style vinda de `t.*` a uma classe utilitária do Tailwind para esses valores.

### Lei 4 — Commits Obrigatórios, Push sob Demanda

Após toda mudança concluída, um commit **deve ser criado imediatamente** — sem aguardar solicitação.

- Push **nunca** é feito automaticamente — só quando o usuário solicitar explicitamente.
- Mensagens no padrão Conventional Commits (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`, etc.).
- Um commit por unidade lógica de mudança — não acumular alterações não relacionadas no mesmo commit.

### Lei 5 — Tokens Interoperáveis no Padrão W3C DTCG

`src/design/tokens.ts` é a **fonte única** dos tokens; sua exportação para o ecossistema de design (Figma, Supernova) **deve sempre obedecer ao padrão W3C DTCG** (Design Tokens Community Group). A direção do fluxo é **imutável**: o código define, Figma e Supernova consomem — nunca o contrário.

**Pipeline canônico:**
`tokens.ts` → `npm run tokens:export` → `tokens/tokens.json` (DTCG) → Tokens Studio → Figma Variables → Supernova

- Toda alteração em `tokens.ts` exige rodar `npm run tokens:export` e **commitar o `tokens/tokens.json` regenerado** na mesma unidade lógica — o JSON nunca pode divergir do `.ts`.
- O exportador (`scripts/export-tokens-dtcg.ts`) só emite `$type` **válidos no DTCG**: `color`, `dimension`, `number`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `strokeStyle`, `border`, `transition`, `shadow`, `gradient`, `typography`. **Proibido** inventar tipos fora dessa lista (ex.: `borderRadius` → use `dimension`).
- Valores de tipos compostos seguem a forma estrutural do DTCG, **nunca string CSS crua**: `cubicBezier` → array `[x1,y1,x2,y2]`; `duration` → `{ value, unit }`; `shadow` → `{ color, offsetX, offsetY, blur, spread }` (multicamada → array); `transition` → `{ duration, delay, timingFunction }`; `border` → `{ color, width, style }`.
- Token novo em `tokens.ts` → **mapear no exportador** com o `$type` correto antes de concluir a mudança — token sem mapeamento DTCG é entrega incompleta.
- Ajustes via Figma (Tokens Studio → Push) entram como **PR** que atualiza `tokens.ts`; jamais editar token direto no Figma como fonte.

---

## 2. Padrões de Implementação (Modelo Canônico)

Aplicação obrigatória ao criar telas novas ou estender existentes — escalar sempre sobre o mesmo modelo, nunca reinventando primitivas localmente.

### Regra A — Proibido reimplementar primitiva que já existe no catálogo

Antes de escrever qualquer JSX de tela, verifique o catálogo da [Seção 4](#4-catálogo-de-componentes). Casos concretos já corrigidos (não repetir):

| ❌ Nunca crie localmente | ✅ Use sempre |
|---|---|
| Modal de exclusão inline / `OverlayModal` local | `ConfirmDialog` (ou `TypedConfirmDialog` para exclusões em massa de maior risco) |
| `ActionBtn` / botão de ação de linha estilizado | `IconButton` |
| `DropdownItem` + menu absoluto + estado de abertura manual | `DropdownMenu` |
| `useToast`/`ToastMsg`/`TOAST_BG` locais | `useToast` + `ToastContainer` de `ui/Toast` |
| `EmptyState` duplicado dentro da página | `EmptyState` |
| Paginação custom com `<select>` de linhas | `Pagination` (tem `showPageSizeSelector`) |
| Spinner manual / texto "Aguarde..." | prop `loading` do `Button` |
| Avatar `<div>` com iniciais + gradiente | `Avatar` |
| Breadcrumb `<nav>` inline | `Breadcrumb` |
| Tooltip inline com `position: fixed` | `Tooltip` |
| Card único de dashboard com `HDivider`/`VDivider` internos | `DashboardGrid` + `DashboardCard` |
| KPI de dashboard montado à mão (rótulo + valor + `Trend`) | `DashboardKpiCard` |
| `<h1>`–`<h6>` cru estilizado | `Heading` (ou `PageHeader`/`FormPageHeader`) |
| Tabela que precisa virar cards no mobile, feita na mão | `ResponsiveDataTable` |
| Busca + chips de filtro + "Limpar tudo" remontados na página | `ListToolbar` ou `TableToolbar` |

Primitiva não existe → criar em `src/components/ui/` com story, tokens e suporte aos dois temas **antes** de usá-la — nunca inline na página.

### Regra B — Composição canônica de Listagens

Referência: `FazendasLista.tsx`. Grid manual é permitido quando o layout exige (árvore, cards), mas as primitivas ao redor são sempre do kit:

```
PageContainer (style={{ paddingBottom: 0 }})
  └── PageCard                          ← casca padrão: altura do submenu + scroll só interno
        └── PageHeader (title, count, ação primária = Button)
        └── [KPI/Summary bar opcional] — Skeleton enquanto isLoading
        └── Toolbar: TableSearchInput · FilterChip(s) · "Limpar tudo" (Button ghost) · FilterButton
        └── isLoading → Skeleton  |  vazio → EmptyState  |  dados → tabela/grid + Pagination
  └── ConfirmDialog (exclusão)  ·  ToastContainer  ·  FilterDrawer > FormSelect   ← overlays FORA do PageCard
```

- **Casca obrigatória:** conteúdo vive dentro de `PageCard` (fundo, sombra por tema, altura `calc(100vh - t.layout.contentOffset)`, scroll interno). Overlays (`ConfirmDialog`, `Modal`, `ToastContainer`, `FilterDrawer`, `BulkActionBar`) ficam **fora** do `PageCard`, como irmãos dentro do `PageContainer`. Referência: `CentrosCustoLista.tsx`.
- Exclusão sempre com confirmação explícita (ação destrutiva).
- Sem rodapé "N. registros" redundante quando `PageHeader`/toolbar/`Pagination` já mostram o total.
- Sem componente local morto (ex.: `EmptyState` definido e não usado).

### Regra C — Composição canônica de CRUDs/Formulários

- **Casca:** `PageCard` (mesma altura do submenu + scroll interno), envolto por `PageContainer style={{ paddingBottom: 0 }}`. Barra de ações na prop `footer` do `PageCard` — pares de `Button` no footer padrão; `StepFooter` no footer com `footerBare`. Referência: `CentroCustoCadastro.tsx`.
- **Cabeçalho:** `FormPageHeader` (title + subtitle + Voltar). Referência: `ProdutoForm.tsx`, `CentroCustoCadastro.tsx`.
- **Single-page denso:** campos agrupados em `CollapsibleSection`. Referência: `ProdutoForm.tsx`.
- **Multi-step:** `Stepper` + `StepHeader` (por etapa) + `StepFooter` (navegação). Referência: `FazendaCadastro.tsx`, `SafraCadastro.tsx`.
- **Campos:** `FormField` (texto), `FormSelect` (select), `ToggleSwitch`/`ToggleField` (boolean).
- Validação inline por campo, foco no primeiro erro ao submeter (ver [Seção 8](#8-formulários)).

> `CrudPattern`, `ReconciliationWorkspace`, `ReportWorkspace` e `EntityBoard` já existem no repositório como telas-padrão que montam esse fluxo inteiro (listagem+modal+exclusão, conciliação, relatório, kanban). São referência de composição consolidada, não primitivas para importar dentro de uma tela nova — ver observação na [Seção 4](#4-catálogo-de-componentes).

### Regra G — Composição canônica de Dashboards

Dashboard **não** usa a casca de listagem (`PageCard`). A casca é o `DashboardGrid`: cada
bloco é um card com fill próprio e o **canvas é o que forma os separadores** — sem
`HDivider`/`VDivider` entre blocos, sem card único embrulhando a tela.

```
DashboardGrid                          ← canvas sem fill próprio (bg.outer) + gap entre as fileiras
  └── DashboardHeader                  ← título + subtítulo + filtros, sobre o canvas
  └── DashboardRow wrap                ← fileira de KPIs
        └── DashboardKpiCard ×N        ← 1 KPI = 1 card (antes eram colunas com VDivider)
  └── DashboardRow                     ← fileira de blocos com pesos
        ├── DashboardCard flex={3}
        └── DashboardCard flex={2}
  └── DashboardRow
        ├── DashboardStack flex={1}    ← coluna de cards dentro da fileira
        └── DashboardStack width={320} ← coluna de largura fixa (painel lateral)
  └── DashboardCard                    ← bloco de largura total
isLoading → DashboardSkeleton          ← reproduz a própria grade (sem layout shift)
overlays (InterpretationLetter, FilterDrawer, Modal) ficam FORA do DashboardGrid
```

- **Filtro é botão + drawer:** `DashboardFilters` no `actions` do cabeçalho — nunca uma
  fileira de `FilterSelect` soltos, que crescia com o número de filtros e não mostrava
  quantos estavam ativos. Cada campo declara seu `defaultValue`, que é o que define
  "filtro ativo" e o que o "Limpar" restaura.
- **Rótulo do bloco** vai na prop `title` do card; legenda, `Tabs` e botões
  vão na prop `action`. Nunca um `<div>` de título solto dentro do card.
- **Bloco que sangra** (mapa, imagem) usa `DashboardCard bare` — sem padding interno.
- **Sem borda no tema claro** (quem separa é o canvas); no GBMode o card mantém a hairline
  verde, necessária sobre fundo escuro. Isso vive no `DashboardCard` — não replicar na tela.
- **Largura é por espaço, não por janela:** a fileira não muda de layout num
  breakpoint. Cada card declara um mínimo (`t.size.dashCardMin` / `dashKpiMin`) e
  cresce pelo peso para ocupar a sobra; quando os mínimos não caibem, ele passa
  para a linha seguinte. Isso é obrigatório porque a área de conteúdo é 400–500px
  mais estreita que a janela (sidebar + submenu) — media query de viewport erra o
  alvo. `DashboardStack width` é largura PREFERIDA, não fixa.
- **Filtro vive na URL:** `useUrlFilter('periodo', '12')` no lugar de `useState`,
  para a visão filtrada ser recarregável e compartilhável. O valor default não
  aparece na query.
- **Cor de série por natureza do dado:** categorias distintas → `t.chart.series`
  em ordem (evitando `series[4]`, vermelho, em categoria não-negativa); níveis do
  mesmo indicador (total × subconjunto) → tons da mesma matiz; status e sinal →
  paleta de feedback; sobra de composição ("Outros") → neutro.
- **Altura de gráfico** vem de `t.size.chart.{sm,md,lg}` — nunca número solto. Cards na
  mesma fileira usam o mesmo degrau, senão um fecha antes do outro.
- **Texto dentro de forma fechada se ajusta à forma, não ao contrário:** o valor central
  do `DonutChart` escolhe o maior degrau de `t.font.size` que cabe no buraco do anel (e a
  legenda vira coluna à direita quando o card é retangular, liberando a altura inteira
  para o anel). Nunca deixar o número vazar nem abreviar o valor por conta própria — o
  formato do número é do chamador.
- **Rótulo em caixa de sentença**, em uma linha: "Ativos por categoria", não "Ativos por
  Categoria" nem "Cobertura por Produto (dias restantes) — itens críticos abaixo de 14
  dias". Detalhe/aviso vai como chip no `action`, não no título.
- **Valor de KPI** não recebe `valueSize`: o degrau sai do comprimento do texto
  (`DashboardKpiCard`), para "R$ 8,4M" e "Déficit Hídrico" conviverem na mesma fileira.
- **Legenda de série** é `ChartLegend` (no `action` do card) ou a legenda interna do
  próprio gráfico — nunca ponto + rótulo montados na tela.
- **Bloco de várias séries é `FocusableChartCard`:** o seletor no canto direito do
  rótulo isola uma série, que passa a ocupar o gráfico com o eixo reescalado nela —
  comparar é uma leitura, olhar uma série de perto é outra. O estado mora no card, não
  na tela (e não vai para a URL: é leitura, não recorte de dado). Não use em
  **composição de item único** (barra por categoria, donut): ali o valor do gráfico é
  justamente a comparação entre as partes, e isolar um item deixaria uma barra sozinha —
  esse recorte é papel do filtro da tela, que reflete em todos os blocos. Também não use
  quando o próprio bloco É a comparação de duas séries ("GMD: atual vs meta") — sem a
  outra, a série não diz nada.
- **Sem número repetido**: se o valor já está na fileira de KPIs, não repetir como herói
  dentro do card do gráfico.
- Referências: `OverviewPanel.tsx` (grade completa, 2 colunas), `DashAtivos.tsx` (grade
  simples), `Pluviometria.tsx` (grade + overlay de filtros).

### Regra D — Tokens disponíveis (use estes, não invente literais)

`src/design/tokens.ts` já cobre os casos que antes viravam hardcode. Antes de escrever um literal, procure o token — lista completa e valores reais na [Seção 3](#3-sistema-de-tokens). Atalhos mais usados:

- **Altura de gráfico:** `t.size.chart.{sm,md,lg}` (180/220/260) — escala fechada; blocos
  da MESMA fileira usam sempre o mesmo degrau. `t.size.sparkline` (40) na base do KPI.
- **Card de dashboard:** `t.size.dashCardMin` (300) / `t.size.dashKpiMin` (180) — largura
  mínima antes de a fileira quebrar a linha.
- **Trilha de barra de progresso:** `t.color.state.track.{base,gb}`.
- **Controle sobre mídia** (chip sobre mapa/imagem): `t.color.overlay.onMedia`.
- **Tamanhos de controle:** `t.size.control` (38, = input/select padrão), `controlSm` (34), `controlLg` (42), `btn.{sm,md,lg}`, `iconBtn.{sm,md,lg}`, `toggle.{track,trackHeight,thumb}`, `pageBtn` (34), `tableRow` (44), `drawer` (330), `stepBtn` (190).
- **Sombras de card:** `t.shadow.card` / `cardHover` / `cardDark` / `cardDarkHover` (idle/hover × light/GBMode).
- **Overlays:** `t.color.overlay.modal` / `t.color.overlay.drawer`.
- **GBMode:** `t.color.gb.surface` (superfície translúcida de card), `t.color.gb.accent` (verde claro de destaque).
- **Feedback semântico:** `t.color.feedback.{success,error,warning,info}.{bg,border,text,solid}` · `t.color.feedback.notice` (aviso pontual).
- **Badge/Tag auxiliares:** `t.color.accent.purple.{bg,text}`, `t.color.accent.cyan.{bg,text}`.
- **Estados de controle:** `t.color.state.disabled.{bg,text,border}`, `t.color.state.readonly.{bg,text,border}`.
- **Linhas de tabela:** `t.color.state.row.{hover,hoverGb,selected,selectedGb,striped,stripedGb}`.
- **Transições:** `t.transition.{fast,base,smooth,drawer}` — nunca `'0.2s'` solto.
- **Animação:** `t.animation.duration.{faster,fast,normal,slow,slower}`, `t.animation.easing.{standard,easeOut,easeIn,easeInOut,spring}`.
- **Delays de loading:** `t.delay.loadingShow` (225 ms, anti-flash) / `t.delay.loadingMin` (400 ms, anti-flicker).
- **Breakpoints:** `t.breakpoint.{xs,sm,md,lg,xl}` (360/768/1024/1280/1920).
- **Gráficos:** `t.chart.series[]` (8 cores categóricas), `t.chart.grid`/`gridGb`, `t.chart.revenue`/`expense` (cores fixas de receita/despesa).
- **Layout:** `t.layout.contentOffset` (88, base do `calc(100vh - …)` do `PageCard`), `t.layout.contentTop` (72), `t.layout.gutter` (16), `t.layout.formMaxWidth` (480).

Valor reutilizável sem token → **adicione o token primeiro** em `tokens.ts` e referencie — não espalhe o literal.

### Regra E — Tipografia em páginas

- Título de listagem → `PageHeader`. Título de formulário → `FormPageHeader`.
- Demais títulos (boas-vindas, seção interna de card) → `Heading` (`level` semântico + `size` tokenizado).
- Tamanho de fonte **sempre** de `t.font.size.*`. Falta um degrau na escala → ajustar a escala em `tokens.ts`, não hardcodar na tela.

### Regra F — Escada de reuso antes de escrever código novo

Antes de qualquer linha nova, resolva na ordem — pare no primeiro degrau que resolver:

1. **Precisa existir agora?** Não implemente para casos hipotéticos ou futuros — YAGNI.
2. **Já existe no projeto?** Componente em `ui/`, hook em `hooks/`, util em `utils/`, token em `tokens.ts` — reutilize, não reescreva.
3. **É lógica não-visual** (parsing, formatação, validação, data)? Prefira stdlib do JS/uma dependência já instalada antes de escrever um helper novo.
4. **É markup de tela?** Nunca elemento HTML cru nem lib nova — sempre um componente do catálogo `ui/` (Lei 1). Se não existir, criar lá primeiro.
5. **Resolve em poucas linhas sem nova abstração?** Não crie hook/util genérico para um único caso de uso.
6. **Só então:** implemente o mínimo que a tarefa pede — sem props, estados ou validações hipotéticas.

Preguiça é na solução, nunca na leitura: entenda o fluxo real que o código toca antes de escolher o degrau. Nunca é desculpa para cortar validação de fronteira de confiança, tratamento de perda de dados, segurança ou acessibilidade — esses ficam de fora da escada.

---

## 3. Sistema de Tokens

Arquivo de referência: [`src/design/tokens.ts`](src/design/tokens.ts)

### Cores (`t.color.*`)

Duas camadas: **primitivas** (ramps crus, sem papel definido) e **semânticas** (o que a maioria do código deve consumir).

| Namespace | Uso |
|---|---|
| `color.brand[600]` | Ação primária (`#059669`), botões, foco |
| `color.brand[700]` | Hover de botões primários |
| `color.brand[50]` / `[200]` | Tint de fundo/borda sobre brand |
| `color.neutral[0]` | Superfície máxima (cards light) |
| `color.neutral[50]`/`[100]` | Background de página / superfícies claras |
| `color.neutral[200]` | Borda padrão |
| `color.neutral[500]`/`[700]` | Texto muted / texto padrão |
| `color.neutral[950]` | Texto mais escuro |
| `color.feedback.{success,error,warning,info}` | `{bg, border, text, solid}` — `text` usa o stop 700 (não 600) para AA |
| `color.feedback.notice` | Aviso pontual/badge de destaque |
| `color.accent.{purple,cyan}` | `{bg, text}` — variantes não-semânticas de Badge/Tag |
| `color.state.{disabled,readonly}` | `{bg, text, border}` de controles |
| `color.state.row.*` | `hover`/`hoverGb`/`selected`/`selectedGb`/`striped`/`stripedGb` de linhas de tabela |
| `color.overlay.{modal,drawer}` | rgba do scrim atrás de Modal/Drawer |
| `color.gb.{accent,surface}` | Acento e superfície translúcida específicos do GBMode |

**Temas** (`useTheme().colors`, não `t.color` direto): `fg.{default,muted,subtle,onAccent}`, `bg.{canvas,outer,content,surface,subtle,input,sidebar}`, `border.{default,subtle}`, `accent.{default,hover,subtle}`, `nav.*`, `shadow` — um conjunto por tema (`light`/`gbMode`).

**Regra de hue consistency:** em superfícies com background de cor (ex: card brand, GBMode), bordas, sombras e texto de suporte devem ser tingidos ao mesmo hue — nunca usar cinza neutro puro sobre fundo colorido.

### Espaçamento (`t.space`)

Grid de 4px, alinhado ao Tailwind: chaves `0,1,2,3,4,5,6,7,8,9,10,12,14,16,20` → `0,4,8,12,16,20,24,28,32,36,40,48,56,64,80` px. **Atenção:** a escala pula alguns steps (10→12→14→16→20) — não presuma que todo número existe, confira antes de usar.

### Border Radius (`t.radius`)

| Token | px | Uso |
|---|---|---|
| `sm` | 4 | Badges, chips pequenos |
| `md` | 6 | — |
| `base` (`DEFAULT`) | 8 | Inputs, botões |
| `lg` | 10 | Tabelas com borda, cards internos |
| `xl` | 12 | Cards de formulário |
| `2xl` | 16 | Contêiner principal |
| `3xl` / `modal` | 20 | Modals, drawers, containers grandes |
| `4xl` | 24 | Containers expandidos |
| `full` | 9999 | Pills, avatares circulares |

**Regra de radii aninhados:** o radius de um filho deve ser ≤ radius do pai. Nunca usar `radius.xl` dentro de um container com `radius.sm`. Para alinhamento perfeito de curvas: `radius_filho = radius_pai − padding`.

### Sombras (`t.shadow`)

Mínimo 2 camadas para sombras realistas (ambient + direct):

| Token | Diferenciador |
|---|---|
| `sm`/`base`/`md`/`lg` | Elevação genérica crescente, tema claro |
| `brand` | Glow verde (foco/hover especial) |
| `overlay` | Sombra ampla e suave para modals/overlays |
| `modal` | Sombra mais fechada, focada em diálogos |
| `card`/`cardHover` | Card do dashboard — idle/hover, **tema claro** |
| `cardDark`/`cardDarkHover` | Mesmo par idle/hover para **GBMode** |
| `chartMark` | Drop-shadow de marcas de gráfico (barra/ponto) |

### Z-Index (`t.zIndex`)

| Token | Valor | Uso |
|---|---|---|
| `base` | 1 | Elementos padrão |
| `dropdown` | 100 | Menus, selects |
| `overlay` | 200 | Overlays de fundo |
| `drawer` | 201 | FilterDrawer, sidebars |
| `toast` | 9999 | Notificações globais |

### Transições e Animação

Usar `t.transition.*` / `t.animation.*` para consistência. Nunca `transition: all` — listar propriedades explicitamente.

| `t.transition.*` | Valor |
|---|---|
| `fast` | 0.1s ease |
| `base` | 0.15s ease |
| `smooth` | 0.2s ease |
| `drawer` | 0.25s cubic-bezier(0.4,0,0.2,1) |

| `t.animation.duration.*` | Valor |
|---|---|
| `faster` | 120ms |
| `fast` | 150ms |
| `normal` | 200ms |
| `slow` | 300ms |
| `slower` | 400ms |

| `t.animation.easing.*` | Valor | Uso |
|---|---|---|
| `standard`/`easeInOut` | cubic-bezier(0.4,0,0.2,1) | Mudanças de tamanho (mesma curva, dois nomes) |
| `easeOut` | cubic-bezier(0,0,0.2,1) | Elementos que entram |
| `easeIn` | cubic-bezier(0.4,0,1,1) | Elementos que saem |
| `spring` | cubic-bezier(0.34,1.56,0.64,1) | Drag, hover com "mola" |

### Tipografia (`t.font`)

- `family.sans` = `'Outfit', sans-serif` — única fonte permitida.
- `weight`: normal 400, medium 500, semibold 600, bold 700, extrabold 800.
- `lineHeight`: tight 1.2, snug 1.35, normal 1.5, relaxed 1.625.
- Escala de tamanho → ver [Seção 5](#5-tipografia-e-conteúdo).

### Tamanhos de Controle (`t.size.*`)

| Token | Valor | Uso |
|---|---|---|
| `control` / `controlSm` / `controlLg` | 38 / 34 / 42 | Altura de input/select |
| `btn.{sm,md,lg}` | 34 / 38 / 42 | Altura de botão |
| `iconBtn.{sm,md,lg}` | 26 / 32 / 38 | Botão só-ícone |
| `toggle.{track,trackHeight,thumb}` | 42 / 22 / 18 | Geometria do switch |
| `checkbox` | 18 | Caixa do checkbox |
| `calendarCell` | 34 | Célula de dia no DatePicker |
| `pageBtn` | 34 | Botão de paginação |
| `tableRow` | 44 | Altura fixa de linha de tabela |
| `drawer` | 330 | Largura do FilterDrawer |
| `stepBtn` | 190 | Largura mínima de botão no StepFooter |

### Outros namespaces úteis

| Token | Valor | Uso |
|---|---|---|
| `t.icon.{xs,sm,md,lg,xl}` | 13/15/17/20/26 | Ícone pareado ao texto adjacente |
| `t.border.{base,medium,brand,error}` | string CSS composta | Atalho de borda pronta |
| `t.delay.loadingShow`/`loadingMin` | 225ms / 400ms | Anti-flash / anti-flicker |
| `t.glow.brand`/`brandLg`/`error` | rgba glow | Focus ring (`brand` = padrão) |
| `t.breakpoint.{xs,sm,md,lg,xl}` | 360/768/1024/1280/1920 | Testes responsivos |
| `t.layout.contentOffset`/`contentTop`/`gutter`/`formMaxWidth` | 88/72/16/480 | Chassi de layout, base do `PageCard` |
| `t.chart.series[8]` | 8 hex | Paleta categórica estável para múltiplas séries |
| `t.chart.revenue`/`expense` | azul/vermelho fixos | Semântica financeira em gráficos |
| `t.chart.grid`/`gridGb` | rgba preto/branco | Linhas de grade do gráfico por tema |
| `t.component.dashboardTile.*` | 5 hex escuros | Tiles do painel geral |
| `t.component.login.*` | `leftBg`/`rightBg`/`accentGlow` | Split-screen da tela de login |

---

## 4. Catálogo de Componentes

Todos em `src/components/ui/`. Antes de criar um componente novo, procure aqui — a maioria dos casos já tem primitiva pronta.

### Layout & Casca de Página

| Componente | Uso |
|---|---|
| `PageContainer` | Wrapper externo de página com respiro padrão |
| `PageCard` | Casca padrão: altura fixa do submenu, scroll interno, header/footer opcionais |
| `PageHeader` | Cabeçalho de listagem: título, contagem, descrição, breadcrumb, ações |
| `FormPageHeader` | Cabeçalho de formulário: título, subtítulo, botão fechar/voltar |
| `Card` | Contêiner de superfície genérico com sombra/borda/raio configuráveis |
| `Divider` | Linha divisória horizontal com rótulo opcional |
| `SectionDividers` | Divisores H/V com gradiente esmaecido nas pontas |
| `DashboardGrid` | Canvas do dashboard: fundo que separa os blocos + gap entre fileiras |
| `DashboardHeader` | Cabeçalho de dashboard: título, subtítulo e filtros sobre o canvas |
| `DashboardRow` | Fileira de cards com pesos por `flex`, empilha abaixo de `md` |
| `DashboardStack` | Coluna de cards dentro de uma fileira (peso ou largura fixa) |
| `DashboardCard` | Bloco preenchido do dashboard: título, ação, `bare` para sangrar |
| `DashboardKpiCard` | KPI como card: rótulo, valor, `Trend`, sparkline opcional |
| `DashboardSkeleton` | Loading do dashboard reproduzindo a própria grade |
| `DashboardFilters` | Botão "Filtros" do cabeçalho + `FilterDrawer` lateral com os campos |
| `FocusableChartCard` | Bloco de gráfico com seletor de foco de série no canto do rótulo |

### Hooks do kit

Antes de escrever lógica de tela, veja se já existe (Regra F, degrau 2):

| Hook | Uso |
|---|---|
| `useTheme` | Cores do tema ativo + `isGbMode` (`src/context/ThemeContext`) |
| `useUrlFilter` | Filtro de tela espelhado na query string (deep-link) |
| `useDelayedLoading` | Guardas de loading: anti-flash (`t.delay.loadingShow`) e anti-flicker (`t.delay.loadingMin`) |
| `useChartScale` | Largura real medida do wrapper do gráfico — base do `viewBox` 1:1 |
| `usePrefersReducedMotion` | Anula transição/animação inline quando o SO pede menos movimento |
| `useMediaQuery` | Media query real onde `@media` não alcança (estilo inline). Em dashboard, prefira largura mínima de card + quebra de fileira |
| `useFocusTrap` | Prende o foco em modal/drawer aberto |
| `useSeriesFocus` | Foco de uma série dentro do card do gráfico — devolve as séries visíveis e o seletor (use `FocusableChartCard`, que já o encapsula) |

### Navegação & Progresso

| Componente | Uso |
|---|---|
| `Breadcrumb` | Trilha de navegação acessível |
| `Tabs` | Navegação por abas (pill/outline), com sync opcional na URL |
| `Stepper` | Indicador horizontal de progresso entre etapas, clicável nas concluídas |
| `StepHeader` | Título/subtítulo de uma etapa de formulário multi-step |
| `StepFooter` | Rodapé de navegação (voltar/avançar) do formulário multi-step |
| `Pagination` | Paginação offset (números) ou cursor (anterior/próximo) |
| `SortHeader` | Cabeçalho de coluna ordenável para tabelas em grid manual |
| `WorkflowTimeline` | Linha do tempo horizontal de etapas de processo com status |

### Formulários & Campos

| Componente | Uso |
|---|---|
| `FormField` | Input/textarea controlado com label, máscara, erro, estados |
| `FormSelect` | Select nativo estilizado com label, ícone, erro |
| `FormSection` | Agrupador de campos com título, divisor e grid de colunas |
| `CollapsibleSection` | Seção recolhível com contagem de campos, para formulários densos |
| `Checkbox` | Checkbox acessível com estado indeterminado |
| `CheckboxListField` | Lista plana de checkboxes com busca e contador de selecionados |
| `CategoryTreeField` | Árvore de categorias com checkbox por nível, expandir/marcar tudo |
| `RadioGroup` | Grupo de radio buttons, vertical/horizontal, com erro/hint |
| `ToggleSwitch` | Controle switch atômico (on/off) |
| `ToggleField` | Campo booleano denso: switch + rótulo + conteúdo condicional (usa `ToggleSwitch`) |
| `ToggleSection` | Seção de formulário inteira ativada por switch (usa `ToggleSwitch`) |
| `CurrencyField` | Campo monetário e percentual sobre `FormField` |
| `SecretField` | Campo senha/token com alternar mostrar/ocultar sobre `FormField` |
| `DatePicker` | Seletor de data e de intervalo, calendário popover em pt-BR |
| `SearchSelect` | Combobox de busca client-side, seleção única |
| `AsyncSearchSelect` | Combobox assíncrono com busca debounced/cancelamento sobre `SearchSelect` |
| `MultiSelectField` | Multiseleção pesquisável com chips removíveis (`SearchSelect` + `Tag`) |
| `FilterSelect` | Botão de filtro de valor único (radio-like), sem busca, para toolbars |
| `RepeaterList` | Lista dinâmica genérica de linhas com adicionar/remover |
| `AllocationEditor` | Editor de rateio de valores com aviso de saldo |
| `FileUpload` | Dropzone de upload com validação, progresso e lista de arquivos |

### Tabelas & Listagens

| Componente | Uso |
|---|---|
| `DataTable` | Tabela com ordenação, hierarquia expansível, estados loading/vazio |
| `ResponsiveDataTable` | Alterna `DataTable` (desktop) por cards (mobile, <768px) |
| `ListToolbar` | Busca + chips de filtro + "Limpar tudo" para listagens |
| `TableToolbar` | Exporta `TableSearchInput`, `FilterChip`, `FilterButton` para barras de listagem |
| `DetailGrid` | Grade somente-leitura de campos, com cópia e mascaramento sensível |
| `TreeView` | Árvore hierárquica expansível com ações de adicionar/editar/excluir nó |

> `ListToolbar` e `TableToolbar` cobrem o mesmo problema (busca + filtros de listagem) com composição diferente — confira as stories antes de escolher para não recriar a mesma barra duas vezes.

### Feedback & Estados

| Componente | Uso |
|---|---|
| `Badge` | Pill com variantes semânticas: success/danger/warning/neutral/info/purple/cyan |
| `Tag` | Chip genérico de categorização/metadados, com remoção opcional |
| `Trend` | Badge de variação percentual (alta/baixa) para KPIs |
| `StatusLegend` | Legenda inline de pontos coloridos por variante de `Badge` |
| `EmptyState` | Estado vazio/busca/erro com ícone, mensagem, ação de retry |
| `Skeleton` | Placeholder de carregamento: variantes text/rect/circle |
| `Spinner` | Indicador de carregamento rotativo, 3 tamanhos |
| `ProgressBar` | Barra fina no topo de card/seção: idle/loading/success/error |
| `Toast` | Sistema de notificação (`ToastContainer` + hook `useToast`), com ação e auto-close |
| `FeedbackBanner` | Banner de aviso inline (success/error/warning/info) com ação opcional |
| `AccountStatusBanner` | Banner de status de conta (trial/atraso/suspensa) com ação |
| `UpgradePrompt` | Bloco de upsell para recurso bloqueado por plano (card/inline) |
| `FeatureGate` | Renderiza children só se a feature estiver habilitada no plano |

> `Tag` (categorização geral) e `FilterChip` (exportado por `TableToolbar`, específico de filtro ativo) resolvem casos parecidos — `Tag` para metadados, `FilterChip` só para filtros de tabela.

### Overlays & Diálogos

| Componente | Uso |
|---|---|
| `Modal` | Diálogo overlay com focus trap, ESC, tamanhos sm/md/lg, slots header/footer |
| `ConfirmDialog` | Confirmação de ação destrutiva, composto sobre `Modal` |
| `TypedConfirmDialog` | Confirmação reforçada: exige digitar texto exato — exclusões em massa de maior risco |
| `DropdownMenu` | Menu de ações ancorado via portal, fecha em ESC/scroll/clique fora |
| `Tooltip` | Tooltip flutuante via portal, posição calculada, dismiss por Esc |
| `FilterDrawer` | Drawer lateral de filtros, foco preso, contador, ações limpar/aplicar |
| `BulkActionBar` | Barra flutuante de ações em massa para seleção em listagens |
| `ImportDialog` | Fluxo modal de importação: modelo → upload → validação → resultado |

### Gráficos & Visualização de Dados

| Componente | Uso |
|---|---|
| `BarChart` | Barras SVG vertical/horizontal, com grid, tooltip, responsividade |
| `GroupedBarChart` | Barras agrupadas SVG |
| `StackedBarChart` | Barras empilhadas SVG, vertical/horizontal |
| `LineChart` | Linha/área SVG multi-série |
| `DonutChart` | Donut SVG com hover, tooltip, rótulo central que se ajusta ao buraco e legenda ao lado (card largo) ou abaixo |
| `GaugeChart` | Medidor semicircular SVG proporcional a valor/máximo |
| `HeatmapChart` | Mapa de calor em grid, intensidade por opacidade |
| `SankeyFunnel` | Funil SVG com conectores de fluxo e tooltip por estágio |
| `SparklineArea` | Mini-gráfico de linha/área para tendências |
| `ChartCard` | Bloco de gráfico com expansão em modal (frame do `DashboardCard`) |
| `KpiStatCard` | Cartão de métrica com ícone, valor grande e chip de tendência |
| `ChartLegend` | Legenda de séries em HTML — ao lado do título do card (ponto ou traço) |
| `ChartSvgLegend` | Legenda de séries dentro do SVG do gráfico, com passo pelo texto |
| `MapView` | Mapa Leaflet somente-leitura: perímetro GeoJSON ou marcador de coordenada |

> **Tipografia em SVG:** o `font-size` como ATRIBUTO de apresentação perde para o CSS
> global do app — todo texto de gráfico renderizava 16px em vez do token. Em `<text>`/
> `<tspan>` o tamanho e o peso vão sempre em `style={{ … }}`.
>
> **Escala:** o `viewBox` de TODO gráfico do kit é casado à largura real medida
> (`useChartScale().width`), então 1 unidade = 1px: `height` é a altura renderizada de fato
> e cada fonte sai no px do token. Com `viewBox` fixo o mesmo valor rendia alturas
> diferentes conforme a largura do card — medido antes da correção: sparkline de 40px
> renderizando 22px, funil de 160 em 101, e gauge de 160 em 310. Eixo, padding e afinamento de rótulo saem de `src/utils/chartAxis.ts`
> (`niceAxisMax`/`niceAxisTicks`/`axisLabelPad`/`axisLabelStep`/`truncateAxisLabel`), que
> mede o texto de verdade em canvas em vez de estimar por caractere.

> Todos os gráficos SVG seguem o mesmo padrão interno (`viewBox` casado à largura, `useChartScale`, tooltip via hover, paleta `t.chart.series`) — ao criar um gráfico novo, siga esse padrão em vez de inventar um approach diferente. Exceção a confirmar: `HeatmapChart` recebe `colors`/`isGbMode` via prop em vez de `useTheme()` interno como os demais — checar antes de copiar esse componente como referência de tema.

### Ações & Identidade

| Componente | Uso |
|---|---|
| `Button` | Botão com variantes, tamanhos, `loading`, ícones |
| `IconButton` | Botão somente-ícone, com variantes/tamanhos/estado danger |
| `Avatar` | Iniciais em gradiente ou imagem com fallback |
| `Heading` | Título semântico h1–h6 tokenizado |
| `SSOButton` | Login social (Google/Microsoft) com estado loading |
| `FarmSwitcher` | Seletor de fazenda ativa via busca, integrado ao contexto de fazenda |

### Padrões de Página Completos (não são primitivas)

Estes componentes já montam várias primitivas do catálogo acima para entregar uma **tela ou fluxo inteiro**, não um bloco isolado. Use-os como referência de composição consolidada — não como algo a importar dentro de uma tela nova sem entender o que cada um assume:

| Componente | O que monta |
|---|---|
| `CrudPattern` | `PageContainer` + `PageCard` + `PageHeader` + `ListToolbar` + `ResponsiveDataTable` + `Pagination` + `Modal` + `FormSection`/`FormField` + `DetailGrid` + `DropdownMenu` + `EmptyState` + `ConfirmDialog` + `Toast` — listagem + CRUD completos numa função só |
| `ReconciliationWorkspace` | Duas colunas de cartões de movimento (`Badge`, `Button`, `EmptyState`) para vincular/criar lançamentos — tela de conciliação bancária |
| `ReportWorkspace` | `PageContainer` + `PageCard` + `PageHeader` + `FormSection` (filtros) + `FeedbackBanner` (erro) + `ResponsiveDataTable` (prévia) — fluxo filtrar → prévia → exportar |
| `EntityBoard` | `Badge` + `DropdownMenu` + `EmptyState` + `Tooltip` — quadro kanban drag-and-drop de entidades entre grupos |
| `InterpretationLetter` | `Modal` com uma carta analítica estruturada (metadados, seções, glossário, disclaimers) vinda do motor de insights — é uma tela de relatório dentro de um Modal |

---

## 5. Tipografia e Conteúdo

### Fonte

**Outfit** é a única fonte do projeto. Pesos disponíveis: 400, 500, 600, 700, 800.

```ts
fontFamily: t.font.family.sans  // 'Outfit, sans-serif'
```

### Hierarquia de Tamanhos (`t.font.size.*`)

| Token | px | Uso |
|---|---|---|
| `3xs` | 10 | Piso de canvas — rótulos de eixo em gráficos/SVG, nunca em UI |
| `2xs` | 11 | Idem — metadados de gráfico, nunca label/badge/nav |
| `xs` | 12 | Piso de UI — metadados, rodapés, labels de campo |
| `sm` | 13 | Labels de campos, badges |
| `base` | 14 | Corpo padrão — texto de tabela, formulários, listas |
| `md` | 16 | Títulos de card/seção |
| `lg` | 18 | Títulos de página secundários |
| `xl` | 20 | — |
| `2xl` | 24 | Títulos de `PageHeader` |
| `3xl` | 30 | KPIs, números de destaque |
| `4xl` | 38 | Números de destaque máximo |

### Regras de Conteúdo

- **Números tabulares:** em tabelas e comparações, usar `fontVariantNumeric: 'tabular-nums'` para alinhamento preciso.
- **Reticências tipográfica:** usar o caractere `…` (U+2026), nunca três pontos `...`.
- **Aspas curvas:** `"texto"` em vez de `"texto"` em conteúdo editorial.
- **Espaço non-breaking:** `10 kg`, `R$ 10,00`, `5 ha` — evitar quebra de linha entre número e unidade.
- **Evitar orfãs e viúvas** em textos longos de descrição.
- **Todos os estados desenhados:** toda tela deve ter layout definido para vazio, esparso, denso e com erro.

---

## 6. Layout e Responsividade

### Grid e Alinhamento

- Usar CSS Grid e Flexbox nativos — evitar dimensionamento via JS.
- **Alinhamento óptico:** ajustar ±1–2px quando percepção supera geometria perfeita (ex: ícones ao lado de texto).
- **Alinhamento deliberado:** cada elemento deve alinhar intencionalmente com algo — grid, baseline, borda ou centro óptico.

### Breakpoints de Teste (`t.breakpoint.*`)

Toda tela deve ser testada em:
- Mobile (`360px`): verificar que nenhum elemento vaza ou sobrepõe.
- Laptop (`1280px`): layout padrão de desenvolvimento.
- Wide (`1920px`): verificar que layouts não ficam excessivamente esticados.

### Barras de Scroll

- Corrigir `overflow` para evitar scrollbars indesejados.
- Em modals e drawers: aplicar `overscroll-behavior: contain` para evitar scroll da página mãe.

### Links e Navegação

- **Links verdadeiros:** usar `<a>` ou `<Link>` para navegação — nunca `<button>` ou `<div onClick>` para URLs.
- **Deep-link tudo:** filtros ativos, aba selecionada, página atual, painéis expandidos devem persistir na URL.
- Back/Forward do browser deve restaurar estado (incluindo posição de scroll).

---

## 7. Interações e Acessibilidade

### Teclado e Foco

- **100% operável por teclado** — todos os fluxos críticos devem funcionar sem mouse.
- Usar `:focus-visible` em vez de `:focus` para não mostrar foco em cliques via mouse.
- Focus ring padrão: `t.glow.brand`.
- **Focus traps:** modals e drawers devem prender o foco enquanto abertos.

### Alvos de Clique (Hit Targets)

- Desktop: mínimo **24×24px** por elemento interativo.
- Mobile/touch: mínimo **44×44px**.
- Sem dead zones: se a área visual é interativa, toda ela deve ser clicável.

### Estados de Loading

- Delay inicial antes de mostrar loading: `t.delay.loadingShow` (~225ms, evita flash em operações rápidas).
- Tempo mínimo visível do indicador: `t.delay.loadingMin` (~400ms, evita flicker).
- Botões em loading mantêm o rótulo original + indicador visual — implementado em `Button` via prop `loading`, nunca reimplementar.

### Atualizações Otimistas

- UI responde imediatamente à ação do usuário.
- Reconciliar com resposta do servidor ao receber.
- Em caso de erro: mostrar opção de **Undo** ou notificação clara.

### Ações Destrutivas

- Sempre exigir confirmação explícita via `ConfirmDialog` (ou `TypedConfirmDialog` para exclusão em massa de maior risco).
- Usar `Button` variant `destructive` — nunca estilizar um botão de exclusão como primário.

### Acessibilidade Semântica

- **Semântica antes de ARIA:** preferir `<button>`, `<a>`, `<label>`, `<table>` nativos — dentro do componente do kit, não na página (Lei 1).
- Headings hierárquicos: a estrutura `h1 → h2 → h3` deve ser lógica e nunca pular níveis.
- `IconButton` sempre com `aria-label` descritivo; elementos decorativos recebem `aria-hidden="true"`.
- Atualizações assíncronas (toasts, validação inline) anunciadas com `aria-live="polite"`.

### Mobile

- Inputs com `font-size ≥ 16px` para evitar auto-zoom no iOS Safari.
- Usar `touch-action: manipulation` em controles para eliminar delay de double-tap.
- Nunca desabilitar zoom do browser nem bloquear `paste` em campos.

---

## 8. Formulários

### Comportamento de Submissão

- `Enter` submete quando há um único campo focado; no último campo em formulários multi-campo.
- `<textarea>`: `Ctrl/⌘+Enter` submete; `Enter` insere nova linha.
- Submit habilitado até o início da request; desabilitar **durante** + mostrar spinner.
- Nunca pré-desabilitar submit — permitir submissão incompleta para exibir feedback de validação.

### Labels e Campos

- Todo campo tem `<label>` associado — `FormField`/`FormSelect` já implementam isso, usar sempre.
- Erros exibidos **próximos ao campo**; ao submeter com erros, focar o **primeiro campo com erro**.

### Validação

- Não bloquear digitação — mostrar feedback após blur ou submit.
- Mensagens guiam a correção: não "campo inválido" — "CPF deve ter 11 dígitos".
- `spellcheck="false"` em e-mails, códigos, usernames, tokens de API.
- `trim()` antes de validar — evita erro por espaço acidental.

### Preenchimento Automático

- Sempre definir `autocomplete` e `name` significativos para habilitar autofill do browser.
- Não disparar gerenciadores de senha em campos não-auth.

### Inputs

- `type`/`inputMode` corretos: numérico → `type="text" inputMode="numeric"`; telefone → `type="tel"`; email → `type="email"`.
- Placeholder como **exemplo** de formato, não como label.

---

## 9. Animações e Transições

### Princípios

- Animar apenas quando **clarifica causa/efeito** ou adiciona **delícia deliberada** — nunca decorativo sem propósito.
- Respeitar `prefers-reduced-motion`: fornecer variante reduzida ou desabilitar.

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

### Propriedades Seguras (GPU-accelerated)

Animar **apenas** `transform`, `opacity`, `filter` — evitar `width`, `height`, `top`, `left`, `margin`, `padding` (causam reflow).

### Transform Origin

Ancorar o movimento onde ele começa fisicamente: dropdown que abre abaixo → `top center`; modal que cresce do centro → `center center`; drawer lateral → `right center`.

### Easing e Duração

Usar sempre `t.animation.easing.*` e `t.animation.duration.*` — ver tabelas completas na [Seção 3](#3-sistema-de-tokens). Nunca hardcodar curvas ou `'0.2s'` solto.

### Regras Adicionais

- Animações devem ser **canceláveis** por input do usuário.
- Nunca usar `transition: all` — listar propriedades explicitamente.
- Evitar autoplay — animar em resposta a ações do usuário.

---

## 10. Estados da UI

Todo componente e toda tela deve ter **todos os estados desenhados** antes de ir para produção:

| Estado | Implementação |
|---|---|
| Loading | `Skeleton` (listas/cards) ou prop `loading` do `Button`, atrás de `useDelayedLoading` |
| Vazio | `EmptyState` com mensagem + ação de recuperação |
| Erro | Mensagem orientada à solução + ação de retry |
| Sucesso | `Toast` ou `Badge` success |
| Esparso (1–3 itens) | Layout bonito, não quebrado |
| Denso (+500 itens) | Paginação + virtualização quando necessário |

- Skeletons refletem a estrutura real do conteúdo — evitar placeholder genérico que causa layout shift.
- Toda tela oferece próximo passo ou caminho de recuperação (sem dead ends): lista vazia → "Cadastrar primeiro item"; erro de rede → "Tentar novamente"; sem permissão → link para solicitar acesso.
- `ProgressBar` no topo de cards/seções com operação em andamento.

---

### Níveis de fundo do chassi

Três degraus, do mais externo ao conteúdo (tema claro):

| Nível | Token | Light | Onde aparece |
|---|---|---|---|
| Fundo do app | `bg.canvas` | `#E8E8E8` | Raiz atrás de tudo (chassi, Login, ErrorPage) |
| Segundo nível | `bg.outer` | `#F2F2F2` | Card externo do chassi — moldura, faixa da Topbar e canvas do `DashboardGrid` |
| Menus e feature | `bg.sidebar` / `bg.content` | `#FFFFFF` | Sidebar, SecondaryNav e a área onde a tela é renderizada |

`bg.content` existe separado de `bg.surface` porque no GBMode ele acompanha o
`outer`: se a área de conteúdo tivesse a cor de superfície, o `PageCard` ficaria
da mesma cor do próprio fundo e desapareceria.

O canvas do dashboard **não tem fill próprio**: assume o `bg.outer`, o mesmo dos
vãos e da faixa da Topbar em volta, e sem raio. Assim ele não lê como uma folha
posta sobre a tela — continua na moldura do chassi, e as únicas superfícies que
sobram são os blocos.

## 11. Temas — Light e GBMode

Gerenciado por `src/context/ThemeContext.tsx`. Acessado via `useTheme()`.

| Propriedade | Light | GBMode |
|---|---|---|
| Background de página | `#f5f5f5` | `#051008` |
| Superfície (cards) | `#ffffff` | `#0e2a1d` |
| Brand principal | `#059669` | `#10b981` |
| Aplicação | `data-theme="light"` | `data-theme="gb"` |

### Regras de Tema

- Todo componente em `src/components/ui/` deve suportar **ambos os temas**.
- Usar `useTheme().colors` para superfícies e `isGbMode` para valores específicos do tema escuro.
- Nunca hardcodar cores que dependem do tema — sempre via tokens ou `theme.colors`.
- Em GBMode: bordas, sombras e textos de suporte usam hues verdes — nunca cinza neutro.
- `color-scheme: dark` no `<html>` quando GBMode ativo (alinha scrollbars/controles nativos do OS).

---

## 12. Performance

### Renderização

- Monitorar re-renders com React DevTools.
- `useMemo`/`useCallback` apenas onde profiling confirmar necessidade — não prematuramente.
- Listas com **+100 itens visíveis**: considerar virtualização.

### Rede

- `POST`/`PATCH`/`DELETE`: target < **500ms** de latência (UI deve indicar loading acima disso).
- Inputs de busca: debounce de ~300ms antes de disparar request.

### Imagens e Assets

- Sempre definir `width`/`height` explícitos em imagens para evitar CLS.
- Lazy-load imagens abaixo do fold.

### Main Thread

- Operações pesadas (parsing de dados grandes, cálculos de relatório) fora do main thread — considerar Web Workers para processamentos > 50ms.

---

## 13. Copy e Mensagens de Interface

### Voz e Tom

- **Voz ativa:** "Cadastre uma fazenda" em vez de "Uma fazenda deve ser cadastrada".
- **Segunda pessoa:** "Sua safra foi salva" em vez de "A safra do usuário foi salva".
- **Orientado à ação:** "Adicionar produtor" em vez de "É necessário adicionar um produtor".

### Labels e Botões

- Labels claros e específicos: "Salvar Safra" em vez de "Continuar" ou "OK".
- Ações com consequência futura terminam com reticências: "Excluir safra…", "Arquivar fazenda…".
- Botões em loading mantêm o texto + spinner — não substituir por "Aguarde".

### Mensagens de Erro

- Erros sempre guiam a saída: não apenas "Erro ao salvar" — "Erro ao salvar: verifique sua conexão e tente novamente".
- Linguagem técnica → humana: "Timeout" → "A operação demorou mais que o esperado".

### Números e Formatação

- Numerais para contagens: "8 safras" em vez de "oito safras".
- Espaço non-breaking entre número e unidade: `10 ha`, `5 kg`, `R$ 100,00`.
- `font-variant-numeric: tabular-nums` em colunas numéricas de tabelas.

### Terminologia Consistente

| Usar | Evitar |
|---|---|
| Fazenda | Propriedade, Campo, Terra |
| Safra | Ciclo, Temporada |
| Produtor | Agricultor (salvo contexto específico) |
| Cadastrar | Inserir, Adicionar (escolher um e manter) |
| Excluir | Deletar, Remover (em contextos destrutivos) |

---

## 14. Governança e Commits

### Conventional Commits

```
feat(modulo):     nova funcionalidade
fix(componente):  correção de bug
style(ui):        ajustes visuais sem lógica
refactor(hook):   refatoração sem mudança de comportamento
docs(guidelines): atualização de documentação
chore(deps):      atualização de dependências
```

### Checklist antes de todo PR

- [ ] Passei pela escada de reuso (Regra F) antes de escrever componente novo
- [ ] Nenhuma primitiva reimplementada localmente (Regra A)
- [ ] Zero `<button>/<input>/<select>/<table>/<h1-6>` crus na página (Lei 1)
- [ ] Listagem segue a Regra B / formulário segue a Regra C
- [ ] Exclusão via `ConfirmDialog`/`TypedConfirmDialog`; ações de linha via `IconButton`/`DropdownMenu`
- [ ] Cabeçalho via `FormPageHeader`/`PageHeader`; títulos via `Heading` (Regra E)
- [ ] Extensão de comportamento por prop no componente do kit, nunca `style` inline (Lei 2)
- [ ] Todo valor de design vem de `t.*` — sem hardcode (Lei 3 / Regra D)
- [ ] Suporte a ambos os temas (light e GBMode)
- [ ] Todos os estados da UI implementados (loading, vazio, erro, sucesso)
- [ ] Inputs com `aria-label`/`<label>` associado; botões apenas-ícone com `aria-label`
- [ ] `@media (prefers-reduced-motion: reduce)` presente; nenhum `transition: all`
- [ ] Fonte Outfit em toda tipografia (Lei 3)
- [ ] `tokens.ts` mudou → `npm run tokens:export` rodado e `tokens.json` commitado (Lei 5)
- [ ] Commit criado com mensagem Conventional Commits (Lei 4)

### Atualizando Este Documento

Atualizar sempre que:
- Um novo componente é adicionado ao catálogo (`src/components/ui/`).
- Um novo token é criado em `tokens.ts` — e mapeado no exportador DTCG (Lei 5).
- Uma nova lei ou regra é aprovada pela equipe.
- Um padrão de interação é definido para casos recorrentes.

---

*Última auditoria de catálogo/tokens: 2026-07-29 — verificado contra `src/components/ui/` (86 componentes) e `src/design/tokens.ts` diretamente no código, não por memória.*
