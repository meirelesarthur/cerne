# GB CERNE — Instruções para Claude Code

## Roteamento de Modelos (Orquestração Multi-Model)

Opus é o orquestrador deste projeto. Ao spawnar subagentes via Agent tool, use o modelo adequado à tarefa:

### Haiku — tarefas leves e rápidas
Use `model: "haiku"` para:
- Busca de arquivos (Glob, Grep, exploração de estrutura)
- Leitura de arquivos isolados
- Verificações rápidas (existe arquivo? qual o conteúdo de X?)
- Tarefas de listagem e indexação
- Subagentes do tipo `Explore` com escopo pequeno (`quick`)

### Sonnet — implementação e análise
Use `model: "sonnet"` para:
- Geração e edição de código (componentes, hooks, utilitários)
- Refatoração de arquivos existentes
- Análise de código com múltiplos arquivos
- Subagentes do tipo `Explore` com escopo médio/amplo
- Subagentes do tipo `general-purpose` para tarefas de implementação
- Criação de testes

### Opus — reservado para o orquestrador
Não spawne subagentes com `model: "opus"` — Opus já é você (o orquestrador). Use sua própria capacidade para:
- Planejamento de arquitetura e decisões de design
- Integração e revisão dos resultados dos subagentes
- Tarefas que exigem raciocínio profundo sobre múltiplos contextos

---

## Stack do Projeto

- **React 18 + TypeScript** (strict mode)
- **Vite 5** — build tool, dev server em `http://localhost:5173`
- **Tailwind CSS 3** com tokens customizados (fonte Outfit, paleta emerald)
- **Chakra UI 3** + Emotion (peer deps instalados)
- **Storybook 10** em `http://localhost:6006`
- **Vitest + Playwright** para testes

## Comandos principais

```bash
npm run dev        # Dev server → http://localhost:5173
npm run storybook  # Storybook → http://localhost:6006
npm run build      # Build de produção (TS check + Vite)
```

## Estrutura src/

- `components/layout/` — AppLayout, Sidebar, Topbar, SecondaryNav
- `components/ui/` — componentes reutilizáveis (Badge, FormField, DataTable…)
- `components/*.stories.tsx` — stories do Storybook

---

## Leis do Projeto

Estas políticas são invioláveis e se aplicam a toda geração de código neste projeto.
Referência visual completa: `UI_WEB_GUIDE.html` na raiz do projeto.

### Lei 1 — Component-First (Componentização Obrigatória)

Todo elemento visível na tela é um componente de `src/components/ui/`.

**Proibido usar diretamente em páginas:** `<button>`, `<input>`, `<select>`, `<table>`, `<thead>`, `<tr>`, `<td>`, `<h1>`–`<h6>`.

- Ao criar uma nova tela, apenas **importar e chamar** componentes existentes
- Se o componente necessário não existe no catálogo, criá-lo em `src/components/ui/` **antes** de usá-lo na tela
- Catálogo atual: `Avatar`, `Badge`, `Breadcrumb`, `BulkActionBar`, `Button`, `Card`, `ChartCard`, `Checkbox`, `CollapsibleSection`, `ConfirmDialog`, `DataTable`, `Divider`, `DropdownMenu`, `EmptyState`, `FilterDrawer`, `FormField`, `FormPageHeader`, `FormSection`, `FormSelect`, `Heading`, `HeatmapChart`, `IconButton`, `KpiStatCard`, `ListToolbar`, `MapView`, `Modal`, `PageCard`, `PageContainer`, `PageHeader`, `Pagination`, `ProgressBar`, `SankeyFunnel`, `SearchSelect`, `SectionDividers`, `Skeleton`, `SortHeader`, `SparklineArea`, `Spinner`, `SSOButton`, `StepFooter`, `StepHeader`, `Stepper`, `TableToolbar` (exporta `TableSearchInput`, `FilterChip`, `FilterButton`), `Tabs`, `Tag`, `Toast` (`useToast`/`ToastContainer`), `ToggleSwitch`, `Tooltip`

### Lei 2 — Fonte Única de Verdade (Propagação Global)

Alterações em componentes de `src/components/ui/` refletem automaticamente em todas as telas — esse é o objetivo.

**Proibido em páginas/telas:**
- Sobrescrever estilos com `style={}` inline sobre um componente existente
- Duplicar lógica de estilo que o componente já oferece via prop (ex.: criar spinner manual quando `Button` tem `loading`)
- Clonar/reimplementar um componente UI dentro de uma página

Extensões de comportamento são feitas adicionando props ao componente em `src/components/ui/`, nunca por patch local.

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

Valores hardcoded fora de `src/design/tokens.ts` e `tailwind.config.ts` são violação de política.

### Lei 4 — Commits Obrigatórios, Push sob Demanda

Após toda mudança concluída, um commit **deve ser criado imediatamente** — sem aguardar solicitação.

- O push **nunca é feito automaticamente** — somente quando o usuário solicitar explicitamente
- Mensagens de commit seguem o padrão Conventional Commits (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`, etc.)
- Um commit por unidade lógica de mudança — não acumular alterações não relacionadas no mesmo commit

### Lei 5 — Tokens Interoperáveis no Padrão W3C DTCG

`src/design/tokens.ts` é a **fonte única** dos tokens; sua exportação para o ecossistema de design
(Figma, Supernova) **deve sempre obedecer ao padrão W3C DTCG** (Design Tokens Community Group).
A direção do fluxo é **imutável**: o código define, Figma e Supernova consomem — nunca o contrário.

**Pipeline canônico:**
`tokens.ts` → `npm run tokens:export` → `tokens/tokens.json` (DTCG) → Tokens Studio → Figma Variables → Supernova

- Toda alteração em `tokens.ts` exige rodar `npm run tokens:export` e **commitar o `tokens/tokens.json`
  regenerado** na mesma unidade lógica — o JSON nunca pode divergir do `.ts`.
- O exportador (`scripts/export-tokens-dtcg.ts`) só pode emitir `$type` **válidos no DTCG**:
  `color`, `dimension`, `number`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`,
  `strokeStyle`, `border`, `transition`, `shadow`, `gradient`, `typography`. **Proibido** inventar
  tipos fora dessa lista (ex.: `borderRadius` → use `dimension`).
- Valores de tipos compostos seguem a forma estrutural do DTCG, **nunca string CSS crua**:
  `cubicBezier` → array `[x1,y1,x2,y2]`; `duration` → `{ value, unit }`; `shadow` →
  `{ color, offsetX, offsetY, blur, spread }` (multicamada → array); `transition` →
  `{ duration, delay, timingFunction }`; `border` → `{ color, width, style }`.
- Ao adicionar um token novo em `tokens.ts`, **mapeie-o no exportador** com o `$type` correto antes
  de concluir a mudança — um token sem mapeamento DTCG é entrega incompleta.
- Ajustes propostos via Figma (Tokens Studio → Push) entram como **PR** que atualiza `tokens.ts`;
  jamais se edita token direto no Figma como fonte.

---

## Padrões de Implementação (Modelo Canônico)

Estas regras consolidam a auditoria e refatoração de toda a interface. **São de aplicação
obrigatória** ao criar telas novas ou estender as existentes — o objetivo é escalar sempre
sobre o mesmo modelo, nunca reinventando primitivas localmente.

### Regra A — Proibido reimplementar primitiva que já existe no catálogo

Antes de escrever qualquer JSX de tela, verifique o catálogo da Lei 1. É **violação** criar
versão local de algo que o kit já oferece. Casos concretos já corrigidos (não repetir):

| ❌ Nunca crie localmente | ✅ Use sempre |
|---|---|
| Modal de exclusão inline / `OverlayModal` local | `ConfirmDialog` |
| `ActionBtn` / botão de ação de linha estilizado | `IconButton` |
| `DropdownItem` + menu absoluto + estado de abertura manual | `DropdownMenu` |
| `useToast`/`ToastMsg`/`TOAST_BG` locais | `useToast` + `ToastContainer` de `ui/Toast` |
| `EmptyState` duplicado dentro da página | `EmptyState` |
| Paginação custom com `<select>` de linhas | `Pagination` (tem `showPageSizeSelector`) |
| Spinner manual / texto "Aguarde..." | prop `loading` do `Button` (mostra `Spinner` mantendo o rótulo) |
| Avatar `<div>` com iniciais + gradiente | `Avatar` |
| Breadcrumb `<nav>` inline | `Breadcrumb` |
| Tooltip inline com `position: fixed` | `Tooltip` |
| `<h1>`–`<h6>` cru estilizado | `Heading` (ou `PageHeader`/`FormPageHeader`) |

Se a primitiva **não existe**, crie-a em `src/components/ui/` com story, tokens e suporte aos
dois temas **antes** de usá-la — nunca inline na página.

### Regra B — Composição canônica de Listagens

Toda tela de listagem segue esta ordem (referência: `FazendasLista.tsx`). É permitido grid
manual quando o layout exige (árvore, cards), mas **as primitivas ao redor são sempre do kit**:

```
PageContainer (style={{ paddingBottom: 0 }})
  └── PageCard                          ← casca padrão: altura do submenu + scroll só interno
        └── PageHeader (title, count, ação primária = Button)
        └── [KPI/Summary bar opcional] — Skeleton enquanto isLoading
        └── Toolbar: TableSearchInput · FilterChip(s) · "Limpar tudo" (Button ghost) · FilterButton
        └── isLoading → Skeleton  |  vazio → EmptyState  |  dados → tabela/grid + Pagination
  └── ConfirmDialog (exclusão)  ·  ToastContainer  ·  FilterDrawer > FormSelect   ← overlays FORA do PageCard
```

- **Casca obrigatória:** o conteúdo da listagem vive dentro de `PageCard` (fundo, sombra por
  tema, altura `calc(100vh - t.layout.contentOffset)` e scroll interno). Overlays (`ConfirmDialog`,
  `Modal`, `ToastContainer`, `FilterDrawer`, `BulkActionBar`) ficam **fora** do `PageCard`, como
  irmãos dentro do `PageContainer`. Nunca recriar esse card inline. Referência: `CentrosCustoLista.tsx`.

- Exclusão **sempre** via `ConfirmDialog` (Lei de ação destrutiva). Nunca excluir sem confirmação.
- Ações de linha **sempre** via `IconButton` ou `DropdownMenu` — nunca `<button>` cru.
- Sem rodapé "N. registros" redundante quando `PageHeader`/toolbar/`Pagination` já mostram o total.
- Não deixar componente local morto (ex.: `EmptyState` definido e não usado) — remover.

### Regra C — Composição canônica de CRUDs/Formulários

- **Casca:** o formulário vive dentro de `PageCard` (mesma altura do submenu + scroll interno),
  envolto por `PageContainer style={{ paddingBottom: 0 }}`. A barra de ações vai na prop
  `footer` do `PageCard` (fixa na base) — pares de `Button` no `footer` padrão; `StepFooter`
  no `footer` com `footerBare`. Não montar footer/scroll manual. Referência: `CentroCustoCadastro.tsx`.
- **Cabeçalho:** `FormPageHeader` (title + subtitle + Voltar). Padrão único — não recriar header
  com `<h1>` + seta + ícone inline. Referência: `ProdutoForm.tsx`, `CentroCustoCadastro.tsx`.
- **Single-page denso:** agrupar campos em `CollapsibleSection`. Referência: `ProdutoForm.tsx`.
- **Multi-step:** `Stepper` + `StepHeader` (por etapa) + `StepFooter` (navegação).
  Referência: `FazendaCadastro.tsx`, `SafraCadastro.tsx`. Não montar footer/header manual.
- **Campos:** `FormField` (texto), `FormSelect` (select), `ToggleSwitch` (boolean). Nunca
  `<input>`/`<select>` crus.
- Validação inline por campo, foco no primeiro erro ao submeter (ver Diretrizes de Formulários).

### Regra D — Extensão via props, nunca patch local (reforço da Lei 2)

Quando um componente do kit não cobre um caso, **adicione uma prop opcional ao componente**
(com default que preserva o comportamento atual) — nunca contorne com `style={}` inline na
página nem clone o componente. Exemplo já aplicado: `StepFooter` ganhou `backDisabled?` para
permitir "Cancelar" habilitado na 1ª etapa, sem quebrar as telas que dependiam do default.

### Regra E — Tokens disponíveis (use estes, não invente literais)

`src/design/tokens.ts` já cobre os casos que antes viravam hardcode. Antes de escrever um
literal, procure o token:

- **Tamanhos de controle:** `t.size.control` (42, = botão md), `controlSm` (32), `controlLg` (46),
  `btn.{sm,md,lg}`, `iconBtn.{sm,md,lg}`, `toggle.{track,thumb}`, `pageBtn` (32), `tableRow` (42),
  `drawer` (320), `stepBtn` (180).
- **Sombras de card:** `t.shadow.card` / `cardHover` / `cardDark` / `cardDarkHover` (idle/hover × light/GBMode).
- **Overlays:** `t.color.overlay.modal` / `t.color.overlay.drawer`.
- **GBMode:** `t.color.gb.surface` (superfície translúcida de card), `t.color.gb.accent` (verde claro de destaque).
- **Feedback semântico:** `t.color.feedback.{success,error,warning,info}.{bg,border,text,solid}` · `t.color.feedback.notice` (aviso pontual).
- **Badge/Tag auxiliares:** `t.color.accent.purple.{bg,text}`, `t.color.accent.cyan.{bg,text}`.
- **Estados de controle:** `t.color.state.disabled.{bg,text,border}`, `t.color.state.readonly.{bg,text,border}`.
- **Linhas de tabela:** `t.color.state.row.{hover,hoverGb,selected,selectedGb,striped,stripedGb}`.
- **Transições:** `t.transition.{fast,base,smooth,drawer}` — nunca `'0.2s'` solto.
- **Animação:** `t.animation.duration.{fast,normal,slow,slower}`, `t.animation.easing.{standard,easeOut,easeIn,easeInOut,spring}`.
- **Delays de loading:** `t.delay.loadingShow` (225 ms, anti-flash) / `t.delay.loadingMin` (400 ms, anti-flicker).
- **Breakpoints:** `t.breakpoint.{xs,sm,md,lg,xl}` (360/768/1024/1280/1920).
- **Gráficos:** `t.chart.series[]` (8 cores categóricas), `t.chart.grid` / `gridGb`.
- **Layout:** `t.layout.contentOffset` (88) — altura do chassi acima/abaixo do conteúdo; base do
  `calc(100vh - …)` usado pelo `PageCard`. Não hardcodar `88` nas telas.

Se o valor que você precisa não tem token e é reutilizável, **adicione o token primeiro** em
`tokens.ts` e referencie — não espalhe o literal.

### Regra F — Tipografia em páginas

- Título de página de listagem → `PageHeader`. Título de página de formulário → `FormPageHeader`.
- Demais títulos (boas-vindas, seção interna de card) → `Heading` (`level` semântico + `size` tokenizado).
- Tamanho de fonte **sempre** de `t.font.size.*` — não usar `18`/`20`px soltos. Se faltar um degrau
  na escala, ajustar a escala em `tokens.ts`, não hardcodar na tela.

### Checklist rápido antes de abrir/escalar uma tela

- [ ] Nenhuma primitiva reimplementada localmente (consultei a tabela da Regra A)
- [ ] Listagem segue a composição da Regra B / formulário segue a Regra C
- [ ] Exclusão usa `ConfirmDialog`; ações de linha usam `IconButton`/`DropdownMenu`
- [ ] Cabeçalho via `FormPageHeader`/`PageHeader`; títulos via `Heading`
- [ ] Zero `<button>/<input>/<select>/<table>/<h1-6>` crus na página
- [ ] Todo valor de design vem de `t.*` (tamanho, cor, sombra, transição)
- [ ] Extensão de comportamento feita por prop no componente do kit, não por `style` inline

---

## Diretrizes de Interface (UI Web Guide)

### Temas

Todo componente em `src/components/ui/` deve suportar **ambos os temas** (light e GBMode).

- Usar `useTheme().colors` para superfícies e `isGbMode` para valores específicos do tema escuro
- Nunca hardcodar cores que dependem do tema
- GBMode: bordas, sombras e textos de suporte usam hues verdes — nunca cinza neutro sobre fundo colorido
- Quando GBMode ativo, definir `color-scheme: dark` no `<html>` para alinhar scrollbars e controles nativos do OS

### Interações e Acessibilidade

- Usar `:focus-visible` em vez de `:focus` — não mostra ring em cliques de mouse
- Focus ring padrão: `t.glow.brand`
- Modals e drawers prendem o foco enquanto abertos (focus trap obrigatório)
- Hit targets mínimos: **24×24px** desktop / **44×44px** mobile — sem dead zones
- Loading com delay inicial **150–300ms** (evitar flash); tempo mínimo visível **300–500ms** (evitar flicker)
- Botões em loading mantêm o rótulo original + spinner via prop `loading` — nunca substituir o texto
- Ações destrutivas sempre exigem confirmação explícita; usar `Button` variant `destructive`
- Atualizações otimistas: UI responde imediatamente, reconcilia com servidor; erro oferece Undo
- Semântica nativa antes de ARIA: preferir `<button>`, `<a>`, `<label>`, `<table>` nativos
- `IconButton` sempre com `aria-label` descritivo; decoração com `aria-hidden="true"`
- Toasts e validação inline com `aria-live="polite"`
- Inputs mobile com `font-size ≥ 16px` (evitar auto-zoom iOS); `touch-action: manipulation` em controles
- Deep-link tudo: filtros, abas, paginação e painéis expandidos persistem na URL

### Formulários

- `Enter` submete quando há um único campo focado; no último campo em formulários multi-campo
- `<textarea>`: `Ctrl/⌘+Enter` submete; `Enter` insere nova linha
- Submit habilitado até o início da request; desabilitar **durante** + mostrar spinner
- Nunca pré-desabilitar submit — permitir submissão incompleta para exibir feedback de validação
- Erros exibidos próximos ao campo; ao submeter com erros, focar o primeiro campo com erro
- Mensagens de erro guiam a correção: não "campo inválido" — mas "CPF deve ter 11 dígitos"
- `spellcheck="false"` em e-mails, códigos, usernames, tokens de API
- Definir `autocomplete` e `name` significativos para habilitar autofill
- Fazer `trim()` antes de validar — evitar erros por espaço acidental
- `type` e `inputMode` corretos: numérico → `type="text" inputMode="numeric"`; telefone → `type="tel"`

### Animações e Transições

- Animar apenas `transform`, `opacity` e `filter` — propriedades GPU accelerated
- **Nunca usar `transition: all`** — listar propriedades explicitamente
- Respeitar `prefers-reduced-motion`: incluir `@media (prefers-reduced-motion: reduce)` com duração `0.01ms`
- Durações via `t.animation.duration.*`: fast=150ms, normal=200ms, slow=300ms, slower=400ms
- Easing via `t.animation.easing.*`: easeOut para entradas, easeIn para saídas, spring para drag
- Ancorar `transformOrigin` onde o movimento começa fisicamente (dropdown → `top center`, modal → `center center`)
- Animações canceláveis por input do usuário; nunca autoplay

### Estados da UI

Todo componente e toda tela deve ter **todos os estados** implementados antes de ir para produção:

| Estado | Implementação |
|---|---|
| Loading | `Skeleton` (listas/cards) ou prop `loading` do `Button` |
| Vazio | `EmptyState` com mensagem + ação de recuperação |
| Erro | Mensagem orientada à solução + ação de retry |
| Sucesso | Toast ou `Badge` success |
| Esparso (1–3 itens) | Layout bonito, não quebrado |
| Denso (+500 itens) | Paginação + virtualização |

- Skeletons devem refletir a estrutura real do conteúdo — evitar placeholders genéricos que causam layout shift
- Toda tela oferece próximo passo ou caminho de recuperação (sem dead ends)
- Usar `ProgressBar` no topo de cards/seções com operação em andamento

### Layout e Responsividade

- Usar CSS Grid e Flexbox — evitar dimensionamento via JavaScript
- Testar em: mobile (360px), laptop (1280px), wide (1920px)
- Modals e drawers: `overscroll-behavior: contain`
- Links de navegação: usar `<a>` ou `<Link>` — nunca `<button>` ou `<div onClick>` para URLs
- Radii aninhados: `r_filho ≤ r_pai`; para alinhamento de curvas: `r_filho = r_pai − padding`
- Sombras com mínimo 2 camadas (ambient + direct)

### Copy e Mensagens

- Voz ativa: "Cadastre uma fazenda" — não "Uma fazenda deve ser cadastrada"
- Segunda pessoa: "Sua safra foi salva" — não "A safra do usuário foi salva"
- Labels específicos: "Salvar Safra" — não "Continuar" ou "OK"
- Ações com consequência futura terminam com reticências (`…`): "Excluir safra…"
- Erros guiam a saída: não "Erro ao salvar" — mas "Erro ao salvar: verifique sua conexão e tente novamente"
- Linguagem técnica → humana: "Timeout" → "A operação demorou mais que o esperado"
- Numerais para contagens: "8 safras" — não "oito safras"
- Terminologia: **Fazenda** (não Propriedade), **Safra** (não Ciclo), **Produtor**, **Cadastrar**, **Excluir**

### Checklist antes de todo PR

- [ ] Todos os valores de design usam `t.*` (sem hardcode)
- [ ] Todos os componentes vêm de `src/components/ui/`
- [ ] Suporte a ambos os temas (light e GBMode)
- [ ] Todos os estados da UI implementados (loading, vazio, erro)
- [ ] Inputs com `aria-label` ou `<label>` associado
- [ ] Botões apenas-ícone com `aria-label`
- [ ] `@media (prefers-reduced-motion: reduce)` presente em animações
- [ ] Nenhum `transition: all` no código
- [ ] Fonte Outfit em toda tipografia
- [ ] Commit criado com mensagem Conventional Commits
