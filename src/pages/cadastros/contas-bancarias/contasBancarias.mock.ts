import type { ContaBancaria } from './contasBancarias.types'

export const mockContasBancarias: ContaBancaria[] = [
  {
    id: 1, banco: '001', agencia: '1234-5', conta: '56789-0',
    usaNoLivroCaixa: 'sim', tipo: 'corrente', sigla: 'BB-CC', descricao: 'Banco do Brasil — Conta Movimento',
    emiteBoleto: 'sim', proprietarios: [1], limite: 50000,
    ativo: 'sim', carteira: '17', convenioCodBeneficiario: '1234567', tipoBoleto: 'cnab240',
    contaInvestimentoVinculadaId: 3, fazendasVinculadas: ['1', '2'],
    saldo: 128450.32, dataCriacao: '2026-01-05', usuarioCriacao: 'Silvio Ventura',
  },
  {
    id: 2, banco: '341', agencia: '0021', conta: '11223-4',
    usaNoLivroCaixa: 'sim', tipo: 'corrente', sigla: 'ITAU-CC', descricao: 'Itaú Unibanco — Conta Corrente',
    emiteBoleto: 'nao', proprietarios: [1, 2], limite: 20000,
    ativo: 'sim', carteira: '', convenioCodBeneficiario: '', tipoBoleto: '',
    contaInvestimentoVinculadaId: null, fazendasVinculadas: ['1'],
    saldo: 54300.10, dataCriacao: '2026-01-06', usuarioCriacao: 'Silvio Ventura',
  },
  {
    id: 3, banco: '001', agencia: '1234-5', conta: '98765-1',
    usaNoLivroCaixa: 'nao', tipo: 'aplicacao', sigla: 'BB-CDB', descricao: 'Banco do Brasil — CDB Liquidez Diária',
    emiteBoleto: 'nao', proprietarios: [1], limite: 0,
    ativo: 'sim', carteira: '', convenioCodBeneficiario: '', tipoBoleto: '',
    contaInvestimentoVinculadaId: null, fazendasVinculadas: [],
    saldo: 312800.00, dataCriacao: '2026-01-07', usuarioCriacao: 'Silvio Ventura',
  },
  {
    id: 4, banco: '104', agencia: '3311', conta: '00456-7',
    usaNoLivroCaixa: 'sim', tipo: 'corrente', sigla: 'CEF-CC', descricao: 'Caixa Econômica Federal — Conta Corrente',
    emiteBoleto: 'sim', proprietarios: [3], limite: 15000,
    ativo: 'sim', carteira: '025', convenioCodBeneficiario: '7654321', tipoBoleto: 'cnab400',
    contaInvestimentoVinculadaId: null, fazendasVinculadas: ['2', '3'],
    saldo: 8900.75, dataCriacao: '2026-01-08', usuarioCriacao: 'Silvio Ventura',
  },
  {
    id: 5, banco: '756', agencia: '4021', conta: '778-9',
    usaNoLivroCaixa: 'sim', tipo: 'caixa', sigla: 'SICOOB-CX', descricao: 'Sicoob — Caixa Interno da Sede',
    emiteBoleto: 'nao', proprietarios: [], limite: 0,
    ativo: 'nao', carteira: '', convenioCodBeneficiario: '', tipoBoleto: '',
    contaInvestimentoVinculadaId: null, fazendasVinculadas: ['1'],
    saldo: 0, dataCriacao: '2026-01-09', usuarioCriacao: 'Silvio Ventura',
  },
  {
    id: 6, banco: '077', agencia: '0001', conta: '334455-6',
    usaNoLivroCaixa: 'sim', tipo: 'poupanca', sigla: 'INTER-PP', descricao: 'Banco Inter — Poupança Reserva',
    emiteBoleto: 'nao', proprietarios: [2], limite: 0,
    ativo: 'sim', carteira: '', convenioCodBeneficiario: '', tipoBoleto: '',
    contaInvestimentoVinculadaId: null, fazendasVinculadas: [],
    saldo: 42750.20, dataCriacao: '2026-01-10', usuarioCriacao: 'Silvio Ventura',
  },
]
