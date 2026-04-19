package com.clearhomeemi.exception;

public class LoanCalculationException extends RuntimeException {
    public LoanCalculationException(String message) {
        super(message);
    }
    public LoanCalculationException(String message, Throwable cause) {
        super(message, cause);
    }
}
