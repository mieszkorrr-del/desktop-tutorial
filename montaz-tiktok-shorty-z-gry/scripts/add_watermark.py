#!/usr/bin/env python3
"""Nakłada obrazek (np. plakietkę Twitch+nick albo podpis) na wideo w stałej
pozycji, przez ffmpeg overlay. Domyślnie przez cały czas trwania klipu, albo
tylko od --start (opcjonalnie do --end) sekundy, np. żeby podpis pojawił się
dokładnie w momencie okrzyku/akcji."""
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
    parser.add_argument("--start", type=float, default=None, help="pokaż dopiero od tej sekundy (domyślnie: od początku)")
    parser.add_argument("--end", type=float, default=None, help="ukryj po tej sekundzie (domyślnie: do końca klipu)")
    args = parser.parse_args()

    scale = f"scale={args.width}:-1," if args.width else ""
    if args.start is not None or args.end is not None:
        lo = args.start if args.start is not None else 0
        cond = f"gte(t,{lo})" if args.end is None else f"between(t,{lo},{args.end})"
        enable = f":enable='{cond}'"
    else:
        enable = ""
    filter_complex = (
        f"[1:v]{scale}format=rgba[wm];"
        f"[0:v][wm]overlay={args.x}:{args.y}:format=auto{enable}[vout]"
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
