package com.emicalculator.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── Validation errors (400) ────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value",
                        (a, b) -> a  // keep first message if duplicate fields
                ));

        return ResponseEntity.badRequest().body(ErrorResponse.builder()
                .status(400)
                .error("Validation failed")
                .message("One or more input fields are invalid")
                .fieldErrors(fieldErrors)
                .timestamp(Instant.now())
                .build());
    }

    // ── Business logic errors (422) ────────────────────────────────────────

    @ExceptionHandler(LoanCalculationException.class)
    public ResponseEntity<ErrorResponse> handleCalculation(LoanCalculationException ex) {
        log.warn("Calculation error: {}", ex.getMessage());
        return ResponseEntity.unprocessableEntity().body(ErrorResponse.builder()
                .status(422)
                .error("Calculation error")
                .message(ex.getMessage())
                .timestamp(Instant.now())
                .build());
    }

    // ── Catch-all (500) ────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Unexpected error during loan calculation", ex);
        return ResponseEntity.internalServerError().body(ErrorResponse.builder()
                .status(500)
                .error("Internal server error")
                .message("An unexpected error occurred. Please try again.")
                .timestamp(Instant.now())
                .build());
    }

    // ── Error response payload ─────────────────────────────────────────────

    @lombok.Builder @lombok.Data
    public static class ErrorResponse {
        private int status;
        private String error;
        private String message;
        private Map<String, String> fieldErrors;
        private Instant timestamp;
    }
}
