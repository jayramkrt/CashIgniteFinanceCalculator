-- V1__init_schema.sql
-- Initial schema for EMI Calculator
-- Stores saved loan scenarios for history/comparison feature (Phase 2)

CREATE TABLE loan_scenario (
    id            BIGSERIAL PRIMARY KEY,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Core loan fields
    loan_amount         NUMERIC(15, 2) NOT NULL,
    annual_interest_rate NUMERIC(6, 4) NOT NULL,
    tenure_months       INTEGER NOT NULL,
    first_emi_date      DATE NOT NULL,

    -- Serialised JSON blobs for each feature module
    -- Kept as JSONB for flexibility without requiring separate join tables
    prepayments_json       JSONB,
    interest_changes_json  JSONB,
    interest_saver_json    JSONB,
    moratorium_json        JSONB,
    fees_json              JSONB,

    -- Cached summary output (avoids recalculation on history fetch)
    result_summary_json    JSONB,

    -- Optional user label
    scenario_name   VARCHAR(200)
);

CREATE INDEX idx_loan_scenario_created ON loan_scenario(created_at DESC);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_loan_scenario_updated
    BEFORE UPDATE ON loan_scenario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
