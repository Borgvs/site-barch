"""FGAA v2.1 full pipeline · 4 anchors restantes + 7 clips Veo 3.1 ultra."""
import os, json, time
import fal_client

os.environ["FAL_KEY"] = "330fd626-1b8b-43cb-857b-6bab0e179553:0a99fc6a25315728694d1f910ebb6c4f"

ANCHOR_DIR = "/sessions/tender-gifted-franklin/mnt/Barch-system/site-barch/public/anchors"

print("[1/4] Upload all canonical anchors to Fal...")
F1 = fal_client.upload_file(f"{ANCHOR_DIR}/F1.png")
E_orig = fal_client.upload_file(f"{ANCHOR_DIR}/E.jpg")
A0 = fal_client.upload_file(f"{ANCHOR_DIR}/v21/A0_terreno.jpg")
E_harm = fal_client.upload_file(f"{ANCHOR_DIR}/v21/E_harmonized.jpg")
print(f"  F1: {F1}\n  E_harm: {E_harm}\n  A0: {A0}")

# ====== 4 ANCHORS RESTANTES via FLUX Pro Kontext ======
print("\n[2/4] Disparando 4 anchors via FLUX Pro Kontext (paralelo)...")

CTX = (
    "Same residential lot shown in the image, same urban context, same mature lush trees on the left, "
    "same tropical shrubs perimeter, same concrete sidewalk in foreground, same neighboring houses "
    "faintly visible at horizon, same dramatic overcast cloudy sky, same soft volumetric light, "
    "same 3/4 angle framing from the left. Dry pavement no wet reflections. Painterly contemplative "
    "Hélène Binet architectural photography, 35mm full frame, ultra-detailed. 16:9 widescreen. "
)

# A1 limpeza (from A0 grama)
prompt_a1 = CTX + (
    "Construction site CLEARING phase: grass and topsoil layer has been freshly scraped off across the "
    "entire building footprint, exposing raw reddish-brown earth and clay subsoil, slight ground level "
    "depression where vegetation was removed, neat piles of removed topsoil at one edge, wooden surveyor "
    "stakes with red flags marking the four building corners, axes traced in white lime powder on the "
    "bare earth. NO building, NO foundation yet, NO machinery, NO people."
)
h_a1 = fal_client.submit("fal-ai/flux-pro/kontext", arguments={
    "prompt": prompt_a1, "image_url": A0, "guidance_scale": 3.5,
    "safety_tolerance": "5", "output_format": "jpeg", "aspect_ratio": "16:9",
})
print(f"  A1 limpeza: {h_a1.request_id}")

# A2 escavação (from A0 grama)
prompt_a2 = CTX + (
    "Deep foundation PILE EXCAVATION phase: cleared earth lot now shows a regular grid of circular deep "
    "pile holes drilled into the earth at structural column positions, approximately 60cm diameter pile "
    "holes spaced at structural intervals across the footprint, dark shadowy depths inside each hole, "
    "neat piles of excavated reddish-brown earth and clay beside each hole, wooden surveyor stakes with "
    "strings demarcating structural axes, steel rebar cages stacked nearby ready for installation. "
    "NO building, NO walls, NO machinery, NO people in frame."
)
h_a2 = fal_client.submit("fal-ai/flux-pro/kontext", arguments={
    "prompt": prompt_a2, "image_url": A0, "guidance_scale": 3.5,
    "safety_tolerance": "5", "output_format": "jpeg", "aspect_ratio": "16:9",
})
print(f"  A2 escavação: {h_a2.request_id}")

# A3 baldrame (from A0 grama)
prompt_a3 = CTX + (
    "Concrete foundation GRADE BEAM (baldrame) phase COMPLETE: lot shows finished foundation system at "
    "ground level — exposed reinforced concrete pile tops flush with the earth, connected by a perimeter "
    "network of reinforced concrete grade beams (vigas baldrames) forming the structural building footprint "
    "outline, raw board-formed concrete texture in cool gray tones, vertical steel rebar starter columns "
    "rising from each pile and corner protruding upward awaiting next pour, compacted raw earth filled "
    "inside the perimeter. NO walls, NO structure above ground yet, NO machinery, NO people."
)
h_a3 = fal_client.submit("fal-ai/flux-pro/kontext", arguments={
    "prompt": prompt_a3, "image_url": A0, "guidance_scale": 3.5,
    "safety_tolerance": "5", "output_format": "jpeg", "aspect_ratio": "16:9",
})
print(f"  A3 baldrame: {h_a3.request_id}")

# A6 vedação (from E_harmonized) — entre E (estrutura) e F1 (final)
prompt_a6 = CTX + (
    "ENVELOPE PARTIALLY ASSEMBLED phase: the structural skeleton in the image is now receiving its envelope. "
    "Board-formed concrete walls fill the lower volume between the structural columns, upper volume starts "
    "to receive vertical warm reddish-brown wood-slat brise screens on approximately half of the upper "
    "facade with the other half still showing exposed concrete and wood structure. Large rectangular openings "
    "ready for glazing but still unglazed. Low planter parapet visible at first floor edge but plants not "
    "yet installed. Exposed cantilevered concrete slabs still dominant. NO masonry, NO bricks — ONLY board-"
    "formed concrete and warm timber wood slats. NO people, NO scaffolding, dry pavement."
)
h_a6 = fal_client.submit("fal-ai/flux-pro/kontext", arguments={
    "prompt": prompt_a6, "image_url": E_harm, "guidance_scale": 3.5,
    "safety_tolerance": "5", "output_format": "jpeg", "aspect_ratio": "16:9",
})
print(f"  A6 vedação: {h_a6.request_id}")

print("\nWaiting for 4 anchors...")
r_a1 = h_a1.get(); print(f"  A1 done")
r_a2 = h_a2.get(); print(f"  A2 done")
r_a3 = h_a3.get(); print(f"  A3 done")
r_a6 = h_a6.get(); print(f"  A6 done")

# Save URLs
anchors = {
    "A0_terreno": None,  # already have local
    "A1_limpeza": r_a1["images"][0]["url"],
    "A2_escavacao": r_a2["images"][0]["url"],
    "A3_baldrame": r_a3["images"][0]["url"],
    "A5_estrutura_E_harm": None,  # already have local
    "A6_vedacao": r_a6["images"][0]["url"],
}
with open("/tmp/fgaa_v21_anchors.json", "w") as f:
    json.dump(anchors, f, indent=2)
print(json.dumps(anchors, indent=2))
print("\n✓ 4 anchors done. Run fgaa_v2_1_videos.py next.")
