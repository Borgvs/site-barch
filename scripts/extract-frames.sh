#!/usr/bin/env bash
#
# extract-frames.sh — Extrai 240 frames .webp a 24fps de um vídeo .mp4
# Uso: bash scripts/extract-frames.sh ~/Downloads/construction-source.mp4
#
# Pré-requisito: ffmpeg (brew install ffmpeg)

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Uso: $0 <caminho-do-video.mp4>"
  exit 1
fi

INPUT="$1"
if [[ ! -f "$INPUT" ]]; then
  echo "❌ Vídeo não encontrado: $INPUT"
  exit 1
fi

# Resolve diretório raiz do projeto (assume que o script está em scripts/)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
OUT_DIR="$ROOT/public/frames"

echo "▸ Limpando frames antigos em $OUT_DIR"
mkdir -p "$OUT_DIR"
find "$OUT_DIR" -maxdepth 1 -name 'frame_*.webp' -delete 2>/dev/null || true

echo "▸ Extraindo 240 frames a 24fps, escala 1920x1080, webp quality 78"
ffmpeg -y -loglevel warning -stats \
  -i "$INPUT" \
  -vf "fps=24,scale=1920:1080:flags=lanczos" \
  -frames:v 240 \
  -c:v libwebp -lossless 0 -quality 78 -preset photo -an \
  "$OUT_DIR/frame_%04d.webp"

COUNT=$(find "$OUT_DIR" -name 'frame_*.webp' | wc -l | tr -d ' ')
SIZE=$(du -sh "$OUT_DIR" | awk '{print $1}')

echo ""
echo "✅ Extraídos $COUNT frames · tamanho total: $SIZE"
echo "▸ Próximo passo: node scripts/generate-frames-manifest.mjs"
