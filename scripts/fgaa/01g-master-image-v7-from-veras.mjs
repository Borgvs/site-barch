#!/usr/bin/env node
/**
 * FGAA v1.0 — Fase 1 v7
 * Adaptação do prompt Veras v3 para FLUX.2 Max text-to-image
 *
 * Diferença chave vs Veras: FLUX não recebe modelo 3D — precisa
 * descrição volumétrica explícita no prompt. Tudo o mais (materials,
 * lighting, environment, forbiddens) é mantido idêntico ao prompt v3.
 *
 * Endpoint: fal-ai/flux-2-max ($0.07/MP = ~$0.14 por imagem 1920×1080)
 */

import fs from "node:fs/promises";
import path from "node:path";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("FAL_KEY ausente"); process.exit(1); }

const OUTPUT_DIR = path.resolve("tmp/hero-v8/anchors");
await fs.mkdir(OUTPUT_DIR, { recursive: true });

/* Prompt-master = Veras v3 + bloco VOLUMETRY (que no Veras vem do modelo 3D) */
const PROMPT = `
ARCHITECTURAL VOLUMETRY (must be respected — this is the source design):
The building is a two-story residence with strongly elongated horizontal proportions (length-to-height ratio approximately 5:1). The upper volume is a long rectangular box, distinctly longer than it is tall, cantilevered prominently on all four sides over a smaller, recessed ground floor. The flat roof slab projects further beyond the upper volume's wall plane, creating a generous horizontal overhanging eave — the roof eave is the most projected element of the composition. The upper volume facade is composed of alternating vertical panels: approximately 60 percent solid panels of dark scorched wood and 40 percent perforated corten steel screens with small-square geometric perforations. Between the panels, narrow tall vertical slits of glass allow glimpses into the interior. The intermediate slab is a thin clean horizontal band of raw board-formed exposed concrete. From the front edge of this intermediate slab hangs a continuous narrow planter with abundant climbing vegetation cascading downward as a dense green curtain partially veiling the ground floor. The ground floor is significantly recessed from the upper volume plane (set back about 1.5 meters), forming a clear horizontal shadow void where the cantilever shadow falls. The ground floor walls are made of stacked natural stone with raw irregular layered horizontal stratification. Set into this stone podium, recessed glass openings reveal the interior with subtle warm lighting.

STYLE
Hyperrealistic architectural photograph. Magazine editorial standard. Restrained observational framing. Strong attention to material texture and atmospheric depth. The image should feel observed, not staged.

ENVIRONMENT
The building sits on a generous open natural lot. Natural undulating terrain with sandy-clay soil tones in warm beige to ochre. Ground cover composed of wild native grasses 40 to 80cm tall with feathery tan-amber plumes growing organically, never trimmed. Scattered native broadleaf trees with twisted dark trunks and irregular green canopies at moderate distances. Background of layered rolling hills fading into atmospheric distance haze. No manicured lawn, no paved sidewalk, no curb, no street, no suburban context.

MATERIALS — high physical detail required
- Raw exposed concrete with horizontal board-formed texture: visible imprints of pine plank formwork running horizontally, subtle shadow lines between boards, faint pour seams. Cool neutral grey tone.
- Dark scorched wood vertical cladding panels: warm dark brown wood close to espresso brown, subtle linear vertical grain, matte finish, deep shadow lines between panels.
- Weathered corten steel perforated panels: small geometric square perforations forming uniform screen pattern, reddish-brown patina with subtle vertical streaking from age, matte mineral surface.
- Stacked natural stone wall cladding: irregular flat stones in layered horizontal stratification, mineral colors mixing warm grey, amber and rust tones, rough tactile surface with deep mortar joints.
- Floor-to-ceiling glass with minimal matte black aluminum frames 20mm maximum profile: high optical clarity, subtle clean reflections of the landscape, transparent enough to reveal interior tones with low warm ambient light inside. No mirror effect, no bluish tint.
- Cascading vegetation in the intermediate planter: green climbing plants with broad heart-shaped or split leaves and long trailing vines descending vertically, forming a dense partial green curtain.

LIGHTING
Time of day: late afternoon, approximately 16:30 to 17:00 local time. Soft directional sunlight at low angle from the left side at approximately 25 to 30 degrees above horizon. Color temperature 5000 to 5500K, warm but neutral, not orange-saturated. Long soft horizontal cast shadows with soft penumbra edges, low contrast, never harsh. Interior: subtle warm ambient lighting at 2700K visible faintly through glass suggesting habitation without brightness. Sky: clear pale blue at zenith fading to soft warm pale amber near horizon. Delicate thin cirrus clouds only. No cumulus, no turbulent or dramatic clouds, no storm sky, no heavy cloud cover. Atmospheric haze: subtle distance haze fading the background hills. No fog in foreground, no visible sunbeams, no god rays, no volumetric light rays through trees.

COLOR PALETTE
Dominant warm earth tones — sandy beige terrain, warm dark brown wood, rust-amber corten, warm grey concrete, mineral amber stone, deep green vegetation. Sky pale blue with subtle warm amber gradient at horizon only. Anchor neutral: cool grey of concrete.

ATMOSPHERE
Quiet and contemplative. The scene should feel like an unstaged afternoon moment observed without intervention. No theatrical mood, no drama, no event happening.

CAMERA
Near-frontal architectural view with subtle 15-degree angle off-axis to the left, from human eye level. The cantilever depth and perforated screen texture are revealed by the slight angle. Editorial architectural framing, horizontal cinematic 16:9 composition. All vertical structural lines perfectly vertical and parallel, no lens distortion.
`.trim();

const NEGATIVE = `palm trees, coconut palms, banana plants, tropical jungle, manicured lawn, garden beds with edging, flower beds, paving stones in geometric pattern, urban context, suburban context, street, curb, sidewalk, driveway, parked cars, road signs, fences, walls of property division, Mediterranean elements, white-washed walls, terracotta tiles, cypress trees, stucco textures, Asian temple, East Asian aesthetic, suburban tract home, condominium aesthetic, glass curtain wall skyscraper, gold, brass shiny, marble veneer, polished stone, ornamental moldings, decorative trims, fluted columns, staged furniture explosion, vehicles, cars, motorcycles, bicycles, construction equipment, scaffolding, cranes, workers, watermarks, text overlays, logos, signage, dramatic storm clouds, cumulus pile-up, turbulent sky, rainbow, lightning, sunbeams visible, god rays, volumetric light shafts, HDR oversaturation, Instagram filter, neon halos, CGI videogame, cartoon shading, flat plastic lighting, top-down drone view, fisheye distortion, tilted horizon, more than two human figures, dogs, pets, animals, children running, sports activity, theatrical action`;

const SEED = 92847; // novo seed inédito para esta variante

console.log(`\n━━━ FGAA v1.0 · Fase 1 v7 · Prompt Veras-style + FLUX.2 Max ━━━\n`);
console.log(`  Endpoint  : fal-ai/flux-2-max`);
console.log(`  Resolução : 1920×1080`);
console.log(`  Seed      : ${SEED}`);
console.log(`  Custo est : ~$0.14\n`);

const t0 = Date.now();
const submit = await fetch("https://queue.fal.run/fal-ai/flux-2-max", {
  method: "POST",
  headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: PROMPT,
    negative_prompt: NEGATIVE,
    image_size: { width: 1920, height: 1080 },
    num_images: 1,
    enable_safety_checker: false,
    seed: SEED,
    num_inference_steps: 70,
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
    const fpath = path.join(OUTPUT_DIR, `I6-master-V7-seed${SEED}.jpg`);
    await fs.writeFile(fpath, img);
    await fs.writeFile(
      path.join(OUTPUT_DIR, `I6-master-V7-seed${SEED}.json`),
      JSON.stringify({
        version: "FGAA v1.0 · v7 (Veras-prompt adaptado para FLUX.2 Max)",
        seed: SEED,
        endpoint: "fal-ai/flux-2-max",
        guidance_scale: 8.0,
        steps: 70,
        timestamp: new Date().toISOString(),
        prompt: PROMPT,
        negative: NEGATIVE,
        result: { url, request_id },
        duration_s: (Date.now() - t0) / 1000,
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
