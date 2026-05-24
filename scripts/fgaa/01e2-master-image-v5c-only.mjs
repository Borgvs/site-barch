#!/usr/bin/env node
/**
 * FGAA v1.0 — Fase 1 v5 (V5C apenas — completar a rodada interrompida)
 */

import fs from "node:fs/promises";
import path from "node:path";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("FAL_KEY ausente"); process.exit(1); }

const OUTPUT_DIR = path.resolve("tmp/hero-v8/anchors");
await fs.mkdir(OUTPUT_DIR, { recursive: true });

const SHARED_NEGATIVE = `cartoon, illustration, sketch, didactic architectural diagram, 3d wireframe, low-poly cgi, videogame look, overly saturated colors, neon, gold, marble, mediterranean, european chateau, asian temple, generic luxury, kitsch, palm trees, tropical jungle, horizontal louvers, horizontal brises, light wood, blonde wood, white walls, vertical orientation, drone overhead, top-down, fisheye, dutch angle, dramatic stormy clouds, scaffolding, cranes, vehicles, signage, watermark, text, logo, blurry, hdr garish, instagram filter, oversaturated, compact stubby volume, square footprint`;

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

CAMERA: Three-quarter side view from a moderate distance, low human angle, showing the full longitudinal extension of the house resting delicately on the cerrado terrain. The cantilever projection visible in foreshortening. Wide architectural landscape composition.
`.trim();

const SEED = 47102;
const t0 = Date.now();

console.log(`\n━━━ V5C standalone · seed ${SEED} ━━━\n`);

const submit = await fetch("https://queue.fal.run/fal-ai/flux-2-max", {
  method: "POST",
  headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: MASTER_DESCRIPTION,
    negative_prompt: SHARED_NEGATIVE,
    image_size: { width: 1920, height: 1080 },
    num_images: 1,
    enable_safety_checker: false,
    seed: SEED,
    num_inference_steps: 60,
    guidance_scale: 8.0,
  }),
});
if (!submit.ok) { console.error(submit.status, await submit.text()); process.exit(1); }
const { request_id, status_url, response_url } = await submit.json();
console.log(`  request_id: ${request_id}`);

for (let i = 0; i < 100; i++) {
  await new Promise((r) => setTimeout(r, 3000));
  const s = await (await fetch(status_url, { headers: { Authorization: `Key ${FAL_KEY}` } })).json();
  process.stdout.write(`\r  status: ${s.status} (${((Date.now() - t0) / 1000).toFixed(1)}s)   `);
  if (s.status === "COMPLETED") {
    const result = await (await fetch(response_url, { headers: { Authorization: `Key ${FAL_KEY}` } })).json();
    const url = result.images?.[0]?.url;
    if (!url) { console.error("\nsem URL"); process.exit(1); }
    const img = Buffer.from(await (await fetch(url)).arrayBuffer());
    const fpath = path.join(OUTPUT_DIR, `I6-master-V5C-seed${SEED}.jpg`);
    await fs.writeFile(fpath, img);
    await fs.writeFile(
      path.join(OUTPUT_DIR, `I6-master-V5C-seed${SEED}.json`),
      JSON.stringify({
        version: "FGAA v1.0 · v5C standalone",
        variant: "V5C", seed: SEED,
        endpoint: "fal-ai/flux-2-max", timestamp: new Date().toISOString(),
        result: { url, request_id }, duration_s: (Date.now() - t0) / 1000,
        size_kb: (img.length / 1024).toFixed(1),
      }, null, 2),
    );
    console.log(`\n  ✓ ${fpath} · ${(img.length / 1024).toFixed(0)} KB · ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    process.exit(0);
  }
  if (s.status === "FAILED" || s.status === "ERROR") {
    console.error(`\n  FAL ${s.status}:`, JSON.stringify(s));
    process.exit(1);
  }
}
console.error("\ntimeout");
process.exit(1);
