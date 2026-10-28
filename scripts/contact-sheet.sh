#!/usr/bin/env bash
# Tiles PNG stills into one labelled contact sheet: contact-sheet.sh <dir> <out.png> [cols]
set -euo pipefail
dir=$1; out=$2; cols=${3:-5}
ffmpeg -loglevel error -y -pattern_type glob -i "$dir/f*.png" \
  -vf "scale=360:-1,tile=${cols}x$(( ( $(ls "$dir"/f*.png | wc -l) + cols - 1 ) / cols )):padding=8:color=0x888888" \
  -frames:v 1 "$out"
