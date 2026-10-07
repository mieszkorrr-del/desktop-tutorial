#!/usr/bin/env python3
"""Wyszukiwarka momentów Sławy: z wielogodzinnego nagrania streamu wycina kandydatów na klipy.

Sygnały:
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
                   w_chat: float) -> tuple[list[float], list[float], list[float]]:
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
    score = [l + w_chat * c * 6.0 for l, c in zip(loud_ex, chat_ex)]
    return score, loud_ex, chat_ex


def pick_moments(score: list[float], count: int, spacing: int) -> list[int]:
    # wygładzenie 3 s, żeby pojedynczy trzask nie wygrywał z dłuższą reakcją
    sm = [sum(score[max(0, i - 1): i + 2]) for i in range(len(score))]
    order = sorted(range(len(sm)), key=lambda i: -sm[i])
    chosen: list[int] = []
    for i in order:
        if sm[i] < 1.0 or len(chosen) >= count:  # poniżej 1 punktu to szum, nie moment
            break
        if all(abs(i - c) >= spacing for c in chosen):
            chosen.append(i)
    return chosen


def main() -> None:
    setup_logging()
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        sys.exit("Brak ffmpeg (Windows: winget install ffmpeg, potem nowy terminal).")
    p = argparse.ArgumentParser(description="Wycina kandydatów na klipy z długiego nagrania streamu.")
    p.add_argument("nagranie", help="plik nagrania (VOD z Twitcha)")
    p.add_argument("--czat", help="czat z TwitchDownloader (JSON)")
    p.add_argument("--ile", type=int, default=30, help="ile momentów wyciąć (domyślnie 30)")
    p.add_argument("--przed", type=int, default=45, help="sekund kontekstu przed kulminacją (domyślnie 45)")
    p.add_argument("--po", type=int, default=15, help="sekund po kulminacji (domyślnie 15)")
    p.add_argument("--opoznienie-czatu", type=float, default=8.0, help="o ile s czat spóźnia się za akcją")
    p.add_argument("--waga-czatu", type=float, default=1.0, help="waga czatu względem głośności")
    p.add_argument("--wyjscie", help="folder na fragmenty (domyślnie <nagranie>_momenty obok pliku)")
    args = p.parse_args()

    src = Path(args.nagranie)
    if not src.is_file():
        sys.exit(f"Nie ma pliku: {src}")
    out_dir = Path(args.wyjscie) if args.wyjscie else src.with_name(src.stem + "_momenty")
    try:
        dur = duration(src)
        loud = loudness_per_second(src, dur)
        chat = load_chat(Path(args.czat)) if args.czat else None
        score, loud_ex, chat_ex = score_timeline(loud, chat, args.opoznienie_czatu, args.waga_czatu)
        peaks = pick_moments(score, args.ile, args.przed + args.po)
        if not peaks:
            sys.exit("Nie znalazłem wyraźnych momentów (nagranie bez skoków głośności i czatu?).")
        out_dir.mkdir(parents=True, exist_ok=True)
        rows = []
        for rank, pk in enumerate(sorted(peaks, key=lambda i: -score[i]), 1):
            start = max(0, pk - args.przed)
            length = min(args.przed + args.po, dur - start)
            name = f"moment_{rank:02d}_{hms(pk)}.mp4"
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
            rows.append({"ranking": rank, "plik": name, "czas_w_nagraniu": hms(pk),
                         "kulminacja_w_pliku_s": pk - start, "punkty": round(score[pk], 1),
                         "glosnosc": round(loud_ex[pk], 1), "czat": round(chat_ex[pk], 2), "probka_czatu": sample})
            log.info("[%d/%d] %s (punkty %.1f)", rank, len(peaks), name, score[pk])
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
