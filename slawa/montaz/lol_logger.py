#!/usr/bin/env python3
"""Logger zdarzeń League of Legends do wyszukiwania momentów w nagraniu streamu.

Uruchom go przed streamem i zostaw włączonego. W trakcie każdej gry co 2 s odpytuje lokalne
API klienta gry (Riot Live Client Data API, https://127.0.0.1:2999, tylko odczyt) i dopisuje
zdarzenia (zabójstwa, multikille, smoki, barony, kradzieże) z czasem z zegara komputera do pliku CSV.
Potem znajdz_momenty.py z opcją --zdarzenia-lol zamienia ten czas na sekundę nagrania.

  python lol_logger.py                      # zapisuje do zdarzenia_lol.csv obok skryptu
  python lol_logger.py --plik C:\\stream\\zdarzenia.csv

API działa tylko w trakcie gry (nie w lobby). Ma certyfikat self-signed, więc logger łączy się
z localhostem bez weryfikacji certyfikatu: dotyczy to wyłącznie adresu 127.0.0.1.
Nazwy pól zdarzeń (EventName, KillerName, VictimName, Assisters, KillStreak, Stolen) są z dokumentacji
Riota; zachowanie przy Riot ID (Nazwa#TAG) jest do sprawdzenia na prawdziwej grze.
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import ssl
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
log = logging.getLogger("lol_logger")
POLA = ["czas", "gra_start", "zdarzenie", "czas_gry_s", "zabojca", "ofiara", "asysty", "seria", "kradziez", "ja"]


def setup_logging() -> None:
    fh = logging.FileHandler(BASE_DIR / "lol_logger.log", encoding="utf-8")
    fh.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    sh = logging.StreamHandler()
    sh.setFormatter(logging.Formatter("%(asctime)s %(message)s", "%H:%M:%S"))
    log.addHandler(fh)
    log.addHandler(sh)
    log.setLevel(logging.INFO)


def fetch(url: str, ctx: ssl.SSLContext | None):
    with urllib.request.urlopen(url, timeout=3, context=ctx) as r:
        return json.loads(r.read().decode("utf-8"))


def short(name: str | None) -> str:
    """'Nazwa#TAG' → 'nazwa' (porównanie bez taga i wielkości liter)."""
    return (name or "").split("#")[0].strip().lower()


def main() -> None:
    setup_logging()
    p = argparse.ArgumentParser(description="Zapisuje zdarzenia z gry LoL z czasem zegarowym.")
    p.add_argument("--plik", default=str(BASE_DIR / "zdarzenia_lol.csv"), help="plik CSV (dopisywany)")
    p.add_argument("--url", default="https://127.0.0.1:2999", help="adres API klienta gry")
    p.add_argument("--co-ile", type=float, default=2.0, help="odstęp odpytywania w s")
    args = p.parse_args()

    ctx = None
    if args.url.startswith("https://127.0.0.1") or args.url.startswith("https://localhost"):
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE  # tylko localhost: API klienta gry ma certyfikat self-signed

    path = Path(args.plik)
    new_file = not path.exists()
    f = open(path, "a", encoding="utf-8-sig" if new_file else "utf-8", newline="")
    writer = csv.DictWriter(f, fieldnames=POLA, delimiter=";")
    if new_file:
        writer.writeheader()

    seen: set[int] = set()
    game_start: datetime | None = None
    me = ""
    in_game = False
    log.info("Czekam na grę (Ctrl+C kończy). Zapis: %s", path)
    try:
        while True:
            try:
                data = fetch(f"{args.url}/liveclientdata/eventdata", ctx)
                if not in_game:
                    in_game = True
                    try:
                        me = short(fetch(f"{args.url}/liveclientdata/activeplayername", ctx))
                    except (urllib.error.URLError, ValueError, OSError):
                        me = ""
                    log.info("Gra wykryta, gracz: %s", me or "(nieznany)")
                now = datetime.now()
                for ev in data.get("Events", []):
                    eid = ev.get("EventID")
                    if eid is None or eid in seen:
                        continue
                    seen.add(eid)
                    name = ev.get("EventName", "")
                    if name == "GameStart":
                        game_start = now
                    assisters = [short(a) for a in ev.get("Assisters", [])]
                    killer, victim = short(ev.get("KillerName")), short(ev.get("VictimName"))
                    involved = bool(me) and me in ([killer, victim] + assisters)
                    writer.writerow({
                        "czas": now.isoformat(timespec="seconds"),
                        "gra_start": game_start.isoformat(timespec="seconds") if game_start else "",
                        "zdarzenie": name, "czas_gry_s": round(float(ev.get("EventTime", 0)), 1),
                        "zabojca": killer, "ofiara": victim, "asysty": ",".join(assisters),
                        "seria": ev.get("KillStreak", ""), "kradziez": ev.get("Stolen", ""),
                        "ja": "tak" if involved else "nie",
                    })
                    if name not in ("MinionsSpawning",):
                        log.info("%s %s→%s%s", name, killer or "-", victim or "-", " (TY)" if involved else "")
                f.flush()  # zapis na bieżąco: przerwanie nie gubi zdarzeń
            except (urllib.error.URLError, ConnectionError, TimeoutError, OSError, ValueError):
                if in_game:
                    log.info("Koniec gry (API niedostępne). Czekam na następną.")
                    in_game, seen, game_start, me = False, set(), None, ""
                time.sleep(5)
                continue
            time.sleep(args.co_ile)
    except KeyboardInterrupt:
        log.info("Zatrzymano.")
    finally:
        f.close()


if __name__ == "__main__":
    sys.exit(main())
