/** Shared observational protocol; no provider payload, network or image interpretation. */
export const STREETVIEW_REVIEW_CRITERIA=Object.freeze([
  {id:'fachada-identificacao',label:'Fachada e identificação',prompt:'A frente do imóvel foi conciliada com cadastro, divisas e numeração?',verification:'Conferir matrícula, planta, cadastro e foto própria; fachada não comprova domínio.'},
  {id:'acesso-veicular',label:'Acesso veicular',prompt:'Há acesso com largura, posição e autorização compatíveis com o produto?',verification:'Medir em campo e consultar regras viárias; guia rebaixada não comprova acesso licenciado.'},
  {id:'circulacao-carga',label:'Giro, carga e emergência',prompt:'O veículo de projeto consegue entrar, manobrar e sair com segurança?',verification:'Levantamento e simulação de varredura; validar restrições de circulação e emergência.'},
  {id:'passeio-acessibilidade',label:'Passeio e acessibilidade',prompt:'A rota de pedestres tem continuidade e espaço livre verificáveis?',verification:'Medições e vistoria conforme regras locais; perspectiva da imagem não mede largura ou inclinação.'},
  {id:'drenagem-aparente',label:'Água e drenagem',prompt:'Há evidências próprias de empoçamento, drenagem, erosão ou marcas de água?',verification:'Cruzar mapas oficiais, cotas, bacia e vistoria. Ausência visual não afasta inundação.'},
  {id:'desnivel-acesso',label:'Desnível e implantação',prompt:'As diferenças de nível e suas referências foram levantadas?',verification:'Topografia com datum e cotas; não estimar declividade pela câmera ou assumir terreno plano.'},
  {id:'redes-postes',label:'Redes e interferências',prompt:'Há interferências documentadas para entrada, obra ou implantação?',verification:'Fotos próprias, cadastro das concessionárias, faixa de servidão e capacidade de ligação.'},
  {id:'vegetacao',label:'Vegetação e elementos existentes',prompt:'O inventário próprio identifica elementos que demandam preservação ou licença?',verification:'Inventário/levantamento em campo e legislação aplicável; não extrair árvores de imagens Google.'},
  {id:'ocupacao-entorno',label:'Usos e vizinhança',prompt:'Há usos reais e documentos que qualifiquem compatibilidade e oportunidade?',verification:'Confirmar atividade, funcionamento e fonte independente; não inferir renda ou demanda pela aparência.'},
  {id:'conflitos-operacionais',label:'Ruído, tráfego e operação',prompt:'Há observação de campo em horários relevantes ou medições sobre conflitos?',verification:'Registrar horários, duração e método. Uma imagem não mede fluxo, ruído, odor ou segurança.'},
  {id:'acesso-rural',label:'Acesso e sazonalidade rural',prompt:'Via, pontes, porteiras e passagem têm condições e direitos confirmados?',verification:'Confirmar servidões, domínio da via, restrições e acesso em épocas distintas; imagem não prova trafegabilidade anual.'},
]);
export const STREETVIEW_REVIEW_STATUSES=Object.freeze(['a-verificar','indicio','evidencia-referenciada','nao-aplicavel']);
export const STREETVIEW_REVIEW_BASES=Object.freeze(['hipotese-analista','visita-presencial','foto-propria','documento-oficial']);
