# GB CERNE — Guia de Nomenclatura no Figma

> Convenção de nomenclatura de **páginas, frames, componentes, variantes, camadas
> e estilos** no Figma do GB CERNE.
> O objetivo é que o arquivo de design seja lido como o código: mesmos nomes de
> componente, mesmas variantes, mesmos tokens. Quem abre o Figma reconhece o que
> existe em `src/components/ui/`; quem abre o código reconhece o que está no Figma.

> **Escopo — sem Code Connect.** Este guia é uma **referência visual**: o Figma
> aqui cumpre o papel que historicamente cumpria para os devs (fonte de verdade
> visual), mas com um nível a mais de padronização. Ele **não** se conecta ao
> código (sem Code Connect / `figma.connect`). O caminho inverso — documentar os
> componentes já implementados de volta no Figma — será feito em uma etapa
> posterior e não faz parte deste documento.

---

## 1 · Princípios

1. **Paridade com o código.** O nome do componente no Figma é igual ao nome do
   arquivo em `src/components/ui/` (PascalCase): `Button`, `IconButton`,
   `DataTable`, `FormField`. Nunca apelidos como "Botão Verde" ou "Caixa".
2. **Variante = prop.** Cada propriedade de variante no Figma corresponde a uma
   prop real do componente (`variant`, `size`, `state`), com os **mesmos valores**.
3. **Tokens, não valores.** Cor, tipografia e efeito vêm de **estilos** do Figma
   que espelham `src/design/tokens.ts`. Proibido cor/sombra "solta" numa camada.
4. **Dois temas sempre.** Todo componente existe em **Light** e **GBMode**.
5. **Inglês para estrutura, PT-BR para conteúdo.** Nomes de componente/variante/
   token em inglês (igual ao código); textos de exemplo e rótulos de tela em
   português.
6. **Sem ruído.** Nada de `Frame 427`, `Group 12`, `Rectangle 3`. Toda camada
   relevante é renomeada.

---

## 2 · Estrutura de Páginas (Figma Pages)

Use prefixos numéricos para ordenar e um emoji de categoria para leitura rápida:

```
00 · 🎨 Foundations      → tokens, estilos, grid, ícones
01 · 🧩 Components        → biblioteca do kit (1 seção por componente)
02 · 📐 Patterns          → composições (toolbar de listagem, header de form…)
03 · 🖥️ Screens — Cadastros
04 · 📊 Screens — Dashboards
05 · 🔐 Screens — Acesso  (Login, recuperação)
99 · 🗄️ Archive           → versões antigas / descontinuadas
```

---

## 3 · Frames / Telas

Padrão: `Módulo / Tela / Estado`

```
Cadastros / Produtos / Lista
Cadastros / Produtos / Lista — Vazio
Cadastros / Produtos / Lista — Loading
Cadastros / Fazendas / Cadastro — Step 1 Identificação
Dashboards / Financeiro / Overview
Acesso / Login
```

- O **estado** (`Vazio`, `Loading`, `Erro`, `Denso`) vem depois de `—`, espelhando
  os Estados da UI exigidos no `CLAUDE.md`.
- Largura de frame de tela: **1440** (canvas base). Variações de teste: `@1280`,
  `@1920` como sufixo no nome do frame quando necessário.
- Terminologia de produto (igual ao código): **Fazenda** (não Propriedade),
  **Safra** (não Ciclo), **Cadastrar**, **Excluir**.

---

## 4 · Componentes e Variantes

### 4.1 Nome do componente

`PascalCase`, idêntico ao arquivo em `src/components/ui/`:

```
Button · IconButton · Badge · Tag · Card · Checkbox · ToggleSwitch
FormField · FormSelect · SearchSelect · DropdownMenu · Modal · ConfirmDialog
DataTable · Pagination · SortHeader · BulkActionBar · TableToolbar
PageHeader · FormPageHeader · Heading · Breadcrumb · Tabs · Stepper
StepHeader · StepFooter · CollapsibleSection · FormSection · FilterDrawer
EmptyState · Skeleton · Spinner · ProgressBar · Tooltip · Avatar · Divider
SSOButton · PageContainer
```

Componentes de visualização (gráficos/mapa):

```
ChartCard · KpiStatCard · SparklineArea · HeatmapChart · SankeyFunnel · MapView
```

### 4.2 Propriedades de variante

Use **Component Properties** do Figma com os mesmos nomes e valores das props.
Formato da variante no painel: `Propriedade=valor`, separadas por vírgula.

| Componente | Propriedades (= props reais) |
|---|---|
| `Button` | `variant` = `primary \| secondary \| destructive \| ghost` · `size` = `sm \| md \| lg` · `loading` = `true \| false` · `icon` = `true \| false` |
| `IconButton` | `size` = `xs \| sm \| md` · `variant` = `ghost \| outline \| subtle` · `danger` = `true \| false` |
| `Badge` | `variant` = `success \| danger \| warning \| neutral \| info \| purple \| cyan` |
| `Checkbox` | `state` = `unchecked \| checked \| indeterminate` · `disabled` = `true \| false` |
| `ToggleSwitch` | `state` = `off \| on` · `disabled` = `true \| false` |
| `Tabs` | `count` = `2 \| 3 \| 4…` (organização) · item: `active` = `true \| false` |
| `Stepper` | item: `state` = `completed \| active \| pending` |
| `Tag` | `variant` = `neutral \| brand \| …` · `removable` = `true \| false` |

> Regra: ao adicionar uma variante no Figma que **não** existe como prop, ela é
> inválida. Primeiro a prop nasce no componente em `src/components/ui/`, depois é
> refletida aqui. (No código isso é a Regra D — extensão por prop.)

### 4.3 Estado interativo

Estados de interação (`hover`, `focus`, `pressed`, `disabled`) entram como uma
propriedade `interaction` quando precisam ser documentados, ou como variantes
dedicadas dentro do component set:

```
Button / variant=primary, size=md, interaction=default
Button / variant=primary, size=md, interaction=hover
Button / variant=primary, size=md, interaction=focus
```

- O anel de foco usa o estilo de efeito `effect/glow/brand` (= `t.glow.brand`).

---

## 5 · Camadas internas

Nomeie por **função semântica**, não por tipo de shape:

```
✅ container · label · icon-left · value · helper-text · trailing-action
❌ Frame 88 · Rectangle 2 · Group 5 · Vector
```

Convenção:

- `container` — wrapper raiz do componente.
- `slot/<nome>` — área plugável (ex.: `slot/actions`, `slot/footer`).
- `icon/<nome>` — ícone (use o nome do ícone Lucide: `icon/pencil`, `icon/trash-2`).
- `text/<papel>` — nó de texto por papel (`text/title`, `text/subtitle`).
- Estados ocultos: prefixe com `.` para indicar camada auxiliar (`.hover-bg`).

Ícones: a biblioteca de origem é **Lucide** (igual ao código). O nome da camada/
componente de ícone é o nome Lucide em `kebab-case`: `chevron-down`, `plus`,
`alert-triangle`.

---

## 6 · Estilos = Tokens (`src/design/tokens.ts`)

Os **estilos** do Figma espelham 1:1 os tokens. Use `/` para criar a hierarquia
de pastas no painel de estilos.

### 6.1 Color Styles

Os tokens vivem em **sets** (espelhando `tokens/tokens.json` / Tokens Studio):
`core` (primitivos + fundação) · `semantic` (papéis theme-agnostic) ·
`light` / `gbMode` (papéis de tela por tema) · `component`.

**Primitivos** — set `core` (rampas cruas, sem papel):

```
core/color/brand/50 … 900          (600 = principal, 700 = hover)
core/color/neutral/0 … 950
core/color/red/50 … 900            (base do feedback negativo)
core/color/amber/50 … 900          (base de warning / notificação)
core/color/blue/50 … 900           (base de informação)
```

**Semântico theme-agnostic** — set `semantic` (alias → `core`):

```
semantic/color/feedback/{success,error,warning,info}/{bg,border,text,solid}
semantic/color/feedback/notice
semantic/color/accent/{purple,cyan}/{bg,text}
semantic/color/state/{disabled,readonly}/{bg,text,border}
semantic/color/state/row/{hover,selected,striped}(+Gb)
semantic/color/overlay/{modal,drawer}
semantic/color/gb/{accent,surface}            (exclusivos do GBMode)
```

**Semântico theme-aware** — sets `light` / `gbMode` (papéis de tela, alias → `core`):

```
{light|gbMode}/fg/{default,muted,subtle,onAccent}
{light|gbMode}/bg/{canvas,outer,surface,subtle,input,sidebar}
{light|gbMode}/border/{default,subtle}
{light|gbMode}/accent/{default,hover,subtle}
{light|gbMode}/nav/{text,textActive,textMuted,itemActive,itemHover,divider}
{light|gbMode}/shadow
```

- No Figma, os temas `light`/`gbMode` viram **Variable Modes** sobre a mesma
  variável (preferível, pois troca o tema sem renomear camadas) — o exportador
  já emite `$themes` (Light/GBMode) prontos para o Tokens Studio.

### 6.2 Text Styles

Fonte única: **Outfit**. Nome = `text/<size>/<weight>`:

```
text/xs/regular      (11px)      text/base/semibold   (13px)
text/sm/medium       (12px)      text/md/bold         (14px)
text/lg/…  text/xl/…  text/2xl/…  text/3xl/…  text/4xl/…
```

Escala (px, = `t.font.size`): `xs 11 · sm 12 · base 13 · md 14 · lg 15 · xl 16 ·
2xl 22 · 3xl 26 · 4xl 32`.
Pesos (= `t.font.weight`): `regular 400 · medium 500 · semibold 600 · bold 700 ·
extrabold 800`.

### 6.3 Effect Styles

```
effect/shadow/sm · effect/shadow/md · effect/shadow/lg
effect/shadow/modal · effect/shadow/overlay
effect/shadow/card · effect/shadow/card-hover
effect/shadow/card-dark · effect/shadow/card-dark-hover   (GBMode)
effect/glow/brand · effect/glow/brand-lg · effect/glow/error
```

### 6.4 Espaçamento, raio e grid

Como **Variables** numéricas (não cabe em estilo nativo):

```
space/0 1 2 3 4 5 6 7 8 10 12 16 20     (base 4px → space/4 = 16)
radius/sm md base lg xl 2xl 3xl 4xl modal full   (base = raio padrão de inputs/botões)
size/control · size/control-sm · size/control-lg
size/icon-btn/{sm,md,lg} · size/page-btn · size/drawer · size/step-btn
```

---

## 7 · Checklist antes de publicar a biblioteca

- [ ] Nome do componente = nome do arquivo em `src/components/ui/` (PascalCase)
- [ ] Toda variante corresponde a uma prop real, com os mesmos valores
- [ ] Componente existe em **Light** e **GBMode** (ou via Variable Modes)
- [ ] Estados da UI cobertos onde aplicável (default, hover, focus, disabled, loading)
- [ ] Cor/texto/efeito vêm de **estilos** (zero valor solto na camada)
- [ ] Camadas renomeadas por função semântica (nenhum `Frame N`/`Group N`)
- [ ] Ícones nomeados pelo nome Lucide em kebab-case
- [ ] Tipografia 100% em **Outfit**
- [ ] Telas nomeadas `Módulo / Tela / Estado`, frame base 1440
