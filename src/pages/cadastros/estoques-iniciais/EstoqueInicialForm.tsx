import React, { useState, useEffect, useRef } from 'react'
import {
  Search, X, Lock, AlertTriangle, Plus, Save, ChevronDown,
} from 'lucide-react'
import { PageContainer }       from '../../../components/ui/PageContainer'
import { FormPageHeader }      from '../../../components/ui/FormPageHeader'
import { FormField }           from '../../../components/ui/FormField'
import { FormSelect }          from '../../../components/ui/FormSelect'
import { Button }              from '../../../components/ui/Button'
import { CollapsibleSection }  from '../../../components/ui/CollapsibleSection'
import { Modal }               from '../../../components/ui/Modal'
import { ConfirmDialog }       from '../../../components/ui/ConfirmDialog'
import { t }                   from '../../../design/tokens'
import { useTheme }            from '../../../context/ThemeContext'
import { mockProdutos }  from '../produtos/produtos.mock'
import { mockArmazens }  from '../armazens/armazens.mock'
import { UNIDADE_PRODUTO_OPTS, GRUPOS, type Produto } from '../produtos/produtos.types'
import type { EstoqueInicial } from './estoques-iniciais.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialData?: EstoqueInicial
  registros:    EstoqueInicial[]
  onBack:       () => void
  onSave:       (data: Omit<EstoqueInicial, 'id'>) => void
}

// ─── FormState ────────────────────────────────────────────────────────────────

interface FormState {
  produtoId:      string
  unidade:        string
  armazemId:      string
  qtdeTotal:      string
  vlUnitario:     string
  loteFornecedor: string
  dtValidade:     string
  classificacao:  string
  bebida:         string
}

// ─── QuickProduct ─────────────────────────────────────────────────────────────

interface QuickProduct {
  descricao:       string
  unidade:         string
  grupoId:         string
  controlaEstoque: boolean
  ativo:           boolean
}

// ─── In-memory extra products (not persisted, just for session) ───────────────

const sessionProducts: Produto[] = []

function getAllProducts(): Produto[] {
  return [...mockProdutos, ...sessionProducts]
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EstoqueInicialForm({ initialData, registros, onBack, onSave }: Props) {
  const { colors } = useTheme()
  const isEdit = Boolean(initialData)

  const initForm = (): FormState => {
    if (initialData) {
      return {
        produtoId:      String(initialData.produtoId),
        unidade:        initialData.unidade,
        armazemId:      String(initialData.armazemId),
        qtdeTotal:      initialData.qtdeTotal.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
        vlUnitario:     initialData.vlUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
        loteFornecedor: initialData.loteFornecedor,
        dtValidade:     initialData.dtValidade,
        classificacao:  initialData.classificacao,
        bebida:         initialData.bebida,
      }
    }
    return {
      produtoId: '', unidade: '', armazemId: '',
      qtdeTotal: '', vlUnitario: '',
      loteFornecedor: '', dtValidade: '',
      classificacao: '', bebida: '',
    }
  }

  const [form,       setForm]       = useState<FormState>(initForm)
  const [touched,    setTouched]    = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [isDirty,    setIsDirty]    = useState(false)

  const [showExitModal,       setShowExitModal]       = useState(false)
  const [showDuplicateAlert,  setShowDuplicateAlert]  = useState(false)
  const [showProductModal,    setShowProductModal]     = useState(false)
  const [productSearch,       setProductSearch]        = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)

  const [flashKey, setFlashKey] = useState(0)

  const comboboxRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  // Flash computed fields when values change
  useEffect(() => {
    setFlashKey(k => k + 1)
  }, [form.qtdeTotal, form.vlUnitario])

  const setField = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const touch = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

  // ── Derived values ────────────────────────────────────────────────────────────

  const qtdeNum = parseFloat(form.qtdeTotal.replace(/\./g, '').replace(',', '.')) || 0
  const vlNum   = parseFloat(form.vlUnitario.replace(/\./g, '').replace(',', '.')) || 0
  const valorTotal     = qtdeNum * vlNum
  const custoMedioUnit = qtdeNum > 0 ? valorTotal / qtdeNum : 0

  const selectedProduct: Produto | null =
    form.produtoId ? (getAllProducts().find(p => p.id === Number(form.produtoId)) ?? null) : null
  const showZone3 = selectedProduct?.controlaLote ?? false

  // ── Armazém options ───────────────────────────────────────────────────────────

  const armazemOpts = [
    { value: '', label: 'Selecione o armazém...' },
    ...mockArmazens.filter(a => a.ativo).map(a => ({ value: String(a.id), label: a.descricao })),
  ]

  // ── Filtered products for combobox ────────────────────────────────────────────

  const filteredProducts = productSearch.trim().length >= 1
    ? getAllProducts().filter(p =>
        p.descricao.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.codigo.toLowerCase().includes(productSearch.toLowerCase())
      )
    : getAllProducts()

  // ── Validation ────────────────────────────────────────────────────────────────

  const errors: Record<string, string> = {
    produtoId:      !form.produtoId ? 'Produto obrigatório' : '',
    armazemId:      !form.armazemId ? 'Armazém obrigatório' : '',
    qtdeTotal:      !form.qtdeTotal || qtdeNum <= 0 ? 'Informe uma quantidade válida (> 0)' : '',
    vlUnitario:     form.vlUnitario === '' ? 'Informe o valor unitário' : '',
    loteFornecedor: showZone3 && !form.loteFornecedor ? 'Lote obrigatório' : '',
    dtValidade:     showZone3 && !form.dtValidade ? 'Data de validade obrigatória' : '',
  }
  const isValid = Object.values(errors).every(e => e === '')

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleBack = () => {
    if (isDirty) { setShowExitModal(true); return }
    onBack()
  }

  const buildPayload = (): Omit<EstoqueInicial, 'id'> => {
    const prod = getAllProducts().find(p => p.id === Number(form.produtoId))
    const arm  = mockArmazens.find(a => a.id === Number(form.armazemId))
    return {
      produtoId:        Number(form.produtoId),
      produtoDescricao: prod?.descricao ?? '',
      produtoCodigo:    prod?.codigo ?? '',
      unidade:          form.unidade,
      armazemId:        Number(form.armazemId),
      armazemDescricao: arm?.descricao ?? '',
      qtdeTotal:        qtdeNum,
      vlUnitario:       vlNum,
      valorTotal,
      custoMedioUnit,
      dtMovimento:      new Date().toISOString().split('T')[0],
      loteFornecedor:   form.loteFornecedor,
      dtValidade:       form.dtValidade,
      classificacao:    form.classificacao,
      bebida:           form.bebida,
    }
  }

  const handleSubmit = () => {
    const allTouched: Record<string, boolean> = {}
    Object.keys(errors).forEach(k => { allTouched[k] = true })
    setTouched(allTouched)
    if (!isValid) return

    // Duplicate check
    const hasDup = registros.some(r =>
      r.produtoId === Number(form.produtoId) &&
      r.armazemId === Number(form.armazemId) &&
      r.id !== (initialData?.id ?? -1)
    )
    if (hasDup) {
      setShowDuplicateAlert(true)
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      onSave(buildPayload())
      onBack()
    }, 200)
  }

  const handleSaveAnyway = () => {
    setShowDuplicateAlert(false)
    setSubmitting(true)
    setTimeout(() => {
      onSave(buildPayload())
      onBack()
    }, 200)
  }

  // ── Section style ─────────────────────────────────────────────────────────────

  const hintText: React.CSSProperties = {
    fontSize: t.font.size.xs,
    color: colors.textMuted,
    fontFamily: t.font.family.sans,
    marginTop: 4,
  }

  const computedFieldStyle: React.CSSProperties = {
    background: colors.surfaceSubtle,
    cursor: 'not-allowed',
  }

  // ── Product select from dropdown ──────────────────────────────────────────────

  const handleSelectProduct = (p: Produto) => {
    setForm(prev => ({
      ...prev,
      produtoId: String(p.id),
      unidade:   p.unidadePrimaria,
    }))
    setProductSearch(p.descricao)
    setShowProductDropdown(false)
    setIsDirty(true)
    touch('produtoId')
  }

  // ── Quick product form state ───────────────────────────────────────────────────

  const [qp, setQp] = useState<QuickProduct>({ descricao: '', unidade: '', grupoId: '', controlaEstoque: true, ativo: true })
  const [qpTouched, setQpTouched] = useState(false)

  const qpErrors = {
    descricao: !qp.descricao.trim() ? 'Descrição obrigatória' : '',
    unidade:   !qp.unidade ? 'Unidade obrigatória' : '',
    grupoId:   !qp.grupoId ? 'Grupo obrigatório' : '',
  }
  const qpValid = Object.values(qpErrors).every(e => e === '')

  const handleSaveQuickProduct = () => {
    setQpTouched(true)
    if (!qpValid) return

    const newId = Date.now()
    const newProd: Produto = {
      id: newId,
      codigo: `QRP${String(newId).slice(-5)}`,
      descricao: qp.descricao.trim(),
      ncm: '',
      unidadePrimaria: qp.unidade as Produto['unidadePrimaria'],
      unidadeSecundaria: '',
      fatorConversao: '',
      grupoId: Number(qp.grupoId),
      categoriaId: '',
      classeId: '',
      variedadeId: '',
      controlaEstoque: qp.controlaEstoque,
      estoqueMinimo: '',
      controlaLote: false,
      controlaQualidade: false,
      precoMedio: 0,
      valorReferencia: '',
      catFinanceiraId: '',
      tipo: 'insumo',
      ativo: qp.ativo,
      apontamento: false,
      principioAtivo: '',
      adicionaInventario: true,
      emitirNFe: false,
      dtUltCompra: '',
    }
    sessionProducts.push(newProd)

    setForm(prev => ({
      ...prev,
      produtoId: String(newId),
      unidade:   qp.unidade,
    }))
    setProductSearch(qp.descricao.trim())
    setShowProductModal(false)
    setIsDirty(true)
    touch('produtoId')
    setQp({ descricao: '', unidade: '', grupoId: '', controlaEstoque: true, ativo: true })
    setQpTouched(false)
  }

  const grupoOpts = [
    { value: '', label: 'Selecione o grupo...' },
    ...GRUPOS.map(g => ({ value: String(g.id), label: g.nome })),
  ]

  return (
    <PageContainer>
      <style>{`
        @keyframes flashBg { 0%{background: #d1fae5;} 100%{background: transparent;} }
        .flash-computed { animation: flashBg 0.3s ease; }
      `}</style>

      {/* ── Form Header ───────────────────────────────────────────────────────── */}
      <FormPageHeader
        title={isEdit ? 'Editar Saldo Inicial' : 'Novo Saldo Inicial'}
        subtitle={isEdit ? 'Atualize o saldo inicial de estoque' : 'Preencha os dados do saldo inicial de estoque'}
        onBack={handleBack}
      />

      {/* ── ZONE 1 — IDENTIFICAÇÃO ────────────────────────────────────────────── */}
      <CollapsibleSection title="Identificação" fieldCount={3} defaultOpen>

        {/* Product combobox */}
        <div style={{ marginBottom: t.space[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.textPrimary, fontFamily: t.font.family.sans }}>
              Produto <span style={{ color: t.color.error.text }}>*</span>
            </span>
            <button
              type="button"
              onClick={() => { setShowProductModal(true) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: t.font.size.xs, color: colors.brand, fontFamily: t.font.family.sans, fontWeight: t.font.weight.semibold, display: 'flex', alignItems: 'center', gap: 3 }}
            >
              <Plus size={11} /> Novo Produto
            </button>
          </div>

          <div ref={comboboxRef} style={{ position: 'relative' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              height: 36,
              border: `1.5px solid ${touched.produtoId && errors.produtoId ? t.color.error.text : showProductDropdown ? t.color.brand[600] : colors.border}`,
              borderRadius: t.radius.default,
              padding: '0 10px',
              background: colors.surfaceBg,
              transition: 'border-color 0.15s',
            }}>
              <Search size={13} color={showProductDropdown ? t.color.brand[600] : colors.textMuted} style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Buscar produto por nome ou código..."
                value={productSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setProductSearch(e.target.value)
                  setShowProductDropdown(true)
                  if (!e.target.value) {
                    setField('produtoId', '')
                    setField('unidade', '')
                  }
                }}
                onFocus={() => setShowProductDropdown(true)}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: t.font.size.sm, color: colors.textPrimary, fontFamily: t.font.family.sans, minWidth: 0 }}
              />
              {productSearch && (
                <button
                  type="button"
                  onClick={() => { setProductSearch(''); setField('produtoId', ''); setField('unidade', ''); setShowProductDropdown(false) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: colors.textMuted }}
                >
                  <X size={11} />
                </button>
              )}
              <ChevronDown size={12} color={colors.textMuted} />
            </div>

            {/* Dropdown */}
            {showProductDropdown && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
                background: colors.surfaceBg,
                border: `1px solid ${colors.border}`,
                borderRadius: t.radius.lg,
                boxShadow: t.shadow.md,
                maxHeight: 280,
                overflowY: 'auto',
                marginTop: 2,
              }}>
                {/* Header */}
                <div style={{ padding: '8px 12px 6px', fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans, borderBottom: `1px solid ${colors.borderSubtle}` }}>
                  {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </div>

                {/* Items */}
                {filteredProducts.slice(0, 8).map(p => (
                  <ProductDropdownRow
                    key={p.id}
                    product={p}
                    onSelect={() => handleSelectProduct(p)}
                    colors={colors}
                    isSelected={form.produtoId === String(p.id)}
                  />
                ))}

                {/* Footer */}
                <div style={{ borderTop: `1px solid ${colors.borderSubtle}` }}>
                  <button
                    type="button"
                    onClick={() => { setShowProductDropdown(false); setShowProductModal(true) }}
                    style={{ width: '100%', padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: t.font.size.sm, color: colors.brand, fontFamily: t.font.family.sans, fontWeight: t.font.weight.bold, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus size={13} /> Novo Produto
                  </button>
                </div>
              </div>
            )}
          </div>

          {touched.produtoId && errors.produtoId && (
            <span style={{ fontSize: t.font.size.xs, color: t.color.error.text, fontFamily: t.font.family.sans, marginTop: 4, display: 'block' }}>
              {errors.produtoId}
            </span>
          )}
        </div>

        {/* Unidade + Armazém */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
          <div>
            <FormField
              label="Unidade de Medida"
              value={form.unidade || '—'}
              readOnly
              iconRight={<Lock size={12} color={colors.textMuted} />}
              style={{ background: colors.surfaceSubtle, cursor: 'not-allowed' }}
            />
            <p style={hintText}>Preenchida automaticamente a partir do produto selecionado</p>
          </div>
          <FormSelect
            label="Armazém"
            required
            value={form.armazemId}
            onChange={e => { setField('armazemId', e.target.value); touch('armazemId') }}
            onBlur={() => touch('armazemId')}
            options={armazemOpts}
            error={touched.armazemId ? errors.armazemId : ''}
            disabled={submitting}
          />
        </div>
      </CollapsibleSection>

      {/* ── ZONE 2 — QUANTIDADES & VALORES ───────────────────────────────────── */}
      <CollapsibleSection title="Quantidades &amp; Valores" fieldCount={4} defaultOpen>

        {/* Row 1: Qtde + Vl Unit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4], marginBottom: t.space[4] }}>
          <FormField
            label="Qtde. Total"
            required
            placeholder="0,000"
            value={form.qtdeTotal}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setField('qtdeTotal', e.target.value); touch('qtdeTotal') }}
            onBlur={() => touch('qtdeTotal')}
            error={touched.qtdeTotal ? errors.qtdeTotal : ''}
            status={touched.qtdeTotal ? (errors.qtdeTotal ? 'err' : 'ok') : 'idle'}
            disabled={submitting}
          />
          <FormField
            label="Vl. Unitário"
            required
            placeholder="0,0000"
            value={form.vlUnitario}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setField('vlUnitario', e.target.value); touch('vlUnitario') }}
            onBlur={() => touch('vlUnitario')}
            error={touched.vlUnitario ? errors.vlUnitario : ''}
            status={touched.vlUnitario ? (errors.vlUnitario ? 'err' : 'ok') : 'idle'}
            disabled={submitting}
          />
        </div>

        {/* Row 2: Computed fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
          <div>
            <div key={`vt-${flashKey}`} className="flash-computed" style={{ borderRadius: t.radius.default }}>
              <FormField
                label="Valor Total"
                value={`R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                readOnly
                style={computedFieldStyle}
              />
            </div>
            <p style={hintText}>= Qtde. × Vl. Unit.</p>
          </div>
          <div>
            <div key={`cm-${flashKey}`} className="flash-computed" style={{ borderRadius: t.radius.default }}>
              <FormField
                label="Custo Médio Unitário"
                value={`R$ ${custoMedioUnit.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`}
                readOnly
                style={computedFieldStyle}
              />
            </div>
            <p style={hintText}>= Valor Total ÷ Qtde. Total</p>
          </div>
        </div>

        {/* Duplicate alert */}
        {showDuplicateAlert && (
          <div style={{
            marginTop: t.space[4],
            background: t.color.warning.bg,
            border: `1px solid ${t.color.warning.border}`,
            borderRadius: t.radius.lg,
            padding: `${t.space[4]}px`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: t.space[3], marginBottom: t.space[3] }}>
              <AlertTriangle size={18} color={t.color.warning.text} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: t.color.warning.text, fontFamily: t.font.family.sans, marginBottom: 4 }}>
                  Já existe um saldo inicial para este produto neste armazém.
                </div>
                <div style={{ fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans }}>
                  Deseja substituir ou adicionar novo lançamento?
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: t.space[2] }}>
              <Button variant="secondary" size="sm" onClick={() => setShowDuplicateAlert(false)}>
                Substituir
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveAnyway}>
                Adicionar mesmo assim
              </Button>
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* ── ZONE 3 — INFORMAÇÕES ADICIONAIS (conditional) ─────────────────────── */}
      {showZone3 && (
        <CollapsibleSection title="Informações Adicionais" fieldCount={2} defaultOpen>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
            <FormField
              label="Lote Fornecedor"
              required={showZone3}
              placeholder="Ex: LOT-2025-001"
              value={form.loteFornecedor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setField('loteFornecedor', e.target.value); touch('loteFornecedor') }}
              onBlur={() => touch('loteFornecedor')}
              error={touched.loteFornecedor ? errors.loteFornecedor : ''}
              status={touched.loteFornecedor ? (errors.loteFornecedor ? 'err' : (form.loteFornecedor ? 'ok' : 'idle')) : 'idle'}
              disabled={submitting}
            />
            <FormField
              label="Dt. de Validade"
              required={showZone3}
              type="date"
              value={form.dtValidade}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setField('dtValidade', e.target.value); touch('dtValidade') }}
              onBlur={() => touch('dtValidade')}
              error={touched.dtValidade ? errors.dtValidade : ''}
              status={touched.dtValidade ? (errors.dtValidade ? 'err' : (form.dtValidade ? 'ok' : 'idle')) : 'idle'}
              disabled={submitting}
            />
          </div>
        </CollapsibleSection>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: t.space[3], marginTop: t.space[2] }}>
        <Button variant="secondary" onClick={handleBack} disabled={submitting}>Cancelar</Button>
        <Button variant="primary" icon={<Save size={13} />} onClick={handleSubmit} loading={submitting} disabled={!isValid || submitting}>
          Salvar
        </Button>
      </div>

      {/* ── Exit modal ────────────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={showExitModal}
        title="Alterações não salvas"
        message="Você tem alterações não salvas. Deseja sair sem salvar?"
        tone="destructive"
        confirmLabel="Sair sem salvar"
        cancelLabel="Ficar"
        onConfirm={() => { setShowExitModal(false); onBack() }}
        onCancel={() => setShowExitModal(false)}
      />

      {/* ── Quick Product Modal ───────────────────────────────────────────────── */}
      <Modal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Novo Produto (cadastro rápido)"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowProductModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveQuickProduct}>Salvar e Selecionar</Button>
          </>
        }
      >
        {/* Info banner */}
        <div style={{ background: t.color.info.bg, border: `1px solid ${t.color.info.border}`, borderRadius: t.radius.default, padding: `${t.space[3]}px ${t.space[4]}px`, marginBottom: t.space[4], fontSize: t.font.size.xs, color: t.color.info.text, fontFamily: t.font.family.sans, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 14 }}>ℹ</span>
          <span>Preencha os campos essenciais. Você pode completar o cadastro depois em Estrutura → Produtos.</span>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4] }}>
          <FormField
            label="Descrição"
            required
            placeholder="Ex: HERBICIDA ROUNDUP WG"
            value={qp.descricao}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQp(prev => ({ ...prev, descricao: e.target.value }))}
            error={qpTouched && qpErrors.descricao ? qpErrors.descricao : ''}
            status={qpTouched ? (qpErrors.descricao ? 'err' : 'ok') : 'idle'}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
            <FormSelect
              label="1ª Unidade de Medida"
              required
              value={qp.unidade}
              onChange={e => setQp(prev => ({ ...prev, unidade: e.target.value }))}
              options={[{ value: '', label: 'Selecione...' }, ...UNIDADE_PRODUTO_OPTS]}
              error={qpTouched && qpErrors.unidade ? qpErrors.unidade : ''}
            />
            <FormSelect
              label="Grupo"
              required
              value={qp.grupoId}
              onChange={e => setQp(prev => ({ ...prev, grupoId: e.target.value }))}
              options={grupoOpts}
              error={qpTouched && qpErrors.grupoId ? qpErrors.grupoId : ''}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }}>
            <FormSelect
              label="Controla Estoque"
              required
              value={qp.controlaEstoque ? 'sim' : 'nao'}
              onChange={e => setQp(prev => ({ ...prev, controlaEstoque: e.target.value === 'sim' }))}
              options={[{ value: 'sim', label: 'Sim' }, { value: 'nao', label: 'Não' }]}
            />
            <FormSelect
              label="Ativo"
              required
              value={qp.ativo ? 'sim' : 'nao'}
              onChange={e => setQp(prev => ({ ...prev, ativo: e.target.value === 'sim' }))}
              options={[{ value: 'sim', label: 'Sim' }, { value: 'nao', label: 'Não' }]}
            />
          </div>
        </div>
      </Modal>

    </PageContainer>
  )
}

// ─── ProductDropdownRow ───────────────────────────────────────────────────────

function ProductDropdownRow({ product, onSelect, colors, isSelected }: {
  product: Produto
  onSelect: () => void
  colors: ReturnType<typeof useTheme>['colors']
  isSelected: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%',
        padding: '8px 12px',
        background: isSelected ? colors.brandBg : hov ? colors.surfaceSubtle : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'background 0.1s',
      }}
    >
      <span style={{ fontSize: t.font.size.xs, color: colors.brand, fontWeight: t.font.weight.semibold, fontFamily: t.font.family.sans, minWidth: 52 }}>
        {product.codigo}
      </span>
      <span style={{ fontSize: t.font.size.sm, color: colors.textPrimary, fontFamily: t.font.family.sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {product.descricao}
      </span>
    </button>
  )
}

