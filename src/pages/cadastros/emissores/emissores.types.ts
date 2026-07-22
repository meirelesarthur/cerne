// ─── Tipos base ───────────────────────────────────────────────────────────────

export type Ambiente = 'producao' | 'homologacao'
export type Regime   = 'simples' | 'normal'

export interface InscricaoEstadual {
  id:      string
  uf:      string
  numero:  string
  isento:  boolean
}

export interface CertificadoInfo {
  titular:     string
  documento:   string
  validade:    string // ISO date (yyyy-mm-dd)
  arquivoNome: string
}

export interface Emissor {
  id:                 number
  logoUrl:            string | null
  cpfCnpj:            string
  razaoSocial:        string
  nomeFantasia:       string
  email:              string
  ativo:              'sim' | 'nao'
  cep:                string
  rua:                string
  numero:             string
  bairro:             string
  cidade:             string
  emiteNfe:           'sim' | 'nao'
  ultimoNumeroNfe:    string
  ultimoNumeroCte:    string
  ultimoNumeroMdfe:   string
  numeroSerieNfe:     string
  numeroSerieCte:     string
  numeroSerieMdfe:    string
  ambiente:           Ambiente | ''
  regime:             Regime | ''
  fazendas:           string[]
  inscricoesEstaduais: InscricaoEstadual[]
  certificado:        CertificadoInfo | null
  dataCriacao:        string
  usuarioCriacao:     string
}

// ─── Labels / opts ────────────────────────────────────────────────────────────

export const AMBIENTE_OPTS = [
  { value: '',            label: 'Selecione' },
  { value: 'producao',    label: 'Produção' },
  { value: 'homologacao', label: 'Homologação' },
]

export const AMBIENTE_LABEL: Record<Ambiente, string> = {
  producao:    'Produção',
  homologacao: 'Homologação',
}

export const REGIME_OPTS = [
  { value: '',        label: 'Selecione' },
  { value: 'simples',  label: 'Simples' },
  { value: 'normal',   label: 'Normal' },
]

export const SIM_NAO_OPTS = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
]

export const UF_OPTS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
].map(uf => ({ value: uf, label: uf }))

// ─── Validação de CPF/CNPJ (dígito verificador) ──────────────────────────────

function onlyDigits(v: string): string {
  return v.replace(/\D/g, '')
}

export function isValidCpf(raw: string): boolean {
  const cpf = onlyDigits(raw)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  const calc = (len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(cpf[i], 10) * (len + 1 - i)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }
  return calc(9) === parseInt(cpf[9], 10) && calc(10) === parseInt(cpf[10], 10)
}

export function isValidCnpj(raw: string): boolean {
  const cnpj = onlyDigits(raw)
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false
  const calc = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(cnpj[i], 10) * weights[i]
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }
  return calc(12) === parseInt(cnpj[12], 10) && calc(13) === parseInt(cnpj[13], 10)
}

export function isValidCpfCnpj(raw: string): boolean {
  const digits = onlyDigits(raw)
  return digits.length <= 11 ? isValidCpf(raw) : isValidCnpj(raw)
}

// ─── Status do certificado ────────────────────────────────────────────────────

export type CertificadoStatus = 'ausente' | 'expirado' | 'expirando' | 'valido'

export function certificadoStatus(cert: CertificadoInfo | null, today: string): CertificadoStatus {
  if (!cert) return 'ausente'
  const dias = (new Date(cert.validade).getTime() - new Date(today).getTime()) / 86_400_000
  if (dias < 0) return 'expirado'
  if (dias <= 30) return 'expirando'
  return 'valido'
}

export function fmtISOtoDMY(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ─── Apto a emitir (regra de negócio §6) ──────────────────────────────────────

export function aptoParaEmitir(emissor: Emissor, today: string): { apto: boolean; pendencias: string[] } {
  const pendencias: string[] = []
  if (emissor.emiteNfe !== 'sim') pendencias.push('Emite NFe está desabilitado')
  if (!emissor.numeroSerieNfe || !emissor.ambiente || !emissor.regime) pendencias.push('Numeração/série ou ambiente/regime não configurados')
  const temIeValida = emissor.inscricoesEstaduais.some(ie => ie.isento || ie.numero.trim())
  if (!temIeValida) pendencias.push('Nenhuma Inscrição Estadual válida (ou isenção marcada)')
  const status = certificadoStatus(emissor.certificado, today)
  if (status !== 'valido') pendencias.push('Certificado digital ausente ou expirado')
  return { apto: pendencias.length === 0, pendencias }
}
