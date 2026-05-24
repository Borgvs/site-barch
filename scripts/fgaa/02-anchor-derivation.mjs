#!/usr/bin/env node
/**
 * FGAA v1.0 — Fase 2: Derivação de Anchor Frames em cadeia
 *
 * Uso:
 *   node scripts/fgaa/02-anchor-derivation.mjs <anchor_id>
 * onde anchor_id ∈ {I5, I4, I3, I2, I1, I0}
 *
 * Pipeline:
 *   1. Lê o anchor anterior (I6 mestra para I5, I5 para I4, etc)
 *   2. Faz upload para Fal Storage (se ainda não tiver URL)
 *   3. Disparar FLUX.1 Kontext Max com prompt cirúrgico do que remover
 *   4. Salvar resultado + metadata + URL Fal
 *
 * Endpoint: fal-ai/flux-pro/kontext/max  ($0.08/img)
 *
 * Política: cada anchor preserva volumetria + materiais + atmosfera da anterior,
 * removendo APENAS o conjunto de elementos definido. Critério-mãe do framework.
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("FAL_KEY ausente"); process.exit(1); }

const ANCHORS_DIR = path.resolve("tmp/hero-v8/anchors");
const TMP_DIR = path.resolve("tmp/hero-v8");

/* --------------------------------------------------------------------
 * Configuração da cadeia derivativa — critério-mãe FGAA v1.0
 * ------------------------------------------------------------------ */

const CADEIA = {
  I5: {
    name: "Casa nua — sem habitação aparente",
    source: "I6-mestra-1920x1080.jpg",
    prompt: `Remove all the people walking and sitting in the scene. Remove the sculpture at the entrance. Remove the manicured lawn and replace it with wild natural grasses 40 to 80cm tall in tan-amber tones growing organically. Remove the paved sidewalk and curb at the bottom of the image. Remove the sunbeams visible filtering through the trees on the right. Make the sky calm clear pale blue with subtle warm horizon, no dramatic clouds, no turbulent cumulus. Keep absolutely intact: the building architecture, the cantilevered upper volume, all the wood and corten perforated panels, the concrete intermediate slab, the hanging vegetation cascading from the planter, the stacked natural stone ground floor walls, the glass openings, the entrance recess, the interior warm lighting visible through the glass, the trees on the sides, the overall horizontal framing.`,
    preservar: "geometria, materiais, jardineira pendente, vegetação lateral, atmosfera"
  },
  I4: {
    name: "Estrutura aparente — sem vedações superiores (jardineira preservada)",
    source: "I5.jpg",
    prompt: `From the upper volume, remove ONLY the vertical wood panels and the corten perforated muxarabi panels and the upper-level glass windows. Reveal behind these panels the bare structural concrete frame: vertical concrete columns and horizontal concrete beams supporting the slabs. The interior of the upper volume should be visible as an empty concrete frame, no enclosure. CRITICAL — the hanging vegetation in the intermediate planter must remain absolutely intact: the dense cascading philodendron leaves and trailing vines descending vertically from the intermediate slab edge must stay exactly as they are in the source, untouched, with the same density and the same green color. Also preserve absolutely: the cantilevered roof slab on top, the intermediate concrete slab in the middle with its planter edge full of vegetation, the ground floor with its natural stone walls and glass openings and entrance, the surrounding terrain with wild grasses, the sky, the lateral trees, the lighting and atmosphere. The hanging vegetation in the middle is THE most important element to preserve.`,
    preservar: "lajes, térreo intacto, jardineira pendente DENSA, terreno, atmosfera"
  },
  I3: {
    name: "Esqueleto primário — só lajes e pilares",
    source: "I4.jpg",
    prompt: `Remove all the ground floor enclosure: remove the stacked natural stone walls, remove the glass openings, remove the entrance door, remove the wood entrance recess. Reveal only the bare structural concrete frame of the ground floor: vertical concrete columns supporting the upper slab. The ground floor should be completely open and empty, showing only the concrete columns standing on the ground slab. Remove the hanging vegetation from the intermediate planter — only the bare concrete planter edge remains. The interior warm lighting must disappear. Keep absolutely intact: the upper roof slab, the intermediate concrete slab with bare planter edge, the upper structural concrete frame from previous anchor, the surrounding terrain, the sky, the lateral trees, the natural lighting and atmosphere.`,
    preservar: "lajes (cobertura + intermediária), pilares estruturais, terreno, atmosfera"
  },
  I2: {
    name: "Estrutura básica — laje térrea + pilares stub começando",
    source: "I3.jpg",
    prompt: `Remove the upper roof slab entirely. Remove the intermediate concrete slab entirely. Remove the upper portion of the vertical concrete columns. What MUST remain visible: the ground floor concrete slab at terrain level forming the building footprint, AND short concrete column stubs (about 1 to 1.5 meters tall) emerging vertically from the slab at regular intervals — these are the bases of the structural columns just starting to rise. Some exposed steel reinforcement rebar at the top of each stub column. The building footprint must clearly remain visible as a rectangular concrete platform with column stubs sprouting from it. NOT just an empty slab in grass — the column stubs are essential to read the geometry. Surrounding undisturbed terrain with wild grasses, lateral trees, layered hills, sky and atmosphere remain absolutely intact.`,
    preservar: "laje térrea + stubs de pilares + ferragens, terreno, atmosfera"
  },
  I1: {
    name: "Fundações — só escavação e sapatas",
    source: "I2.jpg",
    prompt: `Remove the ground floor concrete slab entirely. Reveal underneath an excavated foundation pit dug into the earth, showing the sandy-clay terrain dug out in a rectangular footprint matching the building outline. Inside this excavated pit, show concrete foundation footings (sapatas) at intervals, with subtle exposed steel reinforcement bars emerging from them. Some loose earth piled at the edges of the excavation. Keep absolutely intact: the surrounding undisturbed terrain with wild natural grasses, the lateral trees, the layered hills in the background, the sky atmosphere, the natural lighting.`,
    preservar: "escavação + sapatas, terreno ao redor intacto, atmosfera"
  },
  I0: {
    name: "Terreno virgem — sem qualquer construção",
    source: "I1.jpg",
    prompt: `Remove the excavated foundation pit entirely. Remove the concrete footings and steel reinforcement bars. Fill the excavated area with undisturbed natural terrain matching the surrounding ground: sandy-clay soil with the same wild native grasses 40 to 80cm tall in tan-amber tones, growing organically and seamlessly across what used to be the building footprint. The terrain should look completely natural and untouched, as if no construction ever took place. Keep absolutely intact: the surrounding terrain texture and vegetation continuity, the lateral trees, the layered hills in the background, the sky atmosphere with subtle late afternoon light, the volumetric haze, the natural lighting.`,
    preservar: "só terreno virgem, vegetação ao fundo, atmosfera idêntica"
  },
};

/* --------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------ */

async function uploadToFal(filePath) {
  console.log(`  → upload ${path.basename(filePath)} para Fal Storage...`);
  const fileBuf = await fs.readFile(filePath);
  const ext = path.extname(filePath).slice(1) || "jpg";
  const contentType = ext === "png" ? "image/png" : "image/jpeg";

  // Step 1: initiate upload
  const initResp = await fetch("https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3", {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      file_name: path.basename(filePath),
      content_type: contentType,
    }),
  });
  if (!initResp.ok) {
    const body = await initResp.text();
    throw new Error(`init upload ${initResp.status}: ${body}`);
  }
  const { upload_url, file_url } = await initResp.json();

  // Step 2: PUT raw bytes
  const putResp = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: fileBuf,
  });
  if (!putResp.ok) {
    throw new Error(`PUT upload ${putResp.status}: ${await putResp.text()}`);
  }

  console.log(`  ✓ uploaded · ${file_url}`);
  return file_url;
}

async function falKontextEdit(imageUrl, prompt) {
  console.log(`  → FLUX.1 Kontext Max edit...`);
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
  if (!submit.ok) {
    throw new Error(`submit ${submit.status}: ${await submit.text()}`);
  }
  const { request_id, status_url, response_url } = await submit.json();
  console.log(`  request_id: ${request_id}`);

  for (let i = 0; i < 100; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const s = await (await fetch(status_url, { headers: { Authorization: `Key ${FAL_KEY}` } })).json();
    process.stdout.write(`\r  status: ${s.status} (${i * 3}s)   `);
    if (s.status === "COMPLETED") {
      const result = await (await fetch(response_url, { headers: { Authorization: `Key ${FAL_KEY}` } })).json();
      const url = result.images?.[0]?.url;
      if (!url) throw new Error(`sem URL no resultado: ${JSON.stringify(result)}`);
      console.log(`\n  ✓ resultado: ${url}`);
      return { url, request_id, raw: result };
    }
    if (s.status === "FAILED" || s.status === "ERROR") {
      throw new Error(`${s.status}: ${JSON.stringify(s)}`);
    }
  }
  throw new Error("timeout");
}

/* --------------------------------------------------------------------
 * Main
 * ------------------------------------------------------------------ */

const target = process.argv[2];
if (!target || !CADEIA[target]) {
  console.error(`Uso: node scripts/fgaa/02-anchor-derivation.mjs <I5|I4|I3|I2|I1|I0>`);
  process.exit(1);
}

const config = CADEIA[target];
const sourcePath = path.join(TMP_DIR, config.source);

console.log(`\n━━━ FGAA v1.0 · Fase 2 · ${target} — ${config.name} ━━━\n`);
console.log(`  Source     : ${config.source}`);
console.log(`  Preservar  : ${config.preservar}`);
console.log(`  Endpoint   : fal-ai/flux-pro/kontext/max`);
console.log(`  Custo est  : ~$0.08\n`);

const t0 = Date.now();

// 1. Upload source
const sourceUrl = await uploadToFal(sourcePath);

// 2. Generate edit
const { url: resultUrl, request_id } = await falKontextEdit(sourceUrl, config.prompt);

// 3. Download result
const imgResp = await fetch(resultUrl);
const imgBuf = Buffer.from(await imgResp.arrayBuffer());
const outputPath = path.join(TMP_DIR, `${target}.jpg`);
await fs.writeFile(outputPath, imgBuf);

// 4. Save metadata
await fs.writeFile(
  path.join(TMP_DIR, `${target}.json`),
  JSON.stringify(
    {
      version: "FGAA v1.0 · Fase 2 anchor derivation",
      anchor: target,
      name: config.name,
      endpoint: "fal-ai/flux-pro/kontext/max",
      pricing: "$0.08/img",
      timestamp: new Date().toISOString(),
      source: { path: config.source, url: sourceUrl },
      prompt: config.prompt,
      preservar: config.preservar,
      result: { url: resultUrl, request_id, local: outputPath },
      duration_s: (Date.now() - t0) / 1000,
      size_kb: (imgBuf.length / 1024).toFixed(1),
    },
    null,
    2,
  ),
);

console.log(`\n━━━ ${target} CONCLUÍDO em ${((Date.now() - t0) / 1000).toFixed(1)}s ━━━`);
console.log(`  Salvo em   : ${outputPath}`);
console.log(`  Tamanho    : ${(imgBuf.length / 1024).toFixed(0)} KB`);
console.log(`  URL Fal    : ${resultUrl}`);
console.log(`\nValide o resultado. Se OK, rode próximo anchor:`);
const next = { I5: "I4", I4: "I3", I3: "I2", I2: "I1", I1: "I0", I0: null }[target];
if (next) console.log(`  node scripts/fgaa/02-anchor-derivation.mjs ${next}\n`);
else console.log(`  (último anchor — cadeia completa)\n`);
