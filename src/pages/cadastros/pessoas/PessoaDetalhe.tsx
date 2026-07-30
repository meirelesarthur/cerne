import { useState, useMemo } from 'react'
import { Pencil } from 'lucide-react'
import { Button }         from '../../../components/ui/Button'
import { PageContainer }  from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { Tabs }           from '../../../components/ui/Tabs'
import { DetailGrid }     from '../../../components/ui/DetailGrid'
import { FormField }      from '../../../components/ui/FormField'
import { Badge }          from '../../../components/ui/Badge'
import { DataTable }      from '../../../components/ui/DataTable'
import type { Column }    from '../../../components/ui/DataTable'
import { EmptyState }     from '../../../components/ui/EmptyState'
import { useTheme }       from '../../../context/ThemeContext'
import { usePermission }  from '../../../auth'
import { t } from '../../../design/tokens'
import {
  ROLES, ROLE_LABEL, activeRoles, isPJ,
  cidadeLabel, fazendaLabel,
  FUNCOES_CBO, CENTROS_CUSTO, BANCOS, TIPO_CONTA, TIPO_PIX, TIPO_FORNECEDOR, PAISES, PERFIS_USUARIO, FAZENDAS, ENCARREGADOS,
  type Pessoa, type RoleKey, type FarmShare, type Branch, type Seller,
} from './pessoas.types'

type TabKey = 'basico' | 'endereco' | RoleKey

const TAB_LABEL: Record<TabKey, string> = {
  basico:      'Dados Básicos',
  endereco:    'Endereço',
  proprietary: ROLE_LABEL.proprietary,
  employee:    ROLE_LABEL.employee,
  provider:    ROLE_LABEL.provider,
  client:      ROLE_LABEL.client,
  user:        ROLE_LABEL.user,
}

/** Abas dinâmicas: fixas (Dados Básicos, Endereço) + uma por papel ativo. */
function computeTabs(p: Pessoa): TabKey[] {
  return ['basico', 'endereco', ...ROLES.filter((r) => p[r.key].enabled).map((r) => r.key)]
}

const labelFrom = (opts: { value: string; label: string }[], value: string) =>
  opts.find((o) => o.value === value)?.label ?? value

const fmtDate = (iso: string | null) => (iso ? iso.split('-').reverse().join('/') : '')

/** Rótulo de sub-seção dentro de uma aba (ex.: "Dados Bancários"). */
function SectionLabel({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme()
  return (
    <span
      style={{
        fontSize: t.font.size.xs,
        fontWeight: t.font.weight.bold,
        color: colors.fg.subtle,
        fontFamily: t.font.family.sans,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      {children}
    </span>
  )
}

/** Lista de ids resolvida em rótulos (perfis, fazendas, encarregados…), ou mensagem vazia. */
function JoinedListField({ label, ids, options, emptyText }: {
  label: string
  ids: string[]
  options: { value: string; label: string }[]
  emptyText: string
}) {
  return (
    <FormField
      variant="view"
      label={label}
      value={ids.length === 0 ? emptyText : ids.map((id) => labelFrom(options, id)).join(', ')}
    />
  )
}

/** Bloco de dados bancários — reutilizado por Funcionário e Fornecedor. */
function BankFieldsView({ bankId, accountType, agency, account, pixType, pix }: {
  bankId: string
  accountType: string
  agency: string
  account: string
  pixType: string
  pix: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
      <SectionLabel>Dados Bancários</SectionLabel>
      <DetailGrid columns={2} items={[
        { label: 'Banco', value: labelFrom(BANCOS, bankId) },
        { label: 'Tipo de Conta', value: labelFrom(TIPO_CONTA, accountType) },
        { label: 'Agência', value: agency },
        { label: 'Conta', value: account },
        { label: 'Tipo de Chave PIX', value: labelFrom(TIPO_PIX, pixType) },
        { label: 'Chave PIX', value: pix },
      ]} />
    </div>
  )
}

function TabDadosBasicosView({ form }: { form: Pessoa }) {
  const { colors } = useTheme()
  const pj = isPJ(form.nif)
  const nameLabel     = pj ? 'Nome Fantasia' : 'Nome Completo'
  const nicknameLabel = pj ? 'Razão Social' : 'Apelido'
  const roles = activeRoles(form)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <DetailGrid columns={2} items={[
        { label: 'CPF / CNPJ', value: form.nif },
        { label: 'Telefone', value: form.phone },
        { label: 'E-mail', value: form.email },
        { label: nameLabel, value: form.name },
        { label: nicknameLabel, value: form.nickname },
      ]} />

      <div>
        <SectionLabel>Papéis Ativos</SectionLabel>
        <div style={{ marginTop: t.space[2] }}>
          {roles.length === 0 ? (
            <span style={{ fontSize: t.font.size.sm, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
              Nenhum papel ativo.
            </span>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space[2] }}>
              {roles.map((r) => <Badge key={r.key} label={r.label} variant={r.variant} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TabEnderecoView({ form }: { form: Pessoa }) {
  return (
    <DetailGrid columns={2} items={[
      { label: 'CEP', value: form.zipCode },
      { label: 'Cidade', value: cidadeLabel(form.cityId) },
      { label: 'Endereço', value: form.address },
      { label: 'Número', value: form.number },
      { label: 'Bairro', value: form.district },
    ]} />
  )
}

function TabProprietarioView({ form }: { form: Pessoa }) {
  const { colors } = useTheme()
  const { inscricoes, farms } = form.proprietary

  type Row = FarmShare & { _key: number }
  const rows: Row[] = farms.map((f, i) => ({ ...f, _key: i }))
  const columns: Column<Row>[] = [
    { key: 'farm', label: 'Fazenda', render: (row) => fazendaLabel(row.farmId) },
    { key: 'pct', label: 'Participação', width: 140, render: (row) => `${row.percentage}%` },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <FormField
        variant="view"
        label="Inscrições Estaduais"
        value={inscricoes.length === 0 ? 'Nenhuma inscrição estadual cadastrada.' : inscricoes.join(', ')}
      />

      <div>
        <SectionLabel>Fazendas e Participação</SectionLabel>
        <div style={{ marginTop: t.space[2] }}>
          {farms.length === 0 ? (
            <EmptyState message="Nenhuma fazenda vinculada." />
          ) : (
            <div style={{ background: colors.bg.subtle, borderRadius: t.radius.lg, overflow: 'hidden' }}>
              <DataTable<Row> columns={columns} data={rows} keyField="_key" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TabFuncionarioView({ form }: { form: Pessoa }) {
  const { colors } = useTheme()
  const { can } = usePermission()
  const canViewSalary = can('pessoa.salary_view')
  const e = form.employee

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <DetailGrid columns={2} items={[
        { label: 'Cargo', value: e.office },
        { label: 'Função', value: labelFrom(FUNCOES_CBO, e.functionId) },
        { label: 'Centro de Custo', value: labelFrom(CENTROS_CUSTO, e.centerId) },
        { label: 'Valor por Hora', value: e.hourValue },
        { label: 'Data de Nascimento', value: fmtDate(e.birthday) },
      ]} />

      {canViewSalary ? (
        <DetailGrid columns={2} items={[
          { label: 'Salário Base', value: e.baseSalary },
          { label: 'Salário Meta', value: e.goalSalary },
        ]} />
      ) : (
        <div style={{ fontSize: t.font.size.sm, color: colors.fg.subtle, fontFamily: t.font.family.sans, padding: `${t.space[2]}px ${t.space[3]}px`, background: colors.bg.subtle, borderRadius: t.radius.base }}>
          Dados salariais ocultos — requer permissão <code>pessoa.salary_view</code>.
        </div>
      )}

      <BankFieldsView
        bankId={e.bankId} accountType={e.accountType} agency={e.agency} account={e.account}
        pixType={e.pixType} pix={e.pix}
      />
    </div>
  )
}

function TabFornecedorView({ form }: { form: Pessoa }) {
  const { colors } = useTheme()
  const p = form.provider

  type BranchRow = Branch & { _key: number }
  const branchRows: BranchRow[] = p.branches.map((b, i) => ({ ...b, _key: i }))
  const branchColumns: Column<BranchRow>[] = [
    { key: 'nif', label: 'CNPJ da Filial', render: (row) => row.nif },
    { key: 'ie', label: 'Inscrição Estadual', render: (row) => row.stateRegistration },
    { key: 'cep', label: 'CEP', render: (row) => row.zipCode },
    { key: 'cidade', label: 'Cidade', render: (row) => cidadeLabel(row.cityId) },
    { key: 'endereco', label: 'Endereço', render: (row) => row.address },
  ]

  type SellerRow = Seller & { _key: number }
  const sellerRows: SellerRow[] = p.sellers.map((s, i) => ({ ...s, _key: i }))
  const sellerColumns: Column<SellerRow>[] = [
    { key: 'name', label: 'Nome', render: (row) => row.name },
    { key: 'email', label: 'E-mail', render: (row) => row.email },
    { key: 'phone', label: 'Telefone', render: (row) => row.phone },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <DetailGrid columns={3} items={[
        { label: 'Tipo de Fornecedor', value: labelFrom(TIPO_FORNECEDOR, p.type) },
        ...(p.type === '5' ? [{ label: 'Comissão', value: `${p.commission}%` }] : []),
        ...(p.type === '3' ? [{ label: 'Valor por Hora', value: p.hourValue }] : []),
        { label: 'Inscrição Estadual', value: p.stateRegistration },
        { label: 'Inscrição Municipal', value: p.cityRegistration },
        { label: 'Contato', value: p.contact },
        { label: 'Telefone do Contato', value: p.contactPhone },
      ]} />

      <BankFieldsView
        bankId={p.bankId} accountType={p.accountType} agency={p.agency} account={p.account}
        pixType={p.pixType} pix={p.pix}
      />

      <div>
        <SectionLabel>Filiais</SectionLabel>
        <div style={{ marginTop: t.space[2] }}>
          {p.branches.length === 0 ? (
            <EmptyState message="Nenhuma filial cadastrada." />
          ) : (
            <div style={{ background: colors.bg.subtle, borderRadius: t.radius.lg, overflow: 'hidden' }}>
              <DataTable<BranchRow> columns={branchColumns} data={branchRows} keyField="_key" />
            </div>
          )}
        </div>
      </div>

      <div>
        <SectionLabel>Vendedores</SectionLabel>
        <div style={{ marginTop: t.space[2] }}>
          {p.sellers.length === 0 ? (
            <EmptyState message="Nenhum vendedor cadastrado." />
          ) : (
            <div style={{ background: colors.bg.subtle, borderRadius: t.radius.lg, overflow: 'hidden' }}>
              <DataTable<SellerRow> columns={sellerColumns} data={sellerRows} keyField="_key" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TabClienteView({ form }: { form: Pessoa }) {
  const c = form.client

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <DetailGrid columns={3} items={[
        { label: 'Celular', value: c.cellphone },
        { label: 'Contato', value: c.contact },
        { label: 'Telefone do Contato', value: c.contactPhone },
        { label: 'Inscrição Municipal', value: c.cityRegistration },
        { label: 'Nome da Fazenda', value: c.farmName },
        {
          label: 'Consumidor Final',
          value: <Badge label={c.finalConsumer ? 'Sim' : 'Não'} variant={c.finalConsumer ? 'success' : 'neutral'} />,
        },
        {
          label: 'Contribuinte',
          value: <Badge label={c.taxpayer ? 'Sim' : 'Não'} variant={c.taxpayer ? 'success' : 'neutral'} />,
        },
        { label: 'País', value: labelFrom(PAISES, c.countryId) },
        ...(c.countryId !== 'BR' ? [{ label: 'ID no Exterior', value: c.idAbroad }] : []),
      ]} />

      <FormField
        variant="view"
        label="Inscrições Estaduais"
        value={c.stateRegistrations.length === 0 ? 'Nenhuma inscrição estadual cadastrada.' : c.stateRegistrations.join(', ')}
      />
    </div>
  )
}

function TabUsuarioView({ form }: { form: Pessoa }) {
  const u = form.user

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <DetailGrid columns={1} items={[
        {
          label: 'Conferente de Compras',
          value: <Badge label={u.purchasingAssistant ? 'Sim' : 'Não'} variant={u.purchasingAssistant ? 'success' : 'neutral'} />,
        },
      ]} />

      <JoinedListField label="Perfis" ids={u.roleIds} options={PERFIS_USUARIO} emptyText="Nenhum perfil selecionado." />
      <JoinedListField label="Fazendas" ids={u.farmIds} options={FAZENDAS} emptyText="Nenhuma fazenda selecionada." />
      <JoinedListField label="Encarregados" ids={u.bossIds} options={ENCARREGADOS} emptyText="Nenhum encarregado selecionado." />
    </div>
  )
}

interface Props {
  pessoa: Pessoa
  onBack: () => void
  onEdit: () => void
}

export default function PessoaDetalhe({ pessoa, onBack, onEdit }: Props) {
  const tabs = useMemo(() => computeTabs(pessoa), [pessoa])
  const [activeTab, setActiveTab] = useState<TabKey>('basico')

  const renderTab = () => {
    switch (activeTab) {
      case 'basico':      return <TabDadosBasicosView form={pessoa} />
      case 'endereco':    return <TabEnderecoView form={pessoa} />
      case 'proprietary': return <TabProprietarioView form={pessoa} />
      case 'employee':    return <TabFuncionarioView form={pessoa} />
      case 'provider':    return <TabFornecedorView form={pessoa} />
      case 'client':      return <TabClienteView form={pessoa} />
      case 'user':        return <TabUsuarioView form={pessoa} />
      default:            return null
    }
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={onBack}>Voltar</Button>
            <Button variant="primary" icon={<Pencil size={14} />} onClick={onEdit}>Editar</Button>
          </>
        }
      >
        <FormPageHeader
          title="Visualizar Pessoa"
          subtitle={`${pessoa.name} — ${pessoa.nickname}`}
          onBack={onBack}
          paddingTop={t.space[4]}
        />

        <Tabs
          items={tabs.map((k) => ({ id: k, label: TAB_LABEL[k] }))}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as TabKey)}
          label="Seções da pessoa"
          variant="outline"
        />

        <div style={{ padding: '32px 24px 64px' }}>
          {renderTab()}
        </div>
      </PageCard>
    </PageContainer>
  )
}
