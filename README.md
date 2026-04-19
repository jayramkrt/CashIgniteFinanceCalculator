# ClearHomeEMI Calculator – Spring Boot Backend

Full-featured home loan EMI calculation engine supporting:
- Reducing balance EMI
- Prepayments (one-time and recurring, reduce term or reduce EMI)
- Variable interest rates
- Interest saver account (offset account)
- Moratorium period (interest-only or capitalised)
- Fees & charges (recurring or one-time)

---

## Project Structure

```
ClearHomeEMI/                               # Monorepo root
├── docker-compose.yml                      # Backend + Postgres (local dev)
│
├── backend/                                # Spring Boot application
│   ├── Dockerfile
│   ├── pom.xml                             # Maven build (groupId: com.clearhomeemi)
│   └── src/
│       ├── main/
│       │   ├── java/com/clearhomeemi/
│       │   │   ├── ClearHomeEmiApplication.java     # Entry point
│       │   │   │
│       │   │   ├── config/
│       │   │   │   ├── AppConfig.java               # CORS, Jackson, OpenAPI
│       │   │   │   ├── RateLimitFilter.java          # Per-IP rate limiting (Bucket4j, @Order 1)
│       │   │   │   └── SecurityHeadersFilter.java   # Security headers (CSP, HSTS, @Order 2)
│       │   │   │
│       │   │   ├── controller/
│       │   │   │   ├── LoanController.java           # POST /api/loan/calculate, GET /api/loan/emi
│       │   │   │   └── ScenarioController.java       # POST/GET /api/scenarios
│       │   │   │
│       │   │   ├── service/
│       │   │   │   ├── LoanCalculationService.java  # Orchestration + DTO mapping
│       │   │   │   └── ScenarioService.java          # History persistence
│       │   │   │
│       │   │   ├── engine/
│       │   │   │   ├── MonthlyScheduleBuilder.java  # Core month-by-month engine
│       │   │   │   ├── EventSorter.java              # Expands recurring events to month map
│       │   │   │   └── model/                        # Internal domain models (not serialised)
│       │   │   │       ├── CalculationResult.java
│       │   │   │       ├── EngineModels.java
│       │   │   │       ├── FeeEvent.java
│       │   │   │       ├── InterestChangeEvent.java
│       │   │   │       ├── IsaEvent.java
│       │   │   │       ├── LoanSummary.java
│       │   │   │       ├── MonthlyRow.java
│       │   │   │       ├── PrepaymentEvent.java
│       │   │   │       └── SortedEventMap.java
│       │   │   │
│       │   │   ├── dto/
│       │   │   │   ├── request/
│       │   │   │   │   ├── LoanRequestDTO.java       # Root request + Bean Validation
│       │   │   │   │   ├── PrepaymentDTO.java
│       │   │   │   │   ├── InterestChangeDTO.java
│       │   │   │   │   ├── InterestSaverDTO.java
│       │   │   │   │   ├── MoratoriumDTO.java
│       │   │   │   │   ├── FeeDTO.java
│       │   │   │   │   └── FeatureDTOs.java
│       │   │   │   └── response/
│       │   │   │       ├── CalculationResultDTO.java
│       │   │   │       ├── SummaryDTO.java
│       │   │   │       ├── MonthlyRowDTO.java
│       │   │   │       ├── YearlyRowDTO.java
│       │   │   │       ├── ResponseDTOs.java
│       │   │   │       └── ScenarioSummaryDTO.java
│       │   │   │
│       │   │   ├── entity/
│       │   │   │   └── LoanScenario.java             # JPA entity (JSONB feature blobs)
│       │   │   │
│       │   │   ├── repository/
│       │   │   │   └── LoanScenarioRepository.java
│       │   │   │
│       │   │   └── exception/
│       │   │       ├── GlobalExceptionHandler.java  # Validation + runtime error responses
│       │   │       └── LoanCalculationException.java
│       │   │
│       │   └── resources/
│       │       ├── application.properties           # Base config (Tomcat hardening, rate limits)
│       │       ├── application-dev.properties       # H2 in-memory, Flyway disabled
│       │       ├── application-prod.properties      # Env-var overrides (DB_URL, DB_USERNAME, ...)
│       │       └── db/migration/
│       │           └── V1__init_schema.sql          # Flyway migration (PostgreSQL)
│       │
│       └── test/java/com/clearhomeemi/
│           └── engine/
│               └── LoanCalculationEngineTest.java   # @ActiveProfiles("dev"), H2
│
└── frontend/                               # React + Vite application
    ├── Dockerfile
    ├── docker-compose.fullstack.yml        # Full-stack: frontend + backend + Postgres
    ├── nginx.conf
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── api/
        │   └── index.ts                    # Axios client + request/response interceptors
        ├── hooks/
        │   └── useCalculation.ts           # API call hook with loading/error state
        ├── stores/
        │   └── loanStore.ts                # Zustand global state
        ├── types/
        │   └── index.ts                    # Shared TypeScript types
        ├── utils/
        │   ├── index.ts                    # formatCurrency, sliderPct, constants
        │   └── buildRequest.ts             # Form state → API request mapper
        ├── components/
        │   ├── layout/
        │   │   └── Layout.tsx              # App shell, nav
        │   ├── ui/
        │   │   └── index.tsx               # Shared: Toggle, SliderField, NumberInput,
        │   │                               #   Select, DateInput, TableGrid, ModuleSection
        │   ├── modules/
        │   │   ├── BaseLoanForm.tsx         # Core loan inputs
        │   │   └── FeatureModules.tsx       # Prepayments, rates, ISA, moratorium, fees
        │   └── output/
        │       ├── SummaryPanel.tsx         # Key metrics cards
        │       ├── Charts.tsx               # Principal/interest bar + line charts
        │       └── AmortizationTable.tsx    # Monthly/yearly schedule table
        └── pages/
            ├── CalculatorPage.tsx
            ├── HistoryPage.tsx
            └── StatisticsPage.tsx
```

---

## Quick Start (local dev)

### Option A — H2 in-memory (zero setup)
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
- API:      http://localhost:8080
- Swagger:  http://localhost:8080/swagger-ui.html
- H2 console: http://localhost:8080/h2-console

### Option B — Docker Compose (Postgres)
```bash
docker-compose up --build
or
docker compose up --build
```

---

## API Reference

### POST /api/loan/calculate
Full calculation with optional advanced features.

**Minimal request:**
```json
{
  "loanAmount": 5000000,
  "annualInterestRate": 8.5,
  "tenureMonths": 240,
  "firstEmiDate": "2024-02-01"
}
```

**With prepayment:**
```json
{
  "loanAmount": 5000000,
  "annualInterestRate": 8.5,
  "tenureMonths": 240,
  "firstEmiDate": "2024-02-01",
  "prepayments": [
    {
      "paymentMode": "ONE_TIME",
      "effect": "REDUCE_TERM",
      "amount": 500000,
      "startingMonth": 12
    }
  ]
}
```

**With variable rate:**
```json
{
  "loanAmount": 5000000,
  "annualInterestRate": 8.5,
  "tenureMonths": 240,
  "firstEmiDate": "2024-02-01",
  "interestChanges": [
    {
      "newAnnualRate": 9.25,
      "startingMonth": 13,
      "effect": "CHANGE_LOAN_TERM"
    }
  ]
}
```

**With moratorium:**
```json
{
  "loanAmount": 5000000,
  "annualInterestRate": 8.5,
  "tenureMonths": 240,
  "firstEmiDate": "2024-02-01",
  "moratorium": {
    "durationMonths": 6,
    "payInterestDuringMoratorium": false
  }
}
```

**Payment mode values:** `ONE_TIME | MONTHLY | BI_MONTHLY | QUARTERLY | HALF_YEARLY | THRICE_YEARLY | YEARLY`

**Prepayment effect values:** `REDUCE_TERM | REDUCE_EMI`

**Interest change effect values:** `CHANGE_LOAN_TERM | REDUCE_EMI`

**ISA transaction type values:** `DEPOSIT | WITHDRAW`

---

### GET /api/loan/emi?amount=5000000&rate=8.5&tenureMonths=240
Returns EMI only (for live slider preview, no schedule generated).

---

### POST /api/scenarios?name=My+Home+Loan
Save a scenario. Returns `201 Created` with `Location` header.

### GET /api/scenarios?page=0&size=10
Paginated history list.

### GET /api/scenarios/{id}/calculate
Re-run full calculation for a saved scenario.

---

## Calculation Engine Notes

### Event processing order (per month)
1. Apply rate change (if any this month)
2. Handle moratorium (skip EMI or capitalise interest)
3. Calculate monthly interest on `principal − ISA balance`
4. Apply ISA deposits/withdrawals
5. Split EMI into principal + interest components
6. Apply prepayments (adjust principal, optionally recalculate EMI)
7. Add fees to total payment tracking

### Precision
- All monetary values: `BigDecimal` with `HALF_UP` rounding to 2 dp
- Intermediate rate calculations: 10 dp via `MathContext.DECIMAL128`
- Zero-interest loans: flat equal split

### Performance
- Typical 20-year loan: < 5ms
- 30-year loan with 50 prepayment events: < 200ms (tested)

---

## Running Tests
```bash
mvn test
```
Test coverage includes:
- EMI formula accuracy
- Schedule length and full principal repayment
- Prepayment REDUCE_TERM and REDUCE_EMI effects
- Rate change application
- Moratorium (interest payment and capitalisation)
- Interest saver account offset
- Fees accumulation
- Overlapping events in the same month
- Performance guard (50 events under 200ms)

---

## Environment Variables (prod)

| Variable       | Default                                        | Description          |
|----------------|------------------------------------------------|----------------------|
| `DB_URL`       | `jdbc:postgresql://localhost:5432/clearhomeemidb` | PostgreSQL JDBC URL |
| `DB_USERNAME`  | `clearhomeemi_user`                            | DB username          |
| `DB_PASSWORD`  | `changeme`                                     | DB password          |
| `SPRING_PROFILES_ACTIVE` | `prod`                               | Active profile       |
