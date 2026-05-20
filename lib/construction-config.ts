/**
 * Hero 3D — Configuração canônica das fases e materiais.
 *
 * Fonte: BARCH — Diretriz Completa para Hero 3D Imersivo (uploads)
 * Cada fase declara seu range de progresso (0..1), seu rótulo e o ponto de
 * transição usado pelo orchestrator para sincronizar a cena 3D + overlay UI.
 *
 * Princípios:
 *  - Density over volume. Cada valor aqui é load-bearing.
 *  - Nada de adjetivo vazio nos labels — só substantivos operativos.
 *  - Order matters: o array `PHASES` é varrido sequencialmente.
 */

export type PhaseId =
  | "terrain"
  | "structure"
  | "volume"
  | "material"
  | "light"
  | "habitar";

export interface ConstructionPhase {
  id: PhaseId;
  /** [start, end] em 0..1 — start inclusivo, end exclusivo (exceto a última). */
  range: [number, number];
  /** Texto em caixa alta exibido no PhaseLabel. */
  label: string;
  /** Sub-label fino, tracking wide, em caixa alta. */
  sub: string;
}

/**
 * 6 fases · totalizando 100% do scroll.
 * As bordas não se sobrepõem; o orchestrator escolhe a fase pela primeira
 * cujo range contém o progress atual.
 */
export const PHASES: ConstructionPhase[] = [
  {
    id: "terrain",
    range: [0.0, 0.15],
    label: "Terreno",
    sub: "Leitura do lugar",
  },
  {
    id: "structure",
    range: [0.15, 0.35],
    label: "Estrutura",
    sub: "Concreto armado",
  },
  {
    id: "volume",
    range: [0.35, 0.55],
    label: "Volume",
    sub: "Definição espacial",
  },
  {
    id: "material",
    range: [0.55, 0.75],
    label: "Materialidade",
    sub: "Tectônica revelada",
  },
  {
    id: "light",
    range: [0.75, 0.92],
    label: "Luz",
    sub: "O último material",
  },
  {
    id: "habitar",
    range: [0.92, 1.0],
    label: "Habitar",
    sub: "O espaço responde",
  },
];

/** Devolve a fase ativa para um progress dado. */
export function getActivePhase(progress: number): ConstructionPhase {
  const p = Math.max(0, Math.min(0.9999, progress));
  for (const phase of PHASES) {
    if (p >= phase.range[0] && p < phase.range[1]) return phase;
  }
  return PHASES[PHASES.length - 1];
}

/** Normaliza progress dentro do range da fase ativa (0..1 local). */
export function phaseProgress(progress: number, phase: ConstructionPhase): number {
  const [start, end] = phase.range;
  if (end <= start) return 1;
  return Math.max(0, Math.min(1, (progress - start) / (end - start)));
}

/* -----------------------------------------------------------------------
 * Materiais — usados no MaterialAnnotations overlay (fase 55-85%)
 * ---------------------------------------------------------------------- */

export interface MaterialAnnotation {
  id: string;
  name: string;
  detail: string;
  /** Posição em % da viewport (left, top). */
  position: { x: string; y: string };
  /** Progress no qual o dot aparece. */
  showAt: number;
  /** Progress no qual o label desaparece (default 0.88). */
  hideAt?: number;
  /** Direção da haste: 'down' (padrão) ou 'up'. */
  stem?: "down" | "up";
}

export const MATERIALS: MaterialAnnotation[] = [
  {
    id: "concreto",
    name: "Concreto board-formed",
    detail: "Fôrma de pinus · cura 28 dias · fck 35 MPa",
    position: { x: "62%", y: "28%" },
    showAt: 0.58,
    stem: "down",
  },
  {
    id: "cumaru",
    name: "Cumaru",
    detail: "Deck e brises · FSC · durabilidade 25+ anos",
    position: { x: "32%", y: "68%" },
    showAt: 0.62,
    stem: "up",
  },
  {
    id: "vidro",
    name: "Vidro Low-E",
    detail: "Piso-teto · caixilho 20mm · transmitância 1.1",
    position: { x: "72%", y: "52%" },
    showAt: 0.66,
    stem: "down",
  },
  {
    id: "corten",
    name: "Aço corten",
    detail: "Pátina natural 6–18 meses · espessura 3mm",
    position: { x: "22%", y: "44%" },
    showAt: 0.7,
    stem: "down",
  },
  {
    id: "basalto",
    name: "Basalto honed",
    detail: "Piso externo · antiderrapante R11 · 2cm",
    position: { x: "52%", y: "82%" },
    showAt: 0.74,
    stem: "up",
  },
];

/* -----------------------------------------------------------------------
 * Scroll behavior
 * ---------------------------------------------------------------------- */

export const SCROLL_CONFIG = {
  /** Altura do container em vh — 500vh dá tempo para a narrativa. */
  containerHeightVh: 500,
  /** Suavidade do scrub (segundos de inércia). */
  scrub: 0.5,
  /** Limite mínimo de viewport para ativar a experiência completa. */
  desktopBreakpointPx: 1024,
};

/* -----------------------------------------------------------------------
 * Paleta — referenciada pela ConstructionScene
 * ---------------------------------------------------------------------- */

export const PALETTE = {
  paper: "#FCFBF7",
  ink: "#0A0A0A",
  muted: "#666666",
  rule: "#EFEFEF",
  white: "#FFFFFF",
  black: "#000000",
  // Tons usados na cena 3D (procedural) — ainda B&W, variando luminância.
  concrete: "#C8C5BC",
  concreteDark: "#8C8A82",
  wood: "#7B6A56",
  woodDark: "#4D4135",
  glass: "#D8DCDE",
  corten: "#5E4A3E",
  basalt: "#3A3A38",
  water: "#9DA4A8",
} as const;
