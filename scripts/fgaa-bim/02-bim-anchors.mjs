#!/usr/bin/env node
/**
 * FGAA-BIM v1.0 · Fase 2 — Anchors derivativas B4 → B0
 *
 * Cada anchor preserva a perspectiva drone, o terreno, a atmosfera e a
 * volumetria da casa, alterando APENAS o que precisa mudar para regredir
 * uma fase construtiva. Critério-mãe igual ao FGAA hero.
 *
 * Uso:
 *   node scripts/fgaa-bim/02-bim-anchors.mjs <B0|B1|B2|B3|B4>
 *
 * Endpoint: fal-ai/flux-pro/kontext/max  (~$0.08/img)
 *
 * Cadeia derivativa:
 *   B5 (master) → B4 (vedações em construção) → B3 (estrutura + MEP)
 *     → B2 (estrutura nua) → B1 (fundação) → B0 (terreno marcado)
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("FAL_KEY ausente"); process.exit(1); }

const OUT_DIR = path.resolve("tmp/bim-v1");

const CADEIA = {
  B4: {
    name: "Vedações em construção · andaimes ativos",
    source: "B5.jpg",
    prompt: `From the upper volume, replace the finished cladding with a construction-in-progress state: about half of the dark walnut wood vertical slat panels and the corten perforated muxarabi panels are MISSING, revealing the bare structural concrete frame behind — vertical columns and horizontal beams of exposed concrete clearly visible. Metal scaffolding is set up against the facade with horizontal walking platforms at the upper-volume level. Some construction boards leaning against the concrete walls of the ground floor. The intermediate concrete planter between the floors is visible but COMPLETELY EMPTY — no vegetation, no leaves, no greenery, just bare concrete planter edges. The dark-framed glass windows in the upper volume are MISSING entirely, showing open structural bays. The flat roof slab is finished and intact. The ground floor concrete walls look raw and newer. Keep absolutely intact: the building footprint and orientation, the drone perspective angle, the structural concrete frame, the roof slab, the surrounding terrain with wild grasses, the mature trees framing the lot, the layered hills, the late afternoon sky and atmosphere, the warm grazing sunlight.`,
    preservar: "perspectiva drone, footprint, terreno, atmosfera, sol grazing",
  },
  B3: {
    name: "Estrutura aparente + MEP visível (código de cor BIM)",
    source: "B4.jpg",
    prompt: `Remove all remaining wood and corten cladding panels from the upper volume entirely. Remove all scaffolding. The upper volume is now ONLY a bare structural concrete frame: vertical concrete columns and horizontal concrete beams supporting the roof slab, completely open and unobstructed, no enclosure, no walls. The intermediate concrete planter remains as bare concrete edge. From the bare concrete walls and slabs of the ground floor and from the underside of the intermediate slab, show colorful exposed MEP installations: bright RED PEX pipes (hot water), bright BLUE PEX pipes (cold water), bright YELLOW corrugated electrical conduits, and silver-gray rectangular HVAC ducts emerging from slabs and wall openings in a coordinated organized grid. The ground-floor concrete walls are still raw without finish. The roof slab remains intact. Keep absolutely intact: the drone perspective angle, the building footprint, the structural concrete frame, the roof slab, the terrain with wild grasses, the trees, the hills, the atmosphere.`,
    preservar: "perspectiva drone, estrutura concreto, terreno, atmosfera",
  },
  B2: {
    name: "Estrutura nua · concreto aparente sem MEP",
    source: "B3.jpg",
    prompt: `Remove ALL colored plumbing pipes (red, blue, yellow conduits) and ALL HVAC ducts entirely. The structure is now ONLY clean exposed structural concrete: a clean rectangular ground-floor concrete slab forming the building footprint, vertical concrete columns rising from this slab at regular bays, horizontal concrete beams connecting columns at the intermediate level, an intermediate concrete slab (with bare concrete planter edge along one side), more vertical columns rising from intermediate slab to support the top, and the flat cantilevered roof slab capping the whole frame. Everything is bare structural concrete in warm cool grey tones, no enclosure, no walls, no MEP, no finishes — just a clean skeletal architectural concrete frame catching the late afternoon golden light. Keep absolutely intact: the drone perspective angle, the building footprint, the terrain with wild grasses, the trees, the hills, the sky atmosphere.`,
    preservar: "perspectiva drone, esqueleto concreto puro, terreno, atmosfera",
  },
  B1: {
    name: "Fundação · sapatas + stubs de pilares emergindo",
    source: "B2.jpg",
    prompt: `Remove the entire upper structural concrete frame: remove all upper columns, the intermediate slab, the planter edge, the upper-volume columns, and the flat roof slab. What MUST remain visible: the ground-floor concrete slab forming the clean rectangular building footprint at terrain level, AND short concrete column stubs (about 1 to 1.5 meters tall) emerging vertically from the slab at regular bays across the entire footprint. Some exposed steel reinforcement rebar pokes up from the top of each stub column, indicating they are mid-construction. Around the footprint on the natural terrain: a few subtle construction-site markers — a small pile of sand near one corner, a wheelbarrow (without people) parked at the edge, some wooden boards stacked. NO people, NO active workers in the frame. Keep absolutely intact: the drone perspective angle, the building footprint orientation, the surrounding terrain with wild grasses, the mature trees, the layered hills, the late afternoon sky and atmosphere.`,
    preservar: "perspectiva drone, footprint laje + stubs, terreno, atmosfera",
  },
  B0: {
    name: "Terreno marcado · locação topográfica antes da obra",
    source: "B1.jpg",
    prompt: `Remove the concrete ground-floor slab and all the column stubs entirely. Remove the construction debris (sand pile, wheelbarrow, boards) entirely. Fill the entire former building area with undisturbed natural terrain matching exactly the surrounding ground: same wild native grasses 40 to 80cm tall in tan amber and ochre tones, growing organically and seamlessly across what used to be the building footprint, with no visible disturbance. ADD: visible topographic survey markers indicating where the future building will be — small wooden survey stakes with bright orange flagging tape at regular intervals defining a rectangular outline matching the original footprint, a topographic surveyor tripod at one corner (without a surveyor), a few additional marker pins along the perimeter. The terrain looks completely natural and untouched except for these subtle survey markers indicating future intent. NO people. Keep absolutely intact: the drone perspective angle, the surrounding terrain, the mature trees, the layered hills, the late afternoon sky and atmosphere.`,
    preservar: "perspectiva drone, terreno virgem + marcação topográfica, atmosfera",
  },
};

async function uploadToFal(filePath) {
  console.log(`  → upload ${path.basename(filePath)}...`);
  const fileBuf = await fs.readFile(filePath);
  const initResp = await fetch("https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3", {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ file_name: path.basename(filePath), content_type: "image/jpeg" }),
  });
  if (!initResp.ok) throw new Error(`init ${initResp.status}: ${await initResp.text()}`);
  const { upload_url, file_url } = await initResp.json();
  const putResp = await fetch(upload_url, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: fileBuf });
  if (!putResp.ok) throw new Error(`PUT ${putResp.status}: ${await putResp.text()}`);
  console.log(`  ✓ ${file_url}`);
  return file_url;
}

async function kontextEdit(imageUrl, prompt) {
  console.log(`  → FLUX.1 Kontext Max...`);
  const submit = await fetch("https://queue.fal.run/fal-ai/flux-pro/kontext/max", {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      image_url: imageUrl,
      guidance_scale: 3.5,
      num_inference_steps: 28,
      num_images: 1,
      output_format: "jpeg",
      safety_tolerance: "5",
      aspect_ratio: "16:9",
    }),
  });
  if (!submit.ok) throw new Error(`submit ${submit.status}: ${await submit.text()}`);
  const { request_id, status_url, response_url } = await submit.json();
  console.log(`  request_id: ${request_id}`);

  for (let i = 0; i < 100; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const s = await (await fetch(status_url, { headers: { Authorization: `Key ${FAL_KEY}` } })).json();
    process.stdout.write(`\r  status: ${s.status} (${i * 3}s)   `);
    if (s.status === "COMPLETED") {
      const result = await (await fetch(response_url, { headers: { Authorization: `Key ${FAL_KEY}` } })).json();
      const url = result.images?.[0]?.url;
      if (!url) throw new Error(`sem URL: ${JSON.stringify(result)}`);
      console.log(`\n  ✓ ${url}`);
      return { url, request_id };
    }
    if (s.status === "FAILED" || s.status === "ERROR") {
      throw new Error(`${s.status}: ${JSON.stringify(s)}`);
    }
  }
  throw new Error("timeout");
}

const target = process.argv[2];
if (!target || !CADEIA[target]) {
  console.error(`Uso: node scripts/fgaa-bim/02-bim-anchors.mjs <B0|B1|B2|B3|B4>`);
  process.exit(1);
}

const config = CADEIA[target];
const sourcePath = path.join(OUT_DIR, config.source);

console.log(`\n━━━ FGAA-BIM v1.0 · Fase 2 · ${target} — ${config.name} ━━━\n`);
console.log(`  Source: ${config.source}`);
console.log(`  Preservar: ${config.preservar}\n`);

const t0 = Date.now();
const sourceUrl = await uploadToFal(sourcePath);
const { url: resultUrl, request_id } = await kontextEdit(sourceUrl, config.prompt);
const imgResp = await fetch(resultUrl);
const imgBuf = Buffer.from(await imgResp.arrayBuffer());
const outPath = path.join(OUT_DIR, `${target}.jpg`);
await fs.writeFile(outPath, imgBuf);
await fs.writeFile(
  path.join(OUT_DIR, `${target}.json`),
  JSON.stringify({
    version: "FGAA-BIM v1.0 · Fase 2",
    anchor: target,
    name: config.name,
    endpoint: "fal-ai/flux-pro/kontext/max",
    timestamp: new Date().toISOString(),
    source: { path: config.source, url: sourceUrl },
    prompt: config.prompt,
    preservar: config.preservar,
    result: { url: resultUrl, request_id, local: outPath },
    duration_s: (Date.now() - t0) / 1000,
    size_kb: (imgBuf.length / 1024).toFixed(1),
  }, null, 2),
);

console.log(`\n━━━ ${target} OK em ${((Date.now() - t0) / 1000).toFixed(1)}s · ${(imgBuf.length / 1024).toFixed(0)} KB ━━━`);
const next = { B4: "B3", B3: "B2", B2: "B1", B1: "B0", B0: null }[target];
if (next) console.log(`Próximo: node scripts/fgaa-bim/02-bim-anchors.mjs ${next}\n`);
else console.log(`Cadeia BIM completa. Próximo: 03-bim-videos.mjs\n`);
