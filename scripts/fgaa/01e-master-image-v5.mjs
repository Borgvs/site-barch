#!/usr/bin/env node
/**
 * FGAA v1.0 — Fase 1 v5 (volumetria fiel ao projeto Gustavo · FLUX.2 Max)
 *
 * Reajuste após feedback "manter linguagem mais parecida, volumetria mais próxima":
 *   - Volume superior ALONGADO horizontalmente (proporção 1:5, não 1:3 da V4)
 *   - Beiral da cobertura projeta-se ALÉM do volume habitável (overhang clean)
 *   - Térreo CLARAMENTE RECUADO em relação ao volume superior (assimetria visível)
 *   - Painéis verticais 60% sólidos madeira escurecida + 40% perfurados muxarabi corten
 *   - Pequenas janelas de vidro entre painéis (não vidro contínuo)
 *   - Faixa horizontal fina de concreto + jardineira pendente protagonista
 *   - Base de pedra chapada raw natural brasileira (canga, basalto)
 *   - Atmosfera natural diurna clara — não dramatic, mais foto-real
 *   - Mesmo vocabulário, 3 ângulos de câmera variando
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("FAL_KEY ausente"); process.exit(1); }

const OUTPUT_DIR = path.resolve("tmp/hero-v8/anchors");
await fs.mkdir(OUTPUT_DIR, { recursive: true });

const SHARED_NEGATIVE = `cartoon, illustration, sketch, didactic architectural diagram, 3d wireframe, low-poly cgi, videogame look, overly saturated colors, neon, gold, marble, mediterranean, european chateau, asian temple, generic luxury, kitsch, palm trees, tropical jungle, horizontal louvers, horizontal brises, light wood, blonde wood, white walls, vertical orientation, drone overhead, top-down, fisheye, dutch angle, dramatic stormy clouds, scaffolding, cranes, vehicles, signage, watermark, text, logo, blurry, hdr garish, instagram filter, oversaturated, compact stubby volume, square footprint`;

/* MASTER DESCRIPTION — usado por todos os prompts */
const MASTER_DESCRIPTION = `
ARCHITECTURAL DESIGN (very specific, must be respected):
The house is a TWO-STORY residence with a strongly elongated horizontal proportion (length-to-height ratio approximately 5:1).
The UPPER VOLUME is a long thin rectangular box, distinctly LONGER than it is tall, cantilevered prominently on all four sides over a smaller, recessed ground floor.
The flat ROOF SLAB projects even further beyond the upper volume's wall plane in all directions, creating a generous overhanging "umbrella" eave — the roof eave is the most projected element of the entire composition.
The UPPER VOLUME FACADE is composed of alternating vertical panels: approximately 60% solid panels of dark scorched ipe wood (warm dark brown with subtle wood grain), and 40% perforated muxarabi corten steel panels (small square geometric perforations creating a screen-like texture, weathered reddish-brown patina). Between the panels, narrow tall vertical slits of glass allow glimpses into the interior. The panels run from the underside of the roof slab down to the intermediate slab.
The INTERMEDIATE SLAB is a thin clean horizontal band of raw board-formed exposed concrete (visible horizontal pine formwork grain), defining a sharp horizontal datum between the floors.
From the front edge of this intermediate slab hangs a CONTINUOUS NARROW PLANTER with abundant tropical climbing vegetation — philodendrons, cipó-jasmim, hera — cascading downward in lush vertical green curtains that partially veil the ground floor.
The GROUND FLOOR is significantly RECESSED from the upper volume plane (set back about 1.5 meters), forming a clear horizontal shadow void where the cantilever shadow falls. The ground floor walls are made of stacked natural Brazilian chapada stone (canga / basalto chapado) with raw irregular layered texture — a massive tectonic stone podium. Set into this stone podium, recessed glass openings reveal the interior with subtle lighting.
The house is grounded but feels visually as if the upper volume hovers above the stone base.
NO ornamental elements beyond what is described. No people. No vehicles. No signage.

SITE CONTEXT:
The house sits on a very wide open countryside lot in the Brazilian cerrado biome. Wide flat-to-gently-undulating terrain extending toward a distant horizon. Foreground covered in native ornamental grasses (capim do texas, fountain grass) swaying. A few sparse native Brazilian trees (ipê-amarelo, jaboticaba) at moderate distances providing scale. Subtle rocky outcrops here and there. NO palm trees. NO dense tropical jungle.

ATMOSPHERE:
Natural daytime clear afternoon, soft directional sunlight from the side, gentle warm tones but NOT dramatic golden hour cliché. Clear pale blue sky with delicate cirrus clouds high above, slight atmospheric haze at the horizon. Calm, contemplative, anti-spectacular.

QUALITY:
Hyperrealistic architectural photography simulation, post-processing standard of The Boundary / KERN / MIR / Brick Visual studios, indistinguishable from a Phase One IQ4 150MP medium format photograph. Magazine editorial AD / Dezeen / ArchDaily standard. Horizontal cinematic 16:9 composition.
`.trim();

const VARIANTS = [
  {
    code: "V5A",
    name: "Frontal pura (vista hero)",
    seed: 14528,
    cameraInstruction: `CAMERA: Strictly frontal orthogonal elevation view from human eye level, perfectly perpendicular to the long facade. The full elongated horizontality of the upper volume fills the composition. The house centered, symmetric framing.`,
  },
  {
    code: "V5B",
    name: "Frontal levemente angulada",
    seed: 29381,
    cameraInstruction: `CAMERA: Near-frontal view with subtle 15-degree angle off-axis (slight three-quarter to the left), from human eye level. The cantilever depth and the perforated screens are revealed by the angle. Architectural editorial framing.`,
  },
  {
    code: "V5C",
    name: "3/4 lateral paisagística",
    seed: 47102,
    cameraInstruction: `CAMERA: Three-quarter side view from a moderate distance, low human angle, showing the full longitudinal extension of the house resting delicately on the cerrado terrain. The cantilever projection visible in foreshortening. Wide architectural landscape composition.`,
  },
];

console.log(`\n━━━ FGAA v1.0 · Fase 1 v5 · Volumetria fiel ao projeto · FLUX.2 Max ━━━\n`);
VARIANTS.forEach((v) => console.log(`  ${v.code} — ${v.name} (seed ${v.seed})`));
console.log(`\n  Endpoint  : fal-ai/flux-2-max`);
console.log(`  Custo est : ~$0.42 total\n`);

async function generateOne(variant) {
  const t0 = Date.now();
  const prompt = `${MASTER_DESCRIPTION}\n\n${variant.cameraInstruction}`;
  const payload = {
    prompt,
    negative_prompt: SHARED_NEGATIVE,
    image_size: { width: 1920, height: 1080 },
    num_images: 1,
    enable_safety_checker: false,
    seed: variant.seed,
    num_inference_steps: 60,
    guidance_scale: 8.0, // ligeiramente maior — força mais aderência ao prompt
  };

  const submit = await fetch("https://queue.fal.run/fal-ai/flux-2-max", {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!submit.ok) { throw new Error(`${variant.code} ${submit.status}: ${await submit.text()}`); }
  const { request_id, status_url, response_url } = await submit.json();
  console.log(`  ✓ ${variant.code} submetida · ${request_id.slice(0, 12)}…`);

  for (let i = 0; i < 80; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const s = await (await fetch(status_url, { headers: { Authorization: `Key ${FAL_KEY}` } })).json();
    if (s.status === "COMPLETED") {
      const result = await (await fetch(response_url, { headers: { Authorization: `Key ${FAL_KEY}` } })).json();
      const url = result.images?.[0]?.url;
      if (!url) throw new Error(`${variant.code} sem URL`);
      const img = Buffer.from(await (await fetch(url)).arrayBuffer());
      const fname = `I6-master-${variant.code}-seed${variant.seed}.jpg`;
      const fpath = path.join(OUTPUT_DIR, fname);
      await fs.writeFile(fpath, img);
      await fs.writeFile(
        path.join(OUTPUT_DIR, `I6-master-${variant.code}-seed${variant.seed}.json`),
        JSON.stringify({
          version: "FGAA v1.0 · Fase 1 v5 (volumetria fiel)",
          variant: variant.code, name: variant.name, seed: variant.seed,
          endpoint: "fal-ai/flux-2-max", pricing: "$0.07/MP × 2 = $0.14",
          timestamp: new Date().toISOString(),
          prompt, negative: SHARED_NEGATIVE,
          result: { url, request_id }, duration_s: (Date.now() - t0) / 1000,
          size_kb: (img.length / 1024).toFixed(1),
        }, null, 2),
      );
      console.log(`  ✓ ${variant.code} CONCLUÍDA em ${((Date.now() - t0) / 1000).toFixed(1)}s · ${(img.length / 1024).toFixed(0)} KB`);
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
console.log(`\n━━━ Concluído em ${((Date.now() - start) / 1000).toFixed(1)}s ━━━`);
results.forEach((r, i) => {
  if (r.status === "fulfilled") console.log(`  ✓ ${VARIANTS[i].code} OK`);
  else console.log(`  ✗ ${VARIANTS[i].code} FALHOU: ${r.reason.message || r.reason}`);
});
console.log();
