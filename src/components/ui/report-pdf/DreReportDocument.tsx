import React from 'react'
import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { t } from '../../../design/tokens'
import type { DreRow, DreView } from '../../../pages/relatorios/dre-anual/dreData'
import { formatDreCurrency, formatDrePercent } from '../../../pages/relatorios/dre-anual/dreData'
import { PdfBrandLogo } from './PdfBrandLogo'

Font.register({
  family: 'Outfit',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4E.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4QK1C4E.ttf', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4e6yC4E.ttf', fontWeight: 600 },
  ],
})

interface DreReportDocumentProps {
  view: DreView
  rows: DreRow[]
  emittedAt: string
  pageOffset?: number
  totalPagesOverride?: number
  forceContinuation?: boolean
  singlePage?: boolean
  totalRowsOverride?: number
}

const styles = StyleSheet.create({
  page: { backgroundColor: t.color.neutral[0], color: t.color.neutral[900], fontFamily: 'Outfit', fontSize: 8, fontWeight: 400, paddingTop: 27, paddingHorizontal: 30, paddingBottom: 30 },
  brandLine: { height: 4, backgroundColor: t.color.brand[600], position: 'absolute', top: 0, left: 0, right: 0 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 13 },
  heading: { flex: 1, paddingLeft: 22 },
  eyebrow: { color: t.color.brand[700], fontSize: 7, fontWeight: 600, letterSpacing: 1.25, marginBottom: 4 },
  title: { color: t.color.neutral[900], fontSize: 18, fontWeight: 600, lineHeight: 1.15, marginBottom: 4 },
  description: { color: t.color.neutral[600], fontSize: 8.5, lineHeight: 1.35 },
  emitted: { color: t.color.neutral[500], fontSize: 7.15, width: 118, lineHeight: 1.35, textAlign: 'right' },
  metaRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  meta: { flexDirection: 'row', backgroundColor: t.color.neutral[100], borderRadius: 4, paddingVertical: 4, paddingHorizontal: 7 },
  metaLabel: { color: t.color.neutral[500], fontSize: 7, fontWeight: 500, marginRight: 3 },
  metaValue: { color: t.color.neutral[800], fontSize: 7, fontWeight: 500 },
  highlights: { flexDirection: 'row', gap: 7, marginBottom: 12 },
  highlight: { flex: 1, borderWidth: 1, borderColor: t.color.neutral[200], borderRadius: 6, paddingVertical: 7, paddingHorizontal: 8 },
  highlightLabel: { color: t.color.neutral[500], fontSize: 6.7, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.45, marginBottom: 3 },
  highlightValue: { color: t.color.neutral[900], fontSize: 12, fontWeight: 600, lineHeight: 1.15 },
  table: { borderWidth: 1, borderColor: t.color.neutral[200], borderRadius: 6, overflow: 'hidden' },
  tableHeader: { backgroundColor: t.color.brand[800], flexDirection: 'row', alignItems: 'center', minHeight: 27 },
  tableHeaderCell: { color: t.color.neutral[0], fontSize: 7, fontWeight: 600, paddingHorizontal: 7, paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 14, borderTopWidth: 1, borderTopColor: t.color.neutral[200] },
  rowAlt: { backgroundColor: t.color.neutral[50] },
  rowResult: { backgroundColor: t.color.brand[50] },
  rowGroup: { backgroundColor: t.color.neutral[100] },
  cell: { color: t.color.neutral[800], fontSize: 7.1, fontWeight: 400, paddingHorizontal: 7, paddingVertical: 2.7, lineHeight: 1.2 },
  cellStrong: { color: t.color.neutral[900], fontWeight: 600 },
  cellGroup: { fontWeight: 500 },
  continuation: { color: t.color.neutral[500], fontSize: 7.25, fontWeight: 500, marginBottom: 7 },
  footer: { position: 'absolute', bottom: 12, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', color: t.color.neutral[500], fontSize: 6.75 },
  pageNumber: { color: t.color.neutral[700], fontWeight: 600 },
})

type DreColumnKey = 'description' | 'year2025' | 'year2026' | 'total' | 'percentage'

const columns: { key: DreColumnKey; label: string; flex: number; align: 'left' | 'right' }[] = [
  { key: 'description', label: 'Descrição', flex: 3.65, align: 'left' as const },
  { key: 'year2025', label: '2025', flex: 1.2, align: 'right' as const },
  { key: 'year2026', label: '2026', flex: 1.2, align: 'right' as const },
  { key: 'total', label: 'Acumulado', flex: 1.3, align: 'right' as const },
  { key: 'percentage', label: '% da receita', flex: 1, align: 'right' as const },
]

function splitRows(rows: DreRow[], firstSize: number, pageSize: number) {
  const first = rows.slice(0, firstSize)
  const remainder = rows.slice(firstSize)
  return [first, ...Array.from({ length: Math.ceil(remainder.length / pageSize) }, (_, index) => remainder.slice(index * pageSize, (index + 1) * pageSize))]
}

function splitAnalyticRows(rows: DreRow[]) {
  const pageSizes = [20, 18, 14, 12, 11]
  let offset = 0
  const pages = pageSizes.map((size) => {
    const page = rows.slice(offset, offset + size)
    offset += size
    return page
  })
  if (offset < rows.length) pages.push(rows.slice(offset))
  return pages
}

function cellValue(row: DreRow, key: DreColumnKey) {
  if (key === 'description') return row.description
  if (key === 'percentage') return formatDrePercent(row.percentage)
  return formatDreCurrency(row[key])
}

export function DreReportDocument({ view, rows, emittedAt, pageOffset = 0, totalPagesOverride, forceContinuation = false, singlePage = false, totalRowsOverride }: DreReportDocumentProps) {
  const pages = singlePage
    ? [rows]
    : view === 'synthetic'
      ? splitRows(rows, 20, 24)
      : splitAnalyticRows(rows)
  const variantLabel = view === 'analytic' ? 'Analítico' : 'Sintético'

  return (
    <Document title={`DRE Anual — ${variantLabel}`} author="GB CERNE" subject="Demonstrativo do resultado do exercício" creator="GB CERNE - React PDF">
      {pages.map((pageRows, pageIndex) => (
        <Page key={`dre-${view}-${pageIndex}`} size="A4" orientation="landscape" style={styles.page} wrap={false}>
          <View style={styles.brandLine} fixed />
          <View style={styles.header}>
            <PdfBrandLogo />
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>GB CERNE · RELATÓRIOS FINANCEIROS</Text>
              <Text style={styles.title}>DRE anual · {variantLabel.toLowerCase()}</Text>
              <Text style={styles.description}>Demonstração do resultado do exercício por plano de contas e período.</Text>
            </View>
            <Text style={styles.emitted}>Emitido em{`\n`}{emittedAt}</Text>
          </View>

          {pageIndex === 0 && !forceContinuation ? (
            <>
              <View style={styles.metaRow}>
                <View style={styles.meta}><Text style={styles.metaLabel}>Período</Text><Text style={styles.metaValue}>2025 a 2026</Text></View>
                <View style={styles.meta}><Text style={styles.metaLabel}>Fazenda</Text><Text style={styles.metaValue}>Fazenda Maira</Text></View>
                <View style={styles.meta}><Text style={styles.metaLabel}>Visão</Text><Text style={styles.metaValue}>{variantLabel}</Text></View>
                <View style={styles.meta}><Text style={styles.metaLabel}>Registros</Text><Text style={styles.metaValue}>{totalRowsOverride ?? rows.length} linhas</Text></View>
              </View>
              <View style={styles.highlights}>
                <View style={styles.highlight}><Text style={styles.highlightLabel}>Receita líquida</Text><Text style={styles.highlightValue}>R$ 442.778,90</Text></View>
                <View style={styles.highlight}><Text style={styles.highlightLabel}>EBITDA</Text><Text style={styles.highlightValue}>R$ 195.554,82</Text></View>
                <View style={styles.highlight}><Text style={styles.highlightLabel}>Lucro líquido</Text><Text style={styles.highlightValue}>R$ 128.338,42</Text></View>
                <View style={styles.highlight}><Text style={styles.highlightLabel}>Margem líquida</Text><Text style={styles.highlightValue}>28,98%</Text></View>
              </View>
            </>
          ) : <Text style={styles.continuation}>Continuação · DRE anual {variantLabel.toLowerCase()} · {totalRowsOverride ?? rows.length} linhas no período</Text>}

          <View style={styles.table} wrap={false}>
            <View style={styles.tableHeader}>
              {columns.map((column) => <View key={column.key} style={{ flex: column.flex, minWidth: 0 }}><Text style={[styles.tableHeaderCell, { textAlign: column.align }]}>{column.label}</Text></View>)}
            </View>
            {pageRows.map((row, index) => {
              const isResult = row.kind === 'result'
              const isGroup = row.kind === 'group'
              const leftPadding = 7 + row.level * 12
              return (
                <View key={row.id} style={[styles.row, index % 2 === 1 ? styles.rowAlt : {}, isGroup ? styles.rowGroup : {}, isResult ? styles.rowResult : {}]} wrap={false}>
                  {columns.map((column) => (
                    <View key={column.key} style={{ flex: column.flex, minWidth: 0 }}>
                      <Text style={[styles.cell, (isResult || isGroup) ? styles.cellStrong : {}, isGroup && !isResult ? styles.cellGroup : {}, column.key === 'description' ? { paddingLeft: leftPadding } : { textAlign: 'right' }]}>
                        {cellValue(row, column.key)}
                      </Text>
                    </View>
                  ))}
                </View>
              )
            })}
          </View>

          <View style={styles.footer} fixed>
            <Text>Documento gerado pelo GB CERNE · valores em reais (R$)</Text>
            {totalPagesOverride
              ? <Text style={styles.pageNumber}>Página {pageOffset + pageIndex + 1} de {totalPagesOverride}</Text>
              : <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />}
          </View>
        </Page>
      ))}
    </Document>
  )
}
