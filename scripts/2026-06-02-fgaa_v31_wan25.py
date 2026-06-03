"""FGAA v3.1 · 6 clips via Wan 2.5 image-to-video (Fal).
Pivot from Veo3 (locked) to Wan 2.5 fast for v3.1 sequence:
A0→A1→A2→A3→A4→A5→A6.
People walk foreground→background in C5/C6 for natural reverse motion.
"""
import os, json, time
import fal_client

os.environ["FAL_KEY"] = "330fd626-1b8b-43cb-857b-6bab0e179553:0a99fc6a25315728694d1f910ebb6c4f"

V3 = "/sessions/tender-gifted-franklin/mnt/Barch-system/site-barch/public/anchors/v3"

print("[1/3] Upload all 7 anchors to Fal...")
A0 = fal_client.upload_file(f"{V3}/A0_terreno.jpg")
A1 = fal_client.upload_file(f"{V3}/A1_Baldrame.png")
A2 = fal_client.upload_file(f"{V3}/A2_infraestrutura.jpeg")
A3 = fal_client.upload_file(f"{V3}/A3_supraestrutura.png")
A4 = fal_client.upload_file(f"{V3}/A4_Estrutura.png")
A5 = fal_client.upload_file(f"{V3}/A5_F1.png")
A6 = fal_client.upload_file(f"{V3}/A6_F2.jpg")
print("  ok")

# Kling 2.1 master has first-last frame support and is reliably available
MODEL = "fal-ai/kling-video/v2.1/master/image-to-video"

CINEMATIC_BASE = (
    "Smooth cinematic time-lapse construction sequence. "
    "Camera holds steady, very subtle slow parallax only. "
    "Dramatic overcast cloudy sky and soft volumetric directional light remain constant. "
    "Dry pavement, no wet reflections. "
    "Hélène Binet painterly architectural photography atmosphere. "
    "Setting: LOT 03 at ALL Resort Club Residence, Porto Belo Santa Catarina, "
    "golf course visible at the back, pampas grass perimeter, biovaleta drainage. "
)

PEOPLE_FWD_BWD = (
    "Three figures walk SLOWLY from the foreground toward the background, "
    "gradually moving AWAY from the camera, depth-axis movement only. "
)

clips = [
    {"name": "C1_A0_A1", "start": A0, "end": A1,
     "prompt": CINEMATIC_BASE + "Time-lapse: empty grass lot transforms — vegetation cleared, "
     "earth excavated, concrete foundation grade beams (baldrames) appear forming the footprint."},
    {"name": "C2_A1_A2", "start": A1, "end": A2,
     "prompt": CINEMATIC_BASE + "Time-lapse: foundation baldrames to ground-floor infrastructure — "
     "concrete walls and lower volume rise, stone-clad lower level emerges, garage volume forms."},
    {"name": "C3_A2_A3", "start": A2, "end": A3,
     "prompt": CINEMATIC_BASE + "Time-lapse: SUPRAESTRUTURA assembles — vertical concrete columns "
     "extend upward, horizontal beams form the upper volume framework, first cantilevered slabs appear."},
    {"name": "C4_A3_A4", "start": A3, "end": A4,
     "prompt": CINEMATIC_BASE + "Time-lapse: structural skeleton CONSOLIDATES — all concrete columns, "
     "beams, cantilevered slabs reach final positions. Warm reddish-brown timber accents emerge. Roof slab fixes. No walls yet."},
    {"name": "C5_A4_A5", "start": A4, "end": A5,
     "prompt": CINEMATIC_BASE + "Time-lapse: envelope completes — concrete walls fill, warm timber "
     "wood-slat brise screens install across the upper facade, glazing fills all openings, lush "
     "tropical vegetation (filodendros, ferns) cascades over the planter parapets, reflection pool "
     "forms at the entrance, paver path materializes. " + PEOPLE_FWD_BWD +
     "The residence reaches its completed state."},
    {"name": "C6_A5_A6", "start": A5, "end": A6,
     "prompt": CINEMATIC_BASE + "Smooth orbital cinematic camera arc, approximately 35-45 degrees "
     "around the completed contemporary residence, starting at 3/4 left front view and ending at "
     "a more frontal axial view. The HOUSE REMAINS STATIONARY; only the camera orbits gently at "
     "constant distance. Lush vegetation, glazing, wood-slat brise, reflection pool stay coherent. " + PEOPLE_FWD_BWD},
]

print(f"\n[2/3] Disparando 6 clips via {MODEL} ...")
handlers = []
for c in clips:
    args = {
        "image_url": c["start"],
        "prompt": c["prompt"],
        "duration": "5",  # Kling: 5 or 10
        "aspect_ratio": "16:9",
        "negative_prompt": "blurry, low quality, distorted, watermark, text",
        "cfg_scale": 0.5,
    }
    # Kling 2.1 master supports tail_image_url for first-last frame
    if c.get("end"):
        args["tail_image_url"] = c["end"]
    try:
        h = fal_client.submit(MODEL, arguments=args)
        handlers.append((c["name"], h))
        print(f"  {c['name']}: {h.request_id}")
    except Exception as e:
        print(f"  {c['name']} FAILED: {e}")
    time.sleep(2)  # small delay to avoid rate limit

print("\n[3/3] Aguardando todos os videos (pode levar 5-10 min)...")
results = {}
for name, h in handlers:
    try:
        r = h.get()
        url = r["video"]["url"]
        results[name] = url
        print(f"  {name} done: {url}")
    except Exception as e:
        print(f"  {name} ERROR: {e}")

with open("/tmp/fgaa_v31_wan25_clips.json", "w") as f:
    json.dump(results, f, indent=2)
print("\n" + json.dumps(results, indent=2))
