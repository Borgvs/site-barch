#!/usr/bin/env node
/**
 * FGAA v1.0 — Fase 3: Submissão paralela dos 6 vídeos Veo 3.1 first-last-frame
 *
 * Endpoint: fal-ai/veo3.1/first-last-frame-to-video
 * Pricing: $0.20/s 1080p sem áudio × 30s = $6.00 total
 *
 * Submete os 6 jobs em paralelo (cada um leva ~60-120s no Veo).
 * Salva request_ids em tmp/hero-v8/videos/jobs.json.
 * Use 03-videos-poll.mjs depois para baixar.
 */

import fs from "node:fs/promises";
import path from "node:path";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("FAL_KEY ausente"); process.exit(1); }

const TMP_DIR = path.resolve("tmp/hero-v8");
const VIDEOS_DIR = path.join(TMP_DIR, "videos");
await fs.mkdir(VIDEOS_DIR, { recursive: true });

/* Cadeia desconstrutiva — 6 clips de 5s cada */
const CLIPS = [
  {
    code: "C1",
    name: "I6 → I5 — habitação se aquieta",
    first: "I6-mestra-1920x1080.jpg",
    last: "I5.jpg",
    prompt: "Cinematic architectural time-lapse: the inhabitants slowly leave the scene, the sculpture at the entrance dissolves, the manicured lawn transitions into wild natural grasses growing organically, the urban sidewalk fades away, the sky clears from dramatic clouds to calm pale blue. The architecture itself remains absolutely intact and motionless throughout. Camera completely static. No camera movement. No people. No vehicles. Anti-dramatic, contemplative.",
  },
  {
    code: "C2",
    name: "I5 → I4 — vedações evaporam",
    first: "I5.jpg",
    last: "I4.jpg",
    prompt: "Cinematic architectural time-lapse: the vertical wood panels and corten perforated screens of the upper volume gradually dematerialize and fade away, revealing the bare structural concrete frame behind them. Glass windows vanish. The hanging vegetation in the intermediate planter retreats. The stone walls of the ground floor and the structural slabs remain intact throughout. Camera completely static, no camera movement, no pan, no zoom. Anti-dramatic.",
  },
  {
    code: "C3",
    name: "I4 → I3 — térreo desmonta",
    first: "I4.jpg",
    last: "I3.jpg",
    prompt: "Cinematic architectural time-lapse: the stacked natural stone walls of the ground floor gradually dematerialize and fade away. The glass openings and entrance recess vanish. Only the bare concrete columns and slabs remain visible, forming a skeletal open framework. Surrounding terrain, vegetation, sky and atmosphere remain absolutely intact. Camera completely static, no camera movement. Anti-dramatic.",
  },
  {
    code: "C4",
    name: "I3 → I2 — esqueleto se decompõe",
    first: "I3.jpg",
    last: "I2.jpg",
    prompt: "Cinematic architectural time-lapse: the upper roof slab, the intermediate concrete slab, and all vertical concrete columns gradually dematerialize and fade upward into the air, leaving only the bare ground floor concrete slab resting on the terrain. The surrounding landscape, vegetation, sky and atmosphere remain intact. Camera completely static. Anti-dramatic, contemplative dissolution.",
  },
  {
    code: "C5",
    name: "I2 → I1 — laje rompe, escavação revela",
    first: "I2.jpg",
    last: "I1.jpg",
    prompt: "Cinematic architectural time-lapse: the ground floor concrete slab fragments and disappears, revealing underneath an excavated foundation pit dug into the earth. Concrete foundation footings emerge inside the pit with exposed steel reinforcement. Loose earth piles at the edges. Surrounding undisturbed terrain, vegetation, sky and atmosphere remain intact. Camera completely static. Anti-dramatic.",
  },
  {
    code: "C6",
    name: "I1 → I0 — terreno renasce",
    first: "I1.jpg",
    last: "I0.jpg",
    prompt: "Cinematic architectural time-lapse: the excavated foundation pit gradually fills with natural earth, the concrete footings and steel rebar dissolve into the ground, and wild native grasses grow back across the former construction footprint, returning the site to undisturbed natural terrain. The surrounding landscape, vegetation, sky and atmosphere remain intact. Camera completely static. Anti-dramatic, peaceful return to nature.",
  },
];

async function uploadToFal(filePath) {
  const fileBuf = await fs.readFile(filePath);
  const initResp = await fetch(
    "https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3",
    {
      method: "POST",
      headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ file_name: path.basename(filePath), content_type: "image/jpeg" }),
    },
  );
  if (!initResp.ok) throw new Error(`init ${initResp.status}: ${await initResp.text()}`);
  const { upload_url, file_url } = await initResp.json();
  const putResp = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: fileBuf,
  });
  if (!putResp.ok) throw new Error(`PUT ${putResp.status}`);
  return file_url;
}

async function submitOne(clip) {
  const firstPath = path.join(TMP_DIR, clip.first);
  const lastPath = path.join(TMP_DIR, clip.last);

  console.log(`  → ${clip.code} (${clip.name})`);
  const [firstUrl, lastUrl] = await Promise.all([uploadToFal(firstPath), uploadToFal(lastPath)]);
  console.log(`    uploaded both anchors`);

  const submit = await fetch(
    "https://queue.fal.run/fal-ai/veo3.1/first-last-frame-to-video",
    {
      method: "POST",
      headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: clip.prompt,
        first_frame_url: firstUrl,
        last_frame_url: lastUrl,
        aspect_ratio: "16:9",
        duration: "6s",
        resolution: "1080p",
        generate_audio: false,
        enhance_prompt: false,
      }),
    },
  );
  if (!submit.ok) throw new Error(`${clip.code} submit ${submit.status}: ${await submit.text()}`);
  const { request_id, status_url, response_url } = await submit.json();
  console.log(`    ✓ submetido · ${request_id}`);
  return {
    code: clip.code,
    name: clip.name,
    first_url: firstUrl,
    last_url: lastUrl,
    prompt: clip.prompt,
    request_id,
    status_url,
    response_url,
    submitted_at: new Date().toISOString(),
  };
}

console.log(`\n━━━ FGAA v1.0 · Fase 3 · 6 vídeos Veo 3.1 first-last-frame ━━━\n`);
console.log(`  Endpoint  : fal-ai/veo3.1/first-last-frame-to-video`);
console.log(`  Resolução : 1080p sem áudio`);
console.log(`  Duração   : 5s por clip × 6 = 30s total`);
console.log(`  Custo est : $0.20/s × 30s = $6.00\n`);

const jobs = [];
for (const clip of CLIPS) {
  try {
    const job = await submitOne(clip);
    jobs.push(job);
  } catch (e) {
    console.error(`  ✗ ${clip.code} FALHOU: ${e.message}`);
    jobs.push({ code: clip.code, error: e.message });
  }
}

const jobsPath = path.join(VIDEOS_DIR, "jobs.json");
await fs.writeFile(jobsPath, JSON.stringify(jobs, null, 2));
console.log(`\n━━━ ${jobs.filter(j => !j.error).length}/${CLIPS.length} jobs submetidos ━━━`);
console.log(`  Salvos em : ${jobsPath}`);
console.log(`\n  Próximo passo: aguardar ~2-3 min e rodar:`);
console.log(`    node scripts/fgaa/03-videos-poll.mjs\n`);
