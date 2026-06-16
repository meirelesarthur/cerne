import { useState } from 'react'
import {
  Pencil,
  MapPin,
  Ruler,
  Building2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import type { BadgeVariant } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { MapView } from '../../../components/ui/MapView'
import { EmptyState } from '../../../components/ui/EmptyState'
import { DataTable } from '../../../components/ui/DataTable'
import type { Column } from '../../../components/ui/DataTable'
import { mockFazendaSantaLuzia } from './fazendas.mock'
import type { FazendaDetalheData } from './fazendas.types'
import { useTheme } from '../../../context/ThemeContext'
import { Tabs } from '../../../components/ui/Tabs'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { t }             from '../../../design/tokens'

interface FazendaDetalheProps {
  onBack: () => void
  onEdit: () => void
  fazenda?: FazendaDetalheData
}

type Tab = 'identificacao' | 'documentacao' | 'localizacao' | 'financeiro' | 'centrosCusto'

const TABS: { id: Tab; label: string }[] = [
  { id: 'identificacao', label: 'Identificação' },
  { id: 'documentacao',  label: 'Documentação' },
  { id: 'localizacao',   label: 'Localização' },
  { id: 'financeiro',    label: 'Financeiro' },
  { id: 'centrosCusto',  label: 'Centros de Custo' },
]

function InfoField({ label, value, full }: { label: string; value: React.ReactNode; full?: boolean }) {
  const { colors } = useTheme()
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      <div
        style={{
          fontSize: t.font.size.xs,
          fontWeight: 600,
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 4,
          fontFamily: t.font.family.sans,
          transition: `color ${t.transition.smooth}`,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: t.font.size.base,
          color: colors.textPrimary,
          fontFamily: t.font.family.sans,
          fontWeight: 400,
          minHeight: 20,
          transition: `color ${t.transition.smooth}`,
        }}
      >
        {value || <span style={{ color: colors.border }}>—</span>}
      </div>
    </div>
  )
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px 32px',
      }}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme()
  return (
    <div
      style={{
        fontSize: t.font.size.xs,
        fontWeight: 600,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        marginBottom: 16,
        fontFamily: t.font.family.sans,
        paddingBottom: 10,
        borderBottom: `1px solid ${colors.borderSubtle}`,
        transition: `color ${t.transition.smooth}, border-color ${t.transition.smooth}`,
      }}
    >
      {children}
    </div>
  )
}

function BoolField({ value, trueLabel = 'Sim', falseLabel = 'Não' }: { value: boolean; trueLabel?: string; falseLabel?: string }) {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {value
        ? <CheckCircle2 size={14} color={colors.brand} />
        : <XCircle size={14} color={colors.textMuted} />
      }
      <span style={{ fontSize: t.font.size.base, color: value ? colors.brand : colors.textMuted, fontFamily: "'Outfit', sans-serif" }}>
        {value ? trueLabel : falseLabel}
      </span>
    </div>
  )
}

function TabIdentificacao({ f }: { f: FazendaDetalheData }) {
  return (
    <div>
      <SectionTitle>Dados Principais</SectionTitle>
      <FieldGrid>
        <InfoField label="Razão Social / Nome" value={f.nome} />
        <InfoField label="CPF / CNPJ" value={f.cpfCnpj} />
        <InfoField label="Inscrição Estadual" value={f.inscricaoEstadual} />
        <InfoField label="Telefone" value={f.telefone} />
      </FieldGrid>
    </div>
  )
}

function TabDocumentacao({ f }: { f: FazendaDetalheData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <SectionTitle>Tipo de Exploração</SectionTitle>
        <FieldGrid>
          <InfoField label="Tipo de Exploração" value={f.tipoExploracao} />
        </FieldGrid>
      </div>

      <div>
        <SectionTitle>Registros Ambientais e Fundiários</SectionTitle>
        <FieldGrid>
          <InfoField label="CAR — Cadastro Ambiental Rural" value={
            <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{f.car}</span>
          } />
          <InfoField label="NIRF — Imóvel Rural" value={f.nirf} />
          <InfoField label="CCIR — Certificado de Cadastro" value={f.ccir} />
          <InfoField label="CAFIR — Imóvel Rural" value={f.cafir} />
          <InfoField label="CAE-PI — Produtor Integrado" value={f.caepi} />
        </FieldGrid>
      </div>
    </div>
  )
}

function TabLocalizacao({ f }: { f: FazendaDetalheData }) {
  const googleMapsUrl = `https://www.google.com/maps?q=${f.latitude},${f.longitude}`
  const hasLocation = !!(f.perimetroGeoJSON || (f.latitude && f.longitude))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <SectionTitle>Demarcação da Área</SectionTitle>
        {hasLocation ? (
          <MapView geoJSON={f.perimetroGeoJSON} lat={f.latitude} lng={f.longitude} height={340} />
        ) : (
          <EmptyState
            icon={<MapPin size={28} />}
            message="Sem demarcação cadastrada"
            description="Edite a fazenda para desenhar o perímetro no mapa ou importar um arquivo KML."
          />
        )}
      </div>

      <div>
        <SectionTitle>Endereço</SectionTitle>
        <FieldGrid>
          <InfoField label="País" value={f.pais} />
          <InfoField label="CEP" value={f.cep} />
          <InfoField label="Cidade" value={f.cidade} />
          <InfoField label="UF" value={f.uf} />
          <InfoField label="Endereço" value={f.endereco} />
          <InfoField label="Número / Referência" value={f.numero} />
          <InfoField label="Bairro / Distrito" value={f.bairro} />
        </FieldGrid>
      </div>

      <div>
        <SectionTitle>Geolocalização</SectionTitle>
        <FieldGrid>
          <InfoField label="Latitude" value={f.latitude} />
          <InfoField label="Longitude" value={f.longitude} />
          <InfoField
            label="Mapa"
            value={
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  color: t.color.brand[600],
                  fontSize: t.font.size.sm,
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontFamily: t.font.family.sans,
                }}
              >
                <MapPin size={12} />
                Ver no Google Maps
                <ExternalLink size={11} />
              </a>
            }
          />
        </FieldGrid>
      </div>
    </div>
  )
}

function TabFinanceiro({ f }: { f: FazendaDetalheData }) {
  const valorTotal = (f.areaTotal * f.valorHa).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <SectionTitle>Área e Valores</SectionTitle>
        <FieldGrid>
          <InfoField label="Moeda" value={f.moeda === 'BRL' ? 'Real Brasileiro (BRL)' : f.moeda} />
          <InfoField label="Área Total" value={`${f.areaTotal.toLocaleString('pt-BR')} ha`} />
          <InfoField
            label="Valor por Hectare"
            value={f.valorHa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          />
          <InfoField
            label="Taxa de Remuneração"
            value={`${f.taxaRemuneracao.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} % a.a.`}
          />
          <InfoField
            label="Valor Total Estimado"
            value={
              <span style={{ fontWeight: 600, color: t.color.brand[600] }}>{valorTotal}</span>
            }
          />
        </FieldGrid>
      </div>

      <div>
        <SectionTitle>Configurações Financeiras</SectionTitle>
        <FieldGrid>
          <InfoField label="Status" value={<BoolField value={f.ativo} trueLabel="Ativo" falseLabel="Inativo" />} />
          <InfoField label="Uso de Livro Caixa" value={<BoolField value={f.usoLivroCaixa} />} />
        </FieldGrid>
      </div>
    </div>
  )
}

function TabCentrosCusto({ f }: { f: FazendaDetalheData }) {
  type CCRow = FazendaDetalheData['centrosCusto'][number]
  const { colors } = useTheme()

  const columns: Column<CCRow>[] = [
    {
      key: 'codigo',
      label: 'Código',
      width: 120,
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontSize: t.font.size.sm, color: colors.textSecondary }}>{row.codigo}</span>
      ),
    },
    {
      key: 'descricao',
      label: 'Descrição',
      render: (row) => <span style={{ fontWeight: 500 }}>{row.descricao}</span>,
    },
    {
      key: 'classe',
      label: 'Classe',
      width: 110,
      render: (row) => row.classe,
    },
    {
      key: 'condicao',
      label: 'Condição',
      width: 110,
      render: (row) => {
        const variant: BadgeVariant =
          row.condicao === 'Receita' ? 'success'
          : row.condicao === 'Despesa' ? 'danger'
          : 'purple'
        return <Badge label={row.condicao} variant={variant} />
      },
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <SectionTitle>Centros de Custo Vinculados</SectionTitle>
        <div style={{ background: colors.surfaceSubtle, borderRadius: 10, overflow: 'hidden' }}>
          <DataTable<CCRow>
            columns={columns}
            data={f.centrosCusto}
            keyField="id"
            emptyMessage="Nenhum centro de custo vinculado."
          />
        </div>
      </div>

      {f.observacao && (
        <div>
          <SectionTitle>Observações</SectionTitle>
          <p
            style={{
              fontSize: t.font.size.base,
              color: colors.textSecondary,
              lineHeight: 1.6,
              fontFamily: t.font.family.sans,
              background: colors.surfaceSubtle,
              borderRadius: 8,
              padding: '12px 14px',
              margin: 0,
              transition: `color ${t.transition.smooth}, background ${t.transition.smooth}`,
            }}
          >
            {f.observacao}
          </p>
        </div>
      )}
    </div>
  )
}

export default function FazendaDetalhe({ onBack, onEdit, fazenda = mockFazendaSantaLuzia }: FazendaDetalheProps) {
  const { colors } = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>('identificacao')

  const stats = [
    {
      label: 'Área Total',
      value: `${fazenda.areaTotal.toLocaleString('pt-BR')} ha`,
      icon: <Ruler size={16} color={t.color.brand[600]} />,
      iconBg: t.color.brand[100],
    },
    {
      label: 'Município',
      value: `${fazenda.cidade} — ${fazenda.uf}`,
      icon: <MapPin size={16} color={t.color.info.text} />,
      iconBg: t.color.info.border,
    },
    {
      label: 'CNPJ',
      value: fazenda.cpfCnpj,
      icon: <Building2 size={16} color={t.color.purple.text} />,
      iconBg: t.color.purple.bg,
    },
    {
      label: 'Valor / ha',
      value: fazenda.valorHa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
      icon: <TrendingUp size={16} color={t.color.warning.text} />,
      iconBg: t.color.warning.bg,
    },
  ]

  const renderTab = () => {
    switch (activeTab) {
      case 'identificacao': return <TabIdentificacao f={fazenda} />
      case 'documentacao':  return <TabDocumentacao f={fazenda} />
      case 'localizacao':   return <TabLocalizacao f={fazenda} />
      case 'financeiro':    return <TabFinanceiro f={fazenda} />
      case 'centrosCusto':  return <TabCentrosCusto f={fazenda} />
    }
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header */}
          <FormPageHeader
            title={fazenda.nome}
            subtitle={`${fazenda.tipoExploracao} · ${fazenda.cidade}, ${fazenda.uf}`}
            onBack={onBack}
            paddingTop={t.space[4]}
            actions={
              <>
                <Badge label={fazenda.ativo ? 'Ativo' : 'Inativo'} variant={fazenda.ativo ? 'success' : 'neutral'} />
                <Button variant="primary" size="sm" icon={<Pencil size={13} />} onClick={onEdit}>
                  Editar
                </Button>
              </>
            }
          />

          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  background: colors.surfaceBg,
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: `background ${t.transition.smooth}`,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: s.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2, transition: `color ${t.transition.smooth}` }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: t.font.size.base, fontWeight: 600, color: colors.textPrimary, transition: `color ${t.transition.smooth}` }}>
                    {s.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs + content */}
          <div
            style={{
              background: colors.surfaceBg,
              borderRadius: 12,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              transition: `background ${t.transition.smooth}`,
            }}
          >
            {/* Tab bar */}
            <div
              style={{
                borderBottom: `1px solid ${colors.border}`,
                padding: '12px 20px',
              }}
            >
              <Tabs
                items={TABS}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as Tab)}
                label="Seções da fazenda"
              />
            </div>

            {/* Tab content */}
            <div style={{ padding: 24 }}>
              {renderTab()}
            </div>
          </div>
        </div>
      </PageCard>
    </PageContainer>
  )
}
