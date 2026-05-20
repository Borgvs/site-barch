#!/usr/bin/env node
/**
 * fal-kling-frames.mjs — Pipeline Hero 3D Imersivo (diretriz original).
 *
 * Gera 240 frames da residência sendo CONSTRUÍDA via Kling 3.0 image-to-video.
 *
 *  1. FLUX Pro Ultra: gera "terreno vazio" (start frame) com mesmo enquadramento
 *     da hero-blue-hour existente
 *  2. Kling Pro 1.6 image-to-video: timelapse construtivo (start → end)
 *     - start: terreno vazio
 *     - end: hero-golden-hour.webp (residência completa)
 *     - 10s @ 24fps = 240 frames
 *  3. ffmpeg: extrai 240 .webp em public/frames/
 *  4. Gera public/frames/manifest.json (trigger do dual-mode)
 *
 * Custo: ~US$ 1.50  ·  Tempo: ~6-10 min
 *
 * Uso:
 *   node scripts/fal-kling-frames.mjs
 *   node scripts/fal-kling-frames.mjs --resume <request_id>
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { writeFile, readdir, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TMP = path.join(ROOT, "tmp", "kling");
const FRAMES_DIR = path.join(ROOT, "public", "frames");
const HERO_DIR = path.join(ROOT, "public", "hero");

/* -------- Env -------- */
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

/* -------- CLI -------- */
const args = process.argv.slice(2);
const resumeIdx = args.indexOf("--resume");
const RESUME_ID = resumeIdx >= 0 ? args[resumeIdx + 1] : null;

/* -------- Prompts -------- */
const PROMPT_EMPTY_LOT = `Empty residential lot, 2000 square meters, gentle 2% slope,
tropical Atlantic forest at the borders, deep blue hour twilight before sunrise,
no construction equipment, no roads, no buildings. Same camera angle as a luxury
contemporary residence reference: three-quarter view from southeast, eye-level 1.6m,
distance 32m from center, no tilt.
Soft pre-dawn ambient light. Shot on Phase One IQ4 150MP, 50mm lens, f/8, base ISO 50.
Wide horizontal composition 16:9, photorealistic, architectural magazine quality.`;

const PROMPT_VIDEO = `Cinematic timelapse of a luxury concrete residence being built
from an empty lot. Sequence: foundations and rebar appear, concrete columns and slabs
rise, walls close in, floor-to-ceiling glass panels are installed, wood deck is laid,
corten steel and basalt details appear last, landscaping grows, water gradually fills
the reflecting pool, sunlight rotates from pre-dawn to golden hour into deep blue hour
with interior lit up. Smooth continuous time progression. Camera is LOCKED — no movement,
no zoom, no pan, no parallax. No people, no equipment, no cranes. Architectural
photography quality throughout.`;

const NEG_VIDEO = `people, cars, cranes, construction equipment, dust, smoke,
scaffolding, camera movement, zoom, pan, tilt, dolly, parallax, jitter, motion blur,
text, watermark, color shifts, oversaturation, neon`;

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

async function falGetStatus(model, id) {
  const r = await fetch(
    `${FAL_BASE}/${model}/requests/${id}/status`,
    { headers: HDR },
  );
  if (!r.ok) throw new Error(`status: ${r.status}`);
  return r.json();
}

async function falGetResult(model, id) {
  const r = await fetch(`${FAL_BASE}/${model}/requests/${id}`, { headers: HDR });
  if (!r.ok) throw new Error(`result: ${r.status}`);
  return r.json();
}

async function pollUntilDone(model, id, label, maxMin = 12) {
  const start = Date.now();
  let lastLog = 0;
  while (true) {
    const elapsed = (Date.now() - start) / 1000;
    if (elapsed > maxMin * 60) throw new Error(`Timeout ${label}`);
    const s = await falGetStatus(model, id);
    if (s.status === "COMPLETED") return falGetResult(model, id);
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
async function generateEmptyLot() {
  console.log("▸ Gerando imagem [terreno-vazio] via FLUX Pro Ultra...");
  const model = "fal-ai/flux-pro/v1.1-ultra";
  const submit = await falSubmit(model, {
    prompt: PROMPT_EMPTY_LOT,
    aspect_ratio: "16:9",
    num_images: 1,
    enable_safety_checker: false,
    output_format: "jpeg",
    safety_tolerance: "5",
  });
  console.log(`   request_id: ${submit.request_id}`);
  const result = await pollUntilDone("fal-ai/flux-pro", submit.request_id, "FLUX terreno");
  const url = result.images?.[0]?.url;
  if (!url) throw new Error("FLUX: sem URL");
  console.log(`\n   ✓ ${url}`);
  return url;
}

async function generateKlingVideo(startUrl, endUrl) {
  console.log("▸ Submetendo Kling 1.6 Pro image-to-video (10s)...");
  const model = "fal-ai/kling-video/v1.6/pro/image-to-video";
  const submit = await falSubmit(model, {
    image_url: startUrl,
    tail_image_url: endUrl,
    prompt: PROMPT_VIDEO,
    negative_prompt: NEG_VIDEO,
    duration: "10",
    aspect_ratio: "16:9",
    cfg_scale: 0.5,
  });
  console.log(`   request_id: ${submit.request_id}`);
  writeFileSync(
    path.join(TMP, "kling-request.json"),
    JSON.stringify(submit, null, 2),
  );
  console.log(`   (em caso de crash, retomar com: --resume ${submit.request_id})`);
  const result = await pollUntilDone(
    "fal-ai/kling-video",
    submit.request_id,
    "Kling video",
    15,
  );
  const videoUrl = result.video?.url;
  if (!videoUrl) throw new Error("Kling: sem URL no result");
  console.log(`\n   ✓ ${videoUrl}`);
  return videoUrl;
}

async function resumeKling(id) {
  console.log(`▸ Retomando Kling request ${id}...`);
  const result = await pollUntilDone("fal-ai/kling-video", id, "Kling resume", 15);
  const videoUrl = result.video?.url;
  if (!videoUrl) throw new Error("Kling: sem URL no result");
  return videoUrl;
}

/* -------- Main -------- */
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  BARCH · Hero 3D Imersivo · Kling pipeline           ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  mkdirSync(TMP, { recursive: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  // 1. End frame: usa hero-golden-hour.webp (casa completa, golden hour)
  //    O Kling precisa de URL pública para o tail_image. Vou fazer upload no fal storage.
  let videoUrl;
  if (RESUME_ID) {
    videoUrl = await resumeKling(RESUME_ID);
  } else {
    // Sobe o hero-golden-hour como tail_image
    const endPath = path.join(HERO_DIR, "hero-golden-hour.webp");
    if (!existsSync(endPath)) {
      throw new Error(`hero-golden-hour.webp não encontrado em ${endPath}`);
    }

    // Upload to Fal storage (eles aceitam multipart/form-data ou base64 URL)
    console.log("▸ Convertendo hero-golden-hour para data URL...");
    const endBuf = readFileSync(endPath);
    const endDataUrl = `data:image/webp;base64,${endBuf.toString("base64")}`;

    // 2. Gera start frame
    const startUrl = await generateEmptyLot();

    // 3. Submete Kling
    videoUrl = await generateKlingVideo(startUrl, endDataUrl);
  }

  // 4. Download video
  const videoPath = path.join(TMP, "construction.mp4");
  console.log("▸ Baixando .mp4...");
  const sz = await downloadFile(videoUrl, videoPath);
  console.log(`   ✓ ${(sz / 1024 / 1024).toFixed(2)} MB`);

  // 5. ffmpeg extract
  console.log("\n▸ Extraindo 240 frames a 24fps...");
  const ff = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      videoPath,
      "-vf",
      "fps=24,scale=1920:1080:flags=lanczos",
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
  if (ff.status !== 0) throw new Error("ffmpeg falhou — instale: brew install ffmpeg");

  // 6. Manifest
  const entries = await readdir(FRAMES_DIR);
  const frames = entries.filter((f) => /^frame_\d+\.webp$/.test(f)).sort();
  let totalBytes = 0;
  for (const f of frames) totalBytes += (await stat(path.join(FRAMES_DIR, f))).size;

  const manifest = {
    count: frames.length,
    prefix: "/frames/frame_",
    extension: ".webp",
    pad: 4,
    width: 1920,
    height: 1080,
    version: String(Date.now()),
    pipeline: "fal-ai · kling-1.6-pro · flux-pro-1.1-ultra",
    generatedAt: new Date().toISOString(),
    totalBytes,
  };
  await writeFile(
    path.join(FRAMES_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8",
  );

  console.log(`\n✅ ${frames.length} frames · ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   manifest: public/frames/manifest.json`);
  console.log("\n▸ Próximo: npm run build && git push\n");
}

main().catch((e) => {
  console.error("\n❌ Pipeline falhou:");
  console.error("  ", e.message);
  process.exit(1);
});
