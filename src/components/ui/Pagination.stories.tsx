import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pagination } from './Pagination'

const meta: Meta<typeof Pagination> = {
  title: 'GB CERNE/Pagination',
  component: Pagination,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Pagination>

/** Modo offset (padrão) — usado com `DataTable`/listagens paginadas por número de página. */
export const Offset: Story = {
  render: () => {
    const [page, setPage] = useState(3)
    return (
      <div style={{ width: 640 }}>
        <Pagination mode="offset" page={page} total={247} pageSize={25} onPageChange={setPage} />
      </div>
    )
  },
}

/** Com seletor de linhas por página. */
export const ComSeletorDeLinhas: Story = {
  name: 'Com seletor de linhas por página',
  render: () => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    return (
      <div style={{ width: 640 }}>
        <Pagination
          mode="offset"
          page={page}
          total={86}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          showPageSizeSelector
        />
      </div>
    )
  },
}

/** Muitas páginas — reticências ao redor da página atual. */
export const MuitasPaginas: Story = {
  name: 'Muitas páginas (com reticências)',
  render: () => {
    const [page, setPage] = useState(14)
    return (
      <div style={{ width: 640 }}>
        <Pagination mode="offset" page={page} total={980} pageSize={25} onPageChange={setPage} />
      </div>
    )
  },
}

/** Sem registros. */
export const Vazio: Story = {
  name: 'Sem registros',
  render: () => (
    <div style={{ width: 640 }}>
      <Pagination mode="offset" page={1} total={0} pageSize={25} onPageChange={() => {}} />
    </div>
  ),
}

/** Modo cursor — para paginação por cursor de API (sem número total de registros). */
export const Cursor: Story = {
  render: () => {
    const [hasPrev, setHasPrev] = useState(false)
    return (
      <div style={{ width: 320 }}>
        <Pagination
          mode="cursor"
          hasPrev={hasPrev}
          hasNext
          onPrev={() => setHasPrev(false)}
          onNext={() => setHasPrev(true)}
        />
      </div>
    )
  },
}
