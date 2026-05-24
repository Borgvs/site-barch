#!/usr/bin/env node
/**
 * FGAA v1.0 — Fase 1 (segunda rodada de calibragem com refs novas)
 * Gera 3 versões de imagem-mestra em PARALELO via fal-ai/flux-2-pro
 *
 * Versões calibradas com base em 7 refs analisadas em tmp/hero-v8/refs/REGISTRO-REFS.md:
 *   V2A "Frontal Monumental"  — KERN + REF-05
 *   V2B "Pavilhão Aberto"     — REF-03 Bernardes + REF-02
 *   V2C "Tropical Suspenso"   — REF-04 + REF-06 + REF-07
 *
 * Custo total: 3 × ~$0.06 = ~$0.18
 *
 * Output: tmp/hero-v8/anchors/I6-master-v2{A,B,C}-seed*.jpg + .json
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("FAL_KEY ausente — exporte do .env.local antes");
  process.exit(1);
}

const OUTPUT_DIR = path.resolve("tmp/hero-v8/anchors");
await fs.mkdir(OUTPUT_DIR, { recursive: true });

/* --------------------------------------------------------------------
 * Prompts calibrados — 3 versões dentro do vocabulário visual comum
 * ------------------------------------------------------------------ */

const SHARED_NEGATIVE = `cartoon, illustration, sketch, 3d model wireframe, cgi videogame look, vibrant saturated colors, neon, gold accents, marble veneer, golden hour clichê, glass curtain wall skyscraper, suburban tract home, mediterranean style, european chateau, asian temple, kitsch, generic luxury, scaffolding, construction equipment, cranes, workers, vehicles, signage, watermark, text overlay, signature, logo, blurry, low resolution, oversaturated, hdr garish, instagram filter, drone overhead view, top-down view, fisheye distortion, dutch angle, vertical orientation`;

const VARIANTS = [
  {
    code: "V2A",
    name: "Frontal Monumental",
    inspiration: "KERN render + REF-05 pavilhão monumental",
    seed: 4521,
    prompt: `Architectural photography of a contemporary Brazilian luxury residence in critical regionalism style, vocabulary of Bernardes Arquitetura, Jacobsen Arquitetura, Marcio Kogan and Felipe Caboclo. Single monumental rectangular volume elevated on minimal structural columns over the ground, the entire ground level visually open and uncluttered. Upper volume defined by rhythmic dense vertical cumaru wood brise-soleil running floor-to-ceiling across the entire facade, casting intricate vertical shadows. Below the elevated volume, a natural stone base of stacked basalt and quartzite chapada with raw tactile finish. In the foreground, a long infinity edge swimming pool reflecting the elevated structure, water absolutely still like a mirror. The volume cantilevered slightly forward over the pool. Concrete board-formed structural elements visible. Floor-to-ceiling glass behind the brise-soleil revealing interior depth. Lateral framing by lush native Brazilian tropical vegetation (cerrado mature trees) without dominating the composition. Strictly frontal orthogonal elevation view, camera at human eye level perfectly perpendicular to the facade. Dramatic blue hour atmosphere with turbulent cumulus clouds overhead, diffused even light, soft volumetric haze. Composition centered and quietly symmetric, horizontal cinematic 16:9. Editorial architectural photography quality, Phase One IQ4 150MP medium format, 50mm tilt-shift lens, f/8, natural ambient lighting only. Magazine editorial standard worthy of AD, Wallpaper or Casa Vogue Brasil. No people, no vehicles, no signage, no scaffolding.`,
  },
  {
    code: "V2B",
    name: "Pavilhão Aberto",
    inspiration: "REF-03 pavilhão Bernardes + REF-02 interior gourmet",
    seed: 7834,
    prompt: `Architectural photography of a contemporary Brazilian luxury pavilion residence in critical regionalism style, vocabulary of Bernardes Arquitetura and Studio MK27 Marcio Kogan. Single horizontal pavilion with extraordinarily deep cantilevered roof of exposed light wood beam structure (vigamento aparente de cumaru), the structural rhythm of the roof visible from below as a defining material gesture. The pavilion sits on a stone podium with longitudinal natural stone wall in stacked quartzite chapada brasileira running the full length. Thin structural wood columns supporting the deep eave. Living and dining areas visible behind floor-to-ceiling glass openings, fully integrated indoor-outdoor. Open lawn extending in the foreground with native Brazilian ornamental grass (capim do texas) swaying. Distant horizon revealing a calm lake or reservoir beyond gentle rolling green hills. Three-quarter front-left view from low human angle showing the deep eave overhead and the depth of the pavilion. Day light with crisp partly cloudy sky, scattered cumulus clouds, soft warm afternoon atmosphere. Wide horizontal cinematic 16:9 composition. Editorial architectural photography quality, shot on Hasselblad H6D-100c medium format, 35mm lens, f/9, natural daylight. Magazine editorial standard worthy of AD or Casa Vogue. No people, no vehicles, no signage, no scaffolding.`,
  },
  {
    code: "V2C",
    name: "Tropical Suspenso",
    inspiration: "REF-04 + REF-06 + REF-07",
    seed: 9163,
    prompt: `Architectural photography of a contemporary Brazilian luxury residence in critical regionalism style, vocabulary of Bernardes Arquitetura, Jacobsen Arquitetura and Felipe Caboclo. Two-story residence with the upper volume pronouncedly cantilevered forward over a stone base, the upper volume defined by rhythmic dense vertical cumaru wood brise-soleil. From the edge of the upper balcony, generous hanging garden of native Brazilian climbing vegetation (philodendrons, jasmim) cascading downward in lush green curtains, partially obscuring the brise-soleil. The lower level wrapped in stacked natural Brazilian quartzite stone walls, with deep recessed glass entries. Exuberant tropical landscaping in the foreground: monstera deliciosa, philodendrons gigantes, native palmeiras (palmeira-juçara, palmeira-imperial), banana ornamental, all in rich foliage layered depth. Stone step pavers emerging from the ornamental landscaping leading toward the entrance. Three-quarter front-right view from low angle, camera capturing the dynamic between cantilever above and lush nature below. Blue hour atmosphere with soft diffused light, deep blue sky transitioning to warm amber at the horizon, subtle bioluminescent garden lighting just becoming visible. Horizontal cinematic 16:9. Editorial architectural photography quality, shot on Phase One IQ4 150MP, 35mm tilt-shift, f/8. Magazine editorial standard worthy of AD or Casa Vogue Brasil. No people, no vehicles, no signage, no scaffolding.`,
  },
];

/* --------------------------------------------------------------------
 * Geração paralela
 * ------------------------------------------------------------------ */

console.log(`\n━━━ FGAA v1.0 · Fase 1 v2 · 3 variantes em paralelo ━━━\n`);
VARIANTS.forEach((v) =>
  console.log(`  ${v.code} — ${v.name} (seed ${v.seed}, ${v.inspiration})`),
);
console.log(`\n  Endpoint  : fal-ai/flux-2-pro`);
console.log(`  Resolução : 1920×1080 (≈2 MP cada)`);
console.log(`  Custo est : 3 × ~$0.06 = ~$0.18 total\n`);

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
  console.log(`  ✓ ${variant.code} submetida · request_id ${request_id.slice(0, 12)}…`);

  // Poll
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
      if (!url) throw new Error(`${variant.code} sem URL no resultado`);

      const img = Buffer.from(await (await fetch(url)).arrayBuffer());
      const fname = `I6-master-${variant.code}-seed${variant.seed}.jpg`;
      const fpath = path.join(OUTPUT_DIR, fname);
      await fs.writeFile(fpath, img);

      const meta = {
        version: "FGAA v1.0 · Fase 1 v2",
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
      };
      await fs.writeFile(
        path.join(OUTPUT_DIR, `I6-master-${variant.code}-seed${variant.seed}.json`),
        JSON.stringify(meta, null, 2),
      );

      console.log(
        `  ✓ ${variant.code} CONCLUÍDA em ${((Date.now() - t0) / 1000).toFixed(1)}s · ${(img.length / 1024).toFixed(0)} KB · ${fpath}`,
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
