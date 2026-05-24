#!/usr/bin/env node
/**
 * FGAA v1.0 — Fase 1
 * Geração da imagem-mestra (I6 · casa completa, golden hour)
 *
 * Endpoint: fal-ai/flux-2-pro (text-to-image)
 * Pricing: $0.03/MP
 *
 * Uso:
 *   node scripts/fgaa/01-master-image.mjs [variant]
 * onde variant ∈ {1, 2, 3, ...} para iterações com seeds diferentes.
 *
 * Output: tmp/hero-v8/anchors/I6-master-v{variant}-{seed}.jpg
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("FAL_KEY ausente — exporte do .env.local antes");
  process.exit(1);
}

const VARIANT = Number(process.argv[2] || 1);
const OUTPUT_DIR = path.resolve("tmp/hero-v8/anchors");
await fs.mkdir(OUTPUT_DIR, { recursive: true });

/**
 * Prompt-mestra v1.0 — Regionalismo crítico brasileiro
 * Calibrado a partir do FWK-FGAA-001 + referencias arquitetônicas explícitas.
 * NÃO alterar arbitrariamente entre iterações — variar via seed primeiro.
 */
const PROMPT = `Architectural photography of a contemporary Brazilian luxury residence in critical regionalism style, designed in the vocabulary of Bernardes Arquitetura, Jacobsen Arquitetura and Felipe Caboclo. Two horizontal rectangular volumes displaced in L-shaped plan, dominant horizontality (1:4 proportion), 4-meter structural cantilever extending over a still reflecting pool. Board-formed concrete walls with visible pine formwork grain (cura 28 days, raw tactile finish), cumaru wood deck and horizontal brise-soleil slats, floor-to-ceiling glass panes with minimal 20mm black frames, corten steel transition elements with natural patina, honed basalt stone exterior flooring. Double-height living space visible through glass, exposed concrete beams overhead, deep overhanging eaves protecting the deck. Lush native Brazilian tropical landscaping (jaboticabas, mature ipês, cerrado vegetation), gentle topographic slope rising at the rear, atmospheric golden hour light from the left casting long warm horizontal shadows, soft volumetric haze over distant green hills. Camera positioned low-medium height, slightly diagonal 30-degree three-quarter front-right view capturing horizontality, framing the house against open sky and distant landscape. Editorial architectural photography quality, shot on Phase One IQ4 150MP medium format with 24mm tilt-shift lens, f/8 aperture, natural ambient lighting only, no artificial lights visible. Horizontal cinematic composition 16:9 aspect ratio, ultra photorealistic, magazine editorial standard worthy of AD or Wallpaper. No people, no vehicles, no signage, no scaffolding, no construction equipment.`;

const NEGATIVE = `cartoon, illustration, render, sketch, 3d model, cgi look, vibrant saturated colors, neon, modern minimalist white box, glass curtain wall skyscraper, suburban tract home, mediterranean style, european chateau, asian temple, generic luxury, gold accents, marble veneer, scaffolding, construction equipment, cranes, workers, vehicles, watermark, text overlay, signature, blurry, low resolution, oversaturated, hdr garish, instagram filter, drone overhead view, top-down view`;

// Seed variável por iteração (determinístico e reproduzível)
const SEED = 100 + VARIANT * 1000;

const payload = {
  prompt: PROMPT,
  negative_prompt: NEGATIVE,
  image_size: { width: 1920, height: 1080 }, // 16:9 cinematic
  num_images: 1,
  enable_safety_checker: false,
  seed: SEED,
  num_inference_steps: 50, // máxima qualidade
  guidance_scale: 7.5,
};

console.log(`\n━━━ FGAA v1.0 · Fase 1 · Imagem-mestra · Variant ${VARIANT} ━━━`);
console.log(`  Endpoint  : fal-ai/flux-2-pro`);
console.log(`  Seed      : ${SEED}`);
console.log(`  Resolução : 1920×1080 (≈2 MP)`);
console.log(`  Custo est.: ~$0.06`);
console.log(`  Prompt    : ${PROMPT.slice(0, 120)}...`);
console.log();

const startTime = Date.now();

// Queue submission (long-running)
const submitResp = await fetch(
  "https://queue.fal.run/fal-ai/flux-2-pro",
  {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  },
);

if (!submitResp.ok) {
  const body = await submitResp.text();
  console.error(`SUBMIT falhou (${submitResp.status}):`, body);
  process.exit(1);
}

const { request_id, status_url, response_url } = await submitResp.json();
console.log(`  request_id: ${request_id}`);
console.log(`  aguardando geração...`);

// Poll status
let result = null;
for (let i = 0; i < 60; i++) {
  await new Promise((r) => setTimeout(r, 2500));
  const statusResp = await fetch(status_url, {
    headers: { Authorization: `Key ${FAL_KEY}` },
  });
  const status = await statusResp.json();
  process.stdout.write(`\r  status: ${status.status} (${((Date.now() - startTime) / 1000).toFixed(1)}s)   `);

  if (status.status === "COMPLETED") {
    const resp = await fetch(response_url, {
      headers: { Authorization: `Key ${FAL_KEY}` },
    });
    result = await resp.json();
    break;
  }
  if (status.status === "FAILED" || status.status === "ERROR") {
    console.error(`\n  FAL retornou ${status.status}:`, JSON.stringify(status, null, 2));
    process.exit(1);
  }
}

if (!result) {
  console.error(`\n  timeout — geração não completou em 150s`);
  process.exit(1);
}

console.log(`\n  ✓ geração concluída em ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

const imageUrl = result.images?.[0]?.url || result.image?.url;
if (!imageUrl) {
  console.error("  resultado sem imagem:", JSON.stringify(result, null, 2));
  process.exit(1);
}

// Download image
const imgResp = await fetch(imageUrl);
const imgBuf = Buffer.from(await imgResp.arrayBuffer());

const filename = `I6-master-v${VARIANT}-seed${SEED}.jpg`;
const filepath = path.join(OUTPUT_DIR, filename);
await fs.writeFile(filepath, imgBuf);

console.log(`  salvo em  : ${filepath}`);
console.log(`  tamanho   : ${(imgBuf.length / 1024).toFixed(1)} KB`);
console.log(`  URL Fal   : ${imageUrl}`);
console.log();

// Salvar metadata
const metaFile = path.join(OUTPUT_DIR, `I6-master-v${VARIANT}-seed${SEED}.json`);
await fs.writeFile(
  metaFile,
  JSON.stringify(
    {
      version: "FGAA v1.0",
      phase: 1,
      variant: VARIANT,
      seed: SEED,
      endpoint: "fal-ai/flux-2-pro",
      pricing: "$0.03/MP × 2MP = $0.06",
      timestamp: new Date().toISOString(),
      prompt: PROMPT,
      negative: NEGATIVE,
      payload,
      result: { url: imageUrl, request_id },
      duration_s: (Date.now() - startTime) / 1000,
    },
    null,
    2,
  ),
);
console.log(`  metadata  : ${metaFile}`);
console.log();
console.log(`━━━ Abrir e revisar — aprovar ou rodar variant ${VARIANT + 1} ━━━\n`);
