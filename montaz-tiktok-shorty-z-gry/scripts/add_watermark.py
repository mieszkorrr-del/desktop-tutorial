#!/usr/bin/env python3
"""Nakłada obrazek (np. plakietkę Twitch+nick) na wideo w stałej pozycji przez
cały czas trwania klipu, przez ffmpeg overlay."""
import argparse
import subprocess
import sys


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input")
    parser.add_argument("output")
    parser.add_argument("--watermark", required=True)
    parser.add_argument("--x", type=int, required=True)
    parser.add_argument("--y", type=int, required=True)
    parser.add_argument("--width", type=int, default=None, help="szerokość plakietki w pikselach (zachowuje proporcje)")
    args = parser.parse_args()

    scale = f"scale={args.width}:-1," if args.width else ""
    filter_complex = (
        f"[1:v]{scale}format=rgba[wm];"
        f"[0:v][wm]overlay={args.x}:{args.y}:format=auto[vout]"
    )
    cmd = [
        "ffmpeg", "-y", "-i", args.input, "-i", args.watermark,
        "-filter_complex", filter_complex,
        "-map", "[vout]", "-map", "0:a",
        "-c:v", "libx264", "-preset", "medium", "-crf", "23",
        "-c:a", "copy",
        "-movflags", "+faststart",
        args.output,
    ]
    print("Uruchamiam:", " ".join(cmd), file=sys.stderr)
    return subprocess.call(cmd)


if __name__ == "__main__":
    raise SystemExit(main())
