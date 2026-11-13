#!/usr/bin/env bash
# Final v5 renders: every frame rendered as an independent PNG still (scripts/render-frames.mjs),
# then encoded with ffmpeg: H.264 CRF 14 preset slow, yuv420p, bt709 (matrix, primaries,
# transfer), no audio. 60 fps MP4 + WebM, and a 30 fps MP4 for comparison.
set -euo pipefail
cd "$(dirname "$0")/.."
COLOR=(-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv)
VF="scale=out_color_matrix=bt709:out_range=tv,format=yuv420p"

node scripts/render-frames.mjs out/frames60 60 0 1227 4
node scripts/render-frames.mjs out/frames30 30 0 613 4
test "$(ls out/frames60 | wc -l)" -eq 1228
test "$(ls out/frames30 | wc -l)" -eq 614

ffmpeg -v error -y -framerate 60 -i out/frames60/f%05d.png -vf "$VF" -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p "${COLOR[@]}" -movflags +faststart -an out/hero-overlay-v5.mp4
ffmpeg -v error -y -framerate 30 -i out/frames30/f%05d.png -vf "$VF" -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p "${COLOR[@]}" -movflags +faststart -an out/hero-overlay-v5-30fps.mp4
ffmpeg -v error -y -framerate 60 -i out/frames60/f%05d.png -vf "$VF" -c:v libvpx-vp9 -crf 30 -b:v 0 -row-mt 1 -pix_fmt yuv420p "${COLOR[@]}" -an out/hero-overlay-v5.webm
echo RENDER-V5-DONE
