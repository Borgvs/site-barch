"""FGAA v3.1 · 6 clips Veo 3 Fast.
Sequência: A0→A1→A2→A3→A4→A5→A6.
Pessoas frente→trás nos clips finais para movimento natural no reverse.
"""
import os, json
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
print(f"  ok")

MODEL = "fal-ai/veo3/fast/image-to-video"

CINEMATIC_BASE = (
    "Smooth cinematic time-lapse construction sequence. "
    "Camera holds STEADY, very subtle slow parallax only. "
    "Dramatic overcast cloudy sky and soft volumetric directional light remain constant throughout the clip. "
    "Dry pavement, no wet reflections. "
    "Hélène Binet painterly architectural photography atmosphere. No people unless specified. "
    "Setting: LOT 03 at ALL Resort Club Residence, Porto Belo Santa Catarina, golf course visible at the back, "
    "pampas grass perimeter, biovaleta natural drainage swale. "
)

PEOPLE_FWD_BWD = (
    "Three figures walk SLOWLY from the foreground toward the background, gradually moving AWAY from the camera, "
    "depth-axis movement only (not lateral). Their motion is calm and continuous toward the deck and entrance. "
)

clips = [
    {
        "name": "C1_A0_A1",
        "start": A0,
        "prompt": CINEMATIC_BASE + (
            "Time-lapse transition: the EMPTY grass-covered lot transforms — vegetation cleared, earth excavated, "
            "concrete foundation grade beams (BALDRAMES) appear progressively forming the structural building footprint. "
            "The golf course and pampas grass perimeter remain visible at the back throughout."
        ),
    },
    {
        "name": "C2_A1_A2",
        "start": A1,
        "prompt": CINEMATIC_BASE + (
            "Time-lapse transition: from foundation baldrames to ground floor INFRAESTRUTURA — concrete walls and "
            "lower volume start rising from the foundation, stone-clad lower level emerges, garage volume forms. "
            "Same site, same context."
        ),
    },
    {
        "name": "C3_A2_A3",
        "start": A2,
        "prompt": CINEMATIC_BASE + (
            "Time-lapse transition: SUPRAESTRUTURA assembles — vertical concrete columns extend upward, horizontal "
            "beams form the upper volume framework, first slabs cantilever outward forming the dramatic overhangs. "
            "The architectural composition reveals itself."
        ),
    },
    {
        "name": "C4_A3_A4",
        "start": A3,
        "prompt": CINEMATIC_BASE + (
            "Time-lapse transition: structural skeleton CONSOLIDATES and completes — all concrete columns, beams, "
            "cantilevered slabs reach their final positions. Warm reddish-brown timber accents emerge alongside the "
            "board-formed concrete. Roof slab fixes in place. No walls yet, the full structural composition is visible."
        ),
    },
    {
        "name": "C5_A4_A5",
        "start": A4,
        "prompt": CINEMATIC_BASE + (
            "Time-lapse transition: envelope completes — concrete walls fill between structural columns, warm timber "
            "wood-slat brise screens install across the upper facade, glazing fills all openings, lush tropical "
            "vegetation (filodendros, ferns) cascades over the planter parapets, the small reflection pool forms at "
            "the entrance, paver path materializes leading to the door. "
            + PEOPLE_FWD_BWD +
            "The residence reaches its completed state, becoming the contemporary Barch house we will see in the final frame."
        ),
    },
    {
        "name": "C6_A5_A6",
        "start": A5,
        "prompt": CINEMATIC_BASE + (
            "Smooth orbital cinematic camera arc, approximately 35-45 degrees around the completed contemporary "
            "residence, starting at the 3/4 left front view and ending at a more frontal axial view of the same house. "
            "The HOUSE REMAINS STATIONARY; only the camera orbits gently around it at constant distance and altitude. "
            "Lush vegetation, glazing, wood-slat brise, reflection pool, planters, paver paths all remain perfectly "
            "coherent throughout the orbit. "
            + PEOPLE_FWD_BWD
        ),
    },
]

print(f"\n[2/3] Disparando 6 clips via {MODEL} ...")
handlers = []
for c in clips:
    h = fal_client.submit(MODEL, arguments={
        "image_url": c["start"],
        "prompt": c["prompt"],
        "duration": "8s",
        "aspect_ratio": "16:9",
        "resolution": "720p",
        "generate_audio": False,
    })
    handlers.append((c["name"], h))
    print(f"  {c['name']}: {h.request_id}")

print("\n[3/3] Waiting for all 6 videos (this can take a few minutes)...")
results = {}
for name, h in handlers:
    r = h.get()
    url = r["video"]["url"]
    results[name] = url
    print(f"  {name} done: {url}")

with open("/tmp/fgaa_v31_clips.json", "w") as f:
    json.dump(results, f, indent=2)
print("\n" + json.dumps(results, indent=2))
