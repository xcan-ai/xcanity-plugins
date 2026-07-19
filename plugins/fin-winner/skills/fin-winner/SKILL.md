---
name: fin-winner
description: Use the Fin Winner MCP tools to manage watchlists, stock thoughts, valuations, insights, ticker strategies, and analysis reports when the user asks to read or change their Fin Winner investment records.
---

# Fin Winner

Use the Fin Winner MCP tools instead of invoking `fin-winner-cli`.

## Workflow

1. Use `list_fin_records` or `get_fin_record` to resolve IDs and current state.
2. For writes, summarize the intended resource and important fields. Obtain explicit confirmation before deleting and whenever write intent is ambiguous.
3. Use `create_fin_record`, `update_fin_record`, or `delete_fin_record` once intent is clear.
4. Use `publish_analysis_report` for complete HTML or Markdown reports. Use `get_analysis_report_download` for stored report content.
5. Return the authoritative result from fin-api; never claim a write succeeded after an error result.

## Resources

- `my-ticker`: watchlist and holding markers; filter by `category` (`watch` or `hold`).
- `stock-thought`: ticker notes and research thoughts; filter by `ticker` or `content_type`.
- `ticker-valuation`: valuation records; filter by `ticker` or `method`.
- `ticker-insight`: forward-looking drivers and catalysts; filter by `ticker`.
- `ticker-strategy`: trading plans and rules; filter by `ticker`, `status`, or `type`.
- `analysis-report`: uploaded report metadata; filter by `ticker` or `format`.

Only documented filters are sent to fin-api. Paged resources accept `skip` and `limit`.
