#!/usr/bin/env node
/**
 * generate-frames-manifest.mjs
 *
 * Cria public/frames/manifest.json a partir dos frames extraídos.
 * A presença desse arquivo é o trigger para o HeroConstruction
 * usar frame sequence em vez de Three.js procedural.
 *
 * Uso: node scripts/generate-frames-manifest.mjs
 */

import { readdir, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FRAMES_DIR = path.join(ROOT, "public", "frames");

async function main() {
  if (!existsSync(FRAMES_DIR)) {
    console.error(`❌ Pasta não encontrada: ${FRAMES_DIR}`);
    console.error("   Rode bash scripts/extract-frames.sh <video.mp4> primeiro.");
    process.exit(1);
  }

  const entries = await readdir(FRAMES_DIR);
  const frames = entries
    .filter((f) => /^frame_\d+\.webp$/.test(f))
    .sort();

  if (frames.length < 24) {
    console.error(
      `❌ Apenas ${frames.length} frames encontrados (mínimo 24). Verifique a extração.`,
    );
    process.exit(1);
  }

  // Detecta padding numérico a partir do primeiro frame
  const m = frames[0].match(/^frame_(\d+)\.webp$/);
  const pad = m ? m[1].length : 4;

  // Tamanho total
  let totalBytes = 0;
  for (const f of frames) {
    const s = await stat(path.join(FRAMES_DIR, f));
    totalBytes += s.size;
  }
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  const manifest = {
    count: frames.length,
    prefix: "/frames/frame_",
    extension: ".webp",
    pad,
    width: 1920,
    height: 1080,
    version: String(Date.now()),
    pipeline: "kling-3.0",
    generatedAt: new Date().toISOString(),
    totalBytes,
  };

  const target = path.join(FRAMES_DIR, "manifest.json");
  await writeFile(target, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  console.log("✅ manifest.json gerado:");
  console.log(`   frames: ${manifest.count}`);
  console.log(`   pad:    ${manifest.pad}`);
  console.log(`   size:   ${totalMB} MB`);
  console.log(`   path:   public/frames/manifest.json`);
  console.log("");
  console.log("▸ Próximo passo: npm run build && deploy");
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
