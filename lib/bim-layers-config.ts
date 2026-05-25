/**
 * BIM Layers Config — definição das 6 fases construtivas mostradas no
 * scroll-driven Bimarch section.
 *
 * Cada camada tem:
 *  - range: faixa de scroll progress [0..1] em que ela está "ativa"
 *  - label / eyebrow / metric: copy técnico documental que aparece no overlay
 *  - disciplina: nome da disciplina BIM dominante
 *
 * O frame index correspondente é interpolado linearmente sobre os 200 frames.
 * Como temos 6 estados (B0..B5) ligados por 5 transições de 6s a 6.667fps,
 * cada transição tem ~40 frames. Os marcos visuais (anchors estáticos)
 * ficam nos limites de cada range.
 */

export interface BimLayer {
  /** Código curto B0..B5 */
  code: string;
  /** Range de progresso onde essa camada é a dominante */
  range: [number, number];
  /** Eyebrow técnico (ALL CAPS · tracking wide) */
  eyebrow: string;
  /** Label principal — substantivo curto da fase */
  label: string;
  /** Detalhe técnico — número/critério/verificação observável */
  metric: string;
  /** Frase curta de fechamento — função para o cliente */
  client: string;
}

export const BIM_LAYERS: BimLayer[] = [
  {
    code: "B0",
    range: [0.00, 0.18],
    eyebrow: "Locação · disciplina topográfica",
    label: "O terreno antes de qualquer pá.",
    metric: "Georreferenciada · ±2cm · 4 sondagens SPT amarradas à RN oficial",
    client: "O cliente recebe a planimetria com cotas finais antes do primeiro corte de terra.",
  },
  {
    code: "B1",
    range: [0.18, 0.36],
    eyebrow: "Fundação · estrutura armada",
    label: "A obra sai do solo já compatibilizada.",
    metric: "Concreto fck 30MPa · armadura por projeto estrutural verificado em modelo",
    client: "A geotécnica conversa com a estrutura no projeto. O canteiro recebe o que já passou pela verificação.",
  },
  {
    code: "B2",
    range: [0.36, 0.54],
    eyebrow: "Estrutura · concreto aparente",
    label: "Esqueleto coordenado antes da concretagem.",
    metric: "14 verificações automáticas de compatibilização · zero conflito de modelagem",
    client: "Conflito que aparece na tela custa horas. Conflito no canteiro custa contratos.",
  },
  {
    code: "B3",
    range: [0.54, 0.72],
    eyebrow: "MEP · hidráulica + elétrica + AVAC",
    label: "Cada disciplina chega na hora certa.",
    metric: "240 pontos hidráulicos · 380 pontos elétricos · 100% coordenados em modelo",
    client: "A casa não é furada para passar instalação esquecida. O traçado existe antes da parede.",
  },
  {
    code: "B4",
    range: [0.72, 0.88],
    eyebrow: "Vedações · alvenaria + drywall",
    label: "A parede sobe sobre o que já foi resolvido.",
    metric: "Interferências resolvidas no modelo · canteiro recebe o detalhe aprovado pelo celular",
    client: "Quem executa vê. O detalhe sai da prancha e vai para o bolso do mestre de obras.",
  },
  {
    code: "B5",
    range: [0.88, 1.00],
    eyebrow: "Federado · entrega documentada",
    label: "A obra entregue continua viva no modelo.",
    metric: "100% das disciplinas conversando · cliente acompanha pelo painel · pós-obra 12 meses",
    client: "A relação não termina na chave. O modelo federado segue como manual de uso da casa.",
  },
];

/**
 * Dado um progresso [0..1], retorna a camada ativa.
 * Default: a primeira (B0). Última (B5) cobre o final.
 */
export function activeBimLayer(progress: number): BimLayer {
  if (progress <= BIM_LAYERS[0].range[0]) return BIM_LAYERS[0];
  for (const layer of BIM_LAYERS) {
    if (progress >= layer.range[0] && progress < layer.range[1]) return layer;
  }
  return BIM_LAYERS[BIM_LAYERS.length - 1];
}

/**
 * Frame index a partir do progresso. Aceita manifest count para sincronizar.
 */
export function bimFrameIndex(progress: number, total: number): number {
  return Math.min(total - 1, Math.max(0, Math.round(progress * (total - 1))));
}
