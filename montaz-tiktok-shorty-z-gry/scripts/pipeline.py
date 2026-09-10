#!/usr/bin/env python3
"""Pełny pipeline: klip z gry -> gotowy short pod TikToka.

Kroki (każdy opcjonalny, sterowany flagami):
  1. trim_silence.py  - wycina ciche/martwe fragmenty
  2. to_vertical.py   - przerabia kadr 16:9 na pionowy 9:16
  3. auto_captions.py - dogrywa automatyczne napisy (Whisper)

Pliki pośrednie trafiają do tego samego folderu co output, z sufiksami
_trim / _vert, żeby można było podejrzeć każdy etap.
"""
import argparse
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent


def run(script: str, *args: str) -> None:
    cmd = [sys.executable, str(SCRIPT_DIR / script), *args]
    print(f"\n=== {script} ===", file=sys.stderr)
    result = subprocess.call(cmd)
    if result != 0:
        raise SystemExit(f"Krok {script} zakończył się błędem ({result})")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input")
    parser.add_argument("output")
    parser.add_argument("--skip-trim", action="store_true")
    parser.add_argument("--skip-vertical", action="store_true")
    parser.add_argument("--skip-captions", action="store_true")
    parser.add_argument("--vertical-mode", choices=["blur", "crop"], default="blur")
    parser.add_argument("--whisper-model", default="small")
    parser.add_argument("--language", default="pl")
    args = parser.parse_args()

    out = Path(args.output)
    current = args.input

    if not args.skip_trim:
        trimmed = str(out.with_name(out.stem + "_trim.mp4"))
        run("trim_silence.py", current, trimmed)
        current = trimmed

    if not args.skip_vertical:
        vertical = str(out.with_name(out.stem + "_vert.mp4"))
        run("to_vertical.py", current, vertical, "--mode", args.vertical_mode)
        current = vertical

    if not args.skip_captions:
        run("auto_captions.py", current, str(out), "--model", args.whisper_model, "--language", args.language)
    else:
        Path(current).rename(out)

    print(f"\nGotowe: {out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
