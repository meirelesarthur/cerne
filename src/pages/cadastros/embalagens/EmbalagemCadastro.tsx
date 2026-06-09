import { useState } from 'react'
import { Save } from 'lucide-react'
import { PageContainer }  from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { Button }         from '../../../components/ui/Button'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormField }     from '../../../components/ui/FormField'
import { FormSelect }    from '../../../components/ui/FormSelect'
import { t }             from '../../../design/tokens'
import { UNIDADE_OPTS, type Embalagem, type UnidadeMedida } from './embalagens.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialData?: Embalagem
  onBack:  () => void
  onSave:  (emb: Embalagem) => void
}

// ─── Helpers de validação ─────────────────────────────────────────────────────

function parseQtd(raw: string): number | null {
  const n = parseFloat(raw.replace(',', '.').trim())
  return isNaN(n) ? null : n
}

function validateDescricao(v: string): string | undefined {
  const s = v.trim()
  if (!s) return 'Descrição é obrigatória.'
  if (s.length < 2) return 'Mínimo 2 caracteres.'
  if (s.length > 100) return 'Máximo 100 caracteres.'
}

function validateQuantidade(v: string): string | undefined {
  if (!v.trim()) return 'Quantidade é obrigatória.'
  const n = parseQtd(v)
  if (n === null) return 'Informe um número válido.'
  if (n <= 0) return 'A quantidade deve ser maior que zero.'
}

function validateUnidade(v: string): string | undefined {
  if (!v) return 'Selecione a unidade de medida.'
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EmbalagemCadastro({ initialData, onBack, onSave }: Props) {
  const isEdit = Boolean(initialData)

  const [descricao,  setDescricao]  = useState(initialData?.descricao ?? '')
  const [qtdRaw,     setQtdRaw]     = useState(
    initialData ? initialData.quantidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''
  )
  const [unidade,    setUnidade]    = useState<UnidadeMedida | ''>(initialData?.unidade ?? '')
  const [touched,    setTouched]    = useState({ descricao: false, qtd: false, unidade: false })
  const [submitting, setSubmitting] = useState(false)

  const errDescricao = touched.descricao ? validateDescricao(descricao) : undefined
  const errQtd       = touched.qtd       ? validateQuantidade(qtdRaw)    : undefined
  const errUnidade   = touched.unidade   ? validateUnidade(unidade)      : undefined

  const isValid =
    !validateDescricao(descricao) &&
    !validateQuantidade(qtdRaw) &&
    !validateUnidade(unidade)

  const handleSubmit = () => {
    setTouched({ descricao: true, qtd: true, unidade: true })
    if (!isValid) return

    setSubmitting(true)
    const qtd = parseQtd(qtdRaw)!
    const payload: Embalagem = {
      id:         initialData?.id ?? 0,
      descricao:  descricao.trim(),
      quantidade: qtd,
      unidade:    unidade as UnidadeMedida,
    }
    // simula async — síncrono aqui
    setTimeout(() => {
      onSave(payload)
      setSubmitting(false)
    }, 150)
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={onBack} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              icon={<Save size={13} />}
              onClick={handleSubmit}
              loading={submitting}
              disabled={!isValid || submitting}
            >
              Salvar
            </Button>
          </>
        }
      >

        {/* ── Header ────────────────────────────────────────────────────────────── */}
        <FormPageHeader
          title={isEdit ? 'Editar Embalagem' : 'Nova Embalagem'}
          subtitle={isEdit ? `Editando: ${initialData!.descricao}` : 'Preencha os campos abaixo para cadastrar.'}
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        {/* ── Campos ────────────────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 600 }}>

          {/* Descrição */}
          <div style={{ marginBottom: t.space[5] }}>
            <FormField
              label="Descrição"
              required
              placeholder="Ex: SC 60KG"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              onBlur={() => setTouched(p => ({ ...p, descricao: true }))}
              error={errDescricao}
              status={errDescricao ? 'err' : touched.descricao && descricao.trim() ? 'ok' : 'idle'}
              disabled={submitting}
            />
          </div>

          {/* Quantidade + Unidade de Medida */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4], marginBottom: t.space[6] }}>
            <FormField
              label="Quantidade"
              required
              placeholder="0,00"
              value={qtdRaw}
              onChange={e => setQtdRaw(e.target.value)}
              onBlur={() => setTouched(p => ({ ...p, qtd: true }))}
              error={errQtd}
              status={errQtd ? 'err' : touched.qtd && !validateQuantidade(qtdRaw) ? 'ok' : 'idle'}
              disabled={submitting}
              inputMode="decimal"
            />
            <FormSelect
              label="Un. de Medida"
              required
              value={unidade}
              onChange={e => {
                setUnidade(e.target.value as UnidadeMedida | '')
                setTouched(p => ({ ...p, unidade: true }))
              }}
              onBlur={() => setTouched(p => ({ ...p, unidade: true }))}
              options={[
                { value: '', label: 'Selecione...' },
                ...UNIDADE_OPTS,
              ]}
              error={errUnidade}
              disabled={submitting}
            />
          </div>

        </div>

      </PageCard>
    </PageContainer>
  )
}
