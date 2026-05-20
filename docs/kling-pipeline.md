# Hero 3D · Pipeline operacional Kling 3.0

> Procedimento ponto-a-ponto para gerar os 240 frames `.webp` do Hero da home.
> Quando os frames existirem em `public/frames/` + `manifest.json`, o site
> faz swap automático do modo procedural (Three.js) para o modo
> fotorealista (frame sequence).

## TL;DR — caminho mais rápido

1. Gera **2 imagens base** (FLUX/Midjourney) — terreno vazio + casa completa
2. Sobe ambas no **Kling 3.0** modo "Image to Video" com prompt timelapse
3. Baixa o `.mp4` resultante
4. Roda `scripts/extract-frames.sh video.mp4` — extrai 240 `.webp` em `public/frames/`
5. Roda `node scripts/generate-frames-manifest.mjs` — gera `manifest.json`
6. `npm run build` + deploy. Pronto.

Tempo total: ~2h · Custo: ~US$3 (Kling 3.0 mode Pro)

---

## Parte 1 · Gerar as imagens base

### 1.1 Imagem FINAL (frame 240) — casa completa

Use **FLUX Pro 1.1** (recomendado) ou **Midjourney v7**.

**Prompt FINAL:**

```
Architectural photography of a completed luxury residence,
Brazilian contemporary architecture inspired by Bernardes
Arquitetura and Marcio Kogan. Two displaced rectangular volumes
in L-shape, board-formed concrete walls with visible pine
formwork grain, cumaru wood deck and brise-soleil, floor-to-ceiling
glass with minimal black mullions, corten steel transition elements,
honed basalt exterior flooring, infinity pool integrated with deck,
shallow reflecting pool under 4-meter cantilever.

Lush tropical landscaping at borders (no plants on the building),
late golden hour light casting long horizontal shadows from the right.
Camera position: high three-quarter view from the southeast,
elevation 12 meters, distance 35 meters from center, no tilt.
Shot on Phase One IQ4 150MP, 50mm lens, f/8, base ISO 50,
no people, no cars, no signage.

Wide horizontal composition 16:9, photorealistic, architectural
magazine quality (Dezeen, ArchDaily editorial).
```

**Negative prompt:**

```
people, cars, signage, text, logo, watermark, blurry, low quality,
oversaturated, fake colors, cartoonish, render-looking, plastic,
vibrant colors, neon, gradient sky
```

**Settings:**
- Aspect ratio: `16:9`
- Resolution: `1920×1080` (mínimo) — preferível `2560×1440`
- Steps: `40+`
- Guidance: `4.5` (FLUX) ou `--s 250` (MJ)
- Seed: anotar para regenerar variações coerentes

### 1.2 Imagem INICIAL (frame 1) — terreno vazio

**Prompt INICIAL:**

```
Empty residential lot, 2000 square meters, gentle 2% slope,
tropical vegetation only at the borders, clear pre-dawn sky.
Same camera angle, lens and lighting setup as the reference
final image: high three-quarter view from southeast, elevation
12 meters, distance 35 meters from center, no tilt.

Soft early-morning ambient light, before sunrise, low contrast.
Shot on Phase One IQ4 150MP, 50mm lens, f/8.
No people, no cars, no construction equipment.

Wide horizontal composition 16:9, photorealistic.
```

**Crítico:** mesmo seed, mesma câmera. Use img2img a partir da imagem final
com força ~0.85, mascarando apenas o terreno + céu, ou use a referência da
final no MJ com `--cref` para fixar enquadramento.

### 1.3 (Opcional) Imagens intermediárias

Para Kling 3.0 isso é dispensável. Mas se quiser controle de 5 fases:

- Frame 60 (estrutura): mesma cena, só pilares e lajes de concreto exposto
- Frame 120 (volumes): paredes fechadas, sem vidro/madeira
- Frame 180 (materialidade): casa com materiais mas céu ainda neutro
- Frame 220 (luz): casa completa, golden hour

---

## Parte 2 · Gerar o vídeo no Kling 3.0

### 2.1 Acessar Kling

URL: https://klingai.com (ou app.klingai.com)
Modo: **Image to Video** → **Multi-Image Reference** (start + end)

### 2.2 Configuração

| Setting | Valor | Notas |
|---|---|---|
| Mode | Professional 1080p | Pro paga, vale o investimento |
| Duration | 10 segundos | 24fps × 10s = 240 frames |
| Aspect Ratio | 16:9 | Coincide com o canvas |
| Camera Movement | Static (fixa) | NÃO usar zoom/pan automático |
| Start Frame | Imagem do terreno (1.2) | upload |
| End Frame | Imagem da casa completa (1.1) | upload |
| Negative | (ver abaixo) | |

### 2.3 Prompt do vídeo

```
Cinematic timelapse of a luxury concrete residence being built
from an empty lot. Sequence of phases happens in this exact order:
foundations and rebar appear; concrete columns and slabs rise;
walls close in; floor-to-ceiling glass panels are installed;
wood deck is laid; corten steel and basalt details appear last;
landscaping grows; water gradually fills the reflecting pool;
sunlight rotates from pre-dawn to golden hour.

Smooth continuous time progression. Camera is locked (no movement,
no zoom, no pan). No people, no construction equipment, no cranes.
Architectural photography quality throughout. Each construction
stage flows naturally into the next.
```

### 2.4 Negative prompt (Kling)

```
people, cars, cranes, construction equipment, dust, smoke, scaffolding,
camera movement, zoom, pan, tilt, dolly, parallax, jitter, motion blur,
text, watermark, color shifts, oversaturation, neon, gradient sky
```

### 2.5 Render & download

- Renderiza (3-8 min)
- Preview no Kling. Se a câmera moveu, **regenerar com seed diferente** —
  câmera fixa é INEGOCIÁVEL para frame sequence funcionar.
- Download `.mp4` em 1080p
- Renomeie para `construction-source.mp4` e salve em `~/Downloads/`

---

## Parte 3 · Extrair frames

### 3.1 Pré-requisito

Instale `ffmpeg` se ainda não tem:

```bash
brew install ffmpeg
```

### 3.2 Rodar o script de extração

```bash
cd /Users/gustavo/Documents/Claude/Projects/Barch-system/site-barch
bash scripts/extract-frames.sh ~/Downloads/construction-source.mp4
```

O script:
1. Limpa `public/frames/*.webp` antigos
2. Extrai 240 frames a 24fps
3. Converte para `.webp` quality 78 (sweet spot 60-90% redução vs JPEG)
4. Nomeia `frame_0001.webp` até `frame_0240.webp`
5. Resolução fixa: 1920×1080
6. Reporta tamanho total ao final

Tamanho esperado: 15-30 MB total (240 frames × 80-120 KB cada).

### 3.3 Gerar o manifest

```bash
node scripts/generate-frames-manifest.mjs
```

Cria `public/frames/manifest.json` com:

```json
{
  "count": 240,
  "prefix": "/frames/frame_",
  "extension": ".webp",
  "pad": 4,
  "width": 1920,
  "height": 1080,
  "version": "<timestamp>",
  "pipeline": "kling-3.0"
}
```

A presença do `manifest.json` é o **trigger** para o site mudar
automaticamente do modo Three.js procedural para frame sequence.

---

## Parte 4 · Validar e fazer deploy

### 4.1 Local

```bash
npm run dev
# Abra http://localhost:3001
```

Você deve ver no canto superior direito do Hero o indicador `● FRAME SEQUENCE`
em vez de `○ PROCEDURAL`.

Role para verificar que:
- Frame 1 = terreno vazio
- Frame 60 = estrutura aparente
- Frame 120 = paredes fechadas
- Frame 180 = vidro + materiais
- Frame 220 = golden hour
- Frame 240 = casa completa

### 4.2 Deploy

```bash
git add public/frames docs scripts components/hero lib
git commit -m "feat(hero): swap procedural → frame sequence Kling 3.0"
git push origin main
```

Vercel constrói automaticamente. Verifique em **barch.com.br** (prod).

---

## Parte 5 · Anti-padrões a evitar

| Sintoma | Causa provável | Correção |
|---|---|---|
| Casa "salta" entre frames | Câmera não-fixa no Kling | Regenerar vídeo com seed novo + Static camera |
| Cores vibrantes/coloridas | Prompt vazou pra modo "creative" | Negative prompt mais agressivo · força paleta B&W na descrição |
| Pessoas/carros aparecem | Negative incompleto | Adicione `people, cars, vehicles, humans` |
| Frames muito pesados | Quality `.webp` alto | Re-extract com `quality 70` no ffmpeg |
| Carregamento lento | Frames > 200 KB cada | Reduza resolução para 1600×900 ou aumente compressão |
| Site mostra "procedural" mesmo com frames | manifest.json não foi gerado | Rode `node scripts/generate-frames-manifest.mjs` |

---

## Parte 6 · Iteração futura

Quando quiser variações:

1. **Hora do dia diferente:** mesma config Kling, prompt swap "golden hour" por
   "blue hour overcast" / "morning fog" / "high noon harsh shadows"
2. **Variação sazonal:** ajuste paisagismo no negative + descritivo
3. **Outras tipologias:** mesma estrutura pra mostrar empreendimento /
   universidade / instituição cultural — basta nova start/end image

Cada variação custa o mesmo ~US$3 + 2h de pipeline.

---

## Parte 7 · Custo & tempo recapitulados

| Item | Custo | Tempo |
|---|---|---|
| FLUX Pro 1.1 imagem final | ~US$0.05 | 30s |
| FLUX Pro 1.1 imagem inicial | ~US$0.05 | 30s |
| Kling 3.0 Pro 1080p 10s | ~US$2.50 | 5min render |
| Extração ffmpeg + webp | grátis | 1min |
| Manifest + commit + deploy | grátis | 5min |
| **TOTAL** | **~US$3** | **~15min ativo + render** |

---

## Apêndice · Quando NÃO usar frame sequence

- Você quer iterar rápido (mudou o programa da casa, scale, posição)
- Variações infinitas (cada uma custaria render novo)
- Devices low-end (carregar 25 MB de frames pode ser caro)

Nesses casos, mantenha o modo procedural. O Three.js render em B&W
maquete-CAD tem coerência própria com o branding Barch ("técnica reduz ruído").

O dual-mode permite **manter ambos** indefinidamente.
