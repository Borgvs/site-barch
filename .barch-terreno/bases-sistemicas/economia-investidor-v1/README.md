# Economia da aquisição · política e fontes

Base preparada em 30/09/2026 para avaliação preliminar da compra, manutenção e saída da terra. A avaliação de mercado, o preço pedido e o teto do investidor permanecem distintos. Não dimensiona produto, empreendimento ou uma aprovação de compra.

## Arquivos e responsabilidades

- `fontes-manifesto.json`: origem, URL, data, bytes e SHA de nove fontes públicas. As capturas estão em `fontes/`, com nomes pelo SHA. O material integral é acervo privado, sem publicação do corpus bruto.
- `sc-emolumentos-2026.json`: extração das 21 faixas de escritura e 21 de registro, selos e regra excedente. O leitor confere o SHA da extração revisada e seu vínculo com a circular do TJSC.
- `sc-teto-2026-trechos.json`: página da Resolução GP 71/2025 e valores da TSJ de 2026.
- `brumadinho-itbi-trechos.json`: página do art. 170 do código municipal. Trata-se de referência histórica; falta comprovar consolidação vigente ou guia atual.
- `politica-investidor.json`: prêmio, margem de negociação, provisões, regime candidato e faixas de estresse. São parâmetros internos editáveis, separados das alíquotas e tabelas oficiais. `ruleSourceSha256` vincula a regra fiscal à captura efetivamente analisada; uma nova captura divergente impede reuso silencioso da regra antiga.
- `../../automacoes/curar-economia-investidor.mjs`: consulta primeiro o acervo e reaproveita bytes conferidos por até 30 dias. `--refresh` consulta novamente a lista fixa de fontes primárias. Captura nova não homologa automaticamente regra fiscal.
- `../../integracoes/investor-acquisition.mjs`: leitor de fontes, sugestão inicial e cálculo paramétrico. Usa o mesmo ledger da aquisição e o VPL do motor financeiro canônico, conferido pelo adaptador.

## Referências e aplicação

| Elemento | Referência | Uso no ensaio |
|---|---|---|
| ITBI Itajaí | [1º Tabelionato de Itajaí](https://www.tabelionatoitajai.com.br/compra-e-venda/) | 2% na compra comum; base inicial é preço da transação declarado, com override fiscal explícito |
| ISS e FRJ Itajaí | [Tabela e encargos do tabelionato](https://www.tabelionatoitajai.com.br/tabela-de-emolumentos/) | ISS de 2% sobre emolumentos; FRJ de 22,73%; um selo por ato |
| Emolumentos SC 2026 | [Circular CGJ 643/2025](https://www.tjsc.jus.br/documents/d/corregedoria-geral-da-justica/circularcgj643-2025-pdf) | Faixa do ato, acréscimos de R$ 50 por bloco iniciado de R$ 50 mil e teto por ato; orçamento sujeito à guia do cartório competente |
| Teto da TSJ SC 2026 | [Diário de Justiça 4592 · Resolução GP 71/2025](https://busca.tjsc.jus.br/dje-consulta/rest/diario/caderno?cdCaderno=4&edicao=4592) | 80% de R$ 7.080,89 como limite dos emolumentos excedentes por ato |
| ITBI São Paulo | [Fazenda municipal](https://smartsampa.prefeitura.sp.gov.br/web/fazenda/w/servicos/itbi/2513) | 3% na compra comum; sem enquadramento SFH presumido |
| ITBI Brumadinho | [Código tributário municipal, art. 170](https://s3-apps-01.mgdata.com.br/portalbrumadinho/brumadinho/importacao/licitacoes/dlm_uploads/2019/01/2019-01-25_629108-lei-940-de-1997-codigo-tributario-lc-25-de-1997-ii.pdf) | Referência de 2%, explicitamente histórica; atualização necessária antes da contratação |
| Ganho de capital PF | [Receita Federal](https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/pagamento/ganhos-de-capital/aliquotas) | Reserva progressiva de 15%, 17,5%, 20% e 22,5% sobre parcelas de ganho; sem isenção presumida |
| Laudêmio | [SPU · terrenos de marinha](https://www.gov.br/gestao/pt-br/terrenos-de-marinha/terrenos-de-marinha/) | Consulta de condição e responsabilidade; não presume terreno de marinha em Salseiros, nem atribui ao comprador encargo do vendedor |
| Notas SP 2026 | [CNB/SP](https://cnbsp.org.br/tabelas-de-custas-e-emolumentos-padrao/) | Catálogo indexado; tarifas ainda não extraídas. Orçamento SP é provisão editável, sem aplicar tabela SC |

A Meta Selic vem do acervo já existente em `../valor-terreno-oportunidade-v1/referencias-capital`. O leitor reaplica `assessCapitalCache`: bytes, metadados, recibos, datas, unidade e projeção devem coincidir. A observação de 13,75% a.a. tem data efetiva de 30/09/2026; a resposta original com ponto futuro fica em quarentena. Não se utiliza IPCA mensal como taxa anual ou projeção de inflação. A dívida começa desligada; seu custo candidato é Selic + 6 p.p. (19,75% a.a. neste exemplo), provisão interna editável sem cotação ou crédito aprovado. Ativar dívida exige taxa positiva.

## Protocolo de execução

1. Conciliar sujeito, matrícula, inscrição, perímetro, cidade e regime territorial. Manter conflitos na fila operacional de verificação.
2. Conferir acervo Barch antes da busca externa. Identificar fontes faltantes ou vencidas e executar curadoria dirigida. Uma captura completa é referência, não atesto da regra ou do imóvel.
3. Separar oferta do próprio terreno, amostras de terra independentes, transações e referências de produto pronto. Não contar a mesma oferta em diferentes portais como evidência independente.
4. Preencher contexto de preço e custos. Sem preço de saída fundamentado ou explicitamente declarado, conservar taxas/custos conhecidos e pedir apenas o elemento faltante; não extrapolar lote varejista para uma gleba extensa.
5. Declarar comprador, fiscalidade, dívidas, regime de aquisição, quantidade de atos e custo fiscal. A hipótese inicial PF é uma reserva, não uma guia de imposto homologada. Uma SPE exige perfil fiscal próprio. Não aplicar isenções, depreciação, benefício da dívida ou regime imobiliário automaticamente.
6. Construir taxa com natureza, moeda e prazo explícitos. O padrão editável de Selic bruta + 8 p.p. é política interna nominal para terreno sem aprovação. Não atribuir ao prêmio autoridade legal, CAPM, beta ou calibração estatística. O uso de referência bruta sobre fluxo com reserva fiscal é uma convenção conservadora declarada; o comitê deve casar a alternativa líquida e o prazo antes de decisão definitiva.
7. Gerar dois fluxos: aquisição no pedido e aquisição na proposta condicionada. Manter saída nominal sem valorização implícita. Considerar carregamento em todos os meses, comissão e tributos de saída. Dívida, quando declarada, usa saques, juros e amortização distintos do fluxo do ativo.
8. Resolver teto de aquisição por bisseção recalculando ITBI, cartório e imposto sobre ganho a cada preço. Não reutilizar teto de fórmula linear com custos fiscais fixos quando o preço varia.
9. Produzir VPL, TIR, spread, MOIC, exposição, payback, margens; grade de teto saída × TMA; grade de VPL saída × prazo; sensibilidades isoladas e calendários alternativos de liquidação.
10. Rodar ensemble determinístico com semente, faixas triangulares e dependência adversa comum identificadas. A frequência de VPL positivo nos draws não constitui probabilidade de sucesso. Quantis não são intervalos de confiança; limites não foram estimados de uma distribuição histórica de mercado.
11. Registrar `investorInputSha256`: request efetivo, política de custos, incerteza, pacote de fontes e versão. Preservar `inputSha256` do motor legado. Revisar comparações, custo completo, fonte, prazo e riscos em auditoria independente.
12. Transformar divergências e documentos inacessíveis em ações de campo/profissional, com evidência exigida. O agente não recebe tarefas de busca pública que já possam ser automatizadas.

## Salseiros: exemplo de ensaio, sem adoção de valor

O sinal provável do próprio terreno é R$ 7.655.354. A hipótese mantém esse valor nominal na saída em 36 meses. O carregamento de R$ 2.500/mês é provisão: R$ 1.500 fiscal, R$ 750 de conservação e R$ 250 de segurança. O cadastro apresenta valor territorial de R$ 1.743.841,84, mas não carnê, e associa matrícula 27.417 ao código cadastral 775061; o estudo documental indica 77.931. A reserva fiscal anual de 1% é política de orçamento, não alíquota de IPTU, e não determina ITBI.

Com TMA de 21,75% a.a., ITBI 2%, escritura/registro SC 2026, R$ 60 mil de diligências, comissão de saída de 5% e reserva progressiva PF, o teto econômico do exemplo é R$ 3.471.802,67. A proposta de R$ 3.124.000 fica 10% abaixo do teto e entrega VPL de cerca de R$ 326,7 mil e TIR de 25,65% a.a. O pedido integral gera VPL negativo na mesma hipótese de saída. O ensemble adverso padrão tem somente 17,77% de draws positivos: o cenário central positivo ainda não apresenta resiliência ampla às faixas escolhidas. O teto e a proposta não são avaliação formal de mercado ou sinal de aceite do vendedor.

Antes de adquirir: confirmar identidade registral/cadastral, acesso e APP; obter guia de ITBI, carnê e dívida de IPTU/ITR, orçamento do cartório e perfil tributário; comprovar liquidez/saída por amostras de terra compatíveis; concluir geotecnia, inundação, restrições e passivos. O formulário de campo deve solicitar evidências e parecer pessoal, conservando o encerramento dessas ações no dossiê.

## Interface de integração

```js
const sourceBundle = await loadInvestorSourceBundle({ now });
const baseline = await buildAcquisitionBaseline({ study, sourceBundle, now });
const result = evaluateInvestorAcquisition(baseline.request, {
  sourceBundle,
  costPolicy: baseline.costPolicy,
  uncertainty: baseline.uncertainty,
});
```

O server carrega as fontes a cada cálculo/export ou por cache curto controlado. Não recebe, serializa ou clona o `sourceBundle` para depois reaceitá-lo. O browser edita o `request` legado, o `costPolicy` completo e o `uncertainty` completo. A jurisdição deve ser conferida no despacho: `sc_2026` somente em SC. Os corpus e recibos integrais ficam privados; o investidor vê os valores, regras, fontes e anexos metodológicos pertinentes.
