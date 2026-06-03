"""FGAA v3.0 · Hybrid Real-Anchored + Porto Belo Golf context.
Refinar A0 (declive+golfe) + gerar A_vedacao + 7 clips Veo 3.1 ultra.
Direção pessoas: frente→trás (para vídeo reverso ficar natural).
"""
import os, json, time
import fal_client

os.environ["FAL_KEY"] = "330fd626-1b8b-43cb-857b-6bab0e179553:0a99fc6a25315728694d1f910ebb6c4f"

V3 = "/sessions/tender-gifted-franklin/mnt/Barch-system/site-barch/public/anchors/v3"
ROOT = "/sessions/tender-gifted-franklin/mnt/Barch-system/site-barch/public/anchors"

print("[1/5] Upload all v3 anchors to Fal...")
A0_old = fal_client.upload_file(f"{V3}/A0_terreno.jpg")
A1_baldrame = fal_client.upload_file(f"{V3}/A1_Baldrame.png")
A4_pilares = fal_client.upload_file(f"{V3}/A4_pilares.png")
A3_supra = fal_client.upload_file(f"{V3}/A3_Supraestrutura.jpeg")
A5_estrutura = fal_client.upload_file(f"{V3}/A5_Estrutura.png")
A6_F1 = fal_client.upload_file(f"{V3}/A6_F1.png")
F2 = fal_client.upload_file(f"{ROOT}/F2.jpg")
print(f"  uploaded all 7 anchors")

# ─────────────────────────────────────────────────────────────────────
# [2/5] A0 refinado · declive + golfe Porto Belo + pampas grass
# ─────────────────────────────────────────────────────────────────────
print("\n[2/5] Disparando A0 refinado (Porto Belo Golf context)...")

prompt_a0_refined = (
    "Replace this scene with an EMPTY pristine residential lot at Porto Belo Golf All Resort, "
    "Santa Catarina coast Brazil, before any construction begins. "
    "The lot sits on a NATURAL SLOPE going up toward the back-left, characteristic of the resort topography. "
    "Behind the lot, an OPEN GOLF COURSE FAIRWAY extends to the horizon — manicured short grass in yellow-green tones, "
    "gently rolling, with the typical golf landscape: smooth turf, no buildings, sky filling the distance. "
    "On the perimeter of the lot: tall PAMPAS GRASS (Cortaderia selloana) with characteristic feathery plumes — "
    "the signature vegetation of this resort. Native subtropical foliage, filodendros, low tropical shrubs. "
    "The lot itself is fully covered in natural grass and small wildflowers, slightly overgrown native vegetation, "
    "untouched virgin soil. NO building, NO foundation, NO excavation, NO machinery, NO people, NO construction markings. "
    "Dramatic overcast cloudy sky, soft volumetric directional light, painterly Hélène Binet atmosphere, "
    "dry pavement no wet reflections. Concrete sidewalk in foreground. "
    "Ground level 3/4 angle from the left matching the reference framing exactly. "
    "Photoreal architectural site photography, 35mm full frame, ultra-detailed grass and golf course textures, "
    "calm pre-construction silence. 16:9 widescreen."
)
h_a0 = fal_client.submit("fal-ai/flux-pro/kontext", arguments={
    "prompt": prompt_a0_refined, "image_url": A6_F1, "guidance_scale": 3.5,
    "safety_tolerance": "5", "output_format": "jpeg", "aspect_ratio": "16:9",
})
print(f"  A0 refined: {h_a0.request_id}")

# ─────────────────────────────────────────────────────────────────────
# [3/5] A_vedacao_parcial · entre A5 estrutura e A6 F1
# ─────────────────────────────────────────────────────────────────────
print("\n[3/5] Disparando A_vedacao_parcial...")

prompt_a_vedacao = (
    "Same exact structural skeleton shown in this reference image — preserve every column, beam, slab, "
    "concrete framework, wood accents, perspective and 3/4 angle exactly. The envelope is now PARTIALLY ASSEMBLED: "
    "board-formed concrete walls have been built between the structural columns in the lower volume, rising halfway. "
    "On the upper volume, warm reddish-brown vertical WOOD-SLAT BRISE SCREEN has started to be installed on "
    "approximately HALF of the upper facade — the other half still shows exposed concrete and wood structure. "
    "Large rectangular openings are visible but STILL UNGLAZED. Low concrete planter parapet at the first floor edge "
    "but plants NOT YET installed. No vegetation in the planters yet. No glazing. NO masonry, NO brickwork — "
    "ONLY board-formed concrete and warm timber. NO people, NO scaffolding. "
    "Same urban context as the reference: Porto Belo Golf resort, golf course at the back, pampas grass perimeter, "
    "same dramatic overcast cloudy sky, soft volumetric light, dry pavement no wet reflections. "
    "Same 3/4 angle framing from the left. Photoreal architectural photography Hélène Binet style. 16:9 widescreen."
)
h_a_ved = fal_client.submit("fal-ai/flux-pro/kontext", arguments={
    "prompt": prompt_a_vedacao, "image_url": A5_estrutura, "guidance_scale": 3.5,
    "safety_tolerance": "5", "output_format": "jpeg", "aspect_ratio": "16:9",
})
print(f"  A_vedacao: {h_a_ved.request_id}")

print("\nWaiting for A0 + A_vedacao...")
r_a0 = h_a0.get(); A0_new_url = r_a0["images"][0]["url"]; print(f"  A0 done: {A0_new_url}")
r_a_ved = h_a_ved.get(); A_ved_url = r_a_ved["images"][0]["url"]; print(f"  A_vedacao done: {A_ved_url}")

# Save URLs
out = {
    "A0_refined": A0_new_url,
    "A_vedacao_parcial": A_ved_url,
    "A1_baldrame": A1_baldrame,
    "A4_pilares": A4_pilares,
    "A3_supra": A3_supra,
    "A5_estrutura": A5_estrutura,
    "A6_F1": A6_F1,
    "F2": F2,
}
with open("/tmp/fgaa_v3_anchors.json", "w") as f:
    json.dump(out, f, indent=2)
print("\n" + json.dumps(out, indent=2))
print("\n✓ All 8 anchors ready. Next: 7 video clips Veo 3.1 ultra.")
