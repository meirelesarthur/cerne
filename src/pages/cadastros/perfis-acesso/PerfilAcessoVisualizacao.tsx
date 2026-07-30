import { ArrowLeft, Pencil } from 'lucide-react'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard } from '../../../components/ui/PageCard'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { FormSection } from '../../../components/ui/FormSection'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { PermissionMatrixField } from '../../../components/ui/PermissionMatrixField'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { PERMISSION_CATALOG } from '../../../data/permissionsCatalog'
import { t } from '../../../design/tokens'
import type { PerfilAcesso } from './perfisAcesso.types'

interface PerfilAcessoVisualizacaoProps {
  perfil: PerfilAcesso
  onBack: () => void
  onEdit: () => void
}

export default function PerfilAcessoVisualizacao({ perfil, onBack, onEdit }: PerfilAcessoVisualizacaoProps) {
  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={
          <>
            <Button variant="secondary" onClick={onBack} icon={<ArrowLeft size={14} />}>
              Voltar
            </Button>
            <Button variant="primary" onClick={onEdit} icon={<Pencil size={14} />}>
              Editar
            </Button>
          </>
        }
      >
        <FormPageHeader
          title={`Perfil — ${perfil.nome}`}
          subtitle="Consulte os dados e as permissões deste perfil"
          onBack={onBack}
          paddingTop={t.space[4]}
          actions={
            <Badge
              label={perfil.visivelAoUsuario ? 'Visível ao usuário' : 'Oculto ao usuário'}
              variant={perfil.visivelAoUsuario ? 'success' : 'neutral'}
            />
          }
        />

        <FormSection title="Dados do perfil" divider={false}>
          <DetailGrid
            columns={2}
            responsive
            items={[
              { label: 'Nome', value: perfil.nome },
              { label: 'Descrição', value: perfil.descricao ?? 'Sem descrição' },
            ]}
          />
        </FormSection>

        <FormSection
          title="Permissões"
          subtitle="Documentos permite exportar listagens, relatórios e outros arquivos. Na consulta, o quadrado verde com V branco indica acesso completo; o quadrado verde com traço indica acesso parcial; o traço simples indica acesso não concedido."
          divider={false}
        >
          <PermissionMatrixField mode="view" tree={PERMISSION_CATALOG} selected={perfil.permissoes} />
        </FormSection>
      </PageCard>
    </PageContainer>
  )
}
