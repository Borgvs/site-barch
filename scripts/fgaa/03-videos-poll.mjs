#!/usr/bin/env node
/**
 * FGAA v1.0 — Fase 3 polling: aguarda os 6 jobs Veo 3.1 e baixa os vídeos
 */

import fs from "node:fs/promises";
import path from "node:path";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("FAL_KEY ausente"); process.exit(1); }

const VIDEOS_DIR = path.resolve("tmp/hero-v8/videos");
const jobs = JSON.parse(await fs.readFile(path.join(VIDEOS_DIR, "jobs.json"), "utf8"));

console.log(`\n━━━ Polling ${jobs.length} jobs Veo 3.1 ━━━\n`);

async function pollJob(job) {
  if (job.error) return job;
  if (job.done) return job; // já baixado
  try {
    const s = await (await fetch(job.status_url, { headers: { Authorization: `Key ${FAL_KEY}` } })).json();
    if (s.status === "COMPLETED") {
      const result = await (await fetch(job.response_url, { headers: { Authorization: `Key ${FAL_KEY}` } })).json();
      const url = result.video?.url || result.url;
      if (!url) return { ...job, error: `sem URL no resultado: ${JSON.stringify(result)}` };

      const vidResp = await fetch(url);
      const vidBuf = Buffer.from(await vidResp.arrayBuffer());
      const fname = `${job.code}.mp4`;
      const fpath = path.join(VIDEOS_DIR, fname);
      await fs.writeFile(fpath, vidBuf);
      console.log(`  ✓ ${job.code} salvo · ${(vidBuf.length / 1024 / 1024).toFixed(1)} MB`);
      return { ...job, done: true, video_url: url, local_path: fpath, size_mb: (vidBuf.length / 1024 / 1024).toFixed(2) };
    }
    if (s.status === "FAILED" || s.status === "ERROR") {
      return { ...job, error: `${s.status}: ${JSON.stringify(s)}` };
    }
    return { ...job, status: s.status };
  } catch (e) {
    return { ...job, last_poll_error: e.message };
  }
}

for (let round = 0; round < 80; round++) {
  const updated = [];
  for (const j of jobs) {
    updated.push(await pollJob(j));
  }
  jobs.splice(0, jobs.length, ...updated);

  await fs.writeFile(path.join(VIDEOS_DIR, "jobs.json"), JSON.stringify(jobs, null, 2));

  const pending = jobs.filter(j => !j.done && !j.error).length;
  const done = jobs.filter(j => j.done).length;
  const errored = jobs.filter(j => j.error).length;
  console.log(`  Round ${round + 1}: ${done} done · ${pending} pending · ${errored} error`);

  if (pending === 0) break;
  await new Promise(r => setTimeout(r, 10000));
}

console.log(`\n━━━ Polling concluído ━━━`);
jobs.forEach(j => {
  if (j.done) console.log(`  ✓ ${j.code} OK`);
  else if (j.error) console.log(`  ✗ ${j.code}: ${j.error}`);
  else console.log(`  ⏳ ${j.code} ainda ${j.status || 'pending'}`);
});
console.log();
