package com.clearhomeemi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tax_plan")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TaxPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    /** e.g. "2025-26" */
    @Column(nullable = false, length = 10)
    private String financialYear;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private String earningsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column
    private String exemptionsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column
    private String deductionsJson;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String status = "DRAFT";

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

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
