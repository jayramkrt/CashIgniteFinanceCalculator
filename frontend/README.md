# EMI Calculator – React Frontend

A clean financial dashboard built with React 18 + TypeScript + Vite.

---

## Design

**Aesthetic**: Warm editorial — ink/parchment palette, Syne display font, 'Inter', sans-serif body, DM Mono numbers.  
All monetary values use Indian locale (`en-IN`) formatting (₹12,34,567).  
Framer Motion for entry animations. Recharts for data visualisation.

---

## Project Structure

```
src/
├── api/
│   └── index.ts           # Axios client, loanApi, scenarioApi
├── components/
│   ├── layout/
│   │   └── Layout.tsx     # Top nav + page shell
│   ├── modules/
│   │   ├── BaseLoanForm.tsx        # Sliders + date picker
│   │   └── FeatureModules.tsx      # 5 feature toggle sections
│   ├── output/
│   │   ├── SummaryPanel.tsx        # EMI + metrics + donut ring
│   │   ├── Charts.tsx              # Pie + line + balance charts
│   │   └── AmortizationTable.tsx   # Year rows → expandable months
│   └── ui/
│       └── index.tsx      # Toggle, SliderField, NumberInput, Select,
│                          # DateInput, TableGrid, ModuleSection
├── hooks/
│   └── useCalculation.ts  # useLiveEmi (debounced slider preview)
├── pages/
│   ├── CalculatorPage.tsx # Main two-column layout
│   ├── StatisticsPage.tsx # Full-width charts + table
│   └── HistoryPage.tsx    # Paginated saved scenarios
├── stores/
│   └── loanStore.ts       # Zustand store (loan state + features + result)
├── types/
│   └── index.ts           # All DTOs mirroring backend types
└── utils/
    └── index.ts           # formatRupees, formatTenure, buildRequest, cn
```

---

## Quick Start

### Dev (requires backend on :8080)
```bash
npm install
npm run dev        # http://localhost:5173
```

### Docker (full-stack)
```bash
# From repo root
docker-compose -f emi-calculator-frontend/docker-compose.fullstack.yml up --build
# App at http://localhost:3000
```

---

## State Architecture

```
Zustand loanStore
  ├── loan          { amount, rate, tenure, firstEmiDate }
  ├── prepayment    { enabled, entries[] }
  ├── variableRate  { enabled, entries[] }
  ├── isa           { enabled, entries[] }
  ├── moratorium    { enabled, config }
  ├── fees          { enabled, entries[] }
  └── result        CalculationResultDTO | null
```

`buildRequest(state)` in `utils/index.ts` converts the store into the `LoanRequestDTO` the backend expects — it only includes enabled feature arrays.

---

## Key Component Decisions

| Component | Why |
|-----------|-----|
| `TableGrid<T>` | Generic reusable table with typed columns — all 4 feature tables use it |
| `ModuleSection` | Wraps every feature in a consistent toggle-expand card |
| `SliderField` | Dual-mode: slider + numeric input keep in sync |
| `SummaryPanel` | Sticky in XL viewport so it stays visible as you scroll inputs |
| `AmortizationTable` | Year rows expand inline (no modals) — keeps context |
| `useLiveEmi` | 300ms debounce calls GET /api/loan/emi for instant slider feedback |

---

## API Contract (frontend side)

All requests go through `/api` which Vite proxies to `:8080` in dev, and Nginx proxies in prod.

```
POST /api/loan/calculate  → CalculationResultDTO
GET  /api/loan/emi        → { value: number }
POST /api/scenarios       → 201 Created
GET  /api/scenarios       → Page<ScenarioSummaryDTO>
GET  /api/scenarios/:id/calculate → CalculationResultDTO
```

Backend BigDecimal values are serialised as strings — the Axios interceptor in `api/index.ts` converts them back to JS numbers automatically.

---

## Customisation

- **Colours**: Edit `tailwind.config.js` → `theme.extend.colors`
- **Fonts**: Change Google Fonts link in `index.html` + update `fontFamily` in Tailwind config
- **Loan defaults**: Edit `defaultLoan` in `stores/loanStore.ts`
- **Slider ranges**: Edit `min`/`max` props in `BaseLoanForm.tsx`
