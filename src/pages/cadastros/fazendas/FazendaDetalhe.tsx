import { useState } from 'react'
import {
  Pencil,
  MapPin,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import type { BadgeVariant } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { FormField } from '../../../components/ui/FormField'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { MapView } from '../../../components/ui/MapView'
import { EmptyState } from '../../../components/ui/EmptyState'
import { DataTable } from '../../../components/ui/DataTable'
import type { Column } from '../../../components/ui/DataTable'
import type { FazendaDetalheData } from './fazendas.types'
import { useTheme } from '../../../context/ThemeContext'
import { Tabs } from '../../../components/ui/Tabs'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { t }             from '../../../design/tokens'

interface FazendaDetalheProps {
  onBack: () => void
  onEdit: () => void
  fazenda: FazendaDetalheData
}

type Tab = 'documentacao' | 'localizacao' | 'financeiro' | 'centrosCusto'

const TABS: { id: Tab; label: string }[] = [
  { id: 'documentacao',  label: 'Documentação' },
  { id: 'localizacao',   label: 'Localização' },
  { id: 'financeiro',    label: 'Financeiro' },
  { id: 'centrosCusto',  label: 'Centros de Custo' },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme()
  return (
    <div
      style={{
        fontSize: t.font.size.xs,
        fontWeight: 600,
        color: colors.fg.subtle,
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        marginBottom: 16,
        fontFamily: t.font.family.sans,
        paddingBottom: 10,
        borderBottom: `1px solid ${colors.border.subtle}`,
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
        ? <CheckCircle2 size={14} color={colors.accent.default} />
        : <XCircle size={14} color={colors.fg.subtle} />
      }
      <span style={{ fontSize: t.font.size.base, color: value ? colors.accent.default : colors.fg.subtle, fontFamily: t.font.family.sans }}>
        {value ? trueLabel : falseLabel}
      </span>
    </div>
  )
}

function IdentificacaoHeader({ f }: { f: FazendaDetalheData }) {
  return (
    <DetailGrid columns={2} items={[
      { label: 'Razão Social / Nome', value: f.nome },
      { label: 'CPF / CNPJ', value: f.cpfCnpj },
      { label: 'Inscrição Estadual', value: f.inscricaoEstadual },
      { label: 'Telefone', value: f.telefone },
    ]} />
  )
}

function TabDocumentacao({ f }: { f: FazendaDetalheData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <DetailGrid columns={2} items={[
        { label: 'Tipo de Exploração', value: f.tipoExploracao },
      ]} />

      <div>
        <SectionTitle>Registros Ambientais e Fundiários</SectionTitle>
        <DetailGrid columns={2} items={[
          { label: 'CAR — Cadastro Ambiental Rural', value: f.car },
          { label: 'NIRF — Imóvel Rural', value: f.nirf },
          { label: 'CCIR — Certificado de Cadastro', value: f.ccir },
          { label: 'CAFIR — Imóvel Rural', value: f.cafir },
          { label: 'CAE-PI — Produtor Integrado', value: f.caepi },
        ]} />
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
        <DetailGrid columns={2} items={[
          { label: 'País', value: f.pais },
          { label: 'CEP', value: f.cep },
          { label: 'Cidade', value: f.cidade },
          { label: 'UF', value: f.uf },
          { label: 'Endereço', value: f.endereco },
          { label: 'Número / Referência', value: f.numero },
          { label: 'Bairro / Distrito', value: f.bairro },
        ]} />
      </div>

      <div>
        <SectionTitle>Geolocalização</SectionTitle>
        <DetailGrid columns={2} items={[
          { label: 'Latitude', value: f.latitude },
          { label: 'Longitude', value: f.longitude },
          {
            label: 'Mapa',
            value: (
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
            ),
          },
        ]} />
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
        <DetailGrid columns={2} items={[
          { label: 'Moeda', value: f.moeda === 'BRL' ? 'Real Brasileiro (BRL)' : f.moeda },
          { label: 'Área Total', value: `${f.areaTotal.toLocaleString('pt-BR')} ha` },
          {
            label: 'Valor por Hectare',
            value: f.valorHa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          },
          {
            label: 'Taxa de Remuneração',
            value: `${f.taxaRemuneracao.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} % a.a.`,
          },
          {
            label: 'Valor Total Estimado',
            value: <span style={{ fontWeight: 600, color: t.color.brand[600] }}>{valorTotal}</span>,
          },
        ]} />
      </div>

      <div>
        <SectionTitle>Configurações Financeiras</SectionTitle>
        <DetailGrid columns={2} items={[
          { label: 'Status', value: <BoolField value={f.ativo} trueLabel="Ativo" falseLabel="Inativo" /> },
          { label: 'Uso de Livro Caixa', value: <BoolField value={f.usoLivroCaixa} /> },
        ]} />
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
        <span style={{ fontFamily: 'monospace', fontSize: t.font.size.sm, color: colors.fg.muted }}>{row.codigo}</span>
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
        <div style={{ background: colors.bg.subtle, borderRadius: t.radius.lg, overflow: 'hidden' }}>
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
          <FormField variant="view" label="Observações" value={f.observacao} multiline />
        </div>
      )}
    </div>
  )
}

export default function FazendaDetalhe({ onBack, onEdit, fazenda }: FazendaDetalheProps) {
  const { colors } = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>('documentacao')

  const renderTab = () => {
    switch (activeTab) {
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
            title="Visualizar Fazenda"
            subtitle={fazenda.nome}
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

          {/* Dados de identificação como cabeçalho fixo */}
          <IdentificacaoHeader f={fazenda} />

          {/* Tabs + content */}
          <div
            style={{
              background: colors.bg.surface,
              borderRadius: t.radius.xl,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              transition: `background ${t.transition.smooth}`,
            }}
          >
            {/* Tab bar */}
            <div style={{ padding: `${t.space[3]}px ${t.space[5]}px 0` }}>
              <Tabs
                items={TABS}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as Tab)}
                label="Seções da fazenda"
                variant="outline"
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
