#!/usr/bin/env bash
# Arma el Reel 100% animado: output/post5_reel_combos.mp4 (1080×1920, 15 s, H.264, 30 fps, AAC con
# los efectos de sonido), output/efectos.wav (solo efectos, para mezclar con tu música) y output/portada.png.
# Uso: scripts/armar_reel.sh [carpeta_salida]
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=${1:-output}
FPS=30
PORTADA_T=1.0      # escena 1 con el 🍿 ya aterrizado
PICO_DB=-3         # pico de los efectos normalizado a -3 dBFS
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

# 1) Cuadros: 450 en 4 procesos en paralelo
for r in "0 113" "113 226" "226 339" "339 450"; do
  node scripts/render_reel.js "$TMP/cuadros" $r &
done
wait

# 2) Efectos de sonido sintetizados (paleta de la skill motion-reel)
node scripts/efectos.mjs "$TMP/efectos_raw.wav" 15
PICO=$(ffmpeg -v info -i "$TMP/efectos_raw.wav" -af volumedetect -f null - 2>&1 | sed -n 's/.*max_volume: \(-*[0-9.]*\) dB/\1/p')
ffmpeg -v error -y -i "$TMP/efectos_raw.wav" -af "volume=$(awk -v p="$PICO" -v o=$PICO_DB 'BEGIN{print o-p}')dB" \
  -c:a pcm_s16le -ar 48000 "$OUT/efectos.wav"

# 3) Video
ffmpeg -v error -y -framerate $FPS -i "$TMP/cuadros/%04d.png" -i "$OUT/efectos.wav" -map 0:v -map 1:a -t 15 \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -profile:v high -r $FPS \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT/post5_reel_combos.mp4"

# 4) Portada
ffmpeg -v error -y -ss $PORTADA_T -i "$OUT/post5_reel_combos.mp4" -frames:v 1 "$OUT/portada.png"
ls -la "$OUT"
