#!/usr/bin/env python3
"""Bot montażowy Sławy, wersja 1.

Bierze pionowy klip ze streamu (kamerka u góry, gra na dole) i robi z niego klip
według przepisu montażowego:
- przekadrowanie na 1080x1920 z większą kamerką,
- tekst-hook na pierwsze ~1,8 s (słowa w *gwiazdkach* w kolorze akcentu),
- zoom na grę w głośnych momentach i powiększenie twarzy w najgłośniejszym,
- opcjonalnie efekt dźwiękowy na kulminacjach i napisy z mowy (faster-whisper),
- wyrównanie głośności.

Przykład:
  python montuj.py klip.mp4 --hook "Ale mi *PRZYKRO*" --dlugosc 22
"""

from __future__ import annotations

import argparse
import logging
import re
import shutil
import statistics
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

try:
    import yaml
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Brak bibliotek. Zainstaluj: pip install -r requirements.txt")

BASE_DIR = Path(__file__).resolve().parent
log = logging.getLogger("montaz")


def setup_logging() -> None:
    fmt = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
    fh = logging.FileHandler(BASE_DIR / "montaz.log", encoding="utf-8")
    fh.setFormatter(fmt)
    sh = logging.StreamHandler()
    sh.setFormatter(logging.Formatter("%(message)s"))
    log.addHandler(fh)
    log.addHandler(sh)
    log.setLevel(logging.INFO)


def run(cmd: list[str], cwd: Path | None = None) -> str:
    log.debug("polecenie: %s", " ".join(cmd))
    proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if proc.returncode != 0:
        log.error("ffmpeg zakończył się błędem:\n%s", proc.stderr[-3000:])
        raise RuntimeError("Polecenie ffmpeg nie powiodło się (szczegóły wyżej i w montaz.log).")
    return proc.stderr


# ---------- informacje o klipie ----------

@dataclass
class Info:
    w: int
    h: int
    fps: float
    dur: float
    audio: bool


def probe(path: Path) -> Info:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries",
         "stream=codec_type,width,height,r_frame_rate:format=duration", "-of", "default=nw=1", str(path)],
        capture_output=True, text=True,
    )
    if out.returncode != 0:
        raise RuntimeError(f"Nie mogę odczytać pliku: {out.stderr.strip()}")
    txt = out.stdout
    w = int(re.search(r"width=(\d+)", txt)[1])
    h = int(re.search(r"height=(\d+)", txt)[1])
    num, den = re.search(r"r_frame_rate=(\d+)/(\d+)", txt).groups()
    dur = float(re.search(r"duration=([\d.]+)", txt)[1])
    return Info(w, h, int(num) / int(den), dur, "codec_type=audio" in txt)


# ---------- kulminacje (skoki głośności) ----------

def loudness_curve(path: Path, start: float, end: float) -> list[tuple[float, float]]:
    err = run(["ffmpeg", "-hide_banner", "-nostats", "-ss", f"{start}", "-to", f"{end}",
               "-i", str(path), "-vn", "-af", "ebur128", "-f", "null", "-"])
    pts = []
    for m in re.finditer(r"t:\s*([\d.]+)\s.*?M:\s*(-?[\d.]+)", err):
        t, lufs = float(m[1]), float(m[2])
        pts.append((max(0.0, t - 0.2), lufs))  # okno 400 ms kończy się w t, więc środek to t-0,2
    return pts


def find_peaks(curve: list[tuple[float, float]], cfg: dict) -> list[tuple[float, float]]:
    valid = [l for _, l in curve if l > -70]
    if len(valid) < 10:
        return []
    base = statistics.median(valid)
    thr = base + cfg["prog_LU_ponad_mediane"]
    cands = []
    for i, (t, l) in enumerate(curve):
        if l < thr:
            continue
        window = [x for tt, x in curve[max(0, i - 5): i + 6]]
        if l >= max(window):
            cands.append((t, l))
    chosen: list[tuple[float, float]] = []
    for t, l in sorted(cands, key=lambda c: -c[1]):
        if all(abs(t - ct) >= cfg["min_odstep_s"] for ct, _ in chosen):
            chosen.append((t, l))
        if len(chosen) >= cfg["max_liczba"]:
            break
    log.info("Typowa głośność %.1f LUFS, próg %.1f, kulminacje: %s", base, thr,
             ", ".join(f"{t:.1f}s ({l:.0f})" for t, l in sorted(chosen)) or "brak")
    return sorted(chosen)


def envelope(peaks: list[float], c: dict) -> str:
    """Wyrażenie ffmpeg: 0..1, narasta przed kulminacją, trzyma i opada."""
    r, h, f = c["narastanie_s"], c["trzymanie_s"], c["opadanie_s"]
    parts = [f"clip((it-{p - r:.3f})/{r},0,1)*clip(({p + h + f:.3f}-it)/{f},0,1)" for p in peaks]
    return "+".join(parts) if parts else "0"


# ---------- hook ----------

def pick_font(paths: list[str]) -> str:
    for p in paths:
        if Path(p).exists():
            return p
    raise RuntimeError("Nie znalazłem żadnej czcionki z listy 'hook.czcionki' w pliku układu.")


def render_hook(text: str, cfg: dict, width: int, out: Path) -> tuple[int, int]:
    font_path = pick_font(cfg["czcionki"])
    size = int(width * cfg["rozmiar_proc_szerokosci"])
    font = ImageFont.truetype(font_path, size)
    stroke = cfg["obrys_px"]
    words = [(w.strip("*"), w.startswith("*") and w.endswith("*")) for w in text.split()]
    space = font.getlength(" ")
    max_w = width * 0.92
    lines, cur, cur_w = [], [], 0.0
    for word, accent in words:
        ww = font.getlength(word)
        if cur and cur_w + space + ww > max_w:
            lines.append((cur, cur_w))
            cur, cur_w = [], 0.0
        cur_w = cur_w + (space if cur else 0) + ww
        cur.append((word, accent, ww))
    if cur:
        lines.append((cur, cur_w))
    asc, desc = font.getmetrics()
    line_h = asc + desc + stroke
    img_h = line_h * len(lines) + 2 * stroke
    img = Image.new("RGBA", (width, img_h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    y = stroke
    for line, lw in lines:
        x = (width - lw) / 2
        for word, accent, ww in line:
            d.text((x, y), word, font=font, fill=cfg["kolor_akcentu"] if accent else cfg["kolor"],
                   stroke_width=stroke, stroke_fill="#000000")
            x += ww + space
        y += line_h
    img.save(out)
    log.info("Hook: „%s” (czcionka %s, %d linii)", text, Path(font_path).name, len(lines))
    return width, img_h


# ---------- napisy (opcjonalne) ----------

def ass_time(t: float) -> str:
    h, rem = divmod(max(0.0, t), 3600)
    m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def make_subtitles(path: Path, start: float, end: float, font_name: str, ow: int, oh: int,
                   top_h: int, workdir: Path, model_size: str) -> Path | None:
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        log.warning("Pomijam napisy: brak faster-whisper (pip install faster-whisper).")
        return None
    wav = workdir / "mowa.wav"
    run(["ffmpeg", "-y", "-ss", f"{start}", "-to", f"{end}", "-i", str(path), "-vn", "-ac", "1",
         "-ar", "16000", str(wav)])
    log.info("Transkrypcja (model %s, pierwsze uruchomienie pobiera model)...", model_size)
    model = WhisperModel(model_size, device="auto", compute_type="int8")
    segments, _ = model.transcribe(str(wav), language="pl", word_timestamps=True, vad_filter=True)
    words = [w for seg in segments for w in (seg.words or [])]
    if not words:
        log.info("Brak mowy do napisów.")
        return None
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= 3 or (cur[-1].end - cur[0].start) > 0.9:
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    margin = top_h + int((oh - top_h) * 0.18)
    lines = [
        "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {ow}", f"PlayResY: {oh}", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, "
        "BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV",
        f"Style: Napis,{font_name},{int(ow * 0.075)},&H00FFFFFF,&H00000000,&H00000000,1,1,6,0,8,40,40,{margin}",
        "", "[Events]", "Format: Layer, Start, End, Style, Text",
    ]
    for ch in chunks:
        text = " ".join(w.word.strip() for w in ch).upper()
        lines.append(f"Dialogue: 0,{ass_time(ch[0].start)},{ass_time(ch[-1].end + 0.05)},Napis,{text}")
    ass = workdir / "napisy.ass"
    ass.write_text("\n".join(lines), encoding="utf-8")
    log.info("Napisy: %d fragmentów.", len(chunks))
    return ass


# ---------- montaż ----------

def even(x: float) -> int:
    return int(round(x / 2)) * 2


def build(args: argparse.Namespace) -> Path:
    cfg = yaml.safe_load(Path(args.uklad).read_text(encoding="utf-8"))
    src = Path(args.wejscie)
    info = probe(src)
    log.info("Źródło: %dx%d, %.0f fps, %.1f s", info.w, info.h, info.fps, info.dur)

    # zakres czasu
    kul = cfg["kulminacje"]
    start, end = args.start or 0.0, args.koniec or info.dur
    if args.dlugosc and args.start is None and args.koniec is None and info.audio:
        full = find_peaks(loudness_curve(src, 0, info.dur), kul)
        if full:
            top = max(full, key=lambda p: p[1])[0]
            end = min(info.dur, top + 1.5)
            start = max(0.0, end - args.dlugosc)
            end = min(info.dur, start + args.dlugosc)
            log.info("Automatyczne cięcie wokół najgłośniejszego momentu: %.1f–%.1f s", start, end)
        else:
            end = min(info.dur, args.dlugosc)
    dur = end - start

    peaks = find_peaks(loudness_curve(src, start, end), kul) if info.audio else []
    face_peak = max(peaks, key=lambda p: p[1])[0] if peaks else None
    game_peaks = [t for t, _ in peaks if t != face_peak]

    # geometria
    z, wy = cfg["zrodlo"], cfg["wyjscie"]
    W, H = info.w, info.h
    seam = even(H * z["granica_kamera_gra"])
    OW, OH = wy["szerokosc"], wy["wysokosc"]
    TOPH = even(OH * wy["kamerka_proc"])
    BOTH = OH - TOPH

    cw = seam * OW / TOPH  # kamerka: kadr o proporcjach docelowych
    if cw <= W:
        cw, ch = even(cw), seam
        cx = min(max(0, z["twarz_x"] * W - cw / 2), W - cw)
        cy = 0
    else:
        cw, ch = W, even(W * TOPH / OW)
        cx = 0
        cy = min(max(0, z["twarz_y"] * H - ch / 2), seam - ch)
    fxo = (z["twarz_x"] * W - cx) / cw * OW
    fyo = (z["twarz_y"] * H - cy) / ch * TOPH

    gh = H - seam  # gra
    nh = W * BOTH / OW
    if nh <= gh:
        gw, gch = W, even(nh)
        gx = 0
        gy = seam + (gh - gch if wy["gra_przyciecie"] == "gora" else (gh - gch) / 2)
    else:
        gw, gch = even(gh * OW / BOTH), even(gh)
        gx, gy = (W - gw) / 2, seam

    fps = f"{info.fps:g}"
    zf = f"1+{kul['zoom_twarzy'] - 1:.3f}*({envelope([face_peak] if face_peak else [], kul)})"
    zg = f"1+{kul['zoom_gry'] - 1:.3f}*({envelope(game_peaks, kul)})"

    work = Path(tempfile.mkdtemp(prefix="montaz_"))
    inputs = ["-ss", f"{start}", "-to", f"{end}", "-i", str(src.resolve())]
    fc = [
        f"[0:v]split=2[k][g]",
        f"[k]crop={cw}:{ch}:{int(cx)}:{int(cy)},scale={OW}:{TOPH},"
        f"zoompan=z='{zf}':d=1:s={OW}x{TOPH}:fps={fps}:"
        f"x='max(0,min(iw-iw/zoom,{fxo:.1f}-iw/zoom/2))':y='max(0,min(ih-ih/zoom,{fyo:.1f}-ih/zoom/2))'[top]",
        f"[g]crop={gw}:{gch}:{int(gx)}:{int(gy)},scale={OW}:{BOTH},"
        f"zoompan=z='{zg}':d=1:s={OW}x{BOTH}:fps={fps}:x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2'[bot]",
        "[top][bot]vstack=inputs=2,setsar=1[v0]",
    ]
    last = "v0"
    idx = 1

    if args.hook:
        hook_png = work / "hook.png"
        _, hh = render_hook(args.hook, cfg["hook"], OW, hook_png)
        t = cfg["hook"]["czas_s"]
        inputs += ["-loop", "1", "-t", f"{t}", "-i", str(hook_png)]
        fc.append(f"[{idx}:v]format=rgba,fade=out:st={t - 0.15:.2f}:d=0.15:alpha=1[hk]")
        fc.append(f"[{last}][hk]overlay=x=0:y={max(0, TOPH - hh // 2)}:eof_action=pass[v1]")
        last, idx = "v1", idx + 1

    if args.napisy:
        font_path = pick_font(cfg["hook"]["czcionki"])
        shutil.copy(font_path, work / Path(font_path).name)
        font_name = ImageFont.truetype(font_path, 20).getname()[0]
        ass = make_subtitles(src, start, end, font_name, OW, OH, TOPH, work, args.model)
        if ass:
            fc.append(f"[{last}]subtitles=napisy.ass:fontsdir=.[v2]")
            last = "v2"

    fc.append(f"[{last}]format=yuv420p[vout]")

    audio_map = []
    if info.audio:
        a_last = "0:a"
        if args.efekt and peaks:
            inputs += ["-i", str(Path(args.efekt).resolve())]
            n = len(peaks)
            fc.append(f"[{idx}:a]asplit={n}" + "".join(f"[e{i}]" for i in range(n)))
            for i, (t, _) in enumerate(peaks):
                ms = int(max(0, t - 0.05) * 1000)
                fc.append(f"[e{i}]adelay={ms}|{ms},volume={cfg['dzwiek']['efekt_glosnosc']}[d{i}]")
            fc.append(f"[0:a]" + "".join(f"[d{i}]" for i in range(n)) +
                      f"amix=inputs={n + 1}:normalize=0:duration=first[amx]")
            a_last, idx = "amx", idx + 1
        fc.append(f"[{a_last}]loudnorm=I={cfg['dzwiek']['glosnosc_LUFS']}:TP=-1:LRA=11,"
                  f"aresample=48000[aout]")
        audio_map = ["-map", "[aout]", "-c:a", "aac", "-b:a", "192k"]

    script = work / "filtry.txt"
    script.write_text(";\n".join(fc), encoding="utf-8")
    out = Path(args.wyjscie) if args.wyjscie else src.with_name(src.stem + "_slawa.mp4")
    cmd = ["ffmpeg", "-hide_banner", "-y", *inputs, "-filter_complex_script", str(script),
           "-map", "[vout]", *audio_map, "-t", f"{dur:.3f}",
           "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-r", fps,
           "-movflags", "+faststart", str(out.resolve())]
    log.info("Renderuję %.1f s klipu...", dur)
    run(cmd, cwd=work)
    shutil.rmtree(work, ignore_errors=True)
    log.info("Gotowe: %s", out)
    return out


def main() -> None:
    setup_logging()
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        sys.exit("Brak ffmpeg. Zainstaluj go (Windows: winget install ffmpeg) i uruchom ponownie terminal.")
    p = argparse.ArgumentParser(description="Bot montażowy Sławy: klip ze streamu → klip na TikToka.")
    p.add_argument("wejscie", help="pionowy klip: kamerka u góry, gra na dole")
    p.add_argument("--hook", help='tekst na start, np. "Ale mi *PRZYKRO*" (gwiazdki = kolor akcentu)')
    p.add_argument("--dlugosc", type=float, help="docelowa długość w s; tnie wokół najgłośniejszego momentu")
    p.add_argument("--start", type=float, help="ręczny początek (s)")
    p.add_argument("--koniec", type=float, help="ręczny koniec (s)")
    p.add_argument("--efekt", help="plik dźwiękowy (np. boom.wav) dodawany na kulminacjach")
    p.add_argument("--napisy", action="store_true", help="napisy z mowy (wymaga faster-whisper)")
    p.add_argument("--model", default="small", help="model Whisper do napisów (tiny/base/small/medium)")
    p.add_argument("--uklad", default=str(BASE_DIR / "uklad_pysiex.yaml"), help="plik z układem kadru")
    p.add_argument("--wyjscie", help="plik wynikowy (domyślnie <nazwa>_slawa.mp4 obok źródła)")
    args = p.parse_args()
    if not Path(args.wejscie).is_file():
        sys.exit(f"Nie ma pliku: {args.wejscie}")
    try:
        build(args)
    except (RuntimeError, KeyError, ValueError, OSError) as e:
        log.exception("Montaż przerwany")
        sys.exit(f"Błąd: {e}")


if __name__ == "__main__":
    main()
