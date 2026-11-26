#!/usr/bin/env bash
# Transforme les images rendues par Blender en petites vidéos .mp4 en boucle + une image d'aperçu.
set -euo pipefail
SRC=/tmp/kettle-render
DST="$(dirname "$0")/../../public/anims"
FPS_JSON=/tmp/kettle-frames/frames.json
mkdir -p "$DST"
for dir in "$SRC"/*/; do
  id=$(basename "$dir")
  n=$(ls "$dir" | wc -l)
  fps=$(python3 -c "import json;print(json.load(open('$FPS_JSON'))['$id']['fps'])")
  # Répète la boucle pour atteindre ~10 s (lecture fluide même si la boucle native accroche)
  loops=$(python3 -c "import math;print(max(1, math.ceil(10*$fps/$n)))")
  ffmpeg -y -loglevel error -stream_loop $((loops-1)) -framerate "$fps" -i "$dir/f%04d.png" \
    -t 10 -c:v libx264 -preset veryfast -crf 27 -pix_fmt yuv420p -movflags +faststart -an "$DST/$id.mp4"
  poster=$(printf "%s/f%04d.png" "$dir" $((n * 2 / 5)))
  ffmpeg -y -loglevel error -i "$poster" -vf scale=240:-1 -q:v 4 "$DST/$id.jpg"
  echo "$id : $(du -h "$DST/$id.mp4" | cut -f1)"
done
