#!/usr/bin/env python3
"""Wycina z klipu ciche fragmenty (np. martwe momenty bez akcji/komentarza).

Prosta, szybka metoda bez ML: FFmpeg wykrywa ciszę (silencedetect), a
skrypt składa listę fragmentów "głośnych" i renderuje je przez filtr
select+concat. Inspirowane podejściem auto-gaming-montage-maker, ale bez
zależności od YOLO — działa na CPU dla dowolnej gry.
"""
import argparse
import re
import subprocess
import sys


def detect_silence(input_path: str, noise_db: str, min_duration: float) -> list[tuple[float, float]]:
    cmd = [
        "ffmpeg", "-i", input_path, "-af",
        f"silencedetect=noise={noise_db}dB:d={min_duration}",
        "-f", "null", "-",
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    starts = [float(m) for m in re.findall(r"silence_start:\s*([\d.]+)", proc.stderr)]
    ends = [float(m) for m in re.findall(r"silence_end:\s*([\d.]+)", proc.stderr)]
    return list(zip(starts, ends))


def build_keep_ranges(silences: list[tuple[float, float]], duration: float) -> list[tuple[float, float]]:
    keep = []
    cursor = 0.0
    for s, e in silences:
        if s > cursor:
            keep.append((cursor, s))
        cursor = max(cursor, e)
    if cursor < duration:
        keep.append((cursor, duration))
    return keep


def get_duration(input_path: str) -> float:
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration",
           "-of", "default=noprint_wrappers=1:nokey=1", input_path]
    return float(subprocess.check_output(cmd).decode().strip())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input")
    parser.add_argument("output")
    parser.add_argument("--noise-db", default="-30", help="próg ciszy w dB (domyślnie -30)")
    parser.add_argument("--min-duration", type=float, default=1.5,
                         help="minimalna długość ciszy do wycięcia w sekundach")
    args = parser.parse_args()

    duration = get_duration(args.input)
    silences = detect_silence(args.input, args.noise_db, args.min_duration)
    keep_ranges = build_keep_ranges(silences, duration)

    if not keep_ranges:
        print("Nie znaleziono nic do zachowania — sprawdź próg --noise-db.", file=sys.stderr)
        return 1

    select_expr = "+".join(f"between(t,{s:.3f},{e:.3f})" for s, e in keep_ranges)
    vf = f"select='{select_expr}',setpts=N/FRAME_RATE/TB"
    af = f"aselect='{select_expr}',asetpts=N/SR/TB"

    cmd = ["ffmpeg", "-y", "-i", args.input, "-vf", vf, "-af", af, args.output]
    print(f"Zachowuję {len(keep_ranges)} fragment(y), wycinam {len(silences)} cisz.", file=sys.stderr)
    print("Uruchamiam:", " ".join(cmd), file=sys.stderr)
    return subprocess.call(cmd)


if __name__ == "__main__":
    raise SystemExit(main())
