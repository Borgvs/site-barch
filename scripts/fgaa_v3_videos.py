"""FGAA v3.0 · 7 clips Veo 3.1 com first-last + people walking foreground→background."""
import os, json
import fal_client

os.environ["FAL_KEY"] = "330fd626-1b8b-43cb-857b-6bab0e179553:0a99fc6a25315728694d1f910ebb6c4f"

ANCHORS = json.load(open("/tmp/fgaa_v3_anchors.json"))
A0 = ANCHORS["A0_refined"]
A1 = ANCHORS["A1_baldrame"]
A4 = ANCHORS["A4_pilares"]
A3 = ANCHORS["A3_supra"]
A5 = ANCHORS["A5_estrutura"]
AV = ANCHORS["A_vedacao_parcial"]
F1 = ANCHORS["A6_F1"]
F2 = ANCHORS["F2"]

# Model: fal-ai/veo3.1/image-to-video (or veo3 if 3.1 unavailable)
# Veo 3 accepts only start image; we describe end state extensively in prompt
MODEL = "fal-ai/veo3-fast/image-to-video"

CINEMATIC = ("Cinematic locked architectural camera at ground level 3/4 angle from the left, "
             "very subtle slow parallax. Smooth seamless construction time-lapse. "
             "Dramatic overcast cloudy sky, soft volumetric light, dry pavement. "
             "Hélène Binet style painterly contemplative atmosphere. No music.")

PEOPLE_FWD_BWD = ("Throughout the clip, three figures walk SLOWLY from the foreground toward the background, "
                  "gradually moving away from the camera toward the entrance and deck. "
                  "Their motion is on the depth axis only, not lateral. ")

clips = [
    {"name": "C1_A0_A1",  "start": A0, "prompt": CINEMATIC + " Time-lapse: the empty grass-covered lot at Porto Belo Golf transforms — vegetation cleared, earth excavated, concrete foundation grade beams (baldrames) appear forming the structural footprint. Same lot, same golf course in the back, same pampas grass perimeter."},
    {"name": "C2_A1_A4",  "start": A1, "prompt": CINEMATIC + " Time-lapse: concrete columns extend vertically from the foundation baldrames to first-slab height, horizontal beams form, first floor slab emerges with formwork edges. Same Porto Belo location, golf course visible at the back."},
    {"name": "C3_A4_A3",  "start": A4, "prompt": CINEMATIC + " Time-lapse: full structural skeleton of the two-story residence rises — exposed board-formed concrete columns and beams alternating with warm reddish-brown vertical wood accents, large cantilevered slabs reveal the dramatic architectural composition."},
    {"name": "C4_A3_A5",  "start": A3, "prompt": CINEMATIC + " Time-lapse: structural skeleton consolidates and completes — every concrete column, beam, slab, and wood accent reaches its final position, open void between slabs still revealing sky, no walls yet."},
    {"name": "C5_A5_AV",  "start": A5, "prompt": CINEMATIC + " Time-lapse: board-formed concrete walls fill between structural columns in the lower volume, warm reddish-brown wood-slat brise screen begins installing on half of the upper facade, large rectangular openings remain unglazed."},
    {"name": "C6_AV_F1",  "start": AV, "prompt": CINEMATIC + " Time-lapse: glazing fills the openings, lush tropical vegetation grows in the planter parapets (filodendros and tropical ferns cascade over the concrete edge), warm timber wood-slat brise completes the upper facade, small reflection pool forms at the entrance walkway, finishing touches arrive. " + PEOPLE_FWD_BWD + "The residence reaches its completed state."},
    {"name": "C7_F1_F2",  "start": F1, "prompt": CINEMATIC + " Smooth orbital camera arc 35-45° around the completed contemporary residence, starting at the 3/4 left view and ending at a frontal axial view. The house remains stationary; only the camera orbits gently around it. " + PEOPLE_FWD_BWD + "Lush vegetation, glazing, wood-slat brise, and reflection pool stay coherent throughout."},
]

print(f"Disparando 7 clips via {MODEL} ...")
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

print("\nWaiting for all 7 videos...")
results = {}
for name, h in handlers:
    r = h.get()
    url = r["video"]["url"]
    results[name] = url
    print(f"  {name} done: {url}")

with open("/tmp/fgaa_v3_clips.json", "w") as f:
    json.dump(results, f, indent=2)
print("\n" + json.dumps(results, indent=2))
