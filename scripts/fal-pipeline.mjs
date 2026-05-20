#!/usr/bin/env node
/**
 * fal-pipeline.mjs — Pipeline de geração de imagens cinematográficas
 * para o Hero editorial Barch (referência: Forma Estates / Altitudes /
 * Detail-Wolds-Weather).
 *
 * Gera 6 imagens fotorealistas via FLUX Pro 1.1 Ultra (Fal.ai):
 *   1. hero-blue-hour       · residência ao crepúsculo, interior aceso (HERO principal)
 *   2. hero-golden-hour     · golden hour, sombras longas (alternativa)
 *   3. interior-living      · pé-direito duplo, materialidade revelada
 *   4. detalhe-concreto     · close-up board-formed + cumaru
 *   5. aerial-context       · vista aérea + entorno
 *   6. bimarch-modelo       · visualização BIM federada
 *
 * Output: public/hero/{slug}.webp + public/hero/manifest.json
 *
 * Pré-requisitos:
 *   - FAL_KEY no .env.local
 *   - ffmpeg (brew install ffmpeg) — para conversão JPG→WebP otimizado
 *
 * Uso:
 *   node scripts/fal-pipeline.mjs              # roda end-to-end
 *   node scripts/fal-pipeline.mjs --only hero  # só uma imagem por slug
 *
 * Custo aprox: 6 × ~US$ 0.06 (FLUX Pro 1.1 Ultra) = ~US$ 0.36
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "hero");

/* -----------------------------------------------------------------------
 * Env loader
 * ---------------------------------------------------------------------- */

function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const [, k, v] = m;
    if (!process.env[k]) process.env[k] = v.replace(/^["']|["']$/g, "");
  }
}
loadEnv();

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("❌ FAL_KEY não definida em .env.local");
  process.exit(1);
}

/* -----------------------------------------------------------------------
 * Prompts canônicos — Bernardes + Kogan + Zumthor · cinematic
 * ---------------------------------------------------------------------- */

const COMMON_SHOT =
  "Shot on Phase One IQ4 150MP, 50mm lens, f/8, base ISO 50. " +
  "No people, no cars, no construction equipment. " +
  "Wide horizontal composition 16:9, photorealistic, architectural " +
  "magazine quality (Dezeen, ArchDaily, Domus editorial).";

const NEG_PROMPT =
  "people, cars, signage, text, logo, watermark, blurry, low quality, " +
  "oversaturated, neon, gradient sky, render-looking, plastic, cartoon, " +
  "vibrant colors, pastel, kitsch, generic stock photo";

const IMAGES = [
  {
    slug: "hero-blue-hour",
    description: "HERO principal · crepúsculo, interior aceso, cinematic",
    aspect: "16:9",
    prompt: `Brazilian contemporary luxury residence at deep blue hour
twilight, designed in the spirit of Bernardes Arquitetura and Marcio Kogan.
Two displaced rectangular volumes in L-shape, board-formed concrete walls
with visible pine formwork grain, cumaru wood deck and brise-soleil,
floor-to-ceiling glass with minimal black mullions, corten steel transition
elements, honed basalt exterior flooring. Interior is warmly lit revealing
double-height living room, exposed concrete ceiling, contemporary furniture
silhouettes. Reflecting pool under 4-meter cantilever mirrors the lit
windows.

Deep dusk sky transitioning from petrol blue to dark indigo at horizon.
Subtle warm tungsten glow from interior contrasts with cool blue exterior.
Long horizontal composition. Camera position: low three-quarter view from
southeast, eye-level 1.6m, distance 32m from center, no tilt.

${COMMON_SHOT}`,
  },
  {
    slug: "hero-golden-hour",
    description: "Alternativa golden hour · sombras longas direcionais",
    aspect: "16:9",
    prompt: `Brazilian contemporary luxury residence at late golden hour,
designed in the spirit of Bernardes and Kogan. Two displaced rectangular
volumes in L-shape, board-formed concrete walls, cumaru wood deck and
brises, floor-to-ceiling glass with minimal black mullions, corten steel
elements, honed basalt flooring, infinity pool integrated with deck.

Warm golden raking sunlight from the right casting long horizontal shadows
across the deck. Subtle haze in the atmosphere. Camera position: high
three-quarter view from southeast, elevation 12m, distance 35m from center,
no tilt.

${COMMON_SHOT}`,
  },
  {
    slug: "interior-living",
    description: "Interior pé-direito duplo · materialidade revelada",
    aspect: "16:9",
    prompt: `Interior architectural photography of a double-height living
room in a Brazilian contemporary luxury residence (Bernardes/Kogan
vocabulary). Six-meter exposed concrete ceiling with visible pine
formwork grain. Full-height glass wall on the right opening to a deck
and reflecting pool. Cumaru wood floor and ceiling slats. Built-in
fireplace in a vertical basalt-clad volume. Minimalist Brazilian
modernist furniture in muted tones, no people.

Soft natural light coming from the right (late afternoon), bouncing off
the concrete and warming the wood. Subtle haze of dust particles in
sunlight beam.

${COMMON_SHOT}`,
  },
  {
    slug: "detalhe-concreto",
    description: "Close-up tátil concreto board-formed + cumaru",
    aspect: "3:2",
    prompt: `Tight architectural detail close-up photograph: meeting of
board-formed concrete wall and cumaru wood vertical brise-soleil louvers.
Pine formwork grain clearly visible in the concrete, with crisp shadow
lines from each board edge. Cumaru shows weathered patina with natural
grain. Brushed corten steel reveal between the two materials.

Side raking light bringing out texture in both surfaces. Macro
sensibility — depth of field falls off softly behind. Editorial detail
shot for an architectural magazine.

${COMMON_SHOT}`,
  },
  {
    slug: "aerial-context",
    description: "Vista aérea contextual · entorno natural",
    aspect: "16:9",
    prompt: `Aerial drone photograph of a contemporary Brazilian luxury
residence from 80 meters elevation, looking down at 35-degree angle.
Two L-shaped volumes in board-formed concrete with green roof of native
Brazilian vegetation. Property sits on a 2000m² gently sloping lot in
preserved Atlantic forest tropical landscape. Infinity pool visible.
Native landscaping at borders, no manicured lawns.

Early morning soft light. Mist rising from forest at edges. No roads or
other buildings visible in frame.

${COMMON_SHOT}`,
  },
  {
    slug: "bimarch-modelo",
    description: "Visualização modelo BIM federado · técnico premium",
    aspect: "16:9",
    prompt: `Premium architectural BIM model visualization. Wireframe and
shaded hybrid render of a contemporary residence: exposed structural
columns and slabs in concrete, opening cut planes revealing rebar and
mechanical/electrical conduits color-coded by discipline. Vertical
slice showing layers from foundation to roof. Section cut through living
room.

Dark technical background (#0A0A0A), structural elements in subtle warm
white, mechanical/electrical in muted accent colors. Editorial style of
McNeel/Rhino + V-Ray architectural visualization, NOT cartoonish 3D.
Looks like a published BIM diagram from an architecture firm portfolio.

${COMMON_SHOT}`,
  },
];

/* -----------------------------------------------------------------------
 * Fal.ai helpers
 * ---------------------------------------------------------------------- */

const FAL_BASE = "https://queue.fal.run";
const HEADERS = {
  Authorization: `Key ${FAL_KEY}`,
  "Content-Type": "application/json",
};

async function falSubmit(model, payload) {
  const res = await fetch(`${FAL_BASE}/${model}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Fal submit ${model} → ${res.status}: ${txt}`);
  }
  return res.json();
}

async function pollUntilDone(submitResp, label, maxMin = 4) {
  const statusUrl = submitResp.status_url;
  const responseUrl = submitResp.response_url;
  const start = Date.now();
  let lastLog = 0;
  while (true) {
    const elapsed = (Date.now() - start) / 1000;
    if (elapsed > maxMin * 60) throw new Error(`Timeout ${label}`);
    const s = await (await fetch(statusUrl, { headers: HEADERS })).json();
    if (s.status === "COMPLETED") {
      return (await fetch(responseUrl, { headers: HEADERS })).json();
    }
    if (s.status === "FAILED" || s.status === "ERROR") {
      throw new Error(`${label} falhou: ${JSON.stringify(s)}`);
    }
    if (elapsed - lastLog > 6) {
      lastLog = elapsed;
      process.stdout.write(
        `\r   ${label}: ${s.status} · ${Math.round(elapsed)}s ...    `,
      );
    }
    await new Promise((r) => setTimeout(r, 3500));
  }
}

async function downloadBuffer(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Download ${url} → ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

/* -----------------------------------------------------------------------
 * Image generation + WebP conversion
 * ---------------------------------------------------------------------- */

async function generateAndSave(item) {
  console.log(`\n▸ [${item.slug}] ${item.description}`);
  const submit = await falSubmit("fal-ai/flux-pro/v1.1-ultra", {
    prompt: item.prompt,
    aspect_ratio: item.aspect,
    num_images: 1,
    enable_safety_checker: false,
    output_format: "jpeg",
    raw: false,
    safety_tolerance: "5",
  });
  console.log(`   request_id: ${submit.request_id}`);
  const result = await pollUntilDone(submit, item.slug, 4);
  const url = result.images?.[0]?.url;
  if (!url) throw new Error(`${item.slug}: sem URL`);
  console.log(`\n   ✓ generated · ${url}`);

  const jpgBuf = await downloadBuffer(url);
  const rawPath = path.join(OUT_DIR, `${item.slug}.jpg`);
  writeFileSync(rawPath, jpgBuf);

  // Converte para WebP otimizado via ffmpeg
  const webpPath = path.join(OUT_DIR, `${item.slug}.webp`);
  const ff = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      rawPath,
      "-c:v",
      "libwebp",
      "-quality",
      "82",
      "-preset",
      "photo",
      "-an",
      webpPath,
    ],
    { stdio: "pipe" },
  );
  if (ff.status !== 0) {
    console.warn(
      `   ⚠ ffmpeg falhou para ${item.slug}, mantendo apenas .jpg`,
    );
    return {
      slug: item.slug,
      file: `${item.slug}.jpg`,
      width: result.images[0].width || 1920,
      height: result.images[0].height || 1080,
      bytes: jpgBuf.length,
    };
  }
  const webpBytes = readFileSync(webpPath).length;
  console.log(
    `   ✓ webp: ${(webpBytes / 1024).toFixed(1)} KB (jpg: ${(jpgBuf.length / 1024).toFixed(1)} KB)`,
  );
  return {
    slug: item.slug,
    file: `${item.slug}.webp`,
    width: result.images[0].width || 1920,
    height: result.images[0].height || 1080,
    bytes: webpBytes,
    aspect: item.aspect,
  };
}

/* -----------------------------------------------------------------------
 * Main
 * ---------------------------------------------------------------------- */

async function main() {
  console.log("");
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║  BARCH · Hero · FLUX Pro Ultra image pipeline         ║");
  console.log("╚═══════════════════════════════════════════════════════╝");

  mkdirSync(OUT_DIR, { recursive: true });

  const args = process.argv.slice(2);
  const onlyIdx = args.indexOf("--only");
  const onlySlug = onlyIdx >= 0 ? args[onlyIdx + 1] : null;
  const targets = onlySlug ? IMAGES.filter((i) => i.slug === onlySlug) : IMAGES;
  if (!targets.length) {
    console.error(`❌ Nenhum slug encontrado: ${onlySlug}`);
    console.log("Slugs disponíveis: " + IMAGES.map((i) => i.slug).join(", "));
    process.exit(1);
  }

  const generated = [];
  // Gera em paralelo de 3 em 3 — Fal.ai aceita concurrency
  const pool = 3;
  for (let i = 0; i < targets.length; i += pool) {
    const chunk = targets.slice(i, i + pool);
    const results = await Promise.all(chunk.map(generateAndSave));
    generated.push(...results);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    pipeline: "fal-ai · flux-pro-1.1-ultra",
    images: generated,
    totalBytes: generated.reduce((a, b) => a + b.bytes, 0),
  };
  await writeFile(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8",
  );

  const totalMB = (manifest.totalBytes / (1024 * 1024)).toFixed(2);
  console.log("");
  console.log("✅ Pipeline completa.");
  console.log("");
  console.log(`   Imagens:   ${generated.length}`);
  console.log(`   Tamanho:   ${totalMB} MB total`);
  console.log(`   Manifest:  public/hero/manifest.json`);
  console.log("");
  console.log("▸ Próximo passo: npm run build && git push");
}

main().catch((e) => {
  console.error("");
  console.error("❌ Pipeline falhou:");
  console.error("  ", e.message);
  process.exit(1);
});
