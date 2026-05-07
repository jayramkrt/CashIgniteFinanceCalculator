-- V2__tax_plan_schema.sql
-- Tax Planner: stores user-created tax planning scenarios

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE tax_plan (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(100) NOT NULL,
    financial_year   VARCHAR(10)  NOT NULL,

    -- JSON blobs for each declaration section
    earnings_json    JSONB        NOT NULL,
    exemptions_json  JSONB,
    deductions_json  JSONB,

    status           VARCHAR(10)  NOT NULL DEFAULT 'DRAFT',

    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tax_plan_fy      ON tax_plan(financial_year);
CREATE INDEX idx_tax_plan_created ON tax_plan(created_at DESC);

-- Reuse the update_updated_at trigger function created in V1
CREATE TRIGGER trg_tax_plan_updated
    BEFORE UPDATE ON tax_plan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
