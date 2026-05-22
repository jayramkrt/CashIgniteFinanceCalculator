package com.clearhomeemi.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(1)
public class RateLimitFilter implements Filter {

    @Value("${rate-limit.capacity:60}")
    private int capacity;

    @Value("${rate-limit.refill-per-minute:60}")
    private int refillPerMinute;

    @Value("${rate-limit.calculate.capacity:10}")
    private int calculateCapacity;

    @Value("${rate-limit.calculate.refill-per-minute:10}")
    private int calculateRefillPerMinute;

    private static final String CALCULATE_PATH = "/api/loan/calculate";

    private final Map<String, Bucket> defaultBuckets   = new ConcurrentHashMap<>();
    private final Map<String, Bucket> calculateBuckets = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest   = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String ip = resolveClientIp(httpRequest);
        boolean isCalculate = CALCULATE_PATH.equals(httpRequest.getRequestURI());

        Bucket bucket = isCalculate
                ? calculateBuckets.computeIfAbsent(ip, k -> newCalculateBucket())
                : defaultBuckets.computeIfAbsent(ip, k -> newDefaultBucket());

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            long waitSeconds = bucket.getAvailableTokens() == 0 ? 60 : 1;
            httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpResponse.setContentType(MediaType.APPLICATION_JSON_VALUE);
            httpResponse.setHeader("Retry-After", String.valueOf(waitSeconds));
            httpResponse.getWriter().write(
                isCalculate
                    ? "{\"error\":\"Too many calculation requests. Maximum 10 per minute. Please wait.\"}"
                    : "{\"error\":\"Too many requests. Please slow down.\"}"
            );
        }
    }

    private Bucket newDefaultBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(refillPerMinute, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket newCalculateBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(calculateCapacity)
                .refillGreedy(calculateRefillPerMinute, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private String resolveClientIp(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();
        if ("127.0.0.1".equals(remoteAddr) || "0:0:0:0:0:0:0:1".equals(remoteAddr)) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
        }
        return remoteAddr;
    }
}
