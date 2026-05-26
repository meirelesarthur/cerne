import type { EstoqueInicial } from './estoques-iniciais.types'

function make(
  id: number,
  produtoId: number,
  produtoDescricao: string,
  produtoCodigo: string,
  unidade: string,
  armazemId: number,
  armazemDescricao: string,
  qtdeTotal: number,
  vlUnitario: number,
  dtMovimento: string,
  loteFornecedor: string = '',
  dtValidade: string = '',
  classificacao: string = '',
  bebida: string = '',
): EstoqueInicial {
  const valorTotal = qtdeTotal * vlUnitario
  const custoMedioUnit = qtdeTotal > 0 ? valorTotal / qtdeTotal : 0
  return {
    id, produtoId, produtoDescricao, produtoCodigo, unidade,
    armazemId, armazemDescricao, qtdeTotal, vlUnitario,
    valorTotal, custoMedioUnit, dtMovimento,
    loteFornecedor, dtValidade, classificacao, bebida,
  }
}

export const mockEstoquesIniciais: EstoqueInicial[] = [
  make(1,  3,  'HERBICIDA GLIFOSATO 480 G/L',          '00234', 'L',  1, 'Armazém Insumos Trindade',    300.000, 18.9000, '2025-10-01', 'LOT-GLI-2510', '2027-10-01'),
  make(2,  3,  'HERBICIDA GLIFOSATO 480 G/L',          '00234', 'L',  2, 'Armazém Insumos Ração',        80.000, 18.9000, '2025-10-15', 'LOT-GLI-2511', '2027-10-15'),
  make(3,  5,  'ADUBO FORMULADO NPK 00-20-20',         '01102', 'sc', 1, 'Armazém Insumos Trindade',    120.000, 225.0000, '2025-11-05', '', ''),
  make(4,  6,  'ADUBO UREIA 46%',                      '01203', 'sc', 1, 'Armazém Insumos Trindade',     85.000, 175.0000, '2025-11-10', '', ''),
  make(5,  7,  'ÓLEO DIESEL S-10 GRANEL',              '02001', 'L',  4, 'Tanque Combustível Trindade', 4500.000,  5.9000, '2025-10-20', '', ''),
  make(6,  8,  'ÓLEO MOTOR SAE 15W40 MINERAL',         '02100', 'L',  1, 'Armazém Insumos Trindade',     60.000, 22.5000, '2025-11-01', '', ''),
  make(7,  14, 'CLORETO DE POTÁSSIO — GRANULADO',      '05001', 'sc', 1, 'Armazém Insumos Trindade',    200.000, 195.0000, '2025-11-20', '', ''),
  make(8,  4,  'FUNGICIDA OPERA 500 EC',               '00891', 'L',  1, 'Armazém Insumos Trindade',     45.000, 110.0000, '2025-12-01', 'LOT-OPE-2512', '2027-12-01'),
  make(9,  11, 'INSETICIDA KARATE ZEON 50 CS',         '04100', 'L',  1, 'Armazém Insumos Trindade',     32.000,  95.0000, '2025-12-05', 'LOT-KAR-2512', '2027-06-01'),
  make(10, 9,  'SEMENTE SOJA BMX POTÊNCIA RR — SC 40KG', '03050', 'sc', 3, 'Armazém Produção Trindade',  500.000, 380.0000, '2025-10-10', 'LOT-SOJ-2510', '2026-08-01'),
  make(11, 10, 'SEMENTE SOJA TMG 7062 IPRO — SC 50KG', '03051', 'sc', 3, 'Armazém Produção Trindade',   300.000, 420.0000, '2025-10-12', 'LOT-TMG-2510', '2026-08-01'),
  make(12, 15, 'LUBRIFICANTE TRANSMISSÃO JOHN DEERE HY-GARD', '05100', 'L', 1, 'Armazém Insumos Trindade', 40.000, 38.0000, '2025-12-10', '', ''),
  make(13, 13, 'CORREIA POLY-V 6PK 1860 — COLHEITADEIRA', '04251', 'un', 1, 'Armazém Insumos Trindade',   4.000, 320.0000, '2025-11-28', '', ''),
  make(14, 12, 'PARAFUSO SEXTAVADO M12 X 40 ZINCADO',  '04250', 'un', 1, 'Armazém Insumos Trindade',    200.000,   1.2000, '2026-01-08', '', ''),
  make(15, 16, 'NUTRIUREIA 15 PLUS FOLIAR',            '01500', 'L',  2, 'Armazém Insumos Ração',       150.000,  42.0000, '2026-01-15', '', ''),
  make(16, 17, 'MINERAL 80 BOVINOS CORTE',             '02500', 'sc', 2, 'Armazém Insumos Ração',        90.000,  88.0000, '2025-12-20', '', ''),
  make(17, 18, 'MILHO GRÃOS SAFRA 24/25',              '06001', 'sc', 3, 'Armazém Produção Trindade',  1200.000,  72.0000, '2026-02-01', '', ''),
  make(18, 19, 'SOJA SAFRA 24/25 — GRANEL',            '06002', 'sc', 3, 'Armazém Produção Trindade',   800.000, 118.0000, '2026-02-10', '', ''),
  make(19, 20, 'CALCÁRIO DOLOMÍTICO FILLER',           '01800', 'sc', 1, 'Armazém Insumos Trindade',    350.000,  28.0000, '2026-01-20', '', ''),
  make(20, 21, 'HERBICIDA 2,4-D AMINA 720 G/L',        '00300', 'L',  1, 'Armazém Insumos Trindade',     75.000,  14.5000, '2026-01-25', 'LOT-24D-2601', '2028-01-01'),
  make(21, 22, 'FUNGICIDA FOX XPRO EC',                '00950', 'L',  1, 'Armazém Insumos Trindade',     28.000, 145.0000, '2026-02-05', 'LOT-FOX-2602', '2028-02-01'),
  make(22, 23, 'SULFATO DE AMÔNIO GRANULADO',          '01400', 'sc', 1, 'Armazém Insumos Trindade',    160.000,  98.0000, '2026-02-15', '', ''),
  make(23, 24, 'ÓLEO MINERAL AGRÍCOLA ASSIST',         '02200', 'L',  1, 'Armazém Insumos Trindade',     55.000,  12.8000, '2026-03-01', '', ''),
  make(24, 7,  'ÓLEO DIESEL S-10 GRANEL',              '02001', 'L',  4, 'Tanque Combustível Trindade', 2000.000,  5.9500, '2026-03-10', '', ''),
  make(25, 25, 'ADUBO KCL VERMELHO GRANULADO',         '01700', 'sc', 2, 'Armazém Insumos Ração',       110.000, 185.0000, '2026-03-15', '', ''),
]
