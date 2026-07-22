// ─── Taxonomia de Categorias Financeiras ───────────────────────────────────────
// Fonte única da árvore de categorias de receitas/despesas do agronegócio,
// usada como vínculo N:N em Centros de Custo e no Plano de Contas — nunca
// duplicar essa lista localmente em cada tela (Lei 2).

export interface CatItem {
  id:    string
  label: string
}

export interface Categoria {
  id:       string
  label:    string
  children: CatItem[]
}

const RAW: [string, string[]][] = [
  ['RECEITAS DA AGRICULTURA', ['Venda de Grãos', 'Venda de Frutas', 'Venda de Hortifrutigranjeiro', 'Venda de Forragens', 'Venda de Madeira']],
  ['RECEITAS DE SUBPRODUTOS DA AGRICULTURA', ['Venda de Moagem de Produtos Agrícolas', 'Venda de Farinha/Farelo', 'Venda de Sementes', 'Venda de Mudas', 'Venda de Derivados Frutas', 'Venda de Derivados Plantio']],
  ['RECEITAS DA PECUÁRIA', ['Venda de Matrizes', 'Venda de Bezerros', 'Venda de Bezerras', 'Venda de Novilhas', 'Venda de Boi Magro', 'Venda de Boi Gordo', 'Venda de Touros', 'Venda de Vacas Descarte', 'Venda de Touros Descarte', 'Venda de Leite']],
  ['RECEITAS DE SUBPRODUTOS DA PECUÁRIA', ['Venda de Sêmen Touros', 'Venda de Óvulos Matrizes', 'Venda de Embriões']],
  ['RECEITAS PISCICULTURA', ['Venda de Alevinos', 'Venda de Junevis', 'Venda de Peixes']],
  ['RECEITAS AVICULTURA', ['Venda de Frango', 'Venda de Ovos', 'Venda de Cama de Aviário', 'Venda Galinha Descarte', 'Venda de Pintinhos']],
  ['RECEITAS SUINOCULTURA', ['Venda de Suínos Matrizes', 'Venda de Leitões Recria', 'Venda de Suínos Terminados', 'Venda de Dejetos/Composto']],
  ['RECEITAS DA OVINOCULTURA', ['Venda de Ovelha + 24 meses', 'Venda de Borrega 13 a 24 meses', 'Venda de Borrega 07 a 12 meses', 'Venda Cordeiro até 6 meses', 'Venda Cordeira até 6 meses', 'Venda de Borrego 07 a 12 meses', 'Venda de Borrego 13 a 24 meses', 'Venda de Carneiros/Rufiões', 'Venda de Esterco']],
  ['RECEITAS DA CAPRINOCULTURA', ['Venda de Cabra', 'Venda de Cabrita Recria', 'Venda de Cabrita', 'Venda de Cabrito', 'Venda de Cabrito Recria', 'Venda de Cabrito Terminação', 'Venda de Bode/Rufiões', 'Venda de Esterco']],
  ['OUTRAS RECEITAS DA ATIVIDADE', ['Prestação de Serviços', 'Parceria Agrícola/Pecuária', 'Arrendamento Agrícola/Pecuária', 'Venda Insumos Agrícola ou Pecuário', 'Crédito Tributário', 'Descontos Recebidos', 'Receitas Apropriar']],
  ['RECEITA DE EMPRÉSTIMOS', ['Empréstimo Investimento', 'Empréstimo Custeio Agrícola', 'Empréstimo Custeio Pecuário', 'Empréstimo Particular', 'Adiantamento de Crédito de Produto', 'Cédula Produtor Rural', 'Aplicações Compulsórias', 'Pré Comercialização']],
  ['RECEITA DE APORTE DE CAPITAL', ['Aporte de Capital Próprio', 'Aporte de Capital Terceiros']],
  ['RECEITA DE RENDIMENTOS FINANCEIROS', ['Rendimento Aplicações', 'Juros Recebidos']],
  ['RECEITA DE AJUSTE DIÁRIO - CREDITADO', ['Bolsa Mercado Futuro']],
  ['RECEITA DE VENDA DE IMOBILIZADO', ['Venda Máquinas/Veículos/Implementos', 'Venda de Terras/Benfeitorias/Instalações', 'Venda Equipamentos/Utensílios', 'Venda de outros Imobilizados']],
  ['DESPESAS ADMINISTRATIVAS', ['Energia Elétrica Administração', 'Telefone/Internet', 'Aluguéis', 'Água/Esgoto Administração', 'Brindes/Cortesias', 'Viagens/Diárias', 'Treinamento Mão de Obra', 'Softwares', 'Material de Limpeza/Higiene', 'Uniforme Funcionários Administrativos', 'Assinatura de Jornais e Revistas', 'Diversos Administrativo', 'Correios e Entregas', 'Material de Escritório', 'Manutenção de Infraestrutura Adm', 'Eventos', 'Materiais Construção']],
  ['PRODUTOS PARA REVENDA', ['Produtos Revenda', 'Frutas Revenda', 'Grãos Revenda']],
  ['MANUTENÇÕES BENFEITORIAS/INSTALAÇÕES', ['Manutenções de Construções/Edificações', 'Manutenções de Cochos/Bebedouros', 'Manutenções de Cercas Conv/Elétrica', 'Manutenções de Currais/Troncos/Bretes', 'Manutenções de Represas/Barragens']],
  ['MANUTENÇÕES DE MÁQUINAS/IMPLEMENTOS', ['Manutenções de Tratores/Pulverizadores', 'Manutenções de Colheitadeiras', 'Manutenções de Implementos Agrícolas', 'Manutenções de Equipamentos Agrícolas', 'Manutenções de Equip de Irrigação', 'Peças/Pneus Máq/Implementos', 'Serv. Mecânicos Máq/Implementos']],
  ['MANUTENÇÕES DE VEÍCULOS/MOTOS', ['Manutenções de Carros/Camionetes', 'Manutenções de Motos/Triciclos', 'Manutenções de Caminhões/Ônibus', 'Peças/Pneus Veículos/Motos', 'Serv. Mecânicos Veículos/Motos']],
  ['COMBUSTÍVEIS/LUBRIFICANTES', ['Óleo Diesel', 'Gasolina/Etanol', 'Óleo Lubrificante']],
  ['ARRENDAMENTOS AGRICULTURA/PECUÁRIA', ['Arrendamento Área Agricultura', 'Arrendamento Área Pecuária']],
  ['SERVIÇOS DE TERCEIROS', ['Assistência Técnica/Consultoria', 'Assistência Jurídica', 'Assistência Contábil', 'Assistência Ambiental', 'Aluguel Máquinas/Implementos de Terceiro', 'Frete', 'Serviços Veterinários', 'Serviços Agronômicos', 'Seguros']],
  ['IMPOSTOS SOBRE VENDAS', ['Imposto - PIS', 'Imposto - COFINS', 'Imposto - ICMS', 'Imposto - ISS', 'Imposto - FUNRURAL/Receita Bruta', 'Imposto - SIMPLES NACIONAL']],
  ['IMPOSTOS/TRIBUTOS', ['Contribuição Social – CSLL', 'Imposto de Renda - IRPJ', 'Imposto de Renda - IRPF', 'Imposto Territorial Rural - ITR', 'FUNRURAL', 'IPVA', 'IPTU', 'Impostos Operações Financeiras']],
  ['DESPESAS COM COMERCIALIZAÇÃO', ['Comissão e Corretagem', 'Armazenagem Terceiros', 'Marketing', 'Eventos', 'Patrocínios']],
  ['TARIFAS/MULTAS/TAXAS', ['Contribuições/Taxas', 'Tarifas Bancárias', 'Anuidades Sindicato/Conselho Regional', 'Multas']],
  ['MÃO DE OBRA', ['Salários Permanentes', 'Produção/Funcionário', 'Férias', '13º Salário', 'GPS/INSS', 'FGTS', 'IRPF - Funcionários', 'Rescisões', 'Bonificações', 'Cesta Básica', 'EPI / Uniforme', 'Saúde Ocupacional', 'Transporte de Pessoal', 'Seguro de Vida', 'Outras Despesas com Pessoal', 'Alimentação / Cantina', 'Contribuição Confederativa / Sindicato', 'Diaristas / Empreitadas (Operacionais)', 'Imposto - FUNRURAL/Folha de Salários']],
  ['PRÓ-LABORE', ['Pró-labore']],
  ['ANÁLISES AGRÍCOLAS', ['Análise de Macronutrientes', 'Análise de Micronutrientes', 'Análise Foliar', 'Análise Solo Completa']],
  ['CORRETIVOS SOLO', ['Calcário Agrícola', 'Gesso Agrícola']],
  ['FERTILIZANTES AGRÍCOLAS', ['Adubos Formulados', 'Adubos Orgânicos', 'Adubos Foliares']],
  ['PLANTIO', ['Sementes', 'Mudas', 'Inoculantes/Micronutrientes', 'Tratamento de Sementes Industrial']],
  ['DEFENSIVOS AGRÍCOLAS', ['Formicidas', 'Fungicidas', 'Herbicidas', 'Inseticidas', 'Acaricida', 'Adjuvante', 'Defensivos Biológicos', 'Óleos/Espalhantes/Aditivos Agrícolas', 'Outros Defensivos Químicos']],
  ['ÁGUA IRRIGAÇÃO', ['Água K1', 'Água K2', 'Água Pivô']],
  ['ENERGIA ELÉTRICA PRODUÇÃO', ['Energia Irrigação', 'Energia Packing House']],
  ['NUTRIÇÃO ANIMAL', ['Sal Mineral', 'Proteinado', 'Proteico Energético', 'Concentrados', 'Aditivos Concentrados', 'Grãos Proteicos', 'Grãos Energéticos', 'Farelo Proteico', 'Farelo Energético', 'Ração Comercial', 'Volumoso']],
  ['SANIDADE ANIMAL', ['Medicamentos Preventivos', 'Medicamentos Curativos', 'Vacinas', 'Vermífugos/Carrapaticidas / Mosquicidas', 'Exames']],
  ['REPRODUÇÃO ANIMAL', ['Sêmen', 'Nitrogênio', 'Materiais Inseminação', 'Transferência de Embriões', 'Hormônios Reprodutivos', 'Protocolos Reprodutivos']],
  ['PRODUÇÃO DE VOLUMOSO', ['Silagem de Milho', 'Silagem de Sorgo', 'Silagem de Capim', 'Feno de Capim', 'Manutenção de Pastagens', 'Manutenção de Palma Forrageira', 'Manutenção de Capineira', 'Manutenção de Canavial']],
  ['IDENTIFICAÇÃO ANIMAL', ['Brincos', 'Marcadores', 'Rastreadores']],
  ['MANEJO DOS ANIMAIS', ['Ferramentas/Utensílios/Equipamentos']],
  ['REPOSIÇÃO DE ANIMAIS', ['Compra Animais Recria/Custeio']],
  ['ÁGIO KG/ARROBA', ['Ágio Arroba Bezerro', 'Ágio Arroba Boi Magro', 'Ágio Arroba Novilha', 'Ágio Arroba Vaca Magra', 'Ágio Kg']],
  ['INSUMOS DIVERSOS', ['Sacaria Frutas', 'Madeira Estaqueamento']],
  ['DESPESAS DIVERSAS', ['Outras Despesas Produção', 'Despesas Custeio/Apropriar']],
  ['JUROS PAGOS', ['Juros de Custeio', 'Juros de Investimentos', 'Juros de Cheque Especial', 'Juros Diversos']],
  ['INVESTIMENTOS EM ANIMAIS', ['Aquisição de Matrizes', 'Aquisição de Reprodutores', 'Aquisição Animais Recria/Investimento', 'Aquisição Animais de Serviço']],
  ['INVESTIMENTO INSTALAÇÕES/CULTURAS PERENE', ['Invest Construções/Edificações', 'Invest Instalações/Centros de Manejo', 'Invest Culturas Permanentes/Perenes', 'Invest Formação de Pastagens', 'Invest Formação de Canavial', 'Invest Formação de Capineira', 'Invest Móveis/Equip/Utensílios']],
  ['INVESTIMENTO MÁQ/VEÍC/IMPLEMENT/EQUIP', ['Invest Tratores/Colheitadeiras', 'Invest Implementos/Equipamentos Agríc', 'Invest Veículos Automotores', 'Invest Equipamentos de Irrigação']],
  ['INVESTIMENTO TERRAS/PREVIDÊNCIA/FUNDOS', ['Terras de Pecuária', 'Terras de Agricultura', 'Previdência Privada', 'Títulos de Capitalização', 'Despesas Investimento/Apropriar']],
  ['AMORTIZAÇÕES', ['Amortização Empréstimo Custeio', 'Amortização Empréstimo Investimento', 'Amortização Empréstimo Particular', 'Amortização Empréstimo Capital de Giro', 'Pgto Cédula Produtor Rural', 'Pgto Aplicações Compulsórias', 'Pgto Financiamento de Imobilizado', 'Pgto Pré Comercialização', 'Pgto Adiant de Crédito de Produto']],
  ['DISTRIBUIÇÃO DE LUCRO/SÓCIOS', ['Distribuição dos Lucros Sócios', 'Antecipação da Distribuição dos Lucros']],
  ['AJUSTE DIÁRIO - DEBITADO', ['Operações/Negociações - Mercado Futuro']],
  ['MOVIMENTAÇÃO BANCÁRIA', ['Movimento Entre Contas Bancárias/Caixa', 'Saldo Inicial de Conta (Bancos/Caixa)', 'Devolução', 'Contabilidade', 'Estorno/Recebimento Indevido', 'Resgate/Aplicação Bancária']],
]

export const CATEGORIAS_FINANCEIRAS_TREE: Categoria[] = RAW.map(([label, subs], i) => ({
  id: `cat-${i + 1}`,
  label,
  children: subs.map((sub, j) => ({ id: `cat-${i + 1}-${j + 1}`, label: sub })),
}))
