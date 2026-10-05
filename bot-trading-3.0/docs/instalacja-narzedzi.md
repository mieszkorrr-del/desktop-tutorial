# Instalacja 4 narzędzi do Claude Code w projekcie BOT TRADING 3.0

Projekt leży w `C:\BOT TRADING 3.0`. Ścieżka ma spacje, więc zawsze bierz ją w cudzysłów.
Instaluj po jednym narzędziu i po każdym popracuj chwilę normalnie.

Stan na 2026-10-05, sprawdzone w repozytoriach źródłowych. Wersje i flagi się zmieniają,
więc to, co jest oznaczone jako *do sprawdzenia*, zweryfikuj u siebie.

## 0. Wymagania

```powershell
node -v            # claude-mem: >= 20; OmniRoute 3.8.x: 22.22.2+ (ale nie 23.x) albo 24-26
claude --version
git --version      # "git -v" działa dopiero w nowszych wersjach Gita
```

Komendy zaczynające się od `/` wpisujesz **w sesji Claude Code**, nie w PowerShellu.
Każda z nich ma odpowiednik CLI, który działa z PowerShella: `claude plugin ...`
(sprawdzone w Claude Code 2.1.x; w starszej wersji uruchom `claude plugin --help`).

## 1. claude-code-setup (oficjalny plugin Anthropic)

Ryzyko: brak. Plugin zawiera jeden skill (`claude-automation-recommender`), który tylko czyta pliki.

W sesji:
```
/plugin install claude-code-setup@claude-plugins-official
```
albo z PowerShella:
```powershell
cd "C:\BOT TRADING 3.0"
claude plugin install claude-code-setup@claude-plugins-official
```
Jeśli marketplace nie istnieje: `claude plugin marketplace add anthropics/claude-plugins-official`.

Test: w sesji napisz „zaproponuj automatyzacje dla tego projektu”. Każdy zaproponowany hook
czytaj przed wdrożeniem, bo hook to kod odpalany automatycznie.

Odinstalowanie: `claude plugin uninstall claude-code-setup@claude-plugins-official`

## 2. task-observer (skill)

Ryzyko: niskie. Skill zapisuje własne pliki do workspace, czyli tutaj do katalogu projektu:
`skill-observations\` (log obserwacji) i `skill-updates\` (proponowane zmiany skilli).
Twoich skilli sam nie zmienia.

**Poprawka względem pierwotnej instrukcji:** repo `rebelytics/one-skill-to-rule-them-all`
nie ma podfolderu `task-observer`. Skillem jest katalog główny repo (`SKILL.md`,
`references\`, `scripts\`), więc `Copy-Item ...\task-observer` zwróci błąd „path not found”.

Wariant ręczny, instalacja do projektu (zalecany):
```powershell
cd "$env:USERPROFILE\Downloads"
git clone https://github.com/rebelytics/one-skill-to-rule-them-all
# przejrzyj SKILL.md oraz scripts\ (migrate-log.py, validate-skill-bundle.py, new-observation.sh)
$dst = "C:\BOT TRADING 3.0\.claude\skills\task-observer"
New-Item -ItemType Directory -Force $dst | Out-Null
Copy-Item ".\one-skill-to-rule-them-all\SKILL.md" $dst
Copy-Item -Recurse ".\one-skill-to-rule-them-all\references" $dst
Copy-Item -Recurse ".\one-skill-to-rule-them-all\scripts" $dst
```

Wariant CLI (instaluje do `.claude\skills` w bieżącym katalogu):
```powershell
cd "C:\BOT TRADING 3.0"
npx -y skills add rebelytics/one-skill-to-rule-them-all --skill task-observer
```
Flaga `--agent claude-code` z pierwotnej instrukcji nie występuje w README autora (*do sprawdzenia*).

**Aktywacja.** Jednolinijkowiec w stylu „na początku każdej dłuższej sesji” autor odradza,
bo model uznaje krótkie sesje za „zbyt proste” i skill się nie odpala. Do `CLAUDE.md`
dopisz blok aktywacyjny z `references\environments.md` (sekcja „The activation block”).
Jego początek brzmi:

```text
Before the first tool call of any session — and before writing or
proposing a plan, not merely before executing one — invoke the
task-observer skill AND execute its Session Start Protocol (storage
check, frontmatter scan, review trigger). ...
```

Skopiuj cały blok z pliku, nie z tego skrótu.

Uwagi:
- `scripts\new-observation.sh` to skrypt bash. Na Windowsie Claude Code uruchamia go przez Git Bash.
- PowerShell 5.1 zapisuje UTF-8 z BOM-em i takie pliki obserwacji wypadają ze skanu. Nie edytuj ich przez `Set-Content` ani `Out-File`.
- Zdecyduj, czy `skill-observations/` i `skill-updates/` mają trafiać do gita. Jeśli nie, dopisz je do `.gitignore`.
- Test aktywacji robisz w **nowej** sesji. Po kilku sesjach musi istnieć `skill-observations\observation-log\`.

Odinstalowanie: usuń `.claude\skills\task-observer` i blok z `CLAUDE.md`.

## 3. claude-mem (pamięć między sesjami, hooki)

Ryzyko: średnie. Plugin rejestruje hooki `Setup`, `SessionStart`, `UserPromptSubmit`,
`PostToolUse` itd. (wszystkie z `"shell": "bash"`) i uruchamia w tle workera (Bun).

**Gdzie trafiają dane.** Pierwotna instrukcja mówi „lokalnie”, ale to zależy od konfiguracji:
- Instalator `npx claude-mem install` proponuje logowanie i hostowany „claude-mem observer”.
  Wtedy obserwacje są przetwarzane poza Twoim komputerem.
- Cloud Sync wysyła na serwer cmem.ai narracje obserwacji i **pełny tekst promptów**. Zostaw wyłączone.
- Domyślny dostawca `claude` (`CLAUDE_MEM_PROVIDER`) kompresuje obserwacje modelem Haiku
  (`CLAUDE_MEM_MODEL`) w ramach Twojego planu, więc zużywa limit planu.
- W marketplace jest też `claude-mem-cowork`, który streamuje użycie narzędzi do cmem.ai. Nie instaluj go.

Instalacja tylko dla tego projektu (`--scope local`, więc nie trafi do repo klientów):
```powershell
cd "C:\BOT TRADING 3.0"
$env:CLAUDE_MEM_ONLINE_OPTIN = "false"   # pomija logowanie do hostowanego observera
claude plugin marketplace add thedotmack/claude-mem
claude plugin install claude-mem@thedotmack --scope local
```
Potem zrestartuj Claude Code. Czy `CLAUDE_MEM_ONLINE_OPTIN` działa przy instalacji przez `/plugin`,
a nie przez `npx`, jest *do sprawdzenia*. README opisuje tę zmienną przy `npx`.
`npm install -g claude-mem` nie rejestruje hooków.

Dane i ustawienia: `%USERPROFILE%\.claude-mem\` (`settings.json`, baza, logi; katalog zmienia `CLAUDE_MEM_DATA_DIR`).

Zasada dla tego projektu: nie wklejaj do sesji kluczy API, loginów ani haseł brokera, bo trafią
do bazy pamięci. Fragmenty, których nie chcesz zapisywać, otaczaj tagami `<private>...</private>`.

Jeśli plugin blokuje prompty: `claude plugin disable claude-mem@thedotmack`. Wyłączenie ręczne
to wpis w `enabledPlugins` w pliku settings danego zakresu, przy `--scope local`
w `.claude\settings.local.json`: `"enabledPlugins": { "claude-mem@thedotmack": false }`.
Całkowite usunięcie: `claude plugin uninstall claude-mem@thedotmack`.

## 4. OmniRoute (bramka do innych modeli)

Ryzyko: najwyższe. Prompty i kod idą do dostawców, których nie wybierałeś. Świeża instalacja
ma wpięty bezkluczowy „OpenCode Free” w kombinacji `auto`.

**Nie podpinaj OmniRoute do `C:\BOT TRADING 3.0`.** Strategia to Twoja własność intelektualna,
a w katalogu będzie kiedyś `.env` z danymi brokera. Testuj w osobnym folderze, np. `C:\omniroute-test`.

```powershell
npm i -g omniroute      # ~550 MB po rozpakowaniu, ~27 tys. plików (wersja 3.8.51)
omniroute               # gateway + dashboard: http://localhost:20128, API: /v1
```

Test z PowerShella. Nie używaj `curl -d '{\"...\"}'`: w Windows PowerShell 5.1 `curl` to alias
`Invoke-WebRequest`, a cytowanie JSON-a różni się między PS 5.1 a 7.x.
```powershell
$body = @{ model = "auto"; messages = @(@{ role = "user"; content = "Hello!" }) } | ConvertTo-Json -Depth 5
Invoke-RestMethod -Method Post -Uri "http://localhost:20128/v1/chat/completions" -ContentType "application/json" -Body $body
```

Podpięcie Claude Code (najpierw `--dry-run`):
```powershell
cd "C:\omniroute-test"
omniroute run claude --model <dostawca>/<model> --dry-run
omniroute configure claude
```

Zasady:
- Nie włączaj MITM/TPROXY. Instaluje własny CA w magazynie zaufanych certyfikatów.
- Postinstall może wygenerować `.env`. Nie commituj go.
- Liczby z README (dostawcy, darmowe tokeny) to marketing, nie gwarancja.

Odinstalowanie: `npm uninstall -g omniroute` i usunięcie `%USERPROFILE%\.omniroute\` (konfiguracja i baza).

## Checklista

- [ ] `claude plugin list` pokazuje tylko `claude-code-setup` i (po kroku 3) `claude-mem`
- [ ] `.claude\skills\task-observer\` ma `SKILL.md`, `references\` i `scripts\`; blok aktywacyjny jest w `CLAUDE.md`
- [ ] claude-mem po restarcie nie blokuje promptów; Cloud Sync wyłączony; zainstalowany jako `--scope local`
- [ ] OmniRoute tylko w `C:\omniroute-test`, nigdy w `C:\BOT TRADING 3.0`
- [ ] `git status` w projekcie nie pokazuje `.env`, `data\` ani baz `.db`

Jeśli po którymś kroku coś działa dziwnie: wyłącz ostatnią zainstalowaną rzecz, zrestartuj i sprawdź ponownie.
