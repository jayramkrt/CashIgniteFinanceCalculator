package com.clearhomeemi.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class AppConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    // ── CORS ──────────────────────────────────────────────────────────────

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }

    // ── Jackson (BigDecimal serialization, dates as ISO strings) ─────────
    // @Primary ensures this bean takes precedence over Spring Boot's auto-configured
    // ObjectMapper. WRITE_BIGDECIMAL_AS_PLAIN prevents scientific notation (5E+6)
    // so the React axios interceptor can safely parseFloat() all numeric strings.

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        // Serialize BigDecimal as plain string to avoid precision loss in JS
        mapper.enable(SerializationFeature.WRITE_BIGDECIMAL_AS_PLAIN);
        return mapper;
    }

    // ── OpenAPI / Swagger UI ──────────────────────────────────────────────

    @Bean
    public OpenAPI openApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("EMI Calculator API")
                        .version("1.0.0")
                        .description("Loan EMI calculation engine supporting prepayments, variable rates, moratorium, interest saver, and fees.")
                        .contact(new Contact().name("EMI Calculator Team")));
    }
}
