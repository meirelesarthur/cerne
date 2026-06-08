# AGRO365 — Convenção de Nomenclatura Figma ↔ Código

> Ponte oficial entre o **Design System no Figma** e o código (`src/design/tokens.ts`
> + `src/components/ui/`). Objetivo: design e dev nomeando a mesma coisa do mesmo jeito.

## Regra de Ouro

**O código é a fonte da verdade.** No Figma, o nome de cada variável é o caminho
exato do `tokens.ts`, trocando `.` e `[ ]` por `/`.

```
t.color.brand[600]   →   color/brand/600
t.space[4]           →   space/4
t.font.size['2xl']   →   font/size/2xl
```

Faltou um token? **Cria primeiro em `tokens.ts`** (Lei 3), depois no Figma — nunca o inverso.

---

## 1 · Estrutura de arquivos

| Arquivo Figma | Papel | Conteúdo |
|---|---|---|
| `AGRO365 · Design System` | Biblioteca publicada | Variables (`primitive` + `theme`) · Text/Effect Styles · Componentes |
| `AGRO365 · Layout` | Consumidor | Habilita a biblioteca DS e **só instancia** — nunca detacha, nunca recria token local |

Telas no Layout espelham os arquivos de página:

| Página React | Frame Figma |
|---|---|
| `FazendasLista.tsx` | `Fazendas · Lista` |
| `FazendaCadastro.tsx` | `Fazenda · Cadastro` |
| `ProdutoForm.tsx` | `Produto · Formulário` |

---

## 2 · Collections de Variáveis

### `primitive` — mode único (escalas cruas)

Cobre toda a paleta, espaçamento, raios, tamanhos de controle e escalas de fonte.
Segmentos = chave do código, **case-sensitive**. Exceção: `DEFAULT` → `default`
(Figma não usa maiúsculas em path). Tabela completa de valores em `tokens.ts`.

Grupos: `color/*` · `space/*` · `radius/*` · `size/*` · `font/size/*` ·
`font/weight/*` · `font/lineHeight/*` · `login/*` · `dashboard/*` · `chart/*`.

### `theme` — modes `light` + `gbMode`

Nomes de mode = literais de `ThemeMode` e do atributo `data-theme`.
Espelha as chaves de `ThemeColors` (`src/context/ThemeContext.tsx`). Toda superfície,
texto e borda no Layout aponta para `theme/*`, **nunca** para a paleta crua.

| Variável | `light` | `gbMode` |
|---|---|---|
| `theme/pageBg` | `#f5f5f5` | `#051008` |
| `theme/surfaceBg` | `#ffffff` | `#0e2a1d` |
| `theme/inputBg` | `#fafafa` | `#132f22` |
| `theme/border` | `#e5e7eb` | `#1c3f2c` |
| `theme/textPrimary` | `#171717` | `#e2f0e8` |
| `theme/textSecondary` | `#404040` | `#7da893` |
| `theme/brand` | `#059669` | `#10b981` |
| `theme/brandHover` | `#047857` | `#059669` |
| `theme/brandBg` | `#f0fdf4` | `rgba(16,185,129,0.12)` |

> Lista completa (21 chaves) = todas as props de `ThemeColors`.

---

## 3 · Styles compostos (não viram Variable)

| Recurso código | Artefato Figma | Convenção |
|---|---|---|
| `font` + `size` + `weight` + `lineHeight` | **Text Style** | `text/md`, `text/2xl` (espelha `font.size.*`) |
| `t.shadow.*` | **Effect Style** | `shadow/card`, `shadow/brand`, `shadow/modal` |
| `t.glow.*` | **Effect Style** | `glow/brand` (focus ring), `glow/error` |
| `shadow.card` / `cardDark` | **1 Effect Style com 2 modes** | `shadow/card` → `light`=card, `gbMode`=cardDark |

Família única: **Outfit** (`font/family/sans`).

---

## 4 · Componentes

| Regra | Exemplo |
|---|---|
| Nome Figma = export React (PascalCase, **sem slash**) | `Button`, `IconButton`, `FormField`, `ConfirmDialog` |
| Agrupar por Página/Section do Figma, nunca por slash no nome | Page "UI Kit" › section "Forms" › `FormField` |
| **Variant property** = nome da prop | prop `variant` → propriedade `variant` |
| **Valores da variant** = literal exato do union TS (minúsculo) | `primary` `secondary` `destructive` `ghost` |
| Prop boolean → **Boolean property** mesmo nome | `loading`, `disabled`, `fullWidth` |
| Prop de texto → **Text property** mesmo nome | `label`, `title` |
| Ícone → **Instance-swap property** mesmo nome | `icon`, `leftIcon` |
| Estados visuais → property `state` (design-only) | `state = default \| hover \| focus \| disabled` |

Catálogo (Lei 1): `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Card`, `Checkbox`,
`CollapsibleSection`, `ConfirmDialog`, `DataTable`, `Divider`, `DropdownMenu`,
`EmptyState`, `FilterDrawer`, `FormField`, `FormPageHeader`, `FormSection`,
`FormSelect`, `Heading`, `IconButton`, `Modal`, `PageContainer`, `PageHeader`,
`Pagination`, `ProgressBar`, `Skeleton`, `Spinner`, `SSOButton`, `StepFooter`,
`StepHeader`, `Stepper`, `TableToolbar`, `Tabs`, `Tag`, `ToggleSwitch`, `Tooltip`.

---

## 5 · Não migrar (vivem só no código)

Sem representação visual; documentar como Dev Resource/anotação, nunca como Variable:

| Grupo | Motivo |
|---|---|
| `t.zIndex.*` | Empilhamento é runtime |
| `t.transition.*` | Timing CSS |
| `t.animation.*` (duration, easing) | Comportamento, não design |
| `t.border.*` | Composto → recriar como stroke usando `color/*` |

---

## 6 · Code Connect — o selo

No Dev Mode, clicar no componente Figma mostra o `import` e as props reais.
Como os nomes de prop já batem, o mapeamento é quase mecânico:

```ts
// Button.figma.tsx
import figma from '@figma/code-connect'
import { Button } from './src/components/ui/Button'

figma.connect(Button, '<URL-do-node>', {
  props: {
    variant: figma.enum('variant', {
      primary: 'primary', secondary: 'secondary',
      destructive: 'destructive', ghost: 'ghost',
    }),
    loading: figma.boolean('loading'),
    label:   figma.string('label'),
  },
  example: ({ variant, loading, label }) =>
    <Button variant={variant} loading={loading}>{label}</Button>,
})
```

---

## Checklist de paridade

- [ ] Toda variável Figma tem caminho idêntico ao `tokens.ts` (`/` no lugar de `.`)
- [ ] `theme` com modes `light`/`gbMode`; superfícies usam `theme/*`, não paleta crua
- [ ] Componente Figma com nome = export React; valores de variant = literais do union
- [ ] `zIndex`/`transition`/`animation`/`border` não viraram Variable
- [ ] Layout só instancia a biblioteca DS — zero detach, zero token local
- [ ] Code Connect publicado para cada componente do catálogo
