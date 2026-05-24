#!/usr/bin/env node
/**
 * FGAA v1.0 — Fase 1 v3 (calibragem com refs MK27/Bernardes)
 *
 * 3 versões calibradas a partir da V2A KERN + 3 novas refs (REF-08,09,10):
 *   V3A "Síntese KERN+MK27"     — vista quase frontal, corten + madeira escura, golden suave
 *   V3B "Pousada na Topografia" — vista 3/4 lateral, cerrado, casa integrada ao terreno
 *   V3C "Refined Frontal"       — V2A reconfigurada com paleta MK27 + cerrado real
 *
 * Ajustes-chave vs V2:
 *   - Brises verticais em CORTEN escuro / madeira escurecida (não madeira clara)
 *   - Golden hour SUAVE lateral (não blue hour dramatic, não overcast turbulento)
 *   - Cerrado brasileiro real (não tropical com palmeiras)
 *   - Piscina retangular lateral (não infinity centralizada)
 *   - Dois pavimentos com laje intermediária pronunciada (não monolítico)
 *   - Composição 3/4 ou levemente angulada (não puramente frontal)
 *
 * Custo: 3 × ~$0.06 = ~$0.18 total
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("FAL_KEY ausente");
  process.exit(1);
}

const OUTPUT_DIR = path.resolve("tmp/hero-v8/anchors");
await fs.mkdir(OUTPUT_DIR, { recursive: true });

const SHARED_NEGATIVE = `cartoon, illustration, sketch, 3d wireframe, cgi videogame look, vibrant saturated colors, neon, gold accents, marble veneer, glass curtain wall skyscraper, suburban tract home, mediterranean style, european chateau, asian temple, generic luxury, kitsch, scaffolding, construction equipment, cranes, workers, vehicles, signage, watermark, text overlay, signature, logo, blurry, low resolution, oversaturated, hdr garish, instagram filter, drone overhead view, top-down view, fisheye distortion, dutch angle, vertical orientation, dramatic stormy clouds, turbulent dark sky, palm trees, tropical jungle, dense rainforest`;

const VARIANTS = [
  {
    code: "V3A",
    name: "Síntese KERN+MK27",
    inspiration: "REF-01 KERN + REF-08/09/10 MK27",
    seed: 12847,
    prompt: `Architectural photography of a contemporary Brazilian luxury residence in critical regionalism style, vocabulary of Studio MK27 Marcio Kogan and Bernardes Arquitetura. Two-story horizontal residence with a pronounced intermediate concrete slab as the defining horizontal gesture, the slab edge clean and sharp with a green roof of native grass visible on top. Upper volume cantilevered slightly forward, clad in vertical corten steel panels with subtle ondulation creating dark reddish-brown rhythmic texture, deep window recess in the center revealing interior. Lower pavilion in dark muirapiranga wood with dense vertical wood brise-soleil, large floor-to-ceiling glass openings revealing the open living and dining areas with visible Brazilian design furniture (Sergio Rodrigues chairs, low sofas). Rectangular swimming pool in the foreground aligned with the lower deck, water surface still and calm, simple stone coping. The house sits delicately on a gentle hilltop in the Brazilian cerrado biome, surrounded by low native cerrado vegetation (capim ornamental, ipê amarelo, sparse trees) without dominating the composition. Three-quarter front-left view from human eye level, camera positioned to reveal the depth of the living space and the cantilever of the upper volume. Soft warm golden hour atmosphere with low sun from the left casting long warm horizontal shadows, clear sky transitioning from pale amber at the horizon to soft pale blue above with delicate wispy cirrus clouds, gentle haze. Horizontal cinematic 16:9 composition. Editorial architectural photography quality, shot on Phase One IQ4 150MP medium format, 50mm tilt-shift lens, f/8, natural ambient lighting only. Magazine editorial standard worthy of AD or Casa Vogue Brasil. Anti-dramatic, quiet sophistication. No people, no vehicles, no signage.`,
  },
  {
    code: "V3B",
    name: "Pousada na Topografia",
    inspiration: "REF-09 MK27 (vista ampla na colina)",
    seed: 23981,
    prompt: `Architectural photography of a contemporary Brazilian luxury residence in critical regionalism style, vocabulary of Studio MK27 Marcio Kogan and Bernardes Arquitetura. Two-story long horizontal house delicately resting on a gentle hilltop in the Brazilian cerrado biome. Dominant intermediate concrete slab extending across the full length of the volume as a clean horizontal gesture, deep cantilever visible at both ends. Upper volume in dark corten steel vertical panels with subtle ondulation, partially recessed. Lower pavilion in dark warm muirapiranga wood with vertical brise-soleil, expansive floor-to-ceiling glass revealing the interior living area. The house captured in its full horizontal extension, the structural cantilever visible from below where the topography drops away. Surrounded by low native cerrado vegetation: ornamental grasses, sparse Brazilian native trees (ipês, cerrado vegetation), rocky outcrops at the base, undulating green hills extending into the distance. The composition reads landscape-first, the house as a quiet horizontal incision in the natural terrain. Wide-angle three-quarter view from low angle, camera positioned to emphasize how the building rests on the hillside. Soft warm golden hour atmosphere with low sun from the left casting horizontal amber light across the cerrado vegetation, vast clear pale sky with soft warm tones near the horizon, no dramatic clouds, gentle volumetric haze. Horizontal cinematic 16:9 composition. Editorial architectural photography quality, shot on Phase One IQ4 150MP medium format, 35mm lens, f/9, natural lighting. Anti-dramatic, contemplative, landscape-integrated. Magazine editorial standard worthy of AD Brasil or Casa Vogue. No people, no vehicles, no signage.`,
  },
  {
    code: "V3C",
    name: "Refined Frontal",
    inspiration: "V2A KERN reconfigurada com paleta MK27",
    seed: 38192,
    prompt: `Architectural photography of a contemporary Brazilian luxury residence in critical regionalism style, vocabulary of Studio MK27 Marcio Kogan and Bernardes Arquitetura. Two-story horizontal residence with a dominant intermediate concrete slab as the defining horizontal gesture. Upper volume in vertical corten steel panels with subtle ondulation creating dark reddish-brown texture, deep window opening centered. Lower pavilion in dark warm muirapiranga wood with dense vertical wood brise-soleil filling the facade, behind which large floor-to-ceiling glass reveals the open double-height living area with visible Brazilian design furniture. Rectangular swimming pool in the foreground aligned with the lower deck. The house surrounded by low native Brazilian cerrado vegetation, a single sculptural native tree (ipê amarelo or jaboticaba) on the left providing scale and natural framing. Slightly angled near-frontal view (about 15 degrees off-axis) from human eye level, camera revealing the layered planes of the facade and the depth of the interior behind the brises. Soft warm golden hour atmosphere with diffused low sun creating long horizontal shadows, clear pale sky with subtle warm tones, no dramatic clouds, gentle haze. The composition is calm and quietly monumental — not theatrical. Horizontal cinematic 16:9. Editorial architectural photography quality, shot on Phase One IQ4 150MP medium format, 50mm tilt-shift, f/8, natural ambient lighting only. Magazine editorial standard worthy of AD or Casa Vogue Brasil. Anti-dramatic, restrained, contemplative. No people, no vehicles, no signage.`,
  },
];

console.log(`\n━━━ FGAA v1.0 · Fase 1 v3 · 3 variantes calibradas com refs MK27 ━━━\n`);
VARIANTS.forEach((v) =>
  console.log(`  ${v.code} — ${v.name} (seed ${v.seed})`),
);
console.log(`\n  Endpoint  : fal-ai/flux-2-pro`);
console.log(`  Resolução : 1920×1080`);
console.log(`  Custo est : ~$0.18 total\n`);

async function generateOne(variant) {
  const t0 = Date.now();
  const payload = {
    prompt: variant.prompt,
    negative_prompt: SHARED_NEGATIVE,
    image_size: { width: 1920, height: 1080 },
    num_images: 1,
    enable_safety_checker: false,
    seed: variant.seed,
    num_inference_steps: 50,
    guidance_scale: 7.5,
  };

  const submit = await fetch("https://queue.fal.run/fal-ai/flux-2-pro", {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!submit.ok) {
    const body = await submit.text();
    throw new Error(`${variant.code} submit ${submit.status}: ${body}`);
  }
  const { request_id, status_url, response_url } = await submit.json();
  console.log(`  ✓ ${variant.code} submetida · ${request_id.slice(0, 12)}…`);

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    const sResp = await fetch(status_url, {
      headers: { Authorization: `Key ${FAL_KEY}` },
    });
    const s = await sResp.json();
    if (s.status === "COMPLETED") {
      const rResp = await fetch(response_url, {
        headers: { Authorization: `Key ${FAL_KEY}` },
      });
      const result = await rResp.json();
      const url = result.images?.[0]?.url;
      if (!url) throw new Error(`${variant.code} sem URL`);

      const img = Buffer.from(await (await fetch(url)).arrayBuffer());
      const fname = `I6-master-${variant.code}-seed${variant.seed}.jpg`;
      const fpath = path.join(OUTPUT_DIR, fname);
      await fs.writeFile(fpath, img);

      await fs.writeFile(
        path.join(OUTPUT_DIR, `I6-master-${variant.code}-seed${variant.seed}.json`),
        JSON.stringify(
          {
            version: "FGAA v1.0 · Fase 1 v3 (calibragem MK27)",
            variant: variant.code,
            name: variant.name,
            inspiration: variant.inspiration,
            seed: variant.seed,
            endpoint: "fal-ai/flux-2-pro",
            timestamp: new Date().toISOString(),
            prompt: variant.prompt,
            negative: SHARED_NEGATIVE,
            result: { url, request_id },
            duration_s: (Date.now() - t0) / 1000,
            size_kb: (img.length / 1024).toFixed(1),
          },
          null,
          2,
        ),
      );

      console.log(
        `  ✓ ${variant.code} CONCLUÍDA em ${((Date.now() - t0) / 1000).toFixed(1)}s · ${(img.length / 1024).toFixed(0)} KB`,
      );
      return { variant: variant.code, ok: true, path: fpath };
    }
    if (s.status === "FAILED" || s.status === "ERROR") {
      throw new Error(`${variant.code} ${s.status}: ${JSON.stringify(s)}`);
    }
  }
  throw new Error(`${variant.code} timeout`);
}

const start = Date.now();
const results = await Promise.allSettled(VARIANTS.map(generateOne));
const totalSec = ((Date.now() - start) / 1000).toFixed(1);

console.log(`\n━━━ Concluído em ${totalSec}s ━━━`);
results.forEach((r, i) => {
  if (r.status === "fulfilled") {
    console.log(`  ✓ ${VARIANTS[i].code} OK`);
  } else {
    console.log(`  ✗ ${VARIANTS[i].code} FALHOU: ${r.reason.message || r.reason}`);
  }
});
console.log();
