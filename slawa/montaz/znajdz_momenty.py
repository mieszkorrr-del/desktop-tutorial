#!/usr/bin/env python3
"""Wyszukiwarka momentów Sławy: z wielogodzinnego nagrania streamu wycina kandydatów na klipy.

Sygnały:
- zdarzenia z gry LoL (opcjonalnie, z lol_logger.py): Twoje zabójstwa, multikille, kradzieże smoków i baronów,
- głośność (krzyki, wybuchy, nagłe reakcje), liczona z całego dźwięku nagrania,
- czat z Twitcha (opcjonalnie): nagłe wybuchy liczby wiadomości i śmiechu (KEKW, XD, LUL...).
  Czat reaguje z opóźnieniem, więc jego sygnał jest przesuwany wstecz (--opoznienie-czatu).

Wynik: folder z fragmentami (domyślnie 60 s każdy) i plik momenty.csv z punktacją oraz próbką
czatu. Ten folder przechodzi dalej przez: montuj.py <folder> --analiza  →  montuj.py --plan ...

Przykład:
  python znajdz_momenty.py vod.mp4 --czat czat.json --ile 30
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import re
import shutil
import statistics
import subprocess
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
log = logging.getLogger("momenty")

SMIECH = re.compile(r"(kekw|omegalul|lul|xd|haha|hehe|lmao|\blol\b|\bpog|\bw+\b|o kurwa|kurwa|\?\?+|!!+)", re.IGNORECASE)


def setup_logging() -> None:
    fh = logging.FileHandler(BASE_DIR / "momenty.log", encoding="utf-8")
    fh.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    sh = logging.StreamHandler()
    sh.setFormatter(logging.Formatter("%(message)s"))
    log.addHandler(fh)
    log.addHandler(sh)
    log.setLevel(logging.INFO)


def hms(t: float) -> str:
    t = int(t)
    return f"{t // 3600:02d}h{t % 3600 // 60:02d}m{t % 60:02d}s"


def duration(path: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True)
    if out.returncode != 0 or not out.stdout.strip():
        raise RuntimeError(f"Nie mogę odczytać długości pliku: {out.stderr.strip()}")
    return float(out.stdout.strip())


def loudness_per_second(path: Path, dur: float) -> list[float]:
    """Maksymalna głośność chwilowa (LUFS) w każdej sekundzie nagrania. Czyta tylko dźwięk."""
    n = int(dur) + 1
    sec = [-70.0] * n
    cmd = ["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-vn", "-af", "ebur128", "-f", "null", "-"]
    pat = re.compile(r"t:\s*([\d.]+)\s.*?M:\s*(-?[\d.]+)")
    log.info("Liczę głośność całego nagrania (%s)... to może potrwać kilka–kilkanaście minut.", hms(dur))
    proc = subprocess.Popen(cmd, stderr=subprocess.PIPE, stdout=subprocess.DEVNULL, text=True,
                            encoding="utf-8", errors="replace")
    last_report = 0
    for line in proc.stderr:
        m = pat.search(line)
        if not m:
            continue
        t, lufs = float(m[1]) - 0.2, float(m[2])
        i = int(max(0, t))
        if i < n and lufs > sec[i]:
            sec[i] = lufs
        if t - last_report >= 1800:
            last_report = t
            log.info("  ...%s / %s", hms(t), hms(dur))
    if proc.wait() != 0:
        raise RuntimeError("ffmpeg nie przeliczył głośności (sprawdź, czy plik ma dźwięk).")
    return sec


def load_chat(path: Path) -> list[tuple[float, str]]:
    """Wczytuje czat z TwitchDownloader (JSON: comments[].content_offset_seconds, message.body).

    Format jest do sprawdzenia na prawdziwym pliku; parser szuka tych pól tolerancyjnie.
    """
    data = json.loads(path.read_text(encoding="utf-8"))
    comments = data.get("comments", data if isinstance(data, list) else [])
    msgs = []
    for c in comments:
        t = c.get("content_offset_seconds")
        body = c.get("message", {}).get("body") if isinstance(c.get("message"), dict) else c.get("message")
        if t is None or body is None:
            continue
        msgs.append((float(t), str(body)))
    if not msgs:
        raise RuntimeError("Nie znalazłem wiadomości w pliku czatu (oczekiwane pola: content_offset_seconds, message.body).")
    log.info("Czat: %d wiadomości.", len(msgs))
    return msgs


WAGI_LOL = {"ChampionKill": 1.0, "Multikill": 0.0, "Ace": 2.0, "FirstBlood": 2.0,
            "DragonKill": 2.0, "BaronKill": 3.0, "HeraldKill": 2.0, "InhibKilled": 1.0, "TurretKilled": 0.5}


def load_lol_events(path: Path, vod_start: datetime, n: int) -> list[float]:
    """Wczytuje CSV z lol_logger.py i zwraca punkty zdarzeń dla każdej sekundy nagrania."""
    pts = [0.0] * n
    used = 0
    with open(path, encoding="utf-8-sig", newline="") as f:
        for r in csv.DictReader(f, delimiter=";"):
            try:
                t = (datetime.fromisoformat(r["czas"]) - vod_start).total_seconds()
            except (KeyError, ValueError):
                continue
            i = int(t)
            if not 0 <= i < n:
                continue
            ev, ja = r.get("zdarzenie", ""), r.get("ja") == "tak"
            w = WAGI_LOL.get(ev, 0.0)
            if ev == "ChampionKill" and ja:
                w = 3.0 if r.get("zabojca") and r.get("zabojca") not in r.get("asysty", "") else 2.0
            if ev == "Multikill" and ja:
                try:
                    w = 3.0 * int(r.get("seria") or 2)
                except ValueError:
                    w = 6.0
            if str(r.get("kradziez", "")).lower() == "true":
                w += 5.0
            if not ja and ev in ("ChampionKill", "Multikill"):
                w *= 0.3  # cudza walka mniej ważna niż Twoja
            for j in range(max(0, i - 3), min(n, i + 2)):  # logger zapisuje do 2 s po fakcie
                pts[j] = max(pts[j], w)
            used += 1
    log.info("Zdarzenia LoL w zakresie nagrania: %d.", used)
    return pts


def rolling_median(values: list[float], half: int) -> list[float]:
    """Mediana w oknie ±half (co 10 s dla szybkości przy wielu godzinach)."""
    n = len(values)
    out = [0.0] * n
    step = 10
    for i in range(0, n, step):
        med = statistics.median(values[max(0, i - half): i + half + 1])
        for j in range(i, min(n, i + step)):
            out[j] = med
    return out


def score_timeline(loud: list[float], chat: list[tuple[float, str]] | None, delay: float,
                   w_chat: float, lol: list[float] | None = None) -> tuple[list[float], list[float], list[float]]:
    n = len(loud)
    base = rolling_median(loud, 300)  # typowy poziom w ±5 min (stream ma różne fazy)
    loud_ex = [max(0.0, l - b - 4.0) for l, b in zip(loud, base)]  # nadwyżka ponad typowy poziom
    chat_ex = [0.0] * n
    if chat:
        per_sec = [0.0] * n
        for t, body in chat:
            i = int(t - delay)  # czat reaguje po fakcie
            if 0 <= i < n:
                per_sec[i] += 1.0 + (1.0 if SMIECH.search(body) else 0.0)
        win = [sum(per_sec[max(0, i - 5): i + 5]) for i in range(n)]  # wiadomości w oknie 10 s
        cbase = rolling_median(win, 300)
        chat_ex = [max(0.0, (w - b) / (b + 3.0)) for w, b in zip(win, cbase)]  # względny wybuch czatu
    lol = lol or [0.0] * n
    score = [l + w_chat * c * 6.0 + 4.0 * e for l, c, e in zip(loud_ex, chat_ex, lol)]
    return score, loud_ex, chat_ex


def pick_moments(score: list[float], count: int, spacing: int) -> list[int]:
    # wygładzenie 3 s, żeby pojedynczy trzask nie wygrywał z dłuższą reakcją
    sm = [sum(score[max(0, i - 1): i + 2]) for i in range(len(score))]
    order = sorted(range(len(sm)), key=lambda i: -sm[i])
    chosen: list[int] = []
    for i in order:
        if len(chosen) >= count or sm[i] < 3.0:  # poniżej tego progu to szum, nie moment
            break
        if score[i] >= 1.0 and all(abs(i - c) >= spacing for c in chosen):
            chosen.append(i)
    return chosen


WIDEO = {".mp4", ".mkv", ".mov", ".flv", ".ts"}


def find_chat_for(vod: Path) -> Path | None:
    """Czat obok nagrania: <nazwa>.json albo <nazwa>_czat.json."""
    for cand in (vod.with_suffix(".json"), vod.with_name(vod.stem + "_czat.json")):
        if cand.is_file():
            return cand
    return None


def process_vod(src: Path, out_dir: Path, args: argparse.Namespace, chat_path: Path | None,
                prefix: str = "") -> list[dict]:
    dur = duration(src)
    loud = loudness_per_second(src, dur)
    chat = load_chat(chat_path) if chat_path else None
    lol = None
    if args.zdarzenia_lol:
        lol = load_lol_events(Path(args.zdarzenia_lol), datetime.fromisoformat(args.poczatek_nagrania), len(loud))
    score, loud_ex, chat_ex = score_timeline(loud, chat, args.opoznienie_czatu, args.waga_czatu, lol)
    peaks = pick_moments(score, args.ile, args.przed + args.po)
    if not peaks:
        log.warning("%s: brak wyraźnych momentów (bez skoków głośności i czatu).", src.name)
        return []
    out_dir.mkdir(parents=True, exist_ok=True)
    rows = []
    for rank, pk in enumerate(sorted(peaks, key=lambda i: -score[i]), 1):
        start = max(0, pk - args.przed)
        length = min(args.przed + args.po, dur - start)
        name = f"{prefix}moment_{rank:02d}_{hms(pk)}.mp4"
        if (out_dir / name).exists():
            log.info("Pomijam (już wycięty): %s", name)
        else:
            # kopiowanie strumieni bez kodowania: szybkie; start może przesunąć się do najbliższej klatki kluczowej
            res = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", str(start),
                                  "-i", str(src), "-t", str(length), "-c", "copy", "-avoid_negative_ts", "1",
                                  str(out_dir / name)], capture_output=True, text=True)
            if res.returncode != 0:
                log.error("Nie udało się wyciąć %s: %s", name, res.stderr[-500:])
                continue
        sample = ""
        if chat:
            okno = [b for t, b in chat if pk - 2 <= t - args.opoznienie_czatu <= pk + 10]
            sample = " | ".join(m for m, _ in Counter(okno).most_common(6))[:200]
        rows.append({"nagranie": src.name, "ranking": rank, "plik": name, "czas_w_nagraniu": hms(pk),
                     "kulminacja_w_pliku_s": pk - start, "punkty": round(score[pk], 1),
                     "glosnosc": round(loud_ex[pk], 1), "czat": round(chat_ex[pk], 2),
                     "lol": round(lol[pk], 1) if lol else 0, "probka_czatu": sample})
        log.info("[%d/%d] %s (punkty %.1f)", rank, len(peaks), name, score[pk])
    return rows


def main() -> None:
    setup_logging()
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        sys.exit("Brak ffmpeg (Windows: winget install ffmpeg, potem nowy terminal).")
    p = argparse.ArgumentParser(description="Wycina kandydatów na klipy z długiego nagrania streamu.")
    p.add_argument("nagranie", help="plik nagrania (VOD z Twitcha) albo folder z kilkoma nagraniami")
    p.add_argument("--czat", help="czat z TwitchDownloader (JSON); przy folderze szukany automatycznie jako <nagranie>.json")
    p.add_argument("--ile", type=int, default=30, help="ile momentów wyciąć z jednego nagrania (domyślnie 30)")
    p.add_argument("--przed", type=int, default=45, help="sekund kontekstu przed kulminacją (domyślnie 45)")
    p.add_argument("--po", type=int, default=15, help="sekund po kulminacji (domyślnie 15)")
    p.add_argument("--opoznienie-czatu", type=float, default=8.0, help="o ile s czat spóźnia się za akcją")
    p.add_argument("--waga-czatu", type=float, default=1.0, help="waga czatu względem głośności")
    p.add_argument("--zdarzenia-lol", help="CSV z lol_logger.py (zabójstwa, multikille, smoki...); tylko dla 1 nagrania")
    p.add_argument("--poczatek-nagrania", help='czas startu nagrania, np. "2026-10-07 18:02:15" (potrzebny z --zdarzenia-lol)')
    p.add_argument("--wyjscie", help="folder na fragmenty (domyślnie <nagranie>_momenty albo <folder>\\_momenty)")
    args = p.parse_args()

    src = Path(args.nagranie)
    if args.zdarzenia_lol and not args.poczatek_nagrania:
        sys.exit("Do --zdarzenia-lol podaj --poczatek-nagrania (godzina startu streamu/nagrania).")
    try:
        if src.is_dir():
            if args.zdarzenia_lol:
                sys.exit("--zdarzenia-lol działa dla pojedynczego nagrania, nie dla folderu.")
            vods = sorted(v for v in src.iterdir() if v.is_file() and v.suffix.lower() in WIDEO)
            if not vods:
                sys.exit(f"W folderze {src} nie ma nagrań ({', '.join(sorted(WIDEO))}).")
            out_dir = Path(args.wyjscie) if args.wyjscie else src / "_momenty"
            rows = []
            for n, vod in enumerate(vods, 1):
                log.info("=== Nagranie %d/%d: %s", n, len(vods), vod.name)
                chat_path = find_chat_for(vod)
                if chat_path:
                    log.info("Czat: %s", chat_path.name)
                try:
                    rows += process_vod(vod, out_dir, args, chat_path, prefix=f"{vod.stem}_")
                except (RuntimeError, OSError, ValueError, json.JSONDecodeError):
                    log.exception("Pomijam nagranie %s po błędzie", vod.name)
        elif src.is_file():
            out_dir = Path(args.wyjscie) if args.wyjscie else src.with_name(src.stem + "_momenty")
            rows = process_vod(src, out_dir, args, Path(args.czat) if args.czat else None)
        else:
            sys.exit(f"Nie ma pliku ani folderu: {src}")
        if not rows:
            sys.exit("Nie wycięto żadnego momentu.")
        with open(out_dir / "momenty.csv", "w", encoding="utf-8-sig", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()), delimiter=";")
            w.writeheader()
            w.writerows(rows)
        log.info("Gotowe: %d fragmentów w %s. Dalej: montuj.py \"%s\" --analiza", len(rows), out_dir, out_dir)
    except (RuntimeError, OSError, ValueError, json.JSONDecodeError) as e:
        log.exception("Przerwano")
        sys.exit(f"Błąd: {e}")


if __name__ == "__main__":
    main()
