import { useState } from 'react'
import { Save, MapPin } from 'lucide-react'
import { PageContainer }  from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { Button }         from '../../../components/ui/Button'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormField }     from '../../../components/ui/FormField'
import { t }             from '../../../design/tokens'
import { useTheme }      from '../../../context/ThemeContext'
import {
  TIPO_LABEL, TIPO_COLOR, TIPO_CHILD,
  type Endereco, type TipoEndereco,
} from './enderecos.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  // ao criar raiz: parentId=null, tipo='setor', initialData=undefined
  // ao criar filho: parentId=número, tipo=inferido, initialData=undefined
  // ao editar: initialData=o registro existente
  mode:         'create-root' | 'create-child' | 'edit'
  parentNode?:  Endereco          // pai (apenas em mode=create-child)
  initialData?: Endereco          // apenas em mode=edit
  onBack:       () => void
  onSave:       (e: Endereco) => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EnderecoForm({ mode, parentNode, initialData, onBack, onSave }: Props) {
  const { colors } = useTheme()

  const tipo: TipoEndereco =
    mode === 'create-root'  ? 'setor' :
    mode === 'create-child' ? (TIPO_CHILD[parentNode!.tipo] ?? 'corredor') :
                              initialData!.tipo

  const [descricao,  setDescricao]  = useState(initialData?.descricao ?? '')
  const [touched,    setTouched]    = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const errDescricao = touched ? validateDescricao(descricao) : undefined
  const isValid = !validateDescricao(descricao)

  const tipoLabel = TIPO_LABEL[tipo]
  const tipoColor = TIPO_COLOR[tipo]

  const title =
    mode === 'edit'         ? `Editar ${tipoLabel}` :
    mode === 'create-child' ? `Novo ${tipoLabel}` :
                              `Novo ${tipoLabel}`

  const handleSubmit = () => {
    setTouched(true)
    if (!isValid) return
    setSubmitting(true)

    const payload: Endereco = {
      id:        initialData?.id ?? 0,
      descricao: descricao.trim(),
      tipo,
      parentId:  mode === 'create-child' ? parentNode!.id : (initialData?.parentId ?? null),
    }
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

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <FormPageHeader
          title={title}
          subtitle={mode === 'edit' ? `Editando: ${initialData!.descricao}` : 'Preencha os campos abaixo para cadastrar.'}
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        {/* ── Campos ──────────────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 520 }}>

          {/* Tipo (read-only badge) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: t.space[5],
            padding: `${t.space[3]}px ${t.space[4]}px`,
            background: tipoColor.bg,
            borderRadius: t.radius.base,
            border: `1px solid ${tipoColor.text}22`,
          }}>
            <MapPin size={14} color={tipoColor.text} />
            <span style={{
              fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold,
              color: tipoColor.text, fontFamily: t.font.family.sans,
            }}>
              Tipo: {tipoLabel}
            </span>
          </div>

          {/* Endereçamento pai (read-only, apenas ao criar filho) */}
          {mode === 'create-child' && parentNode && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: t.space[5],
              padding: `${t.space[3]}px ${t.space[4]}px`,
              background: colors.bg.subtle,
              borderRadius: t.radius.base,
              border: `1px solid ${colors.border.default}`,
            }}>
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
                📍 Endereçamento pai:
              </span>
              <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default, fontFamily: t.font.family.sans }}>
                {TIPO_LABEL[parentNode.tipo]} — {parentNode.descricao}
              </span>
            </div>
          )}

          {/* Divisor */}
          <div style={{ height: 1, background: colors.border.default, marginBottom: t.space[5] }} />

          {/* Descrição */}
          <div style={{ marginBottom: t.space[6] }}>
            <FormField
              label="Descrição"
              required
              placeholder={`Ex: ${tipo === 'setor' ? 'Armazém Central' : 'Corredor A'}`}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              onBlur={() => setTouched(true)}
              error={errDescricao}
              status={errDescricao ? 'err' : touched && descricao.trim() ? 'ok' : 'idle'}
              disabled={submitting}
            />
          </div>

        </div>

      </PageCard>
    </PageContainer>
  )
}

function validateDescricao(v: string): string | undefined {
  const s = v.trim()
  if (!s) return 'Descrição é obrigatória.'
  if (s.length < 2) return 'Mínimo 2 caracteres.'
  if (s.length > 100) return 'Máximo 100 caracteres.'
}
