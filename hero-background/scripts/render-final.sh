#!/usr/bin/env bash
# Renders HeroOverlay to one file, scans it for single-frame glitches, and retries (up to 3 attempts)
# on a glitch or a hang. Usage: scripts/render-final.sh <output> <codec> <crf> [extra remotion flags...]
set -u
out=$1 codec=$2 crf=$3; shift 3
chrome=${REMOTION_BROWSER:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}
tmp="${out%.*}.tmp.${out##*.}"
for attempt in 1 2 3; do
  rm -f "$tmp"
  timeout 1200 npx remotion render HeroOverlay "$tmp" --codec="$codec" --crf="$crf" --muted \
    --browser-executable="$chrome" --chrome-mode=chrome-for-testing --gl=swangle --log=error "$@" \
    2>&1 | grep -iv -E "memory|cgroup|docker|lower amount"
  if [ ! -s "$tmp" ]; then echo "attempt $attempt: no output (hang or failure), retrying"; continue; fi
  # Scan the whole frame and the overlay column (a column-only glitch is diluted in a full-frame scan).
  full=$(python3 scripts/find-glitches.py "$tmp" 0 1)
  column=$(python3 scripts/find-glitches.py "$tmp" 0.72 0.97)
  echo "attempt $attempt: full frame: $full | column: $column"
  if echo "$full" | grep -q "suspect frames: \[\]" && echo "$column" | grep -q "suspect frames: \[\]"; then
    mv "$tmp" "$out"; echo "OK $out"; exit 0
  fi
done
echo "FAILED $out"; exit 1
