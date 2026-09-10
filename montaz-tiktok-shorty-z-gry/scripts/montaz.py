#!/usr/bin/env python3
"""Orkiestrator pipeline'u montażu — SZKIELET, nie w pełni działający.

Zgodnie z docs/STACK-DARMOWY-v2.md (obowiązująca architektura, wygrywa nad
starszym docs/BRIEF-MONTAZ-TIKTOK.md tam, gdzie się różnią):

    1. auto-editor   -> wykrywa cięcia (audio + motion), eksportuje timeline do Resolve
    2. Resolve MCP   -> Claude układa timeline, zoom punche, tekst, tranzycje, grade
    3. faster-whisper -> napisy PL, word-level, jako ASS (albo transkrypcja przez MCP)
    4. Resolve MCP   -> render czysty, 1080x1920, H.264/H.265

Kroki oznaczone "# WYMAGA RESOLVE MCP" NIE są zaimplementowane i NIE próbują się
łączyć z niczym — to zaślepki (raise NotImplementedError), bo Resolve MCP wymaga
realnie działającego DaVinci Resolve, którego nie ma w środowisku, w którym ten
plik został napisany (headless Linux, sesja chmurowa). Uzupełnij je w sesji, która
faktycznie ma dostęp do Resolve.

Kroki oznaczone "# DZIAŁA TUTAJ" są w pełni funkcjonalne headless, bez Resolve/GPU.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent


def probe(input_path: str) -> dict:
    """# DZIAŁA TUTAJ — ffprobe: rozdzielczość, fps, czy jest ścieżka audio."""
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-print_format", "json",
        "-show_format", "-show_streams", input_path,
    ])
    return json.loads(out)


def detect_cuts(input_path: str, edit_expr: str = "(or audio:0.03 motion:0.06)") -> dict:
    """# DZIAŁA TUTAJ — auto-editor wykrywa cięcia. Domyślny edit_expr wybrany na
    podstawie docs/TESTY-AUTO-EDITOR.md: kombinacja audio+motion jako jedyna
    poprawnie łapie zarówno ciche-ale-ruchome, jak i głośne-ale-statyczne fragmenty
    (realny scenariusz gier singleplayer bez kill-feedu i bez komentarza).

    Zwraca surowe statystyki z --preview. Właściwe cięcie i eksport do Resolve
    robi export_to_resolve() niżej, po akceptacji planu przez użytkownika."""
    cmd = ["auto-editor", input_path, "--edit", edit_expr, "--preview"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}


def print_edit_plan(cuts: dict) -> None:
    """# DZIAŁA TUTAJ (częściowo) — wypisuje plan cięć tekstem przed renderem.

    ZASADA 1 z brief.u: żaden render nie startuje bez pokazania planu i uzyskania OK.
    TODO: auto-editor --preview daje agregaty (ile sekund/klipów), nie listę
    (timestamp, powód) per cięcie jak w formacie z computerlovetech/video-edit-cli
    (docs/BRIEF-MONTAZ-TIKTOK.md §2.3). Żeby dostać realną listę z `reason`, trzeba
    albo sparsować --export json / clip-sequence i zrekonstruować granice (jak w
    docs/TESTY-AUTO-EDITOR.md), albo przyjąć wzorzec JSON tamtego narzędzia bez
    instalowania go samego (świadoma decyzja z docs/ODRZUCONE.md)."""
    print(cuts["stdout"])
    print("^ To są zagregowane statystyki auto-editor, NIE lista (timestamp, powód).")
    print("Rozbuduj tę funkcję o realny per-cięcie 'reason' przed użyciem w KROKU 3.")


def export_to_resolve(input_path: str, edit_expr: str) -> str:
    """# DZIAŁA TUTAJ (most, nie wymaga MCP) — auto-editor eksportuje natywnie
    timeline do formatu, który DaVinci Resolve umie zaimportować. To jest KROK C
    z briefu — most auto-editor -> Resolve, bez pisania kleju."""
    output_path = str(PROJECT_ROOT / "work" / "timeline_resolve.fcpxml")
    cmd = ["auto-editor", input_path, "--edit", edit_expr, "--export", "resolve"]
    subprocess.run(cmd, check=True)
    return output_path


def arrange_in_resolve(timeline_path: str) -> None:
    """# WYMAGA RESOLVE MCP — dokłada zoom punche, tekst (hook w górnej 1/3 przez
    pierwsze 2s), tranzycje, color grade przez hiteshK03/davinci-resolve-mcp.

    NIE WOLNO używać efektów Studio-only (ResolveFX) — nakładają znak wodny na
    darmowej edycji (docs/STACK-DARMOWY-v2.md §1). Sprawdź listę dostępnych narzędzi
    w docs/WERYFIKACJA-MCP.md PRZED wywołaniem czegokolwiek tutaj."""
    raise NotImplementedError(
        "Wymaga działającego DaVinci Resolve + mostu CursorBridge.py uruchomionego "
        "przez Workspace > Scripts wewnątrz Resolve. Zobacz docs/WERYFIKACJA-MCP.md."
    )


def add_captions_pl(input_path: str) -> str:
    """# WYMAGA GPU/SIECI BEZ BLOKADY — faster-whisper, model WIELOJĘZYCZNY
    (nie .en!), word-level, wyjście jako ASS/libass. patrz presets/napisy-pl.json.

    W sesji chmurowej pobranie wag modelu kończy się 403 z proxy (potwierdzone).
    Uruchom w środowisku z pełnym dostępem do internetu / lokalnie."""
    raise NotImplementedError(
        "Zablokowane w tej sesji (sieć). Test z presets/napisy-pl.json w środowisku "
        "z dostępem do huggingface.co / normalnym internetem."
    )


def beat_sync(video_path: str, music_path: str) -> None:
    """# WYMAGA RESOLVE MCP (unofficial-davinci-mcp) LUB BeatSync-Engine
    — siatka beatów, EBU R128 loudness do -14 LUFS, cięcia zależne od energii.
    Patrz docs/WERYFIKACJA-MCP.md sekcja o dry_run — NIGDY nie ustawiaj confirm=true
    bez wyraźnej zgody użytkownika, to jest zasada bezpieczeństwa z brief.u."""
    raise NotImplementedError("Wymaga unofficial-davinci-mcp lub BeatSync-Engine — nie tutaj.")


def add_hook(video_path: str) -> None:
    """# WYMAGA RESOLVE MCP (Text+) LUB Remotion — hook w górnej 1/3 kadru przez
    pierwsze 2 sekundy. Zero-instalacyjny fallback: Resolve Text+ (STACK-DARMOWY-v2.md).
    Cięższa alternatywa: Remotion (npx skills add remotion) — osobny projekt Node/React."""
    raise NotImplementedError("Wymaga Resolve MCP albo projektu Remotion — nie zaimplementowane.")


def master_and_render(video_path: str) -> str:
    """# WYMAGA RESOLVE — render czysty 1080x1920, -14 LUFS, H.264/H.265.
    Fallback bez Resolve: ffmpeg loudnorm (mniej dokładny niż EBU R128 z
    unofficial-davinci-mcp, ale działa wszędzie, w tym tutaj)."""
    raise NotImplementedError(
        "Docelowo render w Resolve. Fallback ffmpeg loudnorm nie napisany — "
        "dopisz go tutaj, jeśli chcesz mieć w pełni headless awaryjną ścieżkę."
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input")
    parser.add_argument("--music", default=None)
    parser.add_argument("--edit", default="(or audio:0.03 motion:0.06)")
    parser.add_argument("--yes", action="store_true", help="pomiń pytanie o akceptację planu cięć (NIE używać bez świadomej decyzji — zasada 1 z briefu)")
    args = parser.parse_args()

    print("1/9 probe...")
    info = probe(args.input)
    print(json.dumps(info["format"], indent=2, ensure_ascii=False))

    print("2/9 detect_cuts...")
    cuts = detect_cuts(args.input, args.edit)
    print_edit_plan(cuts)

    if not args.yes:
        print("\nSTOP — zaakceptuj plan cięć powyżej zanim pipeline pójdzie dalej "
              "(zasada 1 z brief.u). Uruchom ponownie z --yes po akceptacji.")
        return 0

    print("3/9 export_to_resolve...")
    timeline = export_to_resolve(args.input, args.edit)
    print(f"Timeline zapisany: {timeline} — zaimportuj ręcznie do Resolve.")

    print("Kroki 4-9 (arrange_in_resolve, add_captions_pl, beat_sync, add_hook, "
          "master_and_render) wymagają Resolve MCP i/lub sieci bez blokady — "
          "NIEZAIMPLEMENTOWANE w tej sesji. Zobacz docstringi funkcji wyżej.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
