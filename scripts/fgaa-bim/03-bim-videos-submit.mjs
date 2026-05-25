#!/usr/bin/env node
/**
 * FGAA-BIM v1.0 · Fase 3 — Submissão paralela dos 5 vídeos Veo 3.1
 *
 * Cadeia construtiva (não desconstrutiva como no hero): primeira fase é
 * terreno marcado, última é casa pronta. O cliente vê a obra crescendo.
 *
 * Endpoint: fal-ai/veo3.1/first-last-frame-to-video
 * Pricing : $0.20/s × 6s × 5 clips = $6.00
 */

import fs from "node:fs/promises";
import path from "node:path";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("FAL_KEY ausente"); process.exit(1); }

const TMP_DIR = path.resolve("tmp/bim-v1");
const VIDEOS_DIR = path.join(TMP_DIR, "videos");
await fs.mkdir(VIDEOS_DIR, { recursive: true });

const CLIPS = [
  {
    code: "BC1",
    name: "B0 → B1 — locação vira fundação",
    first: "B0.jpg",
    last: "B1.jpg",
    prompt: "Cinematic aerial drone time-lapse of construction site: the orange topographic survey ribbon and wooden survey stakes gradually dematerialize as the earth in the marked area is excavated and replaced by a clean rectangular concrete foundation slab at ground level. From this slab, short concrete column stubs emerge vertically at regular intervals with steel reinforcement rebar poking up from their tops. A small pile of sand and a wheelbarrow appear at the edges. Surrounding wild grasses, araucaria trees, layered hills and the late afternoon sky atmosphere remain absolutely intact throughout. Camera completely static, drone hovering, no camera movement, no pan, no zoom. Anti-dramatic, documentary observational style. No people.",
  },
  {
    code: "BC2",
    name: "B1 → B2 — fundação cresce em estrutura",
    first: "B1.jpg",
    last: "B2.jpg",
    prompt: "Cinematic aerial drone time-lapse of construction site: the construction debris around the foundation (sand pile, wheelbarrow) gradually disappears. From the short concrete column stubs on the slab, vertical concrete columns rise upward and grow taller, supporting horizontal concrete beams that materialize at an intermediate level, then an intermediate concrete slab forms, then more columns grow above it supporting the cantilevered top roof slab. The result is a complete clean skeletal concrete frame. Surrounding terrain, araucaria trees, layered hills and atmosphere remain intact. Camera completely static, drone hovering, no movement. Anti-dramatic, documentary observational style.",
  },
  {
    code: "BC3",
    name: "B2 → B3 — instalações coloridas chegam",
    first: "B2.jpg",
    last: "B3.jpg",
    prompt: "Cinematic aerial drone time-lapse of construction site: bright red PEX plumbing pipes for hot water and bright blue PEX pipes for cold water gradually emerge and grow across the bare concrete walls of the ground floor and along the underside of the intermediate slab, snaking in a coordinated pattern. The bare structural concrete frame remains absolutely intact. Surrounding terrain, araucaria trees, layered hills, sky and atmosphere remain intact. Camera completely static, drone hovering, no movement. Anti-dramatic, documentary observational style. No people.",
  },
  {
    code: "BC4",
    name: "B3 → B4 — vedações começam, MEP fica embutida",
    first: "B3.jpg",
    last: "B4.jpg",
    prompt: "Cinematic aerial drone time-lapse of construction site: the colored plumbing pipes gradually fade as concrete walls and openings fill in around them at the ground floor. The upper volume between the columns remains open. Some construction boards lean against the walls, scaffolding may appear at the upper level. The cantilevered roof slab and overall structural frame remain absolutely intact. Surrounding terrain, araucaria trees, layered hills, sky and atmosphere remain intact. Camera completely static, drone hovering, no movement. Anti-dramatic, documentary observational style. No people.",
  },
  {
    code: "BC5",
    name: "B4 → B5 — casa se conclui",
    first: "B4.jpg",
    last: "B5.jpg",
    prompt: "Cinematic aerial drone time-lapse of construction site: scaffolding and construction boards disappear. The upper volume gets clad in dark walnut wood vertical slat panels and corten steel perforated muxarabi screens. Large dark-framed glass windows appear in the upper volume. The intermediate concrete planter gradually fills with dense cascading philodendron leaves and trailing tropical vegetation hanging vertically. The ground floor walls finish in board-formed concrete with cool grey tones. The cantilevered roof slab remains. Surrounding terrain with wild amber grasses, mature araucaria and native trees, layered hills, late afternoon golden-hour sky atmosphere remain absolutely intact. Camera completely static, drone hovering, no camera movement. Anti-dramatic, documentary observational style, cinematic golden hour. No people, no vehicles.",
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

console.log(`\n━━━ FGAA-BIM v1.0 · Fase 3 · 5 vídeos Veo 3.1 ━━━\n`);
console.log(`  Endpoint  : fal-ai/veo3.1/first-last-frame-to-video`);
console.log(`  Resolução : 1080p sem áudio`);
console.log(`  Duração   : 6s por clip × 5 = 30s total`);
console.log(`  Custo est : $6.00\n`);

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
console.log(`  Salvos: ${jobsPath}`);
console.log(`\n  Aguarde ~2-4 min e rode: node scripts/fgaa-bim/03-bim-videos-poll.mjs\n`);
