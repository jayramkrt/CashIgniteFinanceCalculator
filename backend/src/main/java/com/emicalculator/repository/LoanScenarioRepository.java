package com.emicalculator.repository;

import com.emicalculator.entity.LoanScenario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface LoanScenarioRepository extends JpaRepository<LoanScenario, Long> {

    /** Most recent scenarios first — used for history list. */
    Page<LoanScenario> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /** Named scenarios for the "compare" feature (Phase 2). */
    List<LoanScenario> findByScenarioNameContainingIgnoreCase(String name);

    /** Cleanup: delete scenarios older than a given date. */
    void deleteByCreatedAtBefore(Instant cutoff);
}
