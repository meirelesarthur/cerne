import { useMemo, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { type Column } from '../../../components/ui/DataTable'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { DropdownMenu } from '../../../components/ui/DropdownMenu'
import { FeedbackBanner } from '../../../components/ui/FeedbackBanner'
import { ImportDialog } from '../../../components/ui/ImportDialog'
import { ListToolbar } from '../../../components/ui/ListToolbar'
import { Modal } from '../../../components/ui/Modal'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Pagination } from '../../../components/ui/Pagination'
import { ResponsiveDataTable } from '../../../components/ui/ResponsiveDataTable'
import { SecretField } from '../../../components/ui/SecretField'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import { t } from '../../../design/tokens'
import { ROLE_OPTIONS, detailItems, labels, type UserRecord } from './usuarios.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface UsuariosListaProps {
  users:  UserRecord[]
  onNew:  () => void
  onView: (id: string) => void
  onEdit: (id: string) => void
}

// ─── Paginação ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

// ─── Componente principal ─────────────────────────────────────────────────────

export default function UsuariosLista({ users, onNew, onView, onEdit }: UsuariosListaProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [importOpen, setImportOpen] = useState(false)
  const [passwordUser, setPasswordUser] = useState<UserRecord | null>(null)
  const [password, setPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const { toasts, show, dismiss } = useToast()

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR')
    return users.filter((user) => !query || `${user.name} ${user.email} ${user.nif}`.toLocaleLowerCase('pt-BR').includes(query))
  }, [search, users])
  const pageUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openPassword = (user: UserRecord) => { setPasswordUser(user); setPassword('') }

  const resetPassword = async () => {
    if (password.length < 8) return
    setSavingPassword(true)
    await new Promise((resolve) => window.setTimeout(resolve, 600))
    setSavingPassword(false)
    show(`Senha de ${passwordUser?.name ?? 'usuário'} redefinida com sucesso.`)
    setPasswordUser(null)
  }

  const columns: Column<UserRecord>[] = [
    { key: 'name', label: 'Usuário', render: (user) => user.name },
    { key: 'email', label: 'E-mail', render: (user) => user.email },
    { key: 'roles', label: 'Perfis', render: (user) => labels(user.roles, ROLE_OPTIONS) },
    { key: 'status', label: 'Status', width: 120, render: (user) => <Badge label={user.online ? 'Online' : 'Offline'} variant={user.online ? 'success' : 'neutral'} /> },
    { key: 'actions', label: 'Ações', width: 72, align: 'right', sortable: false, render: (user) => (
      <DropdownMenu items={[
        { id: 'show', label: 'Ver detalhes', icon: <Icon name="view" size={15} />, onClick: () => onView(user.id) },
        { id: 'edit', label: 'Editar', icon: <Icon name="edit" size={15} />, onClick: () => onEdit(user.id) },
        { id: 'password', label: 'Redefinir senha…', icon: <Icon name="key" size={15} />, divider: true, onClick: () => openPassword(user) },
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
              <Button variant="ghost" icon={<Icon name="upload" size={16} />} onClick={() => setImportOpen(true)}>Importar</Button>
              <Button variant="secondary" icon={<Icon name="download" size={16} />} onClick={() => show('Exportação XLS preparada com sucesso.')}>Exportar</Button>
              <Button icon={<Icon name="add" size={16} />} onClick={onNew}>Novo Usuário</Button>
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
          pagination={<Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />}
        />
      </PageCard>

      <Modal
        open={passwordUser !== null}
        onClose={() => setPasswordUser(null)}
        title="Redefinir senha"
        subtitle={passwordUser ? `Defina uma nova senha para ${passwordUser.name}.` : undefined}
        size="sm"
        footer={<><Button variant="secondary" onClick={() => setPasswordUser(null)}>Cancelar</Button><Button loading={savingPassword} disabled={password.length < 8} onClick={resetPassword}>Redefinir senha</Button></>}
      >
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
