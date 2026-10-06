#!/usr/bin/env python3
"""Sława: szczery doradca wzrostu na TikToku i Instagramie dla @pysiex_.

Czat w terminalu oparty na Claude API. Osobowość i zasady bota są w
prompt_systemowy.md, a dane o kanale w profil_kanalu.md. Historia rozmowy
zapisuje się w historia.json po każdej wymianie, więc po zamknięciu i ponownym
uruchomieniu rozmowa toczy się dalej.

Klucz API bierzesz ze zmiennej środowiskowej ANTHROPIC_API_KEY. Nigdy nie wpisuj
go do kodu.
"""

from __future__ import annotations

import base64
import json
import logging
import mimetypes
import os
import shlex
import sys
import tempfile
from datetime import datetime
from pathlib import Path

try:
    import anthropic
except ImportError:
    sys.exit("Brak biblioteki anthropic. Zainstaluj: pip install -r requirements.txt")

BASE_DIR = Path(__file__).resolve().parent
PROMPT_FILE = BASE_DIR / "prompt_systemowy.md"
PROFILE_FILE = BASE_DIR / "profil_kanalu.md"
HISTORY_FILE = BASE_DIR / "historia.json"
LOG_FILE = BASE_DIR / "slawa.log"

MODEL = os.environ.get("SLAWA_MODEL", "claude-opus-5-5")
# low | medium | high | xhigh | max. Wyższy poziom daje dokładniejsze odpowiedzi, ale drożej i wolniej.
EFFORT = os.environ.get("SLAWA_EFFORT", "medium")
MAX_TOKENS = 32000
# Jeśli filtr bezpieczeństwa modelu odrzuci zapytanie, API samo ponowi je na zalecanym modelu zapasowym.
FALLBACK_BETA = "server-side-fallback-2026-07-01"

IMAGE_TYPES = {"image/png", "image/jpeg", "image/gif", "image/webp"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # limit API dla jednego obrazu (do sprawdzenia w dokumentacji, jeśli API odrzuci plik)

# Cennik claude-opus-5-5 w USD za 1 mln tokenów; używany tylko do orientacyjnego licznika kosztów.
PRICES = {
    "claude-opus-5-5": {"input": 4.00, "output": 20.00, "cache_write": 5.00, "cache_read": 0.20},
}

HELP = """\
Komendy lokalne:
  /obraz <plik> [pytanie]   wyślij zrzut ekranu (np. statystyki z TikTok Studio)
  \"\"\"                       zacznij lub zakończ wiadomość wielowierszową (do wklejania danych)
  /nowa                     zarchiwizuj obecną rozmowę i zacznij nową
  /koszt                    zużycie tokenów i szacunkowy koszt w tej sesji
  /pomoc                    ta lista
  /wyjscie                  koniec (albo Ctrl+D)

Tryby bota (wysyłane do Sławy): /audyt /diagnoza /pomysly /skrypt /viral
/postmortem /plan /crosspost /ocena, albo po prostu napisz, czego potrzebujesz."""

log = logging.getLogger("slawa")


def setup_logging() -> None:
    handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    log.addHandler(handler)
    log.setLevel(logging.INFO)


def build_system_prompt() -> str:
    if not PROMPT_FILE.exists():
        sys.exit(f"Brak pliku {PROMPT_FILE.name}, a bez niego bot nie ma osobowości.")
    system = PROMPT_FILE.read_text(encoding="utf-8").strip()
    if PROFILE_FILE.exists():
        profile = PROFILE_FILE.read_text(encoding="utf-8").strip()
        system += (
            "\n\n---\n\n# Aktualny profil kanału (plik uzupełniany przez twórcę)\n\n"
            "Puste pola oznaczają brak danych, więc dopytaj o nie, zamiast zgadywać.\n\n"
            + profile
        )
    return system


def load_history() -> list[dict]:
    if not HISTORY_FILE.exists():
        return []
    try:
        history = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as e:
        broken = HISTORY_FILE.with_suffix(f".uszkodzona-{datetime.now():%Y%m%d-%H%M%S}.json")
        HISTORY_FILE.replace(broken)
        log.error("Nie da się wczytać historii (%s), przeniesiono do %s", e, broken.name)
        print(f"! Historia była uszkodzona, więc przeniosłem ją do {broken.name} i zaczynam od nowa.")
        return []
    if not isinstance(history, list) or not all(
        isinstance(m, dict) and m.get("role") in ("user", "assistant") for m in history
    ):
        print("! Nieprawidłowy format historii, więc zaczynam od nowa (stary plik zostaje nietknięty).")
        HISTORY_FILE.replace(HISTORY_FILE.with_suffix(f".nieprawidlowa-{datetime.now():%Y%m%d-%H%M%S}.json"))
        return []
    # Przerwana wymiana (np. awaria w trakcie odpowiedzi) zostawia na końcu samą wiadomość użytkownika.
    while history and history[-1]["role"] == "user":
        history.pop()
    return history


def save_history(history: list[dict]) -> None:
    # Zapis atomowy: najpierw plik tymczasowy, potem podmiana, więc awaria nie zostawi połowy pliku.
    fd, tmp = tempfile.mkstemp(dir=BASE_DIR, prefix=".historia-", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(history, f, ensure_ascii=False, indent=1)
        os.replace(tmp, HISTORY_FILE)
    except OSError:
        log.exception("Nie udało się zapisać historii")
        print("! Nie udało się zapisać historii (szczegóły w slawa.log).")
        Path(tmp).unlink(missing_ok=True)


def archive_history() -> None:
    if HISTORY_FILE.exists():
        target = BASE_DIR / f"historia_{datetime.now():%Y%m%d-%H%M%S}.json"
        HISTORY_FILE.replace(target)
        print(f"Poprzednia rozmowa zapisana jako {target.name}.")


def image_block(path_str: str) -> dict:
    path = Path(path_str).expanduser()
    if not path.is_file():
        raise ValueError(f"Nie ma takiego pliku: {path}")
    media_type, _ = mimetypes.guess_type(path.name)
    if media_type not in IMAGE_TYPES:
        raise ValueError(f"Obsługiwane formaty to PNG, JPG, GIF i WEBP, a ten plik to {media_type or 'nieznany typ'}.")
    size = path.stat().st_size
    if size > MAX_IMAGE_BYTES:
        raise ValueError(f"Plik ma {size / 1024 / 1024:.1f} MB, a limit to 5 MB. Zmniejsz go albo przytnij zrzut.")
    data = base64.standard_b64encode(path.read_bytes()).decode("ascii")
    return {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": data}}


def read_user_input() -> str | None:
    """Czyta jedną wiadomość. Zwraca None przy Ctrl+D."""
    try:
        line = input("\nTy: ")
    except (EOFError, KeyboardInterrupt):
        return None
    if line.strip() != '"""':
        return line
    lines = []
    print('(tryb wielowierszowy, zakończ linią z samym """)')
    while True:
        try:
            nxt = input()
        except EOFError:
            break
        if nxt.strip() == '"""':
            break
        lines.append(nxt)
    return "\n".join(lines)


class Usage:
    def __init__(self) -> None:
        self.input = self.output = self.cache_write = self.cache_read = 0

    def add(self, usage) -> None:
        self.input += usage.input_tokens or 0
        self.output += usage.output_tokens or 0
        self.cache_write += getattr(usage, "cache_creation_input_tokens", 0) or 0
        self.cache_read += getattr(usage, "cache_read_input_tokens", 0) or 0

    def report(self) -> str:
        text = (
            f"Tokeny w tej sesji: wejście {self.input}, wyjście {self.output}, "
            f"zapis do cache {self.cache_write}, odczyt z cache {self.cache_read}."
        )
        price = PRICES.get(MODEL)
        if price:
            cost = (
                self.input * price["input"]
                + self.output * price["output"]
                + self.cache_write * price["cache_write"]
                + self.cache_read * price["cache_read"]
            ) / 1_000_000
            text += f"\nSzacunkowy koszt: ok. ${cost:.3f} (orientacyjnie, faktyczne rozliczenie jest w konsoli Anthropic)."
        return text


def ask_claude(client: anthropic.Anthropic, system: str, history: list[dict], usage: Usage) -> str | None:
    """Wysyła rozmowę i strumieniuje odpowiedź. Zwraca tekst odpowiedzi albo None, jeśli wymiana się nie udała."""
    print("\nSława: ", end="", flush=True)
    with client.beta.messages.stream(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        # Jeden stały punkt cache na prompcie systemowym, a automatyczny cache obejmuje rosnącą rozmowę.
        system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
        cache_control={"type": "ephemeral"},
        messages=history,
        thinking={"type": "adaptive"},
        output_config={"effort": EFFORT},
        betas=[FALLBACK_BETA],
        fallbacks="default",
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)
        final = stream.get_final_message()
    print()

    usage.add(final.usage)
    log.info(
        "message_id=%s model=%s stop=%s in=%s out=%s cache_r=%s",
        final.id, final.model, final.stop_reason, final.usage.input_tokens,
        final.usage.output_tokens, getattr(final.usage, "cache_read_input_tokens", None),
    )
    if final.model != MODEL:
        print(f"(odpowiedź wygenerował model zapasowy: {final.model})")

    if final.stop_reason == "refusal":
        details = getattr(final, "stop_details", None)
        reason = getattr(details, "explanation", None) if details else None
        print(f"\n! Model odmówił odpowiedzi{': ' + reason if reason else ''}. Spróbuj inaczej sformułować pytanie.")
        return None

    answer = "".join(block.text for block in final.content if block.type == "text").strip()
    if not answer:
        print("! Pusta odpowiedź. Spróbuj jeszcze raz.")
        return None
    if final.stop_reason == "max_tokens":
        print("\n! Odpowiedź została ucięta (limit długości). Napisz „dokończ”, żeby kontynuować.")
    return answer


def main() -> None:
    setup_logging()
    if not os.environ.get("ANTHROPIC_API_KEY") and not os.environ.get("ANTHROPIC_AUTH_TOKEN"):
        sys.exit(
            "Brak klucza API. Ustaw go w terminalu, a nie w kodzie:\n"
            "  export ANTHROPIC_API_KEY=...   (Linux/macOS)\n"
            "  setx ANTHROPIC_API_KEY ...     (Windows, potem nowe okno terminala)"
        )

    client = anthropic.Anthropic()
    system = build_system_prompt()
    history = load_history()
    usage = Usage()

    print("Sława, szczery doradca od wzrostu dla @pysiex_. Wpisz /pomoc, żeby zobaczyć komendy.")
    if history:
        print(f"(kontynuuję rozmowę: {len(history)} wiadomości w historii; /nowa zaczyna od zera)")
    else:
        print("Nowa rozmowa. Zacznij od „cześć” albo od razu wklej statystyki.")

    while True:
        raw = read_user_input()
        if raw is None:
            print()
            break
        text = raw.strip()
        if not text:
            continue

        cmd = text.split(maxsplit=1)[0].lower()
        if cmd in ("/wyjscie", "/wyjście", "/exit", "/quit"):
            break
        if cmd == "/pomoc":
            print(HELP)
            continue
        if cmd == "/koszt":
            print(usage.report())
            continue
        if cmd == "/nowa":
            archive_history()
            history = []
            print("Nowa rozmowa.")
            continue

        if cmd == "/obraz":
            try:
                parts = shlex.split(text)
            except ValueError as e:
                print(f"! Nie rozumiem ścieżki ({e}). Ścieżkę ze spacjami weź w cudzysłów.")
                continue
            if len(parts) < 2:
                print("! Użycie: /obraz <plik> [pytanie]")
                continue
            try:
                block = image_block(parts[1])
            except (ValueError, OSError) as e:
                print(f"! {e}")
                continue
            question = " ".join(parts[2:]) or "Przeanalizuj ten zrzut ekranu w kontekście mojego kanału."
            content: str | list = [block, {"type": "text", "text": question}]
        else:
            content = text

        history.append({"role": "user", "content": content})
        try:
            answer = ask_claude(client, system, history, usage)
        except KeyboardInterrupt:
            print("\n(przerwano, ta wiadomość nie trafiła do historii)")
            answer = None
        except anthropic.AuthenticationError:
            log.exception("Błąd uwierzytelnienia")
            sys.exit("\n! Klucz API jest nieprawidłowy. Sprawdź ANTHROPIC_API_KEY.")
        except anthropic.PermissionDeniedError as e:
            log.exception("Brak uprawnień")
            print(f"\n! Klucz nie ma dostępu do tej funkcji lub modelu: {e.message}")
            answer = None
        except anthropic.NotFoundError as e:
            log.exception("Nie znaleziono modelu/endpointu")
            print(f"\n! Nie znaleziono modelu {MODEL}: {e.message}")
            answer = None
        except anthropic.BadRequestError as e:
            log.exception("Błędne zapytanie")
            print(f"\n! API odrzuciło zapytanie: {e.message}")
            answer = None
        except anthropic.RateLimitError:
            log.exception("Limit zapytań")
            print("\n! Przekroczony limit zapytań. Odczekaj minutę i spróbuj ponownie.")
            answer = None
        except anthropic.APIStatusError as e:
            log.exception("Błąd API")
            print(f"\n! Błąd po stronie API ({e.status_code}). Spróbuj za chwilę.")
            answer = None
        except anthropic.APIConnectionError:
            log.exception("Błąd połączenia")
            print("\n! Brak połączenia z API. Sprawdź internet.")
            answer = None

        if answer is None:
            history.pop()  # historia musi naprzemiennie zawierać wiadomości użytkownika i bota
            continue
        history.append({"role": "assistant", "content": answer})
        save_history(history)

    if usage.input or usage.output:
        print(usage.report())
    print("Do następnego.")


if __name__ == "__main__":
    main()
