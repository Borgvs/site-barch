#!/usr/bin/env node
/**
 * fal-construction-pipeline.mjs — Pipeline encadeado para Hero 3D Imersivo.
 *
 * Estratégia (técnica Higgsfield + encadeamento Kling):
 *
 *   1. Gera 7 imagens AI específicas de fases construtivas via FLUX Pro Ultra
 *      Cada imagem mostra a casa em UM estado: terreno → fundações →
 *      estrutura → vedação → vidro → materialidade → completa
 *
 *   2. Encadeia 6 Klings 1.6 Pro image-to-video (5s cada @ 16:9)
 *      Cada par consecutivo (1→2, 2→3, ..., 6→7) vira um clip
 *      Kling interpola SUAVEMENTE entre dois estados próximos (sem inventar)
 *
 *   3. Concatena os 6 clips via ffmpeg → 30s de timelapse construtivo real
 *
 *   4. Extrai 240 frames a 8fps (30s × 8 = 240) — alinhado com o scroll 500vh
 *
 *   5. Gera manifest.json — site faz swap automatico para frame sequence
 *
 * Custo: ~US$ 4.60 (7×FLUX + 6×Kling)
 * Tempo: ~25-35 min (FLUX paralelo + Klings serial)
 *
 * Uso:
 *   node scripts/fal-construction-pipeline.mjs              # roda end-to-end
 *   node scripts/fal-construction-pipeline.mjs --resume     # continua do .json
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { writeFile, readdir, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TMP = path.join(ROOT, "tmp", "chain");
const FRAMES_DIR = path.join(ROOT, "public", "frames");
const STATE_FILE = path.join(TMP, "state.json");

/* -------- Env -------- */
function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();
const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("❌ FAL_KEY não definida");
  process.exit(1);
}

/* -------- CLI -------- */
const RESUME = process.argv.includes("--resume");

/* -------- Camera comum (mantém composição entre fases) -------- */
const CAMERA = `Three-quarter view from southeast, eye-level 1.6m height,
distance 32m from center, slight downward tilt. Locked camera position
identical to other shots in the series.`;

const COMMON = `Brazilian contemporary luxury residence by Bernardes Arquitetura
and Marcio Kogan style. Two displaced L-shape rectangular volumes. Board-formed
concrete, cumaru wood, glass, corten, basalt. 2000m² lot with gentle slope,
tropical Atlantic forest at borders. ${CAMERA}
Shot on Phase One IQ4 150MP, 50mm lens, f/8, base ISO 50.
No people, no construction equipment, no cranes, no scaffolding.
Wide horizontal composition 16:9, photorealistic, architectural magazine quality.`;

const NEG_VIDEO = `people, cars, cranes, construction equipment, scaffolding,
camera movement, zoom, pan, tilt, dolly, parallax, jitter, motion blur,
text, watermark, color shifts, oversaturation, neon`;

/* -------- 6 fases construtivas + 1 fase final EXISTENTE --------
 * A imagem da casa completa já existe em /public/hero/hero-golden-hour.webp
 * (gerada anteriormente). Vamos usá-la como end frame para garantir
 * coerência com o que já está em produção. */
const PHASES = [
  {
    slug: "01-terreno",
    label: "Terreno vazio",
    prompt: `EMPTY RESIDENTIAL LOT, 2000m² gently sloping terrain with native
Brazilian Atlantic forest vegetation at the borders. NO BUILDING yet —
just the cleared ground where construction will begin. Late afternoon
golden hour light. ${COMMON}`,
  },
  {
    slug: "02-fundacoes",
    label: "Fundações + sapatas",
    prompt: `Same lot, FOUNDATIONS phase: concrete footings and grade beams
visible at ground level, forming the rectangular outline of two L-shape
volumes. Excavated areas, freshly poured concrete bases. Rebar visible
in some footings. NO walls, NO structure above ground level yet.
Same late afternoon light. ${COMMON}`,
  },
  {
    slug: "03-estrutura",
    label: "Estrutura aparente",
    prompt: `Same residence, STRUCTURAL FRAME phase: bare concrete columns
rising 6m, exposed concrete slabs forming two floor levels in L-shape.
Visible cantilever beam of 4m extending eastward. No walls yet, no glass,
no finishing — just the raw skeletal structure of board-formed concrete.
Same late afternoon light. ${COMMON}`,
  },
  {
    slug: "04-vedacao",
    label: "Vedações fechadas",
    prompt: `Same residence, WALLS PHASE: board-formed concrete walls now
closed on south and west sides (with visible pine formwork grain texture),
but north and east sides STILL OPEN (no glass yet — just the structural
frame visible there). Cantilever still bare concrete. No deck, no finishing.
Same late afternoon light. ${COMMON}`,
  },
  {
    slug: "05-vidro",
    label: "Vidro piso-teto",
    prompt: `Same residence, GLAZING PHASE: floor-to-ceiling glass panels
now installed with minimal black mullions on the north and east facades.
Concrete walls visible on the other sides. Interior still empty (no
furniture, no lighting). No deck yet, no landscaping refinement.
Same late afternoon light. ${COMMON}`,
  },
  {
    slug: "06-materialidade",
    label: "Materialidade revelada",
    prompt: `Same residence, FINISHING PHASE: cumaru wood deck installed
extending from the living room, cumaru brise-soleil louvers above the
cantilever, corten steel transition elements visible, honed basalt
exterior flooring. Reflecting pool starting to fill under cantilever.
Interior still empty, no furniture. Same late afternoon light. ${COMMON}`,
  },
  // Fase 7 não é gerada — reusamos public/hero/hero-golden-hour.webp existente
  {
    slug: "07-completa",
    label: "Casa completa habitada",
    reuseFromHero: "hero-golden-hour.webp",
  },
];

/* -------- Fal helpers -------- */
const FAL_BASE = "https://queue.fal.run";
const HDR = {
  Authorization: `Key ${FAL_KEY}`,
  "Content-Type": "application/json",
};

async function falSubmit(model, body) {
  const res = await fetch(`${FAL_BASE}/${model}`, {
    method: "POST",
    headers: HDR,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`submit ${model}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function pollUntilDone(modelBase, id, label, maxMin = 12) {
  const start = Date.now();
  let lastLog = 0;
  while (true) {
    const elapsed = (Date.now() - start) / 1000;
    if (elapsed > maxMin * 60) throw new Error(`Timeout ${label}`);
    const r = await fetch(`${FAL_BASE}/${modelBase}/requests/${id}/status`, {
      headers: HDR,
    });
    const s = await r.json();
    if (s.status === "COMPLETED") {
      const rr = await fetch(`${FAL_BASE}/${modelBase}/requests/${id}`, {
        headers: HDR,
      });
      return rr.json();
    }
    if (s.status === "FAILED" || s.status === "ERROR")
      throw new Error(`${label} failed: ${JSON.stringify(s)}`);
    if (elapsed - lastLog > 8) {
      lastLog = elapsed;
      process.stdout.write(
        `\r   ${label}: ${s.status} · ${Math.round(elapsed)}s ...   `,
      );
    }
    await new Promise((r) => setTimeout(r, 4000));
  }
}

async function downloadFile(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download: ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(dest, buf);
  return buf.length;
}

/* -------- Steps -------- */
async function uploadToFal(localPath) {
  // Fal aceita upload via /storage/upload — retorna URL pública
  const buf = readFileSync(localPath);
  const fileName = path.basename(localPath);

  // 1. Initiate upload
  const initRes = await fetch("https://rest.alpha.fal.ai/storage/upload/initiate", {
    method: "POST",
    headers: HDR,
    body: JSON.stringify({
      file_name: fileName,
      content_type: "image/webp",
    }),
  });
  if (!initRes.ok) {
    throw new Error(`Fal upload initiate: ${initRes.status} ${await initRes.text()}`);
  }
  const { upload_url, file_url } = await initRes.json();

  // 2. PUT to upload_url
  const putRes = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": "image/webp" },
    body: buf,
  });
  if (!putRes.ok) {
    throw new Error(`Fal upload PUT: ${putRes.status}`);
  }
  return file_url;
}

async function generatePhaseImages(state) {
  console.log("\n▸ STEP 1 · Gerando 6 imagens FLUX + reusando casa-completa existente\n");

  state.images = state.images || {};

  // Phase 07 — reusa hero-golden-hour.webp via upload para Fal Storage
  if (!state.images["07-completa"]) {
    const completePath = path.join(ROOT, "public", "hero", "hero-golden-hour.webp");
    if (!existsSync(completePath)) {
      throw new Error(`hero-golden-hour.webp não encontrado em ${completePath}`);
    }
    console.log("▸ Uploading hero-golden-hour para Fal Storage...");
    const url = await uploadToFal(completePath);
    state.images["07-completa"] = url;
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    console.log(`   ✓ casa-completa: ${url}\n`);
  }

  // Phases 01-06 via FLUX em paralelo
  const toGen = PHASES.filter(
    (p) => !p.reuseFromHero && !state.images?.[p.slug],
  );
  console.log(`▸ FLUX paralelo: ${toGen.length} imagens\n`);

  const tasks = toGen.map(async (phase) => {
    const model = "fal-ai/flux-pro/v1.1-ultra";
    const submit = await falSubmit(model, {
      prompt: phase.prompt,
      aspect_ratio: "16:9",
      num_images: 1,
      enable_safety_checker: false,
      output_format: "jpeg",
      safety_tolerance: "5",
    });
    console.log(`   ${phase.slug} request: ${submit.request_id}`);
    const result = await pollUntilDone(
      "fal-ai/flux-pro",
      submit.request_id,
      phase.slug,
      4,
    );
    const url = result.images?.[0]?.url;
    if (!url) throw new Error(`${phase.slug}: sem URL`);

    const localPath = path.join(TMP, `${phase.slug}.jpg`);
    await downloadFile(url, localPath);
    console.log(`\n   ✓ ${phase.slug}: ${url}`);

    state.images[phase.slug] = url;
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    return { slug: phase.slug, url, localPath };
  });

  await Promise.all(tasks);
  console.log("\n✅ 7 imagens prontas (6 geradas + 1 reaproveitada)\n");
}

async function generateChainVideos(state) {
  console.log("\n▸ STEP 2 · Encadeando 6 Klings (5s cada)\n");

  state.videos = state.videos || {};

  for (let i = 0; i < PHASES.length - 1; i++) {
    const a = PHASES[i];
    const b = PHASES[i + 1];
    const pairKey = `${a.slug}-to-${b.slug}`;

    if (state.videos[pairKey]) {
      console.log(`   ${pairKey}: já gerado, pulando`);
      continue;
    }

    console.log(`\n▸ Kling ${i + 1}/6 · ${a.label} → ${b.label}`);
    const submit = await falSubmit(
      "fal-ai/kling-video/v1.6/pro/image-to-video",
      {
        image_url: state.images[a.slug],
        tail_image_url: state.images[b.slug],
        prompt: `Smooth architectural construction timelapse transitioning
from ${a.label} to ${b.label}. Locked camera position, no movement.
Continuous photorealistic build progression of the residence.`,
        negative_prompt: NEG_VIDEO,
        duration: "5",
        aspect_ratio: "16:9",
        cfg_scale: 0.55,
      },
    );
    console.log(`   request: ${submit.request_id}`);
    const result = await pollUntilDone(
      "fal-ai/kling-video",
      submit.request_id,
      pairKey,
      15,
    );
    const videoUrl = result.video?.url;
    if (!videoUrl) throw new Error(`${pairKey}: sem URL`);

    const localPath = path.join(TMP, `clip-${i + 1}.mp4`);
    await downloadFile(videoUrl, localPath);
    state.videos[pairKey] = { url: videoUrl, localPath };
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    console.log(`\n   ✓ clip-${i + 1}.mp4`);
  }
  console.log("\n✅ 6 clips Kling prontos\n");
}

async function concatAndExtract(state) {
  console.log("\n▸ STEP 3 · Concatenando + extraindo frames\n");

  // Cria concat list
  const listFile = path.join(TMP, "concat.txt");
  const clips = [];
  for (let i = 0; i < PHASES.length - 1; i++) {
    clips.push(`file 'clip-${i + 1}.mp4'`);
  }
  writeFileSync(listFile, clips.join("\n"));

  // ffmpeg concat
  const concatPath = path.join(TMP, "full-timelapse.mp4");
  console.log("▸ Concatenando 6 clips...");
  const concat = spawnSync(
    "ffmpeg",
    ["-y", "-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", concatPath],
    { stdio: "inherit", cwd: TMP },
  );
  if (concat.status !== 0) throw new Error("ffmpeg concat falhou");

  // Extract 240 frames
  console.log("\n▸ Extraindo 240 frames a 8fps (30s × 8 = 240)...");
  mkdirSync(FRAMES_DIR, { recursive: true });
  // limpa
  const old = await readdir(FRAMES_DIR);
  for (const f of old) {
    if (/^frame_/.test(f) || f === "manifest.json") {
      const fs = await import("node:fs/promises");
      await fs.unlink(path.join(FRAMES_DIR, f));
    }
  }
  const ext = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      concatPath,
      "-vf",
      "fps=8,scale=1920:1080:flags=lanczos",
      "-frames:v",
      "240",
      "-c:v",
      "libwebp",
      "-quality",
      "78",
      "-preset",
      "photo",
      "-an",
      path.join(FRAMES_DIR, "frame_%04d.webp"),
    ],
    { stdio: "inherit" },
  );
  if (ext.status !== 0) throw new Error("ffmpeg extract falhou");

  // Manifest
  const entries = await readdir(FRAMES_DIR);
  const frames = entries.filter((f) => /^frame_\d+\.webp$/.test(f)).sort();
  let total = 0;
  for (const f of frames) total += (await stat(path.join(FRAMES_DIR, f))).size;
  const manifest = {
    count: frames.length,
    prefix: "/frames/frame_",
    extension: ".webp",
    pad: 4,
    width: 1920,
    height: 1080,
    version: String(Date.now()),
    pipeline: "fal-ai · 7-phase FLUX + 6-chain Kling 1.6 Pro",
    generatedAt: new Date().toISOString(),
    totalBytes: total,
  };
  await writeFile(
    path.join(FRAMES_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log(
    `\n✅ ${frames.length} frames · ${(total / 1024 / 1024).toFixed(2)} MB`,
  );
  console.log("   manifest: public/frames/manifest.json\n");
}

/* -------- Main -------- */
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║  BARCH · Hero 3D · Pipeline encadeado (técnica Higgsfield) ║");
  console.log("╚══════════════════════════════════════════════════════════╝");

  mkdirSync(TMP, { recursive: true });
  const state = RESUME && existsSync(STATE_FILE)
    ? JSON.parse(readFileSync(STATE_FILE, "utf8"))
    : {};

  await generatePhaseImages(state);
  await generateChainVideos(state);
  await concatAndExtract(state);

  console.log("▸ Próximo: git add public/frames && git commit && git push\n");
}

main().catch((e) => {
  console.error("\n❌ Pipeline falhou:");
  console.error("  ", e.message);
  console.error("\n   Para retomar de onde parou: --resume");
  process.exit(1);
});
