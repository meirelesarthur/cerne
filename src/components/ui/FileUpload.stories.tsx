import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileUpload, type UploadedFile } from './FileUpload'
import { ThemeProvider } from '../../context/ThemeContext'

const meta: Meta<typeof FileUpload> = {
  title: 'GB CERNE/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Área de upload de arquivos com drag & drop, validação de tipo e tamanho, lista de arquivos com progresso e suporte a ambos os temas. Dropzone focável por teclado (Enter/Espaço). Mensagens de erro com `role="alert" aria-live="polite"`.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480, fontFamily: "'Outfit', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label:     { control: 'text' },
    hint:      { control: 'text' },
    error:     { control: 'text' },
    accept:    { control: 'text' },
    multiple:  { control: 'boolean' },
    maxSizeMb: { control: 'number' },
    disabled:  { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof FileUpload>

// ─── Vazio (estado inicial) ───────────────────────────────────────────────────

export const Vazio: Story = {
  args: {
    label:     'Documentos',
    hint:      'Anexe contratos, certidões e laudos relacionados à propriedade.',
    accept:    '.pdf,.png,.jpg',
    multiple:  true,
    maxSizeMb: 10,
    files:     [],
    onFilesAdded: () => {},
    onRemove:  () => {},
  },
}

// ─── Com arquivos ─────────────────────────────────────────────────────────────

const arquivosExemplo: UploadedFile[] = [
  { id: '1', name: 'contrato-arrendamento.pdf',  size: 2_340_000, status: 'done' },
  { id: '2', name: 'certidao-matricula.pdf',      size: 820_000,  status: 'idle' },
  { id: '3', name: 'foto-satelite.png',           size: 4_100_000, status: 'error' },
]

export const ComArquivos: Story = {
  render: () => {
    const [files, setFiles] = useState<UploadedFile[]>(arquivosExemplo)
    return (
      <FileUpload
        label="Documentos"
        hint="Arraste ou clique para adicionar mais arquivos."
        accept=".pdf,.png,.jpg"
        multiple
        maxSizeMb={10}
        files={files}
        onFilesAdded={(novos) => {
          const mapped: UploadedFile[] = novos.map((f) => ({
            id:     crypto.randomUUID(),
            name:   f.name,
            size:   f.size,
            status: 'idle',
          }))
          setFiles((prev) => [...prev, ...mapped])
        }}
        onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
      />
    )
  },
}

// ─── Uploading com ProgressBar ────────────────────────────────────────────────

export const Uploading: Story = {
  render: () => {
    const [files] = useState<UploadedFile[]>([
      { id: '1', name: 'laudo-tecnico.pdf',       size: 1_500_000, status: 'done',      progress: 100 },
      { id: '2', name: 'contrato-safra-2024.pdf', size: 3_200_000, status: 'uploading', progress: 63 },
      { id: '3', name: 'mapa-glebas.pdf',         size: 870_000,   status: 'uploading', progress: 12 },
    ])
    return (
      <FileUpload
        label="Documentos da Safra"
        accept=".pdf"
        multiple
        files={files}
        onFilesAdded={() => {}}
        onRemove={() => {}}
      />
    )
  },
}

// ─── Erro de validação (tamanho) ──────────────────────────────────────────────

export const ErroValidacao: Story = {
  render: () => {
    const [files, setFiles] = useState<UploadedFile[]>([])
    return (
      <FileUpload
        label="Certificado"
        hint="Apenas PDF, máximo 2 MB."
        accept=".pdf"
        maxSizeMb={2}
        files={files}
        onFilesAdded={(novos) => {
          const mapped: UploadedFile[] = novos.map((f) => ({
            id:     crypto.randomUUID(),
            name:   f.name,
            size:   f.size,
            status: 'idle',
          }))
          setFiles((prev) => [...prev, ...mapped])
        }}
        onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Tente arrastar um arquivo maior que 2 MB — o componente rejeita o arquivo e exibe a mensagem de erro orientada à correção, sem chamar `onFilesAdded`.',
      },
    },
  },
}

// ─── Erro externo (via prop error) ────────────────────────────────────────────

export const ErroExterno: Story = {
  args: {
    label:  'Comprovante de Propriedade',
    error:  'Pelo menos um documento é obrigatório para prosseguir.',
    accept: '.pdf',
    files:  [],
    onFilesAdded: () => {},
  },
}

// ─── Desabilitado ─────────────────────────────────────────────────────────────

export const Desabilitado: Story = {
  args: {
    label:    'Documentos',
    hint:     'Upload desabilitado enquanto o formulário estiver bloqueado.',
    disabled: true,
    files: [
      { id: '1', name: 'contrato.pdf', size: 1_200_000, status: 'done' },
    ],
    onFilesAdded: () => {},
    onRemove:     () => {},
  },
}

// ─── GBMode ───────────────────────────────────────────────────────────────────

export const GBMode: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultMode="gbMode">
        <div
          style={{
            background:   '#051008',
            padding:      32,
            borderRadius: 12,
            minWidth:     480,
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  render: () => {
    const [files, setFiles] = useState<UploadedFile[]>([
      { id: '1', name: 'contrato-arrendamento.pdf',  size: 2_340_000, status: 'done' },
      { id: '2', name: 'laudo-ambiental.pdf',         size: 1_050_000, status: 'uploading', progress: 45 },
      { id: '3', name: 'foto-drone.png',              size: 5_600_000, status: 'error' },
    ])
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Estado normal com arquivos */}
        <FileUpload
          label="Documentos da Fazenda"
          hint="PDF, PNG ou JPG — máximo 10 MB por arquivo."
          accept=".pdf,.png,.jpg"
          multiple
          maxSizeMb={10}
          files={files}
          onFilesAdded={(novos) => {
            const mapped: UploadedFile[] = novos.map((f) => ({
              id:     crypto.randomUUID(),
              name:   f.name,
              size:   f.size,
              status: 'idle',
            }))
            setFiles((prev) => [...prev, ...mapped])
          }}
          onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
        />

        {/* Estado desabilitado */}
        <FileUpload
          label="Documentos bloqueados"
          hint="Upload desabilitado enquanto o processo está em análise."
          disabled
          files={[{ id: 'x', name: 'doc-bloqueado.pdf', size: 780_000, status: 'done' }]}
          onFilesAdded={() => {}}
        />
      </div>
    )
  },
}
