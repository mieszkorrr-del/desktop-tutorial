#!/usr/bin/env python3
"""Generuje automatyczne napisy (Whisper) i wypala je na klipie przez FFmpeg.

Krok 1: Whisper transkrybuje ścieżkę audio klipu do pliku .srt.
Krok 2: FFmpeg wypala napisy na wideo (filtr subtitles), stylizowane pod
        format gamingowy/TikTok (duża, wytłuszczona czcionka na dole ekranu).
"""
import argparse
import subprocess
import sys
from pathlib import Path


def transcribe(input_path: str, srt_path: str, model_size: str, language: str | None) -> None:
    import whisper  # import lokalny, żeby --help działało bez zainstalowanego modelu

    print(f"Ładuję model Whisper '{model_size}' (pierwsze uruchomienie pobiera wagi)...", file=sys.stderr)
    model = whisper.load_model(model_size)
    result = model.transcribe(input_path, language=language, verbose=False)

    def fmt_ts(t: float) -> str:
        h, rem = divmod(t, 3600)
        m, s = divmod(rem, 60)
        ms = int((s - int(s)) * 1000)
        return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{ms:03d}"

    with open(srt_path, "w", encoding="utf-8") as f:
        for i, seg in enumerate(result["segments"], start=1):
            f.write(f"{i}\n{fmt_ts(seg['start'])} --> {fmt_ts(seg['end'])}\n{seg['text'].strip()}\n\n")
    print(f"Zapisano napisy: {srt_path}", file=sys.stderr)


def burn_in(input_path: str, srt_path: str, output_path: str) -> int:
    style = (
        "FontName=Arial,FontSize=14,PrimaryColour=&H00FFFFFF,"
        "OutlineColour=&H00000000,BorderStyle=1,Outline=3,"
        "Alignment=2,MarginV=80,Bold=1"
    )
    vf = f"subtitles={srt_path}:force_style='{style}'"
    cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", vf, "-c:a", "copy", output_path]
    print("Uruchamiam:", " ".join(cmd), file=sys.stderr)
    return subprocess.call(cmd)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", help="klip wejściowy (mp4/mov/...)")
    parser.add_argument("output", help="klip wyjściowy z wypalonymi napisami")
    parser.add_argument("--model", default="small", choices=["tiny", "base", "small", "medium", "large"],
                         help="rozmiar modelu Whisper (większy = dokładniejszy, ale wolniejszy na CPU)")
    parser.add_argument("--language", default="pl", help="kod języka (np. pl, en); pomiń dla auto-detekcji")
    args = parser.parse_args()

    srt_path = str(Path(args.output).with_suffix(".srt"))
    transcribe(args.input, srt_path, args.model, args.language)
    return burn_in(args.input, srt_path, args.output)


if __name__ == "__main__":
    raise SystemExit(main())
