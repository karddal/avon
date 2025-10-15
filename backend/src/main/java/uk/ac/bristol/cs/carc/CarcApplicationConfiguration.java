package uk.ac.bristol.cs.carc;

import io.github.wimdeblauwe.errorhandlingspringbootstarter.ApiErrorResponse;
import io.github.wimdeblauwe.errorhandlingspringbootstarter.ApiErrorResponseCustomizer;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CarcApplicationConfiguration {

    @Bean
    public ApiErrorResponseCustomizer addTimestampErrorResponseCustomizer() {
        return new ApiErrorResponseCustomizer() {
            @Override
            public void customize(ApiErrorResponse response) {
                response.addErrorProperty(
                        "timestamp",
                        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssxxx")
                                .withZone(ZoneId.of("UTC"))
                                .format(Instant.now()));
            }
        };
    }
}
