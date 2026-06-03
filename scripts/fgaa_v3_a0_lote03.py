"""Refinar A0 com dados precisos do LOTE 03 / ALL Resort."""
import os, json
import fal_client

os.environ["FAL_KEY"] = "330fd626-1b8b-43cb-857b-6bab0e179553:0a99fc6a25315728694d1f910ebb6c4f"

F1 = fal_client.upload_file("/sessions/tender-gifted-franklin/mnt/Barch-system/site-barch/public/anchors/F1.png")

prompt = (
    "Replace this scene with the EMPTY LOT 03 at ALL Resort Club Residence in Porto Belo, Santa Catarina, "
    "BEFORE any construction begins. The lot is a rectangular 1000m² parcel (approximately 50m deep × 20m wide), "
    "with a NATURAL DOWNWARD SLOPE of about 4 meters going FROM THE FRONT (street side, higher elevation) "
    "TOWARD THE BACK (golf course, lower elevation). The slope is gentle and progressive, characteristic of the resort's "
    "terraced topography. "
    "At the BACK OF THE LOT, immediately visible: a wide BIOVALETA — a natural drainage swale with low riparian "
    "subtropical vegetation, ferns and small grasses lining a gentle linear depression. "
    "BEYOND THE BIOVALETA, the iconic ALL RESORT GOLF COURSE FAIRWAY opens up: emerald and yellow-green manicured "
    "grass, perfectly maintained, extending toward the horizon in gentle rolling shapes, characteristic of the "
    "first illuminated golf course in Latin America. "
    "On the lot PERIMETER: tall PAMPAS GRASS (Cortaderia selloana) with feathery silver-white plumes — signature "
    "vegetation of this resort. Native Atlantic Forest subtropical foliage, filodendros, low tropical shrubs "
    "between the pampas grass clusters. "
    "The lot itself is fully covered in natural healthy grass and wildflowers, slightly overgrown native vegetation, "
    "untouched virgin sandy soil with some exposed clay. NO building, NO foundation, NO excavation, NO machinery, "
    "NO people, NO construction markings. "
    "Distant view: lush Atlantic Forest mountains faintly visible at the far horizon beyond the golf course. "
    "Dramatic overcast cloudy sky, soft volumetric directional light, painterly Hélène Binet atmosphere, "
    "dry pavement no wet reflections. Front of lot has concrete sidewalk along Rua Praia do Caixa D'Aço. "
    "Ground level 3/4 angle from the front-left looking toward the back-right (toward the golf course), "
    "matching the reference photo framing exactly. "
    "Photoreal architectural site photography, 35mm full frame, ultra-detailed grass and golf course textures, "
    "calm pre-construction silence, contemplative pause before architecture arrives. 16:9 widescreen."
)

h = fal_client.submit("fal-ai/flux-pro/kontext", arguments={
    "prompt": prompt, "image_url": F1, "guidance_scale": 3.5,
    "safety_tolerance": "5", "output_format": "jpeg", "aspect_ratio": "16:9",
})
print(f"A0 LOTE-03: {h.request_id}")
r = h.get()
print(f"\nA0 done: {r['images'][0]['url']}")
