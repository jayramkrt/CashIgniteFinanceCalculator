# CashIgnite Frontend

React 18 + TypeScript + Vite application. It is self-contained and does not require a backend.

## Commands

```bash
npm install
npm run dev
npm test -- --run
npm run build
```

## Important modules

- `src/utils/loanCalc.ts` — decimal-safe EMI and amortization engine
- `src/utils/loanCalc.test.ts` — loan calculation regression tests
- `src/utils/taxCalc.ts` — income-tax calculations
- `src/utils/rentVsBuyCalc.ts` — rent-versus-buy calculations
- `src/api/taxPlanApi.ts` — local IndexedDB tax-plan repository
- `src/stores/loanStore.ts` — calculator input and current in-memory result state

Loan inputs are retained in local storage for convenience. Calculation results are not persisted. Tax plans are stored in IndexedDB on the current browser and device.
