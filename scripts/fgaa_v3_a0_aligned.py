"""A0 com ANGULO da sequência v3 · usa A1_Baldrame como reference (não F1).
Garante continuidade visual entre A0 → A1 → A4 → A3 → A5 → F1.
"""
import os, json
import fal_client

os.environ["FAL_KEY"] = "330fd626-1b8b-43cb-857b-6bab0e179553:0a99fc6a25315728694d1f910ebb6c4f"

# Reference = A1_Baldrame para garantir mesmo angulo/perspectiva da sequencia
A1 = fal_client.upload_file("/sessions/tender-gifted-franklin/mnt/Barch-system/site-barch/public/anchors/v3/A1_Baldrame.png")
print(f"A1 uploaded: {A1}")

prompt = (
    "Take the EXACT camera angle, perspective, framing, viewpoint and composition shown in this reference image "
    "(the construction baldrame foundation phase of the residence). "
    "PRESERVE the IDENTICAL camera position, angle of view, distance, zoom, and orientation. "
    "Now REPLACE the construction scene with the SAME LOT 03 at ALL Resort Club Residence in Porto Belo, "
    "Santa Catarina, BEFORE any construction begins — completely EMPTY and untouched. "
    "Keep IDENTICAL: the lot boundaries, the topography, the slope, the property orientation, the surrounding context. "
    "The lot has a NATURAL DOWNWARD SLOPE going FROM THE FRONT (street/Rua Praia do Caixa D'Aço, higher elevation) "
    "TOWARD THE BACK (golf course, lower elevation), approximately 4 meters of drop across the 50m depth. "
    "At the BACK of the lot, visible: a wide BIOVALETA — natural drainage swale with low riparian subtropical "
    "vegetation. Beyond it, the iconic ALL RESORT GOLF COURSE FAIRWAY opens up: emerald and yellow-green manicured "
    "grass extending toward the horizon. "
    "On the lot perimeter and adjacent areas: tall PAMPAS GRASS (Cortaderia selloana) with feathery silver-white "
    "plumes — signature vegetation. Native Atlantic Forest subtropical foliage, filodendros. "
    "The lot itself is COMPLETELY EMPTY: fully covered in natural healthy grass and wildflowers, slightly overgrown "
    "native vegetation, untouched virgin sandy soil. NO building, NO foundation, NO baldrames, NO excavation, "
    "NO machinery, NO people, NO construction markings, NO stakes, NO formwork — just pristine vacant land. "
    "Distant view: lush Atlantic Forest mountains faintly visible at the far horizon. "
    "Front of lot has concrete sidewalk along the street. "
    "Same overcast cloudy sky and lighting tone as the reference image for continuity. "
    "Photoreal architectural site photography, ultra-detailed grass and ground textures, "
    "calm pre-construction silence. 16:9 widescreen."
)

h = fal_client.submit("fal-ai/flux-pro/kontext", arguments={
    "prompt": prompt, "image_url": A1, "guidance_scale": 3.5,
    "safety_tolerance": "5", "output_format": "jpeg", "aspect_ratio": "16:9",
})
print(f"A0 aligned: {h.request_id}")
r = h.get()
print(f"\nA0 aligned URL: {r['images'][0]['url']}")
