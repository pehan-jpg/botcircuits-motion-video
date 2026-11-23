#!/usr/bin/env bash
# Renders the review stills for a composition from one bundle.
# Usage: ./scripts/stills.sh Build 0 24 90 ...
set -euo pipefail
COMP="$1"; shift
OUTDIR="out/stills/$(echo "$COMP" | tr '[:upper:]' '[:lower:]')"
mkdir -p "$OUTDIR"
npx remotion bundle --out-dir build >/dev/null
for F in "$@"; do
  npx remotion still build "$COMP" "$OUTDIR/frame-$(printf '%03d' "$F").png" --frame="$F" --log=error
done
