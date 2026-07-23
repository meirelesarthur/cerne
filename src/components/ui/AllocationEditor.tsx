import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { CurrencyField, PercentField, formatCurrency } from './CurrencyField'
import { FeedbackBanner } from './FeedbackBanner'
import { FormField } from './FormField'
import { RepeaterList } from './RepeaterList'

export interface AllocationItem {
  id: string
  label: string
  amount: number
  percent: number
}

interface AllocationEditorProps {
  items: AllocationItem[]
  targetAmount: number
  onChange: (items: AllocationItem[]) => void
  createItem?: () => AllocationItem
  addLabel?: string
  readOnlyLabels?: boolean
}

export function AllocationEditor({
  items,
  targetAmount,
  onChange,
  createItem = () => ({ id: crypto.randomUUID(), label: '', amount: 0, percent: 0 }),
  addLabel = 'Adicionar rateio',
  readOnlyLabels = false,
}: AllocationEditorProps) {
  const { colors } = useTheme()
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const difference = targetAmount - total
  const balanced = Math.abs(difference) < 0.01

  const update = (index: number, patch: Partial<AllocationItem>) => {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
      <RepeaterList
        items={items}
        addLabel={addLabel}
        emptyText="Adicione ao menos uma linha para distribuir o valor."
        onAdd={() => onChange([...items, createItem()])}
        onRemove={(index) => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
        renderRow={(item, index) => (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 2fr) minmax(140px, 1fr) minmax(110px, 0.7fr)', gap: t.space[3] }}>
            <FormField label="Categoria / destino" value={item.label} readOnly={readOnlyLabels} onChange={(event) => update(index, { label: event.target.value })} />
            <CurrencyField label="Valor" value={item.amount} onChange={(amount) => update(index, { amount, percent: targetAmount > 0 ? amount / targetAmount * 100 : 0 })} />
            <PercentField label="Percentual" value={item.percent} onChange={(percent) => update(index, { percent, amount: targetAmount * percent / 100 })} />
          </div>
        )}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: t.space[6], padding: `${t.space[3]}px ${t.space[4]}px`, borderRadius: t.radius.base, background: colors.bg.subtle, color: colors.fg.default, fontFamily: t.font.family.sans, fontSize: t.font.size.sm }}>
        <span>Valor líquido: <strong>{formatCurrency(targetAmount)}</strong></span>
        <span>Rateado: <strong>{formatCurrency(total)}</strong></span>
      </div>

      {!balanced && (
        <FeedbackBanner
          variant="warning"
          title="O rateio ainda não fecha com o valor líquido"
          description={`Ajuste ${formatCurrency(Math.abs(difference))} ${difference > 0 ? 'que ainda falta distribuir' : 'que está acima do total'}.`}
        />
      )}
    </div>
  )
}
