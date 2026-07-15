import type React from 'react'

/**
 * Contrato compartilhado dos componentes de campo (FormField, FormSelect,
 * SearchSelect, DatePicker…). Garante uma superfície de API uniforme entre
 * todos os campos do kit — rótulo opcional, ícones à esquerda/direita
 * independentes, e estados de validação/dica consistentes.
 *
 * A altura do controle NÃO faz parte deste contrato: é sempre `t.size.control`
 * (36px, com a variação `size='lg'` = `t.size.controlLg`, 40px, no FormField). Ver Fase 1.
 */
export interface BaseFieldProps {
  /** Rótulo acima do campo. Opcional — omita para a variação "sem label". */
  label?: string
  /** Marca o campo como obrigatório (asterisco ao lado do rótulo). */
  required?: boolean
  /** Mensagem de erro; quando presente, aplica o estilo de erro ao controle. */
  error?: string
  /** Dica exibida em tooltip (ícone de ajuda ao lado do rótulo). */
  hint?: string
  /** Estado visual de validação: 'ok' = borda verde, 'err' = borda vermelha. */
  status?: 'idle' | 'ok' | 'err'
  /** Ícone posicionado à esquerda do controle (decorativo). */
  iconLeft?: React.ReactNode
  /** Ícone ou ação posicionada à direita do controle. */
  iconRight?: React.ReactNode
}
