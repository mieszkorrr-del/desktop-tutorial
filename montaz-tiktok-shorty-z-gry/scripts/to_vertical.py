#!/usr/bin/env python3
"""Konwertuje poziomy klip z gry (16:9) na pionowy 9:16 pod TikToka/Shorts.

Tryb domyślny ("blur"): tło to rozmyta, powiększona kopia tego samego kadru,
a na środku ostry, wyśrodkowany oryginał — tak jak robi to większość
narzędzi z analizy (short-video-maker, openshorts) przy braku face-trackingu.

Tryb "crop": twardo przycina środek klatki do 9:16 (traci boki kadru, ale
bez czarnych/rozmytych pasów) — lepsze, gdy akcja zawsze jest na środku
ekranu (typowe dla FPS-ów z celownikiem na środku).
"""
import argparse
import subprocess
import sys

TARGET_W, TARGET_H = 1080, 1920


def build_filter(mode: str) -> str:
    if mode == "crop":
        return (
            f"scale=-2:{TARGET_H},"
            f"crop={TARGET_W}:{TARGET_H}"
        )
    # mode == "blur"
    bg = f"scale={TARGET_W}:{TARGET_H}:force_original_aspect_ratio=increase,crop={TARGET_W}:{TARGET_H},gblur=sigma=20"
    fg = f"scale={TARGET_W}:-2"
    return (
        f"[0:v]{bg}[bg];"
        f"[0:v]{fg}[fg];"
        f"[bg][fg]overlay=(W-w)/2:(H-h)/2"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", help="ścieżka do klipu wejściowego")
    parser.add_argument("output", help="ścieżka do pliku wyjściowego (mp4)")
    parser.add_argument("--mode", choices=["blur", "crop"], default="blur")
    args = parser.parse_args()

    vf = build_filter(args.mode)
    cmd = [
        "ffmpeg", "-y", "-i", args.input,
        "-filter_complex" if args.mode == "blur" else "-vf", vf,
        "-c:a", "copy",
        args.output,
    ]
    print("Uruchamiam:", " ".join(cmd), file=sys.stderr)
    return subprocess.call(cmd)


if __name__ == "__main__":
    raise SystemExit(main())
