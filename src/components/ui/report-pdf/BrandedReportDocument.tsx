import React from 'react'
import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { t } from '../../../design/tokens'
import { PdfBrandLogo } from './PdfBrandLogo'

Font.register({
  family: 'Outfit',
  fonts: [
    { src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/outfit/Outfit%5Bwght%5D.ttf', fontWeight: 400 },
    { src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/outfit/Outfit%5Bwght%5D.ttf', fontWeight: 600 },
  ],
})

export interface PdfReportMeta {
  label: string
  value: string
}

export interface PdfReportHighlight {
  label: string
  value: string
  helper?: string
}

export interface PdfTableColumn<T> {
  key: string
  label: string
  width: number
  align?: 'left' | 'right' | 'center'
  render: (row: T) => string
}

interface BrandedReportDocumentProps<T> {
  title: string
  description: string
  emittedAt: string
  metadata: PdfReportMeta[]
  highlights: PdfReportHighlight[]
  columns: PdfTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  getRowDetail?: (row: T) => string | undefined
  firstPageRows?: number
  rowsPerPage?: number
  emptyMessage?: string
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: t.color.neutral[0],
    color: t.color.neutral[900],
    fontFamily: 'Outfit',
    fontSize: 8.5,
    paddingTop: 28,
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  brandLine: { height: 4, backgroundColor: t.color.brand[600], position: 'absolute', top: 0, left: 0, right: 0 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  heading: { flex: 1, paddingLeft: 22 },
  eyebrow: { color: t.color.brand[700], fontSize: 7, fontWeight: 600, letterSpacing: 1.3, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: 600, lineHeight: 1.2, marginBottom: 4 },
  description: { color: t.color.neutral[600], fontSize: 8.75, lineHeight: 1.4 },
  emitted: { color: t.color.neutral[500], fontSize: 7.25, textAlign: 'right', width: 120, lineHeight: 1.35 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  metaItem: { flexDirection: 'row', backgroundColor: t.color.neutral[100], borderRadius: 4, paddingVertical: 4, paddingHorizontal: 7 },
  metaLabel: { color: t.color.neutral[500], fontSize: 7.25, marginRight: 3 },
  metaValue: { color: t.color.neutral[800], fontSize: 7.25 },
  highlights: { flexDirection: 'row', gap: 7, marginBottom: 13 },
  highlight: { flex: 1, borderWidth: 1, borderColor: t.color.neutral[200], borderRadius: 6, paddingVertical: 7, paddingHorizontal: 8 },
  highlightLabel: { color: t.color.neutral[500], fontSize: 6.75, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.45 },
  highlightValue: { color: t.color.neutral[900], fontSize: 12, fontWeight: 600, lineHeight: 1.15 },
  highlightHelper: { color: t.color.neutral[500], fontSize: 6.75, marginTop: 2, lineHeight: 1.3 },
  table: { borderWidth: 1, borderColor: t.color.neutral[200], borderRadius: 6, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: t.color.brand[800], minHeight: 28, alignItems: 'center' },
  tableHeaderCell: { color: t.color.neutral[0], fontSize: 7, paddingLeft: 6, paddingRight: 2, paddingVertical: 6 },
  tableRow: { borderTopWidth: 1, borderTopColor: t.color.neutral[200] },
  tableRowMain: { flexDirection: 'row', minHeight: 31, alignItems: 'center' },
  tableRowAlt: { backgroundColor: t.color.neutral[50] },
  tableCell: { color: t.color.neutral[800], fontSize: 7.25, lineHeight: 1.35, paddingHorizontal: 4, paddingVertical: 6 },
  detail: { color: t.color.neutral[600], fontSize: 6.75, lineHeight: 1.35, paddingHorizontal: 4, paddingBottom: 6 },
  detailLabel: { color: t.color.brand[700], fontWeight: 600 },
  empty: { padding: 24, textAlign: 'center', color: t.color.neutral[500] },
  continuation: { color: t.color.neutral[500], fontSize: 7.25, marginBottom: 7 },
  footer: { position: 'absolute', bottom: 12, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', color: t.color.neutral[500], fontSize: 6.75 },
  pageNumber: { color: t.color.neutral[700], fontWeight: 600 },
})

function chunks<T>(rows: T[], firstSize: number, size: number) {
  if (rows.length === 0) return [[]]
  const firstPage = rows.slice(0, firstSize)
  const remaining = rows.slice(firstSize)
  return [firstPage, ...Array.from(
    { length: Math.ceil(remaining.length / size) },
    (_, index) => remaining.slice(index * size, (index + 1) * size),
  )]
}

export function BrandedReportDocument<T>({
  title,
  description,
  emittedAt,
  metadata,
  highlights,
  columns,
  rows,
  getRowKey,
  getRowDetail,
  firstPageRows,
  rowsPerPage = 14,
  emptyMessage = 'Nenhum registro corresponde aos filtros selecionados.',
}: BrandedReportDocumentProps<T>) {
  const pages = chunks(rows, firstPageRows ?? rowsPerPage, rowsPerPage)

  return (
    <Document title={title} author="GB CERNE" subject={description} creator="GB CERNE - React PDF">
      {pages.map((pageRows, pageIndex) => (
        <Page key={`${title}-${pageIndex}`} size="A4" orientation="landscape" style={styles.page} wrap={false}>
          <View style={styles.brandLine} fixed />
          <View style={styles.header}>
            <PdfBrandLogo />
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>GB CERNE · RELATÓRIOS</Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
            <Text style={styles.emitted}>Emitido em{`\n`}{emittedAt}</Text>
          </View>

          {pageIndex === 0 ? (
            <>
              <View style={styles.metaRow}>
                {metadata.map((item) => (
                  <View key={item.label} style={styles.metaItem}>
                    <Text style={styles.metaLabel}>{item.label}</Text>
                    <Text style={styles.metaValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.highlights}>
                {highlights.map((item) => (
                  <View key={item.label} style={styles.highlight}>
                    <Text style={styles.highlightLabel}>{item.label}</Text>
                    <Text style={styles.highlightValue}>{item.value}</Text>
                    {item.helper && <Text style={styles.highlightHelper}>{item.helper}</Text>}
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.continuation}>Continuação · {rows.length} registros no período</Text>
          )}

          <View style={styles.table} wrap={false}>
            <View style={styles.tableHeader}>
              {columns.map((column) => (
                <View key={column.key} style={{ flex: column.width }}>
                  <Text style={[styles.tableHeaderCell, { textAlign: column.align ?? 'left' }]}>
                    {column.label}
                  </Text>
                </View>
              ))}
            </View>
            {pageRows.length === 0 ? (
              <Text style={styles.empty}>{emptyMessage}</Text>
            ) : pageRows.map((row, rowIndex) => {
              const detail = getRowDetail?.(row)
              return (
                <View key={getRowKey(row)} style={[styles.tableRow, rowIndex % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
                  <View style={styles.tableRowMain}>
                    {columns.map((column) => (
                      <View key={column.key} style={{ flex: column.width }}>
                        <Text style={[styles.tableCell, { textAlign: column.align ?? 'left' }]}>
                          {column.render(row)}
                        </Text>
                      </View>
                    ))}
                  </View>
                  {detail && (
                    <Text style={styles.detail}>
                      <Text style={styles.detailLabel}>Detalhes: </Text>{detail}
                    </Text>
                  )}
                </View>
              )
            })}
          </View>

          <View style={styles.footer} fixed>
            <Text>Documento gerado pelo GB CERNE · dados sujeitos aos filtros informados</Text>
            <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
          </View>
        </Page>
      ))}
    </Document>
  )
}
