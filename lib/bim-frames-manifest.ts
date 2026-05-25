/**
 * BIM Frames Manifest — análogo ao frames-manifest do hero, mas para o
 * scroll-driven Bimarch section. Permite servir a sequência completa
 * de frames B0→B5 com versionamento independente.
 */

export interface BimFramesManifest {
  count: number;
  prefix: string;
  extension: string;
  pad: number;
  width: number;
  height: number;
  version: string;
  pipeline?: string;
}

export const BIM_FRAMES_DEFAULT: BimFramesManifest = {
  count: 200,
  prefix: "/bim-frames/frame_",
  extension: ".webp",
  pad: 4,
  width: 1600,
  height: 900,
  version: "0",
  pipeline: "none",
};

export function buildBimFramePath(manifest: BimFramesManifest, index: number): string {
  const padded = String(index + 1).padStart(manifest.pad, "0");
  return `${manifest.prefix}${padded}${manifest.extension}?v=${manifest.version}`;
}

/** Carrega manifest /bim-frames/manifest.json; retorna null se não existir. */
export async function loadBimManifest(): Promise<BimFramesManifest | null> {
  try {
    const res = await fetch("/bim-frames/manifest.json", { cache: "force-cache" });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<BimFramesManifest>;
    if (typeof data.count !== "number" || data.count < 10) return null;
    return { ...BIM_FRAMES_DEFAULT, ...data } as BimFramesManifest;
  } catch {
    return null;
  }
}
