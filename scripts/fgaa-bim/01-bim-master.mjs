#!/usr/bin/env node
/**
 * FGAA-BIM v1.0 · Fase 1 — Frame mestre B5 (vista drone · casa pronta)
 *
 * Gera o frame mestre B5: vista aérea oblíqua 45° da mesma casa do hero v8.2,
 * agora documentada como canteiro visto de drone. É o ponto de chegada da
 * narrativa BIM: a obra entregue, modelada e federada.
 *
 * Endpoint: fal-ai/flux-2-max  (~$0.04/img)
 *
 * Output: tmp/bim-v1/B5.jpg + tmp/bim-v1/B5.json
 *
 * Coerência com o hero: descrição arquitetônica da casa fiel ao I5 do hero
 * (mesma volumetria, mesmos materiais, mesma jardineira), mudando apenas o
 * ponto de vista — eye-level → drone 45° oblíquo.
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("FAL_KEY ausente"); process.exit(1); }

const OUT_DIR = path.resolve("tmp/bim-v1");

const PROMPT = `Aerial drone view, 45-degree oblique angle from upper-right looking down, late afternoon golden hour, of a contemporary residence in southern Brazil. The house is a two-story horizontal volume composed of: a heavy ground-floor base of stacked board-formed concrete walls in warm cool grey tones with horizontal striations from formwork; a cantilevered upper volume clad in dark walnut wood vertical slat panels and corten steel perforated muxarabi screens at the side, with large dark-framed glass openings on the long facade; a thin flat horizontal roof slab capping the whole composition with deep overhangs. Between the ground floor and the upper volume runs a generous concrete planter full of dense cascading philodendron leaves and trailing tropical vegetation hanging vertically down to the ground floor level. The roof is flat with subtle slope. The building footprint is approximately rectangular, oriented horizontally in the frame. The surrounding terrain is gently rolling, with wild native grasses 40 to 80cm tall in tan amber and ochre tones growing organically across the land in patches. Mature native trees frame the lot at the rear and sides — Brazilian pine, ipê, jacarandá silhouettes. Layered hills are visible in the distance, fading into atmospheric haze. The atmosphere is late afternoon: pale soft sky in pale blue to warm peach gradient at horizon, subtle volumetric haze, no dramatic clouds, low warm sunlight grazing the building from the right casting long soft shadows on the grass. Cinematic architectural photography, ultra-realistic, professional architectural photography style as if by Iwan Baan or Leonardo Finotti, 16:9 aspect ratio, sharp focus throughout, no people, no vehicles.`;

const NEGATIVE = `low quality, blurry, artifacts, distorted, watermark, text, signature, frame, border, people, cars, vehicles, pavement, sidewalk, urban context, sculpture, manicured lawn, palm trees, tropical jungle, dramatic clouds, sunset reds, neon, modern glass tower, skyscraper`;

async function submit() {
  console.log(`\n━━━ FGAA-BIM v1.0 · Fase 1 · B5 master (drone view) ━━━\n`);
  console.log(`  Endpoint: fal-ai/flux-2-max`);
  console.log(`  Aspect  : 16:9`);
  console.log(`  Custo   : ~$0.04\n`);

  const t0 = Date.now();

  const submit = await fetch("https://queue.fal.run/fal-ai/flux-2-max", {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: PROMPT,
      negative_prompt: NEGATIVE,
      aspect_ratio: "16:9",
      num_inference_steps: 32,
      guidance_scale: 4.5,
      num_images: 1,
      output_format: "jpeg",
      safety_tolerance: "5",
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
      if (!url) throw new Error(`sem URL: ${JSON.stringify(result)}`);
      console.log(`\n  ✓ resultado: ${url}`);

      const imgResp = await fetch(url);
      const imgBuf = Buffer.from(await imgResp.arrayBuffer());
      const outPath = path.join(OUT_DIR, "B5.jpg");
      await fs.writeFile(outPath, imgBuf);

      await fs.writeFile(
        path.join(OUT_DIR, "B5.json"),
        JSON.stringify({
          version: "FGAA-BIM v1.0 · Fase 1 master",
          anchor: "B5",
          name: "Drone view · casa pronta · modelo federado",
          endpoint: "fal-ai/flux-2-max",
          pricing: "$0.04/img",
          timestamp: new Date().toISOString(),
          prompt: PROMPT,
          negative_prompt: NEGATIVE,
          result: { url, request_id, local: outPath },
          duration_s: (Date.now() - t0) / 1000,
          size_kb: (imgBuf.length / 1024).toFixed(1),
        }, null, 2),
      );
      console.log(`\n━━━ B5 CONCLUÍDO em ${((Date.now() - t0) / 1000).toFixed(1)}s ━━━`);
      console.log(`  Salvo: ${outPath}`);
      console.log(`  Tamanho: ${(imgBuf.length / 1024).toFixed(0)} KB`);
      console.log(`\nValide o B5. Se OK, rode:`);
      console.log(`  node scripts/fgaa-bim/02-bim-anchors.mjs B4\n`);
      return;
    }
    if (s.status === "FAILED" || s.status === "ERROR") {
      throw new Error(`${s.status}: ${JSON.stringify(s)}`);
    }
  }
  throw new Error("timeout");
}

submit().catch((e) => { console.error(e); process.exit(1); });
