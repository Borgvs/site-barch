#!/usr/bin/env node
/**
 * FGAA · resubmeter clips Veo 3.1 afetados pelos refinamentos de I4 e I2:
 *   C2: I5→I4  (I4 mudou)
 *   C3: I4→I3  (I4 mudou)
 *   C4: I3→I2  (I2 mudou)
 *   C5: I2→I1  (I2 mudou)
 */

import fs from "node:fs/promises";
import path from "node:path";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("FAL_KEY ausente"); process.exit(1); }

const TMP_DIR = path.resolve("tmp/hero-v8");
const VIDEOS_DIR = path.join(TMP_DIR, "videos");

const CLIPS = [
  { code: "C2", first: "I5.jpg", last: "I4.jpg",
    prompt: "Cinematic architectural time-lapse: the vertical wood panels and corten perforated screens of the upper volume gradually dematerialize and fade away, revealing the bare structural concrete frame behind them. Glass windows vanish. CRITICAL: the dense hanging vegetation in the intermediate planter (philodendrons cascading down) remains absolutely intact throughout — do not remove or fade the green vegetation at any point. The stone walls of the ground floor remain intact. Camera completely static. Anti-dramatic." },
  { code: "C3", first: "I4.jpg", last: "I3.jpg",
    prompt: "Cinematic architectural time-lapse: the stacked natural stone walls of the ground floor gradually dematerialize and fade away. The glass openings and entrance recess vanish. The hanging vegetation in the intermediate planter slowly retreats and fades into the planter. Only the bare concrete columns and slabs remain visible, forming a skeletal open framework. Surrounding terrain, vegetation, sky and atmosphere remain absolutely intact. Camera completely static. Anti-dramatic." },
  { code: "C4", first: "I3.jpg", last: "I2.jpg",
    prompt: "Cinematic architectural time-lapse: the upper roof slab dematerializes and fades upward into the air. The intermediate concrete slab fades away. The upper portion of the vertical concrete columns shortens, leaving only the lower stub portions (about 1 to 1.5 meters tall) emerging vertically from the ground slab, with exposed steel reinforcement bars at their tops. The ground floor concrete platform remains as a rectangular footprint. Surrounding landscape, vegetation, sky and atmosphere remain intact. Camera completely static. Anti-dramatic." },
  { code: "C5", first: "I2.jpg", last: "I1.jpg",
    prompt: "Cinematic architectural time-lapse: the ground floor concrete slab fragments and disappears, revealing underneath an excavated foundation pit dug into the earth. The short column stubs and their exposed reinforcement transition into concrete foundation footings inside the pit. Loose earth piles at the edges. Surrounding undisturbed terrain, vegetation, sky and atmosphere remain intact. Camera completely static. Anti-dramatic." },
];

async function uploadToFal(filePath) {
  const fileBuf = await fs.readFile(filePath);
  const initResp = await fetch(
    "https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3",
    { method: "POST",
      headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ file_name: path.basename(filePath), content_type: "image/jpeg" }) },
  );
  const { upload_url, file_url } = await initResp.json();
  await fetch(upload_url, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: fileBuf });
  return file_url;
}

const jobs = [];
for (const c of CLIPS) {
  const [f, l] = await Promise.all([uploadToFal(path.join(TMP_DIR, c.first)), uploadToFal(path.join(TMP_DIR, c.last))]);
  const submit = await fetch("https://queue.fal.run/fal-ai/veo3.1/first-last-frame-to-video", {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: c.prompt, first_frame_url: f, last_frame_url: l, aspect_ratio: "16:9", duration: "6s", resolution: "1080p", generate_audio: false, enhance_prompt: false }),
  });
  const j = await submit.json();
  console.log(`✓ ${c.code} submetido · ${j.request_id}`);
  jobs.push({ code: c.code, first_url: f, last_url: l, ...j, submitted_at: new Date().toISOString() });
}
await fs.writeFile(path.join(VIDEOS_DIR, "jobs-v2.json"), JSON.stringify(jobs, null, 2));
console.log(`\n${jobs.length} jobs submetidos em jobs-v2.json`);
