#!/bin/bash
# FGAA v4.0 · Foto-real pipeline · Pós-produção
# Resolve os 3 problemas reportados:
# 1. A0 não é real (resolvido na geração: A0 substituída por FLUX Pro Kontext foto-real)
# 2. Sequência fluida entre clips (pixel-perfect anchor enforcement)
# 3. Fluido como timelapse + alta qualidade (1080p source + ffmpeg minterpolate 2x)
#
# Uso: bash post_production.sh
# Requer: ffmpeg + ffprobe + cwebp

set -e
cd "$(dirname "$0")"
BASE="$(pwd)"
ANCHORS="$BASE"
CLIPS="$BASE/clips"
FRAMES="$BASE/frames"
TMP="$BASE/.tmp"

echo "==> FGAA v4.0 pós-produção · iniciando em $BASE"
mkdir -p "$CLIPS" "$FRAMES" "$TMP"

# 1. PIXEL-PERFECT ANCHOR ENFORCEMENT
# Para cada clip V_n.mp4, substituir o último frame pela anchor A_{n+1} literal.
# Resultado: corte exato entre clips, zero salto.
NEXT_ANCHOR=("A1.png" "A2.png" "A3.png" "A4.png" "A5.png" "A6.png")

# Converter anchors para PNG canonicalizado 1920x1080
for i in 0 1 2 3 4 5 6; do
  case $i in
    0) src="A0.jpeg" ;;
    1) src="../v3/A1_Baldrame.png" ;;
    2) src="../v3/A2_infraestrutura.jpeg" ;;
    3) src="../v3/A3_supraestrutura.png" ;;
    4) src="../v3/A4_Estrutura.png" ;;
    5) src="../v3/A5_F1.png" ;;
    6) src="../v3/A6_F2.jpg" ;;
  esac
  ffmpeg -y -i "$src" -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" -frames:v 1 "$TMP/A${i}.png" 2>/dev/null
done

echo "==> Anchors normalizados 1920x1080"

# 2. Substituir último frame de cada V_n pela A_{n+1} literal
# Estratégia: pegar todos frames de V_n exceto o último, e concatenar A_{n+1} no final
for i in 1 2 3 4 5 6; do
  next=$i
  vmp4="$CLIPS/V${i}.mp4"
  if [[ ! -f "$vmp4" ]]; then
    echo "    SKIP V${i}.mp4 não existe ainda"
    continue
  fi
  echo "    → V${i} · enforcing anchor A${next} no último frame"
  # Extrair fps + duração
  fps=$(ffprobe -v 0 -of csv=p=0 -select_streams v:0 -show_entries stream=r_frame_rate "$vmp4" | head -1)
  totalframes=$(ffprobe -v 0 -of csv=p=0 -select_streams v:0 -count_frames -show_entries stream=nb_read_frames "$vmp4" | head -1)
  # Re-encode: tudo exceto últimos 2 frames + anchor freeze 2 frames
  ffmpeg -y -i "$vmp4" -vf "select='lt(n,${totalframes}-2)',setpts=N/FRAME_RATE/TB" -r "$fps" -c:v libx264 -crf 18 -preset slow "$TMP/V${i}_body.mp4" 2>/dev/null
  ffmpeg -y -loop 1 -i "$TMP/A${next}.png" -t 0.0625 -r "$fps" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p "$TMP/V${i}_tail.mp4" 2>/dev/null
  # Concat
  echo "file '$TMP/V${i}_body.mp4'" > "$TMP/concat${i}.txt"
  echo "file '$TMP/V${i}_tail.mp4'" >> "$TMP/concat${i}.txt"
  ffmpeg -y -f concat -safe 0 -i "$TMP/concat${i}.txt" -c copy "$CLIPS/V${i}_locked.mp4" 2>/dev/null
done

echo "==> Anchor enforcement completo"

# 3. CONCAT 6 clips em um único master
LOCKED_LIST="$TMP/locked_list.txt"
: > "$LOCKED_LIST"
for i in 1 2 3 4 5 6; do
  if [[ -f "$CLIPS/V${i}_locked.mp4" ]]; then
    echo "file '$CLIPS/V${i}_locked.mp4'" >> "$LOCKED_LIST"
  fi
done

ffmpeg -y -f concat -safe 0 -i "$LOCKED_LIST" -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -movflags +faststart "$BASE/master_v4.mp4" 2>/dev/null

echo "==> Master concat done: master_v4.mp4"

# 4. FLUIDEZ TIMELAPSE · ffmpeg minterpolate (motion compensation)
# Source ~24fps → output 48fps com motion-aware interpolation (mci_mode=mci, mc_mode=aobmc)
ffmpeg -y -i "$BASE/master_v4.mp4" -filter:v "minterpolate=fps=48:mi_mode=mci:mc_mode=aobmc:vsbmc=1" -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p "$BASE/master_v4_fluid48.mp4" 2>/dev/null

echo "==> Fluidez 48fps minterpolate concluído"

# 5. EXTRAÇÃO DE FRAMES WEBP 1600x900
# Master final ≈36s × 10fps = 360 frames (slow scrub no scroll)
rm -rf "$FRAMES"/*.webp 2>/dev/null
mkdir -p "$FRAMES"
ffmpeg -y -i "$BASE/master_v4_fluid48.mp4" -vf "fps=10,scale=1600:900" -q:v 82 "$FRAMES/frame_%04d.webp" 2>/dev/null

count=$(ls -1 "$FRAMES"/frame_*.webp | wc -l | tr -d ' ')
size=$(du -sh "$FRAMES" | cut -f1)
echo "==> ${count} frames extraídos para $FRAMES (${size} total)"

# 6. Limpeza tmp
rm -rf "$TMP"

echo ""
echo "===================="
echo "FGAA v4.0 DONE"
echo "  Master MP4: master_v4.mp4"
echo "  Fluid 48fps: master_v4_fluid48.mp4"
echo "  Frames WebP: ${count} em frames/"
echo "  Total size frames: ${size}"
echo "===================="
