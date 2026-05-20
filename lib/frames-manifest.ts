/**
 * Frames manifest — config do scroll-driven frame sequence.
 *
 * Quando /public/frames/manifest.json existe, o HeroConstruction usa
 * frame sequence (Kling 3.0). Caso contrário, cai automaticamente no
 * Three.js procedural (ConstructionScene).
 *
 * O manifest é gerado pelo script scripts/generate-frames-manifest.mjs
 * após renderizar os frames com Kling/Blender.
 */

export interface FramesManifest {
  /** Quantidade total de frames (recomendado: 240). */
  count: number;
  /** Prefixo do path relativo a /public — ex: "/frames/frame_". */
  prefix: string;
  /** Extensão dos arquivos — ex: ".webp". */
  extension: string;
  /** Padding numérico — ex: 4 para "frame_0001". */
  pad: number;
  /** Largura nativa (px). */
  width: number;
  /** Altura nativa (px). */
  height: number;
  /** Versão para invalidação de cache do navegador. */
  version: string;
  /** Pipeline usado (kling-3.0 | blender | other). */
  pipeline?: string;
}

/** Default — usado se manifest.json não existir. Three.js fallback. */
export const FRAMES_DEFAULT: FramesManifest = {
  count: 240,
  prefix: "/frames/frame_",
  extension: ".webp",
  pad: 4,
  width: 1920,
  height: 1080,
  version: "0",
  pipeline: "none",
};

export function buildFramePath(manifest: FramesManifest, index: number): string {
  const padded = String(index + 1).padStart(manifest.pad, "0");
  return `${manifest.prefix}${padded}${manifest.extension}?v=${manifest.version}`;
}

/**
 * Tenta carregar manifest. Retorna null se não existir (fallback proc).
 * Client-side only — usado no useEffect do orchestrator.
 */
export async function loadManifest(): Promise<FramesManifest | null> {
  try {
    const res = await fetch("/frames/manifest.json", {
      cache: "force-cache",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<FramesManifest>;
    // Validação mínima
    if (
      typeof data.count !== "number" ||
      data.count < 24 ||
      typeof data.prefix !== "string" ||
      typeof data.extension !== "string"
    ) {
      return null;
    }
    return { ...FRAMES_DEFAULT, ...data };
  } catch {
    return null;
  }
}
