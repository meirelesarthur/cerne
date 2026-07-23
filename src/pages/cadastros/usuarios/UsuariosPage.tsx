import { useMemo, useState } from 'react'
import { Download, Eye, KeyRound, Pencil, Plus, Upload } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { DropdownMenu } from '../../../components/ui/DropdownMenu'
import { FeedbackBanner } from '../../../components/ui/FeedbackBanner'
import { FormField } from '../../../components/ui/FormField'
import { FormSection } from '../../../components/ui/FormSection'
import { ImportDialog } from '../../../components/ui/ImportDialog'
import { ListToolbar } from '../../../components/ui/ListToolbar'
import { Modal } from '../../../components/ui/Modal'
import { MultiSelectField } from '../../../components/ui/MultiSelectField'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Pagination } from '../../../components/ui/Pagination'
import { ResponsiveDataTable } from '../../../components/ui/ResponsiveDataTable'
import { SecretField } from '../../../components/ui/SecretField'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { t } from '../../../design/tokens'

interface UserRecord {
  id: string
  name: string
  nif: string
  email: string
  roles: string[]
  farms: string[]
  bosses: string[]
  online: boolean
}

const ROLE_OPTIONS = [
  { id: 'manager', label: 'Gestor' },
  { id: 'financial', label: 'Financeiro' },
  { id: 'livestock', label: 'Pecuária' },
  { id: 'purchases', label: 'Compras' },
]
const FARM_OPTIONS = [
  { id: 'farm-1', label: 'Fazenda Boa Esperança' },
  { id: 'farm-2', label: 'Fazenda Horizonte' },
  { id: 'farm-3', label: 'Fazenda Santa Clara' },
]
const BOSS_OPTIONS = [
  { id: 'boss-1', label: 'Marina Alves' },
  { id: 'boss-2', label: 'Carlos Nogueira' },
]

const INITIAL_USERS: UserRecord[] = [
  { id: 'user-1', name: 'Marina Alves', nif: '123.456.789-09', email: 'marina@gbcerne.com', roles: ['manager', 'financial'], farms: ['farm-1', 'farm-2'], bosses: [], online: true },
  { id: 'user-2', name: 'Carlos Nogueira', nif: '987.654.321-00', email: 'carlos@gbcerne.com', roles: ['livestock'], farms: ['farm-1'], bosses: ['boss-1'], online: false },
  { id: 'user-3', name: 'Renata Lima', nif: '741.852.963-00', email: 'renata@gbcerne.com', roles: ['purchases'], farms: ['farm-3'], bosses: ['boss-1'], online: true },
]

const emptyDraft = (): UserRecord => ({ id: '', name: '', nif: '', email: '', roles: [], farms: [], bosses: [], online: false })

function labels(ids: string[], options: { id: string; label: string }[]) {
  return ids.map((id) => options.find((option) => option.id === id)?.label ?? id).join(', ')
}

export default function UsuariosPage() {
  const [users, setUsers] = useState(INITIAL_USERS)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editorOpen, setEditorOpen] = useState(false)
  const [showOpen, setShowOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [editing, setEditing] = useState<UserRecord | null>(null)
  const [draft, setDraft] = useState<UserRecord>(emptyDraft)
  const [password, setPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toasts, show, dismiss } = useToast()

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR')
    return users.filter((user) => !query || `${user.name} ${user.email} ${user.nif}`.toLocaleLowerCase('pt-BR').includes(query))
  }, [search, users])
  const pageSize = 10
  const pageUsers = filtered.slice((page - 1) * pageSize, page * pageSize)

  const openCreate = () => { setEditing(null); setDraft(emptyDraft()); setErrors({}); setEditorOpen(true) }
  const openEdit = (user: UserRecord) => { setEditing(user); setDraft({ ...user }); setErrors({}); setEditorOpen(true) }
  const openShow = (user: UserRecord) => { setEditing(user); setShowOpen(true) }
  const openPassword = (user: UserRecord) => { setEditing(user); setPassword(''); setPasswordOpen(true) }

  const saveUser = () => {
    const nextErrors: Record<string, string> = {}
    if (!draft.name.trim()) nextErrors.name = 'Informe o nome do usuário.'
    if (!draft.nif.trim()) nextErrors.nif = 'Informe o CPF do usuário.'
    if (!draft.email.includes('@')) nextErrors.email = 'Informe um e-mail válido.'
    if (draft.roles.length === 0) nextErrors.roles = 'Selecione ao menos um perfil.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    if (editing) setUsers((current) => current.map((user) => user.id === editing.id ? { ...draft, id: editing.id } : user))
    else setUsers((current) => [{ ...draft, id: crypto.randomUUID() }, ...current])
    setEditorOpen(false)
    show(editing ? 'Usuário atualizado com sucesso.' : 'Usuário cadastrado com sucesso.')
  }

  const resetPassword = async () => {
    if (password.length < 8) return
    setSavingPassword(true)
    await new Promise((resolve) => window.setTimeout(resolve, 600))
    setSavingPassword(false)
    setPasswordOpen(false)
    show(`Senha de ${editing?.name ?? 'usuário'} redefinida com sucesso.`)
  }

  const detailItems = (user: UserRecord) => [
    { label: 'Nome', value: user.name },
    { label: 'CPF', value: user.nif },
    { label: 'E-mail', value: user.email, copyValue: user.email },
    { label: 'Status', value: <Badge label={user.online ? 'Online' : 'Offline'} variant={user.online ? 'success' : 'neutral'} /> },
    { label: 'Perfis', value: labels(user.roles, ROLE_OPTIONS) },
    { label: 'Fazendas', value: labels(user.farms, FARM_OPTIONS) || 'Todas' },
  ]

  const columns: Column<UserRecord>[] = [
    { key: 'name', label: 'Usuário', render: (user) => user.name },
    { key: 'email', label: 'E-mail', render: (user) => user.email },
    { key: 'roles', label: 'Perfis', render: (user) => labels(user.roles, ROLE_OPTIONS) },
    { key: 'status', label: 'Status', width: 120, render: (user) => <Badge label={user.online ? 'Online' : 'Offline'} variant={user.online ? 'success' : 'neutral'} /> },
    { key: 'actions', label: 'Ações', width: 72, align: 'right', sortable: false, render: (user) => (
      <DropdownMenu items={[
        { id: 'show', label: 'Ver detalhes', icon: <Eye size={15} />, onClick: () => openShow(user) },
        { id: 'edit', label: 'Editar', icon: <Pencil size={15} />, onClick: () => openEdit(user) },
        { id: 'password', label: 'Redefinir senha…', icon: <KeyRound size={15} />, divider: true, onClick: () => openPassword(user) },
      ]} />
    ) },
  ]

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader
          title="Usuários"
          description="Acesso, papéis e fazendas disponíveis por usuário."
          count={filtered.length}
          actions={(
            <div style={{ display: 'flex', gap: t.space[2], flexWrap: 'wrap' }}>
              <Button variant="ghost" icon={<Upload size={16} />} onClick={() => setImportOpen(true)}>Importar</Button>
              <Button variant="secondary" icon={<Download size={16} />} onClick={() => show('Exportação XLS preparada com sucesso.')}>Exportar</Button>
              <Button icon={<Plus size={16} />} onClick={openCreate}>Novo Usuário</Button>
            </div>
          )}
        />
        <ListToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1) }} searchPlaceholder="Buscar por nome, CPF ou e-mail…" />
        <ResponsiveDataTable
          columns={columns}
          data={pageUsers}
          keyField="id"
          emptyMessage="Nenhum usuário encontrado."
          renderCard={(user) => <DetailGrid items={detailItems(user)} columns={1} />}
        />
        <div style={{ marginTop: t.space[4] }}><Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} /></div>
      </PageCard>

      <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title={editing ? 'Editar Usuário' : 'Novo Usuário'} size="lg" footer={<><Button variant="secondary" onClick={() => setEditorOpen(false)}>Cancelar</Button><Button onClick={saveUser}>Salvar Usuário</Button></>}>
        <FormSection title="Identificação" columns={2}>
          <FormField label="Nome" required value={draft.name} error={errors.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
          <FormField label="CPF" required value={draft.nif} readOnly={Boolean(editing)} mask="cpf" error={errors.nif} onChange={(event) => setDraft((current) => ({ ...current, nif: event.target.value }))} />
          <FormField label="E-mail" type="email" required value={draft.email} error={errors.email} allowPasswordManager onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} />
        </FormSection>
        <FormSection title="Acesso" subtitle="Perfis e escopos concedidos ao usuário.">
          <MultiSelectField label="Perfis" required options={ROLE_OPTIONS} value={draft.roles} error={errors.roles} onChange={(roles) => setDraft((current) => ({ ...current, roles }))} />
          <MultiSelectField label="Fazendas" options={FARM_OPTIONS} value={draft.farms} onChange={(farms) => setDraft((current) => ({ ...current, farms }))} />
          <MultiSelectField label="Encarregados" options={BOSS_OPTIONS} value={draft.bosses} onChange={(bosses) => setDraft((current) => ({ ...current, bosses }))} />
        </FormSection>
      </Modal>

      <Modal open={showOpen} onClose={() => setShowOpen(false)} title="Detalhes do Usuário" size="lg" footer={<Button onClick={() => setShowOpen(false)}>Fechar</Button>}>
        {editing && <DetailGrid items={detailItems(editing)} />}
      </Modal>

      <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} title="Redefinir senha" subtitle={editing ? `Defina uma nova senha para ${editing.name}.` : undefined} size="sm" footer={<><Button variant="secondary" onClick={() => setPasswordOpen(false)}>Cancelar</Button><Button loading={savingPassword} disabled={password.length < 8} onClick={resetPassword}>Redefinir senha</Button></>}>
        <SecretField label="Nova senha" value={password} onChange={setPassword} autoComplete="new-password" error={password.length > 0 && password.length < 8 ? 'A senha deve ter no mínimo 8 caracteres.' : undefined} />
        <FeedbackBanner variant="info" title="A sessão atual será encerrada" description="O usuário precisará entrar novamente usando a nova senha." />
      </Modal>

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Importar usuários"
        accept=".xlsx,.xls"
        onDownloadTemplate={() => show('Modelo de usuários baixado.', 'info')}
        onImport={async () => []}
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
