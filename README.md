# Statement Reader

A local-first earnings dashboard for bank statement exports. Drop in a Revolut CSV and see how much
you earned per month and per year — everything runs in your browser, nothing is uploaded.

## Features

- **Earnings dashboard** — hero chart (cumulative or by-month, with hover-to-highlight), stat cards,
  a per-month/per-year heatmap, and monthly breakdown bars.
- **Who paid you** — searchable sender list; include/exclude any payer to refine totals.
- **Details drill-down** — open any year to inspect its transactions, grouped by payer, with
  this-year / global exclusion toggles.
- **By type** — every transaction grouped by type, in and out.
- **Tax (LT)** — a Lithuanian individual-activity (pažyma) estimate: flat expenses, GPM, and Sodra
  (VSD + PSD).
- **Filters** — switch currency, filter by year, and choose which transaction types count as
  earnings. Exclusions persist in `localStorage`.

## Tech

- [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [PapaParse](https://www.papaparse.com) for CSV parsing
- [Bun](https://bun.sh) for tooling

## Getting started

```sh
bun install
bun dev          # http://localhost:3000
```

## Scripts

```sh
bun dev          # start the dev server
bun run build    # production build
bun start        # serve the production build
bun run typecheck
```

## How it works

Statements are parsed entirely in the browser. "Earnings" are completed incoming transactions,
excluding top-ups and card refunds by default. Toggle types, payers, currency, and year to adjust
what counts. No data ever leaves your device.
