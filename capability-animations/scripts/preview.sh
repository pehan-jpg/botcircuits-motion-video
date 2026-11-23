#!/usr/bin/env bash
# Low resolution motion check. Usage: ./scripts/preview.sh Build
set -euo pipefail
COMP="$1"; NAME="$(echo "$COMP" | tr '[:upper:]' '[:lower:]')"
PREVIEW_DIR="${PREVIEW_DIR:-out/preview}"
mkdir -p "$PREVIEW_DIR"
npx remotion bundle --out-dir build >/dev/null
npx remotion render build "$COMP" "$PREVIEW_DIR/$NAME-preview-800x500.mp4" --scale=0.5 --crf=23 --log=error
