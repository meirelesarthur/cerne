import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { CurrencyField } from '../../../components/ui/CurrencyField'
import { FormField } from '../../../components/ui/FormField'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormSection } from '../../../components/ui/FormSection'
import { FormSelect } from '../../../components/ui/FormSelect'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { t } from '../../../design/tokens'
import { type PlanningKind, type PlanningRow } from './planejamentoPecuario.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlanejamentoItemCadastroProps {
  initialData?: PlanningRow
  allRows: PlanningRow[]
  defaultParentId?: string
  onBack: () => void
  onSave: (row: PlanningRow, parentId: string) => void
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormData {
  parentId: string
  kind: PlanningKind
  label: string
  quantity: number
  unit: string
  unitPrice: number
}

const TIPO_OPTS: { value: PlanningKind; label: string }[] = [
  { value: 'equipment', label: 'Equipamento' },
  { value: 'product', label: 'Produto' },
  { value: 'service', label: 'Serviço' },
  { value: 'acquisition', label: 'Aquisição' },
]

/**
 * Pais elegíveis: hoje só linhas `species` e `operation` têm `children` na
 * árvore de planejamento — são os únicos níveis que podem receber um item novo.
 */
function collectParentOptions(rows: PlanningRow[], path: string[] = []): { value: string; label: string }[] {
  return rows.flatMap((row) => {
    const options: { value: string; label: string }[] = []
    if (row.kind === 'species' || row.kind === 'operation') {
      options.push({ value: row.id, label: [...path, row.label].join(' › ') })
    }
    if (row.children) options.push(...collectParentOptions(row.children, [...path, row.label]))
    return options
  })
}

function findParentId(rows: PlanningRow[], targetId: string): string | null {
  for (const row of rows) {
    if (row.children?.some((child) => child.id === targetId)) return row.id
    if (row.children) {
      const found = findParentId(row.children, targetId)
      if (found) return found
    }
  }
  return null
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PlanejamentoItemCadastro({
  initialData, allRows, defaultParentId, onBack, onSave,
}: PlanejamentoItemCadastroProps) {
  const isEdit = !!initialData
  const parentOptions = useMemo(() => collectParentOptions(allRows), [allRows])

  const [form, setForm] = useState<FormData>(() => ({
    parentId:  (initialData ? findParentId(allRows, initialData.id) : null) ?? defaultParentId ?? parentOptions[0]?.value ?? '',
    kind:      initialData?.kind ?? 'product',
    label:     initialData?.label ?? '',
    quantity:  initialData?.quantity ?? 0,
    unit:      initialData?.unit ?? 'un./ha',
    unitPrice: initialData?.unitPrice ?? 0,
  }))

  const [errors, setErrors] = useState<Record<string, string>>({})
  const guard = useUnsavedChangesGuard(onBack)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    guard.setIsDirty(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next })
  }

  // ── Validação ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.parentId) errs.parentId = 'Selecione a espécie ou operação a vincular.'
    if (!form.label.trim()) errs.label = 'Descrição é obrigatória.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Salvar ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!validate()) return
    const row: PlanningRow = {
      id:        initialData?.id ?? crypto.randomUUID(),
      label:     form.label.trim(),
      kind:      form.kind,
      quantity:  form.quantity,
      unitPrice: form.unitPrice,
      unit:      form.unit,
      children:  initialData?.children,
    }
    onSave(row, form.parentId)
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      {/* ── Card principal com scroll interno + footer fixo ──────────────── */}
      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={guard.guardedBack} icon={<ArrowLeft size={14} />}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave} icon={<Save size={14} />}>
              {isEdit ? 'Salvar alterações' : 'Adicionar Item'}
            </Button>
          </>
        }
      >

        {/* Header */}
        <FormPageHeader
          title={isEdit ? 'Editar item planejado' : 'Adicionar item planejado'}
          subtitle="O valor total é calculado automaticamente."
          onBack={guard.guardedBack}
          paddingTop={t.space[4]}
        />

        {/* Campos do formulário */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: t.space[6] }}>

          <FormSection title="Vínculo">
            <FormSelect
              label="Vincular a"
              required
              options={parentOptions}
              value={form.parentId}
              onChange={(event) => set('parentId', event.target.value)}
              error={errors.parentId}
            />
          </FormSection>

          <FormSection title="Classificação" columns={2}>
            <FormSelect
              label="Tipo"
              required
              options={TIPO_OPTS}
              value={form.kind}
              onChange={(event) => set('kind', event.target.value as PlanningKind)}
            />
            <FormField
              label="Descrição"
              required
              value={form.label}
              error={errors.label}
              onChange={(event) => set('label', event.target.value)}
            />
          </FormSection>

          <FormSection title="Cálculo" columns={2}>
            <FormField
              label="Quantidade / ha"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={form.quantity}
              onChange={(event) => set('quantity', Number(event.target.value))}
            />
            <FormField
              label="Unidade"
              value={form.unit}
              onChange={(event) => set('unit', event.target.value)}
            />
            <CurrencyField label="Valor unitário / ha" value={form.unitPrice} onChange={(value) => set('unitPrice', value)} />
            <CurrencyField label="Valor total / ha" value={form.quantity * form.unitPrice} onChange={() => undefined} readOnly />
          </FormSection>

        </div>

      </PageCard>

      <ConfirmDialog
        open={guard.showExitModal}
        title="Alterações não salvas"
        message="Você tem alterações não salvas. Deseja sair sem salvar?"
        tone="destructive"
        confirmLabel="Sair sem salvar"
        cancelLabel="Ficar"
        onConfirm={guard.confirmExit}
        onCancel={guard.cancelExit}
      />
    </PageContainer>
  )
}
