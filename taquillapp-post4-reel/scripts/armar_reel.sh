#!/usr/bin/env bash
# Arma output/post4_reel_comentarios.mp4 (1080×1920, 14 s, H.264, 30 fps; AAC si hay clips/audio.mp3)
# y output/portada.png.
# Uso: scripts/armar_reel.sh [carpeta_salida]
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=${1:-output}
FPS=30
DUR=14
PORTADA_T=1.5
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

# 1) Cuadros: 420 en 4 procesos en paralelo
for r in "0 105" "105 210" "210 315" "315 420"; do
  node scripts/render_reel.js "$TMP/cuadros" $r &
done
wait

# 2) Video (+ audio si existe)
AUDIO=()
if [ -f clips/audio.mp3 ]; then
  AUDIO=(-i clips/audio.mp3 -map 1:a -c:a aac -b:a 192k -ar 48000)
else
  echo "Aviso: no existe clips/audio.mp3; el video se exporta sin audio." >&2
fi
ffmpeg -v error -y -framerate $FPS -i "$TMP/cuadros/%04d.png" "${AUDIO[@]:0:2}" -map 0:v "${AUDIO[@]:2}" -t $DUR \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -profile:v high -r $FPS -movflags +faststart \
  "$OUT/post4_reel_comentarios.mp4"

# 3) Portada (escena 1)
ffmpeg -v error -y -ss $PORTADA_T -i "$OUT/post4_reel_comentarios.mp4" -frames:v 1 "$OUT/portada.png"
ls -la "$OUT"
