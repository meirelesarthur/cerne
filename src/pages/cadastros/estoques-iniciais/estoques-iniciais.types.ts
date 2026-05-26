export interface EstoqueInicial {
  id: number
  produtoId: number
  produtoDescricao: string
  produtoCodigo: string
  unidade: string
  armazemId: number
  armazemDescricao: string
  qtdeTotal: number
  vlUnitario: number
  valorTotal: number       // computed: qtdeTotal × vlUnitario
  custoMedioUnit: number   // computed: valorTotal ÷ qtdeTotal
  dtMovimento: string      // ISO date string
  loteFornecedor: string   // empty string if N/A
  dtValidade: string       // empty string if N/A
  classificacao: string    // empty string if N/A
  bebida: string           // empty string if N/A
}
