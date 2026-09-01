import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { Button } from './Button'
import type { Column } from './DataTable'
import { FeedbackBanner } from './FeedbackBanner'
import { FormSection } from './FormSection'
import { PageCard } from './PageCard'
import { PageContainer } from './PageContainer'
import { PageHeader } from './PageHeader'
import { ResponsiveDataTable } from './ResponsiveDataTable'
import { t } from '../../design/tokens'

export type ReportExportType = 'PDF' | 'Excel'

interface ReportWorkspaceProps<T extends object> {
  title: string
  description: string
  filters: ReactNode
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  renderCard: (row: T) => ReactNode
  hasPreview: boolean
  loading?: boolean
  error?: string
  onPreview: () => void
  onExport: (type: ReportExportType) => void
  exportTypes?: ReportExportType[]
  summary?: ReactNode
  previewLabel?: string
  emptyMessage?: string
}

/**
 * Casca parametrizável para relatórios: filtros, prévia responsiva e exportação.
 * Mantém o mesmo contrato visual para PDF, Excel e os cartões de telas estreitas.
 */
export function ReportWorkspace<T extends object>({
  title,
  description,
  filters,
  columns,
  data,
  keyField,
  renderCard,
  hasPreview,
  loading,
  error,
  onPreview,
  onExport,
  exportTypes = ['PDF', 'Excel'],
  summary,
  previewLabel = 'Gerar prévia',
  emptyMessage = 'Nenhum item corresponde aos filtros selecionados.',
}: ReportWorkspaceProps<T>) {
  const exportActions = (
    <>
      {exportTypes.includes('PDF') && (
        <Button
          variant="secondary"
          icon={<Icon name="download" size={t.icon.sm} />}
          disabled={!hasPreview || loading}
          onClick={() => onExport('PDF')}
        >
          Gerar PDF
        </Button>
      )}
      {exportTypes.includes('Excel') && (
        <Button
          variant="secondary"
          icon={<Icon name="spreadsheet" size={t.icon.sm} />}
          disabled={!hasPreview || loading}
          onClick={() => onExport('Excel')}
        >
          Gerar Excel
        </Button>
      )}
    </>
  )

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader title={title} description={description} actions={exportActions} />
        <FormSection
          title="Filtros do relatório"
          subtitle="Refine os dados antes de gerar a prévia. Campos dependentes são atualizados automaticamente."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {filters}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: t.space[4] }}>
            <Button icon={<Icon name="search" size={t.icon.sm} />} loading={loading} onClick={onPreview}>
              {previewLabel}
            </Button>
          </div>
        </FormSection>

        {error && (
          <div style={{ marginBottom: t.space[4] }}>
            <FeedbackBanner variant="error" title="Não foi possível gerar o relatório" description={error} />
          </div>
        )}

        {hasPreview && !error && (
          <FormSection title="Prévia" subtitle={`${data.length} registro(s) encontrado(s).`}>
            {summary}
            <ResponsiveDataTable
              columns={columns}
              data={data}
              keyField={keyField}
              renderCard={renderCard}
              loading={loading}
              emptyMessage={emptyMessage}
            />
          </FormSection>
        )}
      </PageCard>
    </PageContainer>
  )
}
