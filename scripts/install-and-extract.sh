#!/usr/bin/env bash
#
# install-and-extract.sh — Instala ffmpeg via brew (se necessário) e extrai
# 240 frames do tmp/kling/construction.mp4 para public/frames/.
#
# Uso: bash scripts/install-and-extract.sh

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
INPUT="$ROOT/tmp/kling/construction.mp4"
OUT_DIR="$ROOT/public/frames"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Setup ffmpeg + extract 240 frames                   ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# 1. Verifica .mp4
if [[ ! -f "$INPUT" ]]; then
  echo "❌ Vídeo não encontrado: $INPUT"
  echo "   Rode 'npm run gerar-frames' primeiro para gerar o vídeo Kling."
  exit 1
fi
echo "✓ Vídeo encontrado: $INPUT ($(du -h "$INPUT" | cut -f1))"

# 2. Verifica/instala Homebrew
if ! command -v brew >/dev/null 2>&1; then
  echo ""
  echo "▸ Homebrew não encontrado. Instalando..."
  echo "  (Vai pedir sua senha do macOS — é normal)"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  # Configura PATH (Apple Silicon vs Intel)
  if [[ -d /opt/homebrew/bin ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -d /usr/local/Homebrew/bin ]]; then
    eval "$(/usr/local/Homebrew/bin/brew shellenv)"
  fi
fi
echo "✓ Homebrew: $(brew --version | head -1)"

# 3. Verifica/instala ffmpeg
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo ""
  echo "▸ Instalando ffmpeg via brew..."
  brew install ffmpeg
fi
echo "✓ ffmpeg: $(ffmpeg -version | head -1)"

# 4. Extrai frames
echo ""
echo "▸ Extraindo 240 frames a 24fps, scale 1920x1080, webp quality 78..."
mkdir -p "$OUT_DIR"
find "$OUT_DIR" -maxdepth 1 -name 'frame_*.webp' -delete 2>/dev/null || true

ffmpeg -y -loglevel warning -stats \
  -i "$INPUT" \
  -vf "fps=24,scale=1920:1080:flags=lanczos" \
  -frames:v 240 \
  -c:v libwebp -lossless 0 -quality 78 -preset photo -an \
  "$OUT_DIR/frame_%04d.webp"

# 5. Manifest
COUNT=$(find "$OUT_DIR" -name 'frame_*.webp' | wc -l | tr -d ' ')
TOTAL_BYTES=$(find "$OUT_DIR" -name 'frame_*.webp' -exec stat -f%z {} + | awk '{s+=$1} END {print s}')
SIZE_MB=$(echo "scale=2; $TOTAL_BYTES/1024/1024" | bc 2>/dev/null || echo "?")

cat > "$OUT_DIR/manifest.json" <<EOF
{
  "count": $COUNT,
  "prefix": "/frames/frame_",
  "extension": ".webp",
  "pad": 4,
  "width": 1920,
  "height": 1080,
  "version": "$(date +%s)",
  "pipeline": "fal-ai · kling-1.6-pro · flux-pro-1.1-ultra",
  "generatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "totalBytes": $TOTAL_BYTES
}
EOF

echo ""
echo "✅ ${COUNT} frames extraídos · ${SIZE_MB} MB"
echo "   Manifest: public/frames/manifest.json"
echo ""
echo "▸ Próximo passo:"
echo "   git add public/frames && git commit -m 'feat: 240 frames kling' && git push"
echo ""
