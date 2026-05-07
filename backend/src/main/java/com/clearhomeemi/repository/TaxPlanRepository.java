package com.clearhomeemi.repository;

import com.clearhomeemi.entity.TaxPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaxPlanRepository extends JpaRepository<TaxPlan, UUID> {

    List<TaxPlan> findAllByOrderByCreatedAtDesc();

    List<TaxPlan> findByFinancialYearOrderByCreatedAtDesc(String financialYear);
}
