import { pdf, type DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

/** Renderiza o documento no cliente e inicia um download com URL temporária. */
export async function downloadReportPdf(document: ReactElement<DocumentProps>, filename: string) {
  const blob = await pdf(document).toBlob()
  const url = URL.createObjectURL(blob)
  const anchor = window.document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
