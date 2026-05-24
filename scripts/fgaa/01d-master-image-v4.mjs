#!/usr/bin/env node
/**
 * FGAA v1.0 — Fase 1 v4 (projeto Gustavo · FLUX.2 Max · qualidade hyperreal)
 *
 * Decodificação do projeto inédito do Gustavo (REF-11):
 *   - Volume superior em cantilever monumental "guarda-sol"
 *   - Painéis verticais perfurados muxarabi em corten/madeira escura (assinatura)
 *   - Pedra natural chapada brasileira no térreo (podium tectônico)
 *   - Jardineira lateral com vegetação pendente entre pavimentos
 *   - Laje intermediária protagonista em concreto aparente com cobertura verde
 *   - Piscinas em múltiplos níveis
 *   - Pátio interno com árvore + canal de água
 *
 * 3 versões em terreno amplo brasileiro:
 *   V4A "Frontal Hero"        — cantilever protagonista
 *   V4B "Paisagística 3/4"    — casa pousada no cerrado amplo
 *   V4C "Lateral com Piscina" — piscina em primeiro plano + reflexo
 *
 * Custo total: 3 × ~$0.14 (2MP × $0.07) = ~$0.42 com FLUX.2 Max
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

const SHARED_NEGATIVE = `cartoon, illustration, sketch, 3d wireframe, cgi videogame look, low-quality render, didactic architectural diagram, flat lighting, vibrant saturated colors, neon, gold accents, marble veneer, glass curtain wall skyscraper, mediterranean style, european chateau, asian temple, generic luxury, kitsch, palm trees, tropical jungle, dense rainforest, horizontal louvers, horizontal brises, scaffolding, construction equipment, cranes, workers, vehicles, signage, watermark, text overlay, signature, logo, blurry, low resolution, oversaturated, hdr garish, instagram filter, dutch angle, fisheye distortion, vertical orientation`;

const VARIANTS = [
  {
    code: "V4A",
    name: "Frontal Hero",
    inspiration: "Projeto Gustavo REF-11 · cantilever monumental protagonista",
    seed: 51847,
    prompt: `Hyperrealistic architectural photography of a contemporary Brazilian luxury residence in critical regionalism style, original architectural design. Two-story house with a dominant monumental cantilevered upper volume projecting boldly outward on all sides like a horizontal architectural canopy. The upper volume facade composed of rhythmic vertical panels: dense perforated muxarabi screens (small square geometric perforations) in weathered corten steel with deep reddish-brown patina, alternating with solid vertical panels of dark scorched ipe wood. Heavy intermediate slab in raw board-formed exposed concrete with horizontal pine formwork grain visible as a strong horizontal gesture between the floors. From the edge of the intermediate slab, a continuous integrated planter cascading down with lush hanging tropical vegetation (philodendrons, cipo-jasmim, hera). Lower ground floor as a massive tectonic podium of stacked natural Brazilian chapada stone (basalto chapado, quartzite layers) with raw rough texture, set back behind floor-to-ceiling glass openings revealing the interior. The house sits on a generous open countryside lot in the Brazilian cerrado biome — wide terrain, gently undulating ground covered in native ornamental grasses (capim do texas, fountain grass) swaying, sparse native Brazilian trees (ipê-amarelo, jaboticaba) at distances providing scale. Near-frontal view slightly angled 15 degrees off-axis from human eye level, camera positioned to emphasize the dramatic cantilever depth and the layered facade composition. Cinematic golden hour atmosphere with warm low sun from the left casting long horizontal amber shadows, clear pale sky with delicate volumetric cirrus clouds high above gradient blue zenith, soft atmospheric haze in the distance. Hyperrealistic archviz quality, post-processing standard of The Boundary, KERN, MIR studios, Phase One IQ4 150MP medium format simulation, 50mm tilt-shift lens, f/8, natural lighting only. Magazine editorial AD, Dezeen, ArchDaily standard. Horizontal cinematic 16:9. No people, no vehicles, no signage, no scaffolding.`,
  },
  {
    code: "V4B",
    name: "Paisagística 3/4",
    inspiration: "Projeto Gustavo REF-11 · casa pousada no cerrado amplo",
    seed: 67923,
    prompt: `Hyperrealistic architectural photography of a contemporary Brazilian luxury residence in critical regionalism style, original architectural design. Two-story house with a horizontal cantilevered upper volume in vertical perforated muxarabi corten steel screens and dark scorched wood vertical panels, the upper volume floating prominently over a ground floor podium of stacked natural Brazilian chapada stone (basalto, quartzite). Heavy intermediate slab in board-formed concrete with green roof of native grasses on top. Continuous side planter with cascading tropical hanging vegetation (philodendrons) descending from the intermediate level. Three-quarter front-right view from a moderate distance, the house captured in its full horizontal extension resting delicately on a vast open countryside hilltop in the Brazilian cerrado biome. Foreground filled with native ornamental grasses (capim ornamental, gramíneas brasileiras) in tall amber tones swaying in soft breeze, scattered native Brazilian trees (ipê-amarelo blooming, sparse cerrado vegetation) at varying distances. Gentle undulating terrain extending to a distant horizon line of rolling green hills. Wide-angle three-quarter view from low human angle, dramatic perspective emphasizing how the architectural object rests as a quiet horizontal incision on the natural terrain. Cinematic late golden hour atmosphere with warm orange-amber low sun from the left dipping toward horizon, dramatic gradient pale-blue to amber sky with subtle volumetric cirrus and altocumulus clouds, soft warm atmospheric haze, long horizontal amber shadows cast by vegetation. Hyperrealistic archviz quality, post-processing standard of The Boundary, KERN, MIR studios, Phase One IQ4 150MP simulation, 35mm lens, f/9, natural lighting only. Magazine editorial AD, Casa Vogue Brasil, Dezeen standard. Horizontal cinematic 16:9. Anti-dramatic, landscape-integrated, contemplative. No people, no vehicles, no signage.`,
  },
  {
    code: "V4C",
    name: "Lateral com Piscina",
    inspiration: "Projeto Gustavo REF-11 · piscina protagonista + cantilever lateral",
    seed: 84219,
    prompt: `Hyperrealistic architectural photography of a contemporary Brazilian luxury residence in critical regionalism style, original architectural design. Side view of a two-story house with a pronouncedly cantilevered upper volume in vertical perforated muxarabi corten steel screens and dark scorched wood vertical panels, the cantilever projecting boldly to the left over a lower swimming pool. Heavy intermediate slab in board-formed exposed concrete, with continuous side planter of cascading philodendron and cipo-jasmim hanging downward in lush green curtains. Ground floor podium of stacked natural Brazilian chapada stone (basalto, quartzite layers) with raw rough texture. A long rectangular swimming pool in the foreground with still mirror-calm water surface reflecting the upper cantilever and the corten patina, water aligned with the lower deck. Behind the glass openings of the ground floor, an interior courtyard with a sculptural Brazilian native tree (ipê or jaboticaba) visible centrally framed. Side three-quarter view from human eye level. Surrounded by native Brazilian cerrado vegetation: ornamental grasses (capim do texas, gramíneas), sparse trees in the background, rocky outcrops at the base. Cinematic warm golden hour atmosphere with side-lit low sun from the right casting long horizontal amber shadows across the water surface and the facade, clear pale-blue sky with delicate cirrus clouds and warm amber tones near the horizon, soft atmospheric volumetric haze. Hyperrealistic archviz quality, post-processing standard of The Boundary, KERN, MIR studios, Phase One IQ4 150MP simulation, 45mm tilt-shift lens, f/8, natural lighting only. Magazine editorial AD, ArchDaily, Dezeen standard. Horizontal cinematic 16:9. Quiet, contemplative, anti-dramatic. No people, no vehicles, no signage.`,
  },
];

console.log(`\n━━━ FGAA v1.0 · Fase 1 v4 · Projeto Gustavo · FLUX.2 Max ━━━\n`);
VARIANTS.forEach((v) =>
  console.log(`  ${v.code} — ${v.name} (seed ${v.seed})`),
);
console.log(`\n  Endpoint  : fal-ai/flux-2-max  ($0.07/MP)`);
console.log(`  Resolução : 1920×1080 (~2 MP cada)`);
console.log(`  Custo est : 3 × ~$0.14 = ~$0.42 total\n`);

async function generateOne(variant) {
  const t0 = Date.now();
  const payload = {
    prompt: variant.prompt,
    negative_prompt: SHARED_NEGATIVE,
    image_size: { width: 1920, height: 1080 },
    num_images: 1,
    enable_safety_checker: false,
    seed: variant.seed,
    num_inference_steps: 60,
    guidance_scale: 7.5,
  };

  const submit = await fetch("https://queue.fal.run/fal-ai/flux-2-max", {
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

  for (let i = 0; i < 80; i++) {
    await new Promise((r) => setTimeout(r, 3000));
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
            version: "FGAA v1.0 · Fase 1 v4 (projeto Gustavo · FLUX.2 Max)",
            variant: variant.code,
            name: variant.name,
            inspiration: variant.inspiration,
            seed: variant.seed,
            endpoint: "fal-ai/flux-2-max",
            pricing: "$0.07/MP × 2 = $0.14",
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
