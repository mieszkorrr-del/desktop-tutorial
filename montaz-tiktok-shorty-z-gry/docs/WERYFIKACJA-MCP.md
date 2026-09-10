# Weryfikacja MCP do DaVinci Resolve — SZABLON DO WYPEŁNIENIA LOKALNIE

Ten dokument jest **pusty celowo**. Nie da się go wypełnić z sesji chmurowej — wymaga
realnie uruchomionego DaVinci Resolve (GUI) na maszynie z Windowsem/macOS/Linuksem
desktopowym, most `CursorBridge.py` uruchomiony przez `Workspace → Scripts` wewnątrz
Resolve, i serwera MCP spiętego z lokalną sesją Claude Code.

Wypełnij po podłączeniu `github.com/hiteshK03/davinci-resolve-mcp` w lokalnej sesji.

## Sprzeczność do rozstrzygnięcia

- Opis repozytorium (krótki, na stronie GitHub): **44 narzędzia**
- Treść README: **155 z 162** działających na darmowej edycji Resolve

Nie wiadomo, która liczba jest aktualna — **policz empirycznie**, nie wybieraj na wiarę.

## Metodologia (wypełnij faktycznym przebiegiem)

- [ ] Wersja DaVinci Resolve zainstalowana: `_____` (Free / Studio, numer wersji)
- [ ] Wersja `davinci-resolve-mcp` / commit hash: `_____`
- [ ] Data testu: `_____`
- [ ] Sposób liczenia: `_____` (np. wywołanie każdego narzędzia z listy MCP po kolei,
      albo `list_tools` z klienta MCP)

## Wynik

| # | Nazwa narzędzia MCP | Działa na Free? (tak/nie) | Błąd (jeśli nie działa) | Kategoria (Neural Engine / inne) |
|---|---|---|---|---|
| 1 | | | | |
| ... | | | | |

**Podsumowanie:**
- Liczba deklarowana (repo/README): 44 vs 155 (do potwierdzenia które źródło było aktualne)
- Liczba realnie działająca na Free: `_____`
- Liczba niedziałająca: `_____`, z czego deklarowanych jako "wymaga Neural Engine/Studio": `_____`
- Czy dla niedziałających narzędzi autor rzeczywiście dostarczył darmowy zamiennik CPU,
  jak deklaruje README?: `_____`

## Test równoległego działania z `unofficial-davinci-mcp` (KROK 5 briefu)

Zakładamy domyślnie, że `davinci-resolve-mcp` i `unofficial-davinci-mcp` **nie mogą**
działać jednocześnie (obydwa mogą chcieć wyłącznego połączenia z Resolve), dopóki nie
udowodni się inaczej.

- [ ] Test: uruchom oba serwery MCP jednocześnie, wykonaj operację przez każdy z nich
      na tym samym otwartym projekcie Resolve.
- [ ] Wynik: `_____` (działa bez konfliktu / konflikt — opisz błąd)

## Decyzja

Jeśli liczba realnie działających narzędzi jest **znacząco niższa niż 155** — STOP
zanim zbuduje się na tym pipeline (zgodnie z instrukcją w brief.ie) i zgłoś to przed
kontynuacją KROKU C.
