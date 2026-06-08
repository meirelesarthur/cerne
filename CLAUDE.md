# AGRO365 Panel — Instruções para Claude Code

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
- Catálogo atual: `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Card`, `Checkbox`, `CollapsibleSection`, `ConfirmDialog`, `DataTable`, `Divider`, `DropdownMenu`, `EmptyState`, `FilterDrawer`, `FormField`, `FormPageHeader`, `FormSection`, `FormSelect`, `Heading`, `IconButton`, `Modal`, `PageContainer`, `PageHeader`, `Pagination`, `ProgressBar`, `Skeleton`, `Spinner`, `SSOButton`, `StepFooter`, `StepHeader`, `Stepper`, `TableToolbar`, `Tabs`, `Tag`, `ToggleSwitch`, `Tooltip`

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
- Mensagens de commit seguem o padrão Conventional Commits **com escopo** quando aplicável:
  `feat(modulo):`, `fix(componente):`, `style(ui):`, `refactor(hook):`, `docs(guidelines):`, `chore(deps):`
- Um commit por unidade lógica de mudança — não acumular alterações não relacionadas no mesmo commit

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
PageContainer
  └── PageHeader (title, count, ação primária = Button)
  └── [KPI/Summary bar opcional] — Skeleton enquanto isLoading
  └── Toolbar: TableSearchInput · FilterChip(s) · "Limpar tudo" (Button ghost) · FilterButton
  └── isLoading → Skeleton  |  vazio → EmptyState  |  dados → tabela/grid + Pagination
  └── ConfirmDialog (exclusão)  ·  ToastContainer  ·  FilterDrawer > FormSelect
```

- Exclusão **sempre** via `ConfirmDialog` (Lei de ação destrutiva). Nunca excluir sem confirmação.
- Ações de linha **sempre** via `IconButton` ou `DropdownMenu` — nunca `<button>` cru.
- Sem rodapé "N. registros" redundante quando `PageHeader`/toolbar/`Pagination` já mostram o total.
- Não deixar componente local morto (ex.: `EmptyState` definido e não usado) — remover.

### Regra C — Composição canônica de CRUDs/Formulários

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

- **Tamanhos de controle:** `t.size.control` (38), `controlSm` (30), `controlLg` (46),
  `iconBtn.{sm,md,lg}`, `toggle.{track,thumb}`, `pageBtn` (32), `drawer` (320), `stepBtn` (180).
- **Sombras de card:** `t.shadow.card` / `cardHover` / `cardDark` / `cardDarkHover` (idle/hover × light/GBMode).
- **Overlays:** `t.color.overlay.modal` / `t.color.overlay.drawer`.
- **GBMode:** `t.color.gbSurface` (superfície translúcida de card), `t.color.gbAccent` (verde claro de destaque).
- **Badge/Tag auxiliares:** `t.color.purple.*`, `t.color.cyan.*`.
- **Transições:** `t.transition.{fast,DEFAULT,smooth,drawer}` — nunca `'0.2s'` solto.

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

## Sistema de Tokens (Referência de Valores)

Os valores abaixo são a fonte da verdade de `src/design/tokens.ts`. **Nunca hardcodar** —
referenciar sempre via `t.*`. Se faltar um degrau, ajustar a escala em `tokens.ts`.

### Paleta de Cores

| Token | Valor | Uso |
|---|---|---|
| `t.color.brand[600]` | `#059669` | Cor primária de ação, botões, foco |
| `t.color.brand[700]` | `#047857` | Hover de botões primários |
| `t.color.brand[500]` | `#10b981` | GBMode — cor primária no tema escuro |
| `t.color.neutral[0]` | `#ffffff` | Superfície máxima (cards light) |
| `t.color.neutral[50]` | `#f9fafb` | Background de página (light) |
| `t.color.neutral[200]` | — | Border padrão |
| `t.color.neutral[900]` | `#111827` | Texto primário |
| `t.color.success.*` / `error.*` / `warning.*` / `info.*` | — | Estados (bg, border, text, solid) |

**Hue consistency:** em superfícies com background de cor (card brand, GBMode), bordas, sombras e
texto de suporte devem ser tingidos ao mesmo hue — nunca cinza neutro puro sobre fundo colorido.

### Escala de Espaçamento

Grid base de **4px**: `t.space[1]`=4px → `t.space[20]`=80px. Não usar valores fora da grade
sem motivo explícito.

### Border Radius

| Token | Valor | Uso |
|---|---|---|
| `t.radius.sm` | 4px | Badges, chips pequenos |
| `t.radius.DEFAULT` | 8px | Inputs, botões |
| `t.radius.lg` | 10px | Cards internos |
| `t.radius.xl` | 12px | Cards de formulário |
| `t.radius.modal` | 20px | Modals, drawers |
| `t.radius.full` | 9999px | Pills, avatares circulares |

**Radii aninhados:** `r_filho ≤ r_pai`; para alinhamento perfeito de curvas `r_filho = r_pai − padding`.

### Sombras

Mínimo 2 camadas (ambient + direct). Tokens: `t.shadow.sm` (cards leves) · `t.shadow.DEFAULT`
(padrão) · `t.shadow.brand` (glow verde — hover de card fazenda) · `t.shadow.modal` (overlays).
Já cobertos também: `t.shadow.card` / `cardHover` / `cardDark` / `cardDarkHover`.

### Z-Index

| Token | Valor | Uso |
|---|---|---|
| `t.zIndex.base` | 1 | Elementos padrão |
| `t.zIndex.dropdown` | 100 | Menus, selects |
| `t.zIndex.overlay` | 200 | Overlays de fundo |
| `t.zIndex.drawer` | 201 | FilterDrawer, sidebars |
| `t.zIndex.toast` | 9999 | Notificações globais |

### Transições

`t.transition.{fast,DEFAULT,smooth,drawer}` — **nunca** `transition: all` nem `'0.2s'` solto.
Listar as propriedades explicitamente.

---

## Tipografia e Conteúdo

### Fonte

**Outfit** é a única fonte do projeto (`t.font.family` → `'Outfit, sans-serif'`).
Pesos disponíveis: **400, 500, 600, 700, 800**.

### Hierarquia de Tamanhos

| Token | px | Uso |
|---|---|---|
| `t.font.size.xs` | 11 | Metadados, rodapés, labels de eixo em charts |
| `t.font.size.sm` | 12 | Labels de campos, badges |
| `t.font.size.base` | 13 | Texto de tabela, listas |
| `t.font.size.md` | 14 | Corpo padrão de formulários |
| `t.font.size.lg` | 15 | Títulos de cards, seções |
| `t.font.size.xl` | 16 | Títulos de página secundários |
| `t.font.size.2xl` | 22 | PageHeader titles |
| `t.font.size.3xl` | 26 | KPIs, números de destaque |

Tamanho de fonte **sempre** de `t.font.size.*` — não usar `18`/`20`px soltos.

### Regras de Conteúdo

- **Números tabulares:** em tabelas e comparações, usar `fontVariantNumeric: 'tabular-nums'`
- **Reticências tipográfica:** usar o caractere `…` (U+2026), nunca três pontos `...`
- **Aspas curvas:** `"texto"` em vez de `"texto"` em conteúdo editorial
- **Espaço non-breaking:** `10 kg`, `R$ 10,00`, `5 ha` — evitar quebra entre número e unidade
- **Evitar órfãs e viúvas** em textos longos de descrição
- **Todos os estados desenhados:** vazio, esparso, denso e com erro (ver Estados da UI)

---

## Diretrizes de Interface (UI Web Guide)

### Temas

Todo componente em `src/components/ui/` deve suportar **ambos os temas** (light e GBMode).

- Usar `useTheme().colors` para superfícies e `isGbMode` para valores específicos do tema escuro
- Nunca hardcodar cores que dependem do tema
- GBMode: bordas, sombras e textos de suporte usam hues verdes — nunca cinza neutro sobre fundo colorido
- Quando GBMode ativo, definir `color-scheme: dark` no `<html>` para alinhar scrollbars e controles nativos do OS

Valores de referência (gerenciados por `src/context/ThemeContext.tsx`, aplicados via `data-theme` no `<body>`):

| Propriedade | Light (`data-theme="light"`) | GBMode (`data-theme="gb"`) |
|---|---|---|
| Background de página | `#f5f5f5` | `#051008` |
| Superfície (cards) | `#ffffff` | `#0e2a1d` |
| Brand principal | `#059669` | `#10b981` |

### Interações e Acessibilidade

- **100% operável por teclado** — todos os fluxos críticos devem funcionar sem mouse
- Usar `:focus-visible` em vez de `:focus` — não mostra ring em cliques de mouse
- Focus ring padrão: `t.glow.brand`
- Modals e drawers prendem o foco enquanto abertos (focus trap obrigatório)
- Headings hierárquicos: a estrutura `h1 → h2 → h3` deve ser lógica e **nunca pular níveis**
- Hit targets mínimos: **24×24px** desktop / **44×44px** mobile — sem dead zones
- Loading com delay inicial **150–300ms** (evitar flash); tempo mínimo visível **300–500ms** (evitar flicker)
- Botões em loading mantêm o rótulo original + spinner via prop `loading` — nunca substituir o texto
- Ações destrutivas sempre exigem confirmação explícita; usar `Button` variant `destructive`
- Atualizações otimistas: UI responde imediatamente, reconcilia com servidor; erro oferece Undo
- Semântica nativa antes de ARIA: preferir `<button>`, `<a>`, `<label>`, `<table>` nativos
- `IconButton` sempre com `aria-label` descritivo; decoração com `aria-hidden="true"`
- Toasts e validação inline com `aria-live="polite"`
- Inputs mobile com `font-size ≥ 16px` (evitar auto-zoom iOS); `touch-action: manipulation` em controles
- Nunca desabilitar o zoom do browser; nunca bloquear `paste` em campos
- Deep-link tudo: filtros, abas, paginação e painéis expandidos persistem na URL (Back/Forward restaura o estado, incluindo posição de scroll)

### Formulários

- `Enter` submete quando há um único campo focado; no último campo em formulários multi-campo
- `<textarea>`: `Ctrl/⌘+Enter` submete; `Enter` insere nova linha
- Submit habilitado até o início da request; desabilitar **durante** + mostrar spinner
- Nunca pré-desabilitar submit — permitir submissão incompleta para exibir feedback de validação
- Todo campo tem `<label>` associado (`htmlFor` ou wrapping); clicar no label deve **focar o controle**
- Erros exibidos próximos ao campo; ao submeter com erros, focar o primeiro campo com erro
- Mensagens de erro guiam a correção: não "campo inválido" — mas "CPF deve ter 11 dígitos"
- `spellcheck="false"` em e-mails, códigos, usernames, tokens de API
- Definir `autocomplete` e `name` significativos para habilitar autofill; em campos não-auth usar
  `autocomplete="off"` (ou valor específico) para não disparar gerenciadores de senha
- Garantir compatibilidade com gerenciadores de senha e preenchimento de 2FA
- Placeholder como **exemplo de formato**, nunca como label: `+55 (11) 99999-9999`
- Fazer `trim()` antes de validar — evitar erros por espaço acidental
- `type` e `inputMode` corretos: numérico → `type="text" inputMode="numeric"`; telefone → `type="tel"`; email → `type="email"`
- `<select>` no Windows: definir explicitamente `backgroundColor` e `color` no `FormSelect` para evitar inconsistências visuais

### Animações e Transições

- Animar apenas quando **clarifica causa/efeito** ou adiciona deleite deliberado — nunca decorativo sem propósito
- Animar apenas `transform`, `opacity` e `filter` — propriedades GPU accelerated
- **Nunca usar `transition: all`** — listar propriedades explicitamente
- Respeitar `prefers-reduced-motion`: incluir `@media (prefers-reduced-motion: reduce)` com duração `0.01ms`
- Durações via `t.animation.duration.*`: fast=150ms, normal=200ms, slow=300ms, slower=400ms
- Easing via `t.animation.easing.*`: easeOut para entradas, easeIn para saídas, spring para drag
- Ancorar `transformOrigin` onde o movimento começa fisicamente (dropdown → `top center`, modal → `center center`)
- SVG transforms: aplicar em wrappers `<g>` + `transform-box: fill-box; transform-origin: center`
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
- Delay de ~150ms antes de exibir skeleton (operações rápidas não devem piscar)
- Virtualização a partir de **+100 itens** visíveis (além de paginação)
- Toda tela oferece próximo passo ou caminho de recuperação (sem dead ends): lista vazia → "Cadastrar primeiro item"; erro de rede → "Tentar novamente"; sem permissão → solicitar acesso
- Usar `ProgressBar` no topo de cards/seções com operação em andamento (`idle`/`loading`/`success`/`error`)

### Layout e Responsividade

- Usar CSS Grid e Flexbox — evitar dimensionamento via JavaScript
- **Alinhamento óptico:** ajustar ±1–2px quando a percepção supera a geometria perfeita (ex: ícone ao lado de texto)
- **Alinhamento deliberado:** cada elemento deve alinhar intencionalmente com algo — grid, baseline, borda ou centro óptico
- Testar em: mobile (360px), laptop (1280px), wide (1920px) — nenhum elemento vaza, sobrepõe ou estica em excesso
- Corrigir `overflow` para evitar scrollbars indesejados; testar com macOS "Show Scroll Bars: Always"
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
- Ações em processamento com reticências: "Salvando…", "Carregando…" (caractere `…`, nunca `...`)
- Numerais para contagens: "8 safras" — não "oito safras"
- Moeda: 0 ou 2 decimais — nunca misturar no mesmo contexto; espaço non-breaking em `10 ha`, `R$ 100,00`
- Datas e horas: formato locale-aware (`pt-BR` como padrão)
- `font-variant-numeric: tabular-nums` em colunas numéricas de tabelas
- Terminologia: **Fazenda** (não Propriedade), **Safra** (não Ciclo), **Produtor**, **Cadastrar**, **Excluir**

### Performance

- Monitorar re-renders com React DevTools — minimizar re-renders desnecessários
- `useMemo`/`useCallback` apenas onde o profiling confirmar necessidade (não prematuramente)
- Listas com **+100 itens** visíveis: considerar virtualização
- `POST`/`PATCH`/`DELETE`: target < **500ms**; acima disso a UI deve indicar loading
- Inputs de busca: **debounce de ~300ms** antes de disparar request
- Imagens com `width` e `height` explícitos (evitar **CLS**); lazy-load abaixo do fold
- Fontes críticas com `preload` para evitar **FOUT**
- Processamentos pesados (> 50ms) fora do main thread — considerar Web Workers

### Checklist antes de todo PR

- [ ] Todos os valores de design usam `t.*` (sem hardcode)
- [ ] Todos os componentes vêm de `src/components/ui/`
- [ ] Suporte a ambos os temas (light e GBMode)
- [ ] Todos os estados da UI implementados (loading, vazio, erro)
- [ ] Inputs com `aria-label` ou `<label>` associado; clicar no label foca o controle
- [ ] Botões apenas-ícone com `aria-label`; headings sem pular níveis
- [ ] `@media (prefers-reduced-motion: reduce)` presente em animações
- [ ] Nenhum `transition: all` no código
- [ ] Fonte Outfit em toda tipografia; tamanhos via `t.font.size.*`
- [ ] Reticências `…`, espaço non-breaking em número+unidade, datas `pt-BR`
- [ ] Imagens com `width`/`height`; busca com debounce; sem re-renders desnecessários
- [ ] Commit criado com mensagem Conventional Commits (com escopo quando aplicável)

---

## Manutenção deste Documento

Atualizar este arquivo sempre que:
- Um novo componente é adicionado ao catálogo (Lei 1)
- Um novo token é criado em `tokens.ts`
- Uma nova lei ou regra é aprovada pela equipe
- Um padrão de interação é definido para casos recorrentes
