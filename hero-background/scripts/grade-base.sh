#!/usr/bin/env bash
# Builds public/hero_base_graded.mp4 from the untouched public/hero_base.mp4.
# Scene ranges use the exact cut frames from ffmpeg scene detection (153, 303, 463):
#   airport 0–152: light luma-only sharpening only (sky stays blue)
#   keyboard 153–302 and headset 463–613: midtone lift with deep blacks (no warmth)
#   sofa 303–462: warm colour mix
set -euo pipefail
cd "$(dirname "$0")/.."
ffmpeg -y -i public/hero_base.mp4 -vf "unsharp=lx=5:ly=5:la=0.25:cx=5:cy=5:ca=0,\
curves=all='0/0 0.18/0.17 0.40/0.52 0.70/0.81 1/1':enable='between(n,153,302)',\
colorchannelmixer=rr=1.08:bb=0.84:enable='between(n,303,462)',\
curves=all='0/0 0.18/0.18 0.40/0.50 0.70/0.79 1/1':enable='between(n,463,613)'" \
  -c:v libx264 -crf 12 -preset slow -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -an \
  public/hero_base_graded.mp4
python3 scripts/measure-grade.py public/hero_base.mp4 public/hero_base_graded.mp4
