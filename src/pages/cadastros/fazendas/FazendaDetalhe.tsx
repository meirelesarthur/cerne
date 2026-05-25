import { useState } from 'react'
import {
  ArrowLeft,
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
import { DataTable } from '../../../components/ui/DataTable'
import type { Column } from '../../../components/ui/DataTable'
import { mockFazendaSantaLuzia } from './fazendas.mock'
import type { FazendaDetalheData } from './fazendas.types'
import { useTheme } from '../../../context/ThemeContext'

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
          fontSize: 10,
          fontWeight: 600,
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 4,
          fontFamily: "'Outfit', sans-serif",
          transition: 'color 0.2s',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: colors.textPrimary,
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 400,
          minHeight: 20,
          transition: 'color 0.2s',
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
        fontSize: 11,
        fontWeight: 600,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        marginBottom: 16,
        fontFamily: "'Outfit', sans-serif",
        paddingBottom: 10,
        borderBottom: `1px solid ${colors.borderSubtle}`,
        transition: 'color 0.2s, border-color 0.2s',
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
      <span style={{ fontSize: 13, color: value ? colors.brand : colors.textMuted, fontFamily: "'Outfit', sans-serif" }}>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
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
                  color: '#059669',
                  fontSize: 12,
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontFamily: "'Outfit', sans-serif",
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
              <span style={{ fontWeight: 600, color: '#059669' }}>{valorTotal}</span>
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
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#374151' }}>{row.codigo}</span>
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
        const color =
          row.condicao === 'Receita' ? '#059669'
          : row.condicao === 'Despesa' ? '#dc2626'
          : '#6366f1'
        const bg =
          row.condicao === 'Receita' ? '#d1fae5'
          : row.condicao === 'Despesa' ? '#fee2e2'
          : '#ede9fe'
        return (
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color,
              background: bg,
              padding: '2px 8px',
              borderRadius: 9999,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {row.condicao}
          </span>
        )
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
              fontSize: 13,
              color: colors.textSecondary,
              lineHeight: 1.6,
              fontFamily: "'Outfit', sans-serif",
              background: colors.surfaceSubtle,
              borderRadius: 8,
              padding: '12px 14px',
              margin: 0,
              transition: 'color 0.2s, background 0.2s',
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
      icon: <Ruler size={16} color="#059669" />,
      iconBg: '#d1fae5',
    },
    {
      label: 'Município',
      value: `${fazenda.cidade} — ${fazenda.uf}`,
      icon: <MapPin size={16} color="#2563eb" />,
      iconBg: '#dbeafe',
    },
    {
      label: 'CNPJ',
      value: fazenda.cpfCnpj,
      icon: <Building2 size={16} color="#7c3aed" />,
      iconBg: '#ede9fe',
    },
    {
      label: 'Valor / ha',
      value: fazenda.valorHa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
      icon: <TrendingUp size={16} color="#ea580c" />,
      iconBg: '#ffedd5',
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
    <div
      style={{
        padding: '24px 28px',
        fontFamily: "'Outfit', sans-serif",
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: colors.textMuted,
                padding: 0,
                flexShrink: 0,
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = colors.textPrimary }}
              onMouseLeave={(e) => { e.currentTarget.style.color = colors.textMuted }}
              title="Voltar para Fazendas"
              aria-label="Voltar para fazendas"
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </button>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: colors.textPrimary,
                letterSpacing: '-0.4px',
                margin: 0,
                fontFamily: "'Outfit', sans-serif",
                transition: 'color 0.2s',
              }}
            >
              {fazenda.nome}
            </h1>
            <Badge label={fazenda.ativo ? 'Ativo' : 'Inativo'} variant={fazenda.ativo ? 'success' : 'neutral'} />
          </div>
          <p style={{ fontSize: 12, color: colors.textSecondary, margin: 0, paddingLeft: 30, transition: 'color 0.2s' }}>
            {fazenda.tipoExploracao} · {fazenda.cidade}, {fazenda.uf}
          </p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: colors.brand,
            border: 'none',
            borderRadius: 8,
            padding: '0 16px',
            height: 36,
            fontSize: 13,
            fontWeight: 600,
            color: 'white',
            cursor: 'pointer',
            fontFamily: "'Outfit', sans-serif",
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = colors.brandHover }}
          onMouseLeave={(e) => { e.currentTarget.style.background = colors.brand }}
        >
          <Pencil size={13} />
          Editar
        </button>
      </div>

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
              transition: 'background 0.2s',
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
              <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2, transition: 'color 0.2s' }}>
                {s.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, transition: 'color 0.2s' }}>
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
          transition: 'background 0.2s',
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: `1px solid ${colors.border}`,
            padding: '0 20px',
            gap: 4,
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  height: 44,
                  padding: '0 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${colors.brand}` : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? colors.brand : colors.textSecondary,
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'color 0.12s, border-color 0.12s',
                  whiteSpace: 'nowrap',
                  marginBottom: -1,
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div style={{ padding: 24 }}>
          {renderTab()}
        </div>
      </div>
    </div>
  )
}
