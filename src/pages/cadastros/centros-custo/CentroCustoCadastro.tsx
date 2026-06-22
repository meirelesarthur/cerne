import { useState } from 'react'
import { ArrowLeft, Save, ChevronDown } from 'lucide-react'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { Button }        from '../../../components/ui/Button'
import { FormField }     from '../../../components/ui/FormField'
import { FormSelect }    from '../../../components/ui/FormSelect'
import { Checkbox }      from '../../../components/ui/Checkbox'
import { t }             from '../../../design/tokens'
import { useTheme }      from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import {
  gerarCodigo, classeOf, CLASSE_LABEL, antecessorLabel,
  CONDICAO_OPTS, TIPO_OPTS, ATIVO_OPTS, CATEGORIAS_TREE,
  type CentroCusto, type CondicaoCC, type TipoCC, type Categoria,
} from './centrosCusto.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CentroCustoCadastroProps {
  initialData?: CentroCusto
  allCentros:   CentroCusto[]
  onBack:       () => void
  onSave:       (cc: CentroCusto) => void
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormData {
  condicao:     CondicaoCC | ''
  descricao:    string
  ativo:        'sim' | 'nao'
  apontamento:  'sim' | 'nao'
  tipo:         TipoCC
  antecessorId: number | null
  categorias:   string[]
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CentroCustoCadastro({
  initialData, allCentros, onBack, onSave,
}: CentroCustoCadastroProps) {
  const { colors } = useTheme()
  const isEdit     = !!initialData

  const [form, setForm] = useState<FormData>(() =>
    initialData
      ? {
          condicao:     initialData.condicao,
          descricao:    initialData.descricao,
          ativo:        initialData.ativo,
          apontamento:  initialData.apontamento,
          tipo:         initialData.tipo,
          antecessorId: initialData.antecessorId,
          categorias:   initialData.categorias,
        }
      : {
          condicao:     '',
          descricao:    '',
          ativo:        'sim',
          apontamento:  'sim',
          tipo:         'produtivo',
          antecessorId: null,
          categorias:   [],
        }
  )

  const [errors, setErrors]   = useState<Record<string, string>>({})
  const { toasts, show, dismiss } = useToast()

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  // Classe derivada
  const classe = classeOf(form.antecessorId)

  // Preview do código
  const codigoPreview = initialData?.codigo ?? gerarCodigo(form.antecessorId, allCentros)

  // Opções de antecessor (excluir o próprio item em edição)
  const antecessorOpts = [
    { value: '', label: 'Nenhum (Centro Raiz)' },
    ...allCentros
      .filter(c => c.id !== initialData?.id)
      .map(c => ({ value: String(c.id), label: antecessorLabel(c) })),
  ]

  // ── Validação ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.condicao)         errs.condicao  = 'Selecione uma condição.'
    if (!form.descricao.trim()) errs.descricao = 'Descrição é obrigatória.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Salvar ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!validate()) return
    const cc: CentroCusto = {
      id:           initialData?.id ?? 0,
      codigo:       codigoPreview,
      condicao:     form.condicao as CondicaoCC,
      descricao:    form.descricao.trim(),
      ativo:        form.ativo,
      apontamento:  form.apontamento,
      tipo:         form.tipo,
      antecessorId: form.antecessorId,
      categorias:   form.categorias,
    }
    show(isEdit ? 'Centro atualizado com sucesso!' : 'Centro cadastrado com sucesso!')
    setTimeout(() => onSave(cc), 800)
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      {/* ── Card principal com scroll interno + footer fixo ──────────────── */}
      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={onBack} icon={<ArrowLeft size={14} />}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave} icon={<Save size={14} />}>
              {isEdit ? 'Salvar alterações' : 'Cadastrar Centro'}
            </Button>
          </>
        }
      >

          {/* Header */}
          <FormPageHeader
            title={isEdit ? `Editar — ${initialData!.descricao}` : 'Novo Centro de Custo'}
            subtitle={isEdit ? 'Atualize os dados do centro de custo' : 'Preencha os dados para criar um centro de custo'}
            onBack={onBack}
            paddingTop={t.space[4]}
          />

          {/* Campos do formulário */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: t.space[6] }}>

            {/* Código derivado (read-only) */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px',
              background: colors.bg.subtle,
              borderRadius: t.radius.lg,
              border: `1px solid ${colors.border.subtle}`,
            }}>
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans, fontWeight: t.font.weight.semibold, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Código gerado:
              </span>
              <span style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.bold, color: colors.fg.default, fontFamily: t.font.family.sans, fontVariantNumeric: 'tabular-nums' }}>
                {codigoPreview}
              </span>
              <span style={{
                fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
                padding: '2px 8px', borderRadius: t.radius.full,
                background: classe === 'sintetica' ? '#eff6ff' : '#f0fdf4',
                color:      classe === 'sintetica' ? '#2563eb' : '#059669',
                fontFamily: t.font.family.sans,
              }}>
                {CLASSE_LABEL[classe]}
              </span>
            </div>

            {/* Linha 1: Condição | Descrição | Ativo | Apontamento */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
              <FormSelect
                label="Condição Normal"
                required
                options={CONDICAO_OPTS}
                value={form.condicao}
                onChange={e => set('condicao', e.target.value as CondicaoCC | '')}
                error={errors.condicao}
              />
              <FormField
                label="Descrição"
                required
                placeholder="Ex.: Administração da Sede"
                value={form.descricao}
                error={errors.descricao}
                onChange={e => set('descricao', e.target.value)}
              />
              <FormSelect
                label="Ativo"
                required
                options={ATIVO_OPTS}
                value={form.ativo}
                onChange={e => set('ativo', e.target.value as 'sim' | 'nao')}
              />
              <FormSelect
                label="Apontamento"
                required
                options={ATIVO_OPTS}
                value={form.apontamento}
                onChange={e => set('apontamento', e.target.value as 'sim' | 'nao')}
              />
            </div>

            {/* Linha 2: Tipo (full width) */}
            <FormSelect
              label="Tipo"
              required
              options={TIPO_OPTS}
              value={form.tipo}
              onChange={e => set('tipo', e.target.value as TipoCC)}
            />

            {/* Linha 3: Antecessor (full width) */}
            <FormSelect
              label="Antecessor"
              options={antecessorOpts}
              value={form.antecessorId === null ? '' : String(form.antecessorId)}
              onChange={e => set('antecessorId', e.target.value === '' ? null : Number(e.target.value))}
            />

            {/* Seção: Categorias */}
            <CategoriasSection
              selected={form.categorias}
              onChange={cats => set('categorias', cats)}
              colors={colors}
            />

          </div>

      </PageCard>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}

// ─── Seção de Categorias ──────────────────────────────────────────────────────

function CategoriasSection({
  selected,
  onChange,
  colors,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
  colors:   ReturnType<typeof useTheme>['colors']
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const expandAll = () => {
    const state: Record<string, boolean> = {}
    CATEGORIAS_TREE.forEach(c => { state[c.id] = true })
    setExpanded(state)
  }

  const collapseAll = () => setExpanded({})

  const allExpanded = CATEGORIAS_TREE.every(c => expanded[c.id])

  const allIds = CATEGORIAS_TREE.flatMap(c => [c.id, ...c.children.map(ch => ch.id)])
  const allSelected = allIds.every(id => selected.includes(id))

  const markAll = () => {
    if (allSelected) {
      onChange([])
    } else {
      onChange(allIds)
    }
  }

  const toggleItem = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])
  }

  const toggleGroup = (cat: Categoria) => {
    const groupIds = [cat.id, ...cat.children.map(c => c.id)]
    const allGroupSelected = groupIds.every(id => selected.includes(id))
    if (allGroupSelected) {
      onChange(selected.filter(s => !groupIds.includes(s)))
    } else {
      const toAdd = groupIds.filter(id => !selected.includes(id))
      onChange([...selected, ...toAdd])
    }
  }

  return (
    <div style={{
      border: `1px solid ${colors.border.default}`,
      borderRadius: t.radius.xl,
      overflow: 'hidden',
    }}>
      {/* Header da seção */}
      <div style={{
        padding: '14px 18px',
        borderBottom: `1px solid ${colors.border.default}`,
        background: colors.bg.subtle,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold,
          color: colors.fg.default, fontFamily: t.font.family.sans,
        }}>
          Categorias Financeiras
          {selected.length > 0 && (
            <span style={{
              marginLeft: 8,
              fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
              padding: '1px 7px', borderRadius: t.radius.full,
              background: colors.accent.subtle, color: colors.accent.default,
            }}>
              {selected.length} selecionada{selected.length !== 1 ? 's' : ''}
            </span>
          )}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={allExpanded ? collapseAll : expandAll}>
            {allExpanded ? 'Recolher Tudo' : 'Expandir Tudo'}
          </Button>
          <Button variant={allSelected ? 'secondary' : 'primary'} size="sm" onClick={markAll}>
            {allSelected ? 'Desmarcar Todos' : 'Marcar Todos'}
          </Button>
        </div>
      </div>

      {/* Tree */}
      <div style={{ padding: '12px 18px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {CATEGORIAS_TREE.map(cat => {
          const groupIds      = [cat.id, ...cat.children.map(c => c.id)]
          const groupSelected = groupIds.every(id => selected.includes(id))
          const groupPartial  = !groupSelected && groupIds.some(id => selected.includes(id))
          const isOpen        = expanded[cat.id] ?? false

          return (
            <div key={cat.id}>
              {/* Linha do grupo */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 6px',
                  borderRadius: t.radius.DEFAULT,
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = colors.bg.subtle }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                onClick={() => setExpanded(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
              >
                <Checkbox
                  checked={groupSelected}
                  indeterminate={groupPartial}
                  onChange={() => toggleGroup(cat)}
                  aria-label={cat.label}
                />
                <span style={{
                  flex: 1, fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold,
                  color: colors.fg.default, fontFamily: t.font.family.sans,
                  letterSpacing: '0.01em',
                }}>
                  {cat.label}
                </span>
                <ChevronDown
                  size={14}
                  color={colors.fg.subtle}
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.15s',
                    flexShrink: 0,
                  }}
                />
              </div>

              {/* Filhos */}
              {isOpen && (
                <div style={{ marginLeft: 28, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {cat.children.map(child => (
                    <div
                      key={child.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '5px 6px',
                        borderRadius: t.radius.DEFAULT,
                        cursor: 'pointer',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = colors.bg.subtle }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      onClick={() => toggleItem(child.id)}
                    >
                      <Checkbox
                        checked={selected.includes(child.id)}
                        onChange={() => toggleItem(child.id)}
                        aria-label={child.label}
                      />
                      <span style={{
                        fontSize: t.font.size.sm, color: colors.fg.muted,
                        fontFamily: t.font.family.sans,
                      }}>
                        {child.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

