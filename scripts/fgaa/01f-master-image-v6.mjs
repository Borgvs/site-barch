#!/usr/bin/env node
/**
 * FGAA v1.0 — Fase 1 v6 (volumetria escultural + paisagem brasileira)
 *
 * Nova direção exploratória após ref AlUla/Wadi Rum:
 *   - Volume com cantilever escultural pronunciado
 *   - Linha estrutural ondulada/curva (não puramente ortogonal)
 *   - Concreto branco/areado + materiais térreos
 *   - Casa como "incisão" cinematográfica na paisagem
 *   - PAISAGEM BRASILEIRA dramática (não deserto)
 *
 * 3 contextos brasileiros:
 *   V6A — Chapada Diamantina (paredões de arenito vermelho/laranja)
 *   V6B — Cerrado com afloramento rochoso (campo + rocha cinza)
 *   V6C — Serra do Cipó / vegetação rupestre (rocha + verde)
 */

import fs from "node:fs/promises";
import path from "node:path";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("FAL_KEY ausente"); process.exit(1); }

const OUTPUT_DIR = path.resolve("tmp/hero-v8/anchors");
await fs.mkdir(OUTPUT_DIR, { recursive: true });

const SHARED_NEGATIVE = `cartoon, illustration, sketch, 3d wireframe, low-poly cgi, videogame look, didactic diagram, vibrant saturated colors, neon, gold, marble, mediterranean villa, asian temple, generic luxury, kitsch, palm trees, tropical jungle, desert dunes, sahara, middle east desert, arabian desert, scaffolding, cranes, vehicles, signage, watermark, text, logo, blurry, hdr garish, instagram filter, oversaturated, vertical orientation, drone overhead, fisheye, dutch angle`;

const SHARED_VOLUMETRY = `
ARCHITECTURAL DESIGN — sculptural cantilevered residence:
The house is a TWO-STORY sculptural residence carved into the natural rock formation. A strongly horizontal upper volume in raw board-formed exposed concrete with a slightly tapered profile, cantilevered prominently outward (4-6 meters) over a recessed glass lower level. The upper roof slab has a thin clean edge with deep overhanging eaves, profile slightly tapered toward the cantilever tip giving the volume a "blade" or "wing" quality. Below the cantilever, the ground floor is a recessed glass-and-concrete pavilion that appears carved into the cliff face. A second horizontal blade-like slab runs above as the roof, projecting beyond the volume walls. The whole composition reads as a precise horizontal incision into the rocky landscape — minimalist, monolithic, contemporary Brazilian critical regionalism with hints of Niemeyer's curvilinear gestures. Pale concrete (almost off-white) contrasting with the natural earth tones of the surrounding rock. Floor-to-ceiling glass openings with minimal black frames. Subtle warm interior lighting visible through the glass. Discrete swimming pool integrated at the base level. NO ornamental elements. No people. No vehicles. No signage.
`.trim();

const SHARED_ATMOSPHERE = `
ATMOSPHERE: Late afternoon to dusk, soft diffused warm light, calm anti-dramatic sky with delicate cloud cover, gentle atmospheric haze. Restrained contemplative mood. Hyperrealistic architectural photography simulation, post-processing standard of The Boundary, MIR, Brick Visual studios. Indistinguishable from Phase One IQ4 150MP medium format. Horizontal cinematic 16:9. Magazine editorial AD, ArchDaily, Dezeen standard.
`.trim();

const VARIANTS = [
  {
    code: "V6A",
    name: "Chapada Diamantina",
    seed: 61429,
    contextPrompt: `SITE CONTEXT: The house is carved into a dramatic Brazilian Chapada Diamantina landscape — towering layered sandstone cliff formations in warm ochre-red, orange and amber tones rising behind the house, characteristic of the Bahia chapadas geology. Ancient stratified rock walls with visible erosion patterns. Foreground composed of sandy red-orange terrain typical of the chapadão, scattered Brazilian cerrado-rupestre vegetation: native bromeliads (Vellozia/canela-de-ema with their characteristic columnar form), small native sempre-vivas, scattered Brazilian rosewood and pequizeiros at moderate distances. Some loose rocks. The architectural blade reads as a precise contemporary intervention in this ancient geological setting. Wide cinematic vista showing the scale of the cliff vs the house.`,
  },
  {
    code: "V6B",
    name: "Cerrado com afloramento",
    seed: 73841,
    contextPrompt: `SITE CONTEXT: The house sits on a dramatic Brazilian cerrado plateau with a substantial natural granite/quartzite rock outcropping (afloramento rochoso) protruding from the savanna ground, partially supporting the architectural composition. The rock outcropping is in grey-brown tones with weathered surfaces. Surrounding terrain: open cerrado vegetation with characteristic twisted Brazilian native trees (lobeira, sucupira, ipês esparsos), tall ornamental grasses (capim do texas, gramíneas brasileiras) swaying, occasional sparse cerrado bushes. The horizon extends widely showing the vast central Brazilian plateau under late afternoon light. Gently undulating terrain. The architectural intervention reads as monumental yet integrated.`,
  },
  {
    code: "V6C",
    name: "Serra do Cipó / Espinhaço",
    seed: 89253,
    contextPrompt: `SITE CONTEXT: The house is sited along the dramatic ridges of the Serra do Espinhaço / Serra do Cipó in Minas Gerais — Brazilian highland landscape with quartzite rock outcrops in grey-amber tones, cerrado-rupestre vegetation richly covering the slopes. Behind the house, layered rocky escarpments with dense vegetation of native Brazilian species: canela-de-ema (Vellozia) with their distinctive columnar shapes, native bromeliads, sempre-vivas in patches, scattered candeias and small native trees. Foreground shows the characteristic Espinhaço terrain: rocky soil with patches of cerrado vegetation, occasional larger boulders. Misty atmospheric haze on the distant ridges. The architectural object reads as a horizontal intervention contemplating the ancient mineral landscape.`,
  },
];

console.log(`\n━━━ FGAA v1.0 · Fase 1 v6 · Volumetria escultural + paisagem brasileira ━━━\n`);
VARIANTS.forEach((v) => console.log(`  ${v.code} — ${v.name} (seed ${v.seed})`));
console.log(`\n  Endpoint  : fal-ai/flux-2-max  ($0.07/MP)`);
console.log(`  Custo est : ~$0.42 total\n`);

async function generateOne(variant) {
  const t0 = Date.now();
  const prompt = `${SHARED_VOLUMETRY}\n\n${variant.contextPrompt}\n\n${SHARED_ATMOSPHERE}`;
  const payload = {
    prompt,
    negative_prompt: SHARED_NEGATIVE,
    image_size: { width: 1920, height: 1080 },
    num_images: 1,
    enable_safety_checker: false,
    seed: variant.seed,
    num_inference_steps: 60,
    guidance_scale: 8.0,
  };

  const submit = await fetch("https://queue.fal.run/fal-ai/flux-2-max", {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!submit.ok) { throw new Error(`${variant.code} ${submit.status}: ${await submit.text()}`); }
  const { request_id, status_url, response_url } = await submit.json();
  console.log(`  ✓ ${variant.code} submetida · ${request_id.slice(0, 12)}…`);

  for (let i = 0; i < 100; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const s = await (await fetch(status_url, { headers: { Authorization: `Key ${FAL_KEY}` } })).json();
    if (s.status === "COMPLETED") {
      const result = await (await fetch(response_url, { headers: { Authorization: `Key ${FAL_KEY}` } })).json();
      const url = result.images?.[0]?.url;
      if (!url) throw new Error(`${variant.code} sem URL`);
      const img = Buffer.from(await (await fetch(url)).arrayBuffer());
      const fpath = path.join(OUTPUT_DIR, `I6-master-${variant.code}-seed${variant.seed}.jpg`);
      await fs.writeFile(fpath, img);
      await fs.writeFile(
        path.join(OUTPUT_DIR, `I6-master-${variant.code}-seed${variant.seed}.json`),
        JSON.stringify({
          version: "FGAA v1.0 · Fase 1 v6 (escultural + paisagem brasileira)",
          variant: variant.code, name: variant.name, seed: variant.seed,
          endpoint: "fal-ai/flux-2-max", timestamp: new Date().toISOString(),
          prompt, negative: SHARED_NEGATIVE,
          result: { url, request_id }, duration_s: (Date.now() - t0) / 1000,
          size_kb: (img.length / 1024).toFixed(1),
        }, null, 2),
      );
      console.log(`  ✓ ${variant.code} CONCLUÍDA em ${((Date.now() - t0) / 1000).toFixed(1)}s · ${(img.length / 1024).toFixed(0)} KB`);
      return { variant: variant.code, ok: true, path: fpath, request_id };
    }
    if (s.status === "FAILED" || s.status === "ERROR") {
      throw new Error(`${variant.code} ${s.status}: ${JSON.stringify(s)}`);
    }
  }
  throw new Error(`${variant.code} timeout`);
}

const start = Date.now();
const results = await Promise.allSettled(VARIANTS.map(generateOne));
console.log(`\n━━━ Concluído em ${((Date.now() - start) / 1000).toFixed(1)}s ━━━`);
results.forEach((r, i) => {
  if (r.status === "fulfilled") console.log(`  ✓ ${VARIANTS[i].code} OK · ${r.value.request_id}`);
  else console.log(`  ✗ ${VARIANTS[i].code} FALHOU: ${r.reason.message || r.reason}`);
});
console.log();
