#!/usr/bin/env bash
# Arma output/01.mp4, 02.mp4 y 03.mp4 (1080×1920, H.264, 30 fps, AAC) a partir de clips/ y capas/.
# Uso: scripts/armar_videos.sh [carpeta_clips] [carpeta_salida]
set -euo pipefail
cd "$(dirname "$0")/.."
CLIPS=${1:-clips}
OUT=${2:-output}
mkdir -p "$OUT"

FPS=30
VOL_01=0.25        # frame 1: «sin audio original o bajo»
MAX_01=7           # frame 1: 5–7 s
MAX_CLIP=15        # frames 2 y 3: máx 15 s
FOTO_03=5          # frame 3 si es foto: 5 s con zoom 1.00→1.06

COVER="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=$FPS"
ENC=(-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -r $FPS -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart -shortest)

dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
min() { awk -v a="$1" -v b="$2" 'BEGIN{print (a<b)?a:b}'; }
has_audio() { [ -n "$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$1")" ]; }

# Animación de entrada: caja1 en 0 s, caja2 a +120 ms; cada una sube 40 px con fundido en 350 ms (ease-out).
# Subtítulo 300 ms después de que termina el titular (0.12 + 0.35 + 0.30 = 0.77 s).
# Entradas 1..3 = caja1, caja2, subtitulo; [base] = fondo ya escalado.
anim() {
  local f="" i=1 st
  for st in 0 0.12 0.77; do
    f+="[$i:v]format=rgba,fade=t=in:st=$st:d=0.35:alpha=1[l$i];"
    i=$((i+1))
  done
  local prev=base
  i=1
  for st in 0 0.12 0.77; do
    local p="clip((t-$st)/0.35,0,1)"
    f+="[$prev][l$i]overlay=x=0:y='40*pow(1-$p,3)':eval=frame:format=auto[o$i];"
    prev=o$i; i=$((i+1))
  done
  echo "${f}[o3]format=yuv420p[v]"
}

capas() { local n=$1 d=$2; for c in caja1 caja2 subtitulo; do echo -loop 1 -framerate $FPS -t "$d" -i "capas/${n}_${c}.png"; done; }

# ---- 01: mano + código ----
SRC1="$CLIPS/01_mano_codigo.mp4"
D1=$(min "$(dur "$SRC1")" $MAX_01)
if has_audio "$SRC1"; then A1="[0:a]volume=$VOL_01,aresample=48000[a]"; AIN1=(); else A1="[4:a]anull[a]"; AIN1=(-f lavfi -t "$D1" -i anullsrc=r=48000:cl=stereo); fi
ffmpeg -v error -y -t "$D1" -i "$SRC1" $(capas 01 "$D1") "${AIN1[@]}" \
  -filter_complex "[0:v]$COVER[base];$(anim);$A1" -map "[v]" -map "[a]" -t "$D1" "${ENC[@]}" "$OUT/01.mp4"
echo "$OUT/01.mp4 (${D1}s)"

# ---- 02: canje real, sin texto ----
SRC2="$CLIPS/02_canje_real.mp4"
D2=$(min "$(dur "$SRC2")" $MAX_CLIP)
if has_audio "$SRC2"; then
  ffmpeg -v error -y -t "$D2" -i "$SRC2" -vf "$COVER" -map 0:v -map 0:a -af aresample=48000 "${ENC[@]}" "$OUT/02.mp4"
else
  ffmpeg -v error -y -t "$D2" -i "$SRC2" -f lavfi -t "$D2" -i anullsrc=r=48000:cl=stereo -vf "$COVER" -map 0:v -map 1:a "${ENC[@]}" "$OUT/02.mp4"
fi
echo "$OUT/02.mp4 (${D2}s)"

# ---- 03: combo (foto con zoom lento o clip) ----
if [ -f "$CLIPS/03_combo.mp4" ]; then
  SRC3="$CLIPS/03_combo.mp4"; D3=$(min "$(dur "$SRC3")" $MAX_CLIP)
  IN3=(-t "$D3" -i "$SRC3"); BASE3="[0:v]$COVER[base]"
  if has_audio "$SRC3"; then A3="[0:a]aresample=48000[a]"; AIN3=(); else A3="[4:a]anull[a]"; AIN3=(-f lavfi -t "$D3" -i anullsrc=r=48000:cl=stereo); fi
else
  SRC3=$(ls "$CLIPS"/03_combo.{jpg,jpeg,png,JPG,JPEG,PNG} 2>/dev/null | head -1 || true)
  [ -n "$SRC3" ] || { echo "Falta clips/03_combo (.jpg o .mp4)" >&2; exit 1; }
  D3=$FOTO_03; N=$((D3*FPS))
  IN3=(-i "$SRC3")
  # Escala a 2× antes del zoompan para que el zoom no tiemble
  BASE3="[0:v]scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,setsar=1,zoompan=z='1+0.06*on/($N-1)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=$N:s=1080x1920:fps=$FPS[base]"
  A3="[4:a]anull[a]"; AIN3=(-f lavfi -t "$D3" -i anullsrc=r=48000:cl=stereo)
fi
ffmpeg -v error -y "${IN3[@]}" $(capas 03 "$D3") "${AIN3[@]}" \
  -filter_complex "$BASE3;$(anim);$A3" -map "[v]" -map "[a]" -t "$D3" "${ENC[@]}" "$OUT/03.mp4"
echo "$OUT/03.mp4 (${D3}s)"
