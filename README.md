# CashIgnite Finance Calculators

A privacy-first, frontend-only collection of financial calculators built with React, TypeScript, and Vite. All calculations and saved tax-plan data stay in the user's browser; no application server or external database is required.

## Features

- Home-loan EMI and amortization schedules
- One-time and recurring prepayments
- Variable interest rates
- Interest-saver/offset accounts
- Paid-interest and capitalised moratoriums
- Recurring and one-time fees
- Loan comparison
- Rent-versus-buy analysis
- Old-versus-new income-tax planning

## Architecture

- The loan engine runs locally in `frontend/src/utils/loanCalc.ts`.
- Monetary calculations use `decimal.js-light` with 34-digit precision and half-up rounding.
- Tax-plan records use IndexedDB. Existing records from the legacy `clearhomeemi_tax_plans` local-storage key are migrated automatically.
- Zustand persists calculator inputs only. Generated schedules and results are deliberately not stored.
- There are no HTTP API calls, backend services, database credentials, or server-side deployment steps.

## Development

Requires Node.js 18 or newer.

```bash
cd frontend
npm install
npm run dev
```

The application is available at `http://localhost:5173`.

## Verification

```bash
cd frontend
npm test -- --run
npm run build
```

## Deployment

Deploy `frontend/dist` to any static host. Vercel SPA rewrites and an Nginx configuration are included.

The retired Spring Boot/PostgreSQL implementation was removed after the calculation engine and required browser persistence were migrated to the frontend.
