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
import csv
import os
from contextlib import contextmanager
import json
import logging
import math
import re
import shutil
import statistics
import subprocess
import sys
import tempfile
import time
import wave
from dataclasses import dataclass
from pathlib import Path

try:
    import yaml
    from PIL import Image, ImageDraw, ImageFilter, ImageFont
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


def peak_candidates(curve: list[tuple[float, float]], cfg: dict):
    """Zwraca (typowa głośność, próg, lokalne maksima powyżej progu) albo None przy braku dźwięku."""
    valid = [l for _, l in curve if l > -70]
    if len(valid) < 10:
        return None
    base = statistics.median(valid)
    thr = base + cfg["prog_LU_ponad_mediane"]
    cands = []
    for i, (t, l) in enumerate(curve):
        if l < thr:
            continue
        window = [x for tt, x in curve[max(0, i - 5): i + 6]]
        if l >= max(window):
            cands.append((t, l))
    return base, thr, cands


def choose_window(curve: list[tuple[float, float]], dur: float, length: float, cfg: dict) -> tuple[float, float]:
    """Wybiera fragment o zadanej długości z największą sumą „nadwyżki” głośności.

    Fragment kończy się 1,5 s po którejś kulminacji, żeby nie ucinać reakcji. Przy remisie wygrywa późniejszy.
    """
    if dur <= length:
        return 0.0, dur
    pc = peak_candidates(curve, cfg)
    if not pc or not pc[2]:
        return 0.0, length
    _, thr, cands = pc
    best = (-1.0, 0.0, length)
    for p, _ in cands:
        end = min(dur, p + 1.5)
        start = max(0.0, end - length)
        end = min(dur, start + length)
        score = sum(l - thr for t, l in curve if start <= t <= end and l > thr)
        if score >= best[0]:
            best = (score, start, end)
    return best[1], best[2]


def find_peaks(curve: list[tuple[float, float]], cfg: dict) -> list[tuple[float, float]]:
    pc = peak_candidates(curve, cfg)
    if not pc:
        return []
    base, thr, cands = pc
    span = curve[-1][0] - curve[0][0]
    limit = max(1, math.ceil(span / 30 * cfg.get("max_na_30s", cfg.get("max_liczba", 4))))
    chosen: list[tuple[float, float]] = []
    for t, l in sorted(cands, key=lambda c: -c[1]):
        if all(abs(t - ct) >= cfg["min_odstep_s"] for ct, _ in chosen):
            chosen.append((t, l))
        if len(chosen) >= limit:
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


def hook_duration(cfg: dict, face_peak: float | None, dur: float) -> float:
    """Jak długo trzymać hook: liczba sekund, 'do_kulminacji' (etykieta do reakcji) albo 'caly'."""
    mode = cfg.get("czas_s", 1.8)
    if mode == "caly":
        return dur
    if mode == "do_kulminacji":
        lo, hi = cfg.get("min_s", 1.8), cfg.get("max_s", 8.0)
        return min(max(face_peak if face_peak is not None else lo, lo), hi, dur)
    return min(float(mode), dur)


def parse_accents(text: str) -> list[list[tuple[str, bool]]]:
    """Dzieli tekst na słowa; każda '*' włącza albo wyłącza kolor akcentu (także na kilka słów)."""
    words: list[list[tuple[str, bool]]] = []
    cur: list[tuple[str, bool]] = []
    buf, accent = "", False
    for ch in text:
        if ch == "*" or ch.isspace():
            if buf:
                cur.append((buf, accent))
                buf = ""
            if ch == "*":
                accent = not accent
            elif cur:
                words.append(cur)
                cur = []
        else:
            buf += ch
    if buf:
        cur.append((buf, accent))
    if cur:
        words.append(cur)
    return words


def render_hook(text: str, cfg: dict, width: int, out: Path) -> tuple[int, int]:
    font_path = pick_font(cfg["czcionki"])
    size = int(width * cfg["rozmiar_proc_szerokosci"])
    font = ImageFont.truetype(font_path, size)
    stroke = cfg["obrys_px"]
    words = parse_accents(text)
    space = font.getlength(" ")
    max_w = width * 0.92
    lines, cur, cur_w = [], [], 0.0
    for segs in words:
        ww = sum(font.getlength(t) for t, _ in segs)
        if cur and cur_w + space + ww > max_w:
            lines.append((cur, cur_w))
            cur, cur_w = [], 0.0
        cur_w = cur_w + (space if cur else 0) + ww
        cur.append((segs, ww))
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
        for segs, ww in line:
            for t, accent in segs:
                d.text((x, y), t, font=font, fill=cfg["kolor_akcentu"] if accent else cfg["kolor"],
                       stroke_width=stroke, stroke_fill="#000000")
                x += font.getlength(t)
            x += space
        y += line_h
    img.save(out)
    log.info("Hook: „%s” (czcionka %s, %d linii)", text, Path(font_path).name, len(lines))
    return width, img_h


# ---------- napisy (opcjonalne) ----------

def ass_time(t: float) -> str:
    h, rem = divmod(max(0.0, t), 3600)
    m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


WULGARYZMY = re.compile(r"(kurw|chuj|huj|jeb|pierdol|pierdal|pizd|skurw|kutas|dziwk|cwel)", re.IGNORECASE)


def cenzuruj(slowo: str) -> str:
    """Zostawia pierwszą i ostatnią literę wulgaryzmu, resztę zamienia na gwiazdki."""
    m = re.match(r"^(\W*)(\w+)(\W*)$", slowo)
    if not m or not WULGARYZMY.search(m[2]) or len(m[2]) < 3:
        return slowo
    rdzen = m[2]
    return m[1] + rdzen[0] + "*" * (len(rdzen) - 2) + rdzen[-1] + m[3]


_MODELE: dict = {}


def transcribe_file(path: Path, model_size: str, cache_dir: Path) -> list[dict] | None:
    """Transkrypcja całego pliku (słowa ze znacznikami czasu). Wynik zapisywany w cache_dir."""
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache = cache_dir / f"{path.stem}.json"
    if cache.exists():
        return json.loads(cache.read_text(encoding="utf-8"))
    try:
        from faster_whisper import WhisperModel
        import numpy as np
    except ImportError:
        log.warning("Pomijam transkrypcję: brak faster-whisper (pip install faster-whisper).")
        return None
    with tempfile.TemporaryDirectory(prefix="mowa_") as tmp:
        wav = Path(tmp) / "mowa.wav"
        run(["ffmpeg", "-y", "-i", str(path), "-vn", "-ac", "1", "-ar", "16000", str(wav)])
        # Whisper dostaje gotowe próbki: faster-whisper 1.2.1 nie współpracuje z PyAV 19.
        with wave.open(str(wav), "rb") as wf:
            audio = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    if model_size not in _MODELE:
        log.info("Ładuję model Whisper %s (pierwsze uruchomienie go pobiera)...", model_size)
        _MODELE[model_size] = WhisperModel(model_size, device="auto", compute_type="int8")
    log.info("Transkrypcja: %s", path.name)
    segments, _ = _MODELE[model_size].transcribe(audio, language="pl", word_timestamps=True, vad_filter=True)
    words, lines = [], []
    for seg in segments:
        lines.append(f"[{seg.start:6.1f}–{seg.end:6.1f}] {seg.text.strip()}")
        words += [{"start": w.start, "end": w.end, "word": w.word.strip()} for w in (seg.words or [])]
    cache.write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
    (cache_dir / f"{path.stem}.txt").write_text("\n".join(lines), encoding="utf-8")
    return words


def make_subtitles(words_all: list[dict], start: float, end: float, font_name: str, ow: int, oh: int,
                   top_h: int, workdir: Path, cenzura: bool = True, kolor_aktywny: str | None = "#FFE600",
                   margin_v: int | None = None) -> Path | None:
    words = [dict(w, start=w["start"] - start, end=w["end"] - start)
             for w in words_all if w["start"] >= start - 0.05 and w["end"] <= end + 0.05]
    if not words:
        log.info("Brak mowy do napisów w wybranym fragmencie.")
        return None
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= 3 or (cur[-1]["end"] - cur[0]["start"]) > 0.9:
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    margin = margin_v if margin_v is not None else top_h + int((oh - top_h) * 0.18)
    lines = [
        "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {ow}", f"PlayResY: {oh}", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, "
        "BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV",
        f"Style: Napis,{font_name},{int(ow * 0.075)},&H00FFFFFF,&H00000000,&H00000000,1,1,6,0,8,40,40,{margin}",
        "", "[Events]", "Format: Layer, Start, End, Style, Text",
    ]
    def ass_color(hex_rgb: str) -> str:  # ASS zapisuje kolory jako BGR
        h = hex_rgb.lstrip("#")
        return f"&H{h[4:6]}{h[2:4]}{h[0:2]}&".upper()

    for ch in chunks:
        slowa = [w["word"] for w in ch]
        if cenzura:
            slowa = [cenzuruj(x) for x in slowa]
        slowa = [x.upper() for x in slowa]
        if not kolor_aktywny:
            lines.append(f"Dialogue: 0,{ass_time(ch[0]['start'])},{ass_time(ch[-1]['end'] + 0.05)},Napis,{' '.join(slowa)}")
            continue
        # osobne zdarzenie na każde słowo: aktywne słowo w kolorze, reszta frazy biała
        for i, w in enumerate(ch):
            t0 = w["start"]
            t1 = ch[i + 1]["start"] if i + 1 < len(ch) else ch[-1]["end"] + 0.05
            txt = " ".join(f"{{\\c{ass_color(kolor_aktywny)}}}{x}{{\\c&HFFFFFF&}}" if j == i else x
                           for j, x in enumerate(slowa))
            lines.append(f"Dialogue: 0,{ass_time(t0)},{ass_time(max(t1, t0 + 0.05))},Napis,{txt}")
    ass = workdir / "napisy.ass"
    ass.write_text("\n".join(lines), encoding="utf-8")
    log.info("Napisy: %d fragmentów.", len(chunks))
    return ass


# ---------- montaż ----------

def even(x: float) -> int:
    return int(round(x / 2)) * 2


def _fit(rect: tuple[float, float, float, float], aspect: float, ax: float, ay: float) -> tuple[int, int, int, int]:
    """Największy kadr o proporcjach `aspect` (szer/wys) wewnątrz `rect`, jak najbliżej punktu (ax, ay)."""
    rx, ry, rw, rh = rect
    if rw / rh > aspect:
        w, h = even(rh * aspect), even(rh)
        x = min(max(rx, ax - w / 2), rx + rw - w)
        y = ry
    else:
        w, h = even(rw), even(rw / aspect)
        x = rx
        y = min(max(ry, ay - h / 2), ry + rh - h)
    return int(x), int(y), w, h


def layout(cfg: dict, W: int, H: int) -> dict:
    """Wylicza kadry kamerki i gry ze źródła (pionowy klip albo poziome nagranie streamu) do 1080x1920."""
    z, wy = cfg["zrodlo"], cfg["wyjscie"]
    OW, OH = wy["szerokosc"], wy["wysokosc"]
    TOPH = even(OH * wy["kamerka_proc"])
    BOTH = OH - TOPH
    if "kamerka" in z:  # prostokąty [x, y, szer, wys] jako ułamki klatki
        cam_r = tuple(v * d for v, d in zip(z["kamerka"], (W, H, W, H)))
        game_r = tuple(v * d for v, d in zip(z["gra"], (W, H, W, H)))
    else:  # pionowy klip: kamerka u góry, gra pod spodem
        seam = even(H * z["granica_kamera_gra"])
        cam_r, game_r = (0, 0, W, seam), (0, seam, W, H - seam)
    fx, fy = z["twarz_x"] * W, z["twarz_y"] * H
    # kadr kamerki można zakotwiczyć wyżej niż twarz (np. żeby zmieścić tablicę LED u góry)
    cam = _fit(cam_r, OW / TOPH, fx, z.get("kamerka_srodek_y", z["twarz_y"]) * H)
    mode = wy.get("gra_przyciecie", "srodek")
    gax = z.get("gra_srodek_x", (game_r[0] + game_r[2] / 2) / W) * W
    if mode == "gora":
        gay = game_r[1] + game_r[3]  # zachowaj dół (pasek umiejętności), obetnij górę
    else:
        gay = z.get("gra_srodek_y", (game_r[1] + game_r[3] / 2) / H) * H
    game = _fit(game_r, OW / BOTH, gax, gay)
    face = ((fx - cam[0]) / cam[2] * OW, (fy - cam[1]) / cam[3] * TOPH)
    res = {"OW": OW, "OH": OH, "TOPH": TOPH, "BOTH": BOTH, "cam": cam, "game": game, "face": face,
           "wide": None, "GH": BOTH}
    # Szeroki kadr gry: więcej mapy na całą szerokość ekranu, pod nim rozmyte tło z gry (miejsce na napisy).
    aspect = wy.get("gra_proporcje")
    if aspect:
        gh = even(OW / float(aspect))
        if gh < BOTH:
            res["wide"] = _fit(game_r, float(aspect), gax, z.get("gra_srodek_y", (game_r[1] + game_r[3] / 2) / H) * H)
            res["GH"] = gh
    return res


def preview_layout(src: Path, cfg: dict, t: float, out: Path) -> Path:
    """Zapisuje PNG: klatka źródła z zaznaczonymi kadrami + podgląd złożonego pionu. Do kalibracji układu."""
    info = probe(src)
    with tempfile.TemporaryDirectory(prefix="kadr_") as tmp:
        frame = Path(tmp) / "f.png"
        run(["ffmpeg", "-y", "-ss", f"{t}", "-i", str(src), "-frames:v", "1", str(frame)])
        im = Image.open(frame).convert("RGB")
    g = layout(cfg, info.w, info.h)
    cx, cy, cw, ch = g["cam"]
    gx, gy, gw, gch = g["game"]
    comp = Image.new("RGB", (g["OW"], g["OH"]))
    comp.paste(im.crop((cx, cy, cx + cw, cy + ch)).resize((g["OW"], g["TOPH"])), (0, 0))
    if g["wide"]:
        bg = im.crop((gx, gy, gx + gw, gy + gch)).resize((g["OW"], g["BOTH"])).filter(ImageFilter.GaussianBlur(25))
        comp.paste(bg, (0, g["TOPH"]))
        wx, wy_, ww, wh = g["wide"]
        comp.paste(im.crop((wx, wy_, wx + ww, wy_ + wh)).resize((g["OW"], g["GH"])), (0, g["TOPH"]))
        gx, gy, gw, gch = g["wide"]  # na klatce źródłowej zaznacz szeroki kadr
    else:
        comp.paste(im.crop((gx, gy, gx + gw, gy + gch)).resize((g["OW"], g["BOTH"])), (0, g["TOPH"]))
    d = ImageDraw.Draw(im)
    lw = max(3, info.w // 300)
    d.rectangle((cx, cy, cx + cw, cy + ch), outline="#FF2D2D", width=lw)
    d.rectangle((gx, gy, gx + gw, gy + gch), outline="#2DFF5A", width=lw)
    fx, fy = cfg["zrodlo"]["twarz_x"] * info.w, cfg["zrodlo"]["twarz_y"] * info.h
    d.ellipse((fx - 3 * lw, fy - 3 * lw, fx + 3 * lw, fy + 3 * lw), outline="#FFE600", width=lw)
    scale = info.h / g["OH"]
    comp = comp.resize((int(g["OW"] * scale), info.h))
    sheet = Image.new("RGB", (info.w + comp.width + 20, info.h), "white")
    sheet.paste(im, (0, 0))
    sheet.paste(comp, (info.w + 20, 0))
    sheet.save(out)
    log.info("Podgląd układu: %s (czerwony = kamerka, zielony = gra, żółte kółko = twarz)", out)
    return out


@dataclass
class Zlecenie:
    src: Path
    out: Path
    hook: str | None = None
    start: float | None = None
    koniec: float | None = None
    dlugosc: float | None = None
    napisy: bool = False
    cenzura: bool = True
    model: str = "small"
    efekt: str | None = None


def cache_dir_for(src: Path) -> Path:
    return src.parent / "slawa_transkrypcje"


def build(z_: Zlecenie, cfg: dict) -> Path:
    src = z_.src
    info = probe(src)
    log.info("Źródło: %s, %dx%d, %.0f fps, %.1f s", src.name, info.w, info.h, info.fps, info.dur)

    # zakres czasu
    kul = cfg["kulminacje"]
    start = z_.start if z_.start is not None else 0.0
    end = z_.koniec if z_.koniec is not None else info.dur
    if z_.dlugosc and z_.start is None and z_.koniec is None:
        if info.audio:
            start, end = choose_window(loudness_curve(src, 0, info.dur), info.dur, z_.dlugosc, kul)
            log.info("Automatyczne cięcie (najwięcej głośnych momentów): %.1f–%.1f s", start, end)
        else:
            end = min(info.dur, z_.dlugosc)
    end = min(end, info.dur)
    if end - start < 1:
        raise ValueError(f"Za krótki zakres: {start:.1f}–{end:.1f} s")
    dur = end - start

    peaks = find_peaks(loudness_curve(src, start, end), kul) if info.audio else []
    face_peak = max(peaks, key=lambda p: p[1])[0] if peaks else None
    game_peaks = [t for t, _ in peaks if t != face_peak]

    # geometria
    g = layout(cfg, info.w, info.h)
    OW, OH, TOPH, BOTH = g["OW"], g["OH"], g["TOPH"], g["BOTH"]
    cx, cy, cw, ch = g["cam"]
    gx, gy, gw, gch = g["game"]
    fxo, fyo = g["face"]

    fps = f"{info.fps:g}"
    zf = f"1+{kul['zoom_twarzy'] - 1:.3f}*({envelope([face_peak] if face_peak else [], kul)})"
    zg = f"1+{kul['zoom_gry'] - 1:.3f}*({envelope(game_peaks, kul)})"

    work = Path(tempfile.mkdtemp(prefix="montaz_"))
    try:
        inputs = ["-ss", f"{start}", "-to", f"{end}", "-i", str(src.resolve())]
        fc = [
            f"[0:v]split=2[k][g]",
            f"[k]crop={cw}:{ch}:{int(cx)}:{int(cy)},scale={OW}:{TOPH},"
            f"zoompan=z='{zf}':d=1:s={OW}x{TOPH}:fps={fps}:"
            f"x='max(0,min(iw-iw/zoom,{fxo:.1f}-iw/zoom/2))':y='max(0,min(ih-ih/zoom,{fyo:.1f}-ih/zoom/2))'[top]",
        ]
        if g["wide"]:
            wx, wy_, ww, wh = g["wide"]
            GH = g["GH"]
            fc += [
                "[g]split=2[gb][gw]",
                f"[gb]crop={gw}:{gch}:{int(gx)}:{int(gy)},scale={OW // 4}:{BOTH // 4},boxblur=6:2,"
                f"scale={OW}:{BOTH},eq=brightness=-0.12[bg]",
                f"[gw]crop={ww}:{wh}:{int(wx)}:{int(wy_)},scale={OW}:{GH},"
                f"zoompan=z='{zg}':d=1:s={OW}x{GH}:fps={fps}:x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2'[gp]",
                "[bg][gp]overlay=0:0[bot]",
            ]
        else:
            fc.append(f"[g]crop={gw}:{gch}:{int(gx)}:{int(gy)},scale={OW}:{BOTH},"
                      f"zoompan=z='{zg}':d=1:s={OW}x{BOTH}:fps={fps}:x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2'[bot]")
        fc.append("[top][bot]vstack=inputs=2,setsar=1[v0]")
        last = "v0"
        idx = 1

        if z_.hook:
            hook_png = work / "hook.png"
            _, hh = render_hook(z_.hook, cfg["hook"], OW, hook_png)
            t = hook_duration(cfg["hook"], face_peak, dur)
            inputs += ["-loop", "1", "-t", f"{t}", "-i", str(hook_png)]
            fc.append(f"[{idx}:v]format=rgba,fade=out:st={t - 0.15:.2f}:d=0.15:alpha=1[hk]")
            fc.append(f"[{last}][hk]overlay=x=0:y={max(0, TOPH - hh // 2)}:eof_action=pass[v1]")
            last, idx = "v1", idx + 1

        if z_.napisy:
            words = transcribe_file(src, z_.model, cache_dir_for(src))
            if words:
                font_path = pick_font(cfg["hook"]["czcionki"])
                shutil.copy(font_path, work / Path(font_path).name)
                font_name = ImageFont.truetype(font_path, 20).getname()[0]
                ass = make_subtitles(words, start, end, font_name, OW, OH, TOPH, work, cenzura=z_.cenzura,
                                     kolor_aktywny=cfg.get("napisy", {}).get("kolor_aktywnego_slowa", "#FFE600"),
                                     margin_v=(TOPH + g["GH"] + (BOTH - g["GH"]) // 3) if g["wide"] else None)
                if ass:
                    fc.append(f"[{last}]subtitles=napisy.ass:fontsdir=.[v2]")
                    last = "v2"

        fc.append(f"[{last}]format=yuv420p[vout]")

        audio_map = []
        if info.audio:
            a_last = "0:a"
            if z_.efekt and peaks:
                inputs += ["-i", str(Path(z_.efekt).resolve())]
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

        graph = ";".join(fc)
        (work / "filtry.txt").write_text(graph, encoding="utf-8")  # kopia do diagnostyki
        out = z_.out
        out.parent.mkdir(parents=True, exist_ok=True)
        cmd = ["ffmpeg", "-hide_banner", "-y", *inputs, "-filter_complex", graph,
               "-map", "[vout]", *audio_map, "-t", f"{dur:.3f}",
               "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-r", fps,
               "-movflags", "+faststart", str(out.resolve())]
        log.info("Renderuję %.1f s (%.1f–%.1f s źródła)...", dur, start, end)
        run(cmd, cwd=work)
    finally:
        shutil.rmtree(work, ignore_errors=True)
    log_features(z_, out, start, end, len(peaks), cfg, z_.hook and hook_duration(cfg["hook"], face_peak, dur))
    log.info("Gotowe: %s", out)
    return out


DZIENNIK_POLA = ["data_renderu", "klip", "zrodlo", "start_s", "koniec_s", "dlugosc_s", "hook", "slowa_hooka",
                 "hook_do_s", "napisy", "kulminacje", "kamerka_proc",
                 # do uzupełnienia po 7 dniach z TikTok Studio:
                 "data_publikacji", "wyswietlenia_7d", "sr_ogladania_s", "spadek_0_2s_pp", "pct_calosc", "nowi_obserwujacy"]


def log_features(z_: "Zlecenie", out: Path, start: float, end: float, n_peaks: int, cfg: dict, hook_s) -> None:
    """Dopisuje cechy klipu do slawa_dziennik.csv obok wyniku; po publikacji dopisz statystyki i porównuj."""
    path = out.parent / "slawa_dziennik.csv"
    new = not path.exists()
    try:
        with open(path, "a", encoding="utf-8-sig" if new else "utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=DZIENNIK_POLA, delimiter=";")
            if new:
                w.writeheader()
            w.writerow({
                "data_renderu": time.strftime("%Y-%m-%d %H:%M"), "klip": out.name, "zrodlo": z_.src.name,
                "start_s": f"{start:.1f}", "koniec_s": f"{end:.1f}", "dlugosc_s": f"{end - start:.1f}",
                "hook": z_.hook or "", "slowa_hooka": len(parse_accents(z_.hook)) if z_.hook else 0,
                "hook_do_s": f"{hook_s:.1f}" if hook_s else "", "napisy": "tak" if z_.napisy else "nie",
                "kulminacje": n_peaks, "kamerka_proc": cfg["wyjscie"]["kamerka_proc"],
            })
    except OSError:
        log.warning("Nie udało się dopisać do dziennika %s", path)


# ---------- tryb folderu: analiza i plan ----------

WIDEO = {".mp4", ".mov", ".mkv"}
PLAN_POLA = ["plik", "dlugosc_zrodla_s", "start", "koniec", "hook", "napisy", "status", "kulminacje_s", "tekst_fragmentu"]


def videos_in(folder: Path) -> list[Path]:
    return sorted(p for p in folder.iterdir()
                  if p.is_file() and p.suffix.lower() in WIDEO and not p.stem.endswith("_slawa"))


def read_plan(path: Path) -> list[dict]:
    with open(path, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f, delimiter=";"))


def write_plan(path: Path, rows: list[dict]) -> None:
    tmp = path.with_suffix(".tmp")
    with open(tmp, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=PLAN_POLA, delimiter=";", extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    tmp.replace(path)  # zapis atomowy: przerwanie nie zostawi połowy pliku


@contextmanager
def plan_lock(folder: Path, max_age_h: float = 12):
    """Blokada planu: analiza i montaż nie mogą jednocześnie zapisywać tego samego slawa_plan.csv."""
    lock = folder / "slawa_plan.lock"
    if lock.exists() and time.time() - lock.stat().st_mtime < max_age_h * 3600:
        sys.exit(f"Plan w {folder} jest właśnie używany przez inne uruchomienie (plik {lock.name}). "
                 f"Poczekaj, aż się skończy. Jeśli nic nie działa, usuń ten plik.")
    lock.write_text(f"{os.getpid()} {time.strftime('%Y-%m-%d %H:%M:%S')}", encoding="utf-8")
    try:
        yield
    finally:
        lock.unlink(missing_ok=True)


def analyze_folder(folder: Path, cfg: dict, length: float, model: str, transkrypcja: bool) -> Path:
    plan_path = folder / "slawa_plan.csv"
    rows = read_plan(plan_path) if plan_path.exists() else []
    known = {r["plik"] for r in rows}
    files = [p for p in videos_in(folder) if p.name not in known]
    log.info("Folder: %s. Nowych klipów do analizy: %d (już w planie: %d).", folder, len(files), len(known))
    for n, src in enumerate(files, 1):
        log.info("[%d/%d] %s", n, len(files), src.name)
        try:
            info = probe(src)
            curve = loudness_curve(src, 0, info.dur) if info.audio else []
            start, end = choose_window(curve, info.dur, length, cfg["kulminacje"]) if curve else (0.0, min(info.dur, length))
            found = find_peaks(curve, cfg["kulminacje"]) if curve else []
            peaks = [t for t, _ in sorted(found, key=lambda p: -p[1])]  # od najgłośniejszej
            # klatka z najmocniejszego momentu: lokalny Claude zobaczy, w co grasz i co się dzieje
            klatki = folder / "slawa_klatki"
            klatki.mkdir(exist_ok=True)
            t_kl = next((t for t in peaks if start <= t <= end), (start + end) / 2)
            try:
                run(["ffmpeg", "-y", "-ss", f"{t_kl:.2f}", "-i", str(src), "-frames:v", "1",
                     "-vf", "scale=960:-2", "-q:v", "4", str(klatki / f"{src.stem}.jpg")])
            except RuntimeError:
                log.warning("Nie udało się zapisać klatki dla %s", src.name)
            tekst = ""
            if transkrypcja:
                words = transcribe_file(src, model, cache_dir_for(src)) or []
                tekst = " ".join(w["word"] for w in words if start <= w["start"] <= end)
            rows.append({
                "plik": src.name, "dlugosc_zrodla_s": f"{info.dur:.1f}", "start": f"{start:.1f}",
                "koniec": f"{end:.1f}", "hook": "", "napisy": "tak" if transkrypcja else "nie",
                "status": "do_zrobienia", "kulminacje_s": " ".join(f"{t:.1f}" for t in sorted(peaks)),
                "tekst_fragmentu": tekst[:300],
            })
        except (RuntimeError, ValueError, OSError) as e:
            log.exception("Analiza nieudana: %s", src.name)
            rows.append({"plik": src.name, "status": f"blad_analizy: {e}"[:120]})
        write_plan(plan_path, rows)  # po każdym klipie, żeby przerwanie nie gubiło pracy
    log.info("Plan zapisany: %s", plan_path)
    return plan_path


def render_plan(plan_path: Path, cfg: dict, model: str, cenzura: bool, efekt: str | None,
                out_folder: Path | None = None) -> None:
    rows = read_plan(plan_path)
    folder = plan_path.parent
    out_folder = out_folder or folder / "gotowe"
    todo = [r for r in rows if r.get("status", "") in ("do_zrobienia", "blad")]
    log.info("Plan: %d klipów do montażu (pomijam status 'gotowe' i 'pomin').", len(todo))
    for n, r in enumerate(todo, 1):
        src = folder / r["plik"]
        log.info("[%d/%d] %s", n, len(todo), r["plik"])
        try:
            zl = Zlecenie(
                src=src, out=out_folder / f"{src.stem}_slawa.mp4",
                hook=(r.get("hook") or "").strip() or None,
                start=float(r["start"].replace(",", ".")), koniec=float(r["koniec"].replace(",", ".")),
                napisy=(r.get("napisy", "").strip().lower() == "tak"), cenzura=cenzura, model=model, efekt=efekt,
            )
            build(zl, cfg)
            r["status"] = "gotowe"
        except (RuntimeError, ValueError, OSError, KeyError) as e:
            log.exception("Montaż nieudany: %s", r["plik"])
            r["status"] = "blad"
            print(f"! {r['plik']}: {e}")
        write_plan(plan_path, rows)  # status po każdym klipie: po przerwaniu wznawia od miejsca błędu
    log.info("Koniec. Gotowe klipy są w: %s", out_folder)


def main() -> None:
    setup_logging()
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        sys.exit("Brak ffmpeg. Zainstaluj go (Windows: winget install ffmpeg) i uruchom ponownie terminal.")
    p = argparse.ArgumentParser(description="Bot montażowy Sławy: klip ze streamu → klip na TikToka.")
    p.add_argument("wejscie", nargs="?", help="plik klipu albo folder (z --analiza)")
    p.add_argument("--hook", help='tekst na start, np. "Ale mi *PRZYKRO*" (gwiazdki = kolor akcentu)')
    p.add_argument("--dlugosc", type=float, help="docelowa długość w s; wybiera fragment z najwięcej kulminacjami")
    p.add_argument("--start", type=float, help="ręczny początek (s)")
    p.add_argument("--koniec", type=float, help="ręczny koniec (s)")
    p.add_argument("--efekt", help="plik dźwiękowy (np. boom.wav) dodawany na kulminacjach")
    p.add_argument("--napisy", action="store_true", help="napisy z mowy (wymaga faster-whisper)")
    p.add_argument("--bez-cenzury", action="store_true", help="nie maskuj przekleństw w napisach")
    p.add_argument("--model", default="small", help="model Whisper (tiny/base/small/medium)")
    p.add_argument("--uklad", default=str(BASE_DIR / "uklad_pysiex.yaml"), help="plik z układem kadru")
    p.add_argument("--wyjscie", help="plik wynikowy (domyślnie <nazwa>_slawa.mp4 obok źródła)")
    p.add_argument("--analiza", action="store_true", help="folder: analiza wszystkich klipów i plan slawa_plan.csv")
    p.add_argument("--bez-transkrypcji", action="store_true", help="przy --analiza pomiń Whisper (szybciej)")
    p.add_argument("--plan", help="montaż wszystkich klipów z pliku slawa_plan.csv")
    p.add_argument("--folder-wyjsciowy", help="przy --plan: gdzie zapisać gotowe klipy (domyślnie podfolder 'gotowe')")
    p.add_argument("--podglad-ukladu", type=float, metavar="SEKUNDA",
                   help="zamiast montażu zapisz PNG z zaznaczonym kadrem w danej sekundzie (do ustawiania układu)")
    args = p.parse_args()
    try:
        uklad = Path(args.uklad)
        if not uklad.exists() and (BASE_DIR / uklad).exists():
            uklad = BASE_DIR / uklad  # nazwa pliku układu działa z każdego folderu
        cfg = yaml.safe_load(uklad.read_text(encoding="utf-8"))
        if args.podglad_ukladu is not None:
            src = Path(args.wejscie or "")
            if not src.is_file():
                sys.exit(f"Nie ma pliku: {src}")
            preview_layout(src, cfg, args.podglad_ukladu, src.with_name(src.stem + "_uklad.png"))
        elif args.plan:
            with plan_lock(Path(args.plan).parent):
                render_plan(Path(args.plan), cfg, args.model, not args.bez_cenzury, args.efekt,
                            Path(args.folder_wyjsciowy) if args.folder_wyjsciowy else None)
        elif args.analiza:
            folder = Path(args.wejscie or "")
            if not folder.is_dir():
                sys.exit(f"Nie ma folderu: {folder}")
            with plan_lock(folder):
                analyze_folder(folder, cfg, args.dlugosc or 22, args.model, not args.bez_transkrypcji)
        else:
            if not args.wejscie or not Path(args.wejscie).is_file():
                sys.exit(f"Nie ma pliku: {args.wejscie}")
            src = Path(args.wejscie)
            out = Path(args.wyjscie) if args.wyjscie else src.with_name(src.stem + "_slawa.mp4")
            build(Zlecenie(src=src, out=out, hook=args.hook, start=args.start, koniec=args.koniec,
                           dlugosc=args.dlugosc, napisy=args.napisy, cenzura=not args.bez_cenzury,
                           model=args.model, efekt=args.efekt), cfg)
    except (RuntimeError, KeyError, ValueError, OSError) as e:
        log.exception("Montaż przerwany")
        sys.exit(f"Błąd: {e}")


if __name__ == "__main__":
    main()
