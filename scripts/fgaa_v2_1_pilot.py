"""FGAA v2.1 piloto · usa Fal.ai direto (não Higgsfield).
Dispara 2 jobs FLUX 1.1 Pro com F1.png como reference real (full-res).
"""
import os, sys, json
import fal_client

os.environ["FAL_KEY"] = "330fd626-1b8b-43cb-857b-6bab0e179553:0a99fc6a25315728694d1f910ebb6c4f"

print("[1/3] Upload F1.png to Fal...")
f1_url = fal_client.upload_file("/sessions/tender-gifted-franklin/mnt/Barch-system/site-barch/public/anchors/F1.png")
print(f"  F1 URL: {f1_url}")

print("[2/3] Upload E.jpg to Fal...")
e_url = fal_client.upload_file("/sessions/tender-gifted-franklin/mnt/Barch-system/site-barch/public/anchors/E.jpg")
print(f"  E URL: {e_url}")

# Edit do E · harmonizar luz overcast como F1
prompt_e_harmonize = (
    "Same exact architectural structure shown in the image — bare concrete and timber skeleton "
    "of a contemporary residence with cantilevered slabs, board-formed concrete columns and warm timber accents. "
    "Keep every structural element identical: same columns positions, same beams, same slabs, same wood accents, "
    "same vegetation, same perspective, same 3/4 angle framing from the left. "
    "ONLY change the sky and lighting: replace the bright blue sky with a deep dramatic overcast cloudy sky, "
    "soft volumetric directional light, painterly Hélène Binet atmosphere, "
    "warmer ground tones from the diffuse cloud light. Dry pavement no wet reflections. "
    "Photoreal architectural photography. 16:9 widescreen."
)

# Gerar A0 terreno · partindo da F1 como base
prompt_a0_terreno = (
    "Transform the residential lot shown in the image into the SAME location BEFORE construction begins. "
    "Same urban context: same mature lush trees on the left, same tropical shrubs perimeter, "
    "same concrete sidewalk in foreground, same neighboring houses faintly visible at horizon, "
    "same dramatic overcast cloudy sky, same soft volumetric light, same 3/4 angle framing from the left. "
    "The lot is COMPLETELY EMPTY and fully covered in natural grass and small wildflowers, "
    "slightly overgrown native vegetation. NO building, NO foundation, NO excavation, NO machinery, NO people. "
    "Untouched virgin soil beneath. Dry pavement no wet reflections. "
    "Painterly contemplative atmosphere, Hélène Binet architectural photography, "
    "35mm full frame, ultra-detailed grass and ground textures, calm pre-construction silence. "
    "16:9 widescreen."
)

print("[3/3] Disparando 2 jobs FLUX Pro Kontext (preserva identity) em paralelo...")

# Job 1: E_harmonized (edit lighting do E)
print("  Job 1: E harmonize (overcast lighting)")
handler_e = fal_client.submit(
    "fal-ai/flux-pro/kontext",
    arguments={
        "prompt": prompt_e_harmonize,
        "image_url": e_url,
        "guidance_scale": 3.0,
        "num_images": 1,
        "safety_tolerance": "5",
        "output_format": "jpeg",
        "aspect_ratio": "16:9",
    },
)
print(f"    request_id: {handler_e.request_id}")

# Job 2: A0_terreno (transform F1 → empty lot)
print("  Job 2: A0 terreno vazio (from F1)")
handler_a0 = fal_client.submit(
    "fal-ai/flux-pro/kontext",
    arguments={
        "prompt": prompt_a0_terreno,
        "image_url": f1_url,
        "guidance_scale": 3.5,
        "num_images": 1,
        "safety_tolerance": "5",
        "output_format": "jpeg",
        "aspect_ratio": "16:9",
    },
)
print(f"    request_id: {handler_a0.request_id}")

print("\nWaiting for both jobs...")
result_e = handler_e.get()
print(f"E done: {result_e['images'][0]['url']}")
result_a0 = handler_a0.get()
print(f"A0 done: {result_a0['images'][0]['url']}")

# Save URLs to JSON
out = {"E_harmonized_url": result_e['images'][0]['url'], "A0_terreno_url": result_a0['images'][0]['url']}
with open("/tmp/fgaa_v21_pilot.json", "w") as f:
    json.dump(out, f, indent=2)
print("\nResult saved to /tmp/fgaa_v21_pilot.json")
print(json.dumps(out, indent=2))
