import { useState, useMemo } from 'react'
import { Save } from 'lucide-react'
import { PageContainer }      from '../../../components/ui/PageContainer'
import { Button }             from '../../../components/ui/Button'
import { FormPageHeader }     from '../../../components/ui/FormPageHeader'
import { FormField }          from '../../../components/ui/FormField'
import { FormSelect }         from '../../../components/ui/FormSelect'
import { ToggleSwitch }       from '../../../components/ui/ToggleSwitch'
import { CollapsibleSection } from '../../../components/ui/CollapsibleSection'
import { t }                  from '../../../design/tokens'
import { useTheme }           from '../../../context/ThemeContext'
import {
  GRUPOS, CATEGORIAS, CLASSES, VARIEDADES,
  NCM_OPTS, CAT_FINANCEIRA_OPTS,
  TIPO_PRODUTO_OPTS, UNIDADE_PRODUTO_OPTS,
  type Produto, type TipoProduto, type UnidadeProduto,
} from './produtos.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialData?: Produto
  onBack:  () => void
  onSave:  (p: Produto) => void
}

// ─── Validação ────────────────────────────────────────────────────────────────

const req = (v: unknown) => (!v && v !== 0 ? 'Campo obrigatório.' : undefined)

function validateDescricao(v: string): string | undefined {
  const s = v.trim()
  if (!s) return 'Descrição é obrigatória.'
  if (s.length < 2) return 'Mínimo 2 caracteres.'
  if (s.length > 120) return 'Máximo 120 caracteres.'
}

// ─── Read-only field ──────────────────────────────────────────────────────────

function ReadOnlyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginBottom: 2 }}>
        <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.textPrimary, fontFamily: t.font.family.sans }}>
          {label}
        </span>
        {hint && (
          <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
            ({hint})
          </span>
        )}
      </div>
      <div style={{ height: 38, border: `1.5px solid ${colors.border}`, borderRadius: t.radius.DEFAULT, padding: `0 ${t.space[2]}px`, fontSize: t.font.size.base, fontFamily: t.font.family.sans, color: colors.textMuted, background: colors.surfaceSubtle, display: 'flex', alignItems: 'center', userSelect: 'none' }}>
        {value || '—'}
      </div>
    </div>
  )
}

// ─── Toggle item ──────────────────────────────────────────────────────────────

function ToggleItem({ checked, onChange, label, hint, disabled }: {
  checked: boolean; onChange: (v: boolean) => void
  label: string; hint?: string; disabled?: boolean
}) {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${t.space[3]}px ${t.space[4]}px`, background: colors.surfaceSubtle, borderRadius: t.radius.DEFAULT, border: `1px solid ${colors.border}` }}>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
      <div>
        <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: disabled ? colors.textMuted : colors.textPrimary, fontFamily: t.font.family.sans }}>{label}</div>
        {hint && <div style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>{hint}</div>}
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ProdutoForm({ initialData, onBack, onSave }: Props) {
  const { colors } = useTheme()
  const isEdit = Boolean(initialData)

  // ── Estado dos campos ────────────────────────────────────────────────────────
  const [descricao,          setDescricao]          = useState(initialData?.descricao ?? '')
  const [ncm,                setNcm]                = useState(initialData?.ncm ?? '')
  const [tipo,               setTipo]               = useState<TipoProduto | ''>(initialData?.tipo ?? '')
  const [grupoId,            setGrupoId]            = useState<number | ''>(initialData?.grupoId ?? '')
  const [categoriaId,        setCategoriaId]        = useState<number | ''>(initialData?.categoriaId ?? '')
  const [classeId,           setClasseId]           = useState<number | ''>(initialData?.classeId ?? '')
  const [variedadeId,        setVariedadeId]        = useState<number | ''>(initialData?.variedadeId ?? '')
  const [unidadePrimaria,    setUnidadePrimaria]    = useState<UnidadeProduto | ''>(initialData?.unidadePrimaria ?? '')
  const [unidadeSecundaria,  setUnidadeSecundaria]  = useState<UnidadeProduto | ''>(initialData?.unidadeSecundaria ?? '')
  const [fatorConversao,     setFatorConversao]     = useState(initialData?.fatorConversao?.toString() ?? '')
  const [controlaEstoque,    setControlaEstoque]    = useState(initialData?.controlaEstoque ?? true)
  const [estoqueMinimo,      setEstoqueMinimo]      = useState(initialData?.estoqueMinimo?.toString() ?? '')
  const [controlaLote,       setControlaLote]       = useState(initialData?.controlaLote ?? false)
  const [controlaQualidade,  setControlaQualidade]  = useState(initialData?.controlaQualidade ?? false)
  const [valorReferencia,    setValorReferencia]    = useState(initialData?.valorReferencia?.toString() ?? '')
  const [catFinanceiraId,    setCatFinanceiraId]    = useState(initialData?.catFinanceiraId ?? '')
  const [ativo,              setAtivo]              = useState(initialData?.ativo ?? true)
  const [apontamento,        setApontamento]        = useState(initialData?.apontamento ?? false)
  const [adicionaInventario, setAdicionaInventario] = useState(initialData?.adicionaInventario ?? true)
  const [emitirNFe,          setEmitirNFe]          = useState(initialData?.emitirNFe ?? false)
  const [principioAtivo,     setPrincipioAtivo]     = useState(initialData?.principioAtivo ?? '')

  const [touched, setTouched] = useState({
    descricao: false, ncm: false, tipo: false,
    grupoId: false, categoriaId: false, classeId: false,
    unidadePrimaria: false, catFinanceiraId: false,
  })
  const [submitting, setSubmitting] = useState(false)

  // ── Opções em cascata ────────────────────────────────────────────────────────
  const categoriaOpts = useMemo(() => CATEGORIAS.filter(c => !grupoId || c.grupoId === Number(grupoId)), [grupoId])
  const classeOpts    = useMemo(() => CLASSES.filter(c    => !categoriaId || c.categoriaId === Number(categoriaId)), [categoriaId])
  const variedadeOpts = useMemo(() => VARIEDADES.filter(v => !classeId || v.classeId === Number(classeId)), [classeId])
  const showVariedade = variedadeOpts.length > 0

  // ── Handlers de cascata ──────────────────────────────────────────────────────
  const handleGrupo = (v: string) => {
    setGrupoId(v ? Number(v) : '')
    setCategoriaId(''); setClasseId(''); setVariedadeId('')
    setTouched(p => ({ ...p, grupoId: true }))
  }
  const handleCategoria = (v: string) => {
    setCategoriaId(v ? Number(v) : '')
    setClasseId(''); setVariedadeId('')
    setTouched(p => ({ ...p, categoriaId: true }))
  }
  const handleClasse = (v: string) => {
    setClasseId(v ? Number(v) : '')
    setVariedadeId('')
    setTouched(p => ({ ...p, classeId: true }))
  }

  // ── Erros ────────────────────────────────────────────────────────────────────
  const errDescricao     = touched.descricao     ? validateDescricao(descricao) : undefined
  const errNcm           = touched.ncm           ? req(ncm)              : undefined
  const errTipo          = touched.tipo          ? req(tipo)             : undefined
  const errGrupo         = touched.grupoId       ? req(grupoId)          : undefined
  const errCategoria     = touched.categoriaId   ? req(categoriaId)      : undefined
  const errClasse        = touched.classeId      ? req(classeId)         : undefined
  const errUnidPrimaria  = touched.unidadePrimaria ? req(unidadePrimaria) : undefined
  const errCatFinanceira = touched.catFinanceiraId ? req(catFinanceiraId) : undefined

  const isValid =
    !validateDescricao(descricao) && !!ncm && !!tipo &&
    !!grupoId && !!categoriaId && !!classeId &&
    !!unidadePrimaria && !!catFinanceiraId

  const handleSubmit = () => {
    setTouched({ descricao: true, ncm: true, tipo: true, grupoId: true, categoriaId: true, classeId: true, unidadePrimaria: true, catFinanceiraId: true })
    if (!isValid) return

    setSubmitting(true)
    const payload: Produto = {
      id:                initialData?.id ?? 0,
      codigo:            initialData?.codigo ?? '',
      descricao:         descricao.trim(),
      ncm,
      unidadePrimaria:   unidadePrimaria as UnidadeProduto,
      unidadeSecundaria: unidadeSecundaria || '',
      fatorConversao:    fatorConversao ? Number(fatorConversao.replace(',', '.')) : '',
      grupoId:           Number(grupoId),
      categoriaId:       Number(categoriaId),
      classeId:          Number(classeId),
      variedadeId:       variedadeId ? Number(variedadeId) : '',
      controlaEstoque,
      estoqueMinimo:     estoqueMinimo ? Number(estoqueMinimo) : '',
      controlaLote,
      controlaQualidade,
      precoMedio:        initialData?.precoMedio ?? 0,
      valorReferencia:   valorReferencia ? Number(valorReferencia.replace(',', '.')) : '',
      catFinanceiraId,
      tipo:              tipo as TipoProduto,
      ativo,
      apontamento,
      principioAtivo:    principioAtivo.trim(),
      adicionaInventario,
      emitirNFe,
      dtUltCompra:       initialData?.dtUltCompra ?? '',
    }
    setTimeout(() => {
      onSave(payload)
      setSubmitting(false)
    }, 150)
  }

  // Valores read-only formatados
  const codigoDisplay   = isEdit ? (initialData?.codigo ?? '—') : ''
  const precoDisplay    = initialData?.precoMedio
    ? initialData.precoMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '—'
  const dtCompraDisplay = initialData?.dtUltCompra
    ? initialData.dtUltCompra.split('-').reverse().join('/')
    : '—'

  const unidOpts = [{ value: '', label: 'Selecione...' }, ...UNIDADE_PRODUTO_OPTS]

  return (
    <PageContainer>

      {/* Header */}
      <FormPageHeader
        title={isEdit ? 'Editar Produto' : 'Novo Produto'}
        subtitle={isEdit ? `Editando: ${initialData!.codigo} — ${initialData!.descricao}` : 'Preencha os campos abaixo para cadastrar.'}
        onBack={onBack}
      />

      {/* Formulário */}
      <div style={{ maxWidth: 800 }}>

        {/* ── 1. Identificação ────────────────────────────────────────────────── */}
        <CollapsibleSection title="Identificação" fieldCount={4} defaultOpen>
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4] }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
              <ReadOnlyField
                label="Código"
                value={codigoDisplay}
                hint={isEdit ? undefined : 'gerado automaticamente'}
              />
              <FormSelect
                label="Tipo"
                required
                value={tipo}
                onChange={e => { setTipo(e.target.value as TipoProduto | ''); setTouched(p => ({ ...p, tipo: true })) }}
                onBlur={() => setTouched(p => ({ ...p, tipo: true }))}
                options={[{ value: '', label: 'Selecione...' }, ...TIPO_PRODUTO_OPTS]}
                error={errTipo}
                disabled={submitting}
              />
            </div>
            <FormField
              label="Descrição"
              required
              placeholder="Ex: HERBICIDA GLIFOSATO 480 G/L"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              onBlur={() => setTouched(p => ({ ...p, descricao: true }))}
              error={errDescricao}
              status={errDescricao ? 'err' : touched.descricao && !validateDescricao(descricao) ? 'ok' : 'idle'}
              disabled={submitting}
            />
            <FormSelect
              label="NCM"
              required
              value={ncm}
              onChange={e => { setNcm(e.target.value); setTouched(p => ({ ...p, ncm: true })) }}
              onBlur={() => setTouched(p => ({ ...p, ncm: true }))}
              options={[{ value: '', label: 'Selecione o NCM...' }, ...NCM_OPTS]}
              error={errNcm}
              disabled={submitting}
            />
          </div>
        </CollapsibleSection>

        {/* ── 2. Classificação ────────────────────────────────────────────────── */}
        <CollapsibleSection title="Classificação" fieldCount={4}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4] }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
              <FormSelect
                label="Grupo"
                required
                value={String(grupoId)}
                onChange={e => handleGrupo(e.target.value)}
                onBlur={() => setTouched(p => ({ ...p, grupoId: true }))}
                options={[{ value: '', label: 'Selecione...' }, ...GRUPOS.map(g => ({ value: String(g.id), label: g.nome }))]}
                error={errGrupo}
                disabled={submitting}
              />
              <FormSelect
                label="Categoria"
                required
                value={String(categoriaId)}
                onChange={e => handleCategoria(e.target.value)}
                onBlur={() => setTouched(p => ({ ...p, categoriaId: true }))}
                options={[{ value: '', label: grupoId ? 'Selecione...' : 'Selecione um Grupo primeiro' }, ...categoriaOpts.map(c => ({ value: String(c.id), label: c.nome }))]}
                error={errCategoria}
                disabled={submitting || !grupoId}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: showVariedade ? '1fr 1fr' : '1fr', gap: t.space[4] }}>
              <FormSelect
                label="Classe"
                required
                value={String(classeId)}
                onChange={e => handleClasse(e.target.value)}
                onBlur={() => setTouched(p => ({ ...p, classeId: true }))}
                options={[{ value: '', label: categoriaId ? 'Selecione...' : 'Selecione uma Categoria primeiro' }, ...classeOpts.map(c => ({ value: String(c.id), label: c.nome }))]}
                error={errClasse}
                disabled={submitting || !categoriaId}
              />
              {showVariedade && (
                <FormSelect
                  label="Variedade"
                  value={String(variedadeId)}
                  onChange={e => setVariedadeId(e.target.value ? Number(e.target.value) : '')}
                  options={[{ value: '', label: 'Nenhuma' }, ...variedadeOpts.map(v => ({ value: String(v.id), label: v.nome }))]}
                  disabled={submitting}
                />
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* ── 3. Unidades ─────────────────────────────────────────────────────── */}
        <CollapsibleSection title="Unidades" fieldCount={3}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: t.space[4] }}>
            <FormSelect
              label="Unidade Primária"
              required
              value={unidadePrimaria}
              onChange={e => { setUnidadePrimaria(e.target.value as UnidadeProduto | ''); setTouched(p => ({ ...p, unidadePrimaria: true })) }}
              onBlur={() => setTouched(p => ({ ...p, unidadePrimaria: true }))}
              options={unidOpts}
              error={errUnidPrimaria}
              disabled={submitting}
            />
            <FormSelect
              label="Unidade Secundária"
              hint="Opcional"
              value={unidadeSecundaria}
              onChange={e => { setUnidadeSecundaria(e.target.value as UnidadeProduto | ''); if (!e.target.value) setFatorConversao('') }}
              options={unidOpts}
              disabled={submitting}
            />
            <FormField
              label="Fator de Conversão"
              hint="Qtd. na un. primária"
              placeholder="0"
              value={fatorConversao}
              onChange={e => setFatorConversao(e.target.value)}
              disabled={submitting || !unidadeSecundaria}
              inputMode="decimal"
            />
          </div>
        </CollapsibleSection>

        {/* ── 4. Controles de Estoque ──────────────────────────────────────────── */}
        <CollapsibleSection title="Controles de Estoque" fieldCount={4}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
            <ToggleItem
              checked={controlaEstoque}
              onChange={setControlaEstoque}
              label="Controla Estoque"
              hint="Habilita rastreio de saldo."
              disabled={submitting}
            />
            <FormField
              label="Estoque Mínimo"
              hint="Qtd. de alerta"
              placeholder="0"
              value={estoqueMinimo}
              onChange={e => setEstoqueMinimo(e.target.value)}
              disabled={submitting || !controlaEstoque}
              inputMode="decimal"
            />
            <ToggleItem
              checked={controlaLote}
              onChange={setControlaLote}
              label="Controla Lote"
              hint="Rastreia lotes de entrada/saída."
              disabled={submitting}
            />
            <ToggleItem
              checked={controlaQualidade}
              onChange={setControlaQualidade}
              label="Controla Qualidade"
              hint="Exige análise antes do uso."
              disabled={submitting}
            />
          </div>
        </CollapsibleSection>

        {/* ── 5. Preços e Financeiro ───────────────────────────────────────────── */}
        <CollapsibleSection title="Preços e Financeiro" fieldCount={3}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: t.space[4] }}>
            <ReadOnlyField label="Preço Médio" value={precoDisplay} hint="calculado" />
            <FormField
              label="Valor de Referência"
              hint="Preço base de compra"
              placeholder="0,00"
              value={valorReferencia}
              onChange={e => setValorReferencia(e.target.value)}
              disabled={submitting}
              inputMode="decimal"
            />
            <FormSelect
              label="Categoria Financeira"
              required
              value={catFinanceiraId}
              onChange={e => { setCatFinanceiraId(e.target.value); setTouched(p => ({ ...p, catFinanceiraId: true })) }}
              onBlur={() => setTouched(p => ({ ...p, catFinanceiraId: true }))}
              options={[{ value: '', label: 'Selecione...' }, ...CAT_FINANCEIRA_OPTS]}
              error={errCatFinanceira}
              disabled={submitting}
            />
          </div>
        </CollapsibleSection>

        {/* ── 6. Opções ────────────────────────────────────────────────────────── */}
        <CollapsibleSection title="Opções" fieldCount={4}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
            <ToggleItem
              checked={ativo}
              onChange={setAtivo}
              label="Ativo"
              hint={ativo ? 'Produto disponível para uso.' : 'Produto desativado.'}
              disabled={submitting}
            />
            <ToggleItem
              checked={apontamento}
              onChange={setApontamento}
              label="Apontamento"
              hint="Habilitado para apontamentos agrícolas."
              disabled={submitting}
            />
            <ToggleItem
              checked={adicionaInventario}
              onChange={setAdicionaInventario}
              label="Adiciona ao Inventário"
              hint="Entra no inventário de ativos."
              disabled={submitting}
            />
            <ToggleItem
              checked={emitirNFe}
              onChange={setEmitirNFe}
              label="Emitir NFe"
              hint="Gera nota fiscal na saída."
              disabled={submitting}
            />
          </div>
        </CollapsibleSection>

        {/* ── 7. Informações Adicionais ────────────────────────────────────────── */}
        <CollapsibleSection title="Informações Adicionais" fieldCount={2}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
            <FormField
              label="Princípio Ativo"
              hint="Para defensivos agrícolas"
              placeholder="Ex: Glifosato"
              value={principioAtivo}
              onChange={e => setPrincipioAtivo(e.target.value)}
              disabled={submitting}
            />
            <ReadOnlyField label="Dt. Ult. Compra" value={dtCompraDisplay} hint="automático" />
          </div>
        </CollapsibleSection>

        {/* ── Botões ───────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: t.space[3], marginTop: t.space[4] }}>
          <Button variant="secondary" onClick={onBack} disabled={submitting}>Cancelar</Button>
          <Button
            variant="primary"
            icon={<Save size={13} />}
            onClick={handleSubmit}
            loading={submitting}
            disabled={!isValid || submitting}
          >
            Salvar
          </Button>
        </div>

      </div>
    </PageContainer>
  )
}
