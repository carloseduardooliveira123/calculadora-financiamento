/* ==============================================================
   PARAMETROS DE FINANCIAMENTO — FONTE UNICA DA VERDADE
   Lido pelas DUAS ferramentas:
     - index.html            (Calculadora de Financiamento)
     - imovel/index.html     (Poder de Compra / imovel em vista)
   O robo semanal do GitHub Actions atualiza ESTE arquivo.
   Nao altere numeros sem fonte oficial e datada.
   ============================================================== */

// Data da ultima verificacao (aparece no rodape das duas ferramentas)
const DATA_VERIFICACAO = '13/09/2026';

// WhatsApp do Cal (usado pelas duas ferramentas)
const WHATSAPP_CAL = '5547999001754';

// Custos de aquisicao (% sobre o valor do imovel): ITBI Brusque/SC + registro/escritura
const CUSTOS_AQUISICAO = { itbi: 2.0, registro: 1.0 };

// Comprometimento maximo da renda com a parcela (regra de mercado: 30%)
const COMPROMETIMENTO_MAX = 0.30;

// Juros maximos da Faixa 4 do MCMV (Portaria MCID 333/2026)
const MCMV_TAXA_F4 = 9.9;

        // Parâmetros MCMV — vigentes em junho/2026 (reforma 2026, aceita imóvel novo e usado)
        const MCMV_FAIXAS = [
            { faixa: 1, rendaMax: 3200,  tetoImovel: 264000, subsidio: 'Subsídio direto do governo' },
            { faixa: 2, rendaMax: 5000,  tetoImovel: 264000, subsidio: 'Subsídio direto do governo' },
            { faixa: 3, rendaMax: 9600,  tetoImovel: 400000, subsidio: 'Sem subsídio, mas com taxas reduzidas' },
            { faixa: 4, rendaMax: 13000, tetoImovel: 600000, subsidio: 'Classe média — novidade 2026 (entrada mín. 20%)' }
        ];

        // Teto do SFH elevado para R$ 2,25 milhões pelo CMN em 2026 (uso de FGTS até esse valor)
        const TETO_SFH = 2250000;

        // Lote urbanizado (terreno puro) — confirmado no SIMULADOR OFICIAL da Caixa
        // (jul/2026, modalidade "SBPE - Aquisição de Lote Urbanizado - Balcão"):
        // cota máxima 80%, prazo máx. 240 meses, sistema SAC/TR, juros nominais
        // ~12,73% a.a. (efetivos ~13,50%), SEM uso de FGTS e FORA do MCMV.
        const TERRENO = { ltv: 80, prazoMax: 240, limiteMax: 1500000, valorMin: 50000, taxaNominal: 12.73, cetEfetivo: 13.50 };

        // ltvNovo / ltvUsado refletem a distinção novo x usado do briefing
        const BANCOS = {
            CAIXA: {
                nome: 'Caixa Econômica Federal', taxa: 10.26, ltvNovo: 90, ltvUsado: 80,
                prazoMax: 420, limiteMax: 2250000, mcmv: true, renda_min: 0, terreno: true, terrenoLtv: 80,
                detalhes: {
                    tipo_taxa: 'TR',
                    mcmv_info: 'Principal operador MCMV — F1: 4,00-4,25% | F2: 4,75-7,00% | F3: 8,16% | F4: até 9,90%',
                    diferenciais: 'Menor taxa do mercado, líder MCMV, aceita FGTS (imóveis até R$ 2,25 mi)'
                }
            },
            BRB: {
                nome: 'BRB - Banco de Brasília', taxa: 11.36, ltvNovo: 80, ltvUsado: 80,
                prazoMax: 420, limiteMax: 2250000, mcmv: false, renda_min: 0,
                detalhes: { tipo_taxa: 'TR', mcmv_info: 'Não confirmado', diferenciais: '2ª menor taxa do mercado, banco público regional' }
            },
            ITAU: {
                nome: 'Itaú Unibanco', taxa: 11.99, ltvNovo: 90, ltvUsado: 80,
                prazoMax: 420, limiteMax: 2250000, mcmv: false, renda_min: 0,
                detalhes: { tipo_taxa: 'TR', mcmv_info: 'Previsão 2º semestre 2026 (foco Faixa 4)', diferenciais: 'Aprovação digital rápida' }
            },
            BRADESCO: {
                nome: 'Bradesco', taxa: 11.45, ltvNovo: 80, ltvUsado: 80,
                prazoMax: 420, limiteMax: 2250000, mcmv: false, renda_min: 0, terreno: true, terrenoLtv: 70,
                detalhes: { tipo_taxa: 'TR ou Poupança Mais', mcmv_info: 'Não confirmado', diferenciais: 'Pula Parcela (1x/ano), financia custos de cartório' }
            },
            SANTANDER: {
                nome: 'Santander', taxa: 11.69, ltvNovo: 80, ltvUsado: 80,
                prazoMax: 420, limiteMax: 2250000, mcmv: false, renda_min: 0,
                detalhes: { tipo_taxa: 'TR', mcmv_info: 'Não confirmado', diferenciais: 'Composição de renda até 3 pessoas sem vínculo familiar' }
            },
            BB: {
                nome: 'Banco do Brasil', taxa: 11.60, ltvNovo: 90, ltvUsado: 80,
                prazoMax: 420, limiteMax: 2250000, mcmv: true, renda_min: 0,
                detalhes: { tipo_taxa: 'TR', taxa_pro_cotista: '9,00% a.a. + TR (com FGTS)', mcmv_info: 'Participa do MCMV', diferenciais: 'Pró-Cotista 9% a.a.' }
            },
            INTER: {
                nome: 'Banco Inter', taxa: 13.76, ltvNovo: 80, ltvUsado: 70,
                prazoMax: 360, limiteMax: 2250000, mcmv: false, renda_min: 0,
                detalhes: {
                    tipo_taxa: 'IPCA', taxa_alternativa: '9,5% a.a. + IPCA', mcmv_info: 'Não confirmado',
                    diferenciais: '100% digital', aviso: 'Taxa indexada ao IPCA pode variar muito com a inflação!'
                }
            },
            SICREDI: {
                nome: 'Sicredi', taxa: 10.50, ltvNovo: 90, ltvUsado: 80,
                prazoMax: 420, limiteMax: 1500000, mcmv: true, renda_min: 0,
                detalhes: { tipo_taxa: 'Varia por cooperativa', mcmv_info: 'Participa do MCMV', diferenciais: 'Cooperativa (necessário ser associado), LTV até 90%' }
            },
            SICOOB: {
                nome: 'Sicoob', taxa: 10.50, ltvNovo: 90, ltvUsado: 80,
                prazoMax: 420, limiteMax: 1500000, mcmv: true, renda_min: 0, terreno: true, terrenoLtv: 80,
                detalhes: { tipo_taxa: 'Varia por cooperativa', mcmv_info: 'Participa do MCMV', ltv_pro_cotista: 'Pró-Cotista SAC: até 90%', diferenciais: 'Cooperativa, composição de renda até 3 pessoas' }
            },
            VIACREDI: {
                nome: 'Viacredi (Ailos)', taxa: 10.20, ltvNovo: 90, ltvUsado: 70,
                prazoMax: 420, limiteMax: 350000, mcmv: true, renda_min: 0,
                detalhes: {
                    tipo_taxa: 'TR', taxa_mcmv: '4,25-8,16% a.a. + TR (varia por faixa)',
                    mcmv_info: 'Foco em imóveis novos no limite MCMV',
                    diferenciais: 'Cooperativa Ailos'
                }
            }
        };
