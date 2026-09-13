"""Final human-readable performance report generation."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from .config import AgentConfig
from .models import Trade
from .portfolio import Portfolio


def _fmt_usd(v: float) -> str:
    return f"${v:,.2f}"


def _fmt_pln(v: float, rate: float) -> str:
    return f"{v * rate:,.2f} PLN"


def build_report_markdown(config: AgentConfig, portfolio: Portfolio) -> str:
    trades = portfolio.trade_history
    n_trades = len(trades)
    wins = [t for t in trades if t.pnl_usd > 0]
    losses = [t for t in trades if t.pnl_usd <= 0]
    win_rate = portfolio.win_rate()
    realized_pnl = portfolio.realized_pnl_usd()
    ending_bankroll = portfolio.bankroll_usd
    starting_bankroll = portfolio.starting_bankroll_usd
    total_return_pct = (
        (ending_bankroll - starting_bankroll) / starting_bankroll * 100 if starting_bankroll else 0.0
    )

    best_trade = max(trades, key=lambda t: t.pnl_usd) if trades else None
    worst_trade = min(trades, key=lambda t: t.pnl_usd) if trades else None

    lines: list[str] = []
    lines.append("# Raport koncowy agenta -- Polymarket paper trading")
    lines.append("")
    lines.append(f"Wygenerowano: {datetime.now(timezone.utc).isoformat()}")
    lines.append(f"Start runu: {portfolio.created_at_iso}")
    lines.append(f"Cykli wykonanych: {portfolio.cycles_completed}")
    lines.append("")
    lines.append("## Kapital")
    lines.append("")
    lines.append(
        f"- Startowy: {_fmt_usd(starting_bankroll)} (~{_fmt_pln(starting_bankroll, config.usd_pln_rate)}, "
        f"kurs zalozony {config.usd_pln_rate:.2f} PLN/USD -- STALY, nie live)"
    )
    lines.append(
        f"- Koncowy: {_fmt_usd(ending_bankroll)} (~{_fmt_pln(ending_bankroll, config.usd_pln_rate)})"
    )
    lines.append(f"- Wynik: {_fmt_usd(ending_bankroll - starting_bankroll)} ({total_return_pct:+.1f}%)")
    lines.append("")
    lines.append("## Statystyki transakcji")
    lines.append("")
    lines.append(f"- Liczba zamknietych transakcji: {n_trades}")
    lines.append(f"- Win rate: {win_rate * 100:.1f}% ({len(wins)} wygranych / {len(losses)} przegranych)")
    lines.append(f"- Zrealizowany P&L: {_fmt_usd(realized_pnl)}")
    if trades:
        avg_pnl = realized_pnl / n_trades
        lines.append(f"- Sredni P&L na transakcje: {_fmt_usd(avg_pnl)}")
    if best_trade:
        lines.append(
            f"- Najlepsza transakcja: {_fmt_usd(best_trade.pnl_usd)} ({best_trade.pnl_pct*100:+.1f}%) "
            f"-- \"{best_trade.question}\" [{best_trade.outcome_name}]"
        )
    if worst_trade:
        lines.append(
            f"- Najgorsza transakcja: {_fmt_usd(worst_trade.pnl_usd)} ({worst_trade.pnl_pct*100:+.1f}%) "
            f"-- \"{worst_trade.question}\" [{worst_trade.outcome_name}]"
        )
    lines.append("")
    lines.append("## Otwarte pozycje na koniec runu")
    lines.append("")
    if portfolio.open_positions:
        for p in portfolio.open_positions.values():
            lines.append(
                f"- {p.question} [{p.outcome_name}] -- {p.shares:.2f} udzialow @ {p.entry_price:.3f}, "
                f"koszt {_fmt_usd(p.cost_usd)}"
            )
    else:
        lines.append("(brak -- wszystkie pozycje zostaly zamkniete na koniec runu)")
    lines.append("")
    lines.append("## Historia transakcji")
    lines.append("")
    if trades:
        lines.append("| # | Pytanie | Wynik | Strona | Wejscie | Wyjscie | Kwota | P&L | P&L% | Powod zamkniecia |")
        lines.append("|---|---|---|---|---|---|---|---|---|---|")
        for i, t in enumerate(trades, 1):
            lines.append(
                f"| {i} | {t.question[:50]} | {t.outcome_name} | {t.side.value} | "
                f"{t.entry_price:.3f} | {t.exit_price:.3f} | {_fmt_usd(t.cost_usd)} | "
                f"{_fmt_usd(t.pnl_usd)} | {t.pnl_pct*100:+.1f}% | {t.close_reason} |"
            )
    else:
        lines.append("(brak zamknietych transakcji)")
    lines.append("")
    lines.append("## Zastrzezenia")
    lines.append("")
    lines.append(
        "- To jest symulacja papierowa (paper trading). Zadne prawdziwe srodki nie zostaly uzyte."
    )
    lines.append(
        "- 'Fair value' to heurystyka (cena rynkowa + korekta sentymentu/spojnosci), nie zweryfikowana "
        "przewaga informacyjna -- patrz agent/fair_value.py."
    )
    lines.append(
        f"- Kurs USD/PLN ({config.usd_pln_rate:.2f}) jest stalym zalozeniem konfiguracyjnym, nie danymi live."
    )
    lines.append("")

    return "\n".join(lines)


def generate_report(config: AgentConfig, portfolio: Portfolio) -> str:
    report_md = build_report_markdown(config, portfolio)
    config.ensure_dirs()
    with open(config.report_file, "w", encoding="utf-8") as f:
        f.write(report_md)
    return report_md
