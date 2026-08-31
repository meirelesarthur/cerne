import { Icon } from '../../../components/ui/Icon'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { DropdownMenu } from '../../../components/ui/DropdownMenu'
import { PageCard } from '../../../components/ui/PageCard'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageHeader } from '../../../components/ui/PageHeader'
import { ToastContainer, useToast } from '../../../components/ui/Toast'
import type { IntegrationRecord } from './IntegracaoDominioPage'

interface IntegracaoDominioListaProps {
  records: IntegrationRecord[]
  onNew: () => void
  onView: (id: string) => void
  onEdit: (id: string) => void
}

export default function IntegracaoDominioLista({
  records, onNew, onView, onEdit,
}: IntegracaoDominioListaProps) {
  const { toasts, show, dismiss } = useToast()

  const columns: Column<IntegrationRecord>[] = [
    { key: 'issuer', label: 'Emissor', render: (record) => record.issuer.label },
    { key: 'accountant', label: 'Contador', render: (record) => record.accountant.label },
    { key: 'status', label: 'Conexão', width: 130, render: (record) => <Badge label={record.status === 'connected' ? 'Conectada' : 'Atenção'} variant={record.status === 'connected' ? 'success' : 'warning'} /> },
    { key: 'sync', label: 'Última sincronização', width: 180, render: (record) => record.lastSync },
    { key: 'active', label: 'Situação', width: 110, render: (record) => <Badge label={record.enabled ? 'Ativa' : 'Inativa'} variant={record.enabled ? 'info' : 'neutral'} /> },
    { key: 'actions', label: 'Ações', width: 72, align: 'right', sortable: false, render: (record) => <DropdownMenu items={[
      { id: 'show', label: 'Ver detalhes', icon: <Icon name="view" size={15} />, onClick: () => onView(record.id) },
      { id: 'edit', label: 'Editar', icon: <Icon name="edit" size={15} />, onClick: () => onEdit(record.id) },
      { id: 'sync', label: 'Sincronizar agora', icon: <Icon name="refresh" size={15} />, divider: true, onClick: () => show('Sincronização enviada para processamento.', 'info') },
    ]} /> },
  ]

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader
          title="Integração Domínio"
          description="Conecte emissores e contadores para a exportação contábil."
          count={records.length}
          actions={<Button icon={<Icon name="add" size={16} />} onClick={onNew}>Nova Integração</Button>}
        />
        <DataTable columns={columns} data={records} keyField="id" emptyMessage="Nenhuma integração configurada." />
      </PageCard>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
