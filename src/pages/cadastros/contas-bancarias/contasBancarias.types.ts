// ─── Tipos base ───────────────────────────────────────────────────────────────

export type TipoContaBancaria = 'corrente' | 'poupanca' | 'aplicacao' | 'caixa'

export interface ContaBancaria {
  id:                        number
  banco:                     string
  agencia:                   string
  conta:                     string
  usaNoLivroCaixa:           'sim' | 'nao'
  tipo:                      TipoContaBancaria | ''
  sigla:                     string
  descricao:                 string
  emiteBoleto:                'sim' | 'nao'
  proprietarios:             number[]
  limite:                    number
  ativo:                     'sim' | 'nao'
  carteira:                  string
  convenioCodBeneficiario:   string
  tipoBoleto:                'cnab240' | 'cnab400' | ''
  contaInvestimentoVinculadaId: number | null
  fazendasVinculadas:        string[]
  saldo:                     number
  dataCriacao:               string
  usuarioCriacao:            string
}

// ─── Bancos (FEBRABAN) — subconjunto representativo dos mais usados ──────────

export const BANCOS_FEBRABAN = [
  { code: '001', label: 'Banco do Brasil' },
  { code: '033', label: 'Santander' },
  { code: '104', label: 'Caixa Econômica Federal' },
  { code: '237', label: 'Bradesco' },
  { code: '341', label: 'Itaú Unibanco' },
  { code: '260', label: 'Nu Pagamentos (Nubank)' },
  { code: '077', label: 'Banco Inter' },
  { code: '212', label: 'Banco Original' },
  { code: '336', label: 'Banco C6' },
  { code: '756', label: 'Sicoob' },
  { code: '748', label: 'Sicredi' },
  { code: '655', label: 'Banco Votorantim (BV)' },
  { code: '041', label: 'Banrisul' },
  { code: '070', label: 'BRB — Banco de Brasília' },
  { code: '389', label: 'Banco Mercantil do Brasil' },
  { code: '422', label: 'Banco Safra' },
  { code: '633', label: 'Banco Rendimento' },
  { code: '643', label: 'Banco Pine' },
  { code: '735', label: 'Banco Neon' },
  { code: '208', label: 'Banco BTG Pactual' },
  { code: '318', label: 'Banco BMG' },
  { code: '623', label: 'Banco Pan' },
  { code: '739', label: 'Banco Cetelem' },
  { code: '743', label: 'Banco Semear' },
  { code: '399', label: 'HSBC Bank Brasil' },
  { code: '021', label: 'Banestes' },
  { code: '037', label: 'Banpará' },
  { code: '004', label: 'Banco do Nordeste' },
  { code: '003', label: 'Banco da Amazônia' },
  { code: '380', label: 'PicPay' },
  { code: '323', label: 'Mercado Pago' },
  { code: '290', label: 'PagSeguro (PagBank)' },
  { code: '102', label: 'XP Investimentos' },
  { code: '461', label: 'Asaas' },
  { code: '332', label: 'Acesso Soluções de Pagamento' },
].map(b => ({ id: b.code, code: b.code, label: b.label }))

// ─── Labels / opts ────────────────────────────────────────────────────────────

export const TIPO_CONTA_LABEL: Record<TipoContaBancaria, string> = {
  corrente:  'Conta Corrente',
  poupanca:  'Conta Poupança',
  aplicacao: 'Aplicação Financeira',
  caixa:     'Caixa Interno (Espécie)',
}

export const TIPO_CONTA_OPTS = [
  { value: '',          label: 'Selecione' },
  { value: 'corrente',  label: 'Conta Corrente' },
  { value: 'poupanca',  label: 'Conta Poupança' },
  { value: 'aplicacao', label: 'Aplicação Financeira' },
  { value: 'caixa',     label: 'Caixa Interno (Espécie)' },
]

export const SIM_NAO_OPTS = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
]

export const TIPO_BOLETO_OPTS = [
  { value: '',        label: 'Selecione' },
  { value: 'cnab240', label: 'CNAB 240' },
  { value: 'cnab400', label: 'CNAB 400' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function bancoLabel(code: string): string {
  return BANCOS_FEBRABAN.find(b => b.code === code)?.label ?? code
}

export function contaInvestimentoLabel(conta: ContaBancaria): string {
  return `${conta.sigla} — ${conta.descricao} (${bancoLabel(conta.banco)})`
}

/** Contas que outra conta pode referenciar em "Conta Investimento Vinculada" (exclui a si mesma). */
export function opcoesContaInvestimento(all: ContaBancaria[], selfId?: number): ContaBancaria[] {
  return all.filter(c => c.id !== selfId && (c.tipo === 'aplicacao' || c.tipo === 'caixa'))
}

export function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
