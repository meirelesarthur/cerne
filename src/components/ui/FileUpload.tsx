import React, { useId, useRef, useState, useCallback } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { IconButton } from './IconButton'
import { Badge } from './Badge'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface UploadedFile {
  id: string
  name: string
  size: number
  status?: 'idle' | 'uploading' | 'done' | 'error'
  progress?: number
}

export interface FileUploadProps {
  label?: string
  hint?: string
  error?: string
  accept?: string
  multiple?: boolean
  maxSizeMb?: number
  files?: UploadedFile[]
  onFilesAdded: (files: File[]) => void
  onRemove?: (id: string) => void
  disabled?: boolean
}

// ─── Utilidades ──────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function buildAcceptedExtensions(accept?: string): string[] {
  if (!accept) return []
  return accept.split(',').map((s) => s.trim().toLowerCase())
}

function isAccepted(file: File, accept?: string): boolean {
  if (!accept) return true
  const exts = buildAcceptedExtensions(accept)
  const lower = file.name.toLowerCase()
  return exts.some((ext) => {
    if (ext.startsWith('.')) return lower.endsWith(ext)
    // MIME type like image/*
    if (ext.endsWith('/*')) return file.type.startsWith(ext.replace('/*', '/'))
    return file.type === ext
  })
}

// ─── Barra de progresso inline ───────────────────────────────────────────────

function InlineProgress({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      style={{
        width: '100%',
        height: 3,
        borderRadius: t.radius.full,
        background: t.color.neutral[200],
        overflow: 'hidden',
        marginTop: t.space[1],
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${t.color.brand[600]}, ${t.color.brand[400]})`,
          borderRadius: t.radius.full,
          transition: `width ${t.transition.smooth}`,
        }}
      />
    </div>
  )
}

// ─── Ícone de status do arquivo ───────────────────────────────────────────────

function FileStatusIcon({ status }: { status?: UploadedFile['status'] }) {
  switch (status) {
    case 'done':
      return <CheckCircle size={14} color={t.color.success.text} />
    case 'error':
      return <AlertCircle size={14} color={t.color.error.text} />
    case 'uploading':
      return (
        <span
          style={{
            display: 'inline-flex',
            animation: 'spin 1s linear infinite',
          }}
        >
          <Loader2 size={14} color={t.color.brand[600]} />
        </span>
      )
    default:
      return <FileText size={14} color={t.color.neutral[400]} />
  }
}

function fileBadgeVariant(status?: UploadedFile['status']): 'success' | 'danger' | 'info' | 'neutral' {
  switch (status) {
    case 'done':     return 'success'
    case 'error':    return 'danger'
    case 'uploading': return 'info'
    default:         return 'neutral'
  }
}

function fileBadgeLabel(status?: UploadedFile['status']): string {
  switch (status) {
    case 'done':      return 'Concluído'
    case 'error':     return 'Erro'
    case 'uploading': return 'Enviando…'
    default:          return 'Aguardando'
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function FileUpload({
  label,
  hint,
  error,
  accept,
  multiple = false,
  maxSizeMb,
  files = [],
  onFilesAdded,
  onRemove,
  disabled = false,
}: FileUploadProps) {
  const { colors, isGbMode } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragover, setDragover] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const labelId = useId()
  const errorId = useId()
  const dropId  = useId()

  const hasError = !!error || !!validationError
  const displayError = error || validationError

  // ─── Validação e processamento dos arquivos ───────────────────────────────

  const processFiles = useCallback(
    (rawFiles: FileList | File[]) => {
      const arr = Array.from(rawFiles)
      const valid: File[] = []
      const errors: string[] = []

      for (const file of arr) {
        if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
          errors.push(`"${file.name}" excede ${maxSizeMb} MB — reduza o tamanho do arquivo antes de enviar.`)
          continue
        }
        if (!isAccepted(file, accept)) {
          const exts = accept ?? ''
          errors.push(`"${file.name}" não é um tipo aceito. Formatos permitidos: ${exts}.`)
          continue
        }
        valid.push(file)
      }

      if (errors.length > 0) {
        setValidationError(errors[0])
      } else {
        setValidationError(null)
      }

      if (valid.length > 0) {
        onFilesAdded(valid)
      }
    },
    [accept, maxSizeMb, onFilesAdded],
  )

  // ─── Handlers ────────────────────────────────────────────────────────────

  const openPicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openPicker()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setDragover(true)
  }

  const handleDragLeave = () => setDragover(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragover(false)
    if (disabled) return
    processFiles(e.dataTransfer.files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
      // Reset so the same file can be re-selected
      e.target.value = ''
    }
  }

  // ─── Derivação de estilos da dropzone ────────────────────────────────────

  const dropzoneBorder = hasError
    ? t.color.error.text
    : dragover
    ? colors.accent.default
    : colors.border.default

  const dropzoneBg = dragover
    ? (isGbMode ? 'rgba(16,185,129,0.08)' : t.color.brand[50])
    : hasError
    ? (isGbMode ? 'rgba(220,38,38,0.06)' : t.color.error.bg)
    : disabled
    ? (isGbMode ? 'rgba(255,255,255,0.02)' : t.color.disabled.bg)
    : (isGbMode ? colors.bg.input : colors.bg.surface)

  const iconColor = dragover
    ? colors.accent.default
    : disabled
    ? colors.fg.subtle
    : colors.fg.subtle

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: t.space[1],
        fontFamily: t.font.family.sans,
      }}
    >
      {/* Keyframe para Loader2 — injetado via style tag inline */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @media (prefers-reduced-motion: reduce) { @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(0.01deg); } } }`}</style>

      {/* Label e hint ─────────────────────────────────────────────────────── */}
      {(label || hint) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 2 }}>
          {label && (
            <span
              id={labelId}
              style={{
                fontSize: t.font.size.sm,
                fontWeight: t.font.weight.medium,
                color: colors.fg.default,
              }}
            >
              {label}
            </span>
          )}
          {hint && (
            <span
              style={{
                fontSize: t.font.size.xs,
                color: colors.fg.subtle,
              }}
            >
              {hint}
            </span>
          )}
        </div>
      )}

      {/* Input oculto ────────────────────────────────────────────────────── */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
        style={{ display: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Dropzone ──────────────────────────────────────────────────────────── */}
      <div
        id={dropId}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label ?? 'Área de upload de arquivos'}
        aria-disabled={disabled}
        aria-describedby={displayError ? errorId : undefined}
        aria-labelledby={label ? labelId : undefined}
        className="gb-focusable"
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            t.space[2],
          padding:        `${t.space[6]}px ${t.space[4]}px`,
          border:         `1.5px dashed ${dropzoneBorder}`,
          borderRadius:   t.radius.DEFAULT,
          background:     dropzoneBg,
          cursor:         disabled ? 'not-allowed' : 'pointer',
          opacity:        disabled ? 0.6 : 1,
          transition:     `border-color ${t.transition.DEFAULT}, background ${t.transition.smooth}`,
          outline:        'none',
          userSelect:     'none',
          WebkitUserSelect: 'none',
        }}
      >
        <span
          style={{
            display:         'inline-flex',
            alignItems:      'center',
            justifyContent:  'center',
            width:           40,
            height:          40,
            borderRadius:    t.radius.full,
            background:      dragover
              ? (isGbMode ? 'rgba(16,185,129,0.15)' : t.color.brand[100])
              : (isGbMode ? 'rgba(255,255,255,0.06)' : t.color.neutral[100]),
            transition:      `background ${t.transition.DEFAULT}`,
          }}
          aria-hidden="true"
        >
          <Upload size={18} color={iconColor} />
        </span>

        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              margin: 0,
              fontSize:   t.font.size.sm,
              fontWeight: t.font.weight.medium,
              color:      dragover ? colors.accent.default : colors.fg.default,
              transition: `color ${t.transition.DEFAULT}`,
            }}
          >
            {dragover ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
          </p>
          {(accept || maxSizeMb) && (
            <p
              style={{
                margin:     `${t.space[1]}px 0 0`,
                fontSize:   t.font.size.xs,
                color:      colors.fg.subtle,
              }}
            >
              {[
                accept && `Tipos aceitos: ${accept}`,
                maxSizeMb && `Tamanho máximo: ${maxSizeMb} MB`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Mensagem de erro ──────────────────────────────────────────────────── */}
      {displayError && (
        <span
          id={errorId}
          role="alert"
          aria-live="polite"
          style={{
            fontSize: t.font.size.xs,
            color:    t.color.error.text,
          }}
        >
          {displayError}
        </span>
      )}

      {/* Lista de arquivos ─────────────────────────────────────────────────── */}
      {files.length > 0 && (
        <ul
          style={{
            margin:        0,
            padding:       0,
            listStyle:     'none',
            display:       'flex',
            flexDirection: 'column',
            gap:           t.space[1],
            marginTop:     t.space[1],
          }}
          aria-label="Arquivos selecionados"
        >
          {files.map((file) => (
            <li
              key={file.id}
              style={{
                display:      'flex',
                flexDirection: 'column',
                gap:          0,
                padding:      `${t.space[2]}px ${t.space[3]}px`,
                border:       `1px solid ${file.status === 'error' ? t.color.error.border : colors.border.default}`,
                borderRadius: t.radius.DEFAULT,
                background:   file.status === 'error'
                  ? (isGbMode ? 'rgba(220,38,38,0.06)' : t.color.error.bg)
                  : file.status === 'done'
                  ? (isGbMode ? 'rgba(5,150,105,0.06)' : t.color.success.bg)
                  : (isGbMode ? colors.bg.surface : colors.bg.subtle),
                transition:   `background ${t.transition.smooth}, border-color ${t.transition.DEFAULT}`,
              }}
            >
              {/* Linha principal ─────────────────────────────────────── */}
              <div
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  gap:            t.space[2],
                }}
              >
                {/* Ícone de status */}
                <span aria-hidden="true" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  <FileStatusIcon status={file.status} />
                </span>

                {/* Nome + tamanho */}
                <span
                  style={{
                    flex:         1,
                    minWidth:     0,
                    display:      'flex',
                    flexDirection: 'column',
                    gap:          2,
                  }}
                >
                  <span
                    style={{
                      fontSize:     t.font.size.sm,
                      fontWeight:   t.font.weight.medium,
                      color:        colors.fg.default,
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace:   'nowrap',
                    }}
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <span
                    style={{
                      fontSize: t.font.size.xs,
                      color:    colors.fg.subtle,
                    }}
                  >
                    {formatSize(file.size)}
                  </span>
                </span>

                {/* Badge de status */}
                {file.status && (
                  <Badge
                    label={fileBadgeLabel(file.status)}
                    variant={fileBadgeVariant(file.status)}
                  />
                )}

                {/* Botão remover */}
                {onRemove && (
                  <IconButton
                    icon={<X size={14} />}
                    aria-label={`Remover arquivo ${file.name}`}
                    onClick={() => onRemove(file.id)}
                    size="xs"
                    variant="ghost"
                    danger
                    disabled={disabled}
                  />
                )}
              </div>

              {/* Barra de progresso (apenas quando uploading + progress definido) */}
              {file.status === 'uploading' && file.progress !== undefined && (
                <InlineProgress value={file.progress} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
