/**
 * Módulo Pessoas Unificado — tipos, opções e regras de negócio.
 *
 * `Pessoa` é a entidade-raiz de identidade. Um registro pode acumular até cinco
 * papéis (Proprietário, Funcionário, Fornecedor, Cliente, Usuário) ativos
 * simultaneamente. Ver SPEC-GB-CERNE-modulo-pessoas-unificado.md.
 */

import type { BadgeVariant } from '../../../components/ui/Badge'

// ─── Papéis ─────────────────────────────────────────────────────────────────

export type RoleKey = 'proprietary' | 'employee' | 'provider' | 'client' | 'user'

export interface RoleMeta {
  key:     RoleKey
  label:   string
  variant: BadgeVariant
  /** Descrição operacional curta para o cabeçalho da seção do formulário. */
  hint:    string
}

export const ROLES: RoleMeta[] = [
  { key: 'proprietary', label: 'Proprietário', variant: 'success', hint: 'Dono de fazenda — participação por propriedade e inscrições estaduais.' },
  { key: 'employee',    label: 'Funcionário',  variant: 'info',    hint: 'Colaborador — cargo, função, dados bancários e centro de custo.' },
  { key: 'provider',    label: 'Fornecedor',   variant: 'purple',  hint: 'Vende insumos — filiais, vendedores e dados bancários.' },
  { key: 'client',      label: 'Cliente',      variant: 'cyan',    hint: 'Comprador — inscrições estaduais, contribuinte e dados fiscais.' },
  { key: 'user',        label: 'Usuário',      variant: 'warning', hint: 'Acesso ao sistema — perfis, fazendas e encarregados.' },
]

export const ROLE_LABEL: Record<RoleKey, string> = ROLES.reduce(
  (acc, r) => { acc[r.key] = r.label; return acc },
  {} as Record<RoleKey, string>,
)

// ─── Sub-entidades ────────────────────────────────────────────────────────────

/** Vínculo Proprietário ↔ Fazenda com percentual de participação. */
export interface FarmShare {
  farmId:     string
  percentage: string   // mantido como string para máscara/edição; 0–100
}

/** Filial de fornecedor. */
export interface Branch {
  nif:               string
  stateRegistration: string
  zipCode:           string
  address:           string
  cityId:            string
}

/** Vendedor de fornecedor. */
export interface Seller {
  name:  string
  email: string
  phone: string
}

// ─── Dados por papel ────────────────────────────────────────────────────────

export interface ProprietaryData {
  enabled:    boolean
  inscricoes: string[]
  farms:      FarmShare[]
}

export interface EmployeeData {
  enabled:      boolean
  office:       string
  functionId:   string
  commission:   string
  hourValue:    string
  baseSalary:   string   // sensível — gate de permissão
  goalSalary:   string   // sensível
  centerId:     string
  birthday:     string | null
  // Dados bancários (independentes do fornecedor — Regra de negócio #5)
  bankId:       string
  accountType:  string
  agency:       string
  account:      string
  pixType:      string
  pix:          string
}

export interface ProviderData {
  enabled:           boolean
  type:              string
  commission:        string   // obrigatório quando type === '5'
  hourValue:         string   // obrigatório quando type === '3'
  stateRegistration: string
  cityRegistration:  string
  contact:           string
  contactPhone:      string
  // Dados bancários
  bankId:            string
  accountType:       string
  agency:            string
  account:           string
  pixType:           string
  pix:               string
  branches:          Branch[]
  sellers:           Seller[]
}

export interface ClientData {
  enabled:            boolean
  cellphone:          string
  contact:            string
  contactPhone:       string
  cityRegistration:   string
  finalConsumer:      boolean
  taxpayer:           boolean
  countryId:          string
  idAbroad:           string
  farmName:           string
  stateRegistrations: string[]
}

export interface UserData {
  enabled:              boolean   // user_is_active
  purchasingAssistant:  boolean
  password:             string
  passwordConfirmation: string
  roleIds:              string[]
  farmIds:              string[]
  bossIds:              string[]
}

// ─── Entidade-raiz ─────────────────────────────────────────────────────────────

export interface Pessoa {
  id:       number
  /** CPF (11) ou CNPJ (14) — armazenado mascarado para exibição. */
  nif:      string
  name:     string   // Nome Fantasia (PJ) / Nome Completo (PF)
  nickname: string   // Razão Social (PJ) / Apelido (PF)
  email:    string
  phone:    string
  cityId:   string
  zipCode:  string
  address:  string
  number:   string
  district: string

  proprietary: ProprietaryData
  employee:    EmployeeData
  provider:    ProviderData
  client:      ClientData
  user:        UserData
}

// ─── Fábricas de dados vazios por papel ───────────────────────────────────────

export const emptyProprietary = (): ProprietaryData => ({ enabled: false, inscricoes: [], farms: [] })
export const emptyEmployee    = (): EmployeeData    => ({ enabled: false, office: '', functionId: '', commission: '', hourValue: '', baseSalary: '', goalSalary: '', centerId: '', birthday: null, bankId: '', accountType: '', agency: '', account: '', pixType: '', pix: '' })
export const emptyProvider    = (): ProviderData    => ({ enabled: false, type: '', commission: '', hourValue: '', stateRegistration: '', cityRegistration: '', contact: '', contactPhone: '', bankId: '', accountType: '', agency: '', account: '', pixType: '', pix: '', branches: [], sellers: [] })
export const emptyClient      = (): ClientData      => ({ enabled: false, cellphone: '', contact: '', contactPhone: '', cityRegistration: '', finalConsumer: false, taxpayer: true, countryId: 'BR', idAbroad: '', farmName: '', stateRegistrations: [] })
export const emptyUser        = (): UserData        => ({ enabled: false, purchasingAssistant: false, password: '', passwordConfirmation: '', roleIds: [], farmIds: [], bossIds: [] })

export const emptyPessoa = (): Pessoa => ({
  id: 0, nif: '', name: '', nickname: '', email: '', phone: '',
  cityId: '', zipCode: '', address: '', number: '', district: '',
  proprietary: emptyProprietary(),
  employee:    emptyEmployee(),
  provider:    emptyProvider(),
  client:      emptyClient(),
  user:        emptyUser(),
})

// ─── Derivados ────────────────────────────────────────────────────────────────

export type DocType = 'cpf' | 'cnpj' | 'unknown'

const onlyDigits = (v: string) => v.replace(/\D/g, '')

/** Detecta CPF/CNPJ pelo número de dígitos preenchidos. */
export function docTypeOf(nif: string): DocType {
  const d = onlyDigits(nif)
  if (d.length === 11) return 'cpf'
  if (d.length === 14) return 'cnpj'
  return 'unknown'
}

/** `true` para CNPJ (PJ); `false` para CPF/indefinido (PF). */
export function isPJ(nif: string): boolean {
  return docTypeOf(nif) === 'cnpj'
}

/** Papéis atualmente ativos numa pessoa, na ordem canônica de `ROLES`. */
export function activeRoles(p: Pessoa): RoleMeta[] {
  return ROLES.filter((r) => p[r.key].enabled)
}

// ─── Validação de CPF/CNPJ (dígitos verificadores) ─────────────────────────────

function validaCPF(d: string): boolean {
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const calc = (slice: number) => {
    let sum = 0
    for (let i = 0; i < slice; i++) sum += parseInt(d[i], 10) * (slice + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 ? 0 : r
  }
  return calc(9) === parseInt(d[9], 10) && calc(10) === parseInt(d[10], 10)
}

function validaCNPJ(d: string): boolean {
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false
  const calc = (len: number) => {
    const weights = len === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(d[i], 10) * weights[i]
    const r = sum % 11
    return r < 2 ? 0 : 11 - r
  }
  return calc(12) === parseInt(d[12], 10) && calc(13) === parseInt(d[13], 10)
}

/** Valida CPF (11) ou CNPJ (14) incluindo dígitos verificadores. */
export function isValidNif(nif: string): boolean {
  const d = onlyDigits(nif)
  if (d.length === 11) return validaCPF(d)
  if (d.length === 14) return validaCNPJ(d)
  return false
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Opções de catálogo (mock) ────────────────────────────────────────────────

export interface Opt { value: string; label: string }

export const CIDADES: Opt[] = [
  { value: 'cba',  label: 'Cuiabá — MT' },
  { value: 'sor',  label: 'Sorriso — MT' },
  { value: 'rvd',  label: 'Rio Verde — GO' },
  { value: 'ldb',  label: 'Londrina — PR' },
  { value: 'unai', label: 'Unaí — MG' },
  { value: 'bar',  label: 'Barreiras — BA' },
  { value: 'dou',  label: 'Dourados — MS' },
  { value: 'pas',  label: 'Passo Fundo — RS' },
]

export const FAZENDAS: Opt[] = [
  { value: 'f1', label: 'Fazenda São João' },
  { value: 'f2', label: 'Fazenda Boa Vista' },
  { value: 'f3', label: 'Fazenda Santa Maria' },
  { value: 'f4', label: 'Fazenda Três Irmãos' },
]

export const CENTROS_CUSTO: Opt[] = [
  { value: 'cc1', label: '1.01 — Lavoura de Soja' },
  { value: 'cc2', label: '1.02 — Pecuária de Corte' },
  { value: 'cc3', label: '1.03 — Administrativo' },
]

export const FUNCOES_CBO: Opt[] = [
  { value: '6210', label: 'Trabalhador agropecuário' },
  { value: '6410', label: 'Operador de máquinas agrícolas' },
  { value: '1423', label: 'Gerente de produção rural' },
  { value: '4110', label: 'Auxiliar administrativo' },
]

export const BANCOS: Opt[] = [
  { value: '001', label: '001 — Banco do Brasil' },
  { value: '237', label: '237 — Bradesco' },
  { value: '341', label: '341 — Itaú Unibanco' },
  { value: '104', label: '104 — Caixa Econômica Federal' },
  { value: '748', label: '748 — Sicredi' },
  { value: '756', label: '756 — Sicoob' },
]

export const PAISES: Opt[] = [
  { value: 'BR', label: 'Brasil' },
  { value: 'PY', label: 'Paraguai' },
  { value: 'AR', label: 'Argentina' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'CN', label: 'China' },
]

export const PERFIS_USUARIO: Opt[] = [
  { value: 'admin',    label: 'Administrador' },
  { value: 'manager',  label: 'Gerente' },
  { value: 'operator', label: 'Operador' },
  { value: 'viewer',   label: 'Visualizador' },
  { value: 'financ',   label: 'Financeiro' },
]

export const ENCARREGADOS: Opt[] = [
  { value: 'u1', label: 'Carlos Andrade' },
  { value: 'u2', label: 'Mariana Lopes' },
  { value: 'u3', label: 'Roberto Dias' },
]

/** Tipos de fornecedor — type 3 = prestador de serviço (valor/hora); type 5 = comissionado. */
export const TIPO_FORNECEDOR: Opt[] = [
  { value: '1', label: 'Revenda de insumos' },
  { value: '2', label: 'Indústria' },
  { value: '3', label: 'Prestador de serviço' },
  { value: '4', label: 'Transportadora' },
  { value: '5', label: 'Representante comissionado' },
]

export const TIPO_CONTA: Opt[] = [
  { value: 'C', label: 'Conta Corrente' },
  { value: 'P', label: 'Conta Poupança' },
]

export type PixType = 'cpfcnpj' | 'email' | 'phone' | 'random'

export const TIPO_PIX: Opt[] = [
  { value: 'cpfcnpj', label: 'CPF / CNPJ' },
  { value: 'email',   label: 'E-mail' },
  { value: 'phone',   label: 'Telefone' },
  { value: 'random',  label: 'Chave aleatória' },
]

// ─── Helpers de exibição ────────────────────────────────────────────────────

const labelFromOpts = (opts: Opt[], value: string) =>
  opts.find((o) => o.value === value)?.label ?? value

export const cidadeLabel = (id: string) => labelFromOpts(CIDADES, id)
export const fazendaLabel = (id: string) => labelFromOpts(FAZENDAS, id)

/** Aplica máscara CPF/CNPJ a um valor (para exibição na listagem). */
export function maskNif(nif: string): string {
  const d = onlyDigits(nif)
  if (d.length === 11) {
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  if (d.length === 14) {
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return nif
}

/** Valida uma chave PIX conforme o tipo selecionado. Retorna mensagem de erro ou undefined. */
export function validatePix(type: string, value: string): string | undefined {
  const v = value.trim()
  if (!v) return undefined
  switch (type) {
    case 'cpfcnpj':
      return isValidNif(v) ? undefined : 'Chave PIX deve ser um CPF ou CNPJ válido.'
    case 'email':
      return EMAIL_RE.test(v) ? undefined : 'Chave PIX deve ser um e-mail válido.'
    case 'phone':
      return onlyDigits(v).length >= 10 ? undefined : 'Telefone deve ter DDD + número.'
    case 'random':
      return v.length >= 32 ? undefined : 'Chave aleatória deve ter 32+ caracteres.'
    default:
      return undefined
  }
}
