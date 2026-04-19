package com.clearhomeemi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Persisted loan scenario.
 * The JSONB columns store the raw request payloads — this keeps the schema
 * stable even as feature DTOs evolve, and avoids 6 join tables for optional
 * feature lists that most scenarios won't use.
 */
@Entity
@Table(name = "loan_scenario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoanScenario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    // ── Core loan fields ──────────────────────────────────────────────────────

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal loanAmount;

    @Column(nullable = false, precision = 6, scale = 4)
    private BigDecimal annualInterestRate;

    @Column(nullable = false)
    private Integer tenureMonths;

    @Column(nullable = false)
    private LocalDate firstEmiDate;

    // ── Feature JSON blobs ────────────────────────────────────────────────────

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String prepaymentsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String interestChangesJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String interestSaverJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String moratoriumJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String feesJson;

    // ── Cached result ─────────────────────────────────────────────────────────

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String resultSummaryJson;

    @Column(length = 200)
    private String scenarioName;

    // ── Lifecycle hooks ───────────────────────────────────────────────────────

    @PrePersist
    void prePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
