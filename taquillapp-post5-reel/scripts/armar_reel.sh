#!/usr/bin/env bash
# Arma output/post5_reel_combos.mp4 (1080×1920, 15 s, H.264, 30 fps, AAC) y output/portada.png.
# Uso: scripts/armar_reel.sh [carpeta_clips] [carpeta_salida]
set -euo pipefail
cd "$(dirname "$0")/.."
CLIPS=${1:-clips}
OUT=${2:-output}
FPS=30
CORTES="0,2,6,9,12,15"
VOL_ORIGINAL=0.4   # sin audio.mp3: audio original al 40%
PORTADA_T=1.0      # fotograma de la escena 1 para la portada
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
has_audio() { [ -n "$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$1")" ]; }

for c in 01_mano_codigo 02_canje_real 03_combo; do
  [ -f "$CLIPS/$c.mp4" ] || { echo "Falta el clip obligatorio $CLIPS/$c.mp4" >&2; exit 1; }
done
CLIP=("$CLIPS/01_mano_codigo.mp4" "$CLIPS/02_canje_real.mp4" "$CLIPS/03_combo.mp4" "" "")
CLIP4=0
if [ -f "$CLIPS/04_palomitas.mp4" ]; then CLIP[3]="$CLIPS/04_palomitas.mp4"; CLIP4=1; fi
AUDIO=""
if [ -f "$CLIPS/audio.mp3" ]; then
  AUDIO="$CLIPS/audio.mp3"
  CORTES=$(python3 scripts/ajustar_beat.py "$AUDIO" "$CORTES")
fi
IFS=, read -r -a T <<< "$CORTES"
TOTAL=${T[5]}
echo "Cortes: $CORTES · escena 4 con clip: $CLIP4 · audio: ${AUDIO:-original al ${VOL_ORIGINAL}}"

# 1) Capa animada (textos + fondos del diseño donde no hay clip), cuadro por cuadro
node scripts/render_animacion.js "$TMP/anim" "$CORTES" "$CLIP4"

# 2) Fondo: cada clip escalado/recortado a 9:16 y recortado a su escena, unido con cortes secos
COVER="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=$FPS"
IN=(); F=""; V=""; A=""; i=0
for k in 0 1 2 3 4; do
  D=$(awk -v a="${T[$k]}" -v b="${T[$((k+1))]}" 'BEGIN{printf "%.4f", b-a}')
  if [ -n "${CLIP[$k]}" ]; then
    SRC=${CLIP[$k]}
    LARGO=$(dur "$SRC")
    if awk -v l="$LARGO" -v d="$D" 'BEGIN{exit !(l<d)}'; then
      echo "Aviso: $SRC dura ${LARGO}s y la escena $((k+1)) pide ${D}s; se congela el último cuadro." >&2
    fi
    IN+=(-i "$SRC")
    F+="[$i:v]$COVER,tpad=stop_mode=clone:stop_duration=$D,trim=duration=$D,setpts=PTS-STARTPTS[v$k];"
    if [ -z "$AUDIO" ]; then
      if has_audio "$SRC"; then
        F+="[$i:a]aresample=48000,aformat=channel_layouts=stereo,volume=$VOL_ORIGINAL,apad,atrim=duration=$D,asetpts=PTS-STARTPTS[a$k];"
      else
        F+="anullsrc=r=48000:cl=stereo,atrim=duration=$D[a$k];"
      fi
    fi
    i=$((i+1))
  else
    F+="color=c=black:s=1080x1920:r=$FPS:d=$D,setsar=1[v$k];"
    [ -n "$AUDIO" ] || F+="anullsrc=r=48000:cl=stereo,atrim=duration=$D[a$k];"
  fi
  V+="[v$k]"; A+="[a$k]"
done
F+="${V}concat=n=5:v=1:a=0[base];"
IN+=(-framerate $FPS -i "$TMP/anim/%04d.png"); ANIM=$i; i=$((i+1))
F+="[base][$ANIM:v]overlay=0:0:shortest=1,format=yuv420p[v];"
if [ -n "$AUDIO" ]; then
  IN+=(-i "$AUDIO")
  F+="[$i:a]aresample=48000,aformat=channel_layouts=stereo,apad,atrim=duration=$TOTAL[a]"
else
  F+="${A}concat=n=5:v=0:a=1[a]"
fi

ffmpeg -v error -y "${IN[@]}" -filter_complex "$F" -map "[v]" -map "[a]" -t "$TOTAL" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -r $FPS \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT/post5_reel_combos.mp4"
echo "$OUT/post5_reel_combos.mp4"

# 3) Portada: fotograma de la escena 1 con el texto completo
ffmpeg -v error -y -ss $PORTADA_T -i "$OUT/post5_reel_combos.mp4" -frames:v 1 "$OUT/portada.png"
echo "$OUT/portada.png"
