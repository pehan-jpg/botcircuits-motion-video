#!/usr/bin/env bash
# Final renders for one composition.
#   out/<name>.mp4         H.264, CRF 14, yuv420p
#   out/<name>.webm        VP9
#   out/<name>-poster.png  poster still
# Frames are rendered once as PNG, then encoded with ffmpeg so keyframes can
# be forced on the first and last frames. That keeps both blank white loop
# frames bit identical after decoding.
# Usage: ./scripts/render.sh Build 414 [output-name]
# The output name may include a folder, e.g. space/space-chat-v1.
set -euo pipefail
COMP="$1"; POSTER_FRAME="$2"
NAME="${3:-$(echo "$COMP" | tr "[:upper:]" "[:lower:]")}"
SEQ="$(mktemp -d "${TMPDIR:-/tmp}/frames_XXXXXX")"
trap 'rm -rf "$SEQ"' EXIT
mkdir -p "$(dirname "out/$NAME")"
npx remotion bundle --out-dir build >/dev/null
npx remotion render build "$COMP" "$SEQ" --sequence --image-format=png --log=error
FPS=$(node -e "console.log(require('fs').readFileSync('src/config.ts','utf8').match(/FPS = (\d+)/)[1])")
LAST=$(( $(ls "$SEQ" | wc -l) - 1 ))
KF="expr:eq(n,0)+eq(n,$LAST)"
ffmpeg -loglevel error -y -framerate "$FPS" -i "$SEQ/element-%03d.png" \
  -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p -force_key_frames "$KF" \
  -movflags +faststart "out/$NAME.mp4"
ffmpeg -loglevel error -y -framerate "$FPS" -i "$SEQ/element-%03d.png" \
  -c:v libvpx-vp9 -crf 20 -b:v 0 -row-mt 1 -pix_fmt yuv420p -force_key_frames "$KF" \
  "out/$NAME.webm"
npx remotion still build "$COMP" "out/$NAME-poster.png" --frame="$POSTER_FRAME" --log=error
echo "Rendered out/$NAME.mp4, out/$NAME.webm, out/$NAME-poster.png"
