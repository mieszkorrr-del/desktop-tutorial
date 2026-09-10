#!/usr/bin/env python3
"""Montuje klip z jednym wyróżnionym highlightem: przycina martwe fragmenty na
początku/końcu, spowalnia (slow-mo) i lekko dozooma wskazany fragment (np.
double kill, dragon fight), a całość koloruje pod "gamingowy" look.

Typowe użycie: znajdź moment akcji (np. przez podgląd klatek / analizę
głośności audio), podaj jego zakres --highlight-start/--highlight-end, a
skrypt zrobi resztę: tempo normalne -> spowolniony highlight z delikatnym
zoomem -> tempo normalne, plus color grade i skalowanie pod TikTok (9:16).
"""
import argparse
import subprocess
import sys


def probe_wh(path: str) -> tuple[int, int]:
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "csv=s=x:p=0", path,
    ]).decode().strip()
    w, h = out.split("x")
    return int(w), int(h)


def probe_duration(path: str) -> float:
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", path,
    ]).decode().strip()
    return float(out)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--start", type=float, default=0.0, help="wytnij wszystko przed tym czasem (s)")
    p.add_argument("--end", type=float, default=None, help="wytnij wszystko po tym czasie (s); domyślnie koniec klipu")
    p.add_argument("--highlight-start", type=float, required=True)
    p.add_argument("--highlight-end", type=float, required=True)
    p.add_argument("--slowmo", type=float, default=0.6, help="mnożnik prędkości highlightu (0.6 = 60% prędkości)")
    p.add_argument("--zoom", type=float, default=1.12, help="mnożnik powiększenia w trakcie highlightu")
    p.add_argument("--contrast", type=float, default=1.08)
    p.add_argument("--saturation", type=float, default=1.25)
    p.add_argument("--out-width", type=int, default=1080)
    p.add_argument("--out-height", type=int, default=1920)
    p.add_argument("--crf", type=int, default=23, help="jakość H.264 (niżej = lepsza jakość, większy plik)")
    args = p.parse_args()

    w, h = probe_wh(args.input)
    end = args.end if args.end is not None else probe_duration(args.input)
    if not (args.start < args.highlight_start < args.highlight_end < end):
        raise SystemExit("Wymagane: start < highlight-start < highlight-end < end")

    filter_complex = (
        f"[0:v]trim={args.start}:{args.highlight_start},setpts=PTS-STARTPTS,setsar=1[va];"
        f"[0:a]atrim={args.start}:{args.highlight_start},asetpts=PTS-STARTPTS[aa];"

        f"[0:v]trim={args.highlight_start}:{args.highlight_end},"
        f"setpts=(PTS-STARTPTS)/{args.slowmo},"
        f"scale={round(w*args.zoom)}:{round(h*args.zoom)},"
        f"crop={w}:{h},setsar=1[vb];"
        f"[0:a]atrim={args.highlight_start}:{args.highlight_end},asetpts=PTS-STARTPTS,"
        f"atempo={args.slowmo}[ab];"

        f"[0:v]trim={args.highlight_end}:{end},setpts=PTS-STARTPTS,setsar=1[vc];"
        f"[0:a]atrim={args.highlight_end}:{end},asetpts=PTS-STARTPTS[ac];"

        f"[va][aa][vb][ab][vc][ac]concat=n=3:v=1:a=1[vcat][acat];"
        f"[vcat]eq=contrast={args.contrast}:saturation={args.saturation},"
        f"scale={args.out_width}:{args.out_height}:flags=lanczos[vout]"
    )

    cmd = [
        "ffmpeg", "-y", "-i", args.input,
        "-filter_complex", filter_complex,
        "-map", "[vout]", "-map", "[acat]",
        "-c:v", "libx264", "-preset", "medium", "-crf", str(args.crf),
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart",
        args.output,
    ]
    print("Uruchamiam:", " ".join(cmd), file=sys.stderr)
    return subprocess.call(cmd)


if __name__ == "__main__":
    raise SystemExit(main())
